import { PackageData, PackageResource } from './types/package'
import { FileService } from '@/services/FileService'

/**
 * PackageStreamWriter - Industrial-grade sequential binary assembler for Sims 4 .package files.
 * Reconstructs 1GB+ files without loading them into memory by using an append-only stream pattern.
 */
export class PackageStreamWriter {
  private targetPath: string = ''
  private currentOffset: number = 0

  constructor(targetPath: string) {
    this.targetPath = targetPath
  }

  /**
   * Initialize the stream writer by clearing the target file
   */
  async start(): Promise<void> {
    await FileService.truncateFile(this.targetPath)
    this.currentOffset = 0
  }

  /**
   * Write the 96-byte DBPF 2.1 Header
   * We typically write this twice: once at start with placeholders, and once at end with real offsets.
   */
  async writeHeader(metadata: PackageData, indexOffset: number, indexSize: number): Promise<void> {
    const buffer = new ArrayBuffer(96)
    const view = new DataView(buffer)
    
    // Magic: "DBPF"
    for (let i = 0; i < 4; i++) {
       view.setUint8(i, metadata.magic.charCodeAt(i))
    }
    view.setUint32(4, metadata.majorVersion, true)
    view.setUint32(8, metadata.minorVersion, true)
    
    // Time stamps
    const now = Math.floor(Date.now() / 1000)
    view.setUint32(24, now, true)
    view.setUint32(28, now, true)
    
    // Index Info
    view.setUint32(32, indexOffset, true)
    view.setUint32(36, indexSize, true)
    
    // V2.1 Specific Offsets
    view.setUint32(60, indexOffset, true)
    view.setUint32(64, indexSize, true)
    
    // If we are at the start, we write at offset 0.
    // If we are at the end, we'd traditionally need a "writeAt" but we can just rewrite the whole file 
    // or use writeFileBuffer if it's the very first 96 bytes and we haven't flushed yet.
    // For this industrial streamer, we'll write it as the first chunk.
    await FileService.appendFileBuffer(this.targetPath, buffer)
    this.currentOffset += 96
  }

  /**
   * Append a raw resource buffer to the file
   * Returns the offset where the resource was written
   */
  async appendResource(buffer: ArrayBuffer): Promise<number> {
    const offset = this.currentOffset
    await FileService.appendFileBuffer(this.targetPath, buffer)
    this.currentOffset += buffer.byteLength
    return offset
  }

  /**
   * Write the Final Index (32-byte entries)
   */
  async finalizeIndex(resources: PackageResource[]): Promise<number> {
    const indexOffset = this.currentOffset
    const entrySize = 32
    const indexBuffer = new ArrayBuffer(resources.length * entrySize)
    const view = new DataView(indexBuffer)
    
    let offset = 0
    for (const res of resources) {
      view.setUint32(offset, res.type, true)
      view.setUint32(offset + 4, res.group, true)
      
      // Instance (64-bit LE)
      const low = Number(res.instance & 0xffffffffn)
      const high = Number(res.instance >> 32n)
      view.setUint32(offset + 8, low, true)
      view.setUint32(offset + 12, high, true)
      
      view.setUint32(offset + 16, res.offset, true)
      view.setUint32(offset + 20, res.size, true)
      view.setUint32(offset + 24, res.compressedSize || 0, true)
      view.setUint16(offset + 28, res.flags, true)
      view.setUint16(offset + 30, 1, true) // Index v1.1
      
      offset += entrySize
    }
    
    await FileService.appendFileBuffer(this.targetPath, indexBuffer)
    this.currentOffset += indexBuffer.byteLength
    
    return indexOffset
  }
}
