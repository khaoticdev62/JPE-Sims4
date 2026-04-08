import { JPELexer as JPELogicLexer } from '../services/translation/lexer'
import { JPELogicParser } from '../services/translation/parser'
import { JPETranslator } from '../services/translation/translator'

describe('JPE Nesting & Spike Tests', () => {
  const translator = new JPETranslator()

  it('should handle nested ONLY_IF blocks with specific variant mapping', () => {
    const jpe = `
NAMESPACE: com.test.nesting

WHEN Deep Logic:
  ONLY_IF:
  - trait:Trait_A
  - ONLY_IF:
    - trait:Trait_B
    - trait:Trait_C
`
    const lexer = new JPELogicLexer(jpe)
    const tokens = lexer.tokenize()
    const parser = new JPELogicParser(tokens)
    const program = parser.parse()
    const result = translator.translate(program)
    console.log('Generated Files:', Object.keys(result))

    const xml = result['com_test_nesting_Deep_Logic.Interaction.xml'] as string
    
    // Check for root test_globals
    expect(xml).toContain('<L n="test_globals">')
    
    // Check for nested ONLY_IF (translates to at_least_one variant in our spike)
    expect(xml).toContain('<V t="at_least_one">')
    expect(xml).toContain('<L n="at_least_one">')
    
    expect(xml).toContain('<V t="trait">')
    expect(xml).toContain('<T>Trait_A</T>')
    expect(xml).toContain('<T>Trait_B</T>')
    expect(xml).toContain('<T>Trait_C</T>')
  })

  it('should handle nested DO: blocks (aliased to basic_extras)', () => {
    const jpe = `
WHEN Nested Effects:
  DO:
  - loot:Loot_X
  - DO:
    - loot:Loot_Y
`
    const lexer = new JPELogicLexer(jpe)
    const tokens = lexer.tokenize()
    const parser = new JPELogicParser(tokens)
    const program = parser.parse()
    const result = translator.translate(program)

    const xml = result['Nested_Effects.Interaction.xml'] as string
    
    expect(xml).toContain('<L n="basic_extras">')
    expect(xml).toContain('<T>Loot_X</T>')
    expect(xml).toContain('<T>Loot_Y</T>')
    
    console.log('Current Nested DO Output:\n', xml)
  })
})
