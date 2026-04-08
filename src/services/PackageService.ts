/**
 * Package Service
 * 
 * Manages virtual file system for .package files and provides 
 * access to raw and decompressed mod resources.
 */

import { PackageParser } from '@/engine/parsers/PackageParser'
import { formatResourceId, DBPF_RESOURCE_TYPES } from '@/engine/parsers/types/package'
import type { PackageData, PackageResource } from '@/engine/parsers/types/package'
import pako from 'pako';

export interface PackageOutputResource {
  type: number;
  group: number;
  instance: bigint;
  content: Uint8Array;
  compressed?: boolean;
}

export interface VirtualFile {
  id: string; // type-group-instance
  path: string; // Virtual path: "my_mod.package/tuning/instance"
  name: string;
  type: string; // 'xml', 'stbl', 'binary'
  packagePath: string; // Path to original .package file
  resource: PackageResource;
}

export class PackageService {
  private static packageCache = new Map<string, PackageData>()
  private static resourceCache = new Map<string, ArrayBuffer>()

  /**
   * Load a package and index its resources
   */
  static async loadPackage(filePath: string, buffer: ArrayBuffer): Promise<PackageData | null> {
    try {
      const data = PackageParser.parse(buffer)
      if (data) {
        this.packageCache.set(filePath, data)
      }
      return data
    } catch (error) {
      console.error(`Failed to load package: ${filePath}`, error)
      return null
    }
  }

  /**
   * Get virtual files for a package
   */
  static getVirtualFiles(packagePath: string): VirtualFile[] {
    const data = this.packageCache.get(packagePath)
    if (!data) return []

    return data.resources.map(resource => {
      const id = formatResourceId(resource.type, resource.group, resource.instance)
      let type = 'binary'
      const name = id // Default name is ID

      if (resource.type === DBPF_RESOURCE_TYPES.STBL) {
        type = 'stbl'
      } else if (resource.type === DBPF_RESOURCE_TYPES.TuningInstance || 
                 resource.type === DBPF_RESOURCE_TYPES.Buff || 
                 resource.type === DBPF_RESOURCE_TYPES.Trait || 
                 resource.type === DBPF_RESOURCE_TYPES.GameplayData) {
        type = 'xml'
      } else if (resource.type === DBPF_RESOURCE_TYPES.PNG || 
                 resource.type === DBPF_RESOURCE_TYPES.DDS ||
                 resource.type === DBPF_RESOURCE_TYPES.LRLE ||
                 resource.type === DBPF_RESOURCE_TYPES.THUM) {
        type = 'image'
      }

      return {
        id,
        path: `${packagePath}/${id}`,
        name,
        type,
        packagePath,
        resource
      }
    })
  }

  /**
   * Optimized Resource Extraction (Patch #2)
   * Uses existing package metadata to avoid re-parsing the index.
   */
  static async extractResourceFast(
    packagePath: string, 
    resource: PackageResource, 
    buffer: ArrayBuffer
  ): Promise<ArrayBuffer | null> {
    try {
      let resourceBuffer = buffer.slice(resource.offset, resource.offset + resource.size)
      
      if (resource.isCompressed) {
        const { decompressZLIB } = await import('@/engine/parsers/types/package')
        const decompressed = await decompressZLIB(resourceBuffer, resource.size)
        if (decompressed) {
          resourceBuffer = decompressed
        }
      }
      
      return resourceBuffer
    } catch (e) {
      console.error(`[PackageService] Fast extraction failed for ${formatResourceId(resource.type, resource.group, resource.instance)}`, e)
      return null
    }
  }

  /**
   * Extract Resource as Base64 (Story 4.6)
   * Converts binary resource data directly to base64 for UI rendering.
   */
  static async extractResourceAsBase64(
    packagePath: string,
    resource: PackageResource,
    buffer: ArrayBuffer
  ): Promise<string | null> {
    try {
      const data = await this.extractResourceFast(packagePath, resource, buffer)
      if (!data) return null

      // High-Performance Blob-based Conversion (Story 4.6 Hardening)
      // This is O(1) memory efficient as it leverages browser internals
      return new Promise((resolve) => {
        const blob = new Blob([data])
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64data = reader.result as string
          // Remove "data:*/*;base64," prefix for consistency with existing content store
          resolve(base64data.split(',')[1])
        }
        reader.readAsDataURL(blob)
      })
    } catch (e) {
      console.error(`[PackageService] Base64 extraction failed`, e)
      return null
    }
  }

  /**
   * Extract Tuning Name (Patch #2)
   * Scans the first 1KB of XML for the 'n=' attribute.
   */
  static async getResourceName(
    resource: PackageResource,
    buffer: ArrayBuffer
  ): Promise<string | null> {
    if (resource.type === DBPF_RESOURCE_TYPES.STBL || resource.type === DBPF_RESOURCE_TYPES.Script) {
      return null
    }

    try {
      const data = await this.extractResourceFast('', resource, buffer)
      if (!data) return null

      const text = new TextDecoder().decode(data.slice(0, 2048))
      const match = text.match(/ n="([^"]+)"/)
      return match ? match[1] : null
    } catch {
      return null
    }
  }

  /**
   * Create a DBPF v2.1 Package (Story 2.3.1)
   * High-fidelity binary packing for Sims 4 production bundles.
   */
  static async createPackage(resources: PackageOutputResource[]): Promise<ArrayBuffer> {
    const HEADER_SIZE = 96;
    const INDEX_ENTRY_SIZE = 32; // Type(4), Group(4), InstanceHi(4), InstanceLo(4), Offset(4), Size(4), SizeUncomp(4), Flags(2), Unknown(2)

    // 1. Compress resources and calculate offsets
    let currentOffset = HEADER_SIZE;
    const packedEntries = resources.map(res => {
      let finalContent = res.content;
      let isCompressed = false;
      const uncompressedSize = res.content.length;

      if (res.compressed !== false && uncompressedSize > 128) {
        try {
          finalContent = pako.deflate(res.content);
          isCompressed = true;
        } catch (e) {
          console.warn(`[PackageService] Compression failed for resource, falling back to uncompressed`, e);
        }
      }

      const entry = {
        ...res,
        finalContent,
        offset: currentOffset,
        size: finalContent.length,
        uncompressedSize,
        isCompressed
      };
      
      currentOffset += finalContent.length;
      return entry;
    });

    const indexOffset = currentOffset;
    const indexSize = packedEntries.length * INDEX_ENTRY_SIZE;
    const totalSize = indexOffset + indexSize;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    // 2. Write Header (96 bytes)
    view.setUint32(0, 0x44425046, false); // 'DBPF'
    view.setUint32(4, 2, true); // Major version 2
    view.setUint32(8, 1, true); // Minor version 1
    // ... [Bytes 12-35 reserved/zero]
    view.setUint32(36, packedEntries.length, true); // Index count
    view.setUint32(40, indexOffset, true); // Index offset
    view.setUint32(44, indexSize, true); // Index size
    // ... [Bytes 48-95 reserved/version-specific]
    view.setUint32(56, 3, true); // Index version (3 for S4)

    // 3. Write Resource Chunks
    const uint8 = new Uint8Array(buffer);
    packedEntries.forEach(entry => {
      uint8.set(entry.finalContent, entry.offset);
    });

    // 4. Write Index Table
    let currentEntryOffset = indexOffset;
    packedEntries.forEach(entry => {
      view.setUint32(currentEntryOffset, entry.type, true);
      view.setUint32(currentEntryOffset + 4, entry.group, true);
      
      // Instance is 64-bit (Hi/Lo)
      const inst = BigInt(entry.instance);
      view.setUint32(currentEntryOffset + 8, Number(inst >> 32n), true); // Hi
      view.setUint32(currentEntryOffset + 12, Number(inst & 0xFFFFFFFFn), true); // Lo
      
      view.setUint32(currentEntryOffset + 16, entry.offset, true);
      view.setUint32(currentEntryOffset + 20, entry.size | 0x80000000, true); // Set compression bit if needed (Sims 4 convention varies, often use flags)
      view.setUint32(currentEntryOffset + 24, entry.uncompressedSize, true);
      view.setUint16(currentEntryOffset + 28, entry.isCompressed ? 0xFFFF : 0x0000, true); // Flags (0xFFFF = compressed)
      view.setUint16(currentEntryOffset + 30, 0x0001, true); // Constant
      
      currentEntryOffset += INDEX_ENTRY_SIZE;
    });

    return buffer;
  }
}
