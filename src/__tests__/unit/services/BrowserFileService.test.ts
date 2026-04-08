/**
 * BrowserFileService unit tests
 *
 * @jest-environment jsdom
 */

import { BrowserFileService } from '@/services/BrowserFileService'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('BrowserFileService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Remove any mock electron
    delete (window as any).electron
  })

  describe('saveFile', () => {
    it('uses server API when not in Electron', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, size: 100 }),
      })

      const result = await BrowserFileService.saveFile('/path/test.xml', '<root />')

      expect(result.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/path/test.xml', content: '<root />', createBackup: true }),
      })
    })

    it('creates backup by default', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, backupPath: '/path/test.xml.backup-123' }),
      })

      const result = await BrowserFileService.saveFile('/path/test.xml', '<root />')

      expect(result.success).toBe(true)
      expect(result.backupPath).toBe('/path/test.xml.backup-123')
    })

    it('can disable backup', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      await BrowserFileService.saveFile('/path/test.xml', '<root />', { createBackup: false })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/files/save',
        expect.objectContaining({
          body: expect.stringContaining('"createBackup":false'),
        })
      )
    })

    it('returns error when server fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Permission denied' }),
      })

      const result = await BrowserFileService.saveFile('/path/test.xml', '<root />')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Permission denied')
    })

    it('returns error on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await BrowserFileService.saveFile('/path/test.xml', '<root />')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('isElectron', () => {
    it('returns false when not in Electron', () => {
      expect(BrowserFileService.isElectron()).toBe(false)
    })

    it('returns true when electron is available', () => {
      ;(window as any).electron = { file: { writeFile: jest.fn() } }
      expect(BrowserFileService.isElectron()).toBe(true)
    })
  })
})
