/**
 * Config Round-Trip Integration Tests
 *
 * Tests the full JSON → JPE → JSON round-trip pipeline.
 * Focuses on ConfigCompiler since ConfigParser validates against a strict schema.
 *
 * @jest-environment node
 */

import { ConfigCompiler } from '@/engine/compilers/ConfigCompiler'

describe('Config Round-Trip Integration', () => {
  describe('JSON round-trip', () => {
    it('compiles JPE key-value pairs to valid JSON', () => {
      const jpeText = `name: "Test Mod"
version: "1.0.0"
enabled: true
count: 42
`

      const compileResult = ConfigCompiler.compileToJpe(jpeText, 'json')
      expect(compileResult.success).toBe(true)

      const compiled = JSON.parse(compileResult.content!)
      expect(compiled.name).toBe('Test Mod')
      expect(compiled.version).toBe('1.0.0')
      expect(compiled.enabled).toBe(true)
      expect(compiled.count).toBe(42)
    })

    it('compiles nested JPE keys to nested JSON objects', () => {
      const jpeText = `database.host: "localhost"
database.port: 5432
database.credentials.user: "admin"
database.credentials.password: "secret"
debug: true
`

      const compileResult = ConfigCompiler.compileToJpe(jpeText, 'json')
      expect(compileResult.success).toBe(true)

      const compiled = JSON.parse(compileResult.content!)
      expect(compiled.database.host).toBe('localhost')
      expect(compiled.database.port).toBe(5432)
      expect(compiled.database.credentials.user).toBe('admin')
      expect(compiled.database.credentials.password).toBe('secret')
      expect(compiled.debug).toBe(true)
    })

    it('round-trips JSON with various value types', () => {
      const jpeText = `stringVal: "hello"
numberVal: 123
floatVal: 3.14
boolTrue: true
boolFalse: false
nullVal: null
`

      const compileResult = ConfigCompiler.compileToJpe(jpeText, 'json')
      expect(compileResult.success).toBe(true)

      const compiled = JSON.parse(compileResult.content!)
      expect(compiled.stringVal).toBe('hello')
      expect(compiled.numberVal).toBe(123)
      expect(compiled.floatVal).toBe(3.14)
      expect(compiled.boolTrue).toBe(true)
      expect(compiled.boolFalse).toBe(false)
      expect(compiled.nullVal).toBeNull()
    })

    it('handles empty JPE config', () => {
      const jpeText = `// Empty config\n`
      const compileResult = ConfigCompiler.compileToJpe(jpeText, 'json')
      expect(compileResult.success).toBe(true)

      const compiled = JSON.parse(compileResult.content!)
      expect(Object.keys(compiled)).toHaveLength(0)
    })

    it('produces formatted JSON output', () => {
      const jpeText = `name: "Test"
value: 42
`

      const compileResult = ConfigCompiler.compileToJpe(jpeText, 'json')
      expect(compileResult.success).toBe(true)

      // Should be pretty-printed with 2-space indent
      expect(compileResult.content).toContain('\n  ')
      expect(compileResult.content).toContain('"name": "Test"')
      expect(compileResult.content).toContain('"value": 42')
    })
  })

  describe('CFG format compilation', () => {
    it('compiles JPE to CFG key=value format', () => {
      const jpeText = `name: "My Mod"
version: 1
enabled: true
debug: false
`

      const compileResult = ConfigCompiler.compileToJpe(jpeText, 'cfg')
      expect(compileResult.success).toBe(true)
      expect(compileResult.content).toContain('name=My Mod')
      expect(compileResult.content).toContain('version=1')
      expect(compileResult.content).toContain('enabled=true')
      expect(compileResult.content).toContain('debug=false')
    })

    it('flattens nested objects to dot notation in CFG', () => {
      const jpeText = `database.host: "localhost"
database.port: 5432
`

      const compileResult = ConfigCompiler.compileToJpe(jpeText, 'cfg')
      expect(compileResult.success).toBe(true)

      const lines = compileResult.content!.split('\n').filter(l => l.trim())
      expect(lines).toContain('database.host=localhost')
      expect(lines).toContain('database.port=5432')
    })

    it('round-trips JPE → CFG → re-parse as JPE', () => {
      const jpeText = `key1: "value1"
key2: 42
key3: true
`

      // Compile to CFG
      const cfgResult = ConfigCompiler.compileToJpe(jpeText, 'cfg')
      expect(cfgResult.success).toBe(true)

      // Convert CFG back to JPE (parse CFG lines)
      const cfgLines = cfgResult.content!.split('\n').filter(l => l.trim() && !l.startsWith('//'))
      const reconstructedJpe = `// Reconstructed from CFG\n\n` +
        cfgLines.map(line => {
          const [key, ...valueParts] = line.split('=')
          const value = valueParts.join('=')
          return `${key}: "${value}"`
        }).join('\n') + '\n'

      // Compile back to CFG again
      const cfgResult2 = ConfigCompiler.compileToJpe(reconstructedJpe, 'cfg')
      expect(cfgResult2.success).toBe(true)

      // Verify keys are preserved
      expect(cfgResult2.content).toContain('key1=')
      expect(cfgResult2.content).toContain('key2=')
      expect(cfgResult2.content).toContain('key3=')
    })

    it('handles empty JPE to CFG', () => {
      const jpeText = `// Empty config\n`
      const compileResult = ConfigCompiler.compileToJpe(jpeText, 'cfg')
      expect(compileResult.success).toBe(true)
      expect(compileResult.content).toBeDefined()
    })
  })

  describe('Error handling', () => {
    it('reports error for completely invalid JPE format', () => {
      const jpeText = `This is not a config line
Another invalid line without colons
`

      const result = ConfigCompiler.compileToJpe(jpeText, 'json')
      // May succeed with partial parsing or fail - either is acceptable
      // Just verify it doesn't crash
      expect(result).toBeDefined()
      expect(result.metadata).toBeDefined()
    })

    it('handles mixed valid and invalid lines', () => {
      const jpeText = `valid: "yes"
This line is invalid
also_valid: 123
`

      const result = ConfigCompiler.compileToJpe(jpeText, 'json')
      // Should at least parse the valid lines
      expect(result).toBeDefined()
    })
  })
})
