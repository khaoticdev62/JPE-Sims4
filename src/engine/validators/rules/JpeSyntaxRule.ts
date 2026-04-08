import type { ValidationRule } from '../ValidationRule'
import { JPELexer, LexerError } from '@/services/translation/lexer'
import { JPELogicParser, ParserError } from '@/services/translation/parser'
import type { Diagnostic } from '@/types/index'

export const JpeSyntaxRule: ValidationRule = {
  id: 'jpe-syntax',
  name: 'JPE Syntax',
  severity: 'error',
  check: (content: string) => {
    const diagnostics: Diagnostic[] = []

    try {
      // 1. Lexical Analysis
      const lexer = new JPELexer(content)
      const tokens = lexer.tokenize()

      // 2. Syntactic Analysis
      const parser = new JPELogicParser(tokens)
      parser.parse()

      // 3. Structural Validation (Rules that parser might not catch yet)
      const upperContent = content.toUpperCase()
      
      // Rule: WHEN requires DO block in Interaction
      if (upperContent.includes('WHEN:') && !upperContent.includes('DO:')) {
        diagnostics.push({
          id: 'jpe-struct-001',
          fileId: '',
          line: 1,
          column: 1,
          severity: 'error',
          message: 'Missing DO block after WHEN. Every interaction logic must include actions.',
          code: 'JPESTR001',
          suggestion: 'Add DO: block with actions (e.g., notification, state_change)',
        })
      }

    } catch (error) {
      if (error instanceof LexerError) {
        diagnostics.push({
          id: `jpe-lex-${error.line}-${error.column}`,
          fileId: '',
          line: error.line,
          column: error.column,
          endLine: error.endLine,
          endColumn: error.endColumn,
          severity: 'error',
          message: error.message,
          code: 'JPELEX001',
          suggestion: error.suggestion,
        })
      } else if (error instanceof ParserError) {
        diagnostics.push({
          id: `jpe-parse-${error.line}-${error.column}`,
          fileId: '',
          line: error.line,
          column: error.column,
          endLine: error.endLine,
          endColumn: error.endColumn,
          severity: 'error',
          message: error.message,
          code: 'JPEPARSE001',
        })
      } else {
        diagnostics.push({
          id: 'jpe-syntax-fail',
          fileId: '',
          line: 1,
          column: 1,
          severity: 'error',
          message: `Unexpected internal error: ${error instanceof Error ? error.message : String(error)}`,
          code: 'JPESYN002',
        })
      }
    }

    return {
      valid: !diagnostics.some(d => d.severity === 'error'),
      diagnostics,
      warnings: [],
    }
  },
}
