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
    
    // Convert AST entries to raw format
    const rawEntries = entries.map(e => ({
      key: this.calculateKey(e.text),
      text: e.text
    }))

    return this.generateFromEntries(rawEntries)
  }

  /**
   * Generates a binary STBL buffer from raw entries (key, text).
   */
  static generateFromEntries(entries: Array<{key: number, text: string}>): Buffer {
    // 1. Resolve collisions (Optional, usually keys are unique if generated correctly)
    const usedKeys = new Set<number>()
    const preparedEntries = entries.map(e => {
      let text = e.text
      let key = e.key
      
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
    
    // Safety check
    const _bufferModule = require('buffer')
    const _Buffer = _bufferModule.Buffer
    const maxLength = _bufferModule.constants?.MAX_LENGTH ?? _bufferModule.kMaxLength ?? 2147483647 
    
    if (totalSize > maxLength) {
      throw new Error(`STBL size (${totalSize}) exceeds maximum buffer length.`)
    }
    
    const buffer = _Buffer.alloc(totalSize)

    // --- Header ---
    buffer.write(STBL_MAGIC, 0, 4, 'ascii')
    buffer.writeUInt16LE(STBL_VERSION, 4)
    buffer.writeUInt8(0, 6)
    buffer.writeUInt32LE(count, 7)
    buffer.fill(0, 11, 14)                   // Adjusted reserved bytes fill
    buffer.writeUInt32LE(totalStringLength, 14)

    let entryOffset = HEADER_SIZE
    let stringDataOffset = HEADER_SIZE + (count * ENTRY_SIZE)
    
    // --- Body ---
    for (const entry of preparedEntries) {
      const relativeOffset = stringDataOffset - (HEADER_SIZE + (count * ENTRY_SIZE))
      buffer.writeUInt32LE(entry.key, entryOffset)
      buffer.writeUInt8(0, entryOffset + 4)
      buffer.writeUInt16LE(relativeOffset, entryOffset + 5)
      
      entry.data.copy(buffer, stringDataOffset)
      buffer.writeUInt8(0, stringDataOffset + entry.data.length)
      
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

  /**
   * Parses a binary STBL buffer into an array of entries.
   */
  static parse(buffer: Buffer) {
    if (buffer.length < HEADER_SIZE) {
      throw new Error(`Invalid STBL buffer: Too short (${buffer.length} bytes)`)
    }

    const magic = buffer.toString('ascii', 0, 4)
    if (magic !== STBL_MAGIC) {
      throw new Error(`Invalid STBL buffer: Expected magic 'STBL', found '${magic}'`)
    }

    const version = buffer.readUInt16LE(4)
    if (version !== STBL_VERSION) {
      throw new Error(`Unsupported STBL version: ${version}`)
    }

    const count = buffer.readUInt32LE(7)
    const stringDataOffset = HEADER_SIZE + (count * ENTRY_SIZE)

    const entries = []
    for (let i = 0; i < count; i++) {
      const entryOffset = HEADER_SIZE + (i * ENTRY_SIZE)
      const key = buffer.readUInt32LE(entryOffset)
      const relativeOffset = buffer.readUInt16LE(entryOffset + 5)

      // Find string end (null terminator)
      let length = 0
      const start = stringDataOffset + relativeOffset
      while (start + length < buffer.length && buffer[start + length] !== 0) {
        length++
      }

      const text = buffer.toString('utf8', start, start + length)
      entries.push({ key, text })
    }

    return entries
  }
}
