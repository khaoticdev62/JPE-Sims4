/**
 * ValidationEngine provides real-time validation with detailed diagnostics
 * Checks for syntax errors, semantic issues, and best practices
 */

import type { Diagnostic, ValidationResult } from '@types/index'

export interface ValidationRule {
  id: string
  name: string
  check: (content: string) => ValidationResult
  severity: 'error' | 'warning' | 'info'
}

export class ValidationEngine {
  private static readonly rules: ValidationRule[] = [
    {
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
    },
    {
      id: 'tag-matching',
      name: 'Tag Matching',
      severity: 'error',
      check: (content: string) => {
        const openTags = (content.match(/<(?!\/)[a-zA-Z0-9_:-]+/g) || []).map(
          (tag) => tag.replace('<', '')
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
  ]

  /**
   * Run all validation rules
   */
  static validate(content: string): ValidationResult {
    const allDiagnostics: Diagnostic[] = []
    const allWarnings: string[] = []
    let isValid = true

    for (const rule of this.rules) {
      const result = rule.check(content)

      allDiagnostics.push(...result.diagnostics)
      allWarnings.push(...result.warnings)

      if (!result.valid && rule.severity === 'error') {
        isValid = false
      }
    }

    return {
      valid: isValid,
      diagnostics: allDiagnostics,
      warnings: allWarnings,
    }
  }

  /**
   * Validate specific rule
   */
  static validateRule(ruleId: string, content: string): ValidationResult | null {
    const rule = this.rules.find((r) => r.id === ruleId)
    if (!rule) return null
    return rule.check(content)
  }

  /**
   * Get all available rules
   */
  static getRules(): Array<{ id: string; name: string; severity: string }> {
    return this.rules.map((r) => ({
      id: r.id,
      name: r.name,
      severity: r.severity,
    }))
  }

  /**
   * Count diagnostics by severity
   */
  static countBySeverity(diagnostics: Diagnostic[]): {
    errors: number
    warnings: number
    infos: number
  } {
    return {
      errors: diagnostics.filter((d) => d.severity === 'error').length,
      warnings: diagnostics.filter((d) => d.severity === 'warning').length,
      infos: diagnostics.filter((d) => d.severity === 'info').length,
    }
  }
}
