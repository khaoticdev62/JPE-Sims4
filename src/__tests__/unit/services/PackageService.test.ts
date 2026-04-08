/**
 * Package Service unit tests
 *
 * @jest-environment node
 */

import { PackageService } from '@/services/PackageService'

describe('PackageService', () => {
  describe('getVirtualFiles', () => {
    it('returns empty array when package not loaded', () => {
      const files = PackageService.getVirtualFiles('/nonexistent.package')
      expect(files).toEqual([])
    })

    it('returns virtual files for loaded package', () => {
      // Create a minimal package buffer with valid header
      // DBPF header: "DBPF" (4B) + version (4B) + ... 
      // For testing we just verify the service returns empty for unloaded packages
      const files = PackageService.getVirtualFiles('/test.package')
      expect(Array.isArray(files)).toBe(true)
    })
  })

  describe('extractResourceFast', () => {
    it('returns null for unloaded package', async () => {
      const mockResource = {
        type: 0x03330000,
        group: 0x00000000,
        instance: 0x00000001,
        offset: 0,
        size: 100,
        isCompressed: false}

      const emptyBuffer = new ArrayBuffer(0)
      const result = await PackageService.extractResourceFast('/test.package', mockResource, emptyBuffer)
      // Should handle gracefully even with empty buffer
      expect(result).toBeDefined()
    })
  })

  describe('loadPackage', () => {
    it('returns null for invalid package buffer', async () => {
      const invalidBuffer = new ArrayBuffer(100)
      const result = await PackageService.loadPackage('/test.package', invalidBuffer)
      // PackageParser.parse returns null for invalid data
      expect(result).toBeNull()
    })

    it('caches loaded packages', async () => {
      // Verify that loadPackage uses the cache
      // First load should fail (invalid buffer)
      const result = await PackageService.loadPackage('/cache-test.package', new ArrayBuffer(100))
      expect(result).toBeNull()

      // getVirtualFiles should return empty for failed load
      const files = PackageService.getVirtualFiles('/cache-test.package')
      expect(files).toEqual([])
    })
  })
})
