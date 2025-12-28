/**
 * STBL Parser
 *
 * Parses binary STBL (String Table) files used by The Sims 4.
 * Converts ArrayBuffer to structured STBLData with all string entries.
 *
 * STBL Format:
 * - Header: magic (4B), version (2B), flags (2B), entryCount (4B)
 * - Entries: key (4B), flags (2B), length (2B), value (UTF-16LE)
 */

import type { STBLData, STBLEntry } from './types/stbl'
import { decodeUTF16LE } from './types/stbl'

/**
 * Parses binary STBL file
 */
export class STBLParser {
  /**
   * Parse ArrayBuffer containing STBL data
   */
  static parse(buffer: ArrayBuffer): STBLData | null {
    const startTime = performance.now()

    try {
      if (buffer.byteLength < 12) {
        console.error('STBL buffer too small for header')
        return null
      }

      const view = new DataView(buffer)

      // Parse header
      const magic = this.readString(buffer, 0, 4)
      if (magic !== 'STBL') {
        console.error(`Invalid STBL magic: ${magic}`)
        return null
      }

      const version = view.getUint16(4, true)
      const flags = view.getUint16(6, true)
      const entryCount = view.getUint32(8, true)

      // Parse entries
      const entries: STBLEntry[] = []
      let offset = 12

      for (let i = 0; i < entryCount; i++) {
        if (offset + 8 > buffer.byteLength) {
          console.error(`STBL entry ${i} exceeds buffer bounds`)
          break
        }

        const key = view.getUint32(offset, true)
        const entryFlags = view.getUint16(offset + 4, true)
        const length = view.getUint16(offset + 6, true)

        offset += 8

        if (offset + length * 2 > buffer.byteLength) {
          console.error(`STBL entry ${i} string data exceeds buffer bounds`)
          break
        }

        const value = decodeUTF16LE(buffer, offset, length)
        offset += length * 2

        entries.push({
          key,
          flags: entryFlags,
          value,
        })
      }

      const parseTime = performance.now() - startTime

      return {
        magic,
        version,
        flags,
        entries,
        metadata: {
          entryCount: entries.length,
          fileSize: buffer.byteLength,
          parseTime,
        },
      }
    } catch (error) {
      console.error('STBL parse error:', error)
      return null
    }
  }

  /**
   * Get entry by key (FNV32 hash)
   */
  static getEntry(data: STBLData, key: number): STBLEntry | undefined {
    return data.entries.find(e => e.key === key)
  }

  /**
   * Get entry by value (useful for reverse lookups)
   */
  static findByValue(data: STBLData, value: string): STBLEntry | undefined {
    return data.entries.find(e => e.value === value)
  }

  /**
   * Find all entries matching a predicate
   */
  static findAll(data: STBLData, predicate: (entry: STBLEntry) => boolean): STBLEntry[] {
    return data.entries.filter(predicate)
  }

  /**
   * Read ASCII string from buffer
   */
  private static readString(buffer: ArrayBuffer, offset: number, length: number): string {
    const view = new Uint8Array(buffer, offset, length)
    let str = ''
    for (let i = 0; i < length; i++) {
      str += String.fromCharCode(view[i])
    }
    return str
  }
}

/**
 * Quick helper function to parse STBL buffer
 */
export function parseSTBL(buffer: ArrayBuffer): STBLData | null {
  return STBLParser.parse(buffer)
}
