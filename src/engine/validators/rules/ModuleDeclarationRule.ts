import type { ValidationRule } from '../ValidationRule'

export const ModuleDeclarationRule: ValidationRule = {
  id: 'jpe-module-declaration',
  name: 'Module Declaration',
  severity: 'error',
  check: (content: string) => {
    // JPE should start with MODULE: <name>
    // Allow comments or empty lines before it
    const lines = content.split('\n')
    let foundModule = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('//')) {
        continue
      }
      if (line.startsWith('MODULE:')) {
        foundModule = true
        lineIndex = i
        break
      }
      // If we found something else that isn't a comment or empty line, it's an error
      break
    }

    if (!foundModule) {
      return {
        valid: false,
        diagnostics: [
          {
            id: 'jpe-mod-001',
            fileId: '',
            line: 1,
            column: 1,
            severity: 'error',
            message: 'Missing MODULE declaration',
            code: 'JPEMOD001',
            suggestion: 'Add MODULE: YourModuleName at the top of the file',
          },
        ],
        warnings: [],
      }
    }

    return { valid: true, diagnostics: [], warnings: [] }
  },
}
