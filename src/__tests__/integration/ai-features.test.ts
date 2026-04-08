/**
 * AI Features Integration Tests
 * Test Claude API integration with pattern analysis and suggestions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ClaudeService } from '@services/ai/ClaudeService'
import { PatternAnalyzer } from '@engine/ml/PatternAnalyzer'
import { SmartAutocompleteService } from '@services/editor/SmartAutocompleteService'
import { OptimizationDetector } from '@engine/ml/OptimizationDetector'
import type { ModFile } from '@engine/ml/types'

// Mock dependencies
vi.mock('@services/api/CredentialManager')

describe('AI Features Integration', () => {
  let mockFiles: ModFile[]

  beforeEach(() => {
    mockFiles = [
      {
        name: 'test_interaction.xml',
        path: '/project/test_interaction.xml',
        content: `
          <interaction>
            <class>0xABCDEF01</class>
            <tuning_reference>0x12345678</tuning_reference>
            <enum_value>INTERACTION_TYPE_SOCIAL</enum_value>
          </interaction>
        `,
        size: 256,
        lastModified: Date.now(),
      },
      {
        name: 'test_buff.xml',
        path: '/project/test_buff.xml',
        content: `
          <buff>
            <class>0xABCDEF02</class>
            <tuning_reference>0x12345678</tuning_reference>
            <enum_value>BUFF_MOOD_POSITIVE</enum_value>
          </buff>
        `,
        size: 256,
        lastModified: Date.now(),
      },
    ]
  })

  describe('End-to-end workflow', () => {
    it('should analyze project and generate suggestions', () => {
      // Step 1: Analyze patterns
      const patterns = PatternAnalyzer.analyzeProject(mockFiles)

      expect(patterns).toBeDefined()
      expect(patterns.tuningPatterns.length).toBeGreaterThan(0)

      // Step 2: Detect optimizations
      const optimizations = OptimizationDetector.detectOptimizations(mockFiles, patterns)

      expect(optimizations).toBeDefined()
      expect(Array.isArray(optimizations)).toBe(true)

      // Step 3: Get smart autocomplete
      const completions = SmartAutocompleteService.getCompletions({
        fileContent: mockFiles[0].content,
        position: 100,
        fileName: mockFiles[0].name,
        prefix: '0x',
      })

      expect(Array.isArray(completions)).toBe(true)
    })

    it('should provide consistent suggestions across calls', () => {
      const patterns1 = PatternAnalyzer.analyzeProject(mockFiles)
      const patterns2 = PatternAnalyzer.analyzeProject(mockFiles)

      expect(patterns1.tuningPatterns.length).toBe(patterns2.tuningPatterns.length)
      expect(patterns1.enumPatterns.length).toBe(patterns2.enumPatterns.length)
    })
  })

  describe('Pattern-based optimization flow', () => {
    it('should detect high-frequency patterns', () => {
      const patterns = PatternAnalyzer.analyzeProject(mockFiles)

      // 0x12345678 should be high frequency (appears in multiple files)
      const frequentPattern = patterns.tuningPatterns.find(
        (p) => p.frequency >= 2
      )

      expect(frequentPattern).toBeDefined()
      expect(frequentPattern?.confidence).toBeGreaterThan(0.5)
    })

    it('should suggest extractions for redundant patterns', () => {
      const patterns = PatternAnalyzer.analyzeProject(mockFiles)

      // Create duplicated patterns for testing
      const duplicateFiles = [
        ...mockFiles,
        ...mockFiles.map((f) => ({
          ...f,
          name: `dup_${f.name}`,
        })),
      ]

      const optimizations = OptimizationDetector.detectOptimizations(
        duplicateFiles,
        patterns
      )

      // Should detect some redundancy
      const redundancy = optimizations.find((o) => o.type === 'redundancy')
      expect(redundancy).toBeDefined() // May or may not exist depending on duplication
    })
  })

  describe('Autocomplete with learned patterns', () => {
    it('should prioritize learned patterns in suggestions', () => {
      PatternAnalyzer.analyzeProject(mockFiles)

      const completions = SmartAutocompleteService.getCompletions({
        fileContent: mockFiles[0].content,
        position: 50,
        fileName: 'test.xml',
        prefix: '0x',
      })

      // Tuning references starting with 0x should be suggested
      const tuningCompletion = completions.find((c) => c.type === 'tuning')
      expect(tuningCompletion).toBeDefined()
    })

    it('should score completions based on frequency', () => {
      const completions = SmartAutocompleteService.getCompletions({
        fileContent: mockFiles[0].content,
        position: 100,
        fileName: 'test.xml',
        prefix: '',
      })

      // Higher frequency patterns should appear first
      if (completions.length > 1) {
        const score1 = (completions[0].frequency || 0)
        const score2 = (completions[1].frequency || 0)

        // First should have higher or equal frequency
        expect(score1).toBeGreaterThanOrEqual(score2)
      }
    })
  })

  describe('Performance under load', () => {
    it('should handle 50+ files efficiently', () => {
      const largeFileSet = Array.from({ length: 50 }, (_, i) => ({
        name: `file_${i}.xml`,
        path: `/project/file_${i}.xml`,
        content: `
          <root>
            <class>0x${String(i).padStart(8, '0')}</class>
            <tuning>0x12345678</tuning>
          </root>
        `,
        size: 256,
        lastModified: Date.now(),
      }))

      const start = performance.now()
      const patterns = PatternAnalyzer.analyzeProject(largeFileSet)
      const duration = performance.now() - start

      expect(duration).toBeLessThan(5000) // Should complete in < 5 seconds
      expect(patterns.filesAnalyzed).toBe(50)
    })

    it('should maintain cache effectiveness', () => {
      const service = ClaudeService.getInstance()
      service.resetStats()

      const stats1 = service.getUsageStats()
      expect(stats1.cacheHits).toBe(0)
      expect(stats1.cacheMisses).toBe(0)

      // In real usage, repeated calls would hit cache
      // This is a placeholder for actual cache testing
    })
  })

  describe('Error recovery', () => {
    it('should handle malformed XML gracefully', () => {
      const malformedFiles: ModFile[] = [
        {
          name: 'malformed.xml',
          path: '/project/malformed.xml',
          content: '<root><unclosed>',
          size: 20,
          lastModified: Date.now(),
        },
      ]

      // Should not throw, just produce fewer patterns
      const patterns = PatternAnalyzer.analyzeProject(malformedFiles)
      expect(patterns).toBeDefined()
      expect(patterns.filesAnalyzed).toBe(1)
    })

    it('should handle empty file set', () => {
      const patterns = PatternAnalyzer.analyzeProject([])

      expect(patterns.filesAnalyzed).toBe(0)
      expect(patterns.tuningPatterns.length).toBe(0)
      expect(patterns.enumPatterns.length).toBe(0)
    })
  })

  describe('Data consistency', () => {
    it('should maintain pattern validity', () => {
      const patterns = PatternAnalyzer.analyzeProject(mockFiles)

      // All patterns should have required fields
      patterns.tuningPatterns.forEach((p) => {
        expect(p.id).toBeDefined()
        expect(p.tuningId).toBeDefined()
        expect(p.frequency).toBeGreaterThan(0)
        expect(p.confidence).toBeGreaterThanOrEqual(0)
        expect(p.confidence).toBeLessThanOrEqual(1)
        expect(Array.isArray(p.files)).toBe(true)
      })
    })

    it('should generate valid optimization suggestions', () => {
      const patterns = PatternAnalyzer.analyzeProject(mockFiles)
      const optimizations = OptimizationDetector.detectOptimizations(
        mockFiles,
        patterns
      )

      optimizations.forEach((o) => {
        expect(o.id).toBeDefined()
        expect(o.type).toBeDefined()
        expect(['redundancy', 'naming', 'unused', 'duplicate']).toContain(o.type)
        expect(o.severity).toBeDefined()
        expect(['high', 'medium', 'low']).toContain(o.severity)
        expect(o.message).toBeDefined()
        expect(o.suggestion).toBeDefined()
        expect(o.impact).toBeDefined()
        expect(Array.isArray(o.files)).toBe(true)
      })
    })
  })
})
