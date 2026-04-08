import { XMLPrettyPrinter } from '@/engine/compilers/XMLPrettyPrinter'
import {
  XMLNamespaceValidator,
  SIMS4_STANDARD_NAMESPACES,
} from '@/engine/validation/XMLNamespaceValidator'

describe('XML Formatting & Namespace Integration', () => {
  describe('JPE → XML → validate → pretty-print pipeline', () => {
    it('should produce valid, formatted Sims 4 tuning XML', () => {
      // Simulate JPE→XML translation output (raw, unformatted)
      const rawXml =
        '<C I="0x00000001" n="test_interaction"><V t="name" n="Test"/><L><V t="trait" n="0x00000002"/></L></C>'

      // Step 1: Validate and fix namespaces
      const nsValidator = new XMLNamespaceValidator()
      const processedXml = nsValidator.validateAndFix(rawXml)

      expect(processedXml).toContain('xmlns:t=')

      // Step 2: Pretty-print
      const printer = new XMLPrettyPrinter()
      const result = printer.format(processedXml)

      expect(result.formatted).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(result.formatted).toContain('<C')
      expect(result.formatted).toContain('  <V t="name" n="Test" />')
      expect(result.formatted).toContain('  <L>')
      expect(result.formatted).toContain('    <V t="trait" n="0x00000002" />')
      expect(result.wasModified).toBe(true)
    })

    it('should handle multiple namespace additions', () => {
      const rawXml = '<root><child/></root>'

      const nsValidator = new XMLNamespaceValidator({
        ...SIMS4_STANDARD_NAMESPACES,
        custom: 'http://example.com/custom',
      })
      const result = nsValidator.validate(rawXml)

      expect(result.missing.length).toBeGreaterThan(0)
      expect(result.fixedXml).toBeDefined()
      expect(result.fixesApplied.length).toBeGreaterThan(0)
    })

    it('should preserve existing valid namespaces during formatting', () => {
      const rawXml =
        '<?xml version="1.0" encoding="UTF-8"?><C xmlns:t="http://schemas.ea.com/sims4/tuning"><V t="test"/></C>'

      const printer = new XMLPrettyPrinter()
      const result = printer.format(rawXml)

      expect(result.formatted).toContain('xmlns:t=')
      expect(result.formatted).toContain('<V t="test" />')
    })

    it('should handle attribute wrapping for long lines', () => {
      const rawXml =
        '<C I="0x00000001" n="very_long_name" xmlns:t="http://schemas.ea.com/sims4/tuning" attr1="value1" attr2="value2" attr3="value3"><V t="test"/></C>'

      const nsValidator = new XMLNamespaceValidator()
      const processedXml = nsValidator.validateAndFix(rawXml)

      const printer = new XMLPrettyPrinter({ maxLineLength: 60 })
      const result = printer.formatWithWrapping(processedXml)

      const lines = result.formatted.split('\n')
      expect(lines.length).toBeGreaterThan(3)
    })
  })

  describe('Real Sims 4 XML tuning files', () => {
    const realSims4XmlFiles = [
      {
        name: 'Interaction Tuning',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<C I="0x0000000000000001" n="interaction_Greet_Friendly" xmlns:t="http://schemas.ea.com/sims4/tuning">
  <V t="name" n="0x0000000000000002" />
  <V t="description" n="0x0000000000000003" />
  <L>
    <V t="required_trait" n="0x0000000000000004" />
    <V t="forbidden_buff" n="0x0000000000000005" />
  </L>
  <V t="success_chance" n="1.0" />
</C>`,
      },
      {
        name: 'Buff Tuning',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<C I="0x0000000000000010" n="buff_Happy_Mood" xmlns:t="http://schemas.ea.com/sims4/tuning">
  <V t="buff_name" n="Happy" />
  <V t="buff_description" n="Feeling happy and content" />
  <V t="buff_type" n="positive" />
  <L>
    <V t="mood_multiplier" n="1.5" />
  </L>
</C>`,
      },
      {
        name: 'Trait Tuning',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<C I="0x0000000000000020" n="trait_Creative" xmlns:t="http://schemas.ea.com/sims4/tuning">
  <V t="trait_name" n="Creative" />
  <V t="trait_description" n="A creative Sim" />
  <L>
    <V t="skill_boost" n="painting" v="2.0" />
    <V t="skill_boost" n="writing" v="2.0" />
  </L>
</C>`,
      },
    ]

    it.each(realSims4XmlFiles)(
      'should validate and format $name XML',
      ({ xml }) => {
        const nsValidator = new XMLNamespaceValidator()
        const validation = nsValidator.validate(xml)

        expect(validation.valid).toBe(true)

        const printer = new XMLPrettyPrinter()
        const result = printer.format(xml)

        expect(result.formatted).toContain('<?xml version="1.0" encoding="UTF-8"?>')
        expect(result.wasModified).toBe(true)
      },
    )

    it('should handle XML with missing namespaces and format correctly', () => {
      const rawXml = `<?xml version="1.0" encoding="UTF-8"?>
<C I="0x00000001" n="missing_ns">
  <V t="test" n="value" />
</C>`

      const nsValidator = new XMLNamespaceValidator()
      const processedXml = nsValidator.validateAndFix(rawXml)

      const printer = new XMLPrettyPrinter()
      const result = printer.format(processedXml)

      expect(result.formatted).toContain('xmlns:t=')
      expect(result.formatted).toContain('<V t="test" n="value" />')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty XML', () => {
      const printer = new XMLPrettyPrinter()
      const result = printer.format('')

      expect(result.formatted).toBe('')
      expect(result.wasModified).toBe(false)
    })

    it('should handle XML with CDATA sections', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<C xmlns:t="http://schemas.ea.com/sims4/tuning">
  <V t="script"><![CDATA[
    function test() {
      return true;
    }
  ]]></V>
</C>`

      const printer = new XMLPrettyPrinter()
      const result = printer.format(xml)

      expect(result.formatted).toContain('<![CDATA[')
      expect(result.formatted).toContain(']]>')
    })

    it('should handle XML with special characters', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<C xmlns:t="http://schemas.ea.com/sims4/tuning">
  <V t="name" n="Test &amp; Example" />
  <V t="description" n="Less than: &lt; 100" />
</C>`

      const printer = new XMLPrettyPrinter()
      const result = printer.format(xml)

      expect(result.formatted).toContain('&amp;')
      expect(result.formatted).toContain('&lt;')
    })

    it('should handle very large XML with many elements', () => {
      const elements = Array.from(
        { length: 100 },
        (_, i) => `<V t="item" n="${i}" />`,
      ).join('\n')
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<C xmlns:t="http://schemas.ea.com/sims4/tuning">
${elements}
</C>`

      const printer = new XMLPrettyPrinter()
      const result = printer.format(xml)

      expect(result.formatted).toContain('<V t="item" n="0" />')
      expect(result.formatted).toContain('<V t="item" n="99" />')
    })
  })

  describe('Performance', () => {
    it('should format XML within reasonable time', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<C xmlns:t="http://schemas.ea.com/sims4/tuning">
  <L>
    <V t="test1" n="value1" />
    <V t="test2" n="value2" />
    <V t="test3" n="value3" />
  </L>
</C>`

      const printer = new XMLPrettyPrinter()
      const result = printer.format(xml)

      expect(result.processingTime).toBeLessThan(100) // Should complete in < 100ms
    })

    it('should validate namespaces within reasonable time', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<C xmlns:t="http://schemas.ea.com/sims4/tuning"><V t="test"/></C>`

      const validator = new XMLNamespaceValidator()
      const start = performance.now()
      validator.validate(xml)
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(50) // Should complete in < 50ms
    })
  })
})
