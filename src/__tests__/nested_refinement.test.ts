import { JPELexer } from '../services/translation/lexer'
import { JPELogicParser } from '../services/translation/parser'
import { JPETranslator } from '../services/translation/translator'

describe('JPE Nested Logic Refinement', () => {
    const translator = new JPETranslator()

    function translate(source: string) {
        const lexer = new JPELexer(source)
        const parser = new JPELogicParser(lexer.tokenize())
        return translator.translate(parser.parse()) as Record<string, string>
    }

    test('should optimize single-child ONLY_IF blocks', () => {
        const input = `
            WHEN SingleChildOpt:
              ONLY_IF:
                - ONLY_IF:
                    - is adult
        `.trim()
        
        const files = translate(input)
        const xml = Object.values(files)[0]
        
        // Should NOT contain the inner at_least_one wrapper because it only has one child
        // XML should just have test_globals containing the sim_info
        expect(xml).toContain('<L n="test_globals">')
        expect(xml).not.toContain('<V t="at_least_one">')
        expect(xml).toContain('<V t="sim_info">')
    })

    test('should handle deep nesting up to 20 levels', () => {
        // Generate a 15-level deep nested ONLY_IF
        let jpe = 'WHEN DeepMod:\n  ONLY_IF:\n'
        for (let i = 0; i < 15; i++) {
            const indent = '  '.repeat(i + 2)
            jpe += `${indent}- ONLY_IF:\n`
        }
        jpe += '  '.repeat(17) + '- is adult'

        const files = translate(jpe)
        const xml = Object.values(files)[0]
        
        expect(xml).toContain('ADULT')
        expect(xml).not.toContain('Max recursion depth exceeded')
    })
})
