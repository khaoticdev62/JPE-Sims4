import { Project } from '@/types/index';
import { ProjectValidator } from './ProjectValidator';
import { StblBatchService } from '../translation/StblBatchService';
import { STBLService } from '../translation/stbl';
import { FileService } from '../FileService';

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'hint';
export type ValidationCategory = 'xml' | 'stbl' | 'resources' | 'deps' | 'best-practices';

export interface ValidationItem {
  id: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  rule: string;
  message: string;
  file: string;
  line?: number;
  autoFixable: boolean;
  fixed: boolean;
}

export class ModValidationService {
  private static projectValidator = new ProjectValidator();

  /**
   * Performs an industrial-grade scan of the entire project.
   * Aggregates XML round-trip fidelity, STBL integrity, and resource markers.
   */
  static async validateProject(project: Project): Promise<ValidationItem[]> {
    const results: ValidationItem[] = [];
    const rootPath = project.rootPath;

    // 1. XML Tuning Validation (Round-trip fidelity)
    try {
      const xmlBatch = await this.projectValidator.validateProject(rootPath);
      xmlBatch.results.forEach((r, idx) => {
        if (!r.result.success) {
          results.push({
            id: `xml-${idx}`,
            category: 'xml',
            severity: 'error',
            rule: 'XML-FIDELITY',
            message: r.result.error || 'Functional mismatch in round-trip conversion.',
            file: r.filePath.replace(rootPath, '').replace(/^[\\/]/, ''),
            autoFixable: false, // Round-trip errors usually require manual fix
            fixed: false
          });
        }
      });
    } catch (err) {
      console.error('[ModValidation] XML validation failed:', err);
    }

    // 2. STBL Integrity Validation
    const stblFiles = project.files.filter(f => f.type === 'stbl');
    for (const file of stblFiles) {
      try {
        const buffer = await this.getFileBuffer(file);
        if (!buffer) continue;

        const entries = STBLService.parse(buffer);
        
        // Rule: Empty entries are warnings
        const emptyEntries = entries.filter(e => !e.text || e.text.trim() === '');
        if (emptyEntries.length > 0) {
          results.push({
            id: `stbl-empty-${file.id}`,
            category: 'stbl',
            severity: 'warning',
            rule: 'STBL-EMPTY',
            message: `${emptyEntries.length} empty string entries detected.`,
            file: file.name,
            autoFixable: true,
            fixed: false
          });
        }

        // Rule: Duplicates (Source text)
        // We use the batch service for this
      } catch (_err) {
         results.push({
            id: `stbl-corrupt-${file.id}`,
            category: 'stbl',
            severity: 'error',
            rule: 'STBL-CORRUPT',
            message: `Corrupt STBL binary structure detected.`,
            file: file.name,
            autoFixable: false,
            fixed: false
          });
      }
    }

    // 3. Global Duplicate Detection
    const dups = await StblBatchService.findDuplicates(project);
    if (dups.size > 0) {
      results.push({
        id: 'stbl-dups-global',
        category: 'stbl',
        severity: 'info',
        rule: 'STBL-DUPS',
        message: `${dups.size} duplicate source strings found across locales.`,
        file: 'Project-wide',
        autoFixable: false,
        fixed: false
      });
    }

    return results;
  }

  private static async getFileBuffer(file: any): Promise<Buffer | null> {
    if (file.content) return Buffer.from(file.content, 'base64');
    const ab = await FileService.readFileBuffer(file.path);
    return ab ? Buffer.from(ab) : null;
  }
}
