import Store from 'electron-store'
import { SecurityEngine } from './SecurityEngine'

interface VaultSchema {
  data: Record<string, string>
}

/**
 * SecureStore
 * A main-process singleton that manages an encrypted JSON file for global config.
 */
export class SecureStore {
  private static instance: SecureStore
  private store: Store<VaultSchema>

  private constructor() {
    this.store = new Store<VaultSchema>({
      name: 'jpe_secure_vault',
      defaults: { data: {} }
    })
  }

  static getInstance(): SecureStore {
    if (!SecureStore.instance) {
      SecureStore.instance = new SecureStore()
    }
    return SecureStore.instance
  }

  /**
   * Set a value in the secure vault.
   * Logic: Encrypt(String(value)) -> Store
   */
  set(key: string, value: any): void {
    const stringified = typeof value === 'string' ? value : JSON.stringify(value)
    const encrypted = SecurityEngine.encrypt(stringified)
    
    const currentData = this.store.get('data') || {}
    currentData[key] = encrypted
    this.store.set('data', currentData)
  }

  /**
   * Get a value from the secure vault.
   * Logic: Retrieve -> Decrypt -> Parse
   */
  get<T>(key: string): T | null {
    const currentData = this.store.get('data') || {}
    const encrypted = currentData[key]
    
    if (!encrypted) return null

    const decrypted = SecurityEngine.decrypt(encrypted)
    if (!decrypted) return null

    try {
      return JSON.parse(decrypted) as T
    } catch {
      // If it's not JSON, return it as a string
      return decrypted as unknown as T
    }
  }

  /**
   * Delete a key from the vault.
   */
  delete(key: string): void {
    const currentData = this.store.get('data') || {}
    delete currentData[key]
    this.store.set('data', currentData)
  }

  /**
   * Clear entire vault.
   */
  clear(): void {
    this.store.set('data', {})
  }

  /**
   * Check if shielding is active.
   */
  isShielded(): boolean {
    return SecurityEngine.isShielded()
  }

  /**
   * AI ENGINE SPECIFIC HANDLERS
   */
  getAIEngineConfig() {
    return this.get<any>('ai_engine_config') || {
      model: 'industrial-modding-brain:latest',
      temperature: 0.1,
      secureHandshake: true
    }
  }

  setAIEngineConfig(config: any) {
    this.set('ai_engine_config', config)
  }
}
