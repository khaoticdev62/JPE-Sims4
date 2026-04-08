/**
 * Package (DBPF) Format Type Definitions
 *
 * DBPF (Database Packaged Format) is used by The Sims 4 for .package files.
 * Packages contain compressed resources identified by type, group, and instance IDs.
 *
 * File Format Overview:
 * - Header: DBPF identifier, version, file pointers
 * - Index: Metadata for each resource
 * - Resource Data: Actual file contents (potentially compressed)
 *
 * Resource Identification:
 * - Type: 4-byte identifier (e.g., 0x545D8F1D for STBL)
 * - Group: 4-byte identifier (e.g., 0x00000000)
 * - Instance: 8-byte unique identifier
 */

/**
 * Resource metadata in DBPF index
 */
export interface PackageResource {
  type: number // 4-byte type ID
  group: number // 4-byte group ID
  instance: bigint // 8-byte instance ID
  offset: number // File offset to resource data
  size: number // Uncompressed size
  compressedSize: number // Compressed size (0 if uncompressed)
  flags: number // Compression and other flags
  isCompressed: boolean // Whether resource is compressed
}

/**
 * Parsed package file data
 */
export interface PackageData {
  magic: string // Should be "DBPF"
  majorVersion: number
  minorVersion: number
  resources: PackageResource[]
  metadata: {
    resourceCount: number
    fileSize: number
    indexOffset: number
    parseTime: number
  }
}

/**
 * Package parsing result with optional resource data
 */
export interface PackageParseResult {
  success: boolean
  data?: PackageData
  resourceData?: Map<string, ArrayBuffer> // key: "type-group-instance"
  errors: string[]
  metadata: {
    resourceCount: number
    totalSize: number
    parseTime: number
  }
}

/**
 * Resource identifier combining type, group, instance
 */
export interface ResourceId {
  type: number
  group: number
  instance: bigint
}

/**
 * Common DBPF resource types
 */
export const DBPF_RESOURCE_TYPES = {
  STBL: 0x545d8f1d, // String Table Binary
  SimData: 0x545ac67a, // SimData (XML-like)
  TuningInstance: 0x0c900659, // Tuning Instance
  Buff: 0x0c900d55, // Buff
  Trait: 0x0c9c7d57, // Trait
  GameplayData: 0x0c9c5c4f, // Gameplay Data
  Script: 0xc61e27f1, // Python Script
  CompressedResource: 0xcc09e23a, // Compressed resource header
  PNG: 0x00b2d882, // Portable Network Graphics
  DDS: 0x3453cf72, // DirectDraw Surface (Texture)
  LRLE: 0x033a2f4a, // Linear Run-Length Encoded (Texture)
  THUM: 0x3c1af1f0, // Thumbnail
  LITE: 0x9158220c, // Light Resource
} as const

/**
 * Format resource ID as string for easy lookup
 */
export function formatResourceId(type: number, group: number, instance: bigint): string {
  return `${type.toString(16)}-${group.toString(16)}-${instance.toString(16)}`
}

/**
 * Parse resource ID from string format
 */
export function parseResourceIdString(id: string): ResourceId | null {
  const parts = id.split('-')
  if (parts.length !== 3) return null

  try {
    return {
      type: parseInt(parts[0], 16),
      group: parseInt(parts[1], 16),
      instance: BigInt(`0x${parts[2]}`),
    }
  } catch {
    return null
  }
}

/**
 * Get human-readable resource type name
 */
export function getResourceTypeName(type: number): string {
  const typeMap: Record<number, string> = {
    [DBPF_RESOURCE_TYPES.STBL]: 'String Table',
    [DBPF_RESOURCE_TYPES.SimData]: 'SimData',
    [DBPF_RESOURCE_TYPES.TuningInstance]: 'Tuning Instance',
    [DBPF_RESOURCE_TYPES.Buff]: 'Buff',
    [DBPF_RESOURCE_TYPES.Trait]: 'Trait',
    [DBPF_RESOURCE_TYPES.GameplayData]: 'Gameplay Data',
    [DBPF_RESOURCE_TYPES.Script]: 'Python Script',
    [DBPF_RESOURCE_TYPES.CompressedResource]: 'Compressed Resource',
    [DBPF_RESOURCE_TYPES.PNG]: 'PNG Image',
    [DBPF_RESOURCE_TYPES.DDS]: 'DDS Texture',
    [DBPF_RESOURCE_TYPES.LRLE]: 'LRLE Texture',
    [DBPF_RESOURCE_TYPES.THUM]: 'Thumbnail',
    [DBPF_RESOURCE_TYPES.LITE]: 'Light Resource',
  }

  return typeMap[type] || `Unknown (0x${type.toString(16).toUpperCase()})`
}

import pako from 'pako'

/**
 * Decompress data using ZLIB compression
 * This is typically used for compressed resources in packages
 */
export async function decompressZLIB(
  data: ArrayBuffer,
  expectedSize: number
): Promise<ArrayBuffer | null> {
  try {
    const uint8Data = new Uint8Array(data)
    
    // Check if the data is actually compressed
    // Simulations 4 uses standard ZLIB (RFC 1950)
    const decompressed = pako.inflate(uint8Data)
    
    if (decompressed.length !== expectedSize) {
      console.warn(`Decompressed size mismatch: expected ${expectedSize}, got ${decompressed.length}`)
    }
    
    return decompressed.buffer as ArrayBuffer
  } catch (error) {
    console.error('Decompression failed:', error)
    return null
  }
}
