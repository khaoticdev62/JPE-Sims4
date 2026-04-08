/**
 * Parser Tests
 *
 * Tests for the JPE parser - conversion of token stream to AST.
 * Tests cover:
 * - Document and section parsing
 * - Assignment parsing
 * - Different value types
 * - Nested keys
 * - Error handling
 * - Complex JPE structures
 */

import { describe, it, expect } from 'vitest'
import { JPEParser } from '../parser'
import { tokenize } from '../lexer'

describe('JPE Parser', () => {
  describe('Document parsing', () => {
    it('should parse empty document', () => {
      const tokens = tokenize('')
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      expect(ast.type).toBe('Document')
      expect(ast.children).toHaveLength(0)
      expect(ast.metadata?.hasErrors).toBe(false)
    })

    it('should parse single section', () => {
      const tokens = tokenize('[Metadata]')
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      expect(ast.type).toBe('Document')
      expect(ast.children).toHaveLength(1)
      expect(ast.children?.[0].type).toBe('Section')
      expect(ast.children?.[0].name).toBe('Metadata')
    })

    it('should parse multiple sections', () => {
      const code = '[Section1]\n[Section2]\n[Section3]'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      expect(ast.children).toHaveLength(3)
      expect(ast.children?.[0].name).toBe('Section1')
      expect(ast.children?.[1].name).toBe('Section2')
      expect(ast.children?.[2].name).toBe('Section3')
    })
  })

  describe('Section parsing', () => {
    it('should parse section with content', () => {
      const code = '[Metadata]\ntype = "tuning"'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const section = ast.children?.[0]
      expect(section?.type).toBe('Section')
      expect(section?.name).toBe('Metadata')
      expect(section?.children?.length).toBeGreaterThan(0)
    })

    it('should parse section with multiple assignments', () => {
      const code = '[Config]\nkey1 = "value1"\nkey2 = 42\nkey3 = true'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const section = ast.children?.[0]
      expect(section?.children?.length).toBe(3)
    })
  })

  describe('Assignment parsing', () => {
    it('should parse simple assignment', () => {
      const code = '[Test]\nkey = "value"'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const assignment = ast.children?.[0].children?.[0]
      expect(assignment?.type).toBe('Assignment')
      expect(assignment?.key).toBe('key')
      expect(assignment?.value).toBe('value')
    })

    it('should parse nested key assignment', () => {
      const code = '[Config]\nparent.child.field = "value"'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const assignment = ast.children?.[0].children?.[0]
      expect(assignment?.key).toBe('parent.child.field')
    })

    it('should parse assignment with string value', () => {
      const code = '[Test]\nname = "John Doe"'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const assignment = ast.children?.[0].children?.[0]
      expect(assignment?.value).toBe('John Doe')
    })

    it('should parse assignment with number value', () => {
      const code = '[Test]\ncount = 42'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const assignment = ast.children?.[0].children?.[0]
      expect(assignment?.value).toBe(42)
    })

    it('should parse assignment with decimal number', () => {
      const code = '[Test]\nprice = 19.99'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const assignment = ast.children?.[0].children?.[0]
      expect(assignment?.value).toBe(19.99)
    })

    it('should parse assignment with boolean true', () => {
      const code = '[Test]\nenabled = true'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const assignment = ast.children?.[0].children?.[0]
      expect(assignment?.value).toBe(true)
    })

    it('should parse assignment with boolean false', () => {
      const code = '[Test]\ndisabled = false'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const assignment = ast.children?.[0].children?.[0]
      expect(assignment?.value).toBe(false)
    })

    it('should parse assignment with reference', () => {
      const code = '[Test]\nskill = ref:CookingSkill'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const assignment = ast.children?.[0].children?.[0]
      expect(assignment?.value?.type).toBe('Reference')
      expect(assignment?.value?.id).toBe('CookingSkill')
    })
  })

  describe('Comment handling', () => {
    it('should parse and preserve comments', () => {
      const code = '[Test]\n# This is a comment\nkey = value'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const section = ast.children?.[0]
      const hasComment = section?.children?.some(n => n.type === 'Comment')
      expect(hasComment).toBe(true)
    })

    it('should skip comments between sections', () => {
      const code = '[Section1]\n# Comment between sections\n[Section2]'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      expect(ast.children).toHaveLength(2)
    })
  })

  describe('Escape sequences', () => {
    it('should handle escaped newlines in strings', () => {
      const code = '[Test]\ndesc = "line1\\nline2"'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const assignment = ast.children?.[0].children?.[0]
      expect(assignment?.value).toContain('\n')
    })

    it('should handle escaped tabs', () => {
      const code = '[Test]\nformatted = "col1\\tcol2"'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const assignment = ast.children?.[0].children?.[0]
      expect(assignment?.value).toContain('\t')
    })

    it('should handle escaped quotes', () => {
      const code = '[Test]\nquote = "He said \\"hello\\""'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const assignment = ast.children?.[0].children?.[0]
      expect(assignment?.value).toContain('"')
    })
  })

  describe('Complex structures', () => {
    it('should parse realistic JPE document', () => {
      const code = `[Metadata]
type = "tuning"
version = "1.0"
author = "John Doe"

[Items]
count = 3
enabled = true
skill = ref:CookingSkill

[Localization]
en = "English Text"
fr = "French Text"`

      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      expect(ast.children).toHaveLength(3)
      expect(ast.children?.[0].name).toBe('Metadata')
      expect(ast.children?.[1].name).toBe('Items')
      expect(ast.children?.[2].name).toBe('Localization')
    })

    it('should handle empty sections', () => {
      const code = '[Empty]\n\n[Another]\nkey = value'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      expect(ast.children).toHaveLength(2)
      const emptySection = ast.children?.[0]
      expect(emptySection?.children?.length).toBe(0)
    })
  })

  describe('Error handling', () => {
    it('should handle missing section close bracket', () => {
      const code = '[Metadata'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      expect(ast.metadata?.hasErrors).toBe(true)
      expect(parser.getErrors().length).toBeGreaterThan(0)
    })

    it('should handle missing equals in assignment', () => {
      const code = '[Test]\nkey value'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      expect(parser.getErrors().length).toBeGreaterThan(0)
    })

    it('should collect multiple errors', () => {
      const code = '[Section1\n[Section2'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      expect(parser.getErrors().length).toBeGreaterThan(0)
    })
  })

  describe('Validation methods', () => {
    it('should report valid parse', () => {
      const tokens = tokenize('[Valid]\nkey = "value"')
      const parser = new JPEParser(tokens)
      parser.parse()

      expect(parser.isValid()).toBe(true)
    })

    it('should report invalid parse', () => {
      const tokens = tokenize('[Invalid')
      const parser = new JPEParser(tokens)
      parser.parse()

      expect(parser.isValid()).toBe(false)
    })
  })

  describe('Whitespace and formatting', () => {
    it('should handle extra whitespace', () => {
      const code = '[Test]   \n  key   =   "value"  '
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const assignment = ast.children?.[0].children?.[0]
      expect(assignment?.key).toBe('key')
      expect(assignment?.value).toBe('value')
    })

    it('should handle blank lines between sections', () => {
      const code = '[Section1]\n\n\n[Section2]'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      expect(ast.children).toHaveLength(2)
    })
  })

  describe('Line tracking in AST', () => {
    it('should track line numbers in AST nodes', () => {
      const code = '[Metadata]\nkey = value'
      const tokens = tokenize(code)
      const parser = new JPEParser(tokens)
      const _ast = parser.parse()

      const section = ast.children?.[0]
      expect(section?.metadata?.line).toBe(1)
    })
  })
})
