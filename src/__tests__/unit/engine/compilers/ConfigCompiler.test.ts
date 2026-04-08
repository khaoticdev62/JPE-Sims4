/**
 * Config Compiler unit tests
 *
 * @jest-environment node
 */

import { ConfigCompiler } from '@/engine/compilers/ConfigCompiler'

describe('ConfigCompiler', () => {
  describe('compileToJpe — JSON', () => {
    it('compiles JPE key-value pairs to JSON', () => {
      const jpe = `name: "My Mod"
version: "1.0.0"
enabled: true
count: 42
`

      const result = ConfigCompiler.compileToJpe(jpe, 'json')

      expect(result.success).toBe(true)
      expect(result.content).toBeDefined()
      expect(result.errors).toHaveLength(0)

      const parsed = JSON.parse(result.content!)
      expect(parsed.name).toBe('My Mod')
      expect(parsed.version).toBe('1.0.0')
      expect(parsed.enabled).toBe(true)
      expect(parsed.count).toBe(42)
    })

    it('handles nested keys with dot notation', () => {
      const jpe = `database.host: "localhost"
database.port: 5432
database.name: "mydb"
`

      const result = ConfigCompiler.compileToJpe(jpe, 'json')
      expect(result.success).toBe(true)

      const parsed = JSON.parse(result.content!)
      expect(parsed.database).toEqual({
        host: 'localhost',
        port: 5432,
        name: 'mydb',
      })
    })

    it('handles null values', () => {
      const jpe = `name: "Test"
optional: null
`

      const result = ConfigCompiler.compileToJpe(jpe, 'json')
      expect(result.success).toBe(true)

      const parsed = JSON.parse(result.content!)
      expect(parsed.optional).toBeNull()
    })

    it('handles escaped quotes in strings', () => {
      const jpe = `message: "He said \\"hello\\""
`

      const result = ConfigCompiler.compileToJpe(jpe, 'json')
      expect(result.success).toBe(true)

      const parsed = JSON.parse(result.content!)
      expect(parsed.message).toBe('He said "hello"')
    })

    it('reports error for invalid format', () => {
      const jpe = `This is not a valid config format
Just some random text without colons
`

      const result = ConfigCompiler.compileToJpe(jpe, 'json')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('round-trips JSON → parse → JPE → compile → JSON', () => {
      const originalJson = JSON.stringify({
        name: 'Test Mod',
        version: '2.0',
        settings: {
          debug: true,
          logLevel: 'verbose',
        },
      }, null, 2)

      // Parse original JSON
      const _parsed = JSON.parse(originalJson)

      // Convert to JPE-like text
      const jpe = `name: "Test Mod"
version: "2.0"
settings.debug: true
settings.logLevel: "verbose"
`

      // Compile back to JSON
      const result = ConfigCompiler.compileToJpe(jpe, 'json')
      expect(result.success).toBe(true)

      const compiled = JSON.parse(result.content!)
      expect(compiled.name).toBe('Test Mod')
      expect(compiled.version).toBe('2.0')
      expect(compiled.settings.debug).toBe(true)
      expect(compiled.settings.logLevel).toBe('verbose')
    })
  })

  describe('compileToJpe — CFG', () => {
    it('compiles JPE to CFG format', () => {
      const jpe = `name: "My Mod"
version: 1
enabled: true
`

      const result = ConfigCompiler.compileToJpe(jpe, 'cfg')

      expect(result.success).toBe(true)
      expect(result.content).toBeDefined()
      expect(result.content).toContain('name=My Mod')
      expect(result.content).toContain('version=1')
      expect(result.content).toContain('enabled=true')
    })

    it('flattens nested objects to dot notation', () => {
      const jpe = `database.host: "localhost"
database.port: 5432
`

      const result = ConfigCompiler.compileToJpe(jpe, 'cfg')
      expect(result.success).toBe(true)

      const lines = result.content!.split('\n').filter(l => l.trim())
      expect(lines).toContain('database.host=localhost')
      expect(lines).toContain('database.port=5432')
    })

    it('handles boolean and number values', () => {
      const jpe = `debug: true
count: 100
ratio: 3.14
name: "test"
`

      const result = ConfigCompiler.compileToJpe(jpe, 'cfg')
      expect(result.success).toBe(true)

      const lines = result.content!.split('\n').filter(l => l.trim())
      expect(lines).toContain('debug=true')
      expect(lines).toContain('count=100')
      expect(lines).toContain('ratio=3.14')
      expect(lines).toContain('name=test')
    })
  })

  describe('compileToJpe — empty input', () => {
    it('handles empty JPE text', () => {
      const jpe = `// Empty config
`

      const result = ConfigCompiler.compileToJpe(jpe, 'json')
      expect(result.success).toBe(true)

      const parsed = JSON.parse(result.content!)
      expect(Object.keys(parsed)).toHaveLength(0)
    })
  })
})
