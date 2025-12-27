/**
 * ValidationEngine unit tests
 * Tests all 5 validation rules and the validation pipeline
 */

import { ValidationEngine } from './ValidationEngine'

describe('ValidationEngine', () => {
  describe('xml-declaration rule', () => {
    it('should warn when XML declaration is missing', () => {
      const result = ValidationEngine.validate('<root>content</root>')
      const hasWarning = result.diagnostics.some((d) => d.code === 'XMLDECL001')
      expect(hasWarning).toBe(true)
      expect(result.valid).toBe(false)
    })

    it('should pass when XML declaration is present', () => {
      const result = ValidationEngine.validate('<?xml version="1.0"?><root>content</root>')
      const hasWarning = result.diagnostics.some((d) => d.code === 'XMLDECL001')
      expect(hasWarning).toBe(false)
    })

    it('should accept different XML declarations', () => {
      const declarations = [
        '<?xml version="1.0" encoding="utf-8"?><root/>',
        '<?xml version="1.0" encoding="UTF-8"?><root/>',
        '<?xml version="1.1"?><root/>',
      ]

      declarations.forEach((xml) => {
        const result = ValidationEngine.validate(xml)
        const hasWarning = result.diagnostics.some((d) => d.code === 'XMLDECL001')
        expect(hasWarning).toBe(false)
      })
    })
  })

  describe('tag-matching rule', () => {
    it('should detect mismatched tags', () => {
      const xml = '<?xml version="1.0"?><root><tag>content</root>'
      const result = ValidationEngine.validate(xml)
      const hasError = result.diagnostics.some((d) => d.code?.includes('TAGMATCH'))
      expect(hasError).toBe(true)
      expect(result.valid).toBe(false)
    })

    it('should detect unclosed tags', () => {
      const xml = '<?xml version="1.0"?><root><tag>content</root>'
      const result = ValidationEngine.validate(xml)
      const hasError = result.diagnostics.some(
        (d) => d.message.includes('unclosed') || d.message.includes('Unclosed')
      )
      expect(hasError).toBe(true)
    })

    it('should pass with balanced tags', () => {
      const xml = '<?xml version="1.0"?><root><tag>content</tag></root>'
      const result = ValidationEngine.validate(xml)
      const hasTagMatchError = result.diagnostics.some((d) => d.code?.includes('TAGMATCH'))
      expect(hasTagMatchError).toBe(false)
    })

    it('should count opening and closing tags correctly', () => {
      const xml = '<?xml version="1.0"?><a><b/><c/></a>'
      const result = ValidationEngine.validate(xml)
      const hasError = result.diagnostics.some((d) => d.code?.includes('TAGMATCH'))
      expect(hasError).toBe(false)
    })
  })

  describe('tag-nesting rule', () => {
    it('should detect improper nesting', () => {
      const xml = '<?xml version="1.0"?><root><child1><child2></child1></child2></root>'
      const result = ValidationEngine.validate(xml)
      const hasError = result.diagnostics.some((d) => d.code?.includes('TAGNEST'))
      expect(hasError).toBe(true)
    })

    it('should pass with proper nesting', () => {
      const xml = '<?xml version="1.0"?><root><child1><nested>text</nested></child1></root>'
      const result = ValidationEngine.validate(xml)
      const hasNestingError = result.diagnostics.some((d) => d.code?.includes('TAGNEST'))
      expect(hasNestingError).toBe(false)
    })

    it('should handle multiple nesting levels', () => {
      const xml =
        '<?xml version="1.0"?><a><b><c><d>content</d></c></b></a>'
      const result = ValidationEngine.validate(xml)
      const hasError = result.diagnostics.some((d) => d.code?.includes('TAGNEST'))
      expect(hasError).toBe(false)
    })

    it('should detect unclosed nested tags', () => {
      const xml = '<?xml version="1.0"?><root><child><nested>text</nested></root>'
      const result = ValidationEngine.validate(xml)
      const hasError = result.diagnostics.some((d) => d.code?.includes('TAGNEST'))
      expect(hasError).toBe(true)
    })
  })

  describe('attribute-quotes rule', () => {
    it('should detect unquoted attribute values', () => {
      const xml = '<?xml version="1.0"?><root attr=value>content</root>'
      const result = ValidationEngine.validate(xml)
      const hasError = result.diagnostics.some((d) => d.code?.includes('ATTRQUOTE'))
      expect(hasError).toBe(true)
    })

    it('should pass with quoted attributes', () => {
      const xml = '<?xml version="1.0"?><root attr="value">content</root>'
      const result = ValidationEngine.validate(xml)
      const hasError = result.diagnostics.some((d) => d.code?.includes('ATTRQUOTE'))
      expect(hasError).toBe(false)
    })

    it('should accept single-quoted attributes', () => {
      const xml = "<?xml version=\"1.0\"?><root attr='value'>content</root>"
      const result = ValidationEngine.validate(xml)
      const hasError = result.diagnostics.some((d) => d.code?.includes('ATTRQUOTE'))
      expect(hasError).toBe(false)
    })

    it('should detect multiple unquoted attributes', () => {
      const xml = '<?xml version="1.0"?><root id=1 name=test>content</root>'
      const result = ValidationEngine.validate(xml)
      const errors = result.diagnostics.filter((d) => d.code?.includes('ATTRQUOTE'))
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('special-characters rule', () => {
    it('should warn about unescaped ampersand', () => {
      const xml = '<?xml version="1.0"?><root>AT&T</root>'
      const result = ValidationEngine.validate(xml)
      const hasWarning = result.diagnostics.some((d) => d.code?.includes('SPECCHAR'))
      expect(hasWarning).toBe(true)
    })

    it('should pass with escaped ampersand', () => {
      const xml = '<?xml version="1.0"?><root>AT&amp;T</root>'
      const result = ValidationEngine.validate(xml)
      const hasWarning = result.diagnostics.some((d) => d.code?.includes('SPECCHAR'))
      expect(hasWarning).toBe(false)
    })

    it('should detect unescaped less-than in content', () => {
      const xml = '<?xml version="1.0"?><root>value < 100</root>'
      const result = ValidationEngine.validate(xml)
      const hasWarning = result.diagnostics.some(
        (d) => d.code?.includes('SPECCHAR') && d.message.includes('<')
      )
      expect(hasWarning).toBe(true)
    })

    it('should pass with escaped less-than', () => {
      const xml = '<?xml version="1.0"?><root>value &lt; 100</root>'
      const result = ValidationEngine.validate(xml)
      const hasWarning = result.diagnostics.some(
        (d) => d.code?.includes('SPECCHAR') && d.message.includes('<')
      )
      expect(hasWarning).toBe(false)
    })

    it('should ignore special characters in tags', () => {
      const xml = '<?xml version="1.0"?><root attr="test &amp;">content</root>'
      const result = ValidationEngine.validate(xml)
      expect(result.diagnostics.some((d) => d.code?.includes('SPECCHAR'))).toBe(false)
    })
  })

  describe('validate method', () => {
    it('should return valid for correct XML', () => {
      const xml = '<?xml version="1.0"?><root><child>content</child></root>'
      const result = ValidationEngine.validate(xml)
      expect(result.valid).toBe(true)
      expect(result.diagnostics).toHaveLength(0)
    })

    it('should return invalid with multiple errors', () => {
      const xml = '<root attr=value><child>content</root>'
      const result = ValidationEngine.validate(xml)
      expect(result.valid).toBe(false)
      expect(result.diagnostics.length).toBeGreaterThan(0)
    })

    it('should aggregate all rule diagnostics', () => {
      const xml = '<root attr=value>AT&T</root>'
      const result = ValidationEngine.validate(xml)
      expect(result.diagnostics.length).toBeGreaterThan(0)
      // Should have multiple types of errors
      const errorCodes = result.diagnostics.map((d) => d.code)
      expect(errorCodes.length).toBeGreaterThan(1)
    })

    it('should include suggestions in diagnostics', () => {
      const xml = '<?xml version="1.0"?><root attr=value>content</root>'
      const result = ValidationEngine.validate(xml)
      const diagnostic = result.diagnostics.find((d) => d.code?.includes('ATTRQUOTE'))
      expect(diagnostic?.suggestion).toBeDefined()
      expect(diagnostic?.suggestion).toContain('quotes')
    })

    it('should set correct severity levels', () => {
      const xml = '<root>content</root>'
      const result = ValidationEngine.validate(xml)
      const warnings = result.diagnostics.filter((d) => d.severity === 'warning')
      const errors = result.diagnostics.filter((d) => d.severity === 'error')

      // Missing declaration is warning
      expect(warnings.some((w) => w.code === 'XMLDECL001')).toBe(true)
    })
  })

  describe('validateRule method', () => {
    it('should validate specific rule by ID', () => {
      const xml = '<root>content</root>'
      const result = ValidationEngine.validateRule('xml-declaration', xml)
      expect(result).not.toBeNull()
      expect(result?.diagnostics.length).toBeGreaterThan(0)
    })

    it('should return null for unknown rule', () => {
      const result = ValidationEngine.validateRule('nonexistent-rule', '<root/>')
      expect(result).toBeNull()
    })

    it('should validate each rule independently', () => {
      const xml = '<?xml version="1.0"?><root attr=value>content</root>'

      const declResult = ValidationEngine.validateRule('xml-declaration', xml)
      expect(declResult?.valid).toBe(true)

      const attrResult = ValidationEngine.validateRule('attribute-quotes', xml)
      expect(attrResult?.valid).toBe(false)
    })
  })

  describe('getRules method', () => {
    it('should return all available rules', () => {
      const rules = ValidationEngine.getRules()
      expect(rules.length).toBeGreaterThan(0)
    })

    it('should include all 5 validation rules', () => {
      const rules = ValidationEngine.getRules()
      const ruleIds = rules.map((r) => r.id)

      expect(ruleIds).toContain('xml-declaration')
      expect(ruleIds).toContain('tag-matching')
      expect(ruleIds).toContain('tag-nesting')
      expect(ruleIds).toContain('attribute-quotes')
      expect(ruleIds).toContain('special-characters')
    })

    it('should include rule metadata', () => {
      const rules = ValidationEngine.getRules()
      const rule = rules[0]

      expect(rule.id).toBeDefined()
      expect(rule.name).toBeDefined()
      expect(rule.severity).toBeDefined()
      expect(['error', 'warning', 'info']).toContain(rule.severity)
    })
  })

  describe('countBySeverity method', () => {
    it('should count diagnostics by severity', () => {
      const xml = '<root>AT&T</root>'
      const result = ValidationEngine.validate(xml)
      const counts = ValidationEngine.countBySeverity(result.diagnostics)

      expect(counts.errors).toBeGreaterThanOrEqual(0)
      expect(counts.warnings).toBeGreaterThanOrEqual(0)
      expect(counts.infos).toBeGreaterThanOrEqual(0)
    })

    it('should return zero counts for empty diagnostics', () => {
      const counts = ValidationEngine.countBySeverity([])
      expect(counts.errors).toBe(0)
      expect(counts.warnings).toBe(0)
      expect(counts.infos).toBe(0)
    })

    it('should differentiate between severity levels', () => {
      const xml = '<?xml version="1.0"?><root attr=value>AT&T</root>'
      const result = ValidationEngine.validate(xml)
      const counts = ValidationEngine.countBySeverity(result.diagnostics)

      // Should have at least one error (unquoted attr) and one warning (special char)
      expect(counts.errors).toBeGreaterThan(0)
      expect(counts.warnings).toBeGreaterThan(0)
    })
  })

  describe('real-world XML validation', () => {
    it('should validate Sims 4 mod XML', () => {
      const modsXml = `<?xml version="1.0" encoding="utf-8"?>
<ModuleInfo name="TestMod" version="1.0">
  <Description>Test Description</Description>
  <Author>Test Author</Author>
</ModuleInfo>`

      const result = ValidationEngine.validate(modsXml)
      expect(result.valid).toBe(true)
    })

    it('should catch common XML mistakes', () => {
      const badXml = `<?xml version="1.0"?>
<root attr=value>
  <unclosed>
  <mismatched>content</unclosed>
  AT&T reference
</root>`

      const result = ValidationEngine.validate(badXml)
      expect(result.valid).toBe(false)
      expect(result.diagnostics.length).toBeGreaterThan(0)
    })
  })
})
