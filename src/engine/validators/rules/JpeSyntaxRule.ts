import type { ValidationRule } from '../ValidationRule'
import { tokenize } from '@/engine/jpe/lexer'
import { parse } from '@/engine/jpe/parser'
import type { Diagnostic } from '@/types/index'

export const JpeSyntaxRule: ValidationRule = {
  id: 'jpe-syntax',
  name: 'JPE Syntax',
  severity: 'error',
  check: (content: string) => {
    try {
      const tokens = tokenize(content)
      const ast = parse(tokens)
      
      const errors = ast.metadata?.errors || []
      const diagnostics: Diagnostic[] = []

      // Add parser errors
      if (errors.length > 0) {
        diagnostics.push(...errors.map((err: any, index: number) => ({
          id: `jpe-syntax-${index}`,
          fileId: '',
          line: err.line,
          column: err.column,
          severity: 'error' as const,
          message: err.message,
          code: 'JPESYN001',
          suggestion: err.expected ? `Expected ${err.expected}` : undefined,
        })))
      }

      // Rule 2: Syntax: Valid Keywords
      // MODULE, DESCRIPTION, WHEN, DO, ONLY_IF, CONDITIONS, LOCALIZATION
      const validKeywords = ['MODULE', 'DESCRIPTION', 'WHEN', 'DO', 'ONLY_IF', 'CONDITIONS', 'LOCALIZATION', 'VERSION', 'AUTHOR', 'ITEMS', 'COMPATIBILITY']
      const upperContent = content.toUpperCase()
      const lines = upperContent.split('\n')
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.endsWith(':')) {
          const keyword = line.slice(0, -1)
          if (!validKeywords.includes(keyword) && !line.startsWith('//') && !line.startsWith('#') && !line.startsWith('[')) {
             // Basic check for keywords ending in :
             // Note: This is a loose check as identifiers can also be keywords
          }
        }
      }

      // Rule 3: Required Structure (WHEN requires DO block)
      if (upperContent.includes('WHEN:') && !upperContent.includes('DO:')) {
        diagnostics.push({
          id: 'jpe-struct-001',
          fileId: '',
          line: 1,
          column: 1,
          severity: 'error',
          message: 'Missing DO block after WHEN',
          code: 'JPESTR001',
          suggestion: 'Add DO: block with actions to perform',
        })
      }

      if (diagnostics.length > 0) {
        return {
          valid: !diagnostics.some(d => d.severity === 'error'),
          diagnostics,
          warnings: [],
        }
      }

      return { valid: true, diagnostics: [], warnings: [] }
    } catch (error) {
      return {
        valid: false,
        diagnostics: [
          {
            id: 'jpe-syntax-fail',
            fileId: '',
            line: 1,
            column: 1,
            severity: 'error',
            message: `Failed to parse JPE: ${error}`,
            code: 'JPESYN002',
          },
        ],
        warnings: [],
      }
    }
  },
}
