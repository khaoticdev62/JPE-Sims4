/**
 * STBL Compiler unit tests
 *
 * @jest-environment node
 */

import { STBLCompiler } from '@/engine/compilers/STBLCompiler'
import { STBLParser } from '@/engine/parsers/STBLParser'

describe('STBLCompiler', () => {
  it('compiles valid JPE text to binary STBL', () => {
    const jpe = `// STBL File
// Version: 1
// Flags: 0x0000
// Entries: 2

String 0x00000001: "Hello World"
String 0x00000002: "Goodbye World"
`

    const result = STBLCompiler.compile(jpe)

    expect(result.success).toBe(true)
    expect(result.buffer).toBeDefined()
    expect(result.errors).toHaveLength(0)
    expect(result.metadata.entryCount).toBe(2)
    expect(result.byteLength).toBeGreaterThan(0)
  })

  it('handles decimal keys', () => {
    const jpe = `String 1: "One"
String 2: "Two"
`

    const result = STBLCompiler.compile(jpe)
    expect(result.success).toBe(true)
    expect(result.metadata.entryCount).toBe(2)
  })

  it('handles empty entries', () => {
    const jpe = `// STBL File
// Version: 1
`

    const result = STBLCompiler.compile(jpe)
    expect(result.success).toBe(true)
    expect(result.metadata.entryCount).toBe(0)
    expect(result.byteLength).toBe(12) // Header only
  })

  it('reports error for invalid format', () => {
    const jpe = `This is not valid STBL format
Just some random text
`

    const result = STBLCompiler.compile(jpe)
    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('reports error for duplicate keys', () => {
    const jpe = `String 0x00000001: "First"
String 0x00000001: "Duplicate"
`

    const result = STBLCompiler.compile(jpe)
    expect(result.success).toBe(false)
    expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true)
  })

  it('reports error for invalid key format', () => {
    const jpe = `String 0xZZZZ: "Bad key"
`

    const result = STBLCompiler.compile(jpe)
    expect(result.success).toBe(false)
    // "0xZZZZ" matches the hex regex but parseInt returns NaN
    expect(result.errors.some(e => e.includes('Invalid key') || e.includes('Invalid STBL'))).toBe(true)
  })

  it('produces binary that can be re-parsed (round-trip)', () => {
    const jpe = `String 0x00000001: "Hello"
String 0x00000002: "World"
`

    const compileResult = STBLCompiler.compile(jpe)
    expect(compileResult.success).toBe(true)
    expect(compileResult.buffer).toBeDefined()

    // Parse the compiled binary
    const parsedData = STBLParser.parse(compileResult.buffer!)
    expect(parsedData).not.toBeNull()
    expect(parsedData!.magic).toBe('STBL')
    expect(parsedData!.entries.length).toBe(2)
    expect(parsedData!.entries[0].value).toBe('Hello')
    expect(parsedData!.entries[1].value).toBe('World')
  })

  it('handles Unicode characters in strings', () => {
    const jpe = `String 0x00000001: "Hello 世界 🎮"
String 0x00000002: "Café résumé"
`

    const compileResult = STBLCompiler.compile(jpe)
    expect(compileResult.success).toBe(true)

    // Parse back
    const parsedData = STBLParser.parse(compileResult.buffer!)
    expect(parsedData).not.toBeNull()
    expect(parsedData!.entries[0].value).toContain('世界')
    expect(parsedData!.entries[1].value).toContain('Café')
  })

  it('handles escaped quotes in strings', () => {
    const jpe = `String 0x00000001: "He said \\"Hello\\""
`

    const result = STBLCompiler.compile(jpe)
    expect(result.success).toBe(true)

    // Parse back
    const parsedData = STBLParser.parse(result.buffer!)
    expect(parsedData).not.toBeNull()
    expect(parsedData!.entries[0].value).toBe('He said "Hello"')
  })

  it('recompile updates specific entries', () => {
    const existing = [
      { key: 0x00000001, flags: 0, value: 'Old value' },
      { key: 0x00000002, flags: 0, value: 'Unchanged' },
    ]

    const updates = new Map<number, string>()
    updates.set(0x00000001, 'New value')

    const result = STBLCompiler.recompile(existing, updates)
    expect(result.success).toBe(true)

    // Parse back
    const parsedData = STBLParser.parse(result.buffer!)
    expect(parsedData).not.toBeNull()
    expect(parsedData!.entries[0].value).toBe('New value')
    expect(parsedData!.entries[1].value).toBe('Unchanged')
  })

  it('correctly writes binary header structure', () => {
    const jpe = `String 0x00000001: "Test"
`

    const result = STBLCompiler.compile(jpe)
    expect(result.success).toBe(true)

    const view = new DataView(result.buffer!)
    // Magic
    expect(String.fromCharCode(view.getUint8(0))).toBe('S')
    expect(String.fromCharCode(view.getUint8(1))).toBe('T')
    expect(String.fromCharCode(view.getUint8(2))).toBe('B')
    expect(String.fromCharCode(view.getUint8(3))).toBe('L')
    // Version
    expect(view.getUint16(4, true)).toBe(1)
    // Entry count
    expect(view.getUint32(8, true)).toBe(1)
  })
})
