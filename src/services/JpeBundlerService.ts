import { TransformationService } from './TransformationService';
import { PackageService, PackageOutputResource } from './PackageService';
import { Project} from '@/types/index';
import { DBPF_RESOURCE_TYPES } from '@/engine/parsers/types/package';
import { fnv64, fnv32 } from '@/utils/hash';
import { sensory } from './SensoryService';
import { FileService } from './FileService';

export type BuildStage = 'STARTING' | 'TRANSPILLING_JPE' | 'PACKING_STBL' | 'FINALIZING_DBPF' | 'SUCCESS' | 'ERROR';

export interface BuildProgress {
  stage: BuildStage;
  progress: number; // 0-100
  message: string;
}

export interface BuildLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface BuildResult {
  success: boolean;
  packageBuffer?: ArrayBuffer;
  logs: BuildLog[];
  duration: number;
}

export class JpeBundlerService {
  /**
   * Orchestrates the building of a Sims 4 .package from project JPE assets.
   */
  static async buildProject(
    project: Project, 
    onProgress?: (progress: BuildProgress) => void
  ): Promise<BuildResult> {
    const startTime = Date.now();
    const logs: BuildLog[] = [];
    const resources: PackageOutputResource[] = [];

    const addLog = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
      logs.push({ timestamp: Date.now(), level, message });
      console.log(`[JpeBundler] ${message}`);
    };

    addLog(`Starting industrial build for project: ${project.name}`);

    try {
      // 1. Filter JPE and relevant tuning files
      const jpeFiles = project.files.filter(f => f.type === 'jpe');
      const stblFiles = project.files.filter(f => f.type === 'stbl');

      if (jpeFiles.length === 0 && stblFiles.length === 0) {
        throw new Error("No JPE or STBL files found in project to bundle.");
      }

      addLog(`Found ${jpeFiles.length} JPE source files and ${stblFiles.length} STBL files.`);

      if (onProgress) {
        onProgress({ stage: 'STARTING', progress: 5, message: 'Initializing project build...' });
      }

      // 2. Transpile JPE to XML and Package
      for (const file of jpeFiles) {
        addLog(`Transpiling: ${file.name}...`);
        
        // Ensure content is loaded
        const content = file.content;
        if (!content) {
          addLog(`Skipping ${file.name}: No content loaded.`, 'warn');
          continue;
        }

        const result = await TransformationService.transformJPEToXML(content, file.name);
        
        if (!result.success) {
          addLog(`Failed to transpile ${file.name}: ${result.errors[0]?.message}`, 'error');
          continue;
        }

        // Determine Resource Type by looking at root XML tag or filename hints
        // For Stage 1, we use filename-based inference or default to TuningInstance
        const type = this.inferResourceType(file.name, result.xml);
        const name = file.name.replace('.jpe', '');
        const instance = fnv64(name);

        addLog(`Mapped ${file.name} to Type: 0x${type.toString(16).toUpperCase()}, Instance: 0x${instance.toString(16).toUpperCase()}`);

        resources.push({
          type,
          group: 0x00000000,
          instance,
          content: new TextEncoder().encode(result.xml),
          compressed: true
        });

        if (onProgress) {
          const stepProgress = 10 + (jpeFiles.indexOf(file) + 1) / jpeFiles.length * 40;
          onProgress({ stage: 'TRANSPILLING_JPE', progress: stepProgress, message: `Transpiled ${file.name}` });
        }
      }

      // 3. Process STBL files
      addLog(`Packing ${stblFiles.length} string tables...`);

      for (const file of stblFiles) {
        addLog(`Processing STBL: ${file.name}...`);
        
        let buffer: Buffer | null = null;
        if (file.content) {
          buffer = Buffer.from(file.content, 'base64');
        } else {
          try {
            const ab = await FileService.readFileBuffer(file.path);
            if (ab) buffer = Buffer.from(ab);
          } catch (e) {
            addLog(`Failed to read STBL file ${file.name}: ${e}`, 'error');
            continue;
          }
        }

        if (!buffer) {
          addLog(`Skipping ${file.name}: Buffer is null.`, 'warn');
          continue;
        }

        // Determine Locale and Instance ID
        // Format: 0x[LocaleByte][HashLo]
        const localeCode = this.extractLocaleCode(file.name);
        const localeByte = this.getLocaleByte(localeCode);
        
        // Use Project ID if available to prevent name-based collisions
        const seed = project.id || project.name;
        const modNameHash = fnv64(seed);
        const hashLo = modNameHash & 0x00FFFFFFFFFFFFFFn; // Mask out the top byte
        const instance = (BigInt(localeByte) << 56n) | hashLo;

        addLog(`Mapped ${file.name} [${localeCode}] to Instance: 0x${instance.toString(16).toUpperCase()}`);

        resources.push({
          type: 0x220557DA,
          group: 0x80000000,
          instance,
          content: new Uint8Array(buffer),
          compressed: true
        });

        if (onProgress) {
          const stepProgress = 50 + (stblFiles.indexOf(file) + 1) / stblFiles.length * 30;
          onProgress({ stage: 'PACKING_STBL', progress: stepProgress, message: `Packed STBL: ${file.name}` });
        }
      }

      // 4. Generate metadata sidecar (mod-metadata.json)
      const metadata = {
        id: `kh.jpe.${fnv32(project.name).toString(16)}`,
        name: project.name,
        version: "1.0.0",
        author: "JPE User",
        locales: stblFiles.map(f => this.extractLocaleCode(f.name)),
        buildDate: new Date().toISOString()
      };
      
      addLog(`Generated mod-metadata.json for Vault publishing.`);

      if (resources.length === 0) {
        throw new Error("No resources were successfully generated for the package.");
      }

      // 5. Create the final DBPF Package
      addLog(`Finishing bundle: Packing ${resources.length} resources into DBPF v2.1...`);
      const packageBuffer = await PackageService.createPackage(resources);

      addLog(`Build successful in ${Date.now() - startTime}ms.`, 'info');
      sensory.triggerSuccess();

      if (onProgress) {
        onProgress({ stage: 'SUCCESS', progress: 100, message: 'Build complete!' });
      }

      return {
        success: true,
        packageBuffer,
        logs,
        duration: Date.now() - startTime
      };

    } catch (err: any) {
      addLog(`Critical Build Error: ${err.message}`, 'error');
      sensory.triggerAlert('error');
      return {
        success: false,
        logs,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Simple inference logic for Sims 4 Resource Types
   */
  private static inferResourceType(fileName: string, xmlContent: string): number {
    const lowercaseName = fileName.toLowerCase();
    
    if (lowercaseName.includes('buff') || xmlContent.includes('<I c="Buff"')) {
      return DBPF_RESOURCE_TYPES.Buff;
    }
    if (lowercaseName.includes('trait') || xmlContent.includes('<I c="Trait"')) {
      return DBPF_RESOURCE_TYPES.Trait;
    }
    // Default to generic TuningInstance (0x0C900659)
    return DBPF_RESOURCE_TYPES.TuningInstance;
  }

  private static extractLocaleCode(fileName: string): string {
    const match = fileName.match(/strings_([a-z]{2}-[A-Z]{2})/i);
    return match ? match[1] : 'en-US';
  }

  private static getLocaleByte(code: string): number {
    const LOCALES: Record<string, number> = {
      'en-US': 0x00, 'en-GB': 0x01, 'fr-FR': 0x02, 'it-IT': 0x03, 'de-DE': 0x04,
      'es-ES': 0x05, 'es-MX': 0x06, 'pt-BR': 0x07, 'pl-PL': 0x08, 'ru-RU': 0x09,
      'nl-NL': 0x0A, 'sv-SE': 0x0B, 'da-DK': 0x0C, 'no-NO': 0x0D, 'fi-FI': 0x0E,
      'zh-TW': 0x0F, 'zh-CN': 0x10, 'ja-JP': 0x11, 'ko-KR': 0x12, 'cs-CZ': 0x13
    };
    return LOCALES[code] ?? 0x00;
  }
}
