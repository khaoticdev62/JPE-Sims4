/**
 * AI Key Store
 * Manages the retrieval and storage of multiple encrypted API keys.
 * Uses CredentialManager (OS keychain / encrypted IndexedDB) as the backend.
 */

import { CredentialManager } from '@/services/api/CredentialManager'
import { AIProvider } from './types'

export class AIKeyStore {
  /**
   * Save a key for a specific provider via CredentialManager.
   */
  static async saveKey(provider: AIProvider, key: string): Promise<void> {
    await CredentialManager.saveKey(provider, key)
  }

  /**
   * Get the plain-text key for a specific provider.
   */
  static async getKey(provider: AIProvider): Promise<string> {
    const key = await CredentialManager.getKey(provider)
    return key ?? ''
  }

  /**
   * Delete a key for a specific provider.
   */
  static async deleteKey(provider: AIProvider): Promise<void> {
    await CredentialManager.deleteKey(provider)
  }

  /**
   * Check if a key exists for a provider.
   */
  static async hasKey(provider: AIProvider): Promise<boolean> {
    const key = await this.getKey(provider)
    return key.length > 0
  }

  /**
   * Get all configured providers.
   */
  static async getConfiguredProviders(): Promise<AIProvider[]> {
    const providers: AIProvider[] = []
    for (const provider of Object.values(AIProvider)) {
      if (await this.hasKey(provider)) {
        providers.push(provider)
      }
    }
    return providers
  }
}
