/**
 * Diagnostic Formatter Tests
 *
 * Tests for formatting validation errors into user-friendly diagnostics.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  DiagnosticFormatter,
  createDiagnosticFormatter,
} from '../DiagnosticFormatter'
import type { DiagnosticInput, DiagnosticRule } from '../types/diagnostic'

describe('Diagnostic Formatter', () => {
  let formatter: DiagnosticFormatter

  beforeEach(() => {
    formatter = new DiagnosticFormatter()
  })

  describe('Basic formatting', () => {
    it('should format a missing reference error', () => {
      const input: DiagnosticInput = {
        type: 'missing_reference',
        severity: 'error',
        message: 'Tuning reference not found',
        file: 'test.xml',
        line: 10,
        column: 5,
        value: '0x12345678',
      }

      const diagnostic = formatter.formatDiagnostic(input)

      expect(diagnostic.code).toBe('E001')
      expect(diagnostic.severity).toBe('error')
      expect(diagnostic.category).toBe('reference')
      expect(diagnostic.message).toContain('0x12345678')
      expect(diagnostic.suggestion).toBeTruthy()
    })

    it('should format an invalid STBL key error', () => {
      const input: DiagnosticInput = {
        type: 'invalid_stbl_key',
        severity: 'error',
        message: 'STBL key not found',
        file: 'test.xml',
        line: 15,
        column: 20,
        value: '0xAAAAAAAA',
      }

      const diagnostic = formatter.formatDiagnostic(input)

      expect(diagnostic.code).toBe('E002')
      expect(diagnostic.severity).toBe('error')
      expect(diagnostic.category).toBe('reference')
    })

    it('should format an invalid enum error', () => {
      const input: DiagnosticInput = {
        type: 'invalid_enum',
        severity: 'error',
        message: 'Invalid enum value',
        file: 'test.xml',
        line: 20,
        column: 10,
        value: 'INVALID_VALUE',
      }

      const diagnostic = formatter.formatDiagnostic(input)

      expect(diagnostic.code).toBe('E003')
      expect(diagnostic.severity).toBe('error')
    })

    it('should track location information', () => {
      const input: DiagnosticInput = {
        type: 'missing_reference',
        severity: 'error',
        message: 'Test',
        file: 'tuning/test.xml',
        line: 42,
        column: 100,
        value: '0x12345678',
      }

      const diagnostic = formatter.formatDiagnostic(input)

      expect(diagnostic.location.file).toBe('tuning/test.xml')
      expect(diagnostic.location.line).toBe(42)
      expect(diagnostic.location.column).toBe(100)
    })

    it('should include suggestion in diagnostic', () => {
      const input: DiagnosticInput = {
        type: 'missing_reference',
        severity: 'error',
        message: 'Reference not found',
        file: 'test.xml',
        line: 5,
        column: 0,
        value: '0x99999999',
      }

      const diagnostic = formatter.formatDiagnostic(input)

      expect(diagnostic.suggestion).toBeTruthy()
      expect(diagnostic.suggestion).toContain('0x99999999')
    })
  })

  describe('Multiple diagnostics', () => {
    it('should format multiple diagnostics', () => {
      const inputs: DiagnosticInput[] = [
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'Test 1',
          file: 'test.xml',
          line: 1,
          column: 0,
          value: '0x12345678',
        },
        {
          type: 'invalid_stbl_key',
          severity: 'error',
          message: 'Test 2',
          file: 'test.xml',
          line: 5,
          column: 0,
          value: '0xAAAAAAAA',
        },
      ]

      const diagnostics = formatter.formatDiagnostics(inputs)

      expect(diagnostics).toHaveLength(2)
      expect(diagnostics[0].code).toBe('E001')
      expect(diagnostics[1].code).toBe('E002')
    })

    it('should respect max diagnostics limit', () => {
      const fmt = createDiagnosticFormatter({ maxDiagnostics: 5 })

      const inputs: DiagnosticInput[] = Array.from({ length: 20 }, (_, i) => ({
        type: 'missing_reference',
        severity: 'error' as const,
        message: `Test ${i}`,
        file: 'test.xml',
        line: i + 1,
        column: 0,
        value: `0x${i.toString(16).padStart(8, '0')}`,
      }))

      const diagnostics = fmt.formatDiagnostics(inputs)

      expect(diagnostics.length).toBeLessThanOrEqual(5)
    })

    it('should process all diagnostics in report', () => {
      const inputs: DiagnosticInput[] = [
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'Test',
          file: 'test.xml',
          line: 100,
          column: 0,
          value: '0x12345678',
        },
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'Test',
          file: 'test.xml',
          line: 5,
          column: 0,
          value: '0x12345678',
        },
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'Test',
          file: 'test.xml',
          line: 50,
          column: 0,
          value: '0x12345678',
        },
      ]

      const report = formatter.createReport('test.xml', inputs)

      // All diagnostics should be included
      expect(report.errors).toHaveLength(3)
      expect(report.totalCount).toBe(3)
    })
  })

  describe('Report creation', () => {
    it('should create report with multiple diagnostics', () => {
      const inputs: DiagnosticInput[] = [
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'Error 1',
          file: 'test.xml',
          line: 1,
          column: 0,
          value: '0x12345678',
        },
        {
          type: 'invalid_stbl_key',
          severity: 'error',
          message: 'Error 2',
          file: 'test.xml',
          line: 2,
          column: 0,
          value: '0xAAAAAAAA',
        },
      ]

      const report = formatter.createReport('test.xml', inputs)

      expect(report.file).toBe('test.xml')
      expect(report.errors).toHaveLength(2)
      expect(report.totalCount).toBe(2)
    })

    it('should calculate statistics correctly', () => {
      const inputs: DiagnosticInput[] = [
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'E1',
          file: 'test.xml',
          line: 1,
          column: 0,
          value: '0x12345678',
        },
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'E2',
          file: 'test.xml',
          line: 2,
          column: 0,
          value: '0x87654321',
        },
        {
          type: 'invalid_stbl_key',
          severity: 'error',
          message: 'E3',
          file: 'test.xml',
          line: 3,
          column: 0,
          value: '0xAAAAAAAA',
        },
      ]

      const report = formatter.createReport('test.xml', inputs)

      expect(report.stats.totalErrors).toBe(3)
      expect(report.stats.totalWarnings).toBe(0)
      expect(report.stats.byCategory.reference).toBe(3)
    })

    it('should identify diagnostic categories', () => {
      const inputs: DiagnosticInput[] = [
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'Ref error',
          file: 'test.xml',
          line: 1,
          column: 0,
          value: '0x12345678',
        },
        {
          type: 'invalid_enum',
          severity: 'warning',
          message: 'Semantic warning',
          file: 'test.xml',
          line: 2,
          column: 0,
          value: 'TEST',
        },
      ]

      const report = formatter.createReport('test.xml', inputs)

      expect(report.stats.byCategory.reference).toBe(1)
      expect(report.stats.byCategory.semantic).toBe(1)
    })
  })

  describe('String formatting', () => {
    it('should format diagnostic as readable string', () => {
      const input: DiagnosticInput = {
        type: 'missing_reference',
        severity: 'error',
        message: 'Tuning reference not found',
        file: 'tuning/test.xml',
        line: 10,
        column: 5,
        value: '0x12345678',
      }

      const diagnostic = formatter.formatDiagnostic(input)
      const str = formatter.formatAsString(diagnostic)

      expect(str).toContain('❌')
      expect(str).toContain('ERROR')
      expect(str).toContain('[E001]')
      expect(str).toContain('tuning/test.xml:10:5')
      expect(str).toContain('Suggestion')
    })

    it('should format report as readable string', () => {
      const inputs: DiagnosticInput[] = [
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'Test',
          file: 'test.xml',
          line: 1,
          column: 0,
          value: '0x12345678',
        },
      ]

      const report = formatter.createReport('test.xml', inputs)
      const str = formatter.formatReportAsString(report)

      expect(str).toContain('test.xml')
      expect(str).toContain('❌ Errors')
      expect(str).toContain('Summary')
      expect(str).toContain('1 errors')
    })

    it('should include summary statistics in report string', () => {
      const inputs: DiagnosticInput[] = [
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'E1',
          file: 'test.xml',
          line: 1,
          column: 0,
          value: '0x12345678',
        },
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'E2',
          file: 'test.xml',
          line: 2,
          column: 0,
          value: '0x87654321',
        },
        {
          type: 'invalid_stbl_key',
          severity: 'warning',
          message: 'W1',
          file: 'test.xml',
          line: 3,
          column: 0,
          value: '0xAAAAAAAA',
        },
      ]

      const report = formatter.createReport('test.xml', inputs)
      const str = formatter.formatReportAsString(report)

      expect(str).toContain('3 errors')
      expect(str).toContain('0 warnings')
    })
  })

  describe('Configuration', () => {
    it('should apply severity overrides', () => {
      const fmt = createDiagnosticFormatter({
        ruleSeverityOverrides: { E001: 'warning' },
      })

      const input: DiagnosticInput = {
        type: 'missing_reference',
        severity: 'error',
        message: 'Test',
        file: 'test.xml',
        line: 1,
        column: 0,
        value: '0x12345678',
      }

      const diagnostic = fmt.formatDiagnostic(input)

      expect(diagnostic.severity).toBe('warning')
    })

    it('should include documentation links when enabled', () => {
      const fmt = createDiagnosticFormatter({ includeDocs: true })

      const input: DiagnosticInput = {
        type: 'missing_reference',
        severity: 'error',
        message: 'Test',
        file: 'test.xml',
        line: 1,
        column: 0,
        value: '0x12345678',
      }

      const diagnostic = fmt.formatDiagnostic(input)

      expect(diagnostic.docLink).toBeTruthy()
      expect(diagnostic.docLink).toContain('https')
    })

    it('should update configuration', () => {
      formatter.setConfig({ maxDiagnostics: 10 })

      const inputs = Array.from({ length: 20 }, (_, i) => ({
        type: 'missing_reference' as const,
        severity: 'error' as const,
        message: `Test ${i}`,
        file: 'test.xml',
        line: i + 1,
        column: 0,
        value: `0x${i.toString(16).padStart(8, '0')}`,
      }))

      const diagnostics = formatter.formatDiagnostics(inputs)

      expect(diagnostics.length).toBeLessThanOrEqual(10)
    })
  })

  describe('Custom rules', () => {
    it('should register custom rule', () => {
      const customRule: DiagnosticRule = {
        code: 'C001',
        name: 'Custom Rule',
        description: 'A custom test rule',
        category: 'other',
        severity: 'warning',
        matchPattern: (type) => type === 'custom_error',
        formatMessage: () => 'Custom error message',
        generateSuggestion: () => 'Custom suggestion',
      }

      formatter.registerRule(customRule)

      const input: DiagnosticInput = {
        type: 'custom_error',
        severity: 'warning',
        message: 'Test',
        file: 'test.xml',
        line: 1,
        column: 0,
        value: 'test',
      }

      const diagnostic = formatter.formatDiagnostic(input)

      expect(diagnostic.code).toBe('C001')
      expect(diagnostic.message).toBe('Custom error message')
    })

    it('should get all registered rules', () => {
      const rules = formatter.getRules()

      expect(rules.length).toBeGreaterThan(0)
      expect(rules.some((r) => r.code === 'E001')).toBe(true)
      expect(rules.some((r) => r.code === 'E002')).toBe(true)
    })
  })

  describe('Unknown error types', () => {
    it('should handle unknown error types', () => {
      const input: DiagnosticInput = {
        type: 'unknown_error_type',
        severity: 'warning',
        message: 'Unknown error',
        file: 'test.xml',
        line: 1,
        column: 0,
        value: 'test',
      }

      const diagnostic = formatter.formatDiagnostic(input)

      expect(diagnostic.code).toMatch(/^E\d+$/)
      expect(diagnostic.severity).toBe('warning')
      expect(diagnostic.message).toBe('Unknown error')
    })

    it('should reuse error code for same unknown type', () => {
      const input1: DiagnosticInput = {
        type: 'my_custom_error',
        severity: 'error',
        message: 'Test 1',
        file: 'test.xml',
        line: 1,
        column: 0,
        value: 'value1',
      }

      const input2: DiagnosticInput = {
        type: 'my_custom_error',
        severity: 'error',
        message: 'Test 2',
        file: 'test.xml',
        line: 2,
        column: 0,
        value: 'value2',
      }

      const diag1 = formatter.formatDiagnostic(input1)
      const diag2 = formatter.formatDiagnostic(input2)

      expect(diag1.code).toBe(diag2.code)
    })
  })

  describe('Helper function', () => {
    it('should create formatter via helper function', () => {
      const fmt = createDiagnosticFormatter()

      expect(fmt).toBeDefined()
      expect(fmt instanceof DiagnosticFormatter).toBe(true)
    })

    it('should pass config to helper function', () => {
      const fmt = createDiagnosticFormatter({ maxDiagnostics: 15 })

      const inputs = Array.from({ length: 30 }, (_, i) => ({
        type: 'missing_reference' as const,
        severity: 'error' as const,
        message: `Test ${i}`,
        file: 'test.xml',
        line: i + 1,
        column: 0,
        value: `0x${i.toString(16).padStart(8, '0')}`,
      }))

      const diagnostics = fmt.formatDiagnostics(inputs)

      expect(diagnostics.length).toBeLessThanOrEqual(15)
    })
  })

  describe('Real-world scenarios', () => {
    it('should format realistic validation errors', () => {
      const inputs: DiagnosticInput[] = [
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'Missing trait reference',
          file: 'mods/my_trait.xml',
          line: 15,
          column: 8,
          value: '0xDEADBEEF',
          suggestion: 'Check if the base game trait file is included',
        },
        {
          type: 'invalid_stbl_key',
          severity: 'error',
          message: 'String key not found',
          file: 'mods/my_trait.xml',
          line: 20,
          column: 12,
          value: '0xBEEFCAFE',
        },
      ]

      const report = formatter.createReport('mods/my_trait.xml', inputs)

      expect(report.file).toBe('mods/my_trait.xml')
      expect(report.errors).toHaveLength(2)
      expect(report.stats.totalErrors).toBe(2)
    })

    it('should format mixed error and warning diagnostics', () => {
      // Create a formatter with severity override to convert E002 to warning
      const fmtWithOverride = createDiagnosticFormatter({
        ruleSeverityOverrides: { E002: 'warning' },
      })

      const inputs: DiagnosticInput[] = [
        {
          type: 'missing_reference',
          severity: 'error',
          message: 'Critical error',
          file: 'test.xml',
          line: 1,
          column: 0,
          value: '0x12345678',
        },
        {
          type: 'invalid_stbl_key',
          severity: 'error',
          message: 'Non-critical warning',
          file: 'test.xml',
          line: 2,
          column: 0,
          value: '0xWARNING',
        },
      ]

      const report = fmtWithOverride.createReport('test.xml', inputs)
      const str = fmtWithOverride.formatReportAsString(report)

      expect(str).toContain('❌ Errors')
      expect(str).toContain('⚠️  Warnings')
      expect(str).toContain('Summary: 1 errors, 1 warnings')
    })
  })

  describe('Performance', () => {
    it('should format large number of diagnostics quickly', () => {
      const inputs: DiagnosticInput[] = Array.from({ length: 500 }, (_, i) => ({
        type: 'missing_reference',
        severity: 'error',
        message: `Error ${i}`,
        file: `file${i % 10}.xml`,
        line: (i % 100) + 1,
        column: 0,
        value: `0x${i.toString(16).padStart(8, '0')}`,
      }))

      const start = performance.now()
      const diagnostics = formatter.formatDiagnostics(inputs)
      const duration = performance.now() - start

      expect(diagnostics.length).toBeLessThanOrEqual(500)
      expect(duration).toBeLessThan(100) // Should complete in <100ms
    })
  })
})
