import type { ValidationRule } from '../ValidationRule'
import type { Diagnostic } from '@/types/index'

export const TagNestingRule: ValidationRule = {
  id: 'tag-nesting',
  name: 'Tag Nesting',
  severity: 'error',
  check: (content: string) => {
    const tagStack: string[] = []
    const diagnostics: Diagnostic[] = []

    // Simple stack-based tag matching
    const tagRegex = /<\/?[a-zA-Z0-9_:-]+/g
    let match

    while ((match = tagRegex.exec(content)) !== null) {
      const tag = match[0]

      if (tag.startsWith('</')) {
        // Closing tag
        const tagName = tag.substring(2)
        if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tagName) {
          diagnostics.push({
            id: 'tag-nest-001',
            fileId: '',
            line: 0,
            column: match.index,
            severity: 'error',
            message: `Mismatched closing tag: </${tagName}>`,
            code: 'TAGNEST001',
            suggestion: `Check tag nesting order. Expected closing </${tagStack[tagStack.length - 1] || 'root'}> tag`,
          })
        } else {
          tagStack.pop()
        }
      } else {
        // Opening tag
        const tagName = tag.substring(1)
        // Only track tags that are not self-closing (would need to check for />)
        tagStack.push(tagName)
      }
    }

    if (tagStack.length > 0) {
      diagnostics.push({
        id: 'tag-nest-002',
        fileId: '',
        line: 0,
        column: 0,
        severity: 'error',
        message: `Unclosed tags: ${tagStack.join(', ')}`,
        code: 'TAGNEST002',
        suggestion: `Ensure all opening tags have closing tags: ${tagStack.map((t) => `</${t}>`).join(', ')}`,
      })
    }

    return { valid: diagnostics.length === 0, diagnostics, warnings: [] }
  },
}
