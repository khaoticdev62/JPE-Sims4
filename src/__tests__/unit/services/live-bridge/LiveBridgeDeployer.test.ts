/**
 * LiveBridgeDeployer Tests (Epic 9)
 *
 * Tests for bridge script deployment, version checking, and handshake.
 */

import { LiveBridgeDeployer } from '@/services/live-bridge/LiveBridgeDeployer'

// Mock FileService
const mockFileExists = jest.fn()
const mockReadFile = jest.fn()
const mockWriteFile = jest.fn()

jest.mock('@/services/FileService', () => ({
  FileService: {
    fileExists: (...args: any[]) => mockFileExists(...args),
    readFile: (...args: any[]) => mockReadFile(...args),
    writeFile: (...args: any[]) => mockWriteFile(...args),
  },
}))

describe('LiveBridgeDeployer', () => {
  const mockModsPath = '/test/mods'
  const mockScriptPath = '/test/mods/jpe_live_sync.ts4script'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkDeployment', () => {
    it('should return not deployed when script does not exist', async () => {
      mockFileExists.mockResolvedValue(false)

      const result = await LiveBridgeDeployer.checkDeployment(mockModsPath)

      expect(result.isDeployed).toBe(false)
      expect(result.deployedPath).toBeNull()
      expect(result.needsUpdate).toBe(false)
    })

    it('should detect deployed script with matching version', async () => {
      mockFileExists.mockResolvedValue(true)
      mockReadFile.mockResolvedValue({
        success: true,
        content: 'BRIDGE_VERSION = "1.0.0"',
      })

      const result = await LiveBridgeDeployer.checkDeployment(mockModsPath)

      expect(result.isDeployed).toBe(true)
      expect(result.scriptVersion).toBe('1.0.0')
      expect(result.needsUpdate).toBe(false)
    })

    it('should detect version mismatch', async () => {
      mockFileExists.mockResolvedValue(true)
      mockReadFile.mockResolvedValue({
        success: true,
        content: 'BRIDGE_VERSION = "0.9.0"',
      })

      const result = await LiveBridgeDeployer.checkDeployment(mockModsPath)

      expect(result.isDeployed).toBe(true)
      expect(result.scriptVersion).toBe('0.9.0')
      expect(result.needsUpdate).toBe(true)
    })

    it('should handle file read errors gracefully', async () => {
      mockFileExists.mockResolvedValue(true)
      mockReadFile.mockRejectedValue(new Error('Read failed'))

      const result = await LiveBridgeDeployer.checkDeployment(mockModsPath)

      expect(result.isDeployed).toBe(false)
      expect(result.scriptVersion).toBe('error')
    })
  })

  describe('deploy', () => {
    it('should deploy script when not present', async () => {
      mockFileExists.mockResolvedValue(false)
      mockWriteFile.mockResolvedValue({ success: true })

      const result = await LiveBridgeDeployer.deploy(mockModsPath)

      expect(result.success).toBe(true)
      expect(result.action).toBe('deployed')
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('jpe_live_sync'),
        expect.any(String),
      )
    })

    it('should skip deploy when already current', async () => {
      mockFileExists.mockResolvedValue(true)
      mockReadFile.mockResolvedValue({
        success: true,
        content: 'BRIDGE_VERSION = "1.0.0"',
      })

      const result = await LiveBridgeDeployer.deploy(mockModsPath)

      expect(result.success).toBe(true)
      expect(result.action).toBe('already-current')
      expect(mockWriteFile).not.toHaveBeenCalled()
    })

    it('should redeploy when version mismatch', async () => {
      mockFileExists.mockResolvedValue(true)
      mockReadFile.mockResolvedValue({
        success: true,
        content: 'BRIDGE_VERSION = "0.9.0"',
      })
      mockWriteFile.mockResolvedValue({ success: true })

      const result = await LiveBridgeDeployer.deploy(mockModsPath)

      expect(result.success).toBe(true)
      expect(result.action).toBe('redeployed')
      expect(mockWriteFile).toHaveBeenCalled()
    })

    it('should handle write failure', async () => {
      mockFileExists.mockResolvedValue(false)
      mockWriteFile.mockResolvedValue({ success: false, error: 'Disk full' })

      const result = await LiveBridgeDeployer.deploy(mockModsPath)

      expect(result.success).toBe(false)
      expect(result.action).toBe('failed')
      expect(result.message).toContain('Disk full')
    })
  })

  describe('performHandshake', () => {
    it('should succeed with matching version', async () => {
      mockFileExists.mockResolvedValue(true)
      mockReadFile.mockResolvedValue({
        success: true,
        content: 'BRIDGE_VERSION = "1.0.0"',
      })

      const result = await LiveBridgeDeployer.performHandshake(mockModsPath)

      expect(result.success).toBe(true)
      expect(result.versionMatch).toBe(true)
    })

    it('should fail when not deployed', async () => {
      mockFileExists.mockResolvedValue(false)

      const result = await LiveBridgeDeployer.performHandshake(mockModsPath)

      expect(result.success).toBe(false)
      expect(result.versionMatch).toBe(false)
      expect(result.message).toContain('not deployed')
    })

    it('should detect version mismatch during handshake', async () => {
      mockFileExists.mockResolvedValue(true)
      mockReadFile.mockResolvedValue({
        success: true,
        content: 'BRIDGE_VERSION = "0.9.0"',
      })

      const result = await LiveBridgeDeployer.performHandshake(mockModsPath)

      expect(result.success).toBe(true)
      expect(result.versionMatch).toBe(false)
      expect(result.message).toContain('mismatch')
    })
  })
})
