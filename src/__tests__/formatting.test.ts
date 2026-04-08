import { JPELogicParser } from '../services/translation/parser'
import { JPELexer } from '../services/translation/lexer'
import { JPETranslator } from '../services/translation/translator'

describe('JPE XML Formatting', () => {
    const translate = (input: string) => {
        const lexer = new JPELexer(input)
        const tokens = lexer.tokenize()
        const parser = new JPELogicParser(tokens)
        const program = parser.parse()
        const translator = new JPETranslator()
        return translator.translate(program)
    }

    test('should produce correctly indented XML with 2 spaces', () => {
        const input = `
            WHEN Deep Logic:
              class: Interaction
              ONLY_IF:
                - is adult
                - trait:Trait_X
        `
        const files = translate(input)
        const xml = files['Deep_Logic.Interaction.xml'] as string
        
        // Root tag indent 0
        expect(xml).toContain('<I c="Interaction"')
        // test_globals indent 2 (level 1)
        expect(xml).toContain('  <L n="test_globals">')
        // sim_info nested in test_globals indent 4 (level 2)
        expect(xml).toContain('    <V t="sim_info">')
        // ages nested in sim_info indent 6 (level 3)
        expect(xml).toContain('      <U n="sim_info">')
    })

    test('should escape special characters in names and values', () => {
        const input = `NAMESPACE: my-mod
WHEN Logic & "More":
  class: Interaction
  description: Hello <World> & "Friends"`.trim()
        const files = translate(input)
        const filename = 'my_mod_Logic_More.Interaction.xml'
        const xml = files[filename] as string
        expect(xml).toContain('n="Logic &amp; More"')
        expect(xml).toContain('<T n="description">Hello &lt;World&gt; &amp; Friends</T>')
    })
    test('should handle adversarial characters like # and --', () => {
        const input = `NAMESPACE: adversarial-mod
WHEN Logic #Hardcore:
  DO:
    - My--Action: with -- dashes
  description: Tag #Value`.trim()
        const files = translate(input)
        const xml = files['adversarial_mod_Logic_Hardcore.Interaction.xml'] as string
        
        // CR-03: # should be preserved in name
        expect(xml).toContain('n="Logic #Hardcore"')
        // CR-03: # should be preserved in description
        expect(xml).toContain('Tag #Value')
        // CR-01: -- should be escaped in unknown action comment
        expect(xml).toContain('<!-- Unknown action: My--Action :with __ dashes -->')
    })
})
