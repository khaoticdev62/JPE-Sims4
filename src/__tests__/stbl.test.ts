import { JPELexer } from '../services/translation/lexer'
import { JPELogicParser } from '../services/translation/parser'
import { JPETranslator } from '../services/translation/translator'
import { STBLService } from '../services/translation/stbl'

describe('Story 2.3: STBL Parser & Translation', () => {
  const jpeSource = `
NAMESPACE: com.test.mod

LOCALIZATION:
  EN: "The Big Interaction"
  FR: "La Grande Interaction"

WHEN Sit Down:
  display_name: "The Big Interaction"
  priority: 10
`

  it('should parse LOCALIZATION block correctly', () => {
    const lexer = new JPELexer(jpeSource)
    const tokens = lexer.tokenize()
    const parser = new JPELogicParser(tokens)
    const program = parser.parse()

    expect(program.localization).toBeDefined()
    expect(program.localization?.entries).toHaveLength(2)
    expect(program.localization?.entries[0].locale).toBe('EN')
    expect(program.localization?.entries[0].text).toBe('The Big Interaction')
  })

  it('should generate binary STBL files', () => {
    const lexer = new JPELexer(jpeSource)
    const tokens = lexer.tokenize()
    const parser = new JPELogicParser(tokens)
    const program = parser.parse()
    
    const translator = new JPETranslator()
    const files = translator.translate(program)

    expect(files['EN.stbl']).toBeDefined()
    expect(files['FR.stbl']).toBeDefined()
    expect(files['EN.stbl'] instanceof Buffer).toBe(true)
    
    const buffer = files['EN.stbl'] as Buffer
    expect(buffer.slice(0, 4).toString()).toBe('STBL')
    expect(buffer.readUInt16LE(4)).toBe(5) // Version
  })

  it('should replace localized strings with hex hashes in XML', () => {
    const lexer = new JPELexer(jpeSource)
    const tokens = lexer.tokenize()
    const parser = new JPELogicParser(tokens)
    const program = parser.parse()
    
    const translator = new JPETranslator()
    const files = translator.translate(program)

    const xml = files['com_test_mod_Sit_Down.Interaction.xml'] as string
    const expectedHash = STBLService.formatKey("The Big Interaction")
    
    expect(xml).toContain(`<T n="display_name">${expectedHash}</T>`)
    expect(xml).toContain('<T n="priority">10</T>')
    expect(xml).toContain('s="') // Decimal ID
    expect(xml).toContain('c="Interaction"') // Default Class
  })
  it('should fallback to first available locale if EN is missing', () => {
    const tokens = new JPELexer('NAMESPACE: com.test\nLOCALIZATION:\n  FR: "Bonjour"\nWHEN GREET:\n  display_name: "Bonjour"\n').tokenize()
    const ast = new JPELogicParser(tokens).parse()
    const translator = new JPETranslator()
    const files = translator.translate(ast)

    // Verify FR fallback
    const frStbl = files['FR.stbl'] as Buffer
    expect(frStbl).toBeDefined()
    
    const xml = files['com_test_GREET.Interaction.xml'] as string
    // Actual hash for "Bonjour" is 0x53142120
    expect(xml).toContain('0x53142120') 
  })

  it('should harden namespace and interaction name sanitization', () => {
    const tokens = new JPELexer('NAMESPACE: com.my-mod.v1\nWHEN My Cool Interaction!!!: class: Social\n').tokenize()
    const ast = new JPELogicParser(tokens).parse()
    const translator = new JPETranslator()
    const files = translator.translate(ast)

    // com.my-mod.v1 -> com_my_mod_v1
    // My Cool Interaction!!! -> My_Cool_Interaction
    const expectedFile = 'com_my_mod_v1_My_Cool_Interaction.Interaction.xml'
    expect(files[expectedFile]).toBeDefined()
  })
})
