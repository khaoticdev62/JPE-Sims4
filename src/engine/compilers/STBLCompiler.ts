/**
 * STBL Compiler
 *
 * Compiles STBLData back to binary STBL format.
 * Handles round-trip: STBL binary → STBLData → STBL binary
 *
 * Critical for data integrity: output must match input exactly.
 */

import type { STBLData, STBLEntry, STBLCompileResult } from '@/engine/parsers/types/stbl'
import { encodeUTF16LE } from '@/engine/parsers/types/stbl'

/**
 * Compiles STBLData to binary STBL buffer
 */
export class STBLCompiler {
  /**
   * Compile STBLData to ArrayBuffer
   */
  static compile(data: STBLData): STBLCompileResult {
    const startTime = performance.now()
    const errors: string[] = []

    try {
      // Calculate total size needed
      let totalSize = 12 // Header

      for (const entry of data.entries) {
        totalSize += 8 // Key, flags, length
        totalSize += entry.value.length * 2 // UTF-16 encoded string
      }

      // Create buffer
      const buffer = new ArrayBuffer(totalSize)
      const view = new DataView(buffer)
      const uint8View = new Uint8Array(buffer)

      let offset = 0

      // Write header
      this.writeString(uint8View, offset, data.magic, 4)
      offset += 4

      view.setUint16(offset, data.version, true)
      offset += 2

      view.setUint16(offset, data.flags, true)
      offset += 2

      view.setUint32(offset, data.entries.length, true)
      offset += 4

      // Write entries
      for (const entry of data.entries) {
        if (offset + 8 > buffer.byteLength) {
          errors.push(`Entry exceeds buffer bounds at offset ${offset}`)
          break
        }

        view.setUint32(offset, entry.key, true)
        offset += 4

        view.setUint16(offset, entry.flags, true)
        offset += 2

        view.setUint16(offset, entry.value.length, true)
        offset += 2

        // Write UTF-16 LE string
        const encoded = encodeUTF16LE(entry.value)
        if (offset + encoded.length > buffer.byteLength) {
          errors.push(`Entry string data exceeds buffer bounds at offset ${offset}`)
          break
        }

        uint8View.set(encoded, offset)
        offset += encoded.length
      }

      const compileTime = performance.now() - startTime

      if (errors.length === 0) {
        return {
          success: true,
          buffer,
          byteLength: buffer.byteLength,
          errors: [],
          metadata: {
            entryCount: data.entries.length,
            compileTime,
          },
        }
      } else {
        return {
          success: false,
          errors,
          metadata: {
            entryCount: data.entries.length,
            compileTime,
          },
        }
      }
    } catch (error) {
      const compileTime = performance.now() - startTime
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown compilation error'],
        metadata: {
          entryCount: data.entries.length,
          compileTime,
        },
      }
    }
  }

  /**
   * Create new STBLData with specified entries
   */
  static create(entries: Array<{ key: number; value: string; flags?: number }>): STBLData {
    return {
      magic: 'STBL',
      version: 0,
      flags: 0,
      entries: entries.map(e => ({
        key: e.key,
        flags: e.flags ?? 0,
        value: e.value,
      })),
      metadata: {
        entryCount: entries.length,
        fileSize: 0,
        parseTime: 0,
      },
    }
  }

  /**
   * Add entry to STBLData
   */
  static addEntry(data: STBLData, key: number, value: string, flags: number = 0): void {
    // Check for duplicate keys
    const existing = data.entries.findIndex(e => e.key === key)
    if (existing >= 0) {
      data.entries[existing] = { key, value, flags }
    } else {
      data.entries.push({ key, value, flags })
    }
    data.metadata.entryCount = data.entries.length
  }

  /**
   * Remove entry from STBLData
   */
  static removeEntry(data: STBLData, key: number): boolean {
    const index = data.entries.findIndex(e => e.key === key)
    if (index >= 0) {
      data.entries.splice(index, 1)
      data.metadata.entryCount = data.entries.length
      return true
    }
    return false
  }

  /**
   * Sort entries by key for consistency
   */
  static sort(data: STBLData): void {
    data.entries.sort((a, b) => a.key - b.key)
  }

  /**
   * Write ASCII string to buffer
   */
  private static writeString(buffer: Uint8Array, offset: number, str: string, maxLength: number): void {
    const length = Math.min(str.length, maxLength)
    for (let i = 0; i < length; i++) {
      buffer[offset + i] = str.charCodeAt(i) & 0xff
    }
  }
}

/**
 * Quick helper function to compile STBL data
 */
export function compileSTBL(data: STBLData): STBLCompileResult {
  return STBLCompiler.compile(data)
}
