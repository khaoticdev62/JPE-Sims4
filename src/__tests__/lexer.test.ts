import { JPELexer } from '../services/translation/lexer'
import { TokenType } from '../services/translation/types'

describe('JPELexer', () => {
  it('should tokenize simple keywords', () => {
    const lexer = new JPELexer('WHEN DO ONLY_IF')
    const tokens = lexer.tokenize()
    
    expect(tokens[0].type).toBe(TokenType.WHEN)
    expect(tokens[1].type).toBe(TokenType.DO)
    expect(tokens[2].type).toBe(TokenType.ONLY_IF)
    expect(tokens[3].type).toBe(TokenType.EOF)
  })

  it('should tokenize identifiers and strings', () => {
    const lexer = new JPELexer('interaction "My Interaction" com.my.mod')
    const tokens = lexer.tokenize()
    
    expect(tokens[0].type).toBe(TokenType.IDENTIFIER)
    expect(tokens[0].value).toBe('interaction')
    expect(tokens[1].type).toBe(TokenType.STRING)
    expect(tokens[1].value).toBe('My Interaction')
    expect(tokens[2].type).toBe(TokenType.IDENTIFIER)
    expect(tokens[2].value).toBe('com.my.mod')
  })


  it('should tokenize numbers and booleans', () => {
    const lexer = new JPELexer('123 45.67 true false')
    const tokens = lexer.tokenize()
    
    expect(tokens[0].type).toBe(TokenType.NUMBER)
    expect(tokens[0].value).toBe('123')
    expect(tokens[1].type).toBe(TokenType.NUMBER)
    expect(tokens[1].value).toBe('45.67')
    expect(tokens[2].type).toBe(TokenType.BOOLEAN)
    expect(tokens[2].value).toBe('true')
    expect(tokens[3].type).toBe(TokenType.BOOLEAN)
    expect(tokens[3].value).toBe('false')
  })

  it('should handle comments', () => {
    const lexer = new JPELexer('# This is a comment\nWHEN\nDO')
    const tokens = lexer.tokenize()
    
    expect(tokens.length).toBe(3) // WHEN, DO, EOF
    expect(tokens[0].type).toBe(TokenType.WHEN)
    expect(tokens[1].type).toBe(TokenType.DO)
  })

  it('should track line and column correctly', () => {
    const lexer = new JPELexer('WHEN\n  DO')
    const tokens = lexer.tokenize()
    
    expect(tokens[0].line).toBe(1)
    expect(tokens[0].column).toBe(1)
    
    expect(tokens[1].line).toBe(2)
    expect(tokens[1].column).toBe(3)
  })

  it('should handle complex snippets', () => {
    const source = `
      WHEN SIM_HAS_BUFF("Buff_Energy")
      ONLY_IF CONDITIONS:
        HAS_TRAIT("Trait_Active")
      DO
        LOCALIZATION: "EN" "Success!"
    `
    const lexer = new JPELexer(source)
    const tokens = lexer.tokenize()
    
    const types = tokens.map(t => t.type)
    expect(types).toContain(TokenType.WHEN)
    expect(types).toContain(TokenType.ONLY_IF)
    expect(types).toContain(TokenType.CONDITIONS)
    expect(types).toContain(TokenType.COLON)
    expect(types).toContain(TokenType.DO)
    expect(types).toContain(TokenType.LOCALIZATION)
  })

  it('should report errors for unterminated strings', () => {
    const lexer = new JPELexer('"Unterminated')
    const tokens = lexer.tokenize()
    
    expect(tokens[0].type).toBe(TokenType.ERROR)
    expect(tokens[0].value).toBe('Unterminated string.')
  })
})
