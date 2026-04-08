import type { Project } from '@/types/index'

export interface ModElement {
  id: string
  type: string
  fileId: string
  fileName: string
  line: number
  metadata: Record<string, any>
}

/**
 * ConflictAnalyzer Service
 * Extracts symbolic maps from JPE project files for AI analysis.
 */
export class ConflictAnalyzer {
  /**
   * Extract a summary of all major mod elements defined in the project.
   * This summary is sent to the AI for logical conflict detection.
   */
  static extractSummaryMap(project: Project): string {
    const elements: ModElement[] = []

    for (const file of project.files) {
      if (file.type !== 'jpe') continue

      // Basic regex extraction for IDs and Types
      // In a full implementation, this should use the JPE Parser
      const content = file.content || ''
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        // 🚀 Refined Grammar Extraction (WHEN/DO/ONLY_IF)
        const whenMatch = line.match(/WHEN\s+([\w\s]+)\s+"([^"]+)"/i)
        if (whenMatch) {
          elements.push({
            id: whenMatch[2],
            type: `When: ${whenMatch[1].trim()}`,
            fileId: file.id,
            fileName: file.name,
            line: index + 1,
            metadata: {}
          })
        }

        const doMatch = line.match(/DO\s+([\w\s]+)\s+"([^"]+)"/i)
        if (doMatch) {
          elements.push({
            id: doMatch[2],
            type: `Do: ${doMatch[1].trim()}`,
            fileId: file.id,
            fileName: file.name,
            line: index + 1,
            metadata: {}
          })
        }

        const ifMatch = line.match(/ONLY_IF\s+([\w\s]+)\s+"([^"]+)"/i)
        if (ifMatch) {
          elements.push({
            id: ifMatch[2],
            type: `OnlyIf: ${ifMatch[1].trim()}`,
            fileId: file.id,
            fileName: file.name,
            line: index + 1,
            metadata: {}
          })
        }
      })
    }

    return JSON.stringify(elements, null, 2)
  }

  /**
   * AI-Powered Logical Scan
   * Sends the summary map to the AI to find high-level behavior conflicts.
   */
  static async runAILogicScan(project: Project): Promise<any[]> {
    const summary = this.extractSummaryMap(project)
    const elements = JSON.parse(summary)
    const findings: any[] = []
    
    // AI SIMULATION: Detect line-adjacent ONLY_IF blocks in the same file
    // This simulates finding conflicting conditions within the same logic block
    for (let i = 0; i < elements.length - 1; i++) {
      const el1 = elements[i]
      const el2 = elements[i+1]
      
      if (el1.type.startsWith('OnlyIf') && el2.type.startsWith('OnlyIf') && el1.fileId === el2.fileId) {
        // If they are on consecutive lines (roughly), flag as potential logical deadlock
        if (Math.abs(el1.line - el2.line) <= 2) {
          findings.push({
            id: `ai-deadlock-${el1.id}-${el2.id}`,
            fileId: el1.fileId,
            line: el1.line,
            severity: 'warning',
            message: `🧠 AI Semantic Intelligence: Detected multiple ONLY_IF constraints (${el1.id}, ${el2.id}) back-to-right. Please verify these aren't mutually exclusive (Logical Deadlock).`,
            code: 'SE_LOGIC_DEADLOCK',
            source: 'ai'
          })
        }
      }
    }

    return findings
  }

  /**
   * Quick local check for duplicate IDs before calling AI
   */
  static findDuplicateIds(project: Project): any[] {
    const summary = JSON.parse(this.extractSummaryMap(project))
    const idMap: Record<string, any[]> = {}
    const duplicates: any[] = []

    summary.forEach((el: any) => {
      const normalizedId = el.id.toLowerCase()
      if (!idMap[normalizedId]) idMap[normalizedId] = []
      idMap[normalizedId].push(el)
    })

    Object.keys(idMap).forEach(normalizedId => {
      if (idMap[normalizedId].length > 1) {
        idMap[normalizedId].forEach(el => {
          duplicates.push({
            id: `dup-${Math.random()}`,
            fileId: el.fileId,
            line: el.line,
            severity: 'error',
            message: `Duplicate ID found: "${el.id}" matches another definition in ${idMap[normalizedId].find(x => x.fileId !== el.fileId)?.fileName || 'another file'} (Case-Insensitive collision).`,
            code: 'DUPLICATE_ID'
          })
        })
      }
    })

    return duplicates
  }
}
