import { JPELexer } from '../services/translation/lexer'
import { JPELogicParser } from '../services/translation/parser'
import { JPETranslator } from '../services/translation/translator'
import { JPEDecompiler } from '../services/translation/decompiler'

describe('JPE Round-trip Validation', () => {
    const translator = new JPETranslator()
    const decompiler = new JPEDecompiler()

    function fullCycle(jpeSource: string): Record<string, string> {
        // JPE -> XML
        const lexer1 = new JPELexer(jpeSource)
        const parser1 = new JPELogicParser(lexer1.tokenize())
        const program1 = parser1.parse()
        const xmlFiles1 = translator.translate(program1) as Record<string, string>
        const results: Record<string, string> = {}
        
        for (const [_filename, xml1] of Object.entries(xmlFiles1)) {
            // XML -> JPE (Pass the namespace from the original program)
            const jpeNew = decompiler.decompile(xml1, program1.namespace)
            
            // JPE -> XML (again)
            const lexer2 = new JPELexer(jpeNew)
            const parser2 = new JPELogicParser(lexer2.tokenize())
            const xmlFiles2 = translator.translate(parser2.parse()) as Record<string, string>
            
            // Should produce the same filename
            results[xml1] = Object.values(xmlFiles2)[0] as string
        }
        
        return results
    }

    test('should maintain high-fidelity for simple interactions', () => {
        const input = `
            NAMESPACE: com.my-mod
            WHEN SimpleInteraction:
              class: Interaction
              description: Hello World
        `.trim()

        const cycles = fullCycle(input)
        for (const [xmlOriginal, xmlRoundTrip] of Object.entries(cycles)) {
            expect(xmlRoundTrip.replace(/\s+/g, ' ')).toBe(xmlOriginal.replace(/\s+/g, ' '))
        }
    })

    test('should handle nested complexity in round-trip', () => {
        const input = `
            NAMESPACE: com.complex
            WHEN ComplexLogic:
              DO:
                - loot: Loot_1
              ONLY_IF:
                - trait: Trait_A
                - is adult
        `.trim()

        const cycles = fullCycle(input)
        for (const [xmlOriginal, xmlRoundTrip] of Object.entries(cycles)) {
            // Functionally identical check (ignoring whitespace differences if any)
            expect(xmlRoundTrip.replace(/\s+/g, ' ')).toBe(xmlOriginal.replace(/\s+/g, ' '))
        }
    })

    test('should preserve special characters through round-trip', () => {
        const input = `
            WHEN Dash-Hash #Sym&bol:
              description: Value & <Other>
        `.trim()

        const cycles = fullCycle(input)
        for (const [xmlOriginal, xmlRoundTrip] of Object.entries(cycles)) {
             expect(xmlRoundTrip.replace(/\s+/g, ' ')).toBe(xmlOriginal.replace(/\s+/g, ' '))
        }
    })
})
