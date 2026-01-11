import type { ValidationRule } from '../ValidationRule'

export const XMLDeclarationRule: ValidationRule = {
  id: 'xml-declaration',
  name: 'XML Declaration',
  severity: 'warning',
  check: (content: string) => {
    const hasDeclaration = content.trim().startsWith('<?xml')
    if (!hasDeclaration) {
      return {
        valid: false,
        diagnostics: [
          {
            id: 'xml-decl-001',
            fileId: '',
            line: 0,
            column: 0,
            severity: 'warning',
            message: 'Missing XML declaration',
            code: 'XMLDECL001',
            suggestion: 'Add <?xml version="1.0" encoding="utf-8"?> at the beginning',
            documentationLink: 'https://example.com/xml-declaration',
          },
        ],
        warnings: [],
      }
    }
    return { valid: true, diagnostics: [], warnings: [] }
  },
}
