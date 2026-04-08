import { fnv32ia } from './hash'
import { LocalizationNode } from './types'

const STBL_MAGIC = 'STBL'
const STBL_VERSION = 5
const HEADER_SIZE = 18
const ENTRY_SIZE = 7

/**
 * STBL (String Table) Binary Generator
 * 
 * Complies with Sims 4 STBL binary format (Resource Type 0x220557DA).
 */
export class STBLService {
  /**
   * Generates a binary STBL buffer for a specific locale from a LocalizationNode.
   */
  static generate(node: LocalizationNode, locale: string): Buffer {
    const targetLocale = locale.toUpperCase()
    const entries = node.entries.filter(e => e.locale.toUpperCase() === targetLocale)
    
    // 1. Pre-calculate keys and resolve collisions
    const usedKeys = new Set<number>()
    const preparedEntries = entries.map(e => {
      let text = e.text
      let key = this.calculateKey(text)
      
      // Story 8.3: Hash Collision Mitigation
      while (usedKeys.has(key)) {
        console.warn(`[STBL] Hash collision detected for key 0x${key.toString(16).toUpperCase()}.`)
        text += '\u200B' // Append zero-width space
        key = this.calculateKey(text)
      }
      
      usedKeys.add(key)
      return {
        key,
        data: Buffer.from(text, 'utf-8')
      }
    })

    // 2. Sort by key (Required by Sims 4 for binary consistency)
    preparedEntries.sort((a, b) => a.key - b.key)

    const count = preparedEntries.length
    let totalStringLength = 0
    preparedEntries.forEach(e => {
        totalStringLength += e.data.length + 1 // +1 for null terminator
    })

    // 3. Allocate: Header + Entry Table + String Data
    const totalSize = HEADER_SIZE + (count * ENTRY_SIZE) + totalStringLength
    
    // Safety check: Avoid overflow or Node.js Buffer limit exceed
    const _bufferModule = require('buffer')
    const _Buffer = _bufferModule.Buffer
    const maxLength = _bufferModule.constants?.MAX_LENGTH ?? _bufferModule.kMaxLength ?? 2147483647 
    
    if (totalSize > maxLength) {
      throw new Error(`STBL size (${totalSize}) exceeds maximum buffer length.`)
    }
    
    const buffer = _Buffer.alloc(totalSize)

    // --- Header (18 Bytes) ---
    buffer.write(STBL_MAGIC, 0, 4, 'ascii')
    buffer.writeUInt16LE(STBL_VERSION, 4)
    buffer.writeUInt8(0, 6)                  // Compressed (0)
    buffer.writeUInt32LE(count, 7)           // String Count
    buffer.fill(0, 11, 13)                   // Reserved (2 bytes)
    buffer.writeUInt8(0, 13)                 // Reserved (1 byte)
    buffer.writeUInt32LE(totalStringLength, 14) // Total String Length

    let entryOffset = HEADER_SIZE
    let stringDataOffset = HEADER_SIZE + (count * ENTRY_SIZE)
    
    // --- Body ---
    for (const entry of preparedEntries) {
      // Entry Table (7 Bytes per entry)
      const relativeOffset = stringDataOffset - (HEADER_SIZE + (count * ENTRY_SIZE))
      buffer.writeUInt32LE(entry.key, entryOffset)
      buffer.writeUInt8(0, entryOffset + 4)     // Flags
      buffer.writeUInt16LE(relativeOffset, entryOffset + 5)
      
      // String Data (UTF-8 Null-Terminated)
      entry.data.copy(buffer, stringDataOffset)
      buffer.writeUInt8(0, stringDataOffset + entry.data.length) // Termination
      
      entryOffset += ENTRY_SIZE
      stringDataOffset += entry.data.length + 1
    }

    return buffer
  }

  /**
   * Calculates the 32-bit FnV-1a hash for a string.
   * This hash is used as the key in the STBL and referenced in XML.
   */
  static calculateKey(text: string): number {
    return fnv32ia(text)
  }

  /**
   * Helper to format a key for XML output (hex string)
   */
  static formatKey(text: string): string {
    const key = this.calculateKey(text)
    return '0x' + key.toString(16).toUpperCase().padStart(8, '0')
  }
}
