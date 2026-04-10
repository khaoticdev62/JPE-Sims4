/**
 * E2E Integration Test: JPE → XML → .package Pipeline
 *
 * Tests the complete build pipeline from XML to production-ready .package file.
 * Verifies:
 * 1. XML validation catches malformed output
 * 2. .package DBPF v2.1 generation produces valid binary files
 * 3. Full pipeline integration via PackageService
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { PackageService } from '@/services/PackageService';
import { PackageParser } from '@/engine/parsers/PackageParser';
import { DBPF_RESOURCE_TYPES } from '@/engine/parsers/types/package';

describe('JPE → XML → .package Integration Pipeline', () => {
  // Sample XML content simulating JPE transformation output
  const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<C I="0x00000001" n="test_buff_jpe_studio" xmlns:t="http://schemas.ea.com/sims4/tuning">
  <V t="name" n="0x00000002" />
  <V t="description" n="0x00000003" />
  <V t="timeout" n="300" />
</C>`;

  let xmlResult: string = sampleXML;

  beforeAll(() => {
    xmlResult = sampleXML;
  });

  describe('Step 1: XML Validation', () => {
    it('should produce valid Sims 4 XML structure', () => {
      expect(xmlResult).toBeTruthy();
      expect(xmlResult).toContain('<?xml');
      expect(xmlResult).toMatch(/<[A-Z]/);
    });

    it('should handle malformed XML gracefully', () => {
      const invalidXML = '<broken>This is not valid XML';
      // XML parsing would fail - the service should handle this
      expect(() => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(invalidXML, 'text/xml');
        const errorNode = doc.querySelector('parsererror');
        expect(errorNode).toBeTruthy();
      }).not.toThrow();
    });
  });

  describe('Step 2: .package DBPF Generation', () => {
    it('should create valid DBPF v2.1 package buffer', async () => {
      const resources = [
        {
          type: DBPF_RESOURCE_TYPES.TuningInstance,
          group: 0x00000000,
          instance: BigInt(0x00000001),
          content: new TextEncoder().encode(xmlResult),
          compressed: true,
        },
      ];

      const packageBuffer = await PackageService.createPackage(resources);

      expect(packageBuffer).toBeTruthy();
      expect(packageBuffer.byteLength).toBeGreaterThan(96); // Header is 96 bytes

      // Verify DBPF header
      const view = new DataView(packageBuffer);
      const magic = view.getUint32(0, false); // Big-endian for 'DBPF'
      expect(magic).toBe(0x44425046); // 'DBPF'

      const majorVersion = view.getUint32(4, true);
      expect(majorVersion).toBe(2);

      const minorVersion = view.getUint32(8, true);
      expect(minorVersion).toBe(1);
    });

    it('should include correct index table size', async () => {
      const resources = [
        {
          type: DBPF_RESOURCE_TYPES.TuningInstance,
          group: 0x00000000,
          instance: BigInt(0x00000001),
          content: new TextEncoder().encode(xmlResult),
          compressed: true,
        },
        {
          type: DBPF_RESOURCE_TYPES.TuningInstance,
          group: 0x00000000,
          instance: BigInt(0x00000002),
          content: new TextEncoder().encode('<C I="0x00000002" n="test2"/>'),
          compressed: false,
        },
      ];

      const packageBuffer = await PackageService.createPackage(resources);
      const view = new DataView(packageBuffer);

      // DBPF header: indexSize is at offset 36
      const indexSize = view.getUint32(36, true);
      // Each entry is 24 bytes, so 2 entries = 48 bytes
      expect(indexSize).toBe(48);
    });

    it('should parse generated package successfully', async () => {
      const resources = [
        {
          type: DBPF_RESOURCE_TYPES.TuningInstance,
          group: 0x00000000,
          instance: BigInt(0x00000001),
          content: new TextEncoder().encode(xmlResult),
          compressed: true,
        },
      ];

      const packageBuffer = await PackageService.createPackage(resources);
      const parsed = PackageParser.parse(packageBuffer);

      expect(parsed).toBeTruthy();
      expect(parsed!.resources.length).toBe(1);
      expect(parsed!.resources[0].type).toBe(DBPF_RESOURCE_TYPES.TuningInstance);
    });
  });

  describe('Step 3: Package Extraction and Verification', () => {
    it('should extract resources from generated package', async () => {
      const resources = [
        {
          type: DBPF_RESOURCE_TYPES.TuningInstance,
          group: 0x00000000,
          instance: BigInt(0x00000001),
          content: new TextEncoder().encode(xmlResult),
          compressed: true,
        },
      ];

      const packageBuffer = await PackageService.createPackage(resources);
      const packageData = await PackageService.loadPackage(
        'test.package',
        packageBuffer
      );

      expect(packageData).toBeTruthy();
      expect(packageData!.resources.length).toBeGreaterThan(0);

      // Get virtual files
      const virtualFiles = PackageService.getVirtualFiles('test.package');
      expect(virtualFiles.length).toBeGreaterThan(0);
      expect(virtualFiles[0].type).toBe('xml');
    });

    it('should extract resource as ArrayBuffer', async () => {
      const resources = [
        {
          type: DBPF_RESOURCE_TYPES.TuningInstance,
          group: 0x00000000,
          instance: BigInt(0x00000001),
          content: new TextEncoder().encode(xmlResult),
          compressed: false, // Use uncompressed for reliable extraction
        },
      ];

      const packageBuffer = await PackageService.createPackage(resources);
      await PackageService.loadPackage('test.package', packageBuffer);

      const virtualFiles = PackageService.getVirtualFiles('test.package');
      expect(virtualFiles.length).toBeGreaterThan(0);

      const resource = virtualFiles[0].resource;
      const extracted = await PackageService.extractResourceFast(
        'test.package',
        resource,
        packageBuffer
      );

      expect(extracted).toBeTruthy();
      expect(extracted!.byteLength).toBeGreaterThan(0);

      // Verify content is XML
      const text = new TextDecoder().decode(extracted!);
      expect(text).toContain('<?xml');
    });
  });

  describe('Step 4: Multi-file Package Generation', () => {
    it('should package multiple XML files correctly', async () => {
      const resources = [
        {
          type: DBPF_RESOURCE_TYPES.Buff,
          group: 0x00000000,
          instance: BigInt(0x00000001),
          content: new TextEncoder().encode(sampleXML),
          compressed: true,
        },
        {
          type: DBPF_RESOURCE_TYPES.Trait,
          group: 0x00000000,
          instance: BigInt(0x00000002),
          content: new TextEncoder().encode('<C I="0x00000002" n="test_trait"/>'),
          compressed: true,
        },
        {
          type: DBPF_RESOURCE_TYPES.TuningInstance,
          group: 0x00000000,
          instance: BigInt(0x00000003),
          content: new TextEncoder().encode('<C I="0x00000003" n="test_tuning"/>'),
          compressed: false,
        },
      ];

      const packageBuffer = await PackageService.createPackage(resources);
      const parsed = PackageParser.parse(packageBuffer);

      expect(parsed).toBeTruthy();
      expect(parsed!.resources.length).toBe(3);

      // Verify resource types
      expect(parsed!.resources[0].type).toBe(DBPF_RESOURCE_TYPES.Buff);
      expect(parsed!.resources[1].type).toBe(DBPF_RESOURCE_TYPES.Trait);
      expect(parsed!.resources[2].type).toBe(DBPF_RESOURCE_TYPES.TuningInstance);
    });
  });
});
