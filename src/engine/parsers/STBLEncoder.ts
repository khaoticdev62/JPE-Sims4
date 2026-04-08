import { STBLData, encodeUTF16LE } from './types/stbl'

/**
 * STBLEncoder - High-fidelity binary serializer for Sims 4 String Tables.
 * Converts structured STBLData back into the exact binary format required by DBPF.
 */
export class STBLEncoder {
  /**
   * Encode STBL data into an ArrayBuffer
   */
  static encode(data: STBLData): ArrayBuffer {
    const _startTime = performance.now()
    
    // 1. Calculate total buffer size
    let totalSize = 12 // Header size
    for (const entry of data.entries) {
      totalSize += 8 // Entry metadata (Key: 4, Flags: 2, Length: 2)
      totalSize += entry.value.length * 2 // UTF-16 characters
    }

    const buffer = new ArrayBuffer(totalSize)
    const view = new DataView(buffer)

    // 2. Write Header
    // Magic: "STBL"
    for (let i = 0; i < 4; i++) {
       view.setUint8(i, data.magic.charCodeAt(i))
    }
    view.setUint16(4, data.version, true)     // Version (LE)
    view.setUint16(6, data.flags, true)       // Flags (LE)
    view.setUint32(8, data.entries.length, true) // Entry Count (LE)

    // 3. Write Entries
    let offset = 12
    for (const entry of data.entries) {
      view.setUint32(offset, entry.key, true)        // Key (LE)
      // Default to 1 (standard) if flags are not set
      view.setUint16(offset + 4, entry.flags || 0x01, true)   // Flags (LE)
      view.setUint16(offset + 6, entry.value.length, true) // Length (LE)
      
      const stringBuffer = encodeUTF16LE(entry.value)
      const targetView = new Uint8Array(buffer, offset + 8, entry.value.length * 2)
      targetView.set(stringBuffer)
      
      offset += 8 + (entry.value.length * 2)
    }

    return buffer
  }
}
