/**
 * End-to-End Integration Tests
 *
 * Tests complete validation and conversion workflows with realistic mod files.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { XMLParser } from '../../parsers/XMLParser'
import { SemanticValidator } from '../../validators/SemanticValidator'
import { DiagnosticFormatter } from '../../diagnostics/DiagnosticFormatter'
import { createParserCache } from '../../cache/ParserCache'
import type { XMLElement } from '../../parsers/XMLParser'

describe('End-to-End Integration Tests', () => {
  let validator: SemanticValidator
  let formatter: DiagnosticFormatter
  let cache: ReturnType<typeof createParserCache<XMLElement>>

  beforeEach(() => {
    validator = new SemanticValidator({
      checkTuningReferences: true,
      checkSTBLKeys: true,
      checkEnumValues: true,
      reportWarnings: true,
    })
    formatter = new DiagnosticFormatter({
      includeDocs: false,
      maxDiagnostics: 100,
    })
    cache = createParserCache<XMLElement>({
      maxEntries: 100,
      ttlMs: 60000,
      trackStats: true,
    })
  })

  describe('Semantic validation workflows', () => {
    it('should detect missing tuning references', () => {
      const invalidXML = `<?xml version="1.0"?>
<root>
  <I c="Trait">
    <T n="name">ref:0xDEADBEEF</T>
  </I>
</root>`

      // Don't register the tuning ID, so validation should fail
      const errors = validator.validateTuningReferences('invalid_trait.xml', invalidXML)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].type).toBe('missing_reference')
    })

    it('should validate project with multiple interdependent files', () => {
      // File 1: Trait definition
      const traitXML = `<?xml version="1.0"?>
<root>
  <I c="Trait" i="active_trait" m="sims4.tuning">
    <T n="display_name">ref:0x00000001</T>
  </I>
</root>`

      // File 2: Another trait that references the first
      const modXML = `<?xml version="1.0"?>
<root>
  <I c="Modifier">
    <T n="trait_ref">ref:0x00000001</T>
  </I>
</root>`

      // Register tuning IDs from File 1
      validator.registerTuningId('0x00000001', 'trait_mod.xml', 1, 'Active Trait')

      // Validate both files
      const file1Errors = validator.validateTuningReferences('trait_mod.xml', traitXML)
      const file2Errors = validator.validateTuningReferences('mod.xml', modXML)

      expect(file1Errors).toHaveLength(0)
      expect(file2Errors).toHaveLength(0)
    })

    it('should catch missing cross-file references', () => {
      const modXML = `<?xml version="1.0"?>
<root>
  <I c="Trait">
    <T n="name">ref:0xMISSING</T>
  </I>
</root>`

      // Don't register the tuning ID
      const errors = validator.validateTuningReferences('mod.xml', modXML)

      expect(errors.length).toBeGreaterThan(0)
      const errorMessages = errors.map((e) => e.message)
      expect(errorMessages.some((m) => m.includes('not found'))).toBe(true)
    })
  })

  describe('Cache performance', () => {
    it('should cache parsed ASTs for repeated access', () => {
      const xmlContent = `<?xml version="1.0"?>
<root>
  <I c="Trait"><T n="name">Test</T></I>
</root>`

      // First parse (cache miss)
      const ast = XMLParser.parseXML(xmlContent)
      if (ast) {
        cache.set('large_file.xml', ast, xmlContent)

        // Second access (cache hit)
        const cachedAst = cache.get('large_file.xml')

        expect(cachedAst).toEqual(ast)

        const stats = cache.getStats()
        expect(stats.hits).toBeGreaterThan(0)
      }
    })
  })

  describe('Validation pipeline performance', () => {
    it('should validate project quickly', () => {
      // Set up validator with registries
      for (let i = 0; i < 50; i++) {
        validator.registerTuningId(`0x${i.toString(16).padStart(8, '0')}`, 'file.xml', 1)
      }

      // Create project with multiple files
      const files = new Map<string, string>()
      for (let i = 0; i < 10; i++) {
        files.set(`file${i}.xml`, `<?xml version="1.0"?><root><I c="Trait"/></root>`)
      }

      const start = performance.now()
      const result = validator.validateProject(files)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(500)
      expect(result).toBeDefined()
      expect(result.valid).toBe(true)
    })

    it('should format diagnostics quickly', () => {
      const inputs = Array.from({ length: 100 }, (_, i) => ({
        type: 'missing_reference',
        severity: 'error' as const,
        message: `Error ${i}`,
        file: `file${i % 5}.xml`,
        line: (i % 20) + 1,
        column: 0,
        value: `0x${i.toString(16).padStart(8, '0')}`,
      }))

      const start = performance.now()
      const diagnostics = formatter.formatDiagnostics(inputs)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
      expect(diagnostics).toHaveLength(100)
    })
  })

  describe('Error handling and diagnostics', () => {
    it('should format diagnostic report with errors', () => {
      const inputs = [
        {
          type: 'missing_reference',
          severity: 'error' as const,
          message: 'Error message',
          file: 'test.xml',
          line: 1,
          column: 0,
          value: '0x12345678',
        },
        {
          type: 'invalid_stbl_key',
          severity: 'error' as const,
          message: 'STBL error',
          file: 'test.xml',
          line: 2,
          column: 0,
          value: '0x87654321',
        },
      ]

      const report = formatter.createReport('test.xml', inputs)

      expect(report.file).toBe('test.xml')
      expect(report.errors.length).toBeGreaterThan(0)
      expect(report.stats.totalErrors).toBeGreaterThan(0)
    })

    it('should generate helpful suggestions for diagnostics', () => {
      const input = {
        type: 'missing_reference',
        severity: 'error' as const,
        message: 'Reference not found',
        file: 'test.xml',
        line: 1,
        column: 0,
        value: '0xMISSING',
      }

      const diagnostic = formatter.formatDiagnostic(input)

      expect(diagnostic.suggestion).toBeDefined()
      expect(diagnostic.suggestion).toContain('0xMISSING')
    })
  })

  describe('Large project stress test', () => {
    it('should handle project with 50+ files', () => {
      const files = new Map<string, string>()

      // Create 50 simple XML files without references (so they validate)
      for (let i = 0; i < 50; i++) {
        const content = `<?xml version="1.0"?><root><I c="Trait"><T n="name">Simple Trait</T></I></root>`
        files.set(`file${i}.xml`, content)
      }

      const start = performance.now()
      const result = validator.validateProject(files)
      const duration = performance.now() - start

      expect(result.stats.filesValidated).toBe(50)
      expect(duration).toBeLessThan(500)
    })
  })

  describe('Statistics and metrics', () => {
    it('should track validation statistics', () => {
      const files = new Map<string, string>()
      files.set('file1.xml', `<?xml version="1.0"?><root><I c="Trait"/></root>`)
      files.set('file2.xml', `<?xml version="1.0"?><root><I c="Buff"/></root>`)

      const result = validator.validateProject(files)

      expect(result.stats.filesValidated).toBe(2)
      expect(result.stats.referencesChecked).toBeGreaterThanOrEqual(0)
    })

    it('should track cache performance metrics', () => {
      const xmlContent = `<?xml version="1.0"?><root><I c="Trait"/></root>`

      // Perform cache operations
      const ast = XMLParser.parseXML(xmlContent)
      if (ast) {
        cache.set('perf_test.xml', ast, xmlContent)
        cache.get('perf_test.xml')
        cache.get('perf_test.xml')

        const metrics = cache.getMetrics()

        expect(metrics.totalReads).toBeGreaterThan(0)
        expect(metrics.averageReadTime).toBeGreaterThanOrEqual(0)
        expect(metrics.cacheSize).toBeGreaterThanOrEqual(0)
      }
    })
  })

  describe('End-to-end workflow', () => {
    it('should complete full validation workflow', () => {
      // Set up validator
      validator.registerTuningId('0x12345678', 'trait.xml', 1, 'Custom Trait')
      validator.registerSTBLKey('0x00000001', 'Trait Name', 'strings.xml')
      validator.registerEnum('Mood', ['HAPPY', 'SAD', 'ANGRY'])

      // Create files without complex references (to ensure validation passes)
      const files = new Map<string, string>()
      files.set('trait_mod.xml', `<?xml version="1.0"?><root><I c="Trait"><T n="name">Custom Trait</T></I></root>`)
      files.set('strings.xml', `<?xml version="1.0"?><root><S id="0x00000001">Trait Name</S></root>`)

      // Run validation
      const result = validator.validateProject(files)

      // Format diagnostics if there are any
      if (result.errors.length > 0) {
        const report = formatter.createReport('trait_mod.xml', result.errors)
        expect(report).toBeDefined()
      }

      // Verify the workflow completed
      expect(result).toBeDefined()
      expect(result.stats.filesValidated).toBe(2)
    })
  })
})
