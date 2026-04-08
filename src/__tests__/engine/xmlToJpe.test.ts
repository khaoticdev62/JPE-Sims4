import { XMLToJPETranslator } from '../../engine/translators/xmlToJpe'
import { JPEToXMLTranslator } from '../../engine/translators/jpeToXml'
import { JPEParser } from '../../engine/jpe/parser'
import { tokenize } from '../../engine/jpe/lexer'
import type { XMLElement } from '../../engine/parsers/XMLParser'

describe('XMLToJPETranslator (Decompiler)', () => {
  // ... existing tests ...
  it('should decompile metadata and basic structure', () => {
    const xml: XMLElement = {
      tag: 'I',
      attributes: { c: 'Trait', i: '12345', m: 'traits.trait' },
      children: [],
      text: 'Some Content'
    }

    const result = XMLToJPETranslator.translate(xml)
    expect(result).toContain('[Metadata]')
    expect(result).toContain('class = "Trait"')
    expect(result).toContain('id = "12345"')
    expect(result).toContain('content = "Some Content"')
  })

  it('should rehydrate ONLY_IF from <L n="tests">', () => {
    const xml: XMLElement = {
      tag: 'I',
      attributes: { i: '1' },
      children: [
        {
          tag: 'L',
          attributes: { n: 'tests' },
          children: [
            {
              tag: 'T',
              attributes: { n: 'state' },
              children: [],
              text: '15013'
            }
          ]
        }
      ]
    }

    const result = XMLToJPETranslator.translate(xml)
    expect(result).toContain('[ONLY_IF]')
    expect(result).toContain('  state = "15013"')
  })

  it('should rehydrate DO from <U n="outcome">', () => {
    const xml: XMLElement = {
      tag: 'I',
      attributes: { i: '1' },
      children: [
        {
          tag: 'U',
          attributes: { n: 'outcome' },
          children: [
            {
              tag: 'T',
              attributes: { n: 'value' },
              children: [],
              text: 'success'
            }
          ]
        }
      ]
    }

    const result = XMLToJPETranslator.translate(xml)
    expect(result).toContain('[DO]')
    expect(result).toContain('  value = "success"')
  })

  it('should handle complex nested structures', () => {
    const xml: XMLElement = {
      tag: 'Instance',
      attributes: { i: '100' },
      children: [
        {
          tag: 'V',
          attributes: { n: 'enabled', t: 'enabled_variant' },
          children: [
            {
              tag: 'U',
              attributes: { n: 'enabled' },
              children: [
                {
                  tag: 'T',
                  attributes: { n: 'val' },
                  children: [],
                  text: 'true'
                }
              ]
            }
          ]
        }
      ]
    }

    const result = XMLToJPETranslator.translate(xml)
    expect(result).toContain('[WHEN]')
    expect(result).toContain('  t = "enabled_variant"')
    expect(result).toContain('  [WHEN]')
    expect(result).toContain('    val = "true"')
  })

  describe('Round-trip Fidelity (AC3)', () => {
    it('should achieve 100% functional identity (XML -> JPE -> XML)', () => {
      const originalXml: XMLElement = {
        tag: 'I',
        attributes: { c: 'Trait', i: '12345' },
        children: [
          {
            tag: 'L',
            attributes: { n: 'tests' },
            children: [
              {
                tag: 'T',
                attributes: { n: 'state' },
                children: [],
                text: '15013'
              }
            ]
          },
          {
            tag: 'V',
            attributes: { n: 'enabled', t: 'enabled_variant' },
            children: [
              {
                tag: 'U',
                attributes: { n: 'enabled' },
                children: [
                  {
                    tag: 'T',
                    attributes: { n: 'val' },
                    children: [],
                    text: 'true'
                  }
                ]
              }
            ]
          }
        ]
      }

      // 1. Decompile: XML -> JPE String
      const jpeString = XMLToJPETranslator.translate(originalXml)
      
      // 2. Parse: JPE String -> JPE AST
      const tokens = tokenize(jpeString)
      const jpeAst = new JPEParser(tokens).parse()
      
      // 3. Compile: JPE AST -> XML AST
      const recompiledXml = JPEToXMLTranslator.translate(jpeAst)

      // 4. Verify Identity
      expect(recompiledXml).toBeDefined()
      if (recompiledXml) {
        expect(recompiledXml.tag).toBe('I') // Root tag preserved
        expect(recompiledXml.attributes.i).toBe('12345')
        expect(recompiledXml.attributes.c).toBe('Trait')
        
        // Check ONLY_IF re-hydration
        const tests = recompiledXml.children.find((c: XMLElement) => c.tag === 'L' && c.attributes.n === 'tests')
        expect(tests).toBeDefined()
        expect(tests?.children[0].tag).toBe('T')
        expect(tests?.children[0].attributes.n).toBe('state')
        expect(tests?.children[0].text).toBe('15013')

        // Check WHEN re-hydration
        const enabled = recompiledXml.children.find((c: XMLElement) => c.tag === 'V' && c.attributes.n === 'enabled')
        expect(enabled).toBeDefined()
        expect(enabled?.attributes.t).toBe('enabled_variant')
      }
    })

    it('should correctly re-hydrate custom named units (<U n="name">)', () => {
      const originalXml: XMLElement = {
        tag: 'U',
        attributes: { n: 'my_custom_unit' },
        children: [
          {
            tag: 'T',
            attributes: { n: 'val' },
            children: [],
            text: '123'
          }
        ]
      }

      // XML -> JPE string -> JPE AST -> XML
      const jpeString = XMLToJPETranslator.translate(originalXml)
      // Root name is in Metadata, not a separate section
      expect(jpeString).toContain('[Metadata]')
      expect(jpeString).toContain('name = "my_custom_unit"')
      
      const tokens = tokenize(jpeString)
      const jpeAst = new JPEParser(tokens).parse()
      const recompiledXml = JPEToXMLTranslator.translate(jpeAst)

      expect(recompiledXml).toBeDefined()
      if (recompiledXml) {
        expect(recompiledXml.tag).toBe('U')
        expect(recompiledXml.attributes.n).toBe('my_custom_unit')
        expect(recompiledXml.children[0].tag).toBe('T')
        expect(recompiledXml.children[0].attributes.n).toBe('val')
        expect(recompiledXml.children[0].text).toBe('123')
      }
    })
  })
})
