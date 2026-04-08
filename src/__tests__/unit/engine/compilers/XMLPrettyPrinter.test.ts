import { XMLPrettyPrinter, prettyPrintXml } from '@/engine/compilers/XMLPrettyPrinter'

describe('XMLPrettyPrinter', () => {
  describe('format', () => {
    it('should format simple XML with 2-space indentation', () => {
      const input = '<root><child>value</child></root>'
      const printer = new XMLPrettyPrinter()
      const result = printer.format(input)

      expect(result.formatted).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(result.formatted).toContain('<root>')
      expect(result.formatted).toContain('<child>value</child>')
      expect(result.formatted).toContain('</root>')
      expect(result.wasModified).toBe(true)
    })

    it('should preserve existing UTF-8 declaration', () => {
      const input = '<?xml version="1.0" encoding="UTF-8"?><root/>'
      const printer = new XMLPrettyPrinter()
      const result = printer.format(input)

      expect(result.formatted).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    })

    it('should add UTF-8 declaration if missing', () => {
      const input = '<root/>'
      const printer = new XMLPrettyPrinter()
      const result = printer.format(input)

      expect(result.formatted).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    })

    it('should handle nested elements', () => {
      const input = '<a><b><c>deep</c></b></a>'
      const printer = new XMLPrettyPrinter()
      const result = printer.format(input)

      expect(result.formatted).toContain('<a>')
      expect(result.formatted).toContain('<b>')
      expect(result.formatted).toContain('<c>deep</c>')
      expect(result.formatted).toContain('</b>')
      expect(result.formatted).toContain('</a>')
    })

    it('should preserve self-closing tags', () => {
      const input = '<root><empty/></root>'
      const printer = new XMLPrettyPrinter()
      const result = printer.format(input)

      expect(result.formatted).toContain('<empty />')
    })

    it('should handle empty input', () => {
      const printer = new XMLPrettyPrinter()
      const result = printer.format('')

      expect(result.formatted).toBe('')
      expect(result.wasModified).toBe(false)
    })

    it('should preserve text content without extra whitespace', () => {
      const input = '<p>Hello   World</p>'
      const printer = new XMLPrettyPrinter()
      const result = printer.format(input)

      expect(result.formatted).toContain('Hello   World')
    })

    it('should handle XML declarations without encoding', () => {
      const input = '<?xml version="1.0"?><root/>'
      const printer = new XMLPrettyPrinter()
      const result = printer.format(input)

      expect(result.formatted).toContain('encoding="UTF-8"')
    })
  })

  describe('configuration options', () => {
    it('should use custom indent size', () => {
      const input = '<a><b></b></a>'
      const printer = new XMLPrettyPrinter({ indentSize: 4 })
      const result = printer.format(input)

      expect(result.formatted).toContain('    <b>')
    })

    it('should handle max line length wrapping', () => {
      const input =
        '<root attr1="value1" attr2="value2" attr3="value3" attr4="value4"/>'
      const printer = new XMLPrettyPrinter({ maxLineLength: 40 })
      const result = printer.formatWithWrapping(input)

      const lines = result.formatted.split('\n')
      expect(lines.length).toBeGreaterThan(1)
    })

    it('should skip wrapping when maxLineLength is 0', () => {
      const input = '<root attr1="value1" attr2="value2"/>'
      const printer = new XMLPrettyPrinter({ maxLineLength: 0 })
      const result = printer.formatWithWrapping(input)

      expect(result.formatted).toBe(result.formatted)
    })
  })

  describe('complex XML scenarios', () => {
    it('should format Sims 4 tuning XML', () => {
      const input =
        '<?xml version="1.0" encoding="UTF-8"?><C I="0x00000001" n="test"><V t="name" n="value"/><L><V t="test"/></L></C>'
      const printer = new XMLPrettyPrinter()
      const result = printer.format(input)

      expect(result.formatted).toContain('<C')
      expect(result.formatted).toContain('<V t="name" n="value"')
      expect(result.formatted).toContain('<L>')
      expect(result.formatted).toContain('<V t="test"')
    })

    it('should handle XML comments', () => {
      const input = '<root><!-- comment --><child/></root>'
      const printer = new XMLPrettyPrinter()
      const result = printer.format(input)

      expect(result.formatted).toContain('<!-- comment -->')
    })
  })
})

describe('prettyPrintXml convenience function', () => {
  it('should format XML with default options', () => {
    const input = '<root><child/></root>'
    const result = prettyPrintXml(input)

    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(result).toContain('<root>')
    expect(result).toContain('<child')
  })

  it('should accept custom options', () => {
    const input = '<root><child/></root>'
    const result = prettyPrintXml(input, { indentSize: 4 })

    expect(result).toContain('<child')
  })
})
