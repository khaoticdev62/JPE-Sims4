import type { ValidationRule } from '../ValidationRule'
import type { Diagnostic } from '@/types/index'
import { useSymbolStore } from '@/stores/useSymbolStore'

/**
 * ReferenceRule - Validates semantic links across the project
 * Checks for missing STBL IDs and Interaction names in JPE scripts
 */
export const ReferenceRule: ValidationRule = {
  id: 'jpe-reference',
  name: 'Semantic Reference Check',
  severity: 'warning', // Missing references are warnings
  check: (content: string) => {
    const diagnostics: Diagnostic[] = []
    const state = useSymbolStore.getState()
    
    // 1. Interaction References (do: "interaction_name")
    const interactionRegex = /do:\s*"([^"]+)"/g
    let match
    
    while ((match = interactionRegex.exec(content)) !== null) {
      if (match[1]) {
        const interactionName = match[1]
        // Check if interaction exists in ANY file's symbol set
        if (!state.hasInteraction(interactionName)) {
          const lines = content.substring(0, match.index).split('\n')
          const line = lines.length - 1
          const column = lines[lines.length - 1].length
          
          diagnostics.push({
            id: `jpe-ref-int-${line}-${column}`,
            fileId: '',
            line,
            column,
            severity: 'warning',
            message: `Interaction reference "${interactionName}" not found in current project scope.`,
            code: 'JPEREF001',
            suggestion: `Verify that an XML interaction exists with attribute n="${interactionName}".`,
          })
        }
      }
    }

    // 2. STBL References (text: "0xXXXXXXXX")
    const stblRegex = /(?:text|name|notification_text):\s*"(0x[0-9A-Fa-f]{8})"/g
    while ((match = stblRegex.exec(content)) !== null) {
      if (match[1]) {
        const hexHash = match[1]
        
        // Check if hash exists in ANY file's symbol set
        if (!state.hasStblKey(hexHash)) {
          const lines = content.substring(0, match.index).split('\n')
          const line = lines.length - 1
          const column = lines[lines.length - 1].length
          
          diagnostics.push({
            id: `jpe-ref-stbl-${line}-${column}`,
            fileId: '',
            line,
            column,
            severity: 'warning',
            message: `STBL reference "${hexHash}" not found in current project context.`,
            code: 'JPEREF002',
            suggestion: 'Verify that the source text for this hash exists in a .stbl or .jpe file.',
          })
        }
      }
    }

    return {
      valid: true,
      diagnostics,
      warnings: [],
    }
  },
}
