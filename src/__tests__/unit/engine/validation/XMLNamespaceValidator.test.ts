import {
  XMLNamespaceValidator,
  validateXmlNamespaces,
  validateAndFixNamespaces,
  SIMS4_STANDARD_NAMESPACES,
} from '@/engine/validation/XMLNamespaceValidator'

describe('XMLNamespaceValidator', () => {
  describe('validate', () => {
    it('should return valid for XML with all required namespaces', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<C I="0x00000001" n="test" xmlns:t="http://schemas.ea.com/sims4/tuning">
  <V t="name" n="value" />
</C>`

      const validator = new XMLNamespaceValidator()
      const result = validator.validate(xml)

      expect(result.valid).toBe(true)
      expect(result.missing).toHaveLength(0)
      expect(result.malformed).toHaveLength(0)
    })

    it('should detect missing required namespaces', () => {
      const xml = '<?xml version="1.0"?><root><child/></root>'

      const validator = new XMLNamespaceValidator()
      const result = validator.validate(xml)

      expect(result.valid).toBe(false)
      expect(result.missing.length).toBeGreaterThan(0)
      expect(result.missing.some((ns) => ns.prefix === 't')).toBe(true)
    })

    it('should detect malformed namespaces', () => {
      const xml =
        '<?xml version="1.0"?><root xmlns:t=""><child/></root>'

      const validator = new XMLNamespaceValidator()
      const result = validator.validate(xml)

      expect(result.malformed.length).toBeGreaterThan(0)
      expect(result.malformed[0].issue).toContain('Empty')
    })

    it('should auto-fix missing namespaces', () => {
      const xml = '<?xml version="1.0"?><root><child/></root>'

      const validator = new XMLNamespaceValidator()
      const result = validator.validate(xml)

      expect(result.fixedXml).toBeDefined()
      expect(result.fixedXml).toContain('xmlns:t=')
      expect(result.fixesApplied.length).toBeGreaterThan(0)
    })

    it('should handle XML without root element', () => {
      const xml = ''

      const validator = new XMLNamespaceValidator()
      const result = validator.validate(xml)

      expect(result.valid).toBe(false)
      expect(result.malformed.some((m) => m.issue.includes('root'))).toBe(true)
    })
  })

  describe('validateAndFix', () => {
    it('should return original XML if already valid', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<C xmlns:t="http://schemas.ea.com/sims4/tuning" />`

      const validator = new XMLNamespaceValidator()
      const result = validator.validateAndFix(xml)

      expect(result).toBe(xml)
    })

    it('should fix XML with missing namespaces', () => {
      const xml = '<?xml version="1.0"?><root><child/></root>'

      const validator = new XMLNamespaceValidator()
      const result = validator.validateAndFix(xml)

      expect(result).toContain('xmlns:t=')
      expect(result).not.toBe(xml)
    })

    it('should preserve existing valid namespaces', () => {
      const xml = `<?xml version="1.0"?>
<root xmlns:c="http://example.com/cas"><child/></root>`

      const validator = new XMLNamespaceValidator(
        { ...SIMS4_STANDARD_NAMESPACES, c: 'http://example.com/cas' },
        ['t'],
      )
      const result = validator.validateAndFix(xml)

      expect(result).toContain('xmlns:c=')
      expect(result).toContain('xmlns:t=')
    })
  })

  describe('namespace registry', () => {
    it('should allow adding custom namespaces', () => {
      const validator = new XMLNamespaceValidator()
      validator.addNamespace('custom', 'http://example.com/custom')

      expect(validator.isNamespaceRegistered('custom')).toBe(true)
      expect(validator.getRegisteredNamespaces()).toHaveProperty(
        'custom',
        'http://example.com/custom',
      )
    })

    it('should return all registered namespaces', () => {
      const validator = new XMLNamespaceValidator()
      const namespaces = validator.getRegisteredNamespaces()

      expect(namespaces).toEqual(SIMS4_STANDARD_NAMESPACES)
    })

    it('should check if namespace is registered', () => {
      const validator = new XMLNamespaceValidator()

      expect(validator.isNamespaceRegistered('t')).toBe(true)
      expect(validator.isNamespaceRegistered('nonexistent')).toBe(false)
    })
  })

  describe('Sims 4 standard namespaces', () => {
    it('should have tuning namespace', () => {
      expect(SIMS4_STANDARD_NAMESPACES.t).toBe(
        'http://schemas.ea.com/sims4/tuning',
      )
    })

    it('should have CAS namespace', () => {
      expect(SIMS4_STANDARD_NAMESPACES.c).toBe(
        'http://schemas.ea.com/sims4/cas',
      )
    })

    it('should have animation namespace', () => {
      expect(SIMS4_STANDARD_NAMESPACES.a).toBe(
        'http://schemas.ea.com/sims4/animation',
      )
    })
  })

  describe('real-world Sims 4 XML scenarios', () => {
    it('should validate interaction tuning XML', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<C I="0x00000001" n="interaction_chat" xmlns:t="http://schemas.ea.com/sims4/tuning">
  <V t="name" n="0x00000002" />
  <L>
    <V t="test" n="0x00000003" />
  </L>
</C>`

      const validator = new XMLNamespaceValidator()
      const result = validator.validate(xml)

      expect(result.valid).toBe(true)
    })

    it('should validate buff tuning XML', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<C I="0x00000004" n="buff_happy" xmlns:t="http://schemas.ea.com/sims4/tuning">
  <V t="buff_name" n="Happy" />
</C>`

      const validator = new XMLNamespaceValidator()
      const result = validator.validate(xml)

      expect(result.valid).toBe(true)
    })

    it('should handle complex nested tuning XML', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<C I="0x00000005" n="complex_interaction" xmlns:t="http://schemas.ea.com/sims4/tuning">
  <V t="name" n="Complex Interaction" />
  <L>
    <V t="required_trait" n="0x00000006" />
    <L>
      <V t="buff_check" n="0x00000007" />
      <V t="relationship_check" n="0x00000008" />
    </L>
  </L>
</C>`

      const validator = new XMLNamespaceValidator()
      const result = validator.validate(xml)

      expect(result.valid).toBe(true)
    })
  })
})

describe('validateXmlNamespaces convenience function', () => {
  it('should validate XML namespaces', () => {
    const xml = '<?xml version="1.0"?><root><child/></root>'
    const result = validateXmlNamespaces(xml)

    expect(result.valid).toBe(false)
    expect(result.missing.length).toBeGreaterThan(0)
  })
})

describe('validateAndFixNamespaces convenience function', () => {
  it('should fix XML namespaces', () => {
    const xml = '<?xml version="1.0"?><root><child/></root>'
    const result = validateAndFixNamespaces(xml)

    expect(result).toContain('xmlns:t=')
  })
})
