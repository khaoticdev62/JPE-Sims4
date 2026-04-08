/**
 * JPE Language Parser
 *
 * Parses a stream of tokens into an Abstract Syntax Tree (AST).
 * The parser implements recursive descent parsing based on the JPE grammar.
 *
 * Process:
 * Input tokens: [SECTION_OPEN, IDENTIFIER, SECTION_CLOSE, ...]
 * Output AST:
 * {
 *   type: 'Document',
 *   children: [
 *     { type: 'Section', name: 'Metadata', children: [...] }
 *   ]
 * }
 *
 * The parser performs syntax checking and reports errors with line/column info.
 */

import { Token, TokenType } from './tokens'

/**
 * AST Node represents a construct in the JPE language
 */
export interface ASTNode {
  type:
    | 'Document'
    | 'Section'
    | 'Assignment'
    | 'Value'
    | 'Reference'
    | 'Comment'
    | 'Error'
  name?: string // For sections
  key?: string // For assignments
  value?: any // For assignments
  children?: ASTNode[]
  metadata?: Record<string, any>
}

/**
 * Parser error with location information
 */
export interface ParserError {
  message: string
  line: number
  column: number
  tokenType?: TokenType
  expected?: string
}

/**
 * JPE Parser - Converts token stream to AST
 *
 * Implements recursive descent parsing.
 * Grammar rules are expressed as methods.
 *
 * Usage:
 * ```
 * const parser = new JPEParser(tokens)
 * const ast = parser.parse()
 * ```
 */
export class JPEParser {
  private tokens: Token[]
  private current: number = 0
  private errors: ParserError[] = []

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  /**
   * Parse the token stream into an AST
   * Grammar: Document = Section*
   */
  public parse(): ASTNode {
    const sections: ASTNode[] = []

    // Skip initial newlines and comments
    this.skipNonContent()

    while (!this.isAtEnd()) {
      const token = this.peek()

      if (token.type === TokenType.SECTION_OPEN) {
        // Parse a Full Section: [Header]
        const section = this.parseSection()
        if (section) {
          sections.push(section)
        }
      } else {
        // Handle standalone assignments, comments, or blank lines
        const line = this.parseLine()
        if (line) {
          sections.push(line)
        }
      }

      this.skipNonContent()
    }

    return {
      type: 'Document',
      children: sections,
      metadata: {
        errors: this.errors,
        hasErrors: this.errors.length > 0,
      },
    }
  }

  /**
   * Parse a section
   * Grammar: Section = SectionHeader Line*
   */
  private parseSection(): ASTNode | null {
    if (this.peek().type !== TokenType.SECTION_OPEN) {
      return null
    }

    this.advance() // consume [

    const nameToken = this.peek()
    if (nameToken.type !== TokenType.IDENTIFIER) {
      this.addError('Expected section name', nameToken)
      return null
    }

    const name = nameToken.value
    this.advance()

    if (this.peek().type !== TokenType.SECTION_CLOSE) {
      this.addError('Expected ]', this.peek())
      return null
    }

    this.advance() // consume ]

    const children: ASTNode[] = []

    // Consume newline after section header
    this.skipNewlines()

    // Parse section content until next section or EOF
    while (!this.isAtEnd() && this.peek().type !== TokenType.SECTION_OPEN) {
      // Skip just newlines here, not comments
      this.skipNewlines()

      if (this.isAtEnd() || this.peek().type === TokenType.SECTION_OPEN) {
        break
      }

      const line = this.parseLine()
      if (line) {
        children.push(line)
      }
    }

    return {
      type: 'Section',
      name,
      children,
      metadata: { line: nameToken.line },
    }
  }

  /**
   * Parse a line (assignment or comment)
   * Grammar: Line = Assignment | Comment | BlankLine
   */
  private parseLine(): ASTNode | null {
    const token = this.peek()

    // Handle blank lines
    if (token.type === TokenType.NEWLINE) {
      this.advance()
      return null
    }

    // Handle comments
    if (token.type === TokenType.COMMENT) {
      const comment = this.advance()
      // Don't skip newlines here - let outer loop handle them
      return {
        type: 'Comment',
        value: comment.value,
        metadata: { line: comment.line },
      }
    }

    // Try to parse assignment
    const assignment = this.parseAssignment()

    // Consume trailing newline
    this.skipNewlines()

    return assignment
  }

  /**
   * Parse an assignment
   * Grammar: Assignment = Key "=" Value
   */
  private parseAssignment(): ASTNode | null {
    const startToken = this.peek()

    if (startToken.type !== TokenType.IDENTIFIER) {
      return null
    }

    const key = this.parseKey()

    if (this.peek().type !== TokenType.EQUALS) {
      // Only error if we're expecting this to be an assignment
      // (i.e., we successfully parsed a key)
      if (key) {
        this.addError('Expected = after key', this.peek())
      }
      return null
    }

    this.advance() // consume =

    const value = this.parseValue()

    return {
      type: 'Assignment',
      key,
      value,
      metadata: { line: startToken.line },
    }
  }

  /**
   * Parse a key (can be nested with dots)
   * Grammar: Key = Identifier ("." Identifier)*
   */
  private parseKey(): string {
    const parts: string[] = []

    const firstToken = this.peek()
    if (firstToken.type !== TokenType.IDENTIFIER) {
      this.addError('Expected identifier for key', firstToken)
      return ''
    }

    parts.push(this.advance().value)

    while (this.peek().type === TokenType.DOT) {
      this.advance() // consume .

      if (this.peek().type !== TokenType.IDENTIFIER) {
        this.addError('Expected identifier after dot', this.peek())
        break
      }

      parts.push(this.advance().value)
    }

    return parts.join('.')
  }

  /**
   * Parse a value
   * Grammar: Value = String | Number | Boolean | Reference
   */
  private parseValue(): any {
    const token = this.peek()

    switch (token.type) {
      case TokenType.STRING: {
        const value = this.advance().value
        // Remove quotes and process escape sequences
        return this.unquoteString(value)
      }

      case TokenType.NUMBER: {
        const value = this.advance().value
        return parseFloat(value)
      }

      case TokenType.BOOLEAN: {
        const value = this.advance().value
        return value.toLowerCase() === 'true'
      }

      case TokenType.REFERENCE: {
        const value = this.advance().value
        // Extract ID from "ref:SomeId"
        const id = value.substring(4) // Remove "ref:"
        return { type: 'Reference', id }
      }

      default: {
        this.addError('Expected value (string, number, boolean, or reference)', token)
        this.advance() // Skip unknown token
        return null
      }
    }
  }

  /**
   * Helper: Skip newlines and comments
   */
  private skipNonContent(): void {
    while (!this.isAtEnd()) {
      const token = this.peek()
      if (token.type === TokenType.NEWLINE || token.type === TokenType.COMMENT) {
        this.advance()
      } else {
        break
      }
    }
  }

  /**
   * Helper: Skip only newlines
   */
  private skipNewlines(): void {
    while (!this.isAtEnd() && this.peek().type === TokenType.NEWLINE) {
      this.advance()
    }
  }

  /**
   * Helper: Are we at end of tokens?
   */
  private isAtEnd(): boolean {
    return this.current >= this.tokens.length || this.peek().type === TokenType.EOF
  }

  /**
   * Helper: Peek current token
   */
  private peek(): Token {
    if (this.current >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1] // Return EOF
    }
    return this.tokens[this.current]
  }

  /**
   * Helper: Peek next token
   */
  private peekNext(): Token {
    if (this.current + 1 >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1] // Return EOF
    }
    return this.tokens[this.current + 1]
  }

  /**
   * Helper: Consume and return current token
   */
  private advance(): Token {
    const token = this.peek()
    if (!this.isAtEnd()) {
      this.current++
    }
    return token
  }

  /**
   * Helper: Record a parser error
   */
  private addError(message: string, token: Token): void {
    this.errors.push({
      message,
      line: token.line,
      column: token.column,
      tokenType: token.type,
    })
  }

  /**
   * Helper: Remove quotes and process escape sequences
   */
  private unquoteString(quoted: string): string {
    // Remove outer quotes
    let unquoted = quoted
    if ((unquoted.startsWith('"') && unquoted.endsWith('"')) ||
        (unquoted.startsWith("'") && unquoted.endsWith("'"))) {
      unquoted = unquoted.slice(1, -1)
    }

    // Process escape sequences
    const escaped = unquoted
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")

    return escaped
  }

  /**
   * Get any parser errors
   */
  public getErrors(): ParserError[] {
    return this.errors
  }

  /**
   * Check if parsing was successful
   */
  public isValid(): boolean {
    return this.errors.length === 0
  }
}

/**
 * Quick helper function to parse JPE code
 *
 * Usage:
 * ```
 * const ast = parse(tokens)
 * ```
 */
export function parse(tokens: Token[]): ASTNode {
  const parser = new JPEParser(tokens)
  return parser.parse()
}
