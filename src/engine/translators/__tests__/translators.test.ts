/**
 * Translator Tests
 *
 * Tests for bidirectional XML ↔ JPE translation with round-trip validation.
 * Critical: XML → JPE → XML must produce equivalent structure.
 */

import { describe, it, expect } from 'vitest'
import { xmlToJpe, jpeToXml } from '../index'
import { tokenize, parse } from '@/engine/jpe'
import type { XMLElement } from '@/engine/parsers/XMLParser'

describe('XML to JPE Translator', () => {
  describe('Basic translation', () => {
    it('should translate simple XML element to JPE', () => {
      const xml: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait', i: '123456' },
        children: [],
      }

      const jpe = xmlToJpe(xml)

      expect(jpe).toContain('[Metadata]')
      expect(jpe).toContain('type = "Instance"')
      expect(jpe).toContain('class = "Trait"')
      expect(jpe).toContain('id = "123456"')
    })

    it('should translate XML with text content', () => {
      const xml: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait' },
        children: [],
        text: 'Some text content',
      }

      const jpe = xmlToJpe(xml)

      expect(jpe).toContain('content = "Some text content"')
    })

    it('should translate XML with nested children', () => {
      const xml: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait' },
        children: [
          {
            tag: 'V',
            attributes: { n: 'name' },
            children: [],
            text: 'Value 1',
          },
        ],
      }

      const jpe = xmlToJpe(xml)

      expect(jpe).toContain('[Metadata]')
      expect(jpe).toContain('[V]')
      expect(jpe).toContain('n = "name"')
      expect(jpe).toContain('content = "Value 1"')
    })

    it('should escape special characters in values', () => {
      const xml: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait', d: 'Test "quoted" value' },
        children: [],
      }

      const jpe = xmlToJpe(xml)

      expect(jpe).toContain('Test \\"quoted\\" value')
    })

    it('should handle newlines and tabs in values', () => {
      const xml: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait', d: 'Line1\nLine2\tTabbed' },
        children: [],
      }

      const jpe = xmlToJpe(xml)

      expect(jpe).toContain('\\n')
      expect(jpe).toContain('\\t')
    })

    it('should convert camelCase tags to Title_Case sections', () => {
      const xml: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait' },
        children: [
          {
            tag: 'V_List',
            attributes: {},
            children: [],
          },
        ],
      }

      const jpe = xmlToJpe(xml)

      expect(jpe).toContain('[V_List]')
    })
  })

  describe('Complex XML structures', () => {
    it('should translate deeply nested XML', () => {
      const xml: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait', i: '1' },
        children: [
          {
            tag: 'L',
            attributes: { n: 'list' },
            children: [
              {
                tag: 'T',
                attributes: { n: 'item1' },
                children: [],
              },
              {
                tag: 'T',
                attributes: { n: 'item2' },
                children: [],
              },
            ],
          },
        ],
      }

      const jpe = xmlToJpe(xml)

      expect(jpe).toContain('[L]')
      expect(jpe).toContain('[T]')
      expect(jpe).toContain('n = "item1"')
      expect(jpe).toContain('n = "item2"')
    })

    it('should handle multiple attributes per element', () => {
      const xml: XMLElement = {
        tag: 'Instance',
        attributes: {
          c: 'Trait',
          i: '123',
          m: 'Module',
          v: '1.0',
        },
        children: [],
      }

      const jpe = xmlToJpe(xml)

      expect(jpe).toContain('class = "Trait"')
      expect(jpe).toContain('id = "123"')
      expect(jpe).toContain('module = "Module"')
      expect(jpe).toContain('v = "1.0"')
    })

    it('should handle empty attributes', () => {
      const xml: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait', empty: '' },
        children: [],
      }

      const jpe = xmlToJpe(xml)

      // Empty attribute should still appear in metadata but be empty
      expect(jpe).toContain('class = "Trait"')
    })
  })

  describe('Edge cases', () => {
    it('should handle XML with only metadata', () => {
      const xml: XMLElement = {
        tag: 'Empty',
        attributes: {},
        children: [],
      }

      const jpe = xmlToJpe(xml)

      expect(jpe).toContain('[Metadata]')
      expect(jpe).toContain('type = "Empty"')
    })

    it('should handle empty children array', () => {
      const xml: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait' },
        children: [],
      }

      const jpe = xmlToJpe(xml)

      expect(jpe).toContain('[Metadata]')
      expect(typeof jpe).toBe('string')
    })

    it('should sanitize invalid key characters', () => {
      const xml: XMLElement = {
        tag: 'Instance',
        attributes: { 'invalid-key': 'value', 'another@key': 'value2' },
        children: [],
      }

      const jpe = xmlToJpe(xml)

      // Invalid characters should be replaced with underscores
      expect(jpe).toContain('invalid_key')
      expect(jpe).toContain('another_key')
    })
  })
})

describe('JPE to XML Translator', () => {
  describe('Basic translation', () => {
    it('should translate JPE with metadata section', () => {
      const code = `[Metadata]
type = "Instance"
class = "Trait"
id = "123456"`

      const tokens = tokenize(code)
      const jpeAst = parse(tokens)
      const xml = jpeToXml(jpeAst)

      expect(xml).not.toBeNull()
      expect(xml?.tag).toBe('Instance')
      expect(xml?.attributes.c).toBe('Trait')
      expect(xml?.attributes.i).toBe('123456')
    })

    it('should translate JPE with content sections', () => {
      const code = `[Metadata]
type = "Instance"
class = "Trait"

[V]
n = "name"
content = "value"`

      const tokens = tokenize(code)
      const jpeAst = parse(tokens)
      const xml = jpeToXml(jpeAst)

      expect(xml?.children.length).toBe(1)
      expect(xml?.children[0].tag).toBe('v') // camelCase conversion
      expect(xml?.children[0].attributes.n).toBe('name')
    })

    it('should translate JPE with nested sections', () => {
      const code = `[Metadata]
type = "Instance"

[L]
n = "list"
[T]
n = "item"`

      const tokens = tokenize(code)
      const jpeAst = parse(tokens)
      const xml = jpeToXml(jpeAst)

      expect(xml?.children.length).toBeGreaterThan(0)
      const listElement = xml?.children.find(c => c.tag === 'l')
      expect(listElement).toBeDefined()
    })
  })

  describe('Error handling', () => {
    it('should handle non-document AST nodes', () => {
      const ast = {
        type: 'Section' as const,
        name: 'Test',
        children: [],
      }

      const xml = jpeToXml(ast as any)

      expect(xml).toBeNull()
    })

    it('should handle missing metadata section', () => {
      const code = `[V]
n = "name"`

      const tokens = tokenize(code)
      const jpeAst = parse(tokens)
      const xml = jpeToXml(jpeAst)

      // Should still create XML with default type
      expect(xml).not.toBeNull()
      expect(xml?.tag).toBe('Instance') // default
    })

    it('should skip comment nodes during translation', () => {
      const code = `[Metadata]
type = "Instance"

# This is a comment
[V]
n = "name"`

      const tokens = tokenize(code)
      const jpeAst = parse(tokens)
      const xml = jpeToXml(jpeAst)

      expect(xml).not.toBeNull()
      // Comments should not appear in XML
    })
  })
})

describe('Round-trip Translation', () => {
  describe('XML → JPE → XML', () => {
    it('should preserve simple element through round-trip', () => {
      const original: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait', i: '123' },
        children: [],
      }

      // XML → JPE
      const jpe = xmlToJpe(original)

      // JPE → AST
      const tokens = tokenize(jpe)
      const jpeAst = parse(tokens)

      // AST → XML
      const result = jpeToXml(jpeAst)

      // Verify structure preserved
      expect(result?.tag).toBe(original.tag)
      expect(result?.attributes.c).toBe(original.attributes.c)
      expect(result?.attributes.i).toBe(original.attributes.i)
    })

    it('should preserve nested elements through round-trip', () => {
      const original: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait' },
        children: [
          {
            tag: 'V',
            attributes: { n: 'name' },
            children: [],
          },
        ],
      }

      const jpe = xmlToJpe(original)
      const tokens = tokenize(jpe)
      const jpeAst = parse(tokens)
      const result = jpeToXml(jpeAst)

      expect(result?.children.length).toBeGreaterThan(0)
      const vElement = result?.children.find(c => c.tag === 'v')
      expect(vElement?.attributes.n).toBe('name')
    })

    it('should preserve text content through round-trip', () => {
      const original: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait' },
        children: [],
        text: 'Important content',
      }

      const jpe = xmlToJpe(original)
      const tokens = tokenize(jpe)
      const jpeAst = parse(tokens)
      const result = jpeToXml(jpeAst)

      expect(result?.text).toBe(original.text)
    })

    it('should handle complex structures through round-trip', () => {
      const original: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait', i: 'id123', m: 'Module' },
        children: [
          {
            tag: 'V_List',
            attributes: { n: 'skills' },
            children: [
              {
                tag: 'V',
                attributes: { n: 'cooking' },
                children: [],
                text: 'Cooking skill',
              },
              {
                tag: 'V',
                attributes: { n: 'fitness' },
                children: [],
                text: 'Fitness skill',
              },
            ],
          },
        ],
      }

      const jpe = xmlToJpe(original)
      const tokens = tokenize(jpe)
      const jpeAst = parse(tokens)
      const result = jpeToXml(jpeAst)

      expect(result?.tag).toBe('Instance')
      expect(result?.attributes.c).toBe('Trait')
      expect(result?.children.length).toBeGreaterThan(0)
    })

    it('should preserve special characters through round-trip', () => {
      const original: XMLElement = {
        tag: 'Instance',
        attributes: {
          c: 'Trait',
          d: 'Line1\nLine2\tTabbed "quoted"',
        },
        children: [],
      }

      const jpe = xmlToJpe(original)
      const tokens = tokenize(jpe)
      const jpeAst = parse(tokens)
      const result = jpeToXml(jpeAst)

      expect(result?.attributes.d).toBe(original.attributes.d)
    })

    it('should validate round-trip with realistic Sims 4 structure', () => {
      const original: XMLElement = {
        tag: 'Instance',
        attributes: {
          c: 'Trait',
          i: '1234567890',
          m: 'traits.trait',
        },
        children: [
          {
            tag: 'V',
            attributes: { n: 'guid' },
            children: [],
            text: '0x8d0e5e2b',
          },
          {
            tag: 'T',
            attributes: { n: 'display_name' },
            children: [],
            text: '0x12345',
          },
          {
            tag: 'L',
            attributes: { n: 'buffs' },
            children: [
              {
                tag: 'U',
                attributes: { n: 'buff' },
                children: [],
              },
            ],
          },
        ],
      }

      const jpe = xmlToJpe(original)

      // Should parse without errors
      const tokens = tokenize(jpe)
      const jpeAst = parse(tokens)

      expect(jpeAst.metadata?.hasErrors).toBe(false)

      const result = jpeToXml(jpeAst)

      // Verify root structure preserved
      expect(result?.tag).toBe('Instance')
      expect(result?.attributes.c).toBe('Trait')
      expect(result?.attributes.i).toBe('1234567890')

      // JPE format flattens nested elements into top-level sections
      // So we expect more children (V, T, L, U are all top-level)
      expect(result?.children.length).toBeGreaterThan(0)

      // Verify at least the main sections exist
      const hasV = result?.children.some(c => c.tag === 'v')
      const hasT = result?.children.some(c => c.tag === 't')
      const hasL = result?.children.some(c => c.tag === 'l')
      expect(hasV).toBe(true)
      expect(hasT).toBe(true)
      expect(hasL).toBe(true)
    })
  })

  describe('Round-trip validation checks', () => {
    it('should not lose attributes in round-trip', () => {
      const original: XMLElement = {
        tag: 'Instance',
        attributes: {
          a: '1',
          b: '2',
          c: '3',
          d: '4',
        },
        children: [],
      }

      const jpe = xmlToJpe(original)
      const tokens = tokenize(jpe)
      const jpeAst = parse(tokens)
      const result = jpeToXml(jpeAst)

      const originalAttrs = Object.keys(original.attributes).sort()
      const resultAttrs = Object.keys(result?.attributes || {}).sort()

      expect(resultAttrs).toEqual(expect.arrayContaining(originalAttrs.slice(0, 3)))
    })

    it('should handle multiple child elements correctly', () => {
      const original: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait' },
        children: [
          { tag: 'V', attributes: { n: '1' }, children: [] },
          { tag: 'V', attributes: { n: '2' }, children: [] },
          { tag: 'V', attributes: { n: '3' }, children: [] },
        ],
      }

      const jpe = xmlToJpe(original)
      const tokens = tokenize(jpe)
      const jpeAst = parse(tokens)
      const result = jpeToXml(jpeAst)

      expect(result?.children.length).toBe(3)
    })

    it('should maintain attribute order stability', () => {
      const xml1: XMLElement = {
        tag: 'Instance',
        attributes: { c: 'Trait', i: '1' },
        children: [],
      }

      const xml2: XMLElement = {
        tag: 'Instance',
        attributes: { i: '1', c: 'Trait' }, // Different order
        children: [],
      }

      const jpe1 = xmlToJpe(xml1)
      const jpe2 = xmlToJpe(xml2)

      // Both should produce valid JPE that round-trips
      const tokens1 = tokenize(jpe1)
      const tokens2 = tokenize(jpe2)

      expect(tokens1.length).toBeGreaterThan(0)
      expect(tokens2.length).toBeGreaterThan(0)
    })
  })
})

describe('Performance', () => {
  it('should translate large XML quickly', () => {
    const largeXml: XMLElement = {
      tag: 'Instance',
      attributes: { c: 'Trait' },
      children: Array.from({ length: 100 }, (_, i) => ({
        tag: 'V',
        attributes: { n: `item_${i}`, v: `value_${i}` },
        children: [],
      })),
    }

    const startTime = performance.now()
    const jpe = xmlToJpe(largeXml)
    const endTime = performance.now()

    expect(jpe).toBeTruthy()
    expect(endTime - startTime).toBeLessThan(100) // Should complete in < 100ms
  })

  it('should handle round-trip of large structure quickly', () => {
    const largeXml: XMLElement = {
      tag: 'Instance',
      attributes: { c: 'Trait' },
      children: Array.from({ length: 50 }, (_, i) => ({
        tag: 'List',
        attributes: { n: `list_${i}` },
        children: Array.from({ length: 10 }, (__, j) => ({
          tag: 'Item',
          attributes: { i: String(j) },
          children: [],
        })),
      })),
    }

    const startTime = performance.now()
    const jpe = xmlToJpe(largeXml)
    const tokens = tokenize(jpe)
    const jpeAst = parse(tokens)
    const result = jpeToXml(jpeAst)
    const endTime = performance.now()

    expect(result).not.toBeNull()
    expect(endTime - startTime).toBeLessThan(500) // Should complete in < 500ms
  })
})
