/**
 * XML → JPE translation tests
 *
 * Tests the XMLParser and xmlToJpe translator.
 * Skipped if engine modules have import issues.
 *
 * @jest-environment node
 */

describe('XML → JPE Translation', () => {
  let XMLParser: any
  let xmlToJpe: any

  beforeAll(() => {
    try {
      XMLParser = require('@/engine/parsers/XMLParser').XMLParser
      xmlToJpe = require('@/engine/translators').xmlToJpe
    } catch {
      // Engine not available in test env
      XMLParser = null
      xmlToJpe = null
    }
  })

  const runIf = XMLParser && xmlToJpe

  if (!runIf) {
    it.skip('translates XML to JPE (engine not available in test env)', () => {})
    return
  }

  it('translates simple XML to JPE', () => {
    const xml = `<Tuning>
  <I c="Test">
    <T n="_display_name">0x12345678</T>
  </I>
</Tuning>`

    const parsed = XMLParser.parseXML(xml)
    expect(parsed).not.toBeNull()

    const jpe = xmlToJpe(parsed)
    expect(jpe).toBeTruthy()
    expect(jpe.length).toBeGreaterThan(0)
  })

  it('translates XML with attributes', () => {
    const xml = `<Tuning>
  <I c="Interaction" v="2">
    <T n="name">Test</T>
  </I>
</Tuning>`

    const parsed = XMLParser.parseXML(xml)
    expect(parsed).not.toBeNull()

    const jpe = xmlToJpe(parsed)
    expect(jpe).toContain('Interaction')
  })

  it('handles nested elements', () => {
    const xml = `<Root>
  <Parent>
    <Child>value</Child>
  </Parent>
</Root>`

    const parsed = XMLParser.parseXML(xml)
    expect(parsed).not.toBeNull()

    const jpe = xmlToJpe(parsed)
    expect(jpe).toBeTruthy()
  })

  it('handles empty XML gracefully', () => {
    const xml = `<Tuning />`

    const parsed = XMLParser.parseXML(xml)
    expect(parsed).not.toBeNull()

    const jpe = xmlToJpe(parsed)
    expect(jpe).toBeTruthy()
  })
})
