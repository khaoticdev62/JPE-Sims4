import type { ValidationRule } from '../ValidationRule'
import type { Diagnostic } from '@/types/index'

export const TagMatchingRule: ValidationRule = {
  id: 'tag-matching',
  name: 'Tag Matching',
  severity: 'error',
  check: (content: string) => {
    const openTags = (content.match(/<(?!\/)[a-zA-Z0-9_:-]+/g) || []).map((tag) =>
      tag.replace('<', '')
    )
    const closeTags = (content.match(/<\/[a-zA-Z0-9_:-]+>/g) || []).map((tag) =>
      tag.replace(/<\//g, '').replace('>', '')
    )

    // Check if counts match
    if (openTags.length !== closeTags.length) {
      const diagnostics: Diagnostic[] = []

      if (openTags.length > closeTags.length) {
        diagnostics.push({
          id: 'tag-match-001',
          fileId: '',
          line: 0,
          column: 0,
          severity: 'error',
          message: `Unclosed tags: found ${openTags.length} opening tags but ${closeTags.length} closing tags`,
          code: 'TAGMATCH001',
          suggestion: `Check that all opening tags have matching closing tags`,
        })
      } else {
        diagnostics.push({
          id: 'tag-match-002',
          fileId: '',
          line: 0,
          column: 0,
          severity: 'error',
          message: `Extra closing tags: found ${closeTags.length} closing tags but ${openTags.length} opening tags`,
          code: 'TAGMATCH002',
          suggestion: 'Check for extra closing tags without matching opening tags',
        })
      }

      return { valid: false, diagnostics, warnings: [] }
    }

    return { valid: true, diagnostics: [], warnings: [] }
  },
}
