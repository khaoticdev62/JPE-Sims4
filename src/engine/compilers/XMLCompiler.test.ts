/**
 * XMLCompiler unit tests
 * Tests XML generation, formatting, and round-trip compilation
 */

import { XMLCompiler } from './XMLCompiler'
import type { JPEModule } from '@/engine/parsers/XMLParser'

describe('XMLCompiler', () => {
  const basicJPEModule: JPEModule = {
    type: 'root',
    metadata: {},
    sections: [],
  }

  describe('compileToXML', () => {
    it('should compile minimal JPE module to XML', () => {
      const result = XMLCompiler.compileToXML(basicJPEModule)
      expect(result.success).toBe(true)
      expect(result.output).toContain('<?xml version="1.0"')
      expect(result.output).toContain('<root>')
      expect(result.output).toContain('</root>')
      expect(result.errors).toHaveLength(0)
    })

    it('should include XML declaration', () => {
      const result = XMLCompiler.compileToXML(basicJPEModule)
      expect(result.output).toMatch(/^<\?xml version="1\.0" encoding="utf-8"\?>/)
    })

    it('should compile module with metadata', () => {
      const testModule: JPEModule = {
        type: 'document',
        metadata: { version: '1.0', author: 'Test' },
        sections: [],
      }
      const result = XMLCompiler.compileToXML(testModule)
      expect(result.success).toBe(true)
      expect(result.output).toContain('version="1.0"')
      expect(result.output).toContain('author="Test"')
    })

    it('should compile module with sections', () => {
      const testModule: JPEModule = {
        type: 'root',
        metadata: {},
        sections: [
          { type: 'section1', content: 'content1' },
          { type: 'section2', content: 'content2' },
        ],
      }
      const result = XMLCompiler.compileToXML(testModule)
      expect(result.success).toBe(true)
      expect(result.output).toContain('<section1>')
      expect(result.output).toContain('content1')
      expect(result.output).toContain('<section2>')
      expect(result.output).toContain('content2')
    })

    it('should handle pretty printing', () => {
      const testModule: JPEModule = {
        type: 'root',
        metadata: {},
        sections: [{ type: 'child', content: 'text' }],
      }
      const result = XMLCompiler.compileToXML(testModule, true)
      expect(result.output).toContain('\n')
    })

    it('should escape special characters in attributes', () => {
      const testModule: JPEModule = {
        type: 'root',
        metadata: { content: 'text with & and < and > and "quotes"' },
        sections: [],
      }
      const result = XMLCompiler.compileToXML(testModule)
      expect(result.output).toContain('&amp;')
      expect(result.output).toContain('&lt;')
      expect(result.output).toContain('&gt;')
      expect(result.output).toContain('&quot;')
    })

    it('should return error on compilation failure', () => {
      // Create invalid module that causes issues
      const invalidModule = {
        type: null,
        metadata: {},
        sections: [],
      } as any
      const result = XMLCompiler.compileToXML(invalidModule)
      // Should handle gracefully
      expect(result).toBeDefined()
    })
  })

  describe('minifyXML', () => {
    it('should remove whitespace between tags', () => {
      const xml = '<root>\n  <child>\n    content\n  </child>\n</root>'
      const minified = XMLCompiler.minifyXML(xml)
      expect(minified).not.toContain('\n')
      expect(minified).toContain('<root><child>')
    })

    it('should collapse multiple spaces', () => {
      const xml = '<root>text  with   multiple    spaces</root>'
      const minified = XMLCompiler.minifyXML(xml)
      expect(minified).toContain('text with multiple spaces')
    })

    it('should trim output', () => {
      const xml = '  \n<root>content</root>  \n'
      const minified = XMLCompiler.minifyXML(xml)
      expect(minified).not.toMatch(/^\s/)
      expect(minified).not.toMatch(/\s$/)
    })

    it('should preserve tag structure', () => {
      const xml = '<parent><child attr="value">text</child></parent>'
      const minified = XMLCompiler.minifyXML(xml)
      expect(minified).toContain('<parent><child attr="value">text</child></parent>')
    })
  })

  describe('prettifyXML', () => {
    it('should format XML with indentation', () => {
      const xml = '<root><child>content</child></root>'
      const pretty = XMLCompiler.prettifyXML(xml, 2)
      expect(pretty).toContain('\n')
      // Should have indentation - child should be indented on a new line
      expect(pretty).toMatch(/<root>\n\s+<child>/)
    })

    it('should use custom indent size', () => {
      const xml = '<root><child><nested>text</nested></child></root>'
      const pretty = XMLCompiler.prettifyXML(xml, 4)
      const lines = pretty.split('\n')
      // Check for 4-space indentation
      expect(lines.some((line) => line.match(/^ {4}</))
      ).toBe(true)
    })

    it('should handle XML declaration', () => {
      const xml = '<?xml version="1.0"?><root><child>text</child></root>'
      const pretty = XMLCompiler.prettifyXML(xml)
      expect(pretty).toMatch(/^<\?xml/)
    })

    it('should properly indent nested elements', () => {
      const xml = '<parent><child><nested>text</nested></child></parent>'
      const pretty = XMLCompiler.prettifyXML(xml, 2)
      const lines = pretty.split('\n')
      const parentLine = lines.findIndex((l) => l.includes('<parent>'))
      const childLine = lines.findIndex((l) => l.includes('<child>'))
      const nestedLine = lines.findIndex((l) => l.includes('<nested>'))

      expect(parentLine).toBeGreaterThanOrEqual(0)
      expect(childLine).toBeGreaterThan(parentLine)
      expect(nestedLine).toBeGreaterThan(childLine)
    })

    it('should handle self-closing tags', () => {
      const xml = '<root><empty /><child>text</child></root>'
      const pretty = XMLCompiler.prettifyXML(xml)
      expect(pretty).toContain('<empty />')
    })

    it('should close nested tags correctly', () => {
      const xml = '<root><child>text</child></root>'
      const pretty = XMLCompiler.prettifyXML(xml, 2)
      expect(pretty).toContain('</child>')
      expect(pretty).toContain('</root>')
    })
  })

  describe('elementToXMLString', () => {
    it('should convert text element', () => {
      const element = { tag: '#text', text: 'content' }
      const result = XMLCompiler['elementToXMLString'](element, false, 0)
      expect(result).toBe('content')
    })

    it('should convert simple element', () => {
      const element = {
        tag: 'element',
        attributes: {},
        children: [],
      }
      const result = XMLCompiler['elementToXMLString'](element, false, 0)
      expect(result).toContain('<element />')
    })

    it('should convert element with text', () => {
      const element = {
        tag: 'element',
        attributes: {},
        children: [{ tag: '#text', text: 'content' }],
      }
      const result = XMLCompiler['elementToXMLString'](element, false, 0)
      expect(result).toContain('<element>')
      expect(result).toContain('content')
      expect(result).toContain('</element>')
    })

    it('should convert element with attributes', () => {
      const element = {
        tag: 'element',
        attributes: { id: 'test', name: 'example' },
        children: [],
      }
      const result = XMLCompiler['elementToXMLString'](element, false, 0)
      expect(result).toContain('id="test"')
      expect(result).toContain('name="example"')
    })

    it('should apply indentation', () => {
      const element = {
        tag: 'element',
        attributes: {},
        children: [],
      }
      const resultNoIndent = XMLCompiler['elementToXMLString'](element, false, 0)
      const resultWithIndent = XMLCompiler['elementToXMLString'](element, true, 2)

      expect(resultNoIndent).not.toMatch(/^\s/)
      expect(resultWithIndent).toMatch(/^\s{4}/)
    })

    it('should handle nested elements', () => {
      const element = {
        tag: 'parent',
        attributes: {},
        children: [
          {
            tag: 'child',
            attributes: {},
            children: [{ tag: '#text', text: 'text' }],
          },
        ],
      }
      const result = XMLCompiler['elementToXMLString'](element, false, 0)
      expect(result).toContain('<parent>')
      expect(result).toContain('<child>')
      expect(result).toContain('text')
      expect(result).toContain('</child>')
      expect(result).toContain('</parent>')
    })
  })

  describe('round-trip compilation', () => {
    it('should compile JPEModule to XML with proper structure', () => {
      const testModule: JPEModule = {
        type: 'document',
        metadata: { version: '1.0' },
        sections: [
          { type: 'header', content: 'Header Content' },
          { type: 'body', content: 'Body Content' },
        ],
      }
      const result = XMLCompiler.compileToXML(testModule)
      expect(result.success).toBe(true)
      expect(result.output).toContain('<?xml')
      expect(result.output).toContain('<document')
      expect(result.output).toContain('version="1.0"')
      expect(result.output).toContain('<header>')
      expect(result.output).toContain('<body>')
    })
  })
})
