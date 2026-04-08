import { JPELexer } from '../services/translation/lexer'
import { JPELogicParser } from '../services/translation/parser'
import { JPETranslator } from '../services/translation/translator'

describe('JPE-to-XML Translation Flow', () => {
  const translate = (source: string) => {
    const lexer = new JPELexer(source)
    const tokens = lexer.tokenize()
    const parser = new JPELogicParser(tokens)
    const ast = parser.parse()
    const translator = new JPETranslator()
    return translator.translate(ast)
  }

  it('should translate a simple interaction with namespace', () => {
    const source = `
      NAMESPACE: com.my.mod
      WHEN My Awesome Interaction:
        class: SocialSuperInteraction
    `
    const files = translate(source)
    const filename = 'com_my_mod_My_Awesome_Interaction.Interaction.xml'
    
    expect(files[filename]).toBeDefined()
    expect(files[filename]).toContain('<I c="SocialSuperInteraction"')
    expect(files[filename]).toContain('n="My Awesome Interaction"')
    // Instance ID should be fnv64("com.my.mod:my awesome interaction")
    // Let's check if it's a 19+ digit number (64-bit decimal)
    expect(files[filename]).toMatch(/s="\d{18,20}"/)
  })

  it('should translate tests (ONLY_IF)', () => {
    const source = `
      WHEN Test Interaction:
        tests:
          - is adult
          - trait:Trait_Awesome
    `
    const files = translate(source)
    const xml = Object.values(files)[0]
    
    expect(xml).toContain('<L n="test_globals">')
    expect(xml).toContain('<E>ADULT</E>')
    expect(xml).toContain('<T>Trait_Awesome</T>')
    expect(xml).toContain('<V t="trait">')
  })

  it('should translate effects (DO)', () => {
    const source = `
      WHEN Effect Interaction:
        effects:
          - loot:Loot_Happy
    `
    const files = translate(source)
    const xml = Object.values(files)[0]
    
    expect(xml).toContain('<L n="basic_extras">')
    expect(xml).toContain('<T>Loot_Happy</T>')
    expect(xml).toContain('<V t="loot">')
  })

  it('should handle unknown constructs as comments', () => {
    const source = `
      WHEN Mystery Interaction:
        tests:
          - unknown_condition:mystery_value
    `
    const files = translate(source)
    const xml = Object.values(files)[0]
    
    expect(xml).toContain('<!-- Unknown test: unknown_condition :mystery_value -->')
  })
})
