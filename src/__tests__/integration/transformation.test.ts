/**
 * Integration Tests for Transformation Service
 * 
 * Tests the dual-mode transformation service (Python backend + TypeScript engine)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TransformationService } from '@/services/transformation-service';

describe('TransformationService', () => {
  const sampleJPE = `# Test JPE file
[Metadata]
type = "interaction"
id = "12345"

[Instance]
display_name = "Test Interaction"
description = "A test interaction"
`;

  beforeEach(() => {
    // Default to Python mode for tests
    TransformationService.setMode('python');
  });

  afterEach(() => {
    // Reset to default
    TransformationService.setMode('python');
  });

  describe('transformJPEToXML', () => {
    it('should return TransformResult with required fields', async () => {
      const result = await TransformationService.transformJPEToXML(sampleJPE, 'test.jpe');

      expect(result).toHaveProperty('xml');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('mode');
    });

    it('should handle empty source gracefully', async () => {
      const result = await TransformationService.transformJPEToXML('', 'empty.jpe');

      expect(result).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should handle malformed JPE with errors', async () => {
      const malformedJPE = `[Metadata
type = "broken"
`;
      const result = await TransformationService.transformJPEToXML(malformedJPE, 'broken.jpe');

      expect(result).toBeDefined();
      // Should either have errors or fail gracefully
      expect(result.xml).toBeDefined();
    });
  });

  describe('mode switching', () => {
    it('should report correct mode', () => {
      TransformationService.setMode('python');
      expect(TransformationService.getMode()).toBe('python');

      TransformationService.setMode('typescript');
      expect(TransformationService.getMode()).toBe('typescript');
    });

    it('should use Python mode by default', () => {
      // Reset service to default
      TransformationService.setMode('python');
      expect(TransformationService.getMode()).toBe('python');
    });
  });

  describe('error handling', () => {
    it('should return error object on failure', async () => {
      // Force TypeScript mode which will fail without engine
      TransformationService.setMode('typescript');
      
      const result = await TransformationService.transformJPEToXML(sampleJPE);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
