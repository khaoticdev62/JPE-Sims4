/**
 * TS4Rebels Service Bridge Tests
 *
 * Verifies that the service correctly uses Electron IPC
 * when running in Electron environment.
 *
 * @jest-environment jsdom
 */

import { TS4RebelsService } from '@/services/api/TS4RebelsService'
import { mockElectron, clearElectronMock } from '../../../mocks/electronMock'

describe('TS4RebelsService Bridge Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearElectronMock()
  })

  describe('In Electron Environment', () => {
    it('should use native bridge for login', async () => {
      const electronMock = mockElectron()
      electronMock.invoke.mockResolvedValue({
        success: true,
        data: { ok: true }
      })

      const result = await TS4RebelsService.login('user', 'pass')

      expect(electronMock.invoke).toHaveBeenCalledWith('login', {
        username: 'user',
        password: 'pass'
      })
      expect(result.success).toBe(true)
    })

    it('should use native bridge for listForum', async () => {
      const electronMock = mockElectron()
      electronMock.invoke.mockResolvedValue({
        success: true,
        data: { topics: [] }
      })

      await TS4RebelsService.listForum(59, 2, 'mock-cookies')

      expect(electronMock.invoke).toHaveBeenCalledWith('forum', {
        forum: '59',
        page: '2',
        cookies: 'mock-cookies'
      })
    })

    it('should use native bridge for getTopic', async () => {
      const electronMock = mockElectron()
      electronMock.invoke.mockResolvedValue({
        success: true,
        data: { posts: [] }
      })

      await TS4RebelsService.getTopic(123, 1, 'mock-cookies')

      expect(electronMock.invoke).toHaveBeenCalledWith('topic', {
        topic: '123',
        page: '1',
        cookies: 'mock-cookies'
      })
    })

    it('should handle IPC errors gracefully', async () => {
      const electronMock = mockElectron()
      electronMock.invoke.mockRejectedValue(new Error('Python not found'))

      const result = await TS4RebelsService.login('user', 'pass')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Python not found')
    })
  })

  describe('When Electron API Unavailable', () => {
    it('should return error when bridge is missing', async () => {
      // Ensure window.electron is undefined
      clearElectronMock()

      const result = await TS4RebelsService.login('user', 'pass')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Native TS4Rebels bridge not available')
    })
  })
})
