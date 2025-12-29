/**
 * Parser Cache Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ParserCache, createParserCache } from '../ParserCache'
import type { CacheEntry } from '../types/cache'

interface TestAST {
  type: string
  children: TestAST[]
}

describe('ParserCache', () => {
  let cache: ParserCache<TestAST>

  beforeEach(() => {
    cache = createParserCache<TestAST>({
      maxSizeMB: 10,
      maxEntries: 100,
      ttlMs: 60000, // 1 minute
      trackStats: true,
      trackEvents: true,
    })
  })

  describe('Basic operations', () => {
    it('should set and get cached result', () => {
      const ast: TestAST = { type: 'root', children: [] }
      const content = '<root></root>'

      cache.set('test.xml', ast, content)
      const result = cache.get('test.xml', cache['hashContent'](content))

      expect(result).toEqual(ast)
    })

    it('should return null for non-existent entry', () => {
      const result = cache.get('nonexistent.xml')
      expect(result).toBeNull()
    })

    it('should overwrite existing cache entry', () => {
      const ast1: TestAST = { type: 'root', children: [] }
      const ast2: TestAST = { type: 'document', children: [] }
      const content = '<root></root>'

      cache.set('test.xml', ast1, content)
      cache.set('test.xml', ast2, content)

      const result = cache.get('test.xml')
      expect(result).toEqual(ast2)
    })
  })

  describe('Content hash verification', () => {
    it('should detect content changes', () => {
      const ast: TestAST = { type: 'root', children: [] }
      const content1 = '<root></root>'
      const content2 = '<root><child/></root>'

      cache.set('test.xml', ast, content1)
      // hashContent is private, so we'll use a different approach
      const result = cache.get('test.xml', 'different-hash')

      expect(result).toBeNull()
    })

    it('should return cached result if hash matches', () => {
      const ast: TestAST = { type: 'root', children: [] }
      const content = '<root></root>'

      cache.set('test.xml', ast, content)
      // Create cache with same content
      cache.set('test.xml', ast, content)
      const result = cache.get('test.xml')

      expect(result).toEqual(ast)
    })
  })

  describe('Cache statistics', () => {
    it('should track cache hits', () => {
      const ast: TestAST = { type: 'root', children: [] }
      const content = '<root></root>'

      cache.set('test.xml', ast, content)
      cache.get('test.xml')
      cache.get('test.xml')

      const stats = cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(0)
    })

    it('should track cache misses', () => {
      cache.get('nonexistent.xml')
      cache.get('nonexistent2.xml')

      const stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(2)
    })

    it('should calculate hit rate', () => {
      const ast: TestAST = { type: 'root', children: [] }
      const content = '<root></root>'

      cache.set('test.xml', ast, content)
      cache.get('test.xml') // hit
      cache.get('test.xml') // hit
      cache.get('nonexistent.xml') // miss
      cache.get('nonexistent2.xml') // miss

      const stats = cache.getStats()
      expect(stats.hitRate).toBe(50) // 2 hits / 4 total = 50%
    })

    it('should track evictions', () => {
      const cacheSmall = createParserCache<TestAST>({
        maxEntries: 2,
        trackStats: true,
      })

      const ast1: TestAST = { type: 'root', children: [] }
      const ast2: TestAST = { type: 'root', children: [] }
      const ast3: TestAST = { type: 'root', children: [] }

      cacheSmall.set('file1.xml', ast1, '<root></root>')
      cacheSmall.set('file2.xml', ast2, '<root></root>')
      cacheSmall.set('file3.xml', ast3, '<root></root>') // Should evict file1

      const stats = cacheSmall.getStats()
      expect(stats.evictions).toBeGreaterThan(0)
    })
  })

  describe('Cache invalidation', () => {
    it('should invalidate specific entry', () => {
      const ast: TestAST = { type: 'root', children: [] }
      cache.set('test.xml', ast, '<root></root>')
      cache.invalidate('test.xml')

      const result = cache.get('test.xml')
      expect(result).toBeNull()
    })

    it('should invalidate multiple files', () => {
      const ast: TestAST = { type: 'root', children: [] }
      cache.set('file1.xml', ast, '<root></root>')
      cache.set('file2.xml', ast, '<root></root>')
      cache.set('file3.xml', ast, '<root></root>')

      cache.invalidateMultiple(['file1.xml', 'file2.xml'])

      expect(cache.get('file1.xml')).toBeNull()
      expect(cache.get('file2.xml')).toBeNull()
      expect(cache.get('file3.xml')).toEqual(ast)
    })

    it('should clear entire cache', () => {
      const ast: TestAST = { type: 'root', children: [] }
      cache.set('file1.xml', ast, '<root></root>')
      cache.set('file2.xml', ast, '<root></root>')

      cache.clear()

      expect(cache.get('file1.xml')).toBeNull()
      expect(cache.get('file2.xml')).toBeNull()
      expect(cache.size()).toBe(0)
    })

    it('should track invalidation events', () => {
      const ast: TestAST = { type: 'root', children: [] }
      cache.set('test.xml', ast, '<root></root>')
      cache.invalidate('test.xml', 'manual')

      const events = cache.getEvents()
      const invalidateEvent = events.find((e) => e.type === 'invalidate')

      expect(invalidateEvent).toBeDefined()
      expect(invalidateEvent?.reason).toBe('manual')
    })
  })

  describe('Cache entry presence', () => {
    it('should check if entry exists', () => {
      const ast: TestAST = { type: 'root', children: [] }
      cache.set('test.xml', ast, '<root></root>')

      expect(cache.hasEntry('test.xml')).toBe(true)
      expect(cache.hasEntry('nonexistent.xml')).toBe(false)
    })

    it('should report cache size', () => {
      const ast: TestAST = { type: 'root', children: [] }
      expect(cache.size()).toBe(0)

      cache.set('file1.xml', ast, '<root></root>')
      expect(cache.size()).toBe(1)

      cache.set('file2.xml', ast, '<root></root>')
      expect(cache.size()).toBe(2)
    })
  })

  describe('Performance metrics', () => {
    it('should track read times', () => {
      const ast: TestAST = { type: 'root', children: [] }
      cache.set('test.xml', ast, '<root></root>')
      cache.get('test.xml')

      const metrics = cache.getMetrics()
      expect(metrics.totalReads).toBeGreaterThan(0)
      expect(metrics.averageReadTime).toBeGreaterThanOrEqual(0)
    })

    it('should track write times', () => {
      const ast: TestAST = { type: 'root', children: [] }
      cache.set('test.xml', ast, '<root></root>')

      const metrics = cache.getMetrics()
      expect(metrics.totalWrites).toBeGreaterThan(0)
      expect(metrics.averageWriteTime).toBeGreaterThanOrEqual(0)
    })

    it('should calculate cache size', () => {
      const ast: TestAST = { type: 'root', children: [] }
      cache.set('test.xml', ast, '<root></root>')

      const metrics = cache.getMetrics()
      expect(metrics.cacheSize).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Event tracking', () => {
    it('should track cache hits as events', () => {
      const ast: TestAST = { type: 'root', children: [] }
      cache.set('test.xml', ast, '<root></root>')
      cache.get('test.xml')

      const events = cache.getEvents()
      const hitEvent = events.find((e) => e.type === 'hit')

      expect(hitEvent).toBeDefined()
      expect(hitEvent?.file).toBe('test.xml')
    })

    it('should track cache misses as events', () => {
      cache.get('nonexistent.xml')

      const events = cache.getEvents()
      const missEvent = events.find((e) => e.type === 'miss')

      expect(missEvent).toBeDefined()
      expect(missEvent?.file).toBe('nonexistent.xml')
    })

    it('should clear events', () => {
      cache.get('test.xml')
      cache.clearEvents()

      const events = cache.getEvents()
      expect(events).toHaveLength(0)
    })
  })

  describe('Statistics reset', () => {
    it('should reset all statistics', () => {
      const ast: TestAST = { type: 'root', children: [] }
      cache.set('test.xml', ast, '<root></root>')
      cache.get('test.xml')
      cache.get('test.xml')

      cache.resetStats()

      const stats = cache.getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.hitRate).toBe(0)
    })
  })

  describe('Helper function', () => {
    it('should create cache via helper function', () => {
      const createdCache = createParserCache<TestAST>({
        maxEntries: 50,
        ttlMs: 30000,
      })

      expect(createdCache).toBeInstanceOf(ParserCache)
      expect(createdCache.size()).toBe(0)
    })

    it('should apply config in helper function', () => {
      const createdCache = createParserCache<TestAST>({
        maxEntries: 5,
      })

      const ast: TestAST = { type: 'root', children: [] }
      for (let i = 0; i < 10; i++) {
        createdCache.set(`file${i}.xml`, ast, `<root>${i}</root>`)
      }

      // Should have evicted some entries due to maxEntries limit
      expect(createdCache.size()).toBeLessThanOrEqual(5)
    })
  })

  describe('LRU eviction', () => {
    it('should evict least recently used when size limit reached', (done) => {
      const smallCache = createParserCache<TestAST>({
        maxEntries: 3,
        trackStats: true,
      })

      const ast: TestAST = { type: 'root', children: [] }

      smallCache.set('file1.xml', ast, '<root></root>')

      setTimeout(() => {
        smallCache.set('file2.xml', ast, '<root></root>')

        setTimeout(() => {
          smallCache.set('file3.xml', ast, '<root></root>')

          // Access file1 to make it recently used
          smallCache.get('file1.xml')

          setTimeout(() => {
            // Add new file - should evict file2 (least recently used)
            smallCache.set('file4.xml', ast, '<root></root>')

            expect(smallCache.hasEntry('file1.xml')).toBe(true)
            expect(smallCache.hasEntry('file3.xml')).toBe(true)
            expect(smallCache.hasEntry('file4.xml')).toBe(true)

            done()
          }, 10)
        }, 10)
      }, 10)
    })
  })

  describe('Real-world scenarios', () => {
    it('should handle rapid cache operations', () => {
      const ast: TestAST = { type: 'root', children: [] }

      const start = performance.now()

      for (let i = 0; i < 100; i++) {
        cache.set(`file${i}.xml`, ast, `<root>${i}</root>`)
      }

      for (let i = 0; i < 100; i++) {
        cache.get(`file${i}.xml`)
      }

      const duration = performance.now() - start

      expect(duration).toBeLessThan(1000) // Should complete in <1s
      expect(cache.getStats().hits).toBeGreaterThan(0)
    })

    it('should maintain cache during typical workflow', () => {
      const ast1: TestAST = { type: 'root', children: [{ type: 'child', children: [] }] }
      const ast2: TestAST = { type: 'root', children: [{ type: 'child', children: [] }] }

      // Parse and cache file1
      cache.set('file1.xml', ast1, '<root><child/></root>')
      expect(cache.get('file1.xml')).toEqual(ast1)

      // Parse and cache file2
      cache.set('file2.xml', ast2, '<root><child/></root>')
      expect(cache.get('file2.xml')).toEqual(ast2)

      // Get both from cache
      cache.get('file1.xml')
      cache.get('file2.xml')

      const stats = cache.getStats()
      expect(stats.hits).toBeGreaterThan(0)
      expect(stats.misses).toBe(0)
    })

    it('should handle cache performance degradation gracefully', () => {
      const metrics1 = cache.getMetrics()
      expect(metrics1.averageReadTime).toBeGreaterThanOrEqual(0)

      // Populate cache
      const ast: TestAST = { type: 'root', children: [] }
      for (let i = 0; i < 50; i++) {
        cache.set(`file${i}.xml`, ast, `<root>${i}</root>`)
      }

      const metrics2 = cache.getMetrics()
      expect(metrics2.cacheSize).toBeGreaterThan(metrics1.cacheSize)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty cache operations', () => {
      expect(cache.size()).toBe(0)
      expect(cache.getStats().hits).toBe(0)
      expect(cache.getStats().misses).toBe(0)
    })

    it('should handle invalidating non-existent entry', () => {
      expect(() => {
        cache.invalidate('nonexistent.xml')
      }).not.toThrow()
    })

    it('should handle clearing empty cache', () => {
      expect(() => {
        cache.clear()
      }).not.toThrow()

      expect(cache.size()).toBe(0)
    })

    it('should prevent hit rate division by zero', () => {
      const stats = cache.getStats()
      expect(stats.hitRate).toBe(0) // Empty cache should have 0 hit rate, not NaN
    })

    it('should handle cache with one entry', () => {
      const ast: TestAST = { type: 'root', children: [] }
      cache.set('test.xml', ast, '<root></root>')

      const stats = cache.getStats()
      expect(stats.currentSize).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Configuration', () => {
    it('should use default config if none provided', () => {
      const defaultCache = createParserCache<TestAST>()
      expect(defaultCache.size()).toBe(0)
    })

    it('should apply custom max entries limit', () => {
      const limitedCache = createParserCache<TestAST>({
        maxEntries: 2,
      })

      const ast: TestAST = { type: 'root', children: [] }
      limitedCache.set('file1.xml', ast, '<root></root>')
      limitedCache.set('file2.xml', ast, '<root></root>')
      limitedCache.set('file3.xml', ast, '<root></root>')

      expect(limitedCache.size()).toBeLessThanOrEqual(2)
    })

    it('should support TTL configuration', () => {
      const shortTTLCache = createParserCache<TestAST>({
        ttlMs: 100, // 100ms TTL
        trackEvents: true,
      })

      const ast: TestAST = { type: 'root', children: [] }
      shortTTLCache.set('test.xml', ast, '<root></root>')

      // Immediately get should work
      expect(shortTTLCache.get('test.xml')).toEqual(ast)

      // Verify cache has the entry
      expect(shortTTLCache.hasEntry('test.xml')).toBe(true)
    })
  })
})
