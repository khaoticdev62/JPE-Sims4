/**
 * Parser Cache
 *
 * Caches parsed ASTs with content hashing for change detection.
 * Supports LRU eviction, TTL expiration, and performance tracking.
 */

import type {
  CacheEntry,
  CacheStats,
  CacheConfig,
  FileHash,
  InvalidationReason,
  CacheEvent,
  CacheMetrics,
} from './types/cache'

/**
 * Parser Cache class
 */
export class ParserCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private config: Required<CacheConfig> = {
    maxSizeMB: 100,
    maxEntries: 1000,
    ttlMs: 1000 * 60 * 60, // 1 hour default
    trackStats: true,
    trackEvents: false,
  }

  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    currentSize: 0,
    maxSize: 100,
    hitRate: 0,
  }

  private events: CacheEvent<T>[] = []
  private readTimes: number[] = []
  private writeTimes: number[] = []

  /**
   * Create a new parser cache
   */
  constructor(config?: CacheConfig) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    this.stats.maxSize = this.config.maxSizeMB
  }

  /**
   * Get cached result if available and valid
   */
  get(file: string, currentHash?: FileHash): T | null {
    const startTime = performance.now()

    const entry = this.cache.get(file)

    if (!entry) {
      this.recordMiss()
      if (this.config.trackEvents) {
        this.events.push({ type: 'miss', file })
      }
      return null
    }

    // Check if hash matches (file hasn't changed)
    if (currentHash && entry.hash !== currentHash) {
      this.recordMiss()
      if (this.config.trackEvents) {
        this.events.push({
          type: 'invalidate',
          file,
          reason: 'content-change',
          entry,
        })
      }
      this.cache.delete(file)
      return null
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.recordMiss()
      if (this.config.trackEvents) {
        this.events.push({
          type: 'invalidate',
          file,
          reason: 'expired',
          entry,
        })
      }
      this.cache.delete(file)
      this.stats.evictions++
      return null
    }

    // Hit! Update timestamp for LRU tracking
    entry.timestamp = Date.now()
    this.recordHit(startTime)
    if (this.config.trackEvents) {
      this.events.push({ type: 'hit', file })
    }

    return entry.result
  }

  /**
   * Set cache entry
   */
  set(file: string, result: T, content: string): void {
    const startTime = performance.now()
    const hash = this.hashContent(content)

    // Check if we need to evict
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLRU()
    }

    const entry: CacheEntry<T> = {
      result,
      hash,
      timestamp: Date.now(),
      file,
    }

    this.cache.set(file, entry)
    this.stats.currentSize = this.estimateCacheSize()

    const writeTime = performance.now() - startTime
    this.writeTimes.push(writeTime)

    if (this.config.trackEvents) {
      this.events.push({ type: 'hit', file, entry })
    }
  }

  /**
   * Invalidate cache entry by file
   */
  invalidate(file: string, reason: InvalidationReason = 'manual'): void {
    const entry = this.cache.get(file)
    if (entry) {
      this.cache.delete(file)
      this.stats.evictions++
      this.stats.currentSize = this.estimateCacheSize()

      if (this.config.trackEvents) {
        this.events.push({ type: 'invalidate', file, reason, entry })
      }
    }
  }

  /**
   * Invalidate multiple files
   */
  invalidateMultiple(files: string[], reason: InvalidationReason = 'manual'): void {
    for (const file of files) {
      this.invalidate(file, reason)
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    const prevSize = this.cache.size
    this.cache.clear()
    this.stats.currentSize = 0
    this.stats.evictions += prevSize

    if (this.config.trackEvents) {
      this.events.push({ type: 'clear', file: 'all' })
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    const avgReadTime =
      this.readTimes.length > 0
        ? this.readTimes.reduce((a, b) => a + b, 0) / this.readTimes.length
        : 0

    const avgWriteTime =
      this.writeTimes.length > 0
        ? this.writeTimes.reduce((a, b) => a + b, 0) / this.writeTimes.length
        : 0

    return {
      totalReads: this.stats.hits + this.stats.misses,
      totalWrites: this.cache.size,
      averageReadTime: Math.round(avgReadTime * 1000) / 1000,
      averageWriteTime: Math.round(avgWriteTime * 1000) / 1000,
      cacheSize: this.stats.currentSize,
    }
  }

  /**
   * Get cache events
   */
  getEvents(): CacheEvent<T>[] {
    return [...this.events]
  }

  /**
   * Clear cache events
   */
  clearEvents(): void {
    this.events = []
  }

  /**
   * Check cache statistics
   */
  hasEntry(file: string): boolean {
    return this.cache.has(file)
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      currentSize: 0,
      maxSize: this.config.maxSizeMB,
      hitRate: 0,
    }
    this.readTimes = []
    this.writeTimes = []
    this.events = []
  }

  /**
   * Hash file content for change detection
   * Uses simple djb2 hash for browser compatibility
   */
  private hashContent(content: string): FileHash {
    let hash = 5381
    for (let i = 0; i < content.length; i++) {
      hash = (hash * 33) ^ content.charCodeAt(i)
    }
    return (hash >>> 0).toString(16)
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.config.ttlMs
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    if (this.cache.size === 0) return

    let oldestTime = Infinity
    let oldestFile = ''

    for (const [file, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestFile = file
      }
    }

    if (oldestFile) {
      this.invalidate(oldestFile, 'size-limit')
    }
  }

  /**
   * Estimate cache size in MB
   */
  private estimateCacheSize(): number {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      // Rough estimate: JSON.stringify size / 1024 / 1024
      const entrySize = JSON.stringify(entry).length / 1024 / 1024
      totalSize += entrySize
    }
    return Math.round(totalSize * 100) / 100
  }

  /**
   * Record cache hit
   */
  private recordHit(startTime: number): void {
    this.stats.hits++
    const readTime = performance.now() - startTime
    this.readTimes.push(readTime)

    // Keep only last 100 measurements
    if (this.readTimes.length > 100) {
      this.readTimes.shift()
    }
  }

  /**
   * Record cache miss
   */
  private recordMiss(): void {
    this.stats.misses++
  }
}

/**
 * Helper function to create a cache
 */
export function createParserCache<T>(config?: CacheConfig): ParserCache<T> {
  return new ParserCache(config)
}
