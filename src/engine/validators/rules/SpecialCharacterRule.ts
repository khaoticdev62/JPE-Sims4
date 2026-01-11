import type { ValidationRule } from '../ValidationRule'
import type { Diagnostic } from '@/types/index'

export const SpecialCharacterRule: ValidationRule = {
  id: 'special-characters',
  name: 'Special Characters',
  severity: 'warning',
  check: (content: string) => {
    const diagnostics: Diagnostic[] = []
    const warnings: string[] = []

    // Check for unescaped &
    if (content.includes('&') && !content.includes('&amp;') && !content.includes('&lt;')) {
      warnings.push(
        'Unescaped & character found. Use &amp; instead for proper XML encoding.'
      )
      diagnostics.push({
        id: 'spec-char-001',
        fileId: '',
        line: 0,
        column: 0,
        severity: 'warning',
        message: 'Unescaped & character',
        code: 'SPECCHAR001',
        suggestion: 'Replace & with &amp;',
      })
    }

    // Check for unescaped < in content
    const contentWithoutTags = content.replace(/<[^>]+>/g, '')
    if (contentWithoutTags.includes('<')) {
      diagnostics.push({
        id: 'spec-char-002',
        fileId: '',
        line: 0,
        column: 0,
        severity: 'warning',
        message: 'Unescaped < character in content',
        code: 'SPECCHAR002',
        suggestion: 'Replace < with &lt; in text content',
      })
    }

    return {
      valid: diagnostics.filter((d) => d.severity === 'error').length === 0,
      diagnostics,
      warnings,
    }
  },
}
