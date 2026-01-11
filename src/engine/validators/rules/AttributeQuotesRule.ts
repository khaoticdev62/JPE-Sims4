import type { ValidationRule } from '../ValidationRule'
import type { Diagnostic } from '@/types/index'

export const AttributeQuotesRule: ValidationRule = {
  id: 'attribute-quotes',
  name: 'Attribute Quotes',
  severity: 'error',
  check: (content: string) => {
    const unquotedAttrRegex = /\s+[a-zA-Z0-9_:-]+=(?!["'])/g
    const diagnostics: Diagnostic[] = []

    let match
    while ((match = unquotedAttrRegex.exec(content)) !== null) {
      diagnostics.push({
        id: 'attr-quote-001',
        fileId: '',
        line: 0,
        column: match.index,
        severity: 'error',
        message: 'Unquoted attribute value',
        code: 'ATTRQUOTE001',
        suggestion: 'Wrap attribute values in quotes: attribute="value"',
      })
    }

    return { valid: diagnostics.length === 0, diagnostics, warnings: [] }
  },
}
