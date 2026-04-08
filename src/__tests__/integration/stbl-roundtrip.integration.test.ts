/**
 * STBL Round-Trip Integration Tests
 *
 * Tests the full STBL → JPE → STBL round-trip pipeline.
 *
 * @jest-environment node
 */

import { STBLParser } from '@/engine/parsers/STBLParser'
import { STBLCompiler } from '@/engine/compilers/STBLCompiler'

describe('STBL Round-Trip Integration', () => {
  /**
   * Generate a synthetic STBL binary buffer for testing.
   */
  function createTestSTBLBuffer(entries: Array<{ key: number; value: string }>): ArrayBuffer {
    const headerSize = 12
    let entryDataSize = 0

    for (const entry of entries) {
      entryDataSize += 8 + entry.value.length * 2
    }

    const buffer = new ArrayBuffer(headerSize + entryDataSize)
    const view = new DataView(buffer)
    const uint8View = new Uint8Array(buffer)

    // Header
    uint8View[0] = 'S'.charCodeAt(0)
    uint8View[1] = 'T'.charCodeAt(0)
    uint8View[2] = 'B'.charCodeAt(0)
    uint8View[3] = 'L'.charCodeAt(0)
    view.setUint16(4, 1, true) // version
    view.setUint16(6, 0, true) // flags
    view.setUint32(8, entries.length, true) // entry count

    // Entries
    let offset = headerSize
    for (const entry of entries) {
      view.setUint32(offset, entry.key, true)
      view.setUint16(offset + 4, 0, true) // flags
      view.setUint16(offset + 6, entry.value.length, true)
      offset += 8

      // UTF-16LE string
      for (let i = 0; i < entry.value.length; i++) {
        view.setUint16(offset + i * 2, entry.value.charCodeAt(i), true)
      }
      offset += entry.value.length * 2
    }

    return buffer
  }

  it('round-trips a simple STBL file', () => {
    // 1. Create original STBL binary
    const originalEntries = [
      { key: 0x00000001, value: 'Hello World' },
      { key: 0x00000002, value: 'Goodbye World' },
      { key: 0xDEADBEEF, value: 'Sims 4 String' },
    ]
    const originalBuffer = createTestSTBLBuffer(originalEntries)

    // 2. Parse to structured data
    const parsedData = STBLParser.parse(originalBuffer)
    expect(parsedData).not.toBeNull()
    expect(parsedData!.entries.length).toBe(3)

    // 3. Convert to JPE text (simulating useFileLoader)
    let jpeText = `// STBL File\n`
    jpeText += `// Version: ${parsedData!.version}\n`
    jpeText += `// Flags: 0x${parsedData!.flags.toString(16).toUpperCase().padStart(4, '0')}\n\n`
    for (const entry of parsedData!.entries) {
      const hexKey = `0x${entry.key.toString(16).toUpperCase().padStart(8, '0')}`
      jpeText += `String ${hexKey}: "${entry.value}"\n`
    }

    // 4. Compile back to binary
    const compileResult = STBLCompiler.compile(jpeText)
    expect(compileResult.success).toBe(true)
    expect(compileResult.buffer).toBeDefined()

    // 5. Parse compiled binary and compare
    const roundTripData = STBLParser.parse(compileResult.buffer!)
    expect(roundTripData).not.toBeNull()
    expect(roundTripData!.entries.length).toBe(originalEntries.length)

    for (let i = 0; i < originalEntries.length; i++) {
      expect(roundTripData!.entries[i].key).toBe(originalEntries[i].key)
      expect(roundTripData!.entries[i].value).toBe(originalEntries[i].value)
    }
  })

  it('round-trips with many entries', () => {
    const entries = Array.from({ length: 100 }, (_, i) => ({
      key: i + 1,
      value: `String number ${i + 1}`,
    }))

    const originalBuffer = createTestSTBLBuffer(entries)
    const parsedData = STBLParser.parse(originalBuffer)
    expect(parsedData).not.toBeNull()

    // Convert to JPE
    let jpeText = `// STBL File\n// Version: 1\n\n`
    for (const entry of parsedData!.entries) {
      const hexKey = `0x${entry.key.toString(16).toUpperCase().padStart(8, '0')}`
      jpeText += `String ${hexKey}: "${entry.value}"\n`
    }

    // Compile
    const compileResult = STBLCompiler.compile(jpeText)
    expect(compileResult.success).toBe(true)

    // Parse and compare
    const roundTripData = STBLParser.parse(compileResult.buffer!)
    expect(roundTripData).not.toBeNull()
    expect(roundTripData!.entries.length).toBe(100)

    // Spot-check a few entries
    expect(roundTripData!.entries[0].value).toBe('String number 1')
    expect(roundTripData!.entries[50].value).toBe('String number 51')
    expect(roundTripData!.entries[99].value).toBe('String number 100')
  })

  it('preserves binary identity on round-trip', () => {
    const entries = [
      { key: 0x00000001, value: 'Test' },
      { key: 0x00000002, value: 'Value' },
    ]

    const originalBuffer = createTestSTBLBuffer(entries)

    // Parse
    const parsed = STBLParser.parse(originalBuffer)
    expect(parsed).not.toBeNull()

    // Convert to JPE
    const jpeText = `String 0x00000001: "Test"\nString 0x00000002: "Value"\n`

    // Compile
    const compileResult = STBLCompiler.compile(jpeText)
    expect(compileResult.success).toBe(true)

    // Binary comparison
    const originalU8 = new Uint8Array(originalBuffer)
    const compiledU8 = new Uint8Array(compileResult.buffer!)

    expect(compiledU8.length).toBe(originalU8.length)
    for (let i = 0; i < originalU8.length; i++) {
      expect(compiledU8[i]).toBe(originalU8[i])
    }
  })

  it('handles empty STBL round-trip', () => {
    const originalBuffer = createTestSTBLBuffer([])
    const parsed = STBLParser.parse(originalBuffer)
    expect(parsed).not.toBeNull()
    expect(parsed!.entries.length).toBe(0)

    // JPE for empty
    const jpeText = `// STBL File\n// Version: 1\n`

    // Compile
    const compileResult = STBLCompiler.compile(jpeText)
    expect(compileResult.success).toBe(true)

    // Parse and verify empty
    const roundTrip = STBLParser.parse(compileResult.buffer!)
    expect(roundTrip).not.toBeNull()
    expect(roundTrip!.entries.length).toBe(0)
  })

  it('detects and reports invalid JPE format', () => {
    const invalidJpe = `This is not STBL format at all
Just some random text
No string entries here
`

    const result = STBLCompiler.compile(invalidJpe)
    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.metadata.entryCount).toBe(0)
  })

  it('handles long strings correctly', () => {
    const longString = 'A'.repeat(1000)
    const jpeText = `String 0x00001000: "${longString}"\n`

    const result = STBLCompiler.compile(jpeText)
    expect(result.success).toBe(true)

    // Parse back
    const parsed = STBLParser.parse(result.buffer!)
    expect(parsed).not.toBeNull()
    expect(parsed!.entries[0].value).toBe(longString)
    expect(parsed!.entries[0].value.length).toBe(1000)
  })
})
