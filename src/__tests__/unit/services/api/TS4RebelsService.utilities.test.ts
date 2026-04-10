/**
 * TS4Rebels Service - Pure Utility Tests
 *
 * Tests for extractDownloadLinks and other pure utility functions.
 * These are environment-agnostic and don't require Electron IPC or fetch.
 */

import {
  TS4RebelsService,
  TS4RebelsPost,
  TS4RebelsLink,
} from '@/services/api/TS4RebelsService'

describe('TS4RebelsService Utilities', () => {
  describe('extractDownloadLinks', () => {
    const createMockPost = (links: TS4RebelsLink[]): TS4RebelsPost => ({
      post_id: 1,
      author: 'test-user',
      created_at: '2026-04-06',
      links,
    })

    it('should extract simfileshare links', () => {
      const posts = [
        createMockPost([
          { url: 'https://www.simfileshare.net/download/12345/', host: 'simfileshare.net', kind: 'external', label: 'Download' },
        ]),
      ]

      const result = TS4RebelsService.extractDownloadLinks(posts)

      expect(result.length).toBe(1)
      expect(result[0].url).toContain('simfileshare')
    })

    it('should extract mega.nz links', () => {
      const posts = [
        createMockPost([
          { url: 'https://mega.nz/file/abc123', host: 'mega.nz', kind: 'external', label: 'Mega Download' },
        ]),
      ]

      const result = TS4RebelsService.extractDownloadLinks(posts)

      expect(result.length).toBe(1)
      expect(result[0].url).toContain('mega.nz')
    })

    it('should extract google drive links', () => {
      const posts = [
        createMockPost([
          { url: 'https://drive.google.com/drive/folders/xyz', host: 'google.com', kind: 'external', label: 'Google Drive' },
        ]),
      ]

      const result = TS4RebelsService.extractDownloadLinks(posts)

      expect(result.length).toBe(1)
      expect(result[0].url).toContain('google.com')
    })

    it('should exclude ts4rebels.cc internal links', () => {
      const posts = [
        createMockPost([
          { url: 'https://ts4rebels.cc/topic/123', host: 'ts4rebels.cc', kind: 'internal', label: 'View Topic' },
          { url: 'https://www.simfileshare.net/download/12345/', host: 'simfileshare.net', kind: 'external', label: 'Download' },
        ]),
      ]

      const result = TS4RebelsService.extractDownloadLinks(posts)

      expect(result.length).toBe(1)
      expect(result[0].url).not.toContain('ts4rebels.cc')
    })

    it('should deduplicate URLs', () => {
      const posts = [
        createMockPost([
          { url: 'https://www.simfileshare.net/download/12345/', host: 'simfileshare.net', kind: 'external', label: 'Download 1' },
          { url: 'https://www.simfileshare.net/download/12345/', host: 'simfileshare.net', kind: 'external', label: 'Download 2' },
        ]),
      ]

      const result = TS4RebelsService.extractDownloadLinks(posts)

      expect(result.length).toBe(1)
    })

    it('should handle empty posts array', () => {
      const result = TS4RebelsService.extractDownloadLinks([])

      expect(result).toEqual([])
    })

    it('should handle posts with no links', () => {
      const posts = [
        createMockPost([]),
        createMockPost([]),
      ]

      const result = TS4RebelsService.extractDownloadLinks(posts)

      expect(result).toEqual([])
    })

    it('should extract links by label containing "download"', () => {
      const posts = [
        createMockPost([
          { url: 'https://unknown-host.com/file', host: 'unknown-host.com', kind: 'external', label: 'DOWNLOAD NOW' },
        ]),
      ]

      const result = TS4RebelsService.extractDownloadLinks(posts)

      expect(result.length).toBe(1)
    })

    it('should handle null labels', () => {
      const posts = [
        createMockPost([
          { url: 'https://unknown-host.com/file', host: 'unknown-host.com', kind: 'external', label: null },
        ]),
      ]

      const result = TS4RebelsService.extractDownloadLinks(posts)

      // Should not throw, but should not match (no download heuristic)
      expect(result).toEqual([])
    })
  })
})
