import { describe, it, expect } from 'vitest'
import { ModuleDeclarationRule } from '../rules/ModuleDeclarationRule'
import { JpeSyntaxRule } from '../rules/JpeSyntaxRule'
import { DescriptionRequiredRule } from '../rules/DescriptionRequiredRule'

describe('JPE Validation Rules', () => {
  describe('ModuleDeclarationRule', () => {
    it('should pass if MODULE is present', () => {
      const content = 'MODULE: MyMod\nDESCRIPTION: "Test"'
      const result = ModuleDeclarationRule.check(content)
      expect(result.valid).toBe(true)
    })

    it('should pass if MODULE has comments before it', () => {
      const content = '// Comment\n\nMODULE: MyMod'
      const result = ModuleDeclarationRule.check(content)
      expect(result.valid).toBe(true)
    })

    it('should fail if MODULE is missing', () => {
      const content = 'DESCRIPTION: "Test"'
      const result = ModuleDeclarationRule.check(content)
      expect(result.valid).toBe(false)
      expect(result.diagnostics[0].message).toBe('Missing MODULE declaration')
    })
  })

  describe('DescriptionRequiredRule', () => {
    it('should pass if DESCRIPTION is present', () => {
      const content = 'MODULE: MyMod\nDESCRIPTION: "Test"'
      const result = DescriptionRequiredRule.check(content)
      expect(result.valid).toBe(true)
    })

    it('should fail if DESCRIPTION is missing', () => {
      const content = 'MODULE: MyMod'
      const result = DescriptionRequiredRule.check(content)
      expect(result.valid).toBe(false)
      expect(result.diagnostics[0].message).toBe('Missing DESCRIPTION (recommended)')
    })
  })

  describe('JpeSyntaxRule', () => {
    it('should pass for valid JPE syntax', () => {
      const content = '[Metadata]\ntype = "Trait"\nid = "123"'
      const result = JpeSyntaxRule.check(content)
      expect(result.valid).toBe(true)
    })

    it('should fail for invalid JPE syntax (missing quote)', () => {
      const content = '[Metadata]\ntype = "Trait"'
      const result = JpeSyntaxRule.check(content)
      expect(result.valid).toBe(false)
    })

    it('should fail for invalid JPE syntax (missing header bracket)', () => {
      const content = '[Metadata\ntype = "Trait"'
      const result = JpeSyntaxRule.check(content)
      expect(result.valid).toBe(false)
    })
  })
})
