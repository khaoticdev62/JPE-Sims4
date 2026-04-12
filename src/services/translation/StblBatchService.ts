import { STBLService } from './stbl';
import { Project, ModFile } from '../../types/index';
import { FileService } from '../FileService';

export interface StblBatchResult {
  modifiedFiles: string[];
  totalChanges: number;
}

/**
 * Service for performing batch operations across multiple STBL files in a project.
 * Designed for binary-to-binary workflows to ensure S4S compatibility.
 */
export class StblBatchService {
  /**
   * Performs a global search and replace across all STBL files in the project.
   */
  static async globalSearchAndReplace(
    project: Project,
    search: string,
    replace: string,
    caseSensitive: boolean = false
  ): Promise<StblBatchResult> {
    const modifiedFiles: string[] = [];
    let totalChanges = 0;

    const stblFiles = project.files.filter(f => f.type === 'stbl');

    for (const file of stblFiles) {
      const buffer = await this.getFileBuffer(file);
      if (!buffer) continue;

      try {
        const entries = STBLService.parse(buffer);
        let fileChanged = false;

        const updatedEntries = entries.map(entry => {
          const original = entry.text;
          let updated = original;

          if (caseSensitive) {
            updated = original.split(search).join(replace);
          } else {
            const regex = new RegExp(this.escapeRegExp(search), 'gi');
            updated = original.replace(regex, replace);
          }

          if (updated !== original) {
            fileChanged = true;
            totalChanges++;
          }

          return { ...entry, text: updated };
        });

        if (fileChanged) {
          const updatedBuffer = STBLService.generateFromEntries(updatedEntries);
          await FileService.writeFileBuffer(file.path, updatedBuffer.buffer as ArrayBuffer);
          modifiedFiles.push(file.id);
        }
      } catch (err) {
        console.error(`[StblBatch] Failed to process ${file.name}:`, err);
      }
    }

    return { modifiedFiles, totalChanges };
  }

  /**
   * Syncs strings from source locale to target locales.
   * If a key exists in source but not target, it is added to target.
   */
  static async syncLocales(
    project: Project,
    sourceFileId: string,
    targetFileIds: string[]
  ): Promise<StblBatchResult> {
    const sourceFile = project.files.find(f => f.id === sourceFileId);
    if (!sourceFile) throw new Error("Source file not found");

    const sourceBuffer = await this.getFileBuffer(sourceFile);
    if (!sourceBuffer) throw new Error("Failed to read source buffer");

    const sourceEntries = STBLService.parse(sourceBuffer);
    const sourceMap = new Map(sourceEntries.map(e => [e.key, e.text]));

    const modifiedFiles: string[] = [];
    let totalChanges = 0;

    for (const targetId of targetFileIds) {
      const targetFile = project.files.find(f => f.id === targetId);
      if (!targetFile) continue;

      const targetBuffer = await this.getFileBuffer(targetFile);
      if (!targetBuffer) continue;

      try {
        const targetEntries = STBLService.parse(targetBuffer);
        const targetKeys = new Set(targetEntries.map(e => e.key));
        let fileChanged = false;

        // Add missing entries from source
        const sourceEntriesArray = Array.from(sourceMap.entries());
        for (const [key, text] of sourceEntriesArray) {
          if (!targetKeys.has(key)) {
            targetEntries.push({ key, text });
            fileChanged = true;
            totalChanges++;
          }
        }

        if (fileChanged) {
          const updatedBuffer = STBLService.generateFromEntries(targetEntries);
          await FileService.writeFileBuffer(targetFile.path, updatedBuffer.buffer as ArrayBuffer);
          modifiedFiles.push(targetId);
        }
      } catch (err) {
        console.error(`[StblBatch] Sync failed for ${targetFile.name}:`, err);
      }
    }

    return { modifiedFiles, totalChanges };
  }

  /**
   * Find duplicate source strings across all project STBLs.
   */
  static async findDuplicates(project: Project): Promise<Map<string, string[]>> {
    const textToKeys = new Map<string, string[]>();
    const stblFiles = project.files.filter(f => f.type === 'stbl');

    for (const file of stblFiles) {
      const buffer = await this.getFileBuffer(file);
      if (!buffer) continue;

      try {
        const entries = STBLService.parse(buffer);
        entries.forEach(e => {
          if (!textToKeys.has(e.text)) textToKeys.set(e.text, []);
          const keyHex = `0x${e.key.toString(16).toUpperCase().padStart(8, '0')}`;
          const currentKeys = textToKeys.get(e.text);
          if (currentKeys && !currentKeys.includes(`${file.name}: ${keyHex}`)) {
            currentKeys.push(`${file.name}: ${keyHex}`);
          }
        });
      } catch (err) {
        console.error(`[StblBatch] Duplicate check failed for ${file.name}:`, err);
      }
    }

    // Filter to only text that appears at least twice
    const allEntries = Array.from(textToKeys.entries());
    const duplicates = allEntries.filter(([, keys]) => keys.length > 1);
    return new Map(duplicates);
  }

  /**
   * Helper to retrieve a Buffer from a ModFile, handling both in-memory and on-disk files.
   */
  private static async getFileBuffer(file: ModFile): Promise<Buffer | null> {
    if (file.content) {
      // If it's a binary file, content might be base64
      return Buffer.from(file.content, 'base64');
    }
    
    const buffer = await FileService.readFileBuffer(file.path);
    return buffer ? Buffer.from(buffer) : null;
  }

  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
