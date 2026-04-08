/**
 * Safe Storage Utility
 * Provides a wrapper around localStorage that is safe for SSR/Prerendering
 */

export const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch (e) {
      console.warn(`[SafeStorage] Failed to get item ${key}`, e)
      return null
    }
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.warn(`[SafeStorage] Failed to set item ${key}`, e)
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.warn(`[SafeStorage] Failed to remove item ${key}`, e)
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.clear()
    } catch (e) {
      console.warn('[SafeStorage] Failed to clear storage', e)
    }
  },

  key: (index: number): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.key(index)
    } catch (e) {
      console.warn(`[SafeStorage] Failed to get key at index ${index}`, e)
      return null
    }
  },

  get length(): number {
    if (typeof window === 'undefined') return 0
    try {
      return localStorage.length
    } catch (e) {
      console.warn('[SafeStorage] Failed to get length', e)
      return 0
    }
  },

  getAllKeys: (): string[] => {
    if (typeof window === 'undefined') return []
    try {
      return Object.keys(localStorage)
    } catch (e) {
      console.warn('[SafeStorage] Failed to get all keys', e)
      return []
    }
  }
}
