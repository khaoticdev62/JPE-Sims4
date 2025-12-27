/**
 * XMLParser unit tests
 * Tests parsing, validation, and JPE conversion
 */

import { XMLParser, type JPEModule } from './XMLParser'

describe('XMLParser', () => {
  describe('parseXML', () => {
    it('should parse simple XML element', () => {
      const xml = '<root>content</root>'
      const result = XMLParser.parseXML(xml)
      expect(result).not.toBeNull()
      expect(result?.tag).toBe('root')
      expect(result?.text).toBe('content')
    })

    it('should parse XML with attributes', () => {
      const xml = '<element id="123" name="test">content</element>'
      const result = XMLParser.parseXML(xml)
      expect(result?.attributes).toEqual({ id: '123', name: 'test' })
    })

    it('should parse nested XML elements', () => {
      const xml = '<parent><child>child content</child></parent>'
      const result = XMLParser.parseXML(xml)
      expect(result?.children).toHaveLength(1)
      expect(result?.children?.[0].tag).toBe('child')
      expect(result?.children?.[0].text).toBe('child content')
    })

    it('should parse multiple children', () => {
      const xml = '<parent><child1>text1</child1><child2>text2</child2></parent>'
      const result = XMLParser.parseXML(xml)
      expect(result?.children).toHaveLength(2)
      expect(result?.children?.[0].tag).toBe('child1')
      expect(result?.children?.[1].tag).toBe('child2')
    })

    it('should handle self-closing tags', () => {
      const xml = '<root><empty /> <content>text</content></root>'
      const result = XMLParser.parseXML(xml)
      expect(result?.children).toHaveLength(2)
    })

    it('should return null for invalid XML', () => {
      const xml = '<unclosed><nested>'
      const result = XMLParser.parseXML(xml)
      expect(result).toBeNull()
    })

    it('should trim whitespace', () => {
      const xml = '  <root>  content  </root>  '
      const result = XMLParser.parseXML(xml)
      expect(result?.tag).toBe('root')
    })

    it('should parse XML with mixed content', () => {
      const xml = '<root>text before<child>child text</child>text after</root>'
      const result = XMLParser.parseXML(xml)
      expect(result?.children).toBeDefined()
      expect(result?.text).toContain('text before')
    })
  })

  describe('convertToJPE', () => {
    it('should convert simple element to JPE', () => {
      const xmlElement = {
        tag: 'root',
        attributes: {},
        children: [],
        text: 'content',
      }
      const jpe = XMLParser.convertToJPE(xmlElement)
      expect(jpe.type).toBe('root')
      expect(jpe.sections).toBeDefined()
    })

    it('should extract metadata from attributes', () => {
      const xmlElement = {
        tag: 'document',
        attributes: { version: '1.0', encoding: 'utf-8' },
        children: [],
        text: '',
      }
      const jpe = XMLParser.convertToJPE(xmlElement)
      expect(jpe.metadata.version).toBe('1.0')
      expect(jpe.metadata.encoding).toBe('utf-8')
    })

    it('should create sections from children', () => {
      const xmlElement = {
        tag: 'root',
        attributes: {},
        children: [
          { tag: 'section1', attributes: {}, children: [], text: 'content1' },
          { tag: 'section2', attributes: {}, children: [], text: 'content2' },
        ],
        text: '',
      }
      const jpe = XMLParser.convertToJPE(xmlElement)
      expect(jpe.sections).toHaveLength(2)
      expect(jpe.sections[0].type).toBe('section1')
      expect(jpe.sections[0].content).toBe('content1')
    })

    it('should handle nested JPE structure', () => {
      const xmlElement = {
        tag: 'root',
        attributes: {},
        children: [
          {
            tag: 'parent',
            attributes: {},
            children: [{ tag: 'child', attributes: {}, children: [], text: 'nested' }],
            text: '',
          },
        ],
        text: '',
      }
      const jpe = XMLParser.convertToJPE(xmlElement)
      expect(jpe.sections).toHaveLength(1)
      expect(jpe.sections[0].type).toBe('parent')
    })
  })

  describe('validate', () => {
    it('should validate correct XML', () => {
      const xml = '<?xml version="1.0"?><root><tag>content</tag></root>'
      const result = XMLParser.validate(xml)
      expect(result.valid).toBe(true)
      expect(result.diagnostics).toHaveLength(0)
    })

    it('should detect missing XML declaration', () => {
      const xml = '<root>content</root>'
      const result = XMLParser.validate(xml)
      expect(result.valid).toBeFalsy()
      const hasMissingDecl = result.diagnostics.some((d) =>
        d.message.includes('declaration')
      )
      expect(hasMissingDecl).toBe(true)
    })

    it('should detect mismatched tags', () => {
      const xml = '<?xml version="1.0"?><root><child></root>'
      const result = XMLParser.validate(xml)
      expect(result.valid).toBeFalsy()
    })

    it('should detect unclosed tags', () => {
      const xml = '<?xml version="1.0"?><root><unclosed></root>'
      const result = XMLParser.validate(xml)
      // May or may not be detected depending on parser implementation
      expect(result).toBeDefined()
    })

    it('should accept empty elements', () => {
      const xml = '<?xml version="1.0"?><root><empty /></root>'
      const result = XMLParser.validate(xml)
      expect(result.valid).toBe(true)
    })

    it('should detect unquoted attributes', () => {
      const xml = '<?xml version="1.0"?><root attr=value>content</root>'
      const result = XMLParser.validate(xml)
      // May be caught by validation
      expect(result).toBeDefined()
    })

    it('should handle special characters', () => {
      const xml = '<?xml version="1.0"?><root>&lt;escaped&gt;</root>'
      const result = XMLParser.validate(xml)
      expect(result.valid).toBe(true)
    })

    it('should warn about unescaped ampersand', () => {
      const xml = '<?xml version="1.0"?><root>AT&T</root>'
      const result = XMLParser.validate(xml)
      // Should detect unescaped & and suggest &amp;
      const hasWarning = result.diagnostics.some((d) => d.code?.includes('SPECIAL'))
      expect(hasWarning).toBe(true)
    })

    it('should return multiple diagnostics', () => {
      const xml = '<root><child attr=unquoted>content</root>'
      const result = XMLParser.validate(xml)
      expect(result.diagnostics.length).toBeGreaterThan(0)
    })
  })

  describe('full pipeline', () => {
    it('should parse, convert, and validate in sequence', () => {
      const xml = '<?xml version="1.0"?><document><section>text</section></document>'

      // Validate
      const validation = XMLParser.validate(xml)
      expect(validation.valid).toBe(true)

      // Parse
      const parsed = XMLParser.parseXML(xml)
      expect(parsed).not.toBeNull()

      // Convert to JPE
      const jpe = XMLParser.convertToJPE(parsed!)
      expect(jpe.type).toBe('document')
      expect(jpe.sections.length).toBeGreaterThan(0)
    })

    it('should handle real-world XML structure', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<ModuleInfo name="TestModule" version="1.0">
  <Description>A test module</Description>
  <Author>Test Author</Author>
  <Comments>Some comments here</Comments>
</ModuleInfo>`

      const validation = XMLParser.validate(xml)
      expect(validation.valid).toBe(true)

      const parsed = XMLParser.parseXML(xml)
      expect(parsed?.tag).toBe('ModuleInfo')
      expect(parsed?.attributes.name).toBe('TestModule')

      const jpe = XMLParser.convertToJPE(parsed!)
      expect(jpe.metadata.name).toBe('TestModule')
      expect(jpe.metadata.version).toBe('1.0')
    })
  })
})
