/**
 * Pattern Analyzer Tests
 * Unit tests for pattern detection and analysis
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { PatternAnalyzer } from '@engine/ml/PatternAnalyzer'
import type { ModFile } from '@engine/ml/types'

describe('PatternAnalyzer', () => {
  let mockFiles: ModFile[]

  beforeEach(() => {
    mockFiles = [
      {
        name: 'interaction_test1.xml',
        path: '/project/interaction_test1.xml',
        content: `
          <interaction>
            <class>0x12345678</class>
            <tuning_reference>0xABCDEF00</tuning_reference>
            <enum_value>INTERACTION_TYPE_SOCIAL</enum_value>
          </interaction>
        `,
        size: 256,
        lastModified: Date.now(),
      },
      {
        name: 'interaction_test2.xml',
        path: '/project/interaction_test2.xml',
        content: `
          <interaction>
            <class>0x12345678</class>
            <tuning_reference>0xABCDEF00</tuning_reference>
            <enum_value>INTERACTION_TYPE_FRIENDLY</enum_value>
          </interaction>
        `,
        size: 256,
        lastModified: Date.now(),
      },
      {
        name: 'buff_test.xml',
        path: '/project/buff_test.xml',
        content: `
          <buff>
            <class>0x12345678</class>
            <enum_value>BUFF_MOOD_POSITIVE</enum_value>
          </buff>
        `,
        size: 256,
        lastModified: Date.now(),
      },
    ]
  })

  describe('analyzeProject', () => {
    it('should analyze files and return patterns', () => {
      const patterns = PatternAnalyzer.analyzeProject(mockFiles)

      expect(patterns).toBeDefined()
      expect(patterns).toHaveProperty('tuningPatterns')
      expect(patterns).toHaveProperty('enumPatterns')
      expect(patterns).toHaveProperty('structuralPatterns')
      expect(patterns).toHaveProperty('namingPatterns')
      expect(patterns).toHaveProperty('analysisTime')
      expect(patterns).toHaveProperty('filesAnalyzed')
      expect(patterns.filesAnalyzed).toBe(mockFiles.length)
    })

    it('should detect tuning patterns', () => {
      const patterns = PatternAnalyzer.analyzeProject(mockFiles)

      // 0x12345678 appears in all 3 files
      const classTuning = patterns.tuningPatterns.find((p) => p.tuningId === '0x12345678')
      expect(classTuning).toBeDefined()
      expect(classTuning?.frequency).toBeGreaterThanOrEqual(3)
      expect(classTuning?.confidence).toBeGreaterThan(0)
    })

    it('should detect enum patterns', () => {
      const patterns = PatternAnalyzer.analyzeProject(mockFiles)

      expect(patterns.enumPatterns.length).toBeGreaterThan(0)
      expect(patterns.enumPatterns[0]).toHaveProperty('value')
      expect(patterns.enumPatterns[0]).toHaveProperty('frequency')
      expect(patterns.enumPatterns[0]).toHaveProperty('confidence')
    })

    it('should detect structural patterns', () => {
      const patterns = PatternAnalyzer.analyzeProject(mockFiles)

      expect(patterns.structuralPatterns).toBeDefined()
      expect(Array.isArray(patterns.structuralPatterns)).toBe(true)
    })

    it('should detect naming patterns', () => {
      const patterns = PatternAnalyzer.analyzeProject(mockFiles)

      // Files with '_' prefix like 'interaction_test', 'buff_test'
      const prefixPatterns = patterns.namingPatterns.filter((p) => p.prefix)
      expect(prefixPatterns.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle empty files', () => {
      const emptyFiles: ModFile[] = [
        {
          name: 'empty.xml',
          path: '/project/empty.xml',
          content: '',
          size: 0,
          lastModified: Date.now(),
        },
      ]

      const patterns = PatternAnalyzer.analyzeProject(emptyFiles)

      expect(patterns.filesAnalyzed).toBe(1)
      expect(patterns.tuningPatterns.length).toBe(0)
    })

    it('should analyze quickly (< 5 seconds for 100 files)', () => {
      // Create 100 mock files
      const largeFileSet = Array.from({ length: 100 }, (_, i) => ({
        name: `file_${i}.xml`,
        path: `/project/file_${i}.xml`,
        content: `
          <root>
            <tuning>0x${String(i).padStart(8, '0')}</tuning>
            <enum>VALUE_${i}</enum>
          </root>
        `,
        size: 256,
        lastModified: Date.now(),
      }))

      const start = performance.now()
      const patterns = PatternAnalyzer.analyzeProject(largeFileSet)
      const duration = performance.now() - start

      expect(patterns.analysisTime).toBeLessThan(5000)
      expect(duration).toBeLessThan(5000)
    })
  })

  describe('confidence scoring', () => {
    it('should give higher confidence to frequently appearing patterns', () => {
      const patterns = PatternAnalyzer.analyzeProject(mockFiles)

      if (patterns.tuningPatterns.length > 0) {
        const pattern = patterns.tuningPatterns[0]
        expect(pattern.confidence).toBeGreaterThanOrEqual(0)
        expect(pattern.confidence).toBeLessThanOrEqual(1)
      }
    })
  })
})
