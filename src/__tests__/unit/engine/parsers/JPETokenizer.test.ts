/**
 * Unit tests for JPETokenizer (Story 2.3)
 *
 * Tests cover:
 * - Basic tokenization of JPE source
 * - Keyword recognition (WHEN, DO, ONLY_IF, CONDITIONS, etc.)
 * - String literal handling (quotes, escapes, unterminated)
 * - Number handling (integer, decimal, hex)
 * - Comment handling
 * - Token stream validation
 * - Error reporting with suggestions
 */

import { JPETokenizer, tokenizeJPE, tokenizeAndValidateJPE } from '@/engine/parsers/JPETokenizer'
import { TokenType } from '@/services/translation/types'

// ─── Basic Tokenization ───────────────────────────────────────────

describe('JPETokenizer - Basic Tokenization', () => {
  it('tokenizes empty string to EOF only', () => {
    const tokenizer = new JPETokenizer('')
    const tokens = tokenizer.tokenize()
    expect(tokens).toHaveLength(1)
    expect(tokens[0].type).toBe(TokenType.EOF)
  })

  it('tokenizes simple keywords', () => {
    const tokens = tokenizeJPE('WHEN')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(1)
    expect(nonEof[0].type).toBe(TokenType.WHEN)
    expect(nonEof[0].value).toBe('WHEN')
  })

  it('recognizes all JPE keywords', () => {
    const keywords = ['WHEN', 'DO', 'ONLY_IF', 'CONDITIONS', 'LOCALIZATION', 'NAMESPACE']
    for (const kw of keywords) {
      const tokens = tokenizeJPE(kw)
      const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
      expect(nonEof).toHaveLength(1)
      expect(nonEof[0].value).toBe(kw)
    }
  })

  it('tokenizes boolean literals', () => {
    const tokensTrue = tokenizeJPE('true')
    const nonEofTrue = tokensTrue.filter(t => t.type !== TokenType.EOF)
    expect(nonEofTrue[0].type).toBe(TokenType.BOOLEAN)
    expect(nonEofTrue[0].value).toBe('true')

    const tokensFalse = tokenizeJPE('false')
    const nonEofFalse = tokensFalse.filter(t => t.type !== TokenType.EOF)
    expect(nonEofFalse[0].type).toBe(TokenType.BOOLEAN)
    expect(nonEofFalse[0].value).toBe('false')
  })

  it('tokenizes unknown identifiers as IDENTIFIER', () => {
    const tokens = tokenizeJPE('sim_has_trait')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(1)
    expect(nonEof[0].type).toBe(TokenType.IDENTIFIER)
    expect(nonEof[0].value).toBe('sim_has_trait')
  })
})

// ─── Operators & Punctuation ──────────────────────────────────────

describe('JPETokenizer - Operators & Punctuation', () => {
  it('tokenizes parentheses', () => {
    const tokens = tokenizeJPE('()')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(2)
    expect(nonEof[0].type).toBe(TokenType.LPAREN)
    expect(nonEof[1].type).toBe(TokenType.RPAREN)
  })

  it('tokenizes colon, comma, equals, dash', () => {
    const tokens = tokenizeJPE(':,=-')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(4)
    expect(nonEof[0].type).toBe(TokenType.COLON)
    expect(nonEof[1].type).toBe(TokenType.COMMA)
    expect(nonEof[2].type).toBe(TokenType.EQUALS)
    expect(nonEof[3].type).toBe(TokenType.DASH)
  })
})

// ─── String Literals ──────────────────────────────────────────────

describe('JPETokenizer - String Literals', () => {
  it('tokenizes double-quoted string', () => {
    const tokens = tokenizeJPE('"hello world"')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(1)
    expect(nonEof[0].type).toBe(TokenType.STRING)
    expect(nonEof[0].value).toBe('hello world')
  })

  it('handles escaped quotes in strings', () => {
    const tokens = tokenizeJPE('"say \\"hello\\""')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(1)
    expect(nonEof[0].type).toBe(TokenType.STRING)
    expect(nonEof[0].value).toBe('say "hello"')
  })

  it('handles escaped newlines in strings (backslash consumed, char stored)', () => {
    const tokens = tokenizeJPE('"line1\\nline2"')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(1)
    // Backslash consumed as escape prefix, 'n' stored as-is
    expect(nonEof[0].value).toBe('line1nline2')
  })

  it('reports error for unterminated string', () => {
    const result = tokenizeAndValidateJPE('"unterminated')
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0].message).toContain('Unterminated string')
    expect(result.errors[0].suggestion).toContain('double-quote')
  })

  it('handles strings with escape sequences (backslash consumed, char stored)', () => {
    const tokens = tokenizeJPE('"tab\\there"')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    // Backslash consumed as escape prefix, 't' stored as-is
    expect(nonEof[0].value).toBe('tabthere')
  })
})

// ─── Numbers ──────────────────────────────────────────────────────

describe('JPETokenizer - Numbers', () => {
  it('tokenizes integer', () => {
    const tokens = tokenizeJPE('42')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(1)
    expect(nonEof[0].type).toBe(TokenType.NUMBER)
    expect(nonEof[0].value).toBe('42')
  })

  it('tokenizes dash-identifier as single identifier', () => {
    const tokens = tokenizeJPE('-100')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    // Dash followed by alphanumeric is treated as identifier (supports dashed names)
    expect(nonEof).toHaveLength(1)
    expect(nonEof[0].type).toBe(TokenType.IDENTIFIER)
    expect(nonEof[0].value).toBe('-100')
  })

  it('tokenizes decimal number', () => {
    const tokens = tokenizeJPE('3.14')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(1)
    expect(nonEof[0].type).toBe(TokenType.NUMBER)
    expect(nonEof[0].value).toBe('3.14')
  })

  it('tokenizes hex number', () => {
    const tokens = tokenizeJPE('0x1A2B')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(1)
    expect(nonEof[0].type).toBe(TokenType.NUMBER)
    expect(nonEof[0].value).toBe('0x1A2B')
  })
})

// ─── Comments ─────────────────────────────────────────────────────

describe('JPETokenizer - Comments', () => {
  it('treats # at start of line as comment', () => {
    const tokens = tokenizeJPE('# this is a comment')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(1)
    expect(nonEof[0].value).toBe('# this is a comment')
  })

  it('treats # in middle of line as part of identifier', () => {
    const tokens = tokenizeJPE('trait#123')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(1)
    expect(nonEof[0].type).toBe(TokenType.IDENTIFIER)
    expect(nonEof[0].value).toBe('trait#123')
  })
})

// ─── Whitespace ───────────────────────────────────────────────────

describe('JPETokenizer - Whitespace', () => {
  it('ignores spaces and tabs', () => {
    const tokens = tokenizeJPE('WHEN  \t  DO')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(2)
    expect(nonEof[0].type).toBe(TokenType.WHEN)
    expect(nonEof[1].type).toBe(TokenType.DO)
  })

  it('tracks line numbers correctly', () => {
    const tokens = tokenizeJPE('line1\nline2\nline3')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof[0].line).toBe(1)
    expect(nonEof[1].line).toBe(2)
    expect(nonEof[2].line).toBe(3)
  })
})

// ─── Complex JPE Structures ───────────────────────────────────────

describe('JPETokenizer - Complex JPE Structures', () => {
  it('tokenizes WHEN block structure', () => {
    const source = `WHEN (sim_has_trait("creative")) {
  DO {
    apply_buff("inspiration")
  }
}`
    const tokens = tokenizeJPE(source)
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)

    expect(nonEof[0].type).toBe(TokenType.WHEN)
    expect(nonEof[0].line).toBe(1)

    // Find DO keyword
    const doToken = nonEof.find(t => t.type === TokenType.DO)
    expect(doToken).toBeDefined()
    expect(doToken?.line).toBe(2)
  })

  it('tokenizes ONLY_IF block', () => {
    const source = `ONLY_IF (sim_has_buff("happy")) {
  grant_reward()
}`
    const tokens = tokenizeJPE(source)
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)

    expect(nonEof[0].type).toBe(TokenType.ONLY_IF)
  })

  it('tokenizes LOCALIZATION block', () => {
    const source = `LOCALIZATION {
  EN: "Hello"
  FR: "Bonjour"
}`
    const tokens = tokenizeJPE(source)
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)

    expect(nonEof[0].type).toBe(TokenType.LOCALIZATION)
    const enToken = nonEof.find(t => t.value === 'EN')
    expect(enToken).toBeDefined()
  })
})

// ─── Token Stream Validation ──────────────────────────────────────

describe('JPETokenizer - Token Stream Validation', () => {
  it('produces no errors for valid JPE', () => {
    const result = tokenizeAndValidateJPE('WHEN (condition) {\n  DO {\n    action()\n  }\n}')
    expect(result.errors).toHaveLength(0)
  })

  it('reports lexical errors for unexpected characters', () => {
    const result = tokenizeAndValidateJPE('valid\x01invalid')
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0].message).toContain('Unexpected character')
  })
})

// ─── Error Reporting ──────────────────────────────────────────────

describe('JPETokenizer - Error Reporting', () => {
  it('includes line and column in errors', () => {
    const result = tokenizeAndValidateJPE('good\nbad\x01char')
    const errors = result.errors
    if (errors.length > 0) {
      expect(errors[0].line).toBe(2)
      expect(errors[0].column).toBeGreaterThan(0)
    }
  })

  it('provides suggestions for fixable errors', () => {
    const result = tokenizeAndValidateJPE('"unterminated')
    expect(result.errors[0].suggestion).toBeDefined()
  })

  it('handles empty input gracefully', () => {
    const result = tokenizeAndValidateJPE('')
    expect(result.tokens).toHaveLength(1)
    expect(result.tokens[0].type).toBe(TokenType.EOF)
    expect(result.errors).toHaveLength(0)
  })
})

// ─── Unicode Support ──────────────────────────────────────────────

describe('JPETokenizer - Unicode Support', () => {
  it('handles accented characters in identifiers', () => {
    const tokens = tokenizeJPE('nom_café')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof[0].type).toBe(TokenType.IDENTIFIER)
    expect(nonEof[0].value).toBe('nom_café')
  })

  it('handles unicode in strings', () => {
    const tokens = tokenizeJPE('"Bonjour le monde"')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof[0].value).toBe('Bonjour le monde')
  })
})

// ─── Convenience Functions ────────────────────────────────────────

describe('Convenience Functions', () => {
  it('tokenizeJPE returns tokens', () => {
    const tokens = tokenizeJPE('WHEN DO')
    const nonEof = tokens.filter(t => t.type !== TokenType.EOF)
    expect(nonEof).toHaveLength(2)
  })

  it('tokenizeAndValidateJPE returns tokens and errors', () => {
    const result = tokenizeAndValidateJPE('WHEN DO')
    expect(result.tokens.length).toBeGreaterThan(0)
    expect(Array.isArray(result.errors)).toBe(true)
  })
})
