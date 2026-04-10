/**
 * Credential Manager Tests
 *
 * Tests for secure credential storage, retrieval, and deletion.
 */

// Mock SecurityService before importing CredentialManager
jest.mock('@/services/ai/SecurityService', () => ({
  SecurityService: {
    encrypt: jest.fn().mockImplementation(async (text) => `encrypted_${text}`),
    decrypt: jest.fn().mockImplementation(async (text) => text.replace('encrypted_', '')),
  },
}))

// Mock keytar (unavailable in test environment)
jest.mock('keytar', () => null, { virtual: true })

import { CredentialManager } from '@/services/api/CredentialManager'
import { SecurityService } from '@/services/ai/SecurityService'

describe('CredentialManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('saveCredential', () => {
    it('should throw if account is empty', async () => {
      await expect(CredentialManager.saveCredential('', 'test-key'))
        .rejects.toThrow('Account and password must not be empty')
    })

    it('should throw if password is empty', async () => {
      await expect(CredentialManager.saveCredential('test-account', ''))
        .rejects.toThrow('Account and password must not be empty')
    })
  })

  describe('getCredential', () => {
    it('should throw if account is empty', async () => {
      await expect(CredentialManager.getCredential(''))
        .rejects.toThrow('Account must not be empty')
    })

    it('should return null when credential does not exist', async () => {
      const result = await CredentialManager.getCredential('nonexistent-account')
      expect(result).toBeNull()
    })
  })

  describe('deleteCredential', () => {
    it('should throw if account is empty', async () => {
      await expect(CredentialManager.deleteCredential(''))
        .rejects.toThrow('Account must not be empty')
    })

    it('should return false when credential does not exist', async () => {
      const result = await CredentialManager.deleteCredential('nonexistent-account')
      expect(result).toBe(false)
    })
  })

  describe('isKeychainAvailable', () => {
    it('should return false when keytar is not available', async () => {
      const result = await CredentialManager.isKeychainAvailable()
      expect(result).toBe(false)
    })
  })

  describe('clearAllCredentials', () => {
    it('should not throw when clearing all credentials', async () => {
      await expect(CredentialManager.clearAllCredentials()).resolves.not.toThrow()
    })
  })
})
