/**
 * Package Parser
 *
 * Parses binary .package files (DBPF format) used by The Sims 4.
 * Extracts resource metadata and optionally decompresses resource data.
 *
 * DBPF Format:
 * - Header: magic (4B), major version (4B), minor version (4B), reserved, index offset (4B), index size (4B)
 * - Index: Array of resource entries
 * - Resource Data: Raw or compressed file data
 */

import type { PackageData, PackageResource, PackageParseResult} from './types/package'
import { formatResourceId, DBPF_RESOURCE_TYPES, decompressZLIB } from './types/package'

/**
 * Parses DBPF package files
 */
export class PackageParser {
  /**
   * Parse .package file and extract resource metadata
   * Does not extract resource data by default (use parseWithResources for that)
   */
  static parse(buffer: ArrayBuffer): PackageData | null {
    const startTime = performance.now()

    try {
      if (buffer.byteLength < 64) {
        console.error('Package buffer too small for header')
        return null
      }

      const view = new DataView(buffer)

      // Parse header
      const magic = this.readString(buffer, 0, 4)
      if (magic !== 'DBPF') {
        console.error(`Invalid package magic: ${magic}`)
        return null
      }

      // Header structure (variable between versions)
      const majorVersion = view.getUint32(4, true)
      const minorVersion = view.getUint32(8, true)

      // Find index - typically after 32-byte header
      let indexOffset = view.getUint32(32, true)
      let indexSize = view.getUint32(36, true)

      // Some versions have different header layout
      if (indexOffset === 0 || indexOffset > buffer.byteLength) {
        // Try alternate offset
        indexOffset = view.getUint32(60, true)
        indexSize = view.getUint32(64, true)
      }

      if (indexOffset + indexSize > buffer.byteLength) {
        console.error('Index exceeds buffer bounds')
        return null
      }

      // Parse index entries (24 bytes each)
      const resources: PackageResource[] = []
      let offset = indexOffset

      while (offset < indexOffset + indexSize && offset + 24 <= buffer.byteLength) {
        const type = view.getUint32(offset, true)
        const group = view.getUint32(offset + 4, true)
        const instance = this.readBigUint64(view, offset + 8)
        const resourceOffset = view.getUint32(offset + 16, true)
        const resourceSize = view.getUint32(offset + 20, true)

        // Additional fields in newer versions
        let compressedSize = 0
        let flags = 0

        // Check if we have enough space for extended entry (32 bytes)
        if (offset + 32 <= indexOffset + indexSize) {
          compressedSize = view.getUint32(offset + 24, true)
          flags = view.getUint32(offset + 28, true)
        }

        resources.push({
          type,
          group,
          instance,
          offset: resourceOffset,
          size: resourceSize,
          compressedSize,
          flags,
          isCompressed: compressedSize > 0 && compressedSize < resourceSize})

        offset += 24
      }

      const parseTime = performance.now() - startTime

      return {
        magic,
        majorVersion,
        minorVersion,
        resources,
        metadata: {
          resourceCount: resources.length,
          fileSize: buffer.byteLength,
          indexOffset,
          parseTime}}
    } catch (error) {
      console.error('Package parse error:', error)
      return null
    }
  }

  /**
   * Parse static header and index from separate buffers
   * Essential for memory-efficient processing of huge packages.
   */
  static parseOnlyIndex(headerBuffer: ArrayBuffer, indexBuffer: ArrayBuffer): PackageData | null {
    const startTime = performance.now()
    try {
      const headerView = new DataView(headerBuffer)
      const magic = this.readString(headerBuffer, 0, 4)
      const majorVersion = headerView.getUint32(4, true)
      const minorVersion = headerView.getUint32(8, true)
      
      const indexView = new DataView(indexBuffer)
      const resources: PackageResource[] = []
      let offset = 0
      
      // Determine entry size based on total size vs count (if known) or by checking 32-byte alignment
      const entrySize = (indexBuffer.byteLength % 32 === 0) ? 32 : 24
      
      while (offset + entrySize <= indexBuffer.byteLength) {
        const type = indexView.getUint32(offset, true)
        const group = indexView.getUint32(offset + 4, true)
        const instance = this.readBigUint64(indexView, offset + 8)
        const resourceOffset = indexView.getUint32(offset + 16, true)
        const resourceSize = indexView.getUint32(offset + 20, true)
        
        let compressedSize = 0
        let flags = 0
        if (entrySize === 32) {
          compressedSize = indexView.getUint32(offset + 24, true)
          flags = indexView.getUint32(offset + 28, true)
        }
        
        resources.push({
          type, group, instance, 
          offset: resourceOffset, 
          size: resourceSize, 
          compressedSize, flags, 
          isCompressed: compressedSize > 0 && compressedSize < resourceSize
        })
        offset += entrySize
      }

      return {
        magic, majorVersion, minorVersion, resources,
        metadata: {
          resourceCount: resources.length,
          fileSize: 0, // Unknown without full file
          indexOffset: 0,
          parseTime: performance.now() - startTime
        }
      }
    } catch (e) {
      console.error('[PackageParser] parseOnlyIndex failed', e)
      return null
    }
  }

  /**
   * Parse package and optionally extract resource data
   */
  static async parseWithResources(
    buffer: ArrayBuffer,
    extractResources: boolean = false,
    resourceFilter?: (resource: PackageResource) => boolean
  ): Promise<PackageParseResult> {
    const startTime = performance.now()
    const errors: string[] = []
    const resourceData = new Map<string, ArrayBuffer>()

    try {
      const data = this.parse(buffer)
      if (!data) {
        return {
          success: false,
          errors: ['Failed to parse package header'],
          metadata: {
            resourceCount: 0,
            totalSize: buffer.byteLength,
            parseTime: performance.now() - startTime}}
      }

      if (extractResources) {
        const _view = new Uint8Array(buffer)

        for (const resource of data.resources) {
          if (resourceFilter && !resourceFilter(resource)) {
            continue
          }

          try {
            const MAX_RESOURCE_SIZE = 50 * 1024 * 1024 // 50MB Safety Limit
            
            if (resource.size > MAX_RESOURCE_SIZE) {
              errors.push(`Resource too large to extract: ${formatResourceId(resource.type, resource.group, resource.instance)} (${(resource.size / 1024 / 1024).toFixed(1)}MB)`)
              continue
            }

            let resourceBuffer = buffer.slice(resource.offset, resource.offset + resource.size)
            
            // Handle decompression if necessary
            if (resource.isCompressed) {
              const decompressedData = await decompressZLIB(resourceBuffer, resource.size)
              if (decompressedData) {
                resourceBuffer = decompressedData
              } else {
                errors.push(`Failed to decompress resource: ${formatResourceId(resource.type, resource.group, resource.instance)}`)
                continue
              }
            }

            const id = formatResourceId(resource.type, resource.group, resource.instance)
            resourceData.set(id, resourceBuffer)
          } catch (error) {
            errors.push(`Failed to extract resource: ${String(error)}`)
          }
        }
      }

      const parseTime = performance.now() - startTime

      return {
        success: errors.length === 0,
        data,
        resourceData: resourceData.size > 0 ? resourceData : undefined,
        errors,
        metadata: {
          resourceCount: data.resources.length,
          totalSize: buffer.byteLength,
          parseTime}}
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown parse error'],
        metadata: {
          resourceCount: 0,
          totalSize: buffer.byteLength,
          parseTime: performance.now() - startTime}}
    }
  }

  /**
   * Find resources by type
   */
  static findByType(data: PackageData, type: number): PackageResource[] {
    return data.resources.filter(r => r.type === type)
  }

  /**
   * Find resource by ID
   */
  static findById(data: PackageData, type: number, group: number, instance: bigint): PackageResource | undefined {
    return data.resources.find(r => r.type === type && r.group === group && r.instance === instance)
  }

  /**
   * Get all STBL resources in package
   */
  static getSTBLResources(data: PackageData): PackageResource[] {
    return this.findByType(data, DBPF_RESOURCE_TYPES.STBL)
  }

  /**
   * Get all tuning resources in package
   */
  static getTuningResources(data: PackageData): PackageResource[] {
    return data.resources.filter(r => r.type !== DBPF_RESOURCE_TYPES.STBL && r.type !== DBPF_RESOURCE_TYPES.Script)
  }

  /**
   * Get all script resources in package
   */
  static getScriptResources(data: PackageData): PackageResource[] {
    return this.findByType(data, DBPF_RESOURCE_TYPES.Script)
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

  /**
   * Read BigInt (64-bit) from DataView (compatibility helper)
   */
  private static readBigUint64(view: DataView, offset: number): bigint {
    // Manual implementation for compatibility
    const low = view.getUint32(offset, true)
    const high = view.getUint32(offset + 4, true)
    return (BigInt(high) << 32n) | BigInt(low)
  }
}

/**
 * Quick helper function to parse package buffer
 */
export function parsePackage(buffer: ArrayBuffer): PackageData | null {
  return PackageParser.parse(buffer)
}

/**
 * Quick helper function to parse package with resources
 */
export async function parsePackageWithResources(buffer: ArrayBuffer): Promise<PackageParseResult> {
  return PackageParser.parseWithResources(buffer, true)
}
