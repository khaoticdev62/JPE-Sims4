/**
 * STBL (String Table Binary) Type Definitions
 *
 * STBL is a binary format used by The Sims 4 for string tables.
 * Stores key-value pairs where keys are FNV32 hashes and values are UTF-16 strings.
 *
 * File Format:
 * Header (12 bytes):
 * - Magic: "STBL" (4 bytes, ASCII)
 * - Version: uint16 (little-endian)
 * - Flags: uint16 (little-endian)
 * - Entry count: uint32 (little-endian)
 *
 * Entries (8+ bytes each):
 * - Key: uint32 (FNV32 hash, little-endian)
 * - Flags: uint16 (little-endian)
 * - Length: uint16 (UTF-16 characters, little-endian)
 * - Value: UTF-16 string (length * 2 bytes)
 */

/**
 * Parsed STBL entry
 */
export interface STBLEntry {
  key: number // FNV32 hash
  flags: number
  value: string // UTF-16 decoded string
}

/**
 * Parsed STBL file data
 */
export interface STBLData {
  magic: string // Should be "STBL"
  version: number
  flags: number
  entries: STBLEntry[]
  metadata: {
    entryCount: number
    fileSize: number
    parseTime: number
  }
}

/**
 * STBL compilation result
 */
export interface STBLCompileResult {
  success: boolean
  buffer?: ArrayBuffer
  byteLength?: number
  errors: string[]
  metadata: {
    entryCount: number
    compileTime: number
  }
}

/**
 * Helper to convert string to FNV32 hash
 * Used for generating keys from strings
 */
export function stringToFNV32(str: string): number {
  const FNV_32_PRIME = 0x01000193
  const FNV1_32A_INIT = 0x811c9dc5
  let hash = FNV1_32A_INIT

  for (let i = 0; i < str.length; i++) {
    const byte = str.charCodeAt(i) & 0xff
    hash = hash ^ byte
    hash = (hash * FNV_32_PRIME) >>> 0 // Use unsigned right shift to keep 32-bit
  }

  return hash >>> 0 // Convert to unsigned
}

/**
 * Helper to encode string as UTF-16 LE bytes
 */
export function encodeUTF16LE(str: string): Uint8Array {
  const buffer = new ArrayBuffer(str.length * 2)
  const view = new Uint16Array(buffer)

  for (let i = 0; i < str.length; i++) {
    view[i] = str.charCodeAt(i)
  }

  return new Uint8Array(buffer)
}

/**
 * Helper to decode UTF-16 LE bytes to string
 */
export function decodeUTF16LE(buffer: ArrayBuffer, offset: number, length: number): string {
  const view = new Uint16Array(buffer, offset, length)
  let str = ''

  for (let i = 0; i < length; i++) {
    str += String.fromCharCode(view[i])
  }

  return str
}
