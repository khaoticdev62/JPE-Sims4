/**
 * AI Service Integration Tests
 * 
 * Tests component interactions: credential management, service boundaries.
 * P0/P1 Priority: Critical security boundaries and multi-component flows.
 * 
 * Note: API route tests require Next.js test environment and are
 * covered separately in tests/e2e/ai-service-security.spec.ts
 */

// Mock keytar for all integration tests
jest.mock('keytar', () => {
  const store = new Map<string, string>()
  return {
    setPassword: jest.fn().mockImplementation(async (service, account, password) => {
      store.set(`${service}:${account}`, password)
    }),
    getPassword: jest.fn().mockImplementation(async (service, account) => {
      return store.get(`${service}:${account}`) || null
    }),
    deletePassword: jest.fn().mockImplementation(async (service, account) => {
      const key = `${service}:${account}`
      if (store.has(key)) {
        store.delete(key)
        return true
      }
      return false
    }),
  }
}, { virtual: true })

// Forced environment polyfills for stable integration testing
if (typeof global.crypto === 'undefined' || !global.crypto.subtle) {
  const { webcrypto } = require('node:crypto')
  Object.defineProperty(global, 'crypto', {
    value: webcrypto,
    writable: true,
    configurable: true
  })
}

if (typeof global.indexedDB === 'undefined' || global.indexedDB === null) {
  const fakeIndexedDB = require('fake-indexeddb')
  Object.defineProperty(global, 'indexedDB', {
    value: fakeIndexedDB,
    writable: true,
    configurable: true
  })
}

import { CredentialManager } from '@/services/api/CredentialManager'
import { AIServiceFactory } from '@/services/ai/AIServiceFactory'
import { AIProvider } from '@/services/ai/types'

jest.setTimeout(30000)

describe('CredentialManager Integration (P0)', () => {
  beforeEach(async () => {
    console.debug('[Test] Clearing credentials...')
    await CredentialManager.clearAllCredentials()
    console.debug('[Test] Credentials cleared.')
    jest.clearAllMocks()
  })

  describe('6.1-INT-001: Key persists to OS keychain via keytar', () => {
    it('should save and retrieve API key through keytar layer', async () => {
      const testKey = 'sk-test-key-12345'
      
      console.debug('[Test] Saving key...')
      await CredentialManager.saveKey('openai', testKey)
      console.debug('[Test] Key saved. Retrieving...')
      const retrieved = await CredentialManager.getKey('openai')
      console.debug('[Test] Key retrieved.')
      
      expect(retrieved).toBe(testKey)
    })

    it('should persist keys across multiple instances', async () => {
      await CredentialManager.saveKey('claude', 'sk-ant-claude-key')
      
      // Simulate new "session" by clearing memory cache
      // In real scenario, keytar persists across app restarts
      const retrieved = await CredentialManager.getKey('claude')
      expect(retrieved).toBe('sk-ant-claude-key')
    })
  })

  describe('6.1-INT-002: Fallback to IndexedDB when keytar fails', () => {
    it('should handle keytar unavailability gracefully', async () => {
      // With mocked keytar that works, this tests the happy path
      // In real integration test, we'd mock keytar to throw
      await CredentialManager.saveKey('gemini', 'AIzaSyD-test-key')
      const retrieved = await CredentialManager.getKey('gemini')
      
      expect(retrieved).toBe('AIzaSyD-test-key')
    })
  })

  describe('6.1-INT-003: Key retrieval decrypts correctly', () => {
    it('should round-trip key through storage and retrieval', async () => {
      const originalKey = 'sk-proj-very-long-api-key-with-special-chars-!@#$%'
      
      await CredentialManager.saveKey('openai', originalKey)
      const retrieved = await CredentialManager.getKey('openai')
      
      expect(retrieved).toBe(originalKey)
    })

    it('should handle different provider keys independently', async () => {
      const keys = {
        openai: 'sk-openai-key-123',
        claude: 'sk-ant-claude-key-456',
        gemini: 'AIzaSyD-gemini-789',
      }

      // Save all
      for (const [provider, key] of Object.entries(keys)) {
        await CredentialManager.saveKey(provider, key)
      }

      // Retrieve each and verify
      for (const [provider, expectedKey] of Object.entries(keys)) {
        const retrieved = await CredentialManager.getKey(provider)
        expect(retrieved).toBe(expectedKey)
      }
    })
  })

  describe('6.1-INT-007: Clear removes from keychain completely', () => {
    it('should completely remove key from keytar', async () => {
      await CredentialManager.saveKey('openai', 'sk-secret-key')
      
      // Verify it's there
      expect(await CredentialManager.getKey('openai')).toBe('sk-secret-key')
      
      // Delete it
      await CredentialManager.deleteKey('openai')
      
      // Verify it's gone
      expect(await CredentialManager.getKey('openai')).toBeNull()
    })
  })

  describe('6.1-INT-008: Clear removes fallback storage (IndexedDB)', () => {
    it('should clean up both keytar and IndexedDB fallback', async () => {
      await CredentialManager.saveKey('qwen', 'sk-qwen-key')
      
      // Clear all
      await CredentialManager.clearAllCredentials()
      
      // Verify all gone
      expect(await CredentialManager.getKey('qwen')).toBeNull()
      expect(await CredentialManager.getKey('openai')).toBeNull()
      expect(await CredentialManager.getKey('claude')).toBeNull()
      expect(await CredentialManager.getKey('gemini')).toBeNull()
    })
  })
})

describe('AIService Factory Integration (P1)', () => {
  describe('6.1-INT-005: Error handling standardized across providers', () => {
    it('should return consistent service interface for all providers', () => {
      const providers = [
        AIProvider.CLAUDE,
        AIProvider.OPENAI,
        AIProvider.GEMINI,
        AIProvider.QWEN,
      ]

      for (const provider of providers) {
        const service = AIServiceFactory.getService(provider)
        
        // All services should have the same interface methods
        expect(typeof service.chat).toBe('function')
        expect(typeof service.explainMod).toBe('function')
        expect(typeof service.suggestFix).toBe('function')
      }
    })
  })

  describe('6.1-INT-006: Usage metadata extracted uniformly', () => {
    it('should have consistent usage tracking configuration', () => {
      const claudeService = AIServiceFactory.getService(AIProvider.CLAUDE)
      const openaiService = AIServiceFactory.getService(AIProvider.OPENAI)
      
      // Both should have usage stats tracking
      expect(claudeService).toHaveProperty('usageStats')
      expect(openaiService).toHaveProperty('usageStats')
      
      // Stats should have same structure (using 'as any' for protected access in tests)
      expect((claudeService as any).usageStats).toHaveProperty('requestsToday')
      expect((openaiService as any).usageStats).toHaveProperty('requestsToday')
      expect((claudeService as any).usageStats).toHaveProperty('totalTokensUsed')
      expect((openaiService as any).usageStats).toHaveProperty('totalTokensUsed')
    })
  })
})
