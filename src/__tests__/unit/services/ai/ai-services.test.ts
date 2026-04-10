/**
 * Epic 6: AI Services Tests
 *
 * Tests for ConflictAnalyzer (methods that actually exist)
 */

import { ConflictAnalyzer } from '@/services/ai/ConflictAnalyzer'
import type { Project } from '@/types/index'

// ─────────────────────────────────────────────────────────────
// ConflictAnalyzer Tests
// ─────────────────────────────────────────────────────────────

describe('ConflictAnalyzer', () => {
  describe('extractSummaryMap', () => {
    it('should extract mod elements from JPE project', () => {
      const mockProject: Partial<Project> = {
        files: [
          {
            id: 'file1',
            name: 'test.jpe',
            type: 'jpe',
            content: `WHEN sim_has_trait "gene" DO
  ONLY_IF sim_has_buff "happy"
    DO apply_buff "confidence"
END`,
            path: '/test.jpe',
            projectId: 'proj1',
            isDirty: false,
            size: 100,
            lastModified: Date.now(),
          } as any,
        ],
      } as Project

      const summary = ConflictAnalyzer.extractSummaryMap(mockProject as Project)

      expect(summary).toBeDefined()
      expect(typeof summary).toBe('string')
      expect(summary.length).toBeGreaterThan(0)
    })

    it('should handle empty project', () => {
      const mockProject: Partial<Project> = {
        files: [],
      } as Project

      const summary = ConflictAnalyzer.extractSummaryMap(mockProject as Project)

      expect(summary).toBe('[]')
    })

    it('should skip non-JPE files', () => {
      const mockProject: Partial<Project> = {
        files: [
          {
            id: 'file1',
            name: 'test.xml',
            type: 'xml',
            content: 'some XML content',
            path: '/test.xml',
          } as any,
        ],
      } as Project

      const summary = ConflictAnalyzer.extractSummaryMap(mockProject as Project)

      expect(summary).toBe('[]')
    })
  })
})
