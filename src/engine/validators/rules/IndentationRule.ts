import type { ValidationRule } from '../ValidationRule'

export const IndentationRule: ValidationRule = {
  id: 'jpe-indentation',
  name: 'Indentation',
  severity: 'warning',
  check: (content: string) => {
    const lines = content.split('\n')
    const diagnostics: any[] = []
    
    // Simple check: nested lines (those starting with - or a key inside a section)
    // should have consistent indentation (2 or 4 spaces)
    let inSection = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim().startsWith('[')) {
        inSection = true
        continue
      }
      
      if (!line.trim() || line.trim().startsWith('//') || line.trim().startsWith('#')) {
        continue
      }
      
      if (inSection && line.length > 0 && !line.startsWith(' ') && !line.startsWith('\t') && !line.startsWith('[')) {
        // Line in section but not indented
        // But wait, the JPE format might allow top-level assignments in sections without indentation
        // Let's check the grammar/examples.
      }
      
      const leadingSpaces = line.match(/^ +/)?.[0].length || 0
      if (leadingSpaces > 0 && leadingSpaces % 2 !== 0) {
        diagnostics.push({
          id: `indent-001-${i}`,
          fileId: '',
          line: i + 1,
          column: 1,
          severity: 'warning',
          message: 'Inconsistent indentation (expected multiple of 2 spaces)',
          code: 'JPEIND001',
          suggestion: 'Use 2 or 4 spaces for indentation',
        })
      }
    }
    
    return {
      valid: diagnostics.length === 0,
      diagnostics,
      warnings: [],
    }
  },
}
