/**
 * XML Parser Tests
 *
 * Tests verify that the parser works correctly.
 *
 * LEARNING: Tests show "expected behavior"
 * By reading tests, you learn:
 * - What inputs the parser accepts
 * - What output it produces
 * - How to use the parser
 *
 * When something breaks, tests tell you exactly what's wrong
 */

import { parseXML, findChild, getChildValue } from './xmlParser'

describe('XML Parser', () => {
  // TEST 1: Simple XML with no attributes
  it('should parse simple XML', () => {
    const xml = `
      <?xml version="1.0"?>
      <ModPackage>
        <Name>MyMod</Name>
        <Version>1.0</Version>
      </ModPackage>
    `

    const result = parseXML(xml)

    // Check parsing succeeded
    expect(result.success).toBe(true)
    expect(result.ast).toBeDefined()

    // Check root node
    expect(result.ast!.type).toBe('ModPackage')
    expect(result.ast!.children.length).toBe(2)

    // Check children
    expect(result.ast!.children[0].type).toBe('Name')
    expect(result.ast!.children[0].value).toBe('MyMod')

    expect(result.ast!.children[1].type).toBe('Version')
    expect(result.ast!.children[1].value).toBe('1.0')
  })

  // TEST 2: XML with attributes
  it('should parse XML with attributes', () => {
    const xml = `
      <Item id="123" name="Test">
        <Property key="value"></Property>
      </Item>
    `

    const result = parseXML(xml)

    expect(result.success).toBe(true)
    expect(result.ast!.attributes).toEqual({
      id: '123',
      name: 'Test',
    })
  })

  // TEST 3: Deeply nested XML
  it('should handle nested structures', () => {
    const xml = `
      <Root>
        <Level1>
          <Level2>
            <Level3>DeepValue</Level3>
          </Level2>
        </Level1>
      </Root>
    `

    const result = parseXML(xml)
    expect(result.success).toBe(true)

    const root = result.ast!
    const level1 = root.children[0]
    const level2 = level1.children[0]
    const level3 = level2.children[0]

    expect(level3.type).toBe('Level3')
    expect(level3.value).toBe('DeepValue')
  })

  // TEST 4: Self-closing tags
  it('should handle self-closing tags', () => {
    const xml = `
      <Root>
        <Empty/>
        <Named type="test"/>
      </Root>
    `

    const result = parseXML(xml)
    expect(result.success).toBe(true)
    expect(result.ast!.children.length).toBe(2)
    expect(result.ast!.children[0].children.length).toBe(0)
  })

  // TEST 5: Multiple children of same type
  it('should handle multiple children with same tag', () => {
    const xml = `
      <Container>
        <Item>First</Item>
        <Item>Second</Item>
        <Item>Third</Item>
      </Container>
    `

    const result = parseXML(xml)
    expect(result.success).toBe(true)
    expect(result.ast!.children.length).toBe(3)
    expect(result.ast!.children[0].value).toBe('First')
    expect(result.ast!.children[1].value).toBe('Second')
    expect(result.ast!.children[2].value).toBe('Third')
  })

  // TEST 6: Helper functions
  it('should provide helper functions', () => {
    const xml = `
      <Root>
        <Name>TestName</Name>
        <Version>1.0</Version>
        <Type>Clothing</Type>
      </Root>
    `

    const result = parseXML(xml)
    const root = result.ast!

    // findChild() finds first match
    const nameNode = findChild(root, 'Name')
    expect(nameNode?.value).toBe('TestName')

    // getChildValue() is shorthand
    const version = getChildValue(root, 'Version')
    expect(version).toBe('1.0')

    // Returns null/empty if not found
    const missing = findChild(root, 'Missing')
    expect(missing).toBeNull()
  })

  // TEST 7: Error handling - mismatched tags
  it('should error on mismatched tags', () => {
    const xml = `
      <Root>
        <Child>text</Wrong>
      </Root>
    `

    const result = parseXML(xml)
    expect(result.success).toBe(false)
    expect(result.error).toContain('Mismatched')
  })

  // TEST 8: Error handling - missing closing tag
  it('should error on unclosed tags', () => {
    const xml = `
      <Root>
        <Child>text
      </Root>
    `

    const result = parseXML(xml)
    expect(result.success).toBe(false)
  })

  // TEST 9: Real Sims 4 clothing mod example
  it('should parse real Sims 4 mod structure', () => {
    const xml = `
      <?xml version="1.0" encoding="utf-8"?>
      <ModPackage>
        <Name>My Fantasy Clothing</Name>
        <Description>Adds fantasy themed clothing</Description>
        <Version>1.0.0</Version>
        <Items>
          <Item id="item_1">
            <Name>Enchanted Dress</Name>
            <Type>Clothing</Type>
            <Color>Blue</Color>
            <Price>500</Price>
          </Item>
          <Item id="item_2">
            <Name>Wizard Robe</Name>
            <Type>Clothing</Type>
            <Color>Purple</Color>
            <Price>750</Price>
          </Item>
        </Items>
      </ModPackage>
    `

    const result = parseXML(xml)
    expect(result.success).toBe(true)

    const root = result.ast!
    expect(root.type).toBe('ModPackage')
    expect(getChildValue(root, 'Name')).toBe('My Fantasy Clothing')

    // Find Items container
    const itemsNode = findChild(root, 'Items')
    expect(itemsNode).toBeDefined()
    expect(itemsNode!.children.length).toBe(2)

    // Check first item
    const item1 = itemsNode!.children[0]
    expect(item1.attributes.id).toBe('item_1')
    expect(getChildValue(item1, 'Name')).toBe('Enchanted Dress')
    expect(getChildValue(item1, 'Price')).toBe('500')
  })
})

/**
 * ============================================================
 * LEARNING: Understanding Tests
 * ============================================================
 *
 * Each test follows this pattern:
 *
 * 1. SETUP: Create test data (XML string)
 * 2. ACTION: Call the function (parseXML)
 * 3. VERIFY: Check the result is correct (expect statements)
 *
 * Why tests matter:
 * - They show how to use the code
 * - They catch bugs when we make changes
 * - They document expected behavior
 * - They give you confidence the code works
 *
 * How to run tests:
 * npm test -- xmlParser.test.ts
 *
 * If a test fails, it tells you exactly what went wrong,
 * making bugs easy to find and fix.
 */
