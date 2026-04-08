import type { Project, Diagnostic } from '@/types/index'
import { ConflictAnalyzer } from './ConflictAnalyzer'

/**
 * BetterExceptionsJPE - Specialized Community Conflict Detection
 * Story 6.3: AI-Powered Logic Conflict Detection
 */
export class BetterExceptionsJPE {
  /**
   * Mocked Scarlet's Realm / Community Manifest
   * In a real implementation, this would be fetched from a remote JSON.
   */
  private static COMMUNITY_MANIFEST = {
    knownConflicts: [
      { id: 'tmex-uicheats', name: 'UI Cheats Extension', pattern: /ui_cheats/i, guidance: 'Ensure you are using the latest version compatible with game patch 1.105.' },
      { id: 'deaderpool-mccc', name: 'MC Command Center', pattern: /mc_cmd_center/i, guidance: 'Check for script conflicts if you have other autonomy-modifying JPEs.' },
      { id: 'wicked-whims', name: 'WickedWhims', pattern: /wickedwhims/i, guidance: 'Known to override several social mixer interactions.' }
    ],
    brokenTags: [
      { tag: 'interaction_mixer', reason: 'Deprecated in the latest patch for certain object categories.' },
      { tag: 'buff_vfx', reason: 'VFX names changed in the infants update.' }
    ]
  }

  /**
   * Performs a local "Manifest Lookup" against known community issues
   */
  static runManifestLookup(project: Project, existingSummary?: any[]): Diagnostic[] {
    const diagnostics: Diagnostic[] = []
    const summary = existingSummary || JSON.parse(ConflictAnalyzer.extractSummaryMap(project))

    // 1. Check for known mod conflicts based on naming patterns
    project.files.forEach(file => {
      this.COMMUNITY_MANIFEST.knownConflicts.forEach(conflict => {
        if (conflict.pattern.test(file.name) || conflict.pattern.test(file.content || "")) {
          diagnostics.push({
            id: `community-${conflict.id}`,
            fileId: file.id,
            line: 1,
            column: 1,
            severity: 'warning',
            message: `ΓÜá Community Alert: Potential conflict with ${conflict.name}.`,
            code: 'COMMUNITY_CONFLICT',
            source: 'community',
            suggestion: conflict.guidance
          })
        }
      })
    })

    // 2. Check for broken or deprecated JPE tags
    summary.forEach((el: any) => {
      const broken = this.COMMUNITY_MANIFEST.brokenTags.find(bt => el.type.toLowerCase().includes(bt.tag))
      if (broken) {
        diagnostics.push({
          id: `broken-${Math.random()}`,
          fileId: el.fileId,
          line: el.line,
          column: 1,
          severity: 'error',
          message: `🚨 Legacy Issue: Type "${el.type}" detected. ${broken.reason}`,
          code: 'DEPRECATED_LOGIC',
          source: 'community',
          suggestion: 'Consult the Scarlet\'s Realm Mod List for the modern equivalent.'
        })
      }
    })

    return diagnostics
  }

  /**
   * Translates a Python lastException log into a JPE root cause analysis
   * Story 6.3: Accept lastException.txt and generate analysis
   */
  static parseExceptionLog(log: string): { 
    type: string, 
    module: string, 
    rawTrace: string,
    likelyCause: string 
  } | null {
    // Basic validation for Python Traceback
    if (!log.includes('Traceback (most recent call last):') && !log.includes('Exception:')) {
      return null
    }

    // Extract the final exception line (usually starts with Exception)
    const lines = log.split('\n')
    const exceptionLine = lines.reverse().find(l => l.includes(': ')) || "Unknown Exception"
    const moduleMatch = log.match(/File "([^"]+)", line (\d+)/)

    return {
      type: exceptionLine.split(':')[0] || 'Unknown',
      module: moduleMatch ? moduleMatch[1].split(/[\\/]/).pop() || 'Unknown' : 'Core',
      rawTrace: log.slice(0, 500) + '...', // Keep it small for UI
      likelyCause: "AI analysis required for full JPE translation."
    }
  }

  /**
   * Semantic Logic Check (Local/Heuristic)
   */
  static runHeuristicLogicCheck(project: Project, existingSummary?: any[]): Diagnostic[] {
    const diagnostics: Diagnostic[] = []
    const summary = existingSummary || JSON.parse(ConflictAnalyzer.extractSummaryMap(project))

    // Example: Detect "Orphaned" Actions (Actions with no corresponding Trigger in the same project)
    const triggers = summary.filter((el: any) => el.type.startsWith('When'))
    const actions = summary.filter((el: any) => el.type.startsWith('Do'))

    actions.forEach((action: any) => {
      const hasTrigger = triggers.some((t: any) => t.id === action.id)
      if (!hasTrigger) {
        diagnostics.push({
          id: `orphan-${action.id}`,
          fileId: action.fileId,
          line: action.line,
          column: 1,
          severity: 'info',
          message: `💡 Semantic Note: Action "${action.id}" has no local trigger.`,
          code: 'ORPHANED_ACTION',
          source: 'ai',
          suggestion: 'If this is intended for another mod, ignore this. Otherwise, define a WHEN trigger.'
        })
      }
    })

    return diagnostics
  }
}
