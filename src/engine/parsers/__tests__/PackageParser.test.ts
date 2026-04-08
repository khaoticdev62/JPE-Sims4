/**
 * Package Parser Tests
 *
 * Tests for DBPF package file parsing.
 * Includes metadata extraction, resource lookup, and error handling.
 */

import { describe, it, expect } from 'vitest'
import { PackageParser} from '../PackageParser'
import { formatResourceId, DBPF_RESOURCE_TYPES } from '../types/package'
import type { PackageData, PackageResource } from '../types/package'

/**
 * Helper to create a minimal DBPF package buffer
 */
function createPackageBuffer(resources: Partial<PackageResource>[] = []): ArrayBuffer {
  // Estimate size: header (64 bytes) + index (24 bytes per resource) + resource data
  const dataOffset = 64 + resources.length * 24

  // Create buffer
  const totalSize = dataOffset + resources.reduce((sum, r) => sum + (r.size || 100), 0)
  const buffer = new ArrayBuffer(totalSize)
  const view = new DataView(buffer)

  // Write header
  // Magic: "DBPF"
  const magic = new Uint8Array(buffer, 0, 4)
  magic[0] = 'D'.charCodeAt(0)
  magic[1] = 'B'.charCodeAt(0)
  magic[2] = 'P'.charCodeAt(0)
  magic[3] = 'F'.charCodeAt(0)

  view.setUint32(4, 1, true) // major version
  view.setUint32(8, 9, true) // minor version

  // Index offset and size
  view.setUint32(32, 64, true) // index offset
  view.setUint32(36, resources.length * 24, true) // index size

  // Write index
  let currentOffset = dataOffset
  let indexPos = 64

  for (const resource of resources) {
    const type = resource.type || 0x545d8f1d
    const group = resource.group || 0x00000000
    const instance = resource.instance || 0n
    const size = resource.size || 100

    view.setUint32(indexPos, type, true)
    view.setUint32(indexPos + 4, group, true)

    // Write BigInt instance as two uint32s
    const bigintLow = Number(instance & 0xffffffffn)
    const bigintHigh = Number((instance >> 32n) & 0xffffffffn)
    view.setUint32(indexPos + 8, bigintLow, true)
    view.setUint32(indexPos + 12, bigintHigh, true)

    view.setUint32(indexPos + 16, currentOffset, true) // offset
    view.setUint32(indexPos + 20, size, true) // size

    currentOffset += size
    indexPos += 24
  }

  return buffer
}

describe('Package Parser', () => {
  describe('Basic parsing', () => {
    it('should parse package header', () => {
      const buffer = createPackageBuffer([])
      const pkg = PackageParser.parse(buffer)

      expect(pkg).not.toBeNull()
      expect(pkg?.magic).toBe('DBPF')
      expect(pkg?.majorVersion).toBe(1)
      expect(pkg?.minorVersion).toBe(9)
    })

    it('should parse package with single resource', () => {
      const buffer = createPackageBuffer([
        {
          type: DBPF_RESOURCE_TYPES.STBL,
          group: 0x00000000,
          instance: 0n,
          size: 100},
      ])

      const pkg = PackageParser.parse(buffer)

      expect(pkg).not.toBeNull()
      expect(pkg?.resources.length).toBe(1)
      expect(pkg?.resources[0].type).toBe(DBPF_RESOURCE_TYPES.STBL)
    })

    it('should parse package with multiple resources', () => {
      const buffer = createPackageBuffer([
        {
          type: DBPF_RESOURCE_TYPES.STBL,
          group: 0x00000000,
          instance: 1n,
          size: 100},
        {
          type: DBPF_RESOURCE_TYPES.SimData,
          group: 0x00000000,
          instance: 2n,
          size: 200},
        {
          type: DBPF_RESOURCE_TYPES.TuningInstance,
          group: 0x00000000,
          instance: 3n,
          size: 150},
      ])

      const pkg = PackageParser.parse(buffer)

      expect(pkg?.resources.length).toBe(3)
      expect(pkg?.metadata.resourceCount).toBe(3)
    })

    it('should handle empty package', () => {
      const buffer = createPackageBuffer([])
      const pkg = PackageParser.parse(buffer)

      expect(pkg).not.toBeNull()
      expect(pkg?.resources.length).toBe(0)
    })
  })

  describe('Error handling', () => {
    it('should reject invalid magic number', () => {
      const buffer = new ArrayBuffer(64)
      const view = new Uint8Array(buffer)
      view[0] = 'X'.charCodeAt(0)
      view[1] = 'X'.charCodeAt(0)
      view[2] = 'X'.charCodeAt(0)
      view[3] = 'X'.charCodeAt(0)

      const pkg = PackageParser.parse(buffer)
      expect(pkg).toBeNull()
    })

    it('should reject buffer that is too small', () => {
      const buffer = new ArrayBuffer(32) // Too small
      const pkg = PackageParser.parse(buffer)
      expect(pkg).toBeNull()
    })

    it('should reject empty buffer', () => {
      const buffer = new ArrayBuffer(0)
      const pkg = PackageParser.parse(buffer)
      expect(pkg).toBeNull()
    })
  })

  describe('Resource lookup', () => {
    let testPackage: PackageData

    beforeEach(() => {
      testPackage = {
        magic: 'DBPF',
        majorVersion: 1,
        minorVersion: 9,
        resources: [
          {
            type: DBPF_RESOURCE_TYPES.STBL,
            group: 0x00000000,
            instance: 1n,
            offset: 100,
            size: 50,
            compressedSize: 0,
            flags: 0,
            isCompressed: false},
          {
            type: DBPF_RESOURCE_TYPES.SimData,
            group: 0x00000001,
            instance: 2n,
            offset: 150,
            size: 100,
            compressedSize: 0,
            flags: 0,
            isCompressed: false},
          {
            type: DBPF_RESOURCE_TYPES.TuningInstance,
            group: 0x00000000,
            instance: 3n,
            offset: 250,
            size: 75,
            compressedSize: 0,
            flags: 0,
            isCompressed: false},
        ],
        metadata: {
          resourceCount: 3,
          fileSize: 10000,
          indexOffset: 64,
          parseTime: 1}}
    })

    it('should find resources by type', () => {
      const stblResources = PackageParser.findByType(testPackage, DBPF_RESOURCE_TYPES.STBL)
      expect(stblResources.length).toBe(1)
      expect(stblResources[0].instance).toBe(1n)
    })

    it('should find resource by ID', () => {
      const resource = PackageParser.findById(testPackage, DBPF_RESOURCE_TYPES.SimData, 0x00000001, 2n)
      expect(resource).toBeDefined()
      expect(resource?.size).toBe(100)
    })

    it('should return undefined for missing resource', () => {
      const resource = PackageParser.findById(testPackage, DBPF_RESOURCE_TYPES.STBL, 0x99999999, 999n)
      expect(resource).toBeUndefined()
    })

    it('should get STBL resources', () => {
      const stblResources = PackageParser.getSTBLResources(testPackage)
      expect(stblResources.length).toBe(1)
      expect(stblResources[0].type).toBe(DBPF_RESOURCE_TYPES.STBL)
    })

    it('should get tuning resources', () => {
      const tuningResources = PackageParser.getTuningResources(testPackage)
      expect(tuningResources.length).toBeGreaterThan(0)
      expect(tuningResources.every(r => r.type !== DBPF_RESOURCE_TYPES.STBL)).toBe(true)
    })
  })

  describe('Parse with resources', () => {
    it('should parse package without extracting resources by default', () => {
      const buffer = createPackageBuffer([
        { type: DBPF_RESOURCE_TYPES.STBL, size: 100 },
      ])

      const result = PackageParser.parseWithResources(buffer, false)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.resourceData).toBeUndefined()
    })

    it('should extract resource data when requested', () => {
      const buffer = createPackageBuffer([
        {
          type: DBPF_RESOURCE_TYPES.STBL,
          group: 0x00000000,
          instance: 1n,
          size: 50},
      ])

      const result = PackageParser.parseWithResources(buffer, true)

      expect(result.success).toBe(true)
      expect(result.resourceData).toBeDefined()
      expect(result.resourceData?.size).toBe(1)
    })

    it('should filter resources during extraction', () => {
      const buffer = createPackageBuffer([
        { type: DBPF_RESOURCE_TYPES.STBL, size: 50 },
        { type: DBPF_RESOURCE_TYPES.SimData, size: 100 },
      ])

      const result = PackageParser.parseWithResources(buffer, true, r => r.type === DBPF_RESOURCE_TYPES.STBL)

      expect(result.resourceData?.size).toBe(1)
    })
  })

  describe('Resource ID formatting', () => {
    it('should format resource ID as string', () => {
      const id = formatResourceId(0x12345678, 0x87654321, 999n)
      expect(typeof id).toBe('string')
      expect(id).toContain('12345678')
    })

    it('should handle large instance IDs', () => {
      const largeInstance = BigInt('0x123456789abcdef0')
      const id = formatResourceId(0x11111111, 0x22222222, largeInstance)
      expect(id).toBeTruthy()
    })
  })

  describe('Metadata tracking', () => {
    it('should track parse time', () => {
      const buffer = createPackageBuffer([
        { type: DBPF_RESOURCE_TYPES.STBL, size: 100 },
      ])

      const pkg = PackageParser.parse(buffer)

      expect(pkg?.metadata.parseTime).toBeGreaterThanOrEqual(0)
      expect(pkg?.metadata.parseTime).toBeLessThan(100) // Should be fast
    })

    it('should track file size', () => {
      const buffer = createPackageBuffer([
        { type: DBPF_RESOURCE_TYPES.STBL, size: 500 },
      ])

      const pkg = PackageParser.parse(buffer)

      expect(pkg?.metadata.fileSize).toBe(buffer.byteLength)
    })

    it('should track resource count', () => {
      const resources = [
        { type: DBPF_RESOURCE_TYPES.STBL, size: 100 },
        { type: DBPF_RESOURCE_TYPES.SimData, size: 200 },
        { type: DBPF_RESOURCE_TYPES.TuningInstance, size: 150 },
      ]

      const buffer = createPackageBuffer(resources)
      const pkg = PackageParser.parse(buffer)

      expect(pkg?.metadata.resourceCount).toBe(3)
    })
  })

  describe('Performance', () => {
    it('should parse large package quickly', () => {
      const resources = Array.from({ length: 500 }, (_, i) => ({
        type: (i % 3 === 0 ? DBPF_RESOURCE_TYPES.STBL : DBPF_RESOURCE_TYPES.SimData),
        group: 0x00000000,
        instance: BigInt(i),
        size: 100 + (i % 100)}))

      const buffer = createPackageBuffer(resources)

      const start = performance.now()
      const pkg = PackageParser.parse(buffer)
      const duration = performance.now() - start

      expect(pkg).not.toBeNull()
      expect(duration).toBeLessThan(100) // Should parse in < 100ms
    })

    it('should extract resources from large package quickly', () => {
      const resources = Array.from({ length: 200 }, (_, i) => ({
        type: (i % 3 === 0 ? DBPF_RESOURCE_TYPES.STBL : DBPF_RESOURCE_TYPES.SimData),
        size: 100 + (i % 100)}))

      const buffer = createPackageBuffer(resources)

      const start = performance.now()
      const result = PackageParser.parseWithResources(buffer, true)
      const duration = performance.now() - start

      expect(result.success).toBe(true)
      expect(duration).toBeLessThan(200) // Should complete in < 200ms
    })
  })

  describe('Resource type identification', () => {
    let testPackage: PackageData

    beforeEach(() => {
      testPackage = {
        magic: 'DBPF',
        majorVersion: 1,
        minorVersion: 9,
        resources: [
          {
            type: DBPF_RESOURCE_TYPES.STBL,
            group: 0,
            instance: 1n,
            offset: 0,
            size: 100,
            compressedSize: 0,
            flags: 0,
            isCompressed: false},
          {
            type: DBPF_RESOURCE_TYPES.Script,
            group: 0,
            instance: 2n,
            offset: 100,
            size: 200,
            compressedSize: 0,
            flags: 0,
            isCompressed: false},
        ],
        metadata: {
          resourceCount: 2,
          fileSize: 300,
          indexOffset: 64,
          parseTime: 0}}
    })

    it('should identify STBL resources', () => {
      const stblCount = testPackage.resources.filter(r => r.type === DBPF_RESOURCE_TYPES.STBL).length
      expect(stblCount).toBe(1)
    })

    it('should identify script resources', () => {
      const scripts = PackageParser.getScriptResources(testPackage)
      expect(scripts.length).toBe(1)
      expect(scripts[0].type).toBe(DBPF_RESOURCE_TYPES.Script)
    })
  })

  describe('Integration - Parse and extract', () => {
    it('should parse and extract STBL from package', () => {
      const buffer = createPackageBuffer([
        {
          type: DBPF_RESOURCE_TYPES.STBL,
          group: 0x00000000,
          instance: 1n,
          size: 100},
      ])

      const result = PackageParser.parseWithResources(buffer, true)

      expect(result.success).toBe(true)
      expect(result.data?.resources.length).toBe(1)
      expect(result.resourceData?.size).toBe(1)

      // Verify we can look up the extracted resource
      const resourceId = formatResourceId(DBPF_RESOURCE_TYPES.STBL, 0x00000000, 1n)
      const resourceBuffer = result.resourceData?.get(resourceId)
      expect(resourceBuffer).toBeDefined()
      expect(resourceBuffer?.byteLength).toBe(100)
    })

    it('should handle mixed resource types in package', () => {
      const buffer = createPackageBuffer([
        {
          type: DBPF_RESOURCE_TYPES.STBL,
          instance: 1n,
          size: 100},
        {
          type: DBPF_RESOURCE_TYPES.SimData,
          instance: 2n,
          size: 200},
        {
          type: DBPF_RESOURCE_TYPES.Script,
          instance: 3n,
          size: 150},
      ])

      const result = PackageParser.parseWithResources(buffer, true)

      expect(result.success).toBe(true)
      expect(result.data?.resources.length).toBe(3)
      expect(result.resourceData?.size).toBe(3)

      const stblCount = PackageParser.getSTBLResources(result.data!).length
      const scriptCount = PackageParser.getScriptResources(result.data!).length

      expect(stblCount).toBe(1)
      expect(scriptCount).toBe(1)
    })
  })
})
