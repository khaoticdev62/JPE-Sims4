/**
 * BrowserFileService unit tests
 *
 * @jest-environment jsdom
 */

import { BrowserFileService } from '@/services/BrowserFileService'

describe('BrowserFileService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Remove any mock electron
    delete (window as any).electron
  })

  describe('saveFile', () => {
    it('succeeds when Electron bridge is available', async () => {
      const writeFileMock = jest.fn().mockResolvedValue(undefined)
      ;(window as any).electron = {
        file: {
          writeFile: writeFileMock,
        },
      }

      const result = await BrowserFileService.saveFile('/path/test.xml', '<root />')

      expect(result.success).toBe(true)
      expect(writeFileMock).toHaveBeenCalledWith('/path/test.xml', '<root />')
    })

    it('returns error when Electron writeFile throws', async () => {
      ;(window as any).electron = {
        file: {
          writeFile: jest.fn().mockRejectedValue(new Error('Permission denied')),
        },
      }

      const result = await BrowserFileService.saveFile('/path/test.xml', '<root />')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Permission denied')
    })

    it('returns error when not in Electron environment', async () => {
      delete (window as any).electron

      const result = await BrowserFileService.saveFile('/path/test.xml', '<root />')

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'File save not available. Ensure JPE Studio is running as a desktop application.',
      )
    })

    it('passes content and path correctly to Electron', async () => {
      const writeFileMock = jest.fn().mockResolvedValue(undefined)
      ;(window as any).electron = {
        file: {
          writeFile: writeFileMock,
        },
      }

      await BrowserFileService.saveFile('/custom/path.xml', '<custom>content</custom>')

      expect(writeFileMock).toHaveBeenCalledWith('/custom/path.xml', '<custom>content</custom>')
    })

    it('handles non-Error exceptions gracefully', async () => {
      ;(window as any).electron = {
        file: {
          writeFile: jest.fn().mockRejectedValue('string error'),
        },
      }

      const result = await BrowserFileService.saveFile('/path/test.xml', '<root />')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Electron save failed')
    })
  })

  describe('isElectron', () => {
    it('returns false when not in Electron', () => {
      delete (window as any).electron
      expect(BrowserFileService.isElectron()).toBe(false)
    })

    it('returns true when electron is available', () => {
      ;(window as any).electron = { file: { writeFile: jest.fn() } }
      expect(BrowserFileService.isElectron()).toBe(true)
    })
  })
})
