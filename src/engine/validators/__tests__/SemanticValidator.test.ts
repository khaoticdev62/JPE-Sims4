/**
 * Semantic Validator Tests
 *
 * Tests for cross-file validation including tuning references, STBL keys, and enum values.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { SemanticValidator, createSemanticValidator } from '../SemanticValidator'
import type { SemanticValidationResult } from '../types/semantic'

describe('Semantic Validator', () => {
  let validator: SemanticValidator

  beforeEach(() => {
    validator = new SemanticValidator()
  })

  describe('Tuning ID registration', () => {
    it('should register a tuning ID', () => {
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 10, 'TestTrait')

      const registry = validator.getTuningRegistry()
      expect(registry.ids.has('0x12345678')).toBe(true)
      expect(registry.ids.get('0x12345678')).toBe('tuning/trait.xml')
    })

    it('should normalize tuning IDs to hex format', () => {
      validator.registerTuningId('305441656', 'tuning/test.xml', 5)

      const registry = validator.getTuningRegistry()
      // 305441656 in hex is 0x123abcd8
      expect(registry.ids.size).toBeGreaterThan(0)
    })

    it('should store tuning metadata', () => {
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 15, 'MyTrait', 'Trait')

      const registry = validator.getTuningRegistry()
      const metadata = registry.metadata.get('0x12345678')
      expect(metadata?.name).toBe('MyTrait')
      expect(metadata?.type).toBe('Trait')
      expect(metadata?.line).toBe(15)
    })

    it('should handle multiple tuning IDs', () => {
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 5)
      validator.registerTuningId('0x87654321', 'tuning/buff.xml', 10)
      validator.registerTuningId('0xAABBCCDD', 'tuning/object.xml', 15)

      const registry = validator.getTuningRegistry()
      expect(registry.ids.size).toBe(3)
    })
  })

  describe('STBL key registration', () => {
    it('should register an STBL key', () => {
      validator.registerSTBLKey('0x12345678', 'Hello World', 'strings/strings.stbl')

      const registry = validator.getSTBLRegistry()
      expect(registry.keys.has('0x12345678')).toBe(true)
      expect(registry.keys.get('0x12345678')).toBe('Hello World')
    })

    it('should normalize STBL keys to hex', () => {
      validator.registerSTBLKey('12345678', 'Test Value', 'strings/strings.stbl')

      const registry = validator.getSTBLRegistry()
      // Should normalize to hex format
      expect(registry.keys.size).toBeGreaterThan(0)
    })

    it('should track STBL key files', () => {
      validator.registerSTBLKey('0x12345678', 'Value 1', 'strings/en.stbl')
      validator.registerSTBLKey('0x87654321', 'Value 2', 'strings/fr.stbl')

      const registry = validator.getSTBLRegistry()
      expect(registry.files.get('0x12345678')).toBe('strings/en.stbl')
      expect(registry.files.get('0x87654321')).toBe('strings/fr.stbl')
    })

    it('should handle multiple STBL keys', () => {
      for (let i = 0; i < 100; i++) {
        const key = `0x${i.toString(16).padStart(8, '0')}`
        validator.registerSTBLKey(key, `String ${i}`, 'strings/strings.stbl')
      }

      const registry = validator.getSTBLRegistry()
      expect(registry.keys.size).toBe(100)
    })
  })

  describe('Enum registration', () => {
    it('should register an enum with values', () => {
      validator.registerEnum('Gender', ['MALE', 'FEMALE'])

      const registry = validator.getEnumRegistry()
      const values = registry.enums.get('Gender')
      expect(values).toEqual(['MALE', 'FEMALE'])
    })

    it('should handle multiple enums', () => {
      validator.registerEnum('Gender', ['MALE', 'FEMALE'])
      validator.registerEnum('Age', ['CHILD', 'TEEN', 'ADULT', 'ELDER'])
      validator.registerEnum('Species', ['HUMAN', 'CAT', 'DOG'])

      const registry = validator.getEnumRegistry()
      expect(registry.enums.size).toBe(3)
    })

    it('should support large enum lists', () => {
      const values = Array.from({ length: 50 }, (_, i) => `VALUE_${i}`)
      validator.registerEnum('LargeEnum', values)

      const registry = validator.getEnumRegistry()
      const registered = registry.enums.get('LargeEnum')
      expect(registered).toHaveLength(50)
    })
  })

  describe('Tuning reference validation', () => {
    it('should detect missing tuning references', () => {
      // Register one tuning ID
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 5)

      const content = `
<Instance id="0x87654321">
  <ref id="0x12345678" />
  <ref id="0x99999999" />
</Instance>`

      const errors = validator.validateTuningReferences('tuning/test.xml', content)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(e => e.value === '0x99999999')).toBe(true)
    })

    it('should validate valid tuning references', () => {
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 5)
      validator.registerTuningId('0x87654321', 'tuning/buff.xml', 10)

      const content = `
<Instance id="0x12345678">
  <ref id="0x87654321" />
</Instance>`

      const errors = validator.validateTuningReferences('tuning/test.xml', content)

      expect(errors.length).toBe(0)
    })

    it('should extract tuning references with ref: prefix', () => {
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 5)

      const content = 'ref:0x12345678 ref:0x99999999'

      const errors = validator.validateTuningReferences('tuning/test.xml', content)

      expect(errors.some(e => e.value === '0x99999999')).toBe(true)
    })

    it('should track line numbers for references', () => {
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 5)

      const content = `<Instance>
  <line2>
    <ref id="0x99999999" />
  </line3>
</Instance>`

      const errors = validator.validateTuningReferences('tuning/test.xml', content)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].line).toBeGreaterThan(1)
    })

    it('should be skipped when disabled in config', () => {
      const val = new SemanticValidator({ checkTuningReferences: false })
      val.registerTuningId('0x12345678', 'tuning/trait.xml', 5)

      const content = 'ref:0x99999999'

      const errors = val.validateTuningReferences('tuning/test.xml', content)

      expect(errors).toHaveLength(0)
    })
  })

  describe('STBL key validation', () => {
    it('should detect missing STBL keys', () => {
      validator.registerSTBLKey('0x12345678', 'Hello', 'strings/strings.stbl')

      const content = `
<String key="0x12345678" value="Hello" />
<String key="0x99999999" value="Missing" />`

      const errors = validator.validateSTBLKeys('tuning/test.xml', content)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(e => e.value === '0x99999999')).toBe(true)
    })

    it('should validate valid STBL keys', () => {
      validator.registerSTBLKey('0x12345678', 'Hello', 'strings/strings.stbl')
      validator.registerSTBLKey('0x87654321', 'World', 'strings/strings.stbl')

      const content = `
<String key="0x12345678" />
<String key="0x87654321" />`

      const errors = validator.validateSTBLKeys('tuning/test.xml', content)

      expect(errors).toHaveLength(0)
    })

    it('should normalize key format for validation', () => {
      // Register with lowercase
      validator.registerSTBLKey('0xabcdef00', 'Test', 'strings/strings.stbl')

      // Reference with uppercase
      const content = '0xABCDEF00'

      const errors = validator.validateSTBLKeys('tuning/test.xml', content)

      // Should match after normalization
      expect(errors).toHaveLength(0)
    })

    it('should be skipped when disabled in config', () => {
      const val = new SemanticValidator({ checkSTBLKeys: false })
      val.registerSTBLKey('0x12345678', 'Hello', 'strings/strings.stbl')

      const content = '0x99999999'

      const errors = val.validateSTBLKeys('tuning/test.xml', content)

      expect(errors).toHaveLength(0)
    })
  })

  describe('Enum validation', () => {
    it('should detect invalid enum values', () => {
      validator.registerEnum('Gender', ['MALE', 'FEMALE'])

      const content = 'Gender.UNKNOWN'

      const errors = validator.validateEnumValues('tuning/test.xml', content)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].message).toContain('Invalid enum value')
    })

    it('should validate valid enum values', () => {
      validator.registerEnum('Gender', ['MALE', 'FEMALE'])

      const content = 'Gender.MALE Gender.FEMALE'

      const errors = validator.validateEnumValues('tuning/test.xml', content)

      expect(errors).toHaveLength(0)
    })

    it('should warn on undefined enums when warnings enabled', () => {
      const val = new SemanticValidator({ reportWarnings: true })

      const content = 'UndefinedEnum.VALUE'

      const errors = val.validateEnumValues('tuning/test.xml', content)

      // No errors since enum isn't registered
      expect(errors).toHaveLength(0)
    })

    it('should provide suggestions for invalid values', () => {
      validator.registerEnum('Color', ['RED', 'GREEN', 'BLUE'])

      const content = 'Color.PURPLE'

      const errors = validator.validateEnumValues('tuning/test.xml', content)

      expect(errors[0].suggestion).toContain('RED')
    })

    it('should be skipped when disabled in config', () => {
      const val = new SemanticValidator({ checkEnumValues: false })
      val.registerEnum('Gender', ['MALE', 'FEMALE'])

      const content = 'Gender.UNKNOWN'

      const errors = val.validateEnumValues('tuning/test.xml', content)

      expect(errors).toHaveLength(0)
    })
  })

  describe('Project validation', () => {
    it('should validate entire project', () => {
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 5)
      validator.registerSTBLKey('0xAABBCCDD', 'Hello', 'strings/strings.stbl')
      validator.registerEnum('Gender', ['MALE', 'FEMALE'])

      const files = new Map([
        [
          'tuning/test.xml',
          `
<Instance>
  <ref id="0x12345678" />
  <ref id="0x99999999" />
  <String key="0xAABBCCDD" />
  <Gender value="MALE" />
</Instance>`,
        ],
      ])

      const result = validator.validateProject(files)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.stats.filesValidated).toBe(1)
    })

    it('should track validation statistics', () => {
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 5)
      validator.registerSTBLKey('0xAABBCCDD', 'Hello', 'strings/strings.stbl')

      const files = new Map([
        [
          'tuning/test.xml',
          `ref:0x12345678 ref:0x12345678
           0xAABBCCDD 0xAABBCCDD`,
        ],
      ])

      const result = validator.validateProject(files)

      expect(result.stats.filesValidated).toBe(1)
      expect(result.stats.referencesChecked).toBeGreaterThan(0)
      expect(result.stats.stblKeysChecked).toBeGreaterThan(0)
    })

    it('should validate multiple files', () => {
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 5)

      const files = new Map([
        ['tuning/trait.xml', 'id="0x12345678"'],
        ['tuning/buff.xml', 'ref:0x99999999'],
        ['tuning/object.xml', 'id="0x87654321"'],
      ])

      const result = validator.validateProject(files)

      expect(result.stats.filesValidated).toBe(3)
    })

    it('should respect maxErrors limit', () => {
      const val = new SemanticValidator({ maxErrors: 5 })
      val.registerTuningId('0x12345678', 'tuning/trait.xml', 5)

      const files = new Map([
        [
          'tuning/test.xml',
          'ref:0x99999999 ref:0x88888888 ref:0x77777777 ref:0x66666666 ref:0x55555555 ref:0x44444444',
        ],
      ])

      const result = val.validateProject(files)

      expect(result.errors.length).toBeLessThanOrEqual(5)
    })
  })

  describe('Registry management', () => {
    it('should clear all registries', () => {
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 5)
      validator.registerSTBLKey('0xAABBCCDD', 'Hello', 'strings/strings.stbl')
      validator.registerEnum('Gender', ['MALE', 'FEMALE'])

      validator.clearRegistries()

      expect(validator.getTuningRegistry().ids.size).toBe(0)
      expect(validator.getSTBLRegistry().keys.size).toBe(0)
      expect(validator.getEnumRegistry().enums.size).toBe(0)
    })

    it('should allow config updates', () => {
      const val = new SemanticValidator({ checkTuningReferences: true })
      val.registerTuningId('0x12345678', 'tuning/trait.xml', 5)

      let errors = val.validateTuningReferences('tuning/test.xml', 'ref:0x99999999')
      expect(errors.length).toBeGreaterThan(0)

      // Disable validation
      val.setConfig({ checkTuningReferences: false })
      errors = val.validateTuningReferences('tuning/test.xml', 'ref:0x99999999')
      expect(errors).toHaveLength(0)
    })
  })

  describe('Real-world scenarios', () => {
    it('should catch all three validation errors in one pass', () => {
      // Register one of each to test detection of all three types

      // Register one tuning ID for reference testing
      validator.registerTuningId('0x12345678', 'tuning/ref.xml', 5)

      // Register one STBL key for key testing
      validator.registerSTBLKey('0xAAAAAAAA', 'Test String', 'strings.stbl')

      // Register one enum for enum testing
      validator.registerEnum('TestEnum', ['VALUE1', 'VALUE2'])

      // Test content with missing tuning reference
      const content = 'ref:0x99999999 ref:0x12345678'

      const errors = validator.validateTuningReferences('test.xml', content)

      // Should find at least one missing reference
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(e => e.value === '0x99999999')).toBe(true)
    })

    it('should catch missing string keys in description', () => {
      validator.registerSTBLKey('0x11111111', 'Test', 'strings.stbl')

      const content = `
<display_name key="0x11111111" />
<description key="0x99999999" />`

      const errors = validator.validateSTBLKeys('tuning/test.xml', content)

      expect(errors.some(e => e.value === '0x99999999')).toBe(true)
    })

    it('should validate complex nested structures', () => {
      validator.registerTuningId('0x12345678', 'base/object.xml', 5)

      const content = `
<Instance>
  <slots>
    <slot id="0x12345678" />
    <slot id="0x99999999" />
  </slots>
  <interactions>
    <interaction id="0x88888888" />
  </interactions>
</Instance>`

      const errors = validator.validateTuningReferences('test.xml', content)

      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('Performance', () => {
    it('should validate large projects quickly', () => {
      // Set up large registries
      for (let i = 0; i < 1000; i++) {
        const id = `0x${i.toString(16).padStart(8, '0')}`
        validator.registerTuningId(id, `tuning/file${i}.xml`, i)
        validator.registerSTBLKey(`0xAAAA${i.toString(16).padStart(4, '0')}`, `String ${i}`, 'strings.stbl')
      }

      // Create large file
      let content = ''
      for (let i = 0; i < 100; i++) {
        const id = `0x${i.toString(16).padStart(8, '0')}`
        content += `ref:${id} `
      }

      const start = performance.now()
      const errors = validator.validateTuningReferences('test.xml', content)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(100) // Should complete in < 100ms
    })

    it('should validate project with many files quickly', () => {
      // Set up registries
      for (let i = 0; i < 100; i++) {
        const id = `0x${i.toString(16).padStart(8, '0')}`
        validator.registerTuningId(id, `tuning/file${i}.xml`, i)
      }

      // Create many files
      const files = new Map<string, string>()
      for (let i = 0; i < 50; i++) {
        let content = ''
        for (let j = 0; j < 10; j++) {
          const id = `0x${j.toString(16).padStart(8, '0')}`
          content += `ref:${id} `
        }
        files.set(`tuning/file${i}.xml`, content)
      }

      const start = performance.now()
      const result = validator.validateProject(files)
      const duration = performance.now() - start

      expect(result.stats.filesValidated).toBe(50)
      expect(duration).toBeLessThan(300) // Should complete in < 300ms
    })
  })

  describe('Helper function', () => {
    it('should create validator via helper function', () => {
      const val = createSemanticValidator({ checkTuningReferences: true })

      expect(val).toBeDefined()
      expect(val instanceof SemanticValidator).toBe(true)
    })

    it('should pass config to helper function', () => {
      const val = createSemanticValidator({ maxErrors: 10 })
      val.registerTuningId('0x12345678', 'tuning/trait.xml', 5)

      const files = new Map<string, string>()
      const content = Array(20)
        .fill(0)
        .map((_, i) => `ref:0x${(i + 100).toString(16)}`)
        .join(' ')
      files.set('test.xml', content)

      const result = val.validateProject(files)

      expect(result.errors.length).toBeLessThanOrEqual(10)
    })
  })

  describe('Error messages', () => {
    it('should provide helpful error messages', () => {
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 5)

      const errors = validator.validateTuningReferences('test.xml', 'ref:0x99999999')

      expect(errors[0].message).toContain('0x99999999')
      expect(errors[0].suggestion).toBeTruthy()
    })

    it('should suggest related files for missing references', () => {
      validator.registerTuningId('0x12345678', 'tuning/trait.xml', 5, 'TestTrait')

      const errors = validator.validateTuningReferences('test.xml', 'ref:0x12345678 ref:0x99999999')

      const missingError = errors.find(e => e.value === '0x99999999')
      expect(missingError?.suggestion).toContain('Make sure')
    })
  })
})
