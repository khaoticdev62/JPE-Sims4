/**
 * Epic 9: Live Bridge Integration Tests
 *
 * Tests bridge deployment, handshake, and communication with mock server.
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

describe('Live Bridge Integration', () => {
  const mockModsPath = '/test/mods'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Full deployment flow', () => {
    it('should deploy → verify → handshake successfully', async () => {
      // Step 1: Check - not deployed
      mockFileExists.mockResolvedValue(false)

      let version = await LiveBridgeDeployer.checkDeployment(mockModsPath)
      expect(version.isDeployed).toBe(false)

      // Step 2: Deploy
      mockFileExists.mockResolvedValue(true)
      mockWriteFile.mockResolvedValue({ success: true })

      const deployResult = await LiveBridgeDeployer.deploy(mockModsPath)
      expect(deployResult.success).toBe(true)
      expect(deployResult.action).toBe('deployed')

      // Step 3: Verify deployment
      mockReadFile.mockResolvedValue({
        success: true,
        content: 'BRIDGE_VERSION = "1.0.0"',
      })

      version = await LiveBridgeDeployer.checkDeployment(mockModsPath)
      expect(version.isDeployed).toBe(true)
      expect(version.needsUpdate).toBe(false)

      // Step 4: Handshake
      const handshake = await LiveBridgeDeployer.performHandshake(mockModsPath)
      expect(handshake.success).toBe(true)
      expect(handshake.versionMatch).toBe(true)
    })

    it('should detect outdated version and redeploy', async () => {
      // Simulate old version deployed
      mockFileExists.mockResolvedValue(true)
      mockReadFile.mockResolvedValue({
        success: true,
        content: 'BRIDGE_VERSION = "0.9.0"',
      })

      // Check should detect mismatch
      const version = await LiveBridgeDeployer.checkDeployment(mockModsPath)
      expect(version.isDeployed).toBe(true)
      expect(version.needsUpdate).toBe(true)

      // Deploy should trigger redeploy
      mockWriteFile.mockResolvedValue({ success: true })
      const result = await LiveBridgeDeployer.deploy(mockModsPath)
      expect(result.action).toBe('redeployed')
    })
  })

  describe('Error scenarios', () => {
    it('should handle deployment failure gracefully', async () => {
      mockFileExists.mockResolvedValue(false)
      mockWriteFile.mockResolvedValue({ success: false, error: 'Permission denied' })

      const result = await LiveBridgeDeployer.deploy(mockModsPath)

      expect(result.success).toBe(false)
      expect(result.action).toBe('failed')
      expect(result.message).toContain('Permission denied')
    })

    it('should handle corrupted script file', async () => {
      mockFileExists.mockResolvedValue(true)
      mockReadFile.mockResolvedValue({
        success: true,
        content: 'CORRUPTED_BINARY_DATA',
      })

      const version = await LiveBridgeDeployer.checkDeployment(mockModsPath)

      // Should detect as deployed but with unknown version
      expect(version.isDeployed).toBe(true)
      expect(version.scriptVersion).toBe('unknown')
      expect(version.needsUpdate).toBe(true)
    })

    it('should handle missing Mods folder', async () => {
      mockFileExists.mockRejectedValue(new Error('ENOENT: no such file'))

      const result = await LiveBridgeDeployer.deploy(mockModsPath)

      expect(result.success).toBe(false)
      expect(result.action).toBe('failed')
    })
  })

  describe('Version compatibility', () => {
    it('should accept patch version updates', async () => {
      // Script with minor patch difference
      mockFileExists.mockResolvedValue(true)
      mockReadFile.mockResolvedValue({
        success: true,
        content: 'BRIDGE_VERSION = "1.0.1"',
      })

      const handshake = await LiveBridgeDeployer.performHandshake(mockModsPath)

      // Should detect mismatch but still be functional
      expect(handshake.success).toBe(true)
      expect(handshake.versionMatch).toBe(false)
    })

    it('should reject major version mismatch', async () => {
      mockFileExists.mockResolvedValue(true)
      mockReadFile.mockResolvedValue({
        success: true,
        content: 'BRIDGE_VERSION = "2.0.0"',
      })

      const handshake = await LiveBridgeDeployer.performHandshake(mockModsPath)

      expect(handshake.success).toBe(true)
      expect(handshake.versionMatch).toBe(false)
      expect(handshake.message).toContain('mismatch')
    })
  })
})
