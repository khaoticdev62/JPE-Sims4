import type { Project} from '@/types/index'

export interface ModStatus {
  modName: string
  status: 'Compatible' | 'Broken' | 'Updated' | 'Obsolete' | 'Unknown'
  version: string
  lastUpdated: string
  url?: string
}

/**
 * CommunityMonitor Service
 * Integrates Scarlet's Realm "The Mod List" for health checks.
 */
export class CommunityMonitor {
  private static cachedStatuses: Map<string, ModStatus> = new Map()

  /**
   * Parse Scarlet's Realm CSV/TSV mod list.
   * Format: Mod Name, Status, Version, Date, Link
   */
  static async importModList(fileContent: string): Promise<number> {
    const lines = fileContent.split('\n')
    let count = 0
    
    // Skip header and parse lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Handle CSV or TSV
      const parts = line.includes('\t') ? line.split('\t') : line.split(',')
      if (parts.length >= 2) {
        const name = parts[0].replace(/"/g, '').trim()
        const status = parts[1].replace(/"/g, '').trim().toLowerCase()
        
        const modStatus: ModStatus = {
          modName: name,
          status: this.mapStatus(status),
          version: parts[2] || 'Unknown',
          lastUpdated: parts[3] || 'Unknown',
          url: parts[4] || undefined
        }

        this.cachedStatuses.set(name.toLowerCase(), modStatus)
        count++
      }
    }
    return count
  }

  private static mapStatus(status: string): ModStatus['status'] {
    if (status.includes('compatible')) return 'Compatible'
    if (status.includes('broken')) return 'Broken'
    if (status.includes('updated')) return 'Updated'
    if (status.includes('obsolete')) return 'Obsolete'
    return 'Unknown'
  }

  /**
   * Scan project files for matches against known statuses.
   */
  static scanProject(project: Project): any[] {
    const diagnostics: any[] = []
    
    for (const file of project.files) {
      // Logic: If mod name (or package ID) matches a cached status, flag it
      const fileNameLower = file.name.toLowerCase().replace(/\. package|\.jpe/g, '')
      const status = this.cachedStatuses.get(fileNameLower)

      if (status && status.status === 'Broken') {
        diagnostics.push({
          id: `community-${Math.random()}`,
          fileId: file.id,
          line: 1,
          severity: 'error',
          message: `COMMUNITY ALERT: This mod (${status.modName}) is marked as BROKEN on Scarlet's Realm Mod List.`,
          code: 'COMMUNITY_BROKEN',
          documentationLink: status.url
        })
      } else if (status && status.status === 'Updated') {
         diagnostics.push({
          id: `community-${Math.random()}`,
          fileId: file.id,
          line: 1,
          severity: 'warning',
          message: `COMMUNITY UPDATE: A newer version of ${status.modName} is available (${status.version}).`,
          code: 'COMMUNITY_UPDATE',
          documentationLink: status.url
        })
      }
    }

    return diagnostics
  }

  static getCacheCount(): number {
    return this.cachedStatuses.size
  }

  static clearCache(): void {
    this.cachedStatuses.clear()
  }
}
