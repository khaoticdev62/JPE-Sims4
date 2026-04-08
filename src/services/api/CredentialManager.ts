/**
 * Credential Manager
 * Securely store and retrieve API keys using OS keychain with IndexedDB fallback.
 *
 * Storage hierarchy:
 * 1. Primary: OS keychain via keytar (Electron/Node context)
 *    - Windows: Credential Manager
 *    - macOS: Keychain
 *    - Linux: Secret Service
 * 2. Fallback: IndexedDB with AES-GCM encrypted values (browser context)
 *
 * CRITICAL: Keys are NEVER stored in plaintext in localStorage.
 */

import { SecurityService } from '@/services/ai/SecurityService'

export interface Credentials {
  apiKey: string
  expiresAt?: number
}

// ---------------------------------------------------------------------------
// IndexedDB helpers for encrypted credential storage (browser fallback)
// ---------------------------------------------------------------------------

const CRED_DB_NAME = 'jpe_credential_vault'
const CRED_STORE_NAME = 'credentials'

/**
 * Get the IndexedDB implementation, fallback to fake-indexeddb if needed in Node.
 */
function getIndexedDB(): IDBFactory {
  if (typeof indexedDB !== 'undefined' && indexedDB !== null) {
    return indexedDB
  }

  try {
    // Use eval('require') to bypass build-time resolution
    return eval('require')('fake-indexeddb')
  } catch {
    // fallback
  }

  throw new Error('[Credentials] No IndexedDB provider found in current environment')
}

function openCredentialDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const idb = getIndexedDB()
    const req = idb.open(CRED_DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(CRED_STORE_NAME)) {
        db.createObjectStore(CRED_STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function storeEncryptedIndexedDB(account: string, encryptedValue: string): Promise<void> {
  const db = await openCredentialDB()
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(CRED_STORE_NAME, 'readwrite')
      const store = tx.objectStore(CRED_STORE_NAME)
      store.put(encryptedValue, account)
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onerror = () => { db.close(); reject(tx.error) }
    } catch (err) {
      db.close()
      reject(err)
    }
  })
}

async function loadEncryptedIndexedDB(account: string): Promise<string | null> {
  const db = await openCredentialDB()
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(CRED_STORE_NAME, 'readonly')
      const store = tx.objectStore(CRED_STORE_NAME)
      const req = store.get(account)
      req.onsuccess = () => { db.close(); resolve(req.result ?? null) }
      req.onerror = () => { db.close(); reject(req.error) }
    } catch (err) {
      db.close()
      reject(err)
    }
  })
}

async function deleteFromIndexedDB(account: string): Promise<boolean> {
  const db = await openCredentialDB()
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(CRED_STORE_NAME, 'readonly')
      const store = tx.objectStore(CRED_STORE_NAME)
      const req = store.get(account)
      req.onsuccess = () => {
        if (req.result !== undefined) {
          // Key exists — delete it
          const tx2 = db.transaction(CRED_STORE_NAME, 'readwrite')
          const store2 = tx2.objectStore(CRED_STORE_NAME)
          store2.delete(account)
          tx2.oncomplete = () => { db.close(); resolve(true) }
          tx2.onerror = () => { db.close(); reject(tx2.error) }
        } else {
          // Key doesn't exist
          db.close()
          resolve(false)
        }
      }
      req.onerror = () => { db.close(); reject(req.error) }
    } catch (err) {
      db.close()
      reject(err)
    }
  })
}

// ---------------------------------------------------------------------------
// Keytar availability cache
// ---------------------------------------------------------------------------

let keytarModule: typeof import('keytar') | null = null
let keytarResolved = false

async function getKeytar(): Promise<typeof import('keytar') | null> {
  if (keytarResolved) return keytarModule
  
  if (typeof window === 'undefined') {
    try {
      // Use eval('require') to prevent Webpack from trying to resolve this at build time
      keytarModule = eval('require')('keytar')
    } catch {
      keytarModule = null
    }
  } else {
    keytarModule = null
  }
  
  keytarResolved = true
  return keytarModule
}

// ---------------------------------------------------------------------------
// Credential Manager
// ---------------------------------------------------------------------------

export class CredentialManager {
  private static readonly SERVICE_NAME = 'jpe-mod-translator'

  /**
   * Save an API key for a specific provider.
   * Uses keytar (OS keychain) when available; falls back to IndexedDB with AES-GCM encryption.
   */
  static async saveKey(provider: string, key: string): Promise<void> {
    if (!provider || !key) {
      throw new Error('Provider and key must not be empty')
    }

    const account = `ai-key-${provider}`
    const kt = await getKeytar()

    if (kt) {
      await kt.setPassword(this.SERVICE_NAME, account, key)
      console.debug(`[Credentials] API key for ${provider} saved to OS keychain`)
    } else {
      // Browser fallback: encrypt before storing in IndexedDB
      const encrypted = await SecurityService.encrypt(key)
      await storeEncryptedIndexedDB(account, encrypted)
      console.debug(`[Credentials] API key for ${provider} saved to encrypted IndexedDB`)
    }
  }

  /**
   * Retrieve an API key for a specific provider.
   * Tries keytar first, then falls back to IndexedDB decryption.
   */
  static async getKey(provider: string): Promise<string | null> {
    if (!provider) return null

    const account = `ai-key-${provider}`
    const kt = await getKeytar()

    if (kt) {
      const key = await kt.getPassword(this.SERVICE_NAME, account).catch(() => null)
      if (key) {
        console.debug(`[Credentials] API key for ${provider} retrieved from OS keychain`)
      }
      return key ?? null
    }

    // Browser fallback: decrypt from IndexedDB
    const encrypted = await loadEncryptedIndexedDB(account)
    if (encrypted) {
      const key = await SecurityService.decrypt(encrypted)
      if (key) {
        console.debug(`[Credentials] API key for ${provider} retrieved from encrypted IndexedDB`)
      }
      return key || null
    }

    return null
  }

  /**
   * Delete an API key for a specific provider.
   */
  static async deleteKey(provider: string): Promise<boolean> {
    if (!provider) return false

    const account = `ai-key-${provider}`
    let deleted = false
    const kt = await getKeytar()

    if (kt) {
      deleted = await kt.deletePassword(this.SERVICE_NAME, account).catch(() => false)
    }

    // Also clean IndexedDB fallback (in case it was used)
    try {
      const idbDeleted = await deleteFromIndexedDB(account)
      if (idbDeleted) deleted = true
    } catch {
      // ignore
    }

    if (deleted) {
      console.debug(`[Credentials] API key for ${provider} deleted`)
    }
    return deleted
  }

  // -----------------------------------------------------------------------
  // Legacy Claude-specific helpers (thin wrappers for backward compat)
  // -----------------------------------------------------------------------

  private static readonly CLAUDE_ACCOUNT = 'ai-key-claude'

  static async saveClaudeAPIKey(apiKey: string): Promise<void> {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key cannot be empty')
    }
    await this.saveKey('claude', apiKey.trim())
  }

  static async getClaudeAPIKey(): Promise<string | null> {
    return this.getKey('claude')
  }

  static async hasClaudeAPIKey(): Promise<boolean> {
    try {
      const key = await this.getClaudeAPIKey()
      return key !== null && key.length > 0
    } catch {
      return false
    }
  }

  static async deleteClaudeAPIKey(): Promise<boolean> {
    return this.deleteKey('claude')
  }

  // -----------------------------------------------------------------------
  // Generic credential helpers (keytar only — no encryption layer, for
  // non-secret config values that still warrant OS keychain)
  // -----------------------------------------------------------------------

  static async saveCredential(account: string, password: string): Promise<void> {
    if (!account || !password) {
      throw new Error('Account and password must not be empty')
    }

    const kt = await getKeytar()
    if (kt) {
      await kt.setPassword(this.SERVICE_NAME, account, password)
      console.debug(`[Credentials] Credential saved for account: ${account}`)
    } else {
      // Fallback: encrypt and store in IndexedDB
      const encrypted = await SecurityService.encrypt(password)
      await storeEncryptedIndexedDB(account, encrypted)
      console.debug(`[Credentials] Credential saved (encrypted IndexedDB) for account: ${account}`)
    }
  }

  static async getCredential(account: string): Promise<string | null> {
    if (!account) {
      throw new Error('Account must not be empty')
    }

    const kt = await getKeytar()
    if (kt) {
      const cred = await kt.getPassword(this.SERVICE_NAME, account).catch(() => null)
      return cred ?? null
    }

    const encrypted = await loadEncryptedIndexedDB(account)
    if (encrypted) {
      return await SecurityService.decrypt(encrypted).catch(() => null)
    }
    return null
  }

  static async deleteCredential(account: string): Promise<boolean> {
    if (!account) {
      throw new Error('Account must not be empty')
    }

    let deleted = false
    const kt = await getKeytar()

    if (kt) {
      deleted = await kt.deletePassword(this.SERVICE_NAME, account).catch(() => false)
    }

    try {
      const idbDeleted = await deleteFromIndexedDB(account)
      if (idbDeleted) deleted = true
    } catch {
      // ignore
    }

    return deleted
  }

  // -----------------------------------------------------------------------
  // Utilities
  // -----------------------------------------------------------------------

  /**
   * Check if OS keychain (keytar) is available on the system.
   */
  static async isKeychainAvailable(): Promise<boolean> {
    const kt = await getKeytar()
    return kt !== null
  }

  /**
   * Clear all credentials for all known providers.
   */
  static async clearAllCredentials(): Promise<boolean> {
    const providers = ['claude', 'openai', 'gemini', 'qwen']
    let deletedAny = false

    for (const provider of providers) {
      try {
        const deleted = await this.deleteKey(provider)
        if (deleted) deletedAny = true
      } catch {
        // ignore per-provider errors
      }
    }

    // Legacy Claude key cleanup (keytar only)
    try {
      const kt = await getKeytar()
      if (kt) {
        const deleted = await kt.deletePassword(this.SERVICE_NAME, 'claude-api-key').catch(() => false)
        if (deleted) deletedAny = true
      }
    } catch {
      // ignore
    }

    if (deletedAny) {
      console.debug('[Credentials] All AI credentials cleared')
    }

    return deletedAny
  }
}
