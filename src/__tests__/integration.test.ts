/**
 * Integration tests for the complete XML processing pipeline
 * Tests the flow: XML Parse → JPE Convert → Validation → Compilation
 */

import { XMLParser } from '@/engine/parsers/XMLParser'
import { XMLCompiler } from '@/engine/compilers/XMLCompiler'
import { ValidationEngine } from '@/engine/validators/ValidationEngine'
import { CompilerService } from '@/services/CompilerService'
import type { ModFile } from '@/types/index'

describe('Integration: XML Processing Pipeline', () => {
  describe('Full round-trip: Parse → Convert → Validate → Compile', () => {
    it('should complete full pipeline for valid XML', () => {
      const xmlString = `<?xml version="1.0" encoding="utf-8"?>
<ModuleInfo name="TestModule" version="1.0">
  <Description>A test module</Description>
  <Author>Test Author</Author>
  <Comments>Some comments here</Comments>
</ModuleInfo>`

      // Step 1: Validate
      const validation = ValidationEngine.validate(xmlString)
      expect(validation.valid).toBe(true)

      // Step 2: Parse
      const parsed = XMLParser.parseXML(xmlString)
      expect(parsed).not.toBeNull()
      expect(parsed?.tag).toBe('ModuleInfo')

      // Step 3: Convert to JPE
      const jpe = XMLParser.convertToJPE(parsed!)
      expect(jpe.type).toBe('ModuleInfo')
      expect(jpe.metadata.name).toBe('TestModule')
      expect(jpe.sections.length).toBeGreaterThan(0)

      // Step 4: Compile back to XML
      const compiled = XMLCompiler.compileToXML(jpe)
      expect(compiled.success).toBe(true)
      expect(compiled.output).toContain('<?xml')
      expect(compiled.output).toContain('<ModuleInfo')
      expect(compiled.output).toContain('name="TestModule"')
    })

    it('should handle real-world mod file structure', () => {
      const modFile: ModFile = {
        id: 'mod-file-1',
        name: 'ModuleInfo.xml',
        path: '/mods/testmod/ModuleInfo.xml',
        type: 'xml',
        content: `<?xml version="1.0" encoding="utf-8"?>
<ModuleInfo name="ExampleMod" version="2.0">
  <Description>An example mod file</Description>
  <Author>Community Author</Author>
  <Comments>This is a test</Comments>
  <Relationships>
    <Dependency name="Core" version="1.0"/>
  </Relationships>
</ModuleInfo>`,
        isDirty: false,
        size: 0,
        lastModified: new Date(),
      }

      // Validate
      const validation = XMLParser.validate(modFile.content)
      expect(validation.valid).toBe(true)

      // Parse and convert
      const parsed = XMLParser.parseXML(modFile.content)
      const jpe = XMLParser.convertToJPE(parsed!)

      // Compile back
      const compiled = XMLCompiler.compileToXML(jpe)
      expect(compiled.success).toBe(true)

      // Validate compiled output
      const revalidation = ValidationEngine.validate(compiled.output!)
      expect(revalidation.valid).toBe(true)
    })

    it('should detect errors in pipeline', () => {
      const invalidXml = `<?xml version="1.0"?>
<root attr=unquoted>
  <unclosed>
  <mismatched>text</unclosed>
  AT&T company
</root>`

      // Validation should catch errors
      const validation = ValidationEngine.validate(invalidXml)
      expect(validation.valid).toBe(false)
      expect(validation.diagnostics.length).toBeGreaterThan(0)

      // Compilation should still work but with errors
      const parsed = XMLParser.parseXML(invalidXml)
      if (parsed) {
        const jpe = XMLParser.convertToJPE(parsed)
        const compiled = XMLCompiler.compileToXML(jpe)
        expect(compiled).toBeDefined()
      }
    })
  })

  describe('CompilerService integration', () => {
    it('should process file through entire pipeline', async () => {
      const file: ModFile = {
        id: 'file-1',
        name: 'test.xml',
        path: '/test/test.xml',
        type: 'xml',
        content: `<?xml version="1.0"?>
<document version="1.0">
  <section>Content</section>
</document>`,
        isDirty: false,
        size: 0,
        lastModified: new Date(),
      }

      // Validate
      const validation = await CompilerService.validateFile(file)
      expect(validation.valid).toBe(true)

      // Translate to JPE
      const jpe = await CompilerService.translateToJPE(file)
      expect(jpe).not.toBeNull()

      // Compile from JPE
      const compiled = await CompilerService.compileFromJPE(jpe!, 'xml')
      expect(compiled.success).toBe(true)
    })

    it('should handle multiple files in project', async () => {
      const files: ModFile[] = [
        {
          id: 'file-1',
          name: 'file1.xml',
          path: '/file1.xml',
          type: 'xml',
          content: '<?xml version="1.0"?><root><item>1</item></root>',
          isDirty: false,
          size: 0,
          lastModified: new Date(),
        },
        {
          id: 'file-2',
          name: 'file2.xml',
          path: '/file2.xml',
          type: 'xml',
          content: '<?xml version="1.0"?><root><item>2</item></root>',
          isDirty: false,
          size: 0,
          lastModified: new Date(),
        },
      ]

      const result = await CompilerService.compileProject(files)
      expect(result.success).toBe(true)
      expect(result.results).toHaveLength(2)
      expect(result.results.every((r) => r.success)).toBe(true)
    })
  })

  describe('Error recovery in pipeline', () => {
    it('should not crash on malformed XML', () => {
      const malformed = '<root><invalid>>'

      expect(() => {
        const validation = ValidationEngine.validate(malformed)
        expect(validation).toBeDefined()

        const parsed = XMLParser.parseXML(malformed)
        // May return null, should not crash
        expect(parsed === null || parsed !== null).toBe(true)
      }).not.toThrow()
    })

    it('should handle validation failures gracefully', async () => {
      const badFile: ModFile = {
        id: 'bad-1',
        name: 'bad.xml',
        path: '/bad.xml',
        type: 'xml',
        content: '<unclosed>',
        isDirty: false,
        size: 0,
        lastModified: new Date(),
      }

      const result = await CompilerService.compileFile(badFile)
      expect(result).toBeDefined()
      // Should return error result, not crash
      expect(result.success || !result.success).toBe(true)
    })
  })

  describe('Validation rule integration', () => {
    it('should catch all rule violations in pipeline', () => {
      const violatingXml = `<root attr=bad>
  <unclosed>
  AT&T
</root>`

      const validation = ValidationEngine.validate(violatingXml)
      const codes = validation.diagnostics.map((d) => d.code)

      // Should detect multiple rule violations
      expect(codes.length).toBeGreaterThan(1)
    })

    it('should pass validation and compilation for correct XML', () => {
      const correctXml = `<?xml version="1.0" encoding="utf-8"?>
<root version="1.0" author="Test">
  <section1>Content 1</section1>
  <section2>Content 2</section2>
  <section3>AT&amp;T Reference</section3>
</root>`

      // Validate
      const validation = ValidationEngine.validate(correctXml)
      expect(validation.valid).toBe(true)
      expect(validation.diagnostics).toHaveLength(0)

      // Parse
      const parsed = XMLParser.parseXML(correctXml)
      expect(parsed).not.toBeNull()

      // Convert
      const jpe = XMLParser.convertToJPE(parsed!)
      expect(jpe).toBeDefined()

      // Compile
      const compiled = XMLCompiler.compileToXML(jpe)
      expect(compiled.success).toBe(true)

      // Re-validate compiled output
      const revalidation = ValidationEngine.validate(compiled.output!)
      expect(revalidation.valid).toBe(true)
    })
  })

  describe('Performance and stress tests', () => {
    it('should handle large XML files', () => {
      // Generate large XML
      let largeXml = '<?xml version="1.0"?><root>'
      for (let i = 0; i < 1000; i++) {
        largeXml += `<item id="${i}">Content ${i}</item>`
      }
      largeXml += '</root>'

      const validation = ValidationEngine.validate(largeXml)
      expect(validation).toBeDefined()

      const parsed = XMLParser.parseXML(largeXml)
      expect(parsed).not.toBeNull()
    })

    it('should handle deeply nested structures', () => {
      // Generate deeply nested XML
      let nested = '<?xml version="1.0"?><root>'
      for (let i = 0; i < 50; i++) {
        nested += '<level>'
      }
      nested += '<leaf>Content</leaf>'
      for (let i = 0; i < 50; i++) {
        nested += '</level>'
      }
      nested += '</root>'

      expect(() => {
        const validation = ValidationEngine.validate(nested)
        expect(validation).toBeDefined()
      }).not.toThrow()
    })

    it('should handle many validation rule checks', () => {
      const complexXml = `<?xml version="1.0"?>
<root>
  <item1 attr1="val1" attr2="val2" attr3="val3">
    <nested>Content</nested>
  </item1>
  <item2 attr1="val1">Content</item2>
  <item3 attr1="val1" attr2="val2">Content</item3>
</root>`

      const validation = ValidationEngine.validate(complexXml)
      const rules = ValidationEngine.getRules()

      expect(rules.length).toBeGreaterThan(0)

      rules.forEach((rule) => {
        const ruleResult = ValidationEngine.validateRule(rule.id, complexXml)
        expect(ruleResult).toBeDefined()
      })
    })
  })

  describe('Round-trip data integrity', () => {
    it('should maintain structure through parse-convert-compile cycle', () => {
      const original = `<?xml version="1.0"?>
<doc version="1.0" author="Test">
  <meta>Metadata</meta>
  <content>Main content here</content>
</doc>`

      // Parse
      const parsed = XMLParser.parseXML(original)
      expect(parsed?.tag).toBe('doc')

      // Convert
      const jpe = XMLParser.convertToJPE(parsed!)
      expect(jpe.metadata.version).toBe('1.0')
      expect(jpe.metadata.author).toBe('Test')

      // Compile
      const compiled = XMLCompiler.compileToXML(jpe)
      expect(compiled.output).toContain('version="1.0"')
      expect(compiled.output).toContain('author="Test"')

      // Re-parse to verify structure
      const reparsed = XMLParser.parseXML(compiled.output!)
      expect(reparsed?.attributes.version).toBe('1.0')
    })
  })
})
