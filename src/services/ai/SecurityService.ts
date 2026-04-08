/**
 * Security Service
 * Provides AES-GCM encryption for stored API keys using the Web Crypto API.
 *
 * Key management strategy:
 * 1. Primary: OS keychain via keytar (Node/Electron context)
 * 2. Fallback: IndexedDB with obfuscated key name (browser context)
 * 3. NEVER stores raw keys in localStorage
 *
 * The encryption key is a randomly-generated 256-bit AES-GCM key,
 * generated once on first use and persisted securely.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Raw CryptoKey handle (AES-GCM) */
type CryptoKeyHandle = CryptoKey

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const KEY_STORAGE_KEY = 'jpe_encryption_key_meta'
const KEY_STORAGE_DB = 'jpe_secure_vault'
const KEY_STORAGE_ACCOUNT = '__aes_gcm_master_key__'
const IV_LENGTH = 12 // AES-GCM recommended IV size (96 bits)

// ---------------------------------------------------------------------------
// Internal — hardware/environment abstraction
// ---------------------------------------------------------------------------

/**
 * Get a WebCrypto compatible object, fallback to node:crypto if needed.
 */
async function getCrypto(): Promise<Crypto> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    console.debug('[Security] Using global crypto provider')
    return crypto
  }
  
  try {
    const { webcrypto } = eval('require')('node:crypto')
    if (webcrypto?.subtle) {
      console.debug('[Security] Using node:crypto webcrypto provider')
      return webcrypto as unknown as Crypto
    }
  } catch (e) {
    console.debug('[Security] node:crypto fallback failed:', e)
  }

  throw new Error('[Security] No WebCrypto provider found in current environment')
}

/**
 * Get the IndexedDB implementation, fallback to fake-indexeddb if needed in Node.
 */
function getIndexedDB(): IDBFactory {
  if (typeof indexedDB !== 'undefined' && indexedDB !== null) {
    return indexedDB
  }

  try {
    return eval('require')('fake-indexeddb')
  } catch {
    // fallback
  }

  throw new Error('[Security] No IndexedDB provider found in current environment')
}

// ---------------------------------------------------------------------------
// Internal — key generation & persistence
// ---------------------------------------------------------------------------

/**
 * Generate a new AES-GCM CryptoKey.
 */
async function generateAesKey(): Promise<CryptoKeyHandle> {
  const c = await getCrypto()
  return c.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable — needed so we can serialize for fallback storage
    ['encrypt', 'decrypt']
  )
}

/**
 * Export a CryptoKey to raw bytes (Base64) for fallback IndexedDB storage.
 * Only used when keytar is unavailable.
 */
async function exportKey(key: CryptoKeyHandle): Promise<string> {
  const c = await getCrypto()
  const raw = await c.subtle.exportKey('raw', key)
  return btoa(String.fromCharCode(...new Uint8Array(raw)))
}

/**
 * Import a CryptoKey from raw bytes (Base64).
 */
async function importKey(rawBase64: string): Promise<CryptoKeyHandle> {
  const c = await getCrypto()
  const raw = Uint8Array.from(atob(rawBase64), c => c.charCodeAt(0))
  return c.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Store the master key in IndexedDB (fallback when keytar unavailable).
 * Uses an obfuscated store name to avoid trivial discovery.
 */
function storeKeyIndexedDB(keyB64: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.debug('[Security] Opening IndexedDB for writing...')
    const idb = getIndexedDB()
    const openReq = idb.open(KEY_STORAGE_DB, 1)

    openReq.onupgradeneeded = () => {
      console.debug('[Security] IDB Upgrade needed')
      const db = openReq.result
      if (!db.objectStoreNames.contains('vault')) {
        db.createObjectStore('vault')
      }
    }

    openReq.onsuccess = () => {
      console.debug('[Security] IDB Opened successfully')
      const db = openReq.result
      try {
        const tx = db.transaction('vault', 'readwrite')
        const store = tx.objectStore('vault')
        store.put(keyB64, KEY_STORAGE_KEY)
        tx.oncomplete = () => { 
          console.debug('[Security] IDB Write complete')
          db.close()
          resolve() 
        }
        tx.onerror = () => {
          console.error('[Security] IDB tx error:', tx.error)
          db.close()
          reject(tx.error)
        }
      } catch (err) {
        console.error('[Security] IDB transaction startup error:', err)
        db.close()
        reject(err)
      }
    }

    openReq.onerror = () => {
      console.error('[Security] IDB open error:', openReq.error)
      reject(openReq.error)
    }
    
    openReq.onblocked = () => {
      console.warn('[Security] IDB open blocked')
    }
  })
}

/**
 * Retrieve the master key from IndexedDB.
 */
function loadKeyIndexedDB(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    console.debug('[Security] Opening IndexedDB for reading...')
    const idb = getIndexedDB()
    const openReq = idb.open(KEY_STORAGE_DB, 1)

    openReq.onupgradeneeded = () => {
      console.debug('[Security] IDB Upgrade needed (read)')
      const db = openReq.result
      if (!db.objectStoreNames.contains('vault')) {
        db.createObjectStore('vault')
      }
    }

    openReq.onsuccess = () => {
      console.debug('[Security] IDB Opened successfully (read)')
      const db = openReq.result
      try {
        const tx = db.transaction('vault', 'readonly')
        const store = tx.objectStore('vault')
        const getReq = store.get(KEY_STORAGE_KEY)
        getReq.onsuccess = () => {
          console.debug('[Security] IDB Read success')
          db.close()
          resolve(getReq.result ?? null)
        }
        getReq.onerror = () => {
          console.error('[Security] IDB get error:', getReq.error)
          db.close()
          reject(getReq.error)
        }
      } catch (err) {
        console.error('[Security] IDB transaction startup error (read):', err)
        db.close()
        reject(err)
      }
    }

    openReq.onerror = () => {
      console.error('[Security] IDB open error (read):', openReq.error)
      reject(openReq.error)
    }

    openReq.onblocked = () => {
      console.warn('[Security] IDB open blocked (read)')
    }
  })
}

/**
 * Try keytar (OS keychain) first; fall back to IndexedDB.
 * Returns a persistent CryptoKey for AES-GCM operations.
 */
let cachedKey: CryptoKeyHandle | null = null

async function getOrCreateEncryptionKey(): Promise<CryptoKeyHandle> {
  if (cachedKey) return cachedKey

  // --- Attempt keytar (Electron / Node context) --------------------------
  if (typeof window === 'undefined') {
    try {
      // Dynamic require so the module doesn't break in pure-browser builds
      // Also prevents webpack from failing if the package isn't installed
      const keytar = eval('require')('keytar')
      if (keytar) {
        const stored = await keytar.getPassword(
          'jpe-mod-translator',
          KEY_STORAGE_ACCOUNT
        ).catch((): null => null)
        if (stored) {
          cachedKey = await importKey(stored)
          return cachedKey
        }
      }
    } catch {
      // keytar unavailable or failed — proceed to fallback
    }
  }

  // --- Fallback: IndexedDB ------------------------------------------------
  try {
    const storedB64 = await loadKeyIndexedDB()
    if (storedB64) {
      cachedKey = await importKey(storedB64)
      return cachedKey
    }
  } catch {
    // IndexedDB unavailable — will generate a new volatile key
  }

  // --- Generate fresh key & persist ---------------------------------------
  const freshKey = await generateAesKey()
  const rawB64 = await exportKey(freshKey)

  // Persist via keytar if available (Node/Electron only)
  if (typeof window === 'undefined') {
    try {
      const keytar = eval('require')('keytar')
      if (keytar) {
        await keytar.setPassword('jpe-mod-translator', KEY_STORAGE_ACCOUNT, rawB64)
        cachedKey = freshKey
        return cachedKey
      }
    } catch {
      // fall through
    }
  }

  // Persist via IndexedDB
  try {
    await storeKeyIndexedDB(rawB64)
  } catch (e) {
    console.warn(
      '[Security] Master key could not be persisted — keys will be lost on reload.',
      e
    )
  }

  cachedKey = freshKey
  return cachedKey
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export class SecurityService {
  /**
   * Encrypt a string using AES-GCM.
   * Returns Base64(iv + ciphertext).
   */
  static async encrypt(text: string): Promise<string> {
    if (!text) return ''

    const c = await getCrypto()
    const key = await getOrCreateEncryptionKey()
    const iv = c.getRandomValues(new Uint8Array(IV_LENGTH))
    const encoded = new TextEncoder().encode(text)

    const ciphertext = await c.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    )

    // Prepend IV to ciphertext so we can decrypt later
    const ctBytes = new Uint8Array(ciphertext)
    const combined = new Uint8Array(iv.length + ctBytes.length)
    combined.set(iv, 0)
    combined.set(ctBytes, iv.length)

    return btoa(String.fromCharCode(...combined))
  }

  /**
   * Decrypt a string produced by `encrypt()`.
   */
  static async decrypt(encrypted: string): Promise<string> {
    if (!encrypted) return ''

    try {
      const c = await getCrypto()
      const key = await getOrCreateEncryptionKey()
      const data = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))

      const iv = data.slice(0, IV_LENGTH)
      const ciphertext = data.slice(IV_LENGTH)

      const decrypted = await c.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      )

      return new TextDecoder().decode(decrypted)
    } catch (e) {
      console.error('[Security] Decryption failed:', e)
      return ''
    }
  }

  /**
   * Check if a string is likely an API key (basic format validation).
   */
  static isValidKeyFormat(provider: string, key: string): boolean {
    if (!key || key.length < 10) return false

    switch (provider) {
      case 'gemini':
        return key.startsWith('AIza')
      case 'openai':
        return key.startsWith('sk-')
      case 'claude':
        return key.startsWith('sk-ant-')
      default:
        return true
    }
  }
}
