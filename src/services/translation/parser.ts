import { Token, TokenType, AstNodeType, ProgramNode, InteractionNode, PropertyNode, BlockNode, LiteralNode, TestNode, ActionNode, LocalizationNode, LocalizationEntryNode } from './types'

export class ParserError extends Error {
  constructor(
    public message: string, 
    public line: number, 
    public column: number,
    public endLine?: number,
    public endColumn?: number
  ) {
    super(`${message} at line ${line}, column ${column}`)
    this.name = 'ParserError'
  }
}

export class JPELogicParser {
  private tokens: Token[]
  private current: number = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): ProgramNode {
    const program: ProgramNode = {
      type: AstNodeType.PROGRAM,
      children: [],
      line: 1,
      column: 1
    }
    
    // First pass: Resolve NAMESPACE if it exists anywhere to avoid dependency on order
    const initialPos = this.current
    while (!this.isAtEnd()) {
      if (this.match(TokenType.NAMESPACE)) {
        this.consume(TokenType.COLON, "Expect ':' after NAMESPACE.")
        let ns = this.consume(TokenType.IDENTIFIER, "Expect namespace identifier.").value
        // Handle multi-part namespaces
        while (this.check(TokenType.IDENTIFIER) || this.match(TokenType.COMMA) || this.check(TokenType.DASH)) {
          if (this.previous().type === TokenType.COMMA) {
            ns += '.' + this.consume(TokenType.IDENTIFIER, "Expect identifier after comma in namespace.").value
          } else if (this.match(TokenType.DASH)) {
             ns += '-' + this.consume(TokenType.IDENTIFIER, "Expect identifier after dash in namespace.").value
          } else {
            ns += this.advance().value
          }
        }
        program.namespace = ns
        break
      }
      this.advance()
    }
    this.current = initialPos

    while (!this.isAtEnd()) {
      if (this.check(TokenType.NAMESPACE)) {
        // Skip namespace in second pass as it's already resolved
        this.advance()
        this.consume(TokenType.COLON, "Expect ':' after NAMESPACE.")
        // Consume the tokens that were part of the namespace
        while (this.check(TokenType.IDENTIFIER) || this.match(TokenType.COMMA) || this.check(TokenType.DASH)) {
           this.advance()
        }
      } else if (this.match(TokenType.LOCALIZATION)) {
        program.localization = this.localization()
      } else if (this.match(TokenType.EOF)) {
        break
      } else {
        const interaction = this.interaction()
        if (interaction) {
          program.children.push(interaction)
        } else {
          this.advance()
        }
      }
    }

    return program
  }

  private interaction(): InteractionNode | null {
    // Optional WHEN keyword
    const hasWhen = this.match(TokenType.WHEN)
    
    let name = ''
    const startToken = this.peek()

    while (!this.isAtEnd() && !this.check(TokenType.COLON) && !this.isKeyword(this.peek().type) && !this.check(TokenType.DASH)) {
      const token = this.advance()
      if (name && token.start > this.tokens[this.current - 2].end) {
        name += ' '
      }
      name += token.value
    }
    
    // Consume the colon after the name
    this.consume(TokenType.COLON, "Expect ':' after interaction name.")

    
    if (!name) {
      if (hasWhen) throw new ParserError(`Expect interaction name after 'WHEN'`, startToken.line, startToken.column, startToken.line, startToken.column + (hasWhen ? 4 : 0))
      return null
    }

    // Prohibit Keywords as Names (Story 3.1 Review Fix)
    if (this.isKeyword(this.tokens[this.current - 1].type)) {
      const token = this.tokens[this.current - 1]
      throw new ParserError(`Reserved keyword '${token.value}' cannot be used as an interaction name.`, token.line, token.column, token.line, token.column + token.value.length)
    }

    let className: string | undefined
    let instanceId: string | undefined
    const properties: (PropertyNode | BlockNode)[] = []

    while (this.isPropertyAhead()) {
      const prop = this.property()
      if (prop) {
        if (prop.type === AstNodeType.PROPERTY && prop.name === 'class') {
          className = (prop.value as LiteralNode).value.toString()
        } else if (prop.type === AstNodeType.PROPERTY && prop.name === 'id') {
          instanceId = (prop.value as LiteralNode).value.toString()
        } else {
          properties.push(prop)
        }
      }
    }

    return {
      type: AstNodeType.INTERACTION,
      name,
      className,
      instanceId,
      properties,
      line: startToken.line,
      column: startToken.column
    }
  }

  private property(): PropertyNode | BlockNode | null {
    const next = this.peek()
    let nameToken: Token
    
    if (this.isKeyword(next.type)) {
      nameToken = this.advance()
    } else {
      nameToken = this.consume(TokenType.IDENTIFIER, "Expect property name.")
    }
    
    this.consume(TokenType.COLON, "Expect ':' after property name.")

    // Check if it's a block (starts with DASH or newline + indentation)
    if (this.peek().type === TokenType.DASH) {
      const children = this.blockContent(nameToken.value)
      return {
        type: AstNodeType.BLOCK,
        name: nameToken.value,
        children,
        line: nameToken.line,
        column: nameToken.column
      }
    }

    // Literals
    const value = this.literal()
    return {
      type: AstNodeType.PROPERTY,
      name: nameToken.value,
      value,
      line: nameToken.line,
      column: nameToken.column
    }
  }

  private blockContent(blockName: string): (TestNode | ActionNode | PropertyNode | BlockNode)[] {
    const children: (TestNode | ActionNode | PropertyNode | BlockNode)[] = []
    
    while (this.match(TokenType.DASH)) {
      const isNestedBlock = this.isKeyword(this.peek().type) && this.peekNext().type === TokenType.COLON
      
      if (isNestedBlock) {
        const propOrBlock = this.property()
        if (propOrBlock) children.push(propOrBlock)
      } else if (blockName === 'tests' || blockName === 'ONLY_IF' || blockName === 'CONDITIONS' || blockName === 'WHEN') {
        children.push(this.test())
      } else if (blockName === 'effects' || blockName === 'DO') {
        children.push(this.action())
      } else {
        // Generic property list (fallback)
        const propOrBlock = this.property()
        if (propOrBlock) children.push(propOrBlock)
      }
    }
    
    return children
  }

  private test(): TestNode {
    const startToken = this.peek()
    let condition = ''
    const tokens: string[] = []
    
    while (!this.isAtEnd() && !this.check(TokenType.DASH) && !this.isKeyword(this.peek().type) && !(condition && this.isPropertyAhead())) {
      const token = this.advance()
      condition += (condition ? ' ' : '') + token.value
      tokens.push(token.value)
    }
    
    // Auto-extract params: trait:Trait_X -> condition: "trait", params: ["Trait_X"]
    let finalCondition = condition
    let params: string[] | undefined
    
    if (condition.includes(':')) {
      const parts = condition.split(':').map(p => p.trim())
      finalCondition = parts[0]
      params = parts.slice(1)
    }
    
    return {
      type: AstNodeType.TEST,
      condition: finalCondition,
      params,
      line: startToken.line,
      column: startToken.column
    }
  }

  private localization(): LocalizationNode {
    const startToken = this.previous()
    this.consume(TokenType.COLON, "Expect ':' after LOCALIZATION.")
    
    const entries: LocalizationEntryNode[] = []
    const seenLocales = new Set<string>()
    
    // Parsing locale: "string" or locale: string
    while (this.isPropertyAhead()) {
      const localeToken = this.consume(TokenType.IDENTIFIER, "Expect locale identifier.")
      const localeUpper = localeToken.value.toUpperCase()
      
      if (seenLocales.has(localeUpper)) {
        throw new Error(`Duplicate localization entry for locale '${localeToken.value}' at line ${localeToken.line}.`)
      }
      seenLocales.add(localeUpper)

      this.consume(TokenType.COLON, `Expect ':' after locale '${localeToken.value}' at line ${localeToken.line}.`)
      
      // Support both STRING and IDENTIFIER (for unquoted strings)
      let text = ''
      const textStartToken = this.peek()
      
      if (this.match(TokenType.STRING)) {
        text = this.previous().value
      } else {
        // Simple unquoted string until end of line
        while (!this.isAtEnd() && !this.check(TokenType.IDENTIFIER) && !this.isKeyword(this.peek().type)) {
          text += (text ? ' ' : '') + this.advance().value
        }
      }

      if (!text && !this.isAtEnd()) {
        throw new Error(`Empty text for locale '${localeToken.value}' at line ${textStartToken.line}.`)
      }

      entries.push({
        type: AstNodeType.LOCALIZATION_ENTRY,
        locale: localeToken.value,
        text,
        line: localeToken.line,
        column: localeToken.column
      })
    }
    
    return {
      type: AstNodeType.LOCALIZATION,
      entries,
      line: startToken.line,
      column: startToken.column
    }
  }

  private action(): ActionNode {
    const startToken = this.peek()
    let action = ''
    
    while (!this.isAtEnd() && !this.check(TokenType.DASH) && !this.isKeyword(this.peek().type) && !(action && this.isPropertyAhead())) {
      action += (action ? ' ' : '') + this.advance().value
    }

    let finalAction = action
    let params: string[] | undefined
    
    if (action.includes(':')) {
      const parts = action.split(':').map(p => p.trim())
      finalAction = parts[0]
      params = parts.slice(1)
    }
    
    return {
      type: AstNodeType.ACTION,
      action: finalAction,
      params,
      line: startToken.line,
      column: startToken.column
    }
  }


  private literal(): LiteralNode {
    const token = this.peek()
    let value: string | number | boolean = ''
    const startToken = token

    if (this.match(TokenType.STRING)) {
      value = this.previous().value
    } else if (this.match(TokenType.NUMBER)) {
      const raw = this.previous().value
      if (raw.toLowerCase().startsWith('0x')) {
        value = raw // Keep hex as string to preserve precision
      } else {
        const val = parseFloat(raw)
        // Keep large integers as strings for 64-bit precision (Sims 4 IDs)
        if (raw.indexOf('.') === -1 && !raw.toLowerCase().includes('e') && (val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER)) {
           value = raw
        } else {
           value = val
        }
      }
    } else if (this.match(TokenType.BOOLEAN)) {
      value = this.previous().value === 'true'
    } else {
      // Unquoted string: consume until keywords, dashes, or colon-preceded-identifiers
      let text = ''
      while (!this.isAtEnd() && !this.check(TokenType.DASH) && !this.isKeyword(this.peek().type) && !(text && this.isPropertyAhead())) {
        const token = this.advance()
        if (text && token.start > this.tokens[this.current - 2].end) {
          text += ' '
        }
        text += token.value
      }
      value = text
    }

    return {
      type: AstNodeType.LITERAL,
      value,
      line: startToken.line,
      column: startToken.column
    }
  }

  // --- Helpers ---

  private isPropertyAhead(): boolean {
    // A property is an IDENTIFIER or KEYWORD followed by a COLON
    const next = this.peek()
    return (next.type === TokenType.IDENTIFIER || this.isKeyword(next.type)) && 
           this.peekNext().type === TokenType.COLON
  }

  private isKeyword(type: TokenType): boolean {
    return [TokenType.WHEN, TokenType.DO, TokenType.ONLY_IF, TokenType.CONDITIONS, TokenType.NAMESPACE, TokenType.LOCALIZATION].includes(type)
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }
    return false
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance()
    const token = this.peek()
    throw new ParserError(message, token.line, token.column, token.line, token.column + token.value.length)
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false
    return this.peek().type === type
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++
    return this.previous()
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF
  }

  private peek(): Token {
    return this.tokens[this.current]
  }

  private peekNext(): Token {
    if (this.current + 1 >= this.tokens.length) return this.tokens[this.tokens.length - 1]
    return this.tokens[this.current + 1]
  }

  private previous(): Token {
    return this.tokens[this.current - 1]
  }
}
