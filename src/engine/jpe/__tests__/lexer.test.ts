/**
 * Lexer Tests
 *
 * Tests for the JPE lexer - tokenization of source code into token stream.
 * Tests cover:
 * - Single character tokens
 * - Keywords (booleans, references)
 * - String literals (double and single quoted)
 * - Numbers (integers and decimals)
 * - Comments
 * - Complex JPE structures
 * - Error cases
 */

import { describe, it, expect } from 'vitest'
import { JPELexer, tokenize } from '../lexer'
import { TokenType } from '../tokens'

describe('JPE Lexer', () => {
  describe('Basic tokens', () => {
    it('should tokenize section header [Metadata]', () => {
      const lexer = new JPELexer('[Metadata]')
      const tokens = lexer.tokenize()

      expect(tokens).toHaveLength(4) // [ Metadata ] EOF
      expect(tokens[0].type).toBe(TokenType.SECTION_OPEN)
      expect(tokens[0].value).toBe('[')
      expect(tokens[1].type).toBe(TokenType.IDENTIFIER)
      expect(tokens[1].value).toBe('Metadata')
      expect(tokens[2].type).toBe(TokenType.SECTION_CLOSE)
      expect(tokens[2].value).toBe(']')
      expect(tokens[3].type).toBe(TokenType.EOF)
    })

    it('should tokenize simple assignment', () => {
      const tokens = tokenize('key = value')

      const types = tokens.map(t => t.type)
      expect(types).toEqual([
        TokenType.IDENTIFIER,
        TokenType.EQUALS,
        TokenType.IDENTIFIER,
        TokenType.EOF,
      ])
    })

    it('should tokenize dotted key', () => {
      const tokens = tokenize('parent.child.field')

      const types = tokens.map(t => t.type)
      expect(types).toEqual([
        TokenType.IDENTIFIER,
        TokenType.DOT,
        TokenType.IDENTIFIER,
        TokenType.DOT,
        TokenType.IDENTIFIER,
        TokenType.EOF,
      ])
    })
  })

  describe('String literals', () => {
    it('should tokenize double-quoted string', () => {
      const tokens = tokenize('"hello world"')

      expect(tokens[0].type).toBe(TokenType.STRING)
      expect(tokens[0].value).toBe('"hello world"')
    })

    it('should tokenize single-quoted string', () => {
      const tokens = tokenize("'hello world'")

      expect(tokens[0].type).toBe(TokenType.STRING)
      expect(tokens[0].value).toBe("'hello world'")
    })

    it('should handle escaped quotes in strings', () => {
      const tokens = tokenize('"hello \\"world\\""')

      expect(tokens[0].type).toBe(TokenType.STRING)
      expect(tokens[0].value).toBe('"hello \\"world\\""')
    })

    it('should handle escape sequences', () => {
      const tokens = tokenize('"line1\\nline2\\t\\t"')

      expect(tokens[0].type).toBe(TokenType.STRING)
      expect(tokens[0].value).toContain('\\n')
      expect(tokens[0].value).toContain('\\t')
    })
  })

  describe('Numbers', () => {
    it('should tokenize positive integer', () => {
      const tokens = tokenize('42')

      expect(tokens[0].type).toBe(TokenType.NUMBER)
      expect(tokens[0].value).toBe('42')
    })

    it('should tokenize negative integer', () => {
      const tokens = tokenize('-42')

      expect(tokens[0].type).toBe(TokenType.NUMBER)
      expect(tokens[0].value).toBe('-42')
    })

    it('should tokenize decimal number', () => {
      const tokens = tokenize('3.14159')

      expect(tokens[0].type).toBe(TokenType.NUMBER)
      expect(tokens[0].value).toBe('3.14159')
    })

    it('should tokenize negative decimal', () => {
      const tokens = tokenize('-2.5')

      expect(tokens[0].type).toBe(TokenType.NUMBER)
      expect(tokens[0].value).toBe('-2.5')
    })
  })

  describe('Keywords', () => {
    it('should tokenize true boolean', () => {
      const tokens = tokenize('true')

      expect(tokens[0].type).toBe(TokenType.BOOLEAN)
      expect(tokens[0].value).toBe('true')
    })

    it('should tokenize false boolean', () => {
      const tokens = tokenize('false')

      expect(tokens[0].type).toBe(TokenType.BOOLEAN)
      expect(tokens[0].value).toBe('false')
    })

    it('should tokenize reference', () => {
      const tokens = tokenize('ref:CookingSkill')

      expect(tokens[0].type).toBe(TokenType.REFERENCE)
      expect(tokens[0].value).toBe('ref:CookingSkill')
    })

    it('should tokenize identifier (not keyword)', () => {
      const tokens = tokenize('myVariable')

      expect(tokens[0].type).toBe(TokenType.IDENTIFIER)
      expect(tokens[0].value).toBe('myVariable')
    })
  })

  describe('Comments', () => {
    it('should tokenize comment', () => {
      const tokens = tokenize('# This is a comment')

      expect(tokens[0].type).toBe(TokenType.COMMENT)
      expect(tokens[0].value).toContain('This is a comment')
    })

    it('should tokenize comment with special chars', () => {
      const tokens = tokenize('# TODO: fix this @author John')

      expect(tokens[0].type).toBe(TokenType.COMMENT)
      expect(tokens[0].value).toContain('TODO')
      expect(tokens[0].value).toContain('@author')
    })
  })

  describe('Line tracking', () => {
    it('should track line and column numbers', () => {
      const lexer = new JPELexer('first\nsecond')
      const tokens = lexer.tokenize()

      const firstIdentifier = tokens[0]
      expect(firstIdentifier.line).toBe(1)
      expect(firstIdentifier.column).toBe(1)

      const secondIdentifier = tokens[1]
      expect(secondIdentifier.line).toBe(2)
    })

    it('should track column in same line', () => {
      const tokens = tokenize('key = value')

      expect(tokens[0].column).toBeLessThan(tokens[1].column)
      expect(tokens[1].column).toBeLessThan(tokens[2].column)
    })
  })

  describe('Complex structures', () => {
    it('should tokenize simple JPE section', () => {
      const code = '[Metadata]\ntype = "tuning"'
      const tokens = tokenize(code)

      const types = tokens.map(t => t.type)
      expect(types).toContain(TokenType.SECTION_OPEN)
      expect(types).toContain(TokenType.IDENTIFIER)
      expect(types).toContain(TokenType.SECTION_CLOSE)
      expect(types).toContain(TokenType.NEWLINE)
      expect(types).toContain(TokenType.EQUALS)
      expect(types).toContain(TokenType.STRING)
    })

    it('should tokenize multiple sections', () => {
      const code = '[Section1]\nkey1 = value1\n[Section2]\nkey2 = value2'
      const tokens = tokenize(code)

      const sectionOpens = tokens.filter(t => t.type === TokenType.SECTION_OPEN)
      expect(sectionOpens).toHaveLength(2)
    })

    it('should handle empty sections', () => {
      const code = '[Empty]\n[Another]'
      const tokens = tokenize(code)

      expect(tokens.some(t => t.type === TokenType.SECTION_OPEN)).toBe(true)
    })
  })

  describe('Whitespace handling', () => {
    it('should skip spaces between tokens', () => {
      const tokens = tokenize('   key   =   value   ')

      const types = tokens.map(t => t.type).filter(t => t !== TokenType.EOF)
      expect(types).toEqual([TokenType.IDENTIFIER, TokenType.EQUALS, TokenType.IDENTIFIER])
    })

    it('should preserve newlines', () => {
      const tokens = tokenize('line1\nline2')

      expect(tokens.some(t => t.type === TokenType.NEWLINE)).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty input', () => {
      const tokens = tokenize('')

      expect(tokens).toHaveLength(1) // Just EOF
      expect(tokens[0].type).toBe(TokenType.EOF)
    })

    it('should handle only whitespace', () => {
      const tokens = tokenize('   \n  \n  ')

      const nonEOF = tokens.filter(t => t.type !== TokenType.EOF)
      expect(nonEOF.every(t => t.type === TokenType.NEWLINE)).toBe(true)
    })

    it('should handle identifier with underscores and numbers', () => {
      const tokens = tokenize('_my_var_123')

      expect(tokens[0].type).toBe(TokenType.IDENTIFIER)
      expect(tokens[0].value).toBe('_my_var_123')
    })

    it('should tokenize zero', () => {
      const tokens = tokenize('0')

      expect(tokens[0].type).toBe(TokenType.NUMBER)
      expect(tokens[0].value).toBe('0')
    })
  })

  describe('Helper function', () => {
    it('should tokenize via helper function', () => {
      const tokens = tokenize('[Test]')

      expect(tokens.length).toBeGreaterThan(0)
      expect(tokens[0].type).toBe(TokenType.SECTION_OPEN)
    })
  })
})
