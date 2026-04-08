import { FileService } from './FileService';
import { useProjectStore } from '@/stores/useProjectStore';

export interface ModCompatibilityStatus {
  id: string;
  name: string;
  creator: string;
  status: 'Broken' | 'Updated' | 'Fine' | 'Unknown' | 'N/A';
  version: string;
  link?: string;
  notes?: string;
}

export interface ModActionItem {
  modId: string;
  modName: string;
  severity: 'broken' | 'outdated' | 'update-available' | 'info';
  action: string;
  description: string;
  link?: string;
}

export interface CompatibilityReport {
  mods: ModCompatibilityStatus[];
  actions: ModActionItem[];
  summary: {
    total: number;
    broken: number;
    outdated: number;
    fine: number;
    unknown: number;
  };
}

export class ModCompatibilityService {
  private static SCARLET_DATABASE_URL = 'https://scarletsrealm.com/the-mod-list/';

  /**
   * Detect the local Sims 4 game version from GameVersion.txt
   */
  static async getGameVersion(): Promise<string> {
    const defaultVersion = '1.103.315.1020';
    try {
      // Try to find GameVersion.txt in common locations relative to the workspace
      // For this demo, we check the parent directory or a sibling Sims 4 folder
      const possiblePaths = [
        '../GameVersion.txt',
        '../../GameVersion.txt',
        './GameVersion.txt'
      ];

      for (const path of possiblePaths) {
        if (await FileService.fileExists(path)) {
          const result = await FileService.readFile(path);
          if (result.success && result.content) {
            return result.content.trim();
          }
        }
      }
      return defaultVersion;
    } catch (error) {
      console.warn('[ModCompatibilityService] Failed to detect game version, using default.', error);
      return defaultVersion;
    }
  }

  /**
   * Fetch and parse mod status data from Scarlet's Realm
   * Live connection via server-side proxy.
   */
  static async fetchScarletModList(): Promise<ModCompatibilityStatus[]> {
    try {
      const response = await fetch('/api/scarlet');
      const data = await response.json();
      if (data.success && data.mods) {
        return data.mods;
      }
      throw new Error(data.error || 'Failed to fetch live Scarlet data');
    } catch (error) {
      console.warn('[ModCompatibilityService] Failed to fetch live data, using fallback.', error);
      // Fallback to minimal known popular mods if live fetch fails
      return [
        { id: 'mccc', name: 'MC Command Center', creator: 'Deaderpool', status: 'Fine', version: 'Latest' },
        { id: 'ui-cheats', name: 'UI Cheats Extension', creator: 'weerbesu', status: 'Updated', version: 'v1.40' }
      ];
    }
  }

  /**
   * Parse Better Exceptions reports to identify failing tunings or scripts
   */
  static async parseBEReports(folderPath: string): Promise<string[]> {
    try {
      const result = await FileService.listDirectory(folderPath);
      if (!result.success || !result.files) return [];

      const failingMods: string[] = [];
      const beFiles = result.files.filter(f => f.name.toLowerCase().includes('betterexceptions') && (f.name.endsWith('.html') || f.name.endsWith('.txt')));

      for (const file of beFiles) {
        const fileResult = await FileService.readFile(`${folderPath}/${file.name}`);
        if (fileResult.success && fileResult.content) {
          // Regex for common fail signatures in BE reports
          const modPattern = /Possible Cause: ([^<\n]+)/gi;
          let match;
          while ((match = modPattern.exec(fileResult.content)) !== null) {
            failingMods.push(match[1].trim());
          }
        }
      }
      return [...new Set(failingMods)];
    } catch (error) {
      console.error('[ModCompatibilityService] Failed to parse BE reports.', error);
      return [];
    }
  }

  /**
   * Cross-reference installed mods against the community database
   * Returns a prioritized compatibility report with actionable items
   */
  static async getCompatibilityReport(): Promise<CompatibilityReport> {
    const communityData = await this.fetchScarletModList();
    const gameVersion = await this.getGameVersion();

    // Get installed mods from the current project
    const { currentProject } = useProjectStore.getState();
    const installedModNames = new Set<string>();

    if (currentProject) {
      currentProject.files.forEach(f => {
        // Extract mod name from file paths
        const nameMatch = f.name.replace(/\.(xml|jpe|py|package|stbl)$/i, '');
        installedModNames.add(nameMatch.toLowerCase());
      });
    }

    // Cross-reference and enrich with status
    const enrichedMods = communityData.map(item => {
      const isInstalled = installedModNames.has(item.name.toLowerCase()) ||
                          installedModNames.has(item.id.toLowerCase());

      return {
        ...item,
        isInstalled,
        // Determine severity priority
        severityRank: item.status === 'Broken' ? 0
          : item.status === 'Unknown' ? 1
          : item.status === 'N/A' ? 2
          : item.status === 'Updated' ? 3
          : 4, // Fine = 4
      };
    });

    // Filter to only installed mods + known broken ones that might affect them
    const relevantMods = enrichedMods.filter(m => m.isInstalled || m.status === 'Broken');

    // Sort by severity (broken first, then outdated, then fine)
    relevantMods.sort((a, b) => a.severityRank - b.severityRank);

    // Generate actionable "Action Required" list
    const actions: ModActionItem[] = [];

    for (const mod of relevantMods) {
      switch (mod.status) {
        case 'Broken':
          actions.push({
            modId: mod.id,
            modName: mod.name,
            severity: 'broken',
            action: 'Disable or Remove',
            description: `${mod.name} by ${mod.creator} is broken with the current game version (${gameVersion}). This may cause crashes or gameplay issues.`,
            link: mod.link,
          });
          break;
        case 'Updated':
          actions.push({
            modId: mod.id,
            modName: mod.name,
            severity: 'update-available',
            action: 'Update Available',
            description: `A newer version of ${mod.name} is available. Current: ${mod.version}.`,
            link: mod.link,
          });
          break;
        case 'Unknown':
          actions.push({
            modId: mod.id,
            modName: mod.name,
            severity: 'outdated',
            action: 'Verify Compatibility',
            description: `${mod.name} by ${mod.creator} has not been verified for game version ${gameVersion}. Test carefully before use.`,
            link: mod.link,
          });
          break;
        case 'Fine':
          // No action needed for fine mods, but log for completeness
          break;
        default:
          actions.push({
            modId: mod.id,
            modName: mod.name,
            severity: 'info',
            action: 'Monitor',
            description: `${mod.name} status is "${mod.status}". Check back later for updates.`,
            link: mod.link,
          });
      }
    }

    // Sort actions by severity: broken > outdated > update-available > info
    const severityOrder = { broken: 0, outdated: 1, 'update-available': 2, info: 3 };
    actions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Build summary
    const summary = {
      total: relevantMods.length,
      broken: relevantMods.filter(m => m.status === 'Broken').length,
      outdated: relevantMods.filter(m => m.status === 'Unknown' || m.status === 'N/A').length,
      fine: relevantMods.filter(m => m.status === 'Fine').length,
      unknown: relevantMods.filter(m => m.status === 'Unknown').length,
    };

    return {
      mods: relevantMods.map(({ ...rest }) => rest),
      actions,
      summary,
    };
  }
}
