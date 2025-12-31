import type { ValidationRule } from '../ValidationRule'

export const LocalizationCompletenessRule: ValidationRule = {
  id: 'jpe-localization-completeness',
  name: 'Localization Completeness',
  severity: 'warning',
  check: (content: string) => {
    if (content.includes('LOCALIZATION:')) {
      // Find the LOCALIZATION block and check for EN:
      const lines = content.split('\n')
      let inLocalization = false
      let foundEN = false
      
      for (const line of lines) {
        if (line.includes('LOCALIZATION:')) {
          inLocalization = true
          continue
        }
        
        if (inLocalization) {
          if (line.trim().startsWith('EN:')) {
            foundEN = true
            break
          }
          // If we hit another keyword or section, the block ended
          if (line.trim().match(/^[A-Z_]+:/) || line.trim().startsWith('[')) {
            break
          }
        }
      }
      
      if (!foundEN) {
        return {
          valid: false,
          diagnostics: [
            {
              id: 'loc-001',
              fileId: '',
              line: 1, // Simplified
              column: 1,
              severity: 'warning',
              message: 'Missing EN localization (required for other languages)',
              code: 'JPELOC001',
              suggestion: 'Add EN: "Your English text" under LOCALIZATION:',
            },
          ],
          warnings: [],
        }
      }
    }
    return { valid: true, diagnostics: [], warnings: [] }
  },
}
