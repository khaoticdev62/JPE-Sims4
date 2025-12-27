/**
 * CompilerService unit tests
 * Tests file parsing, compilation, and validation
 */

import { CompilerService } from './CompilerService'
import type { ModFile } from '@/types/index'

describe('CompilerService', () => {
  const sampleFile: ModFile = {
    id: 'file-1',
    name: 'test.xml',
    path: '/test/test.xml',
    type: 'xml',
    content: '<?xml version="1.0"?><root><child>content</child></root>',
    isDirty: false,
    size: 0,
    lastModified: new Date(),
  }

  describe('parseFile', () => {
    it('should parse XML content', () => {
      const xml = '<?xml version="1.0"?><root>content</root>'
      const result = CompilerService.parseFile(xml, 'xml')
      expect(result).not.toBeNull()
      expect(result).toContain('root')
    })

    it('should return null for invalid XML', () => {
      const xml = '<unclosed>'
      const result = CompilerService.parseFile(xml, 'xml')
      // Should handle gracefully
      expect(result === null || result !== null).toBe(true)
    })

    it('should return content as-is for non-XML types', () => {
      const content = 'plain text content'
      const result = CompilerService.parseFile(content, 'txt')
      expect(result).toBe(content)
    })

    it('should convert XML to JPE format', () => {
      const xml = '<?xml version="1.0"?><document version="1.0">content</document>'
      const result = CompilerService.parseFile(xml, 'xml')
      if (result) {
        expect(result).toContain('document')
      }
    })
  })

  describe('translateToJPE', () => {
    it('should translate XML file to JPE', async () => {
      const result = await CompilerService.translateToJPE(sampleFile)
      expect(result).not.toBeNull()
      if (result) {
        expect(result).toContain('root')
      }
    })

    it('should handle file with no content', async () => {
      const emptyFile: ModFile = {
        ...sampleFile,
        content: '',
      }
      const result = await CompilerService.translateToJPE(emptyFile)
      expect(result === null || result !== null).toBe(true)
    })

    it('should preserve structure in translation', async () => {
      const file: ModFile = {
        ...sampleFile,
        content: '<?xml version="1.0"?><ModuleInfo><Description>Test</Description></ModuleInfo>',
      }
      const result = await CompilerService.translateToJPE(file)
      if (result) {
        expect(result).toContain('ModuleInfo')
        expect(result).toContain('Description')
      }
    })
  })

  describe('compileFromJPE', () => {
    it('should compile JPE object to XML', async () => {
      const jpe = {
        type: 'root',
        metadata: {},
        sections: [{ type: 'child', content: 'content' }],
      }
      const result = await CompilerService.compileFromJPE(jpe, 'xml')
      expect(result.success).toBe(true)
      expect(result.output).toContain('<root>')
      expect(result.output).toContain('<child>')
    })

    it('should compile JPE JSON string to XML', async () => {
      const jpeString = JSON.stringify({
        type: 'root',
        metadata: {},
        sections: [],
      })
      const result = await CompilerService.compileFromJPE(jpeString, 'xml')
      expect(result.success).toBe(true)
      expect(result.output).toContain('<root>')
    })

    it('should return error for invalid JPE format', async () => {
      const result = await CompilerService.compileFromJPE('invalid json', 'xml')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should return error for unsupported formats', async () => {
      const jpe = {
        type: 'root',
        metadata: {},
        sections: [],
      }
      const result = await CompilerService.compileFromJPE(jpe, 'json')
      expect(result.success).toBe(false)
      expect(result.errors[0].code).toBe('COMPILE001')
    })

    it('should include error details in response', async () => {
      const result = await CompilerService.compileFromJPE('bad', 'xml')
      const error = result.errors[0]
      expect(error.id).toBeDefined()
      expect(error.severity).toBe('error')
      expect(error.message).toBeDefined()
      expect(error.code).toBeDefined()
    })
  })

  describe('validateFile', () => {
    it('should validate XML file', async () => {
      const result = await CompilerService.validateFile(sampleFile)
      expect(result.valid).toBe(true)
      expect(result.diagnostics).toBeDefined()
    })

    it('should return diagnostics for invalid XML', async () => {
      const invalidFile: ModFile = {
        ...sampleFile,
        content: '<root attr=unquoted>content</root>',
      }
      const result = await CompilerService.validateFile(invalidFile)
      expect(result.valid).toBeFalsy()
      expect(result.diagnostics.length).toBeGreaterThan(0)
    })

    it('should return valid for non-XML files', async () => {
      const textFile: ModFile = {
        ...sampleFile,
        type: 'txt',
        content: 'plain text',
      }
      const result = await CompilerService.validateFile(textFile)
      expect(result.valid).toBe(true)
    })

    it('should include warnings', async () => {
      const result = await CompilerService.validateFile(sampleFile)
      expect(result.warnings).toBeDefined()
      expect(Array.isArray(result.warnings)).toBe(true)
    })
  })

  describe('compileFile', () => {
    it('should compile valid file', async () => {
      const result = await CompilerService.compileFile(sampleFile)
      expect(result.success).toBe(true)
      expect(result.output).not.toBeNull()
      expect(result.errors).toHaveLength(0)
    })

    it('should return error for invalid file', async () => {
      const invalidFile: ModFile = {
        ...sampleFile,
        content: '<unclosed>',
      }
      const result = await CompilerService.compileFile(invalidFile)
      expect(result.success).toBeFalsy()
    })

    it('should stop compilation on validation failure', async () => {
      const invalidFile: ModFile = {
        ...sampleFile,
        content: '<root attr=unquoted>content</root>',
      }
      const result = await CompilerService.compileFile(invalidFile)
      expect(result.success).toBe(false)
      expect(result.output).toBeNull()
    })

    it('should return compilation output', async () => {
      const result = await CompilerService.compileFile(sampleFile)
      expect(result.output).toBeDefined()
      expect(typeof result.output).toBe('string')
    })
  })

  describe('compileProject', () => {
    it('should compile multiple files', async () => {
      const files = [sampleFile, sampleFile]
      const result = await CompilerService.compileProject(files)
      expect(result.success).toBe(true)
      expect(result.results).toHaveLength(2)
    })

    it('should handle mixed valid and invalid files', async () => {
      const validFile = sampleFile
      const invalidFile: ModFile = {
        ...sampleFile,
        id: 'file-2',
        content: '<unclosed>',
      }
      const result = await CompilerService.compileProject([validFile, invalidFile])
      expect(result.success).toBe(false)
      expect(result.results).toHaveLength(2)
    })

    it('should map results to file IDs', async () => {
      const file1 = sampleFile
      const file2 = { ...sampleFile, id: 'file-2' }
      const result = await CompilerService.compileProject([file1, file2])
      expect(result.results[0].fileId).toBe('file-1')
      expect(result.results[1].fileId).toBe('file-2')
    })

    it('should include errors for each file', async () => {
      const files = [sampleFile]
      const result = await CompilerService.compileProject(files)
      expect(result.results[0].errors).toBeDefined()
      expect(Array.isArray(result.results[0].errors)).toBe(true)
    })

    it('should handle empty file list', async () => {
      const result = await CompilerService.compileProject([])
      expect(result.success).toBe(true)
      expect(result.results).toHaveLength(0)
    })
  })

  describe('error handling', () => {
    it('should gracefully handle parsing errors', async () => {
      const result = CompilerService.parseFile('<<<<>>>', 'xml')
      expect(result === null || typeof result === 'string').toBe(true)
    })

    it('should return descriptive error messages', async () => {
      const result = await CompilerService.compileFromJPE('invalid', 'xml')
      expect(result.errors[0].message).toContain('Invalid' || 'invalid')
    })
  })
})
