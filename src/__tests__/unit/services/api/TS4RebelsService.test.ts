/**
 * TS4Rebels Service Tests - IPC Only
 *
 * Verifies that the service correctly uses Electron IPC
 * and handles errors gracefully.
 *
 * @jest-environment jsdom
 */

import { TS4RebelsService } from '@/services/api/TS4RebelsService'
import { mockElectron, clearElectronMock } from '../../../mocks/electronMock'

describe('TS4RebelsService (Electron IPC)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearElectronMock()
  })

  describe('login', () => {
    it('should use native bridge for login', async () => {
      const electronMock = mockElectron()
      electronMock.invoke.mockResolvedValue({
        success: true,
        data: { ok: true, cookies: { session: 'abc123' }, diagnostics: [] }
      })

      const result = await TS4RebelsService.login('user', 'pass')

      expect(electronMock.invoke).toHaveBeenCalledWith('login', {
        username: 'user',
        password: 'pass'
      })
      expect(result.success).toBe(true)
      expect(result.data.ok).toBe(true)
    })

    it('should handle IPC errors gracefully', async () => {
      const electronMock = mockElectron()
      electronMock.invoke.mockRejectedValue(new Error('Python not found'))

      const result = await TS4RebelsService.login('user', 'pass')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Python not found')
    })

    it('should handle IPC returning failure', async () => {
      const electronMock = mockElectron()
      electronMock.invoke.mockResolvedValue({
        success: false,
        data: { ok: false, cookies: {}, diagnostics: [] },
        error: 'Authentication failed'
      })

      const result = await TS4RebelsService.login('user', 'wrong')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Authentication failed')
    })
  })

  describe('listForum', () => {
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

    it('should handle IPC errors gracefully', async () => {
      const electronMock = mockElectron()
      electronMock.invoke.mockRejectedValue(new Error('Network error'))

      const result = await TS4RebelsService.listForum(59)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })
  })

  describe('getTopic', () => {
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
      electronMock.invoke.mockRejectedValue(new Error('Topic not found'))

      const result = await TS4RebelsService.getTopic(123)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Topic not found')
    })
  })

  describe('error handling when bridge unavailable', () => {
    it('should return error when Electron API missing', async () => {
      // Ensure window.electron is undefined
      clearElectronMock()

      const result = await TS4RebelsService.login('user', 'pass')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Native TS4Rebels bridge not available')
    })
  })
})
