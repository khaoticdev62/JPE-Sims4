/**
 * Config Parser Tests
 *
 * Tests for JSON and YAML configuration file parsing.
 */

import { describe, it, expect } from 'vitest'
import { ConfigParser, parseConfig } from '../ConfigParser'
import type { ProjectConfig } from '../types/config'

describe('Config Parser', () => {
  describe('JSON parsing', () => {
    it('should parse valid JSON config', () => {
      const content = `{
  "metadata": {
    "name": "My Mod",
    "version": "1.0.0"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(true)
      expect(result.config?.metadata.name).toBe('My Mod')
      expect(result.metadata.format).toBe('json')
    })

    it('should parse complete JSON config', () => {
      const content = `{
  "metadata": {
    "name": "Complete Mod",
    "version": "2.1.3",
    "author": "Test Author",
    "description": "A complete mod configuration",
    "license": "MIT"
  },
  "files": {
    "tuning": ["tuning/**/*.xml"],
    "strings": ["strings/**/*.stbl"],
    "scripts": ["scripts/**/*.py"]
  },
  "build": {
    "outputDir": "./dist",
    "packageName": "my-mod.package",
    "compress": true
  },
  "validation": {
    "strictMode": true,
    "checkReferences": true
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(true)
      expect(result.config?.metadata.author).toBe('Test Author')
      expect(result.config?.build?.compress).toBe(true)
    })

    it('should reject invalid JSON', () => {
      const content = `{
  "metadata": {
    "name": "Invalid",
    "version": "1.0.0"
  }
} invalid trailing content`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('YAML parsing', () => {
    it('should detect YAML format', () => {
      const content = `metadata:
  name: "My Mod"
  version: "1.0.0"`
      const result = ConfigParser.parse(content)

      expect(result.metadata.format).toBe('yaml')
    })

    it('should parse simple YAML config', () => {
      const content = `metadata:
  name: Test Mod
  version: 1.0.0`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(true)
      expect(result.config?.metadata.name).toBe('Test Mod')
    })
  })

  describe('Metadata validation', () => {
    it('should require metadata section', () => {
      const content = '{"files": {}}'
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.field === 'metadata')).toBe(true)
    })

    it('should require name field', () => {
      const content = `{
  "metadata": {
    "version": "1.0.0"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.field === 'metadata.name')).toBe(true)
    })

    it('should require version field', () => {
      const content = `{
  "metadata": {
    "name": "Test Mod"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.field === 'metadata.version')).toBe(true)
    })

    it('should validate name is string', () => {
      const content = `{
  "metadata": {
    "name": 123,
    "version": "1.0.0"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.type === 'type_error' && e.field === 'metadata.name')).toBe(true)
    })

    it('should warn on non-semantic version', () => {
      const content = `{
  "metadata": {
    "name": "Test",
    "version": "1.0"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(true)
      expect(result.warnings.some(w => w.field === 'metadata.version')).toBe(true)
    })

    it('should accept valid semantic versions', () => {
      const versions = ['1.0.0', '2.1.3', '0.0.1', '1.0.0-beta', '1.0.0+build']

      for (const version of versions) {
        const content = JSON.stringify({
          metadata: {
            name: 'Test',
            version,
          },
        })
        const result = ConfigParser.parse(content)
        expect(result.errors.some(e => e.field === 'metadata.version')).toBe(false)
      }
    })
  })

  describe('Files validation', () => {
    it('should validate file patterns are arrays', () => {
      const content = `{
  "metadata": {
    "name": "Test",
    "version": "1.0.0"
  },
  "files": {
    "tuning": "not-an-array"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.field === 'files.tuning')).toBe(true)
    })

    it('should validate array contents are strings', () => {
      const content = `{
  "metadata": {
    "name": "Test",
    "version": "1.0.0"
  },
  "files": {
    "tuning": ["*.xml", 123]
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.field.startsWith('files.tuning'))).toBe(true)
    })
  })

  describe('Build validation', () => {
    it('should validate build section fields', () => {
      const content = `{
  "metadata": {
    "name": "Test",
    "version": "1.0.0"
  },
  "build": {
    "compress": "not-boolean"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.field === 'build.compress')).toBe(true)
    })

    it('should accept valid build config', () => {
      const content = `{
  "metadata": {
    "name": "Test",
    "version": "1.0.0"
  },
  "build": {
    "outputDir": "./dist",
    "packageName": "mod.package",
    "compress": true,
    "includeSources": false
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(true)
      expect(result.config?.build?.compress).toBe(true)
    })
  })

  describe('Validation config', () => {
    it('should validate validation section', () => {
      const content = `{
  "metadata": {
    "name": "Test",
    "version": "1.0.0"
  },
  "validation": {
    "strictMode": "not-boolean"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.field === 'validation.strictMode')).toBe(true)
    })

    it('should accept valid validation config', () => {
      const content = `{
  "metadata": {
    "name": "Test",
    "version": "1.0.0"
  },
  "validation": {
    "strictMode": true,
    "checkReferences": false,
    "validateEnums": true,
    "reportWarnings": true
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(true)
      expect(result.config?.validation?.strictMode).toBe(true)
    })
  })

  describe('Default values', () => {
    it('should apply default values when fields missing', () => {
      const content = `{
  "metadata": {
    "name": "Test Mod",
    "version": "1.0.0"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.config?.files?.tuning).toBeDefined()
      expect(result.config?.build?.outputDir).toBe('./build')
      expect(result.config?.validation?.checkReferences).toBe(true)
    })

    it('should override defaults with provided values', () => {
      const content = `{
  "metadata": {
    "name": "Test",
    "version": "1.0.0"
  },
  "build": {
    "outputDir": "./custom"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.config?.build?.outputDir).toBe('./custom')
    })
  })

  describe('Custom fields', () => {
    it('should preserve custom fields', () => {
      const content = `{
  "metadata": {
    "name": "Test",
    "version": "1.0.0"
  },
  "customSection": {
    "customField": "customValue"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(true)
      expect(result.config?.customFields?.customSection).toBeDefined()
    })
  })

  describe('Config creation', () => {
    it('should create default config', () => {
      const config = ConfigParser.createDefault('New Mod')

      expect(config.metadata.name).toBe('New Mod')
      expect(config.metadata.version).toBe('1.0.0')
      expect(config.files?.tuning).toBeDefined()
      expect(config.build?.outputDir).toBe('./build')
    })

    it('should create config with custom version', () => {
      const config = ConfigParser.createDefault('My Mod', '2.5.0')

      expect(config.metadata.name).toBe('My Mod')
      expect(config.metadata.version).toBe('2.5.0')
    })
  })

  describe('Config validation', () => {
    it('should validate valid config', () => {
      const config: ProjectConfig = {
        metadata: {
          name: 'Test',
          version: '1.0.0',
        },
        files: {
          tuning: ['**/*.xml'],
        },
      }

      const result = ConfigParser.validate(config)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid config', () => {
      const config: any = {
        metadata: {
          name: 'Test',
          version: '1.0',
        },
      }

      const result = ConfigParser.validate(config)

      expect(result.warnings.length).toBeGreaterThan(0)
    })
  })

  describe('Real-world configs', () => {
    it('should parse typical Sims 4 mod config', () => {
      const content = `{
  "metadata": {
    "name": "Sims 4 Trait Mod",
    "version": "1.2.0",
    "author": "Modder Name",
    "description": "Adds custom traits to The Sims 4",
    "license": "MIT",
    "repository": "https://github.com/modder/trait-mod"
  },
  "files": {
    "tuning": ["tuning/**/*.xml"],
    "strings": ["strings/**/*.stbl"],
    "scripts": ["scripts/**/*.py"]
  },
  "build": {
    "outputDir": "./build",
    "packageName": "trait-mod.package",
    "compress": false,
    "includeSources": false
  },
  "validation": {
    "strictMode": false,
    "checkReferences": true,
    "validateEnums": true,
    "reportWarnings": true
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(true)
      expect(result.config?.metadata.author).toBe('Modder Name')
      expect(result.config?.files?.scripts).toContain('scripts/**/*.py')
    })

    it('should handle minimal config', () => {
      const content = `{
  "metadata": {
    "name": "Minimal Mod",
    "version": "1.0.0"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.success).toBe(true)
      expect(result.config?.metadata.name).toBe('Minimal Mod')
      expect(result.config?.build?.outputDir).toBe('./build')
    })
  })

  describe('Performance', () => {
    it('should parse config quickly', () => {
      const config = {
        metadata: {
          name: 'Test Mod',
          version: '1.0.0',
          author: 'Test Author',
          description: 'A test mod for performance testing',
        },
        files: {
          tuning: ['tuning/**/*.xml'],
          strings: ['strings/**/*.stbl'],
          scripts: ['scripts/**/*.py'],
        },
        build: {
          outputDir: './build',
          packageName: 'test-mod.package',
          compress: false,
        },
        validation: {
          strictMode: false,
          checkReferences: true,
          validateEnums: true,
        },
      }

      const content = JSON.stringify(config)

      const start = performance.now()
      const result = ConfigParser.parse(content)
      const duration = performance.now() - start

      expect(result.success).toBe(true)
      expect(duration).toBeLessThan(50) // Should parse in < 50ms
    })
  })

  describe('Error messages', () => {
    it('should provide helpful error messages', () => {
      const content = `{
  "metadata": {
    "name": 123,
    "version": "1.0.0"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.errors[0].message).toContain('string')
    })

    it('should provide helpful suggestions in warnings', () => {
      const content = `{
  "metadata": {
    "name": "Test",
    "version": "latest"
  }
}`
      const result = ConfigParser.parse(content)

      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0].suggestion).toBeTruthy()
    })
  })

  describe('Helper function', () => {
    it('should parse via helper function', () => {
      const content = `{
  "metadata": {
    "name": "Test",
    "version": "1.0.0"
  }
}`
      const result = parseConfig(content)

      expect(result.success).toBe(true)
      expect(result.config?.metadata.name).toBe('Test')
    })
  })
})
