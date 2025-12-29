/**
 * Parser Cache Type Definitions
 *
 * Defines types for caching parsed ASTs and supporting incremental validation.
 */

/**
 * Hash of file contents for change detection
 */
export type FileHash = string

/**
 * Cached parse result
 */
export interface CacheEntry<T> {
  // The cached AST or parsed result
  result: T
  // Hash of the file content when parsed
  hash: FileHash
  // Timestamp when cached
  timestamp: number
  // File path
  file: string
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number
  misses: number
  evictions: number
  currentSize: number
  maxSize: number
  hitRate: number // percentage 0-100
}

/**
 * Cache invalidation reason
 */
export type InvalidationReason = 'expired' | 'size-limit' | 'manual' | 'content-change'

/**
 * Cache event
 */
export interface CacheEvent<T> {
  type: 'hit' | 'miss' | 'evict' | 'invalidate' | 'clear'
  file: string
  reason?: InvalidationReason
  entry?: CacheEntry<T>
}

/**
 * Parser cache configuration
 */
export interface CacheConfig {
  // Maximum cache size in MB
  maxSizeMB?: number
  // Maximum entries in cache
  maxEntries?: number
  // Time to live for cache entries in milliseconds
  ttlMs?: number
  // Enable cache statistics tracking
  trackStats?: boolean
  // Enable cache events
  trackEvents?: boolean
}

/**
 * Cache performance metrics
 */
export interface CacheMetrics {
  totalReads: number
  totalWrites: number
  averageReadTime: number
  averageWriteTime: number
  cacheSize: number
}
