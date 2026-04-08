/**
 * CredentialManager Unit Tests
 * 
 * Tests secure storage and disposal of API keys.
 * P0 Priority: Security-critical - must pass before any merge.
 */

import { CredentialManager } from '@/services/api/CredentialManager'

// Mock keytar with in-memory storage for tests
// (store is managed within the jest.mock block below)

jest.mock('keytar', () => {
  const store = new Map<string, string>()
  return {
    setPassword: jest.fn().mockImplementation(async (_service: string, _account: string, password: string) => {
      store.set(`${_service}:${_account}`, password)
    }),
    getPassword: jest.fn().mockImplementation(async (service: string, account: string) => {
      return store.get(`${service}:${account}`) || null
    }),
    deletePassword: jest.fn().mockImplementation(async (service: string, account: string) => {
      const key = `${service}:${account}`
      if (store.has(key)) {
        store.delete(key)
        return true
      }
      return false
    }),
  }
}, { virtual: true })

describe('CredentialManager (P0)', () => {
  beforeEach(async () => {
    // Clear all credentials before each test
    await CredentialManager.clearAllCredentials()
    // Reset mock state
    jest.clearAllMocks()
  })

  describe('Data Disposal - Single Provider', () => {
    it('should remove single provider key completely', async () => {
      const testKey = 'sk-test-openai-key-12345'
      
      // Save key
      await CredentialManager.saveKey('openai', testKey)
      
      // Verify it was saved
      const saved = await CredentialManager.getKey('openai')
      expect(saved).toBe(testKey)
      
      // Delete key
      await CredentialManager.deleteKey('openai')
      
      // Verify it's gone
      const deleted = await CredentialManager.getKey('openai')
      expect(deleted).toBeNull()
    })

    it('should be idempotent when clearing non-existent key', async () => {
      // Should not throw
      await expect(CredentialManager.deleteKey('nonexistent')).resolves.toBeDefined()
      
      // Verify it returns false/null for non-existent
      const result = await CredentialManager.getKey('nonexistent')
      expect(result).toBeNull()
    })

    it('should throw error when saving with empty provider or key', async () => {
      await expect(CredentialManager.saveKey('', 'some-key')).rejects.toThrow()
      await expect(CredentialManager.saveKey('openai', '')).rejects.toThrow()
      await expect(CredentialManager.saveKey('', '')).rejects.toThrow()
    })
  })

  describe('Data Disposal - All Providers', () => {
    it('should clear credentials for all known providers', async () => {
      const providers = ['claude', 'openai', 'gemini', 'qwen']
      const testKeys: Record<string, string> = {
        claude: 'sk-ant-claude-key-123',
        openai: 'sk-proj-openai-key-456',
        gemini: 'AIzaSyD-gemini-key-789',
        qwen: 'sk-qwen-key-012'
      }

      // Save all keys
      for (const [provider, key] of Object.entries(testKeys)) {
        await CredentialManager.saveKey(provider, key)
      }

      // Verify all saved
      for (const [provider, key] of Object.entries(testKeys)) {
        const saved = await CredentialManager.getKey(provider)
        expect(saved).toBe(key)
      }

      // Clear all
      await CredentialManager.clearAllCredentials()

      // Verify all deleted
      for (const provider of providers) {
        const deleted = await CredentialManager.getKey(provider)
        expect(deleted).toBeNull()
      }
    })

    it('should handle clearing when no credentials exist', async () => {
      const result = await CredentialManager.clearAllCredentials()
      // Should return false (didn't delete anything) but not throw
      expect(result).toBe(false)
    })
  })

  describe('Key Retrieval', () => {
    it('should return null for non-existent provider', async () => {
      const result = await CredentialManager.getKey('nonexistent')
      expect(result).toBeNull()
    })

    it('should return null for empty provider', async () => {
      const result = await CredentialManager.getKey('')
      expect(result).toBeNull()
    })

    it('should retrieve correct key when multiple providers saved', async () => {
      await CredentialManager.saveKey('openai', 'sk-openai-key')
      await CredentialManager.saveKey('claude', 'sk-claude-key')
      await CredentialManager.saveKey('gemini', 'AIzaSyD-gemini')

      expect(await CredentialManager.getKey('openai')).toBe('sk-openai-key')
      expect(await CredentialManager.getKey('claude')).toBe('sk-claude-key')
      expect(await CredentialManager.getKey('gemini')).toBe('AIzaSyD-gemini')
    })
  })

  describe('Legacy Claude Helpers', () => {
    it('should save and retrieve Claude key via legacy helper', async () => {
      await CredentialManager.saveClaudeAPIKey('sk-ant-legacy-key')
      const key = await CredentialManager.getClaudeAPIKey()
      expect(key).toBe('sk-ant-legacy-key')
    })

    it('should check Claude key existence correctly', async () => {
      expect(await CredentialManager.hasClaudeAPIKey()).toBe(false)
      
      await CredentialManager.saveClaudeAPIKey('sk-ant-test-key')
      expect(await CredentialManager.hasClaudeAPIKey()).toBe(true)
      
      await CredentialManager.deleteClaudeAPIKey()
      expect(await CredentialManager.hasClaudeAPIKey()).toBe(false)
    })

    it('should throw on empty Claude API key', async () => {
      await expect(CredentialManager.saveClaudeAPIKey('')).rejects.toThrow()
      await expect(CredentialManager.saveClaudeAPIKey('   ')).rejects.toThrow()
    })
  })

  describe('Generic Credential Helpers', () => {
    it('should save and retrieve generic credential', async () => {
      await CredentialManager.saveCredential('test-account', 'test-password')
      const cred = await CredentialManager.getCredential('test-account')
      expect(cred).toBe('test-password')
    })

    it('should delete generic credential', async () => {
      await CredentialManager.saveCredential('test-account', 'test-password')
      await CredentialManager.deleteCredential('test-account')
      const cred = await CredentialManager.getCredential('test-account')
      expect(cred).toBeNull()
    })

    it('should throw on empty account for generic helpers', async () => {
      await expect(CredentialManager.saveCredential('', 'password')).rejects.toThrow()
      await expect(CredentialManager.getCredential('')).rejects.toThrow()
      await expect(CredentialManager.deleteCredential('')).rejects.toThrow()
    })
  })

  describe('Keychain Availability Check', () => {
    it('should report keychain availability', async () => {
      const available = await CredentialManager.isKeychainAvailable()
      // In test environment with mock, this depends on mock setup
      expect(typeof available).toBe('boolean')
    })
  })
})
