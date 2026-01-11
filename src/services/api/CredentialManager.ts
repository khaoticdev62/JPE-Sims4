/**
 * Credential Manager
 * Securely store and retrieve API keys using OS keychain
 * - Windows: Credential Manager
 * - macOS: Keychain
 * - Linux: Secret Service
 */

import keytar from 'keytar'

export interface Credentials {
  apiKey: string
  expiresAt?: number
}

export class CredentialManager {
  private static readonly SERVICE_NAME = 'jpe-mod-translator'
  private static readonly CLAUDE_API_KEY = 'claude-api-key'

  /**
   * Save Claude API key to OS keychain
   * @param apiKey The Claude API key to store
   * @throws Error if keychain operation fails
   */
  static async saveClaudeAPIKey(apiKey: string): Promise<void> {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key cannot be empty')
    }

    try {
      await keytar.setPassword(
        this.SERVICE_NAME,
        this.CLAUDE_API_KEY,
        apiKey.trim()
      )
      console.debug('[Credentials] Claude API key saved to keychain')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Credentials] Failed to save API key:', message)
      throw new Error(`Failed to save API key: ${message}`)
    }
  }

  /**
   * Retrieve Claude API key from OS keychain
   * @returns The stored API key or null if not found
   * @throws Error if keychain operation fails
   */
  static async getClaudeAPIKey(): Promise<string | null> {
    try {
      const apiKey = await keytar.getPassword(
        this.SERVICE_NAME,
        this.CLAUDE_API_KEY
      )

      if (apiKey) {
        console.debug('[Credentials] Claude API key retrieved from keychain')
      }

      return apiKey ?? null
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Credentials] Failed to retrieve API key:', message)
      throw new Error(`Failed to retrieve API key: ${message}`)
    }
  }

  /**
   * Check if Claude API key is configured
   * @returns true if key exists in keychain
   */
  static async hasClaudeAPIKey(): Promise<boolean> {
    try {
      const apiKey = await this.getClaudeAPIKey()
      return apiKey !== null && apiKey.length > 0
    } catch {
      return false
    }
  }

  /**
   * Delete Claude API key from OS keychain
   * @returns true if deletion succeeded, false if key didn't exist
   * @throws Error if keychain operation fails
   */
  static async deleteClaudeAPIKey(): Promise<boolean> {
    try {
      const deleted = await keytar.deletePassword(
        this.SERVICE_NAME,
        this.CLAUDE_API_KEY
      )

      if (deleted) {
        console.debug('[Credentials] Claude API key deleted from keychain')
      }

      return deleted
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Credentials] Failed to delete API key:', message)
      throw new Error(`Failed to delete API key: ${message}`)
    }
  }

  /**
   * Save generic credential to OS keychain
   * @param account The credential identifier
   * @param password The credential value
   */
  static async saveCredential(account: string, password: string): Promise<void> {
    if (!account || !password) {
      throw new Error('Account and password must not be empty')
    }

    try {
      await keytar.setPassword(this.SERVICE_NAME, account, password)
      console.debug(`[Credentials] Credential saved for account: ${account}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[Credentials] Failed to save credential for ${account}:`, message)
      throw new Error(`Failed to save credential: ${message}`)
    }
  }

  /**
   * Retrieve generic credential from OS keychain
   * @param account The credential identifier
   * @returns The stored credential value or null if not found
   */
  static async getCredential(account: string): Promise<string | null> {
    if (!account) {
      throw new Error('Account must not be empty')
    }

    try {
      const credential = await keytar.getPassword(this.SERVICE_NAME, account)
      return credential ?? null
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[Credentials] Failed to retrieve credential for ${account}:`, message)
      throw new Error(`Failed to retrieve credential: ${message}`)
    }
  }

  /**
   * Delete generic credential from OS keychain
   * @param account The credential identifier
   * @returns true if deletion succeeded
   */
  static async deleteCredential(account: string): Promise<boolean> {
    if (!account) {
      throw new Error('Account must not be empty')
    }

    try {
      const deleted = await keytar.deletePassword(this.SERVICE_NAME, account)

      if (deleted) {
        console.debug(`[Credentials] Credential deleted for account: ${account}`)
      }

      return deleted
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[Credentials] Failed to delete credential for ${account}:`, message)
      throw new Error(`Failed to delete credential: ${message}`)
    }
  }

  /**
   * Check if keychain is available on the system
   * @returns true if keychain is available
   */
  static async isKeychainAvailable(): Promise<boolean> {
    try {
      // Try a simple operation to check if keychain is available
      const result = await keytar.getPassword(this.SERVICE_NAME, 'test')
      // If we get here without error, keychain is available
      return true
    } catch (error) {
      // Keychain might not be available or service doesn't exist yet
      console.debug('[Credentials] Keychain check result:', error instanceof Error ? error.message : 'unknown')
      return false
    }
  }

  /**
   * Clear all credentials for this application
   * @returns true if at least one credential was deleted
   */
  static async clearAllCredentials(): Promise<boolean> {
    try {
      const hasKey = await this.hasClaudeAPIKey()

      if (hasKey) {
        await this.deleteClaudeAPIKey()
        console.debug('[Credentials] All credentials cleared')
        return true
      }

      return false
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Credentials] Failed to clear credentials:', message)
      throw new Error(`Failed to clear credentials: ${message}`)
    }
  }
}
