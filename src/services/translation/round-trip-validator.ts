import { XMLParser } from 'fast-xml-parser'
import { JPEDecompiler } from './decompiler'
import { JPELexer } from './lexer'
import { JPELogicParser } from './parser'
import { JPETranslator } from './translator'

export interface ValidationResult {
  success: boolean
  error?: string
  diff?: string
  jpe?: string
  newXml?: string
}

export class RoundTripValidator {
  private static parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    preserveOrder: true,
    parseTagValue: false,
    parseAttributeValue: false
  })

  /**
   * Validates that an XML string can be decompiled to JPE and recompiled to a functionally identical XML.
   */
  static validate(xml: string, namespace?: string): ValidationResult {
    try {
      // 1. Decompile XML to JPE
      const decompiler = new JPEDecompiler()
      const jpe = decompiler.decompile(xml)
      
      // 2. Parse JPE to AST
      const lexer = new JPELexer(jpe)
      const tokens = lexer.tokenize()
      const parser = new JPELogicParser(tokens)
      const ast = parser.parse()
      
      // Override namespace if provided (essential for ID stability in tests)
      if (namespace) {
        ast.namespace = namespace
      }

      // 3. Translate AST back to XML
      const translator = new JPETranslator()
      const files = translator.translate(ast)
      
      // Extract the primary XML file (Interaction XML)
      const xmlFiles = Object.keys(files).filter(f => f.endsWith('.xml'))
      if (xmlFiles.length === 0) {
        return { success: false, error: 'No XML generated from decompiled JPE.' }
      }
      
      const newXml = files[xmlFiles[0]] as string

      // 4. Semantic Comparison
      const originalObj = this.parser.parse(xml)
      const newObj = this.parser.parse(newXml)

      // Compare objects as strings (simplest deep comparison for this context)
      const originalStr = JSON.stringify(originalObj)
      const newStr = JSON.stringify(newObj)

      if (originalStr !== newStr) {
        return {
          success: false,
          error: 'Functional mismatch in round-trip conversion.',
          jpe,
          newXml
        }
      }

      return { success: true, jpe, newXml }

    } catch (err: any) {
      return { 
        success: false, 
        error: `Conversion Error: ${err.message}` 
      }
    }
  }
}
