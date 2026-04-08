import { Token, TokenType } from './types'

export class LexerError extends Error {
  constructor(
    public message: string, 
    public line: number, 
    public column: number,
    public endLine?: number,
    public endColumn?: number,
    public suggestion?: string
  ) {
    super(`${message} at line ${line}, column ${column}`)
    this.name = 'LexerError'
  }
}

export class JPELexer {
  private source: string[]
  private pos: number = 0
  private line: number = 1
  private column: number = 1
  private tokens: Token[] = []

  private static KEYWORDS: Record<string, TokenType> = {
    'WHEN': TokenType.WHEN,
    'DO': TokenType.DO,
    'ONLY_IF': TokenType.ONLY_IF,
    'CONDITIONS': TokenType.CONDITIONS,
    'LOCALIZATION': TokenType.LOCALIZATION,
    'NAMESPACE': TokenType.NAMESPACE,
    'true': TokenType.BOOLEAN,
    'false': TokenType.BOOLEAN,
  }

  constructor(source: string) {
    this.source = [...source]
  }

  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.scanToken()
    }
    
    this.addToken(TokenType.EOF, '')
    return this.tokens
  }

  private scanToken() {
    // Skip UTF-8 BOM if present at start of file
    if (this.pos === 0 && this.source[0] === '\uFEFF') {
      this.advance()
    }
    
    if (this.isAtEnd()) return
    const char = this.advance()

    switch (char) {
      case '(': this.addToken(TokenType.LPAREN, '('); break
      case ')': this.addToken(TokenType.RPAREN, ')'); break
      case ':': this.addToken(TokenType.COLON, ':'); break
      case ',': this.addToken(TokenType.COMMA, ','); break
      case '=': this.addToken(TokenType.EQUALS, '='); break
      case '-': 
        if (this.isAlphaNumeric(this.peek()) || ['_', '-', '&', '<', '>', '#', '@', '$', '%', '^', '*', '+', '=', '|', '\\', '/', '?', '!'].includes(this.peek())) {
          this.identifier()
        } else {
          this.addToken(TokenType.DASH, '-')
        }
        break
      
      case '#': {
        // Comment ONLY at absolute start of line
        if (this.column === 2) { // 2 because advance() already incremented column
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance()
        } else {
          // It's part of an identifier
          this.identifier()
        }
        break
      }

      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace
        break

      case '\n':
        this.line++
        this.column = 1
        break

      case '"': this.string(); break

      default:
        if (this.isDigit(char)) {
          this.number()
        } else if (this.isAlpha(char) || ['&', '<', '>', '#', '@', '$', '%', '^', '*', '+', '=', '|', '\\'].includes(char)) {
          this.identifier()
        } else {
        throw new LexerError(`Unexpected character: ${char}`, this.line, this.column - 1, this.line, this.column, `Remove the invalid character '${char}'`)
        }
        break
    }
  }

  private identifier() {
    let value = this.source[this.pos - 1]
    const allowed = ['_', '.', '-', '&', '<', '>', '#', '@', '$', '%', '^', '*', '+', '=', '|', '\\', '/', '?', '!']
    while (this.isAlphaNumeric(this.peek()) || allowed.includes(this.peek())) {
      value += this.advance()
    }


    const type = JPELexer.KEYWORDS[value] || TokenType.IDENTIFIER
    this.addToken(type, value)
  }

  private number() {
    let value = this.source[this.pos - 1]
    
    // Support hex (0x...)
    if (value === '0' && (this.peek() === 'x' || this.peek() === 'X')) {
      value += this.advance() // consume 'x'
      while (this.isHexDigit(this.peek())) {
        value += this.advance()
      }
      this.addToken(TokenType.NUMBER, value)
      return
    }

    while (this.isDigit(this.peek())) {
      value += this.advance()
    }

    // Support decimals
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance() // Consume '.'
      while (this.isDigit(this.peek())) {
        value += this.advance()
      }
    }

    this.addToken(TokenType.NUMBER, value)
  }

  private string() {
    const startLine = this.line
    const startColumn = this.column - 1
    let value = ''

    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\\') {
        this.advance() // Consume \
        if (this.isAtEnd()) break
        value += this.advance()
        continue
      }
      
      const nextChar = this.peek()
      if (nextChar === '\n') {
        this.line++
        this.column = 1
      }
      value += this.advance()
    }

    if (this.isAtEnd()) {
      throw new LexerError('Unterminated string.', startLine, startColumn, this.line, this.column, 'Close the string with a dbl-quote (")')
    }

    this.advance() // Consume closing "
    this.addToken(TokenType.STRING, value, startLine, startColumn)
  }

  private addToken(type: TokenType, value: string, line?: number, column?: number) {
    const end = this.pos
    const start = end - value.length - (type === TokenType.STRING ? 2 : 0) // Adjust for quotes
    
    this.tokens.push({
      type,
      value,
      line: line ?? this.line,
      column: column ?? (this.column - value.length),
      start,
      end
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
    // Basic a-z, A-Z, _ and common accented characters (é, ü, etc.)
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
