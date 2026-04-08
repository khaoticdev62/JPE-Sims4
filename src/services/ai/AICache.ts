/**
 * Claude Cache (Next.js/Web version)
 * LRU cache for Claude API responses with TTL support
 */

import { LRUCache } from 'lru-cache'
import { CacheConfig, CacheEntry } from './types'

export class AICache {
  private cache: LRUCache<string, CacheEntry<string>>
  private hits = 0
  private misses = 0
  private ttl: number

  constructor(config: CacheConfig) {
    this.ttl = config.ttl

    // Create LRU cache with size limit
    this.cache = new LRUCache<string, CacheEntry<string>>({
      max: config.max,
    })

    console.debug(`[Cache] Initialized with max=${config.max}, ttl=${config.ttl}ms`)
  }

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or null if not found or expired
   */
  get(key: string): string | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return null
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.misses++
      return null
    }

    this.hits++
    return entry.data
  }

  /**
   * Set value in cache
   * @param key Cache key
   * @param value Value to cache
   */
  set(key: string, value: string): void {
    const now = Date.now()
    const entry: CacheEntry<string> = {
      data: value,
      timestamp: now,
      expiresAt: now + this.ttl,
    }

    this.cache.set(key, entry)
  }

  /**
   * Check if key exists in cache
   * @param key Cache key
   * @returns true if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    return Date.now() <= entry.expiresAt
  }

  /**
   * Delete entry from cache
   * @param key Cache key
   * @returns true if entry was deleted
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
    console.debug('[Cache] Cache cleared')
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0

    return {
      size: this.cache.size,
      max: this.cache.max,
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: Math.round(hitRate * 100) / 100,
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hits = 0
    this.misses = 0
    console.debug('[Cache] Statistics reset')
  }

  /**
   * Generate cache key from content
   * @param content Content to hash
   * @returns Cache key
   */
  static generateKey(content: string, fileName: string): string {
    const contentHash = this.hashString(content)
    const fileNameHash = this.hashString(fileName)
    return `ai_${fileNameHash}_${contentHash}`
  }

  /**
   * Simple string hash function
   */
  private static hashString(str: string): string {
    let hash = 0

    if (str.length === 0) return '0'

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }

    return Math.abs(hash).toString(16)
  }
}
