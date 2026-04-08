import { PackageData, PackageResource, formatResourceId } from './types/package'

/**
 * PackageWriter - High-fidelity binary assembler for Sims 4 .package files (DBPF 2.1).
 * Reconstructs the entire package structure from a map of resource buffers.
 */
export class PackageWriter {
  /**
   * Assemble a complete .package binary from resource data
   * @param metadata The package metadata (magic, versions, resource list)
   * @param resourceBuffers Map of resource ID to its raw ArrayBuffer
   */
  static writePackage(metadata: PackageData, resourceBuffers: Map<string, ArrayBuffer>): ArrayBuffer {
    const startTime = performance.now()
    
    // 1. Calculate Offsets and Total Size
    // Header (96) + Resource Data + Index (N * 32)
    const headerSize = 96
    const indexEntrySize = 32
    
    let currentOffset = headerSize
    const updatedResources: PackageResource[] = []
    
    // First pass: Calculate offsets for all resources
    for (const res of metadata.resources) {
      const id = formatResourceId(res.type, res.group, res.instance)
      const data = resourceBuffers.get(id)
      
      if (!data) {
        console.warn(`[PackageWriter] Missing data for resource ${id}, skipping.`)
        continue
      }
      
      updatedResources.push({
        ...res,
        offset: currentOffset,
        size: data.byteLength,
        compressedSize: 0, // No compression for now
        isCompressed: false,
        flags: 0x0000 // Raw data flag
      })
      
      currentOffset += data.byteLength
    }
    
    const indexOffset = currentOffset
    const indexSize = updatedResources.length * indexEntrySize
    const totalSize = indexOffset + indexSize
    
    const buffer = new ArrayBuffer(totalSize)
    const view = new DataView(buffer)
    const uint8View = new Uint8Array(buffer)
    
    // 2. Write Header (96 bytes)
    // Magic: "DBPF" (4 bytes)
    for (let i = 0; i < 4; i++) {
      view.setUint8(i, metadata.magic.charCodeAt(i))
    }
    view.setUint32(4, metadata.majorVersion, true) // Major (2)
    view.setUint32(8, metadata.minorVersion, true) // Minor (1)
    
    // User reserved / flags (typically zeros in modern tools)
    view.setUint32(12, 0, true)
    view.setUint32(16, 0, true)
    
    // Time created / modified (optional, but good for fidelity)
    const now = Math.floor(Date.now() / 1000)
    view.setUint32(24, now, true)
    view.setUint32(28, now, true)
    
    // Index Information
    view.setUint32(32, indexOffset, true)
    view.setUint32(36, indexSize, true)
    
    // Version 2.1 specific flags at 60 (offset to index)
    view.setUint32(60, indexOffset, true)
    view.setUint32(64, indexSize, true)
    
    // 3. Write Resource Data
    for (const res of updatedResources) {
      const id = formatResourceId(res.type, res.group, res.instance)
      const data = resourceBuffers.get(id)
      if (data) {
        uint8View.set(new Uint8Array(data), res.offset)
      }
    }
    
    // 4. Write Index (32-byte entries)
    let offset = indexOffset
    for (const res of updatedResources) {
      view.setUint32(offset, res.type, true)
      view.setUint32(offset + 4, res.group, true)
      
      // Write Instance (64-bit BigInt LE)
      const low = Number(res.instance & 0xffffffffn)
      const high = Number(res.instance >> 32n)
      view.setUint32(offset + 8, low, true)
      view.setUint32(offset + 12, high, true)
      
      view.setUint32(offset + 16, res.offset, true)
      view.setUint32(offset + 20, res.size, true)
      view.setUint32(offset + 24, 0, true) // Compressed Size (0)
      
      // Flags: 0xFFFF indicates "Not Compressed" in older DBPF, 
      // but 0x0000 is common for Sims 4 raw resources.
      view.setUint16(offset + 28, 0, true) 
      view.setUint16(offset + 30, 1, true) // Typically 1 for index v1.1
      
      offset += indexEntrySize
    }
    
    console.log(`[PackageWriter] Successfully assembled package: ${updatedResources.length} resources, ${totalSize} bytes. Time: ${performance.now() - startTime}ms`)
    
    return buffer
  }
}
