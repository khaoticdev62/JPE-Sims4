/**
 * STBL Parser Tests
 *
 * Tests for STBL (String Table Binary) parsing and compilation.
 * Includes unit tests and round-trip validation.
 */

import { describe, it, expect } from 'vitest'
import { STBLParser} from '../STBLParser'
import { STBLCompiler} from '@/engine/compilers/STBLCompiler'
import type { STBLData } from '../types/stbl'
import { stringToFNV32, encodeUTF16LE, decodeUTF16LE } from '../types/stbl'

describe('STBL Parser', () => {
  describe('Helper functions', () => {
    it('should encode string to UTF-16LE', () => {
      const encoded = encodeUTF16LE('Hello')
      expect(encoded.length).toBe(10) // 5 chars * 2 bytes
      expect(encoded[0]).toBe(72) // 'H'
      expect(encoded[1]).toBe(0)
    })

    it('should decode UTF-16LE to string', () => {
      const encoded = encodeUTF16LE('Hello')
      const decoded = decodeUTF16LE(encoded.buffer, 0, 5)
      expect(decoded).toBe('Hello')
    })

    it('should generate FNV32 hash from string', () => {
      const hash1 = stringToFNV32('Hello')
      const hash2 = stringToFNV32('Hello')
      expect(hash1).toBe(hash2) // Deterministic
      expect(typeof hash1).toBe('number')
    })

    it('should generate different hashes for different strings', () => {
      const hash1 = stringToFNV32('Hello')
      const hash2 = stringToFNV32('World')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('Basic parsing', () => {
    it('should parse simple STBL buffer', () => {
      const data = STBLCompiler.create([
        { key: 0x12345678, value: 'Hello' },
      ])
      const result = STBLCompiler.compile(data)

      expect(result.success).toBe(true)
      expect(result.buffer).toBeDefined()

      const parsed = STBLParser.parse(result.buffer!)
      expect(parsed).not.toBeNull()
      expect(parsed?.magic).toBe('STBL')
      expect(parsed?.entries.length).toBe(1)
      expect(parsed?.entries[0].value).toBe('Hello')
    })

    it('should parse STBL with multiple entries', () => {
      const data = STBLCompiler.create([
        { key: 0x11111111, value: 'Entry 1' },
        { key: 0x22222222, value: 'Entry 2' },
        { key: 0x33333333, value: 'Entry 3' },
      ])
      const result = STBLCompiler.compile(data)
      const parsed = STBLParser.parse(result.buffer!)

      expect(parsed?.entries.length).toBe(3)
      expect(parsed?.entries[0].value).toBe('Entry 1')
      expect(parsed?.entries[1].value).toBe('Entry 2')
      expect(parsed?.entries[2].value).toBe('Entry 3')
    })

    it('should handle empty string entries', () => {
      const data = STBLCompiler.create([
        { key: 0x12345678, value: '' },
      ])
      const result = STBLCompiler.compile(data)
      const parsed = STBLParser.parse(result.buffer!)

      expect(parsed?.entries[0].value).toBe('')
    })

    it('should handle special characters', () => {
      const specialString = 'Hello\nWorld\tTab"Quote'
      const data = STBLCompiler.create([
        { key: 0x12345678, value: specialString },
      ])
      const result = STBLCompiler.compile(data)
      const parsed = STBLParser.parse(result.buffer!)

      expect(parsed?.entries[0].value).toBe(specialString)
    })

    it('should handle Unicode characters', () => {
      const unicodeString = '你好世界 🎮'
      const data = STBLCompiler.create([
        { key: 0x12345678, value: unicodeString },
      ])
      const result = STBLCompiler.compile(data)
      const parsed = STBLParser.parse(result.buffer!)

      expect(parsed?.entries[0].value).toBe(unicodeString)
    })
  })

  describe('Error handling', () => {
    it('should reject invalid magic number', () => {
      const buffer = new ArrayBuffer(12)
      const view = new Uint8Array(buffer)
      view[0] = 'X'.charCodeAt(0) // Invalid magic
      view[1] = 'X'.charCodeAt(0)
      view[2] = 'X'.charCodeAt(0)
      view[3] = 'X'.charCodeAt(0)

      const parsed = STBLParser.parse(buffer)
      expect(parsed).toBeNull()
    })

    it('should reject buffer that is too small', () => {
      const buffer = new ArrayBuffer(8) // Header is 12 bytes
      const parsed = STBLParser.parse(buffer)
      expect(parsed).toBeNull()
    })

    it('should reject empty buffer', () => {
      const buffer = new ArrayBuffer(0)
      const parsed = STBLParser.parse(buffer)
      expect(parsed).toBeNull()
    })

    it('should handle malformed entry data gracefully', () => {
      const data = STBLCompiler.create([
        { key: 0x12345678, value: 'Valid' },
      ])
      const result = STBLCompiler.compile(data)
      const buffer = result.buffer!

      // Truncate buffer to create incomplete entry
      const truncated = buffer.slice(0, buffer.byteLength - 2)
      const parsed = STBLParser.parse(truncated)

      expect(parsed).not.toBeNull()
      // Should skip the incomplete entry
    })
  })

  describe('Entry lookup', () => {
    let testData: STBLData

    beforeEach(() => {
      testData = {
        magic: 'STBL',
        version: 0,
        flags: 0,
        entries: [
          { key: 0x11111111, flags: 0, value: 'First' },
          { key: 0x22222222, flags: 0, value: 'Second' },
          { key: 0x33333333, flags: 0, value: 'Third' },
        ],
        metadata: {
          entryCount: 3,
          fileSize: 0,
          parseTime: 0}}
    })

    it('should find entry by key', () => {
      const entry = STBLParser.getEntry(testData, 0x22222222)
      expect(entry).toBeDefined()
      expect(entry?.value).toBe('Second')
    })

    it('should return undefined for missing key', () => {
      const entry = STBLParser.getEntry(testData, 0x99999999)
      expect(entry).toBeUndefined()
    })

    it('should find entry by value', () => {
      const entry = STBLParser.findByValue(testData, 'Second')
      expect(entry).toBeDefined()
      expect(entry?.key).toBe(0x22222222)
    })

    it('should find all entries matching predicate', () => {
      const entries = STBLParser.findAll(testData, e => e.value.startsWith('S'))
      expect(entries.length).toBe(1) // Second
      expect(entries[0].value).toBe('Second')
    })
  })
})

describe('STBL Compiler', () => {
  describe('Basic compilation', () => {
    it('should compile empty STBL', () => {
      const data = STBLCompiler.create([])
      const result = STBLCompiler.compile(data)

      expect(result.success).toBe(true)
      expect(result.buffer).toBeDefined()
      expect(result.byteLength).toBe(12) // Header only
    })

    it('should compile STBL with entries', () => {
      const data = STBLCompiler.create([
        { key: 0x12345678, value: 'Test' },
      ])
      const result = STBLCompiler.compile(data)

      expect(result.success).toBe(true)
      expect(result.byteLength).toBeGreaterThan(12)
    })

    it('should compile STBL with multiple entries', () => {
      const data = STBLCompiler.create([
        { key: 0x11111111, value: 'Entry 1' },
        { key: 0x22222222, value: 'Entry 2' },
        { key: 0x33333333, value: 'Entry 3' },
      ])
      const result = STBLCompiler.compile(data)

      expect(result.success).toBe(true)
      expect(result.metadata.entryCount).toBe(3)
    })
  })

  describe('Entry manipulation', () => {
    let data: STBLData

    beforeEach(() => {
      data = STBLCompiler.create([
        { key: 0x11111111, value: 'Original' },
      ])
    })

    it('should add new entry', () => {
      STBLCompiler.addEntry(data, 0x22222222, 'New Entry')
      expect(data.entries.length).toBe(2)
      expect(data.metadata.entryCount).toBe(2)
    })

    it('should replace existing entry with same key', () => {
      STBLCompiler.addEntry(data, 0x11111111, 'Modified')
      expect(data.entries.length).toBe(1)
      expect(data.entries[0].value).toBe('Modified')
    })

    it('should remove entry by key', () => {
      const removed = STBLCompiler.removeEntry(data, 0x11111111)
      expect(removed).toBe(true)
      expect(data.entries.length).toBe(0)
    })

    it('should return false when removing non-existent entry', () => {
      const removed = STBLCompiler.removeEntry(data, 0x99999999)
      expect(removed).toBe(false)
    })

    it('should sort entries by key', () => {
      STBLCompiler.addEntry(data, 0x33333333, 'Third')
      STBLCompiler.addEntry(data, 0x22222222, 'Second')
      STBLCompiler.sort(data)

      expect(data.entries[0].key).toBe(0x11111111)
      expect(data.entries[1].key).toBe(0x22222222)
      expect(data.entries[2].key).toBe(0x33333333)
    })
  })

  describe('Metadata handling', () => {
    it('should preserve version and flags', () => {
      const data = STBLCompiler.create([
        { key: 0x12345678, value: 'Test' },
      ])
      data.version = 1
      data.flags = 42

      const result = STBLCompiler.compile(data)
      const parsed = STBLParser.parse(result.buffer!)

      expect(parsed?.version).toBe(1)
      expect(parsed?.flags).toBe(42)
    })

    it('should preserve entry flags', () => {
      const data = STBLCompiler.create([
        { key: 0x12345678, value: 'Test', flags: 7 },
      ])

      const result = STBLCompiler.compile(data)
      const parsed = STBLParser.parse(result.buffer!)

      expect(parsed?.entries[0].flags).toBe(7)
    })
  })
})

describe('Round-trip Translation (STBL → Buffer → STBL)', () => {
  it('should preserve data through round-trip', () => {
    const original = STBLCompiler.create([
      { key: 0x12345678, value: 'Hello', flags: 0 },
      { key: 0x87654321, value: 'World', flags: 1 },
    ])

    const compiled = STBLCompiler.compile(original)
    expect(compiled.success).toBe(true)

    const parsed = STBLParser.parse(compiled.buffer!)
    expect(parsed).not.toBeNull()

    // Verify data preserved
    expect(parsed?.entries.length).toBe(2)
    expect(parsed?.entries[0].value).toBe('Hello')
    expect(parsed?.entries[1].value).toBe('World')
  })

  it('should maintain byte-for-byte compatibility', () => {
    const original = STBLCompiler.create([
      { key: 0xaaaabbbb, value: 'Test String' },
    ])

    const compiled1 = STBLCompiler.compile(original)
    const parsed = STBLParser.parse(compiled1.buffer!)
    const compiled2 = STBLCompiler.compile(parsed!)

    expect(compiled1.byteLength).toBe(compiled2.byteLength)
    expect(compiled1.buffer).toBeDefined()
    expect(compiled2.buffer).toBeDefined()

    // Compare buffers
    const view1 = new Uint8Array(compiled1.buffer!)
    const view2 = new Uint8Array(compiled2.buffer!)

    for (let i = 0; i < view1.length; i++) {
      expect(view2[i]).toBe(view1[i])
    }
  })

  it('should handle large STBL with 1000+ entries', () => {
    const entries = Array.from({ length: 1000 }, (_, i) => ({
      key: 0x10000000 + i,
      value: `Entry ${i}`}))

    const original = STBLCompiler.create(entries)
    const compiled = STBLCompiler.compile(original)
    expect(compiled.success).toBe(true)

    const parsed = STBLParser.parse(compiled.buffer!)
    expect(parsed?.entries.length).toBe(1000)

    // Verify round-trip
    const recompiled = STBLCompiler.compile(parsed!)
    expect(recompiled.byteLength).toBe(compiled.byteLength)
  })

  it('should preserve special characters through round-trip', () => {
    const specialChars = 'Line1\nLine2\tTab"Quote\'Single'
    const original = STBLCompiler.create([
      { key: 0x12345678, value: specialChars },
    ])

    const compiled = STBLCompiler.compile(original)
    const parsed = STBLParser.parse(compiled.buffer!)

    expect(parsed?.entries[0].value).toBe(specialChars)
  })

  it('should preserve Unicode through round-trip', () => {
    const unicode = '中文 العربية 🎮 Ω'
    const original = STBLCompiler.create([
      { key: 0x12345678, value: unicode },
    ])

    const compiled = STBLCompiler.compile(original)
    const parsed = STBLParser.parse(compiled.buffer!)

    expect(parsed?.entries[0].value).toBe(unicode)
  })
})

describe('Performance', () => {
  it('should parse large STBL quickly', () => {
    const entries = Array.from({ length: 500 }, (_, i) => ({
      key: 0x10000000 + i,
      value: `Entry ${i}`}))

    const data = STBLCompiler.create(entries)
    const compiled = STBLCompiler.compile(data)

    const start = performance.now()
    const parsed = STBLParser.parse(compiled.buffer!)
    const duration = performance.now() - start

    expect(parsed).not.toBeNull()
    expect(duration).toBeLessThan(100) // Should parse in < 100ms
  })

  it('should compile large STBL quickly', () => {
    const entries = Array.from({ length: 500 }, (_, i) => ({
      key: 0x10000000 + i,
      value: `Entry ${i}`}))

    const data = STBLCompiler.create(entries)

    const start = performance.now()
    const compiled = STBLCompiler.compile(data)
    const duration = performance.now() - start

    expect(compiled.success).toBe(true)
    expect(duration).toBeLessThan(100) // Should compile in < 100ms
  })

  it('should handle round-trip of large STBL under 200ms', () => {
    const entries = Array.from({ length: 1000 }, (_, i) => ({
      key: 0x10000000 + i,
      value: `Entry ${i}`}))

    const data = STBLCompiler.create(entries)

    const start = performance.now()
    const compiled = STBLCompiler.compile(data)
    const parsed = STBLParser.parse(compiled.buffer!)
    const recompiled = STBLCompiler.compile(parsed!)
    const duration = performance.now() - start

    expect(recompiled.success).toBe(true)
    expect(duration).toBeLessThan(200) // Full round-trip < 200ms
  })
})
