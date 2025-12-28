/**
 * JPE Language Lexer
 *
 * Tokenizes JPE source code into a stream of tokens.
 * The lexer (lexical analyzer) breaks the input into meaningful units.
 *
 * Process:
 * Input: "[Metadata]\\ntype = \\"tuning\\"\\n"
 * Output: [SECTION_OPEN, IDENTIFIER, SECTION_CLOSE, NEWLINE, IDENTIFIER, EQUALS, STRING, ...]
 *
 * The lexer tracks line and column numbers for diagnostics.
 */

import { Token, TokenType, TokenPatterns, createToken } from './tokens'

/**
 * JPE Lexer - Converts source text to token stream
 *
 * Usage:
 * ```
 * const lexer = new JPELexer(sourceCode)
 * const tokens = lexer.tokenize()
 * ```
 */
export class JPELexer {
  private input: string
  private position: number = 0
  private line: number = 1
  private column: number = 1
  private tokens: Token[] = []

  constructor(input: string) {
    this.input = input
  }

  /**
   * Tokenize the entire input
   * Returns array of tokens including EOF token
   */
  public tokenize(): Token[] {
    this.tokens = []
    this.position = 0
    this.line = 1
    this.column = 1

    while (!this.isAtEnd()) {
      this.skipWhitespaceExceptNewline()

      if (this.isAtEnd()) break

      const char = this.peek()

      // Handle newline specially (we include it in tokens for formatting)
      if (char === '\n') {
        const newlineChar = this.advance()
        this.line++
        this.column = 1
        this.addToken(TokenType.NEWLINE, newlineChar)
        continue
      }

      // Single-character tokens
      if (char === '[') {
        this.addToken(TokenType.SECTION_OPEN, this.advance())
        continue
      }

      if (char === ']') {
        this.addToken(TokenType.SECTION_CLOSE, this.advance())
        continue
      }

      if (char === '=') {
        this.addToken(TokenType.EQUALS, this.advance())
        continue
      }

      if (char === '.') {
        this.addToken(TokenType.DOT, this.advance())
        continue
      }

      // Comments
      if (char === '#') {
        this.scanComment()
        continue
      }

      // Strings (double-quoted)
      if (char === '"') {
        this.scanString()
        continue
      }

      // Strings (single-quoted)
      if (char === "'") {
        this.scanSingleQuotedString()
        continue
      }

      // Numbers or other tokens starting with digit
      if (this.isDigit(char) || (char === '-' && this.isDigit(this.peekNext()))) {
        this.scanNumber()
        continue
      }

      // Identifiers, booleans, references
      if (this.isAlpha(char) || char === '_') {
        this.scanIdentifierOrKeyword()
        continue
      }

      // Unknown character
      this.addToken(TokenType.UNKNOWN, this.advance())
    }

    // Add EOF token
    this.tokens.push(createToken(TokenType.EOF, '', this.line, this.column))

    return this.tokens
  }

  /**
   * Scan a comment (from # to end of line)
   */
  private scanComment(): void {
    const startColumn = this.column
    const startChar = this.advance() // consume #

    let value = startChar
    while (!this.isAtEnd() && this.peek() !== '\n') {
      value += this.advance()
    }

    this.addTokenWithColumn(TokenType.COMMENT, value, startColumn)
  }

  /**
   * Scan a double-quoted string
   * Supports escape sequences: \n, \t, \r, \\, \"
   */
  private scanString(): void {
    const startColumn = this.column
    const openQuote = this.advance() // consume opening "

    let value = openQuote
    let escaped = false

    while (!this.isAtEnd()) {
      const char = this.peek()

      if (escaped) {
        value += this.advance()
        escaped = false
        continue
      }

      if (char === '\\') {
        escaped = true
        value += this.advance()
        continue
      }

      if (char === '"') {
        value += this.advance() // closing "
        break
      }

      if (char === '\n') {
        this.line++
        this.column = 0
      }

      value += this.advance()
    }

    this.addTokenWithColumn(TokenType.STRING, value, startColumn)
  }

  /**
   * Scan a single-quoted string
   */
  private scanSingleQuotedString(): void {
    const startColumn = this.column
    const openQuote = this.advance() // consume opening '

    let value = openQuote
    let escaped = false

    while (!this.isAtEnd()) {
      const char = this.peek()

      if (escaped) {
        value += this.advance()
        escaped = false
        continue
      }

      if (char === '\\') {
        escaped = true
        value += this.advance()
        continue
      }

      if (char === "'") {
        value += this.advance() // closing '
        break
      }

      if (char === '\n') {
        this.line++
        this.column = 0
      }

      value += this.advance()
    }

    this.addTokenWithColumn(TokenType.STRING, value, startColumn)
  }

  /**
   * Scan a number (integer or decimal)
   */
  private scanNumber(): void {
    const startColumn = this.column
    let value = ''

    // Handle negative sign
    if (this.peek() === '-') {
      value += this.advance()
    }

    // Integer part
    while (this.isDigit(this.peek())) {
      value += this.advance()
    }

    // Decimal part
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance() // .
      while (this.isDigit(this.peek())) {
        value += this.advance()
      }
    }

    this.addTokenWithColumn(TokenType.NUMBER, value, startColumn)
  }

  /**
   * Scan identifier, keyword, or reference
   * Could be: identifier, boolean (true/false), or ref:identifier
   */
  private scanIdentifierOrKeyword(): void {
    const startColumn = this.column
    let value = ''

    while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
      value += this.advance()
    }

    // Check for reference (ref:identifier)
    if (value === 'ref' && this.peek() === ':') {
      value += this.advance() // :
      while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') {
        value += this.advance()
      }
      this.addTokenWithColumn(TokenType.REFERENCE, value, startColumn)
      return
    }

    // Check for boolean
    if (value === 'true' || value === 'false') {
      this.addTokenWithColumn(TokenType.BOOLEAN, value, startColumn)
      return
    }

    // Regular identifier
    this.addTokenWithColumn(TokenType.IDENTIFIER, value, startColumn)
  }

  /**
   * Skip spaces and tabs (but not newlines)
   */
  private skipWhitespaceExceptNewline(): void {
    while (!this.isAtEnd()) {
      const char = this.peek()
      if (char === ' ' || char === '\t') {
        this.advance()
      } else {
        break
      }
    }
  }

  /**
   * Helper: are we at end of input?
   */
  private isAtEnd(): boolean {
    return this.position >= this.input.length
  }

  /**
   * Helper: peek current character without consuming
   */
  private peek(): string {
    if (this.isAtEnd()) return '\0'
    return this.input[this.position]
  }

  /**
   * Helper: peek next character
   */
  private peekNext(): string {
    if (this.position + 1 >= this.input.length) return '\0'
    return this.input[this.position + 1]
  }

  /**
   * Helper: consume and return current character
   */
  private advance(): string {
    const char = this.input[this.position++]
    this.column++
    return char
  }

  /**
   * Helper: check if character is digit
   */
  private isDigit(char: string): boolean {
    return /[0-9]/.test(char)
  }

  /**
   * Helper: check if character is alpha
   */
  private isAlpha(char: string): boolean {
    return /[a-zA-Z]/.test(char)
  }

  /**
   * Helper: check if character is alphanumeric
   */
  private isAlphaNumeric(char: string): boolean {
    return /[a-zA-Z0-9]/.test(char)
  }

  /**
   * Helper: add token with current position
   */
  private addToken(type: TokenType, value: string): void {
    this.addTokenWithColumn(type, value, this.column - value.length)
  }

  /**
   * Helper: add token with specific column
   */
  private addTokenWithColumn(type: TokenType, value: string, column: number): void {
    const token = createToken(type, value, this.line, column)
    this.tokens.push(token)
  }
}

/**
 * Quick helper function to tokenize JPE code
 *
 * Usage:
 * ```
 * const tokens = tokenize("[Metadata]\\ntype = \\"tuning\\"")
 * ```
 */
export function tokenize(input: string): Token[] {
  const lexer = new JPELexer(input)
  return lexer.tokenize()
}
