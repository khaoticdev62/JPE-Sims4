/**
 * JPE Grammar & Syntax Tokenizer
 *
 * Enhanced tokenizer for the JPE (Just Plain English) language used
 * in Sims 4 modding. Extends basic lexing with token stream validation
 * to catch syntax errors at the lexical level.
 *
 * Supports: WHEN/DO/ONLY_IF/CONDITIONS/LOCALIZATION/NAMESPACE keywords,
 * string literals, numbers, booleans, comments, identifiers, and operators.
 */

import { TokenType, Token } from '@/services/translation/types'

/**
 * A lexical error includes the position and a suggested fix
 */
export interface LexicalError {
  message: string
  line: number
  column: number
  endLine: number
  endColumn: number
  suggestion?: string
}

/**
 * Token stream validation result
 */
export interface TokenStreamResult {
  tokens: Token[]
  errors: LexicalError[]
}

/**
 * JPE keywords recognized by the tokenizer
 */
export const JPE_KEYWORDS: Record<string, TokenType> = {
  'WHEN': TokenType.WHEN,
  'DO': TokenType.DO,
  'ONLY_IF': TokenType.ONLY_IF,
  'CONDITIONS': TokenType.CONDITIONS,
  'LOCALIZATION': TokenType.LOCALIZATION,
  'NAMESPACE': TokenType.NAMESPACE,
  'true': TokenType.BOOLEAN,
  'false': TokenType.BOOLEAN,
}

/**
 * Valid token sequences for stream validation
 * Maps token type to set of valid following token types
 */
const VALID_SEQUENCES: Partial<Record<TokenType, Set<TokenType>>> = {
  [TokenType.WHEN]: new Set([TokenType.LPAREN, TokenType.IDENTIFIER, TokenType.STRING]),
  [TokenType.ONLY_IF]: new Set([TokenType.IDENTIFIER, TokenType.STRING, TokenType.LPAREN]),
  [TokenType.CONDITIONS]: new Set([TokenType.LPAREN, TokenType.LBRACE]),
  [TokenType.DO]: new Set([TokenType.LBRACE, TokenType.IDENTIFIER]),
  [TokenType.LOCALIZATION]: new Set([TokenType.LBRACE]),
  [TokenType.LBRACE]: new Set([TokenType.IDENTIFIER, TokenType.STRING, TokenType.RBRACE, TokenType.WHEN, TokenType.ONLY_IF, TokenType.DO, TokenType.CONDITIONS, TokenType.LOCALIZATION]),
}

/**
 * JPETokenizer - Lexical analyzer for JPE source code
 *
 * Tokenizes JPE source into a stream of typed tokens with
 * line/column tracking and optional stream validation.
 *
 * Usage:
 * ```ts
 * const tokenizer = new JPETokenizer(source)
 * const result = tokenizer.tokenize()       // basic tokenization
 * const validated = tokenizer.tokenizeAndValidate()  // with validation
 * ```
 */
export class JPETokenizer {
  private source: string
  private pos: number = 0
  private line: number = 1
  private column: number = 1
  private tokens: Token[] = []
  private errors: LexicalError[] = []

  constructor(source: string) {
    this.source = source
  }

  /**
   * Tokenize the entire input, returning tokens only
   */
  tokenize(): Token[] {
    this.reset()
    this.scanTokens()
    return this.tokens
  }

  /**
   * Tokenize with stream validation, returning tokens and errors
   */
  tokenizeAndValidate(): TokenStreamResult {
    this.reset()
    this.scanTokens()
    this.validateTokenStream()
    return { tokens: this.tokens, errors: this.errors }
  }

  /**
   * Tokenize and return only lexical errors
   */
  getLexicalErrors(): LexicalError[] {
    this.reset()
    this.scanTokens()
    this.validateTokenStream()
    return this.errors
  }

  // ─── Core Scanning ─────────────────────────────────────────────

  private reset(): void {
    this.pos = 0
    this.line = 1
    this.column = 1
    this.tokens = []
    this.errors = []
  }

  private scanTokens(): void {
    while (!this.isAtEnd()) {
      this.scanToken()
    }
    this.addToken(TokenType.EOF, '')
  }

  private scanToken(): void {
    // Skip UTF-8 BOM
    if (this.pos === 0 && this.source.charCodeAt(0) === 0xFEFF) {
      this.advance()
      return
    }

    if (this.isAtEnd()) return

    const char = this.advance()

    switch (char) {
      case '(': this.addToken(TokenType.LPAREN, '('); break
      case ')': this.addToken(TokenType.RPAREN, ')'); break
      case ':': this.addToken(TokenType.COLON, ':'); break
      case ',': this.addToken(TokenType.COMMA, ','); break
      case '=': this.addToken(TokenType.EQUALS, '='); break
      case '{': this.addToken(TokenType.LBRACE, '{' as any); break
      case '}': this.addToken(TokenType.RBRACE, '}' as any); break
      case '-':
        // Dash could be operator or part of identifier
        if (this.isAlphaNumeric(this.peek()) || ['_', '&', '<', '>', '#', '@', '$', '%', '^', '*', '+', '=', '|', '\\', '/', '?', '!'].includes(this.peek())) {
          this.identifier(char)
        } else {
          this.addToken(TokenType.DASH, '-')
        }
        break

      case '#': {
        // Comment only at absolute start of line (column === 2 because advance() incremented)
        if (this.column === 2) {
          this.scanComment()
        } else {
          // Part of identifier
          this.identifier(char)
        }
        break
      }

      case ' ':
      case '\r':
      case '\t':
        break // Ignore whitespace

      case '\n':
        this.line++
        this.column = 1
        break

      case '"':
        this.scanString()
        break

      default:
        if (this.isDigit(char)) {
          this.scanNumber(char)
        } else if (this.isAlpha(char) || ['&', '<', '>', '@', '$', '%', '^', '*', '+', '=', '|', '\\'].includes(char)) {
          this.identifier(char)
        } else {
          this.addLexicalError(
            `Unexpected character: '${char}'`,
            this.line,
            this.column - 1,
            `Remove the invalid character '${char}'`
          )
        }
        break
    }
  }

  // ─── Scanners ──────────────────────────────────────────────────

  private scanComment(): void {
    const startLine = this.line
    const startColumn = this.column - 1
    let value = '#'

    while (!this.isAtEnd() && this.peek() !== '\n') {
      value += this.advance()
    }

    this.tokens.push({
      type: TokenType.IDENTIFIER, // Comments treated as identifier tokens for display
      value,
      line: startLine,
      column: startColumn,
      start: this.pos - value.length,
      end: this.pos,
    } as Token)
  }

  private scanString(): void {
    const startLine = this.line
    const startColumn = this.column - 1
    let value = ''

    while (!this.isAtEnd() && this.peek() !== '"') {
      if (this.peek() === '\\') {
        this.advance() // consume \
        if (this.isAtEnd()) break
        value += this.advance()
        continue
      }
      const next = this.peek()
      if (next === '\n') {
        this.line++
        this.column = 1
      }
      value += this.advance()
    }

    if (this.isAtEnd()) {
      this.addLexicalError(
        'Unterminated string',
        startLine,
        startColumn,
        'Close the string with a double-quote (")'
      )
      this.tokens.push({
        type: TokenType.STRING,
        value,
        line: startLine,
        column: startColumn,
        start: this.pos - value.length - 1,
        end: this.pos,
      } as Token)
      return
    }

    this.advance() // consume closing "
    this.tokens.push({
      type: TokenType.STRING,
      value,
      line: startLine,
      column: startColumn,
      start: this.pos - value.length - 2,
      end: this.pos,
    } as Token)
  }

  private scanNumber(startChar: string): void {
    const startLine = this.line
    const startColumn = this.column - 1
    let value = startChar

    // Support hex (0x...)
    if (value === '0' && (this.peek() === 'x' || this.peek() === 'X')) {
      value += this.advance()
      while (this.isHexDigit(this.peek())) {
        value += this.advance()
      }
      this.tokens.push({
        type: TokenType.NUMBER,
        value,
        line: startLine,
        column: startColumn,
        start: this.pos - value.length,
        end: this.pos,
      } as Token)
      return
    }

    while (this.isDigit(this.peek())) {
      value += this.advance()
    }

    // Support decimals
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance()
      while (this.isDigit(this.peek())) {
        value += this.advance()
      }
    }

    this.tokens.push({
      type: TokenType.NUMBER,
      value,
      line: startLine,
      column: startColumn,
      start: this.pos - value.length,
      end: this.pos,
    } as Token)
  }

  private identifier(startChar: string): void {
    const startLine = this.line
    const startColumn = this.column - 1
    let value = startChar
    const allowed = ['_', '.', '-', '&', '<', '>', '#', '@', '$', '%', '^', '*', '+', '=', '|', '\\', '/', '?', '!']

    while (!this.isAtEnd() && (this.isAlphaNumeric(this.peek()) || allowed.includes(this.peek()))) {
      value += this.advance()
    }

    // Check if it's a known keyword
    const type = JPE_KEYWORDS[value] || TokenType.IDENTIFIER

    this.tokens.push({
      type,
      value,
      line: startLine,
      column: startColumn,
      start: this.pos - value.length,
      end: this.pos,
    } as Token)
  }

  // ─── Token Stream Validation ────────────────────────────────────

  /**
   * Validate the token stream for sequence errors
   * e.g., WHEN must be followed by LPAREN or IDENTIFIER
   */
  private validateTokenStream(): void {
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i]
      const validFollowers = VALID_SEQUENCES[token.type]

      if (!validFollowers) continue

      // Find the next significant token (skip whitespace/newlines/EOF)
      const nextToken = this.findNextSignificantToken(i)
      if (!nextToken) continue

      if (!validFollowers.has(nextToken.type)) {
        const expected = Array.from(validFollowers).map(t => this.tokenTypeToDisplay(t)).join(', ')
        this.addLexicalError(
          `Expected ${expected} after '${token.value}', but found '${nextToken.value}'`,
          nextToken.line,
          nextToken.column,
          `Insert a valid ${expected.toLowerCase()} here`
        )
      }
    }
  }

  private findNextSignificantToken(index: number): Token | null {
    for (let i = index + 1; i < this.tokens.length; i++) {
      const token = this.tokens[i]
      if (token.type === TokenType.EOF) return null
      // Skip newlines for sequence validation
      if (token.type === TokenType.LPAREN ||
          token.type === TokenType.RPAREN ||
          token.type === TokenType.LBRACE as any ||
          token.type === TokenType.RBRACE as any ||
          token.type === TokenType.COLON ||
          token.type === TokenType.COMMA ||
          token.type === TokenType.EQUALS ||
          token.type === TokenType.DASH ||
          token.type === TokenType.BOOLEAN ||
          token.type === TokenType.NUMBER ||
          token.type === TokenType.STRING ||
          token.type === TokenType.IDENTIFIER ||
          token.type === TokenType.WHEN ||
          token.type === TokenType.DO ||
          token.type === TokenType.ONLY_IF ||
          token.type === TokenType.CONDITIONS ||
          token.type === TokenType.LOCALIZATION ||
          token.type === TokenType.NAMESPACE) {
        return token
      }
    }
    return null
  }

  private tokenTypeToDisplay(type: TokenType): string {
    const display: Record<TokenType, string> = {
      [TokenType.WHEN]: '(',
      [TokenType.DO]: '{',
      [TokenType.ONLY_IF]: '(',
      [TokenType.CONDITIONS]: '{',
      [TokenType.LOCALIZATION]: '{',
      [TokenType.LPAREN]: '(',
      [TokenType.LBRACE]: '{',
      [TokenType.IDENTIFIER]: 'identifier',
      [TokenType.STRING]: 'string',
    } as any
    return display[type] || String(type)
  }

  // ─── Helpers ────────────────────────────────────────────────────

  private addToken(type: TokenType, value: string): void {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column - value.length,
      start: this.pos - value.length,
      end: this.pos,
    } as Token)
  }

  private addLexicalError(message: string, line: number, column: number, suggestion?: string): void {
    this.errors.push({
      message,
      line,
      column,
      endLine: line,
      endColumn: column + 1,
      suggestion,
    })
  }

  private advance(): string {
    const char = this.source[this.pos++]
    this.column++
    return char
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0'
    return this.source[this.pos]
  }

  private peekNext(): string {
    if (this.pos + 1 >= this.source.length) return '\0'
    return this.source[this.pos + 1]
  }

  private isAtEnd(): boolean {
    return this.pos >= this.source.length
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9'
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') ||
           (char >= 'A' && char <= 'Z') ||
           (char >= '\u00A0' && char <= '\u00FF') ||
           char === '_'
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char)
  }

  private isHexDigit(char: string): boolean {
    return (char >= '0' && char <= '9') ||
           (char >= 'a' && char <= 'f') ||
           (char >= 'A' && char <= 'F')
  }
}

/**
 * Convenience function to tokenize JPE source
 */
export function tokenizeJPE(source: string): Token[] {
  const tokenizer = new JPETokenizer(source)
  return tokenizer.tokenize()
}

/**
 * Convenience function to tokenize and validate JPE source
 */
export function tokenizeAndValidateJPE(source: string): TokenStreamResult {
  const tokenizer = new JPETokenizer(source)
  return tokenizer.tokenizeAndValidate()
}
