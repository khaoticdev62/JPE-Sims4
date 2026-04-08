import { TransformationService } from './TransformationService';
import { PackageService, PackageOutputResource } from './PackageService';
import { Project} from '@/types/index';
import { DBPF_RESOURCE_TYPES } from '@/engine/parsers/types/package';
import { fnv64 } from '@/utils/hash';
import { sensory } from './SensoryService';

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
  static async buildProject(project: Project): Promise<BuildResult> {
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
      }

      // 3. Process STBL files (Simplified for Stage 1: assume content is already proper binary or JSON-mapped)
      // Note: Real STBL packing requires a dedicated binary encoder. 
      // For now, we focus on Tuning logic.

      if (resources.length === 0) {
        throw new Error("No resources were successfully generated for the package.");
      }

      // 4. Create the final DBPF Package
      addLog(`Finishing bundle: Packing ${resources.length} resources into DBPF v2.1...`);
      const packageBuffer = await PackageService.createPackage(resources);

      addLog(`Build successful in ${Date.now() - startTime}ms.`, 'info');
      sensory.triggerSuccess();

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
}
