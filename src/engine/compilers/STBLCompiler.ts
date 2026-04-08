/**
 * STBL Compiler
 *
 * Compiles JPE text representation back to binary STBL format.
 * Takes JPE text (e.g., "String 0x00000001: \"Hello World\"") and produces
 * a valid STBL binary that the game can read.
 *
 * STBL Binary Format:
 * - Header: magic "STBL" (4B), version (2B), flags (2B), entryCount (4B)
 * - Entries: key (4B), flags (2B), length (2B), value (UTF-16LE)
 */

import type { STBLEntry, STBLCompileResult } from '../parsers/types/stbl'
import { encodeUTF16LE} from '../parsers/types/stbl'

/**
 * Compiled STBL file header structure
 */
const STBL_MAGIC = 'STBL'
const STBL_VERSION = 1
const STBL_FLAGS = 0

export class STBLCompiler {
  /**
   * Compile JPE text to binary STBL format.
   *
   * JPE format:
   *   // STBL File
   *   // Version: 1
   *   // Flags: 0
   *
   *   String 0x00000001: "Hello World"
   *   String 0x00000002: "Goodbye World"
   *   String 0xDEADBEEF: "Sims 4 String"
   */
  static compile(jpeText: string): STBLCompileResult {
    const startTime = performance.now()
    const errors: string[] = []

    try {
      const entries = this.parseJPEText(jpeText, errors)

      if (errors.length > 0) {
        return {
          success: false,
          errors,
          metadata: { entryCount: 0, compileTime: performance.now() - startTime }}
      }

      // Build binary buffer
      const buffer = this.buildBinary(entries)

      return {
        success: true,
        buffer,
        byteLength: buffer.byteLength,
        errors: [],
        metadata: {
          entryCount: entries.length,
          compileTime: performance.now() - startTime}}
    } catch (error) {
      errors.push(`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        success: false,
        errors,
        metadata: { entryCount: 0, compileTime: performance.now() - startTime }}
    }
  }

  /**
   * Parse JPE text into structured entries.
   */
  private static parseJPEText(text: string, errors: string[]): STBLEntry[] {
    const entries: STBLEntry[] = []
    const lines = text.split('\n')
    const seenKeys = new Set<number>()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip empty lines and comments
      if (!line || line.startsWith('//')) continue

      // Parse: String 0x00000001: "value"  OR  String 12345: "value"
      const match = line.match(/^String\s+(0x[0-9a-fA-F]+|\d+)\s*:\s*"(.*)"$/s)
      if (!match) {
        errors.push(`Line ${i + 1}: Invalid STBL entry format: "${line.substring(0, 80)}"`)
        continue
      }

      // Parse key (hex or decimal)
      const keyStr = match[1]
      let key: number
      if (keyStr.startsWith('0x')) {
        key = parseInt(keyStr, 16)
      } else {
        key = parseInt(keyStr, 10)
      }

      if (isNaN(key) || key < 0 || key > 0xFFFFFFFF) {
        errors.push(`Line ${i + 1}: Invalid key: "${keyStr}"`)
        continue
      }

      // Check for duplicate keys
      if (seenKeys.has(key)) {
        errors.push(`Line ${i + 1}: Duplicate key: 0x${key.toString(16).toUpperCase().padStart(8, '0')}`)
        continue
      }
      seenKeys.add(key)

      // Parse value (handle escaped quotes)
      const value = match[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\')

      entries.push({
        key,
        flags: 0,
        value})
    }

    return entries
  }

  /**
   * Build binary STBL buffer from entries.
   */
  private static buildBinary(entries: STBLEntry[]): ArrayBuffer {
    // Calculate total size
    const headerSize = 12 // magic(4) + version(2) + flags(2) + entryCount(4)
    let entryDataSize = 0

    for (const entry of entries) {
      entryDataSize += 8 // key(4) + flags(2) + length(2)
      entryDataSize += entry.value.length * 2 // UTF-16LE string
    }

    const totalSize = headerSize + entryDataSize
    const buffer = new ArrayBuffer(totalSize)
    const view = new DataView(buffer)

    // Write header
    view.setUint8(0, STBL_MAGIC.charCodeAt(0))
    view.setUint8(1, STBL_MAGIC.charCodeAt(1))
    view.setUint8(2, STBL_MAGIC.charCodeAt(2))
    view.setUint8(3, STBL_MAGIC.charCodeAt(3))
    view.setUint16(4, STBL_VERSION, true)
    view.setUint16(6, STBL_FLAGS, true)
    view.setUint32(8, entries.length, true)

    // Write entries
    let offset = headerSize

    for (const entry of entries) {
      view.setUint32(offset, entry.key, true)
      view.setUint16(offset + 4, entry.flags, true)
      view.setUint16(offset + 6, entry.value.length, true)

      // Write UTF-16LE string
      offset += 8
      const encoded = encodeUTF16LE(entry.value)
      const uint8View = new Uint8Array(buffer)
      uint8View.set(encoded, offset)

      offset += entry.value.length * 2
    }

    return buffer
  }

  /**
   * Recompile entries with updated values (for partial saves).
   * Takes existing entries and updates values from a map of key→newValue.
   */
  static recompile(
    existingEntries: STBLEntry[],
    updates: Map<number, string>
  ): STBLCompileResult {
    const startTime = performance.now()
    const errors: string[] = []

    // Apply updates
    const entries = existingEntries.map((entry) => {
      if (updates.has(entry.key)) {
        return { ...entry, value: updates.get(entry.key)! }
      }
      return entry
    })

    // Build binary
    const buffer = this.buildBinary(entries)

    return {
      success: true,
      buffer,
      byteLength: buffer.byteLength,
      errors,
      metadata: {
        entryCount: entries.length,
        compileTime: performance.now() - startTime}}
  }
}
