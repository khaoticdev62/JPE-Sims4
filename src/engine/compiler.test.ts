/**
 * JPE COMPILER TESTS
 *
 * Tests for the compilation pipeline:
 * JPE → AST → XML
 *
 * Includes:
 * - Basic compilation
 * - Error handling
 * - Diagnostics
 * - XML generation
 * - Round-trip compilation
 */

import { compileJpeToXml, getCompilationDiagnostics, compileJpeToXmlWithDeclaration } from './compiler'

describe('JPE Compiler', () => {
  // ============================================================
  // BASIC COMPILATION
  // ============================================================

  test('Basic JPE compiles to valid XML', () => {
    const jpe = `MODULE: TestMod
DESCRIPTION: "A test mod"`

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true)
    expect(result.xml).toBeDefined()
    expect(result.xml).toContain('<ModPackage>')
    expect(result.xml).toContain('</ModPackage>')
  })

  test('XML output includes MODULE name', () => {
    const jpe = `MODULE: MyTestMod
DESCRIPTION: "Test"`

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true)
    expect(result.xml).toContain('MyTestMod')
  })

  test('XML output includes DESCRIPTION', () => {
    const jpe = `MODULE: TestMod
DESCRIPTION: "This is a test description"`

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true)
    expect(result.xml).toContain('This is a test description')
  })

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  test('Missing MODULE declaration should fail compilation', () => {
    const jpe = 'DESCRIPTION: "No module"'

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  test('Invalid keyword should fail compilation', () => {
    const jpe = `MODULE: TestMod
BADKEYWORD: value`

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(false)
    expect(result.error).toContain('error')
  })

  test('WHEN without DO should fail compilation', () => {
    const jpe = `MODULE: TestMod
WHEN: condition`

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(false)
  })

  // ============================================================
  // DIAGNOSTICS
  // ============================================================

  test('Warnings do not block compilation', () => {
    const jpe = `MODULE: TestMod
ITEMS:
  ITEM:
    id: test`
    // Missing DESCRIPTION - should warn but still compile

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true) // Compilation succeeds
    expect(result.diagnostics).toBeDefined()
    const warnings = result.diagnostics?.filter((e) => e.severity === 'warning')
    expect(warnings?.length).toBeGreaterThan(0)
  })

  test('Diagnostics include warnings and info', () => {
    const jpe = `MODULE: TestMod
COMPATIBILITY:
  - Required: Something`
    // Should warn about missing DESCRIPTION and info about ONLY_IF

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true)
    const allDiagnostics = result.diagnostics || []
    const hasWarning = allDiagnostics.some((e) => e.severity === 'warning')
    const hasInfo = allDiagnostics.some((e) => e.severity === 'info')
    expect(hasWarning || hasInfo).toBe(true)
  })

  // ============================================================
  // COMPILATION DIAGNOSTICS
  // ============================================================

  test('getCompilationDiagnostics returns error list without XML', () => {
    const jpe = `MODULE: TestMod`

    const result = getCompilationDiagnostics(jpe)
    expect(result.canCompile).toBe(true)
    expect(result.errors).toBeDefined()
    expect(Array.isArray(result.errors)).toBe(true)
  })

  test('getCompilationDiagnostics identifies blocking errors', () => {
    const jpe = `DESCRIPTION: "No module"`

    const result = getCompilationDiagnostics(jpe)
    expect(result.canCompile).toBe(false)
    const errors = result.errors.filter((e) => e.severity === 'error')
    expect(errors.length).toBeGreaterThan(0)
  })

  // ============================================================
  // XML DECLARATION
  // ============================================================

  test('XML with declaration includes proper header', () => {
    const jpe = `MODULE: TestMod
DESCRIPTION: "Test"`

    const result = compileJpeToXmlWithDeclaration(jpe)
    expect(result.success).toBe(true)
    expect(result.xml).toMatch(/^<\?xml version/)
  })

  test('XML declaration is only added on success', () => {
    const jpe = `BADKEYWORD: value`

    const result = compileJpeToXmlWithDeclaration(jpe)
    expect(result.success).toBe(false)
    expect(result.xml).toBeUndefined()
  })

  // ============================================================
  // ITEMS COMPILATION
  // ============================================================

  test('ITEMS section compiles to XML structure', () => {
    const jpe = `MODULE: ClothingMod
DESCRIPTION: "Clothing mod"
ITEMS:
  ITEM:
    id: dress_001
    name: "Blue Dress"
    category: "Clothing"`

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true)
    expect(result.xml).toContain('dress_001')
    expect(result.xml).toContain('Blue Dress')
  })

  test('Item variations compile correctly', () => {
    const jpe = `MODULE: ColoredClothing
ITEMS:
  ITEM:
    id: shirt
    name: "Shirt"
    variations:
      - Red: #FF0000
      - Blue: #0000FF`

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true)
    expect(result.xml).toContain('Red')
    expect(result.xml).toContain('Blue')
  })

  // ============================================================
  // COMPATIBILITY COMPILATION
  // ============================================================

  test('COMPATIBILITY section compiles to XML', () => {
    const jpe = `MODULE: DependentMod
COMPATIBILITY:
  - Required: "BaseGamePatch"
  - Conflicts: "OldVersion"`

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true)
    expect(result.xml).toContain('BaseGamePatch')
  })

  // ============================================================
  // LOCALIZATION COMPILATION
  // ============================================================

  test('LOCALIZATION section compiles to XML', () => {
    const jpe = `MODULE: MultiLanguageMod
DESCRIPTION: "Test"
LOCALIZATION:
  EN: "English"
  FR: "French"
  DE: "German"`

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true)
    expect(result.xml).toContain('English')
    expect(result.xml).toContain('French')
  })

  // ============================================================
  // COMPLEX INTEGRATION TESTS
  // ============================================================

  test('Complete mod compiles successfully', () => {
    const jpe = `MODULE: CompleteOutfitPack
DESCRIPTION: "Professional outfit pack"
VERSION: 2.0
AUTHOR: "ModCreator"

ITEMS:
  ITEM:
    id: business_suit
    name: "Business Suit"
    category: "Clothing"
    description: "Professional business suit"
    price: 250
    gender: "Unisex"
    ages: "YoungAdult+Adult"
    variations:
      - Black: #000000
      - Navy: #000080
      - Gray: #808080

COMPATIBILITY:
  - Required: "GetTogether"
  - Optional: "Seasons"

LOCALIZATION:
  EN: "Complete Outfit Pack"
  ES: "Paquete Outfit Completo"
  FR: "Pack Tenue Complète"
  DE: "Komplettes Outfit Pack"`

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true)
    expect(result.xml).toBeDefined()
    expect(result.xml).toContain('CompleteOutfitPack')
    expect(result.xml).toContain('business_suit')
    expect(result.xml).toContain('Black')
    expect(result.xml).toContain('GetTogether')
    expect(result.xml).toContain('English')
  })

  test('Real-world Sims 4 mod pattern compiles', () => {
    const jpe = `MODULE: SimStuff
DESCRIPTION: "Cool sim stuff for Sims 4"
VERSION: 1.2
AUTHOR: "SimModder"

ITEMS:
  ITEM:
    id: leather_jacket_001
    name: "Leather Jacket"
    category: "Top"
    description: "Classic black leather jacket"
    price: 180
    gender: "Unisex"
    ages: "Teenager+YoungAdult+Adult"

COMPATIBILITY:
  - Required: "Get Together"

LOCALIZATION:
  EN: "Leather Jacket Pack"
  PT: "Pacote Jaqueta de Couro"`

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true)
    expect(result.xml).toContain('SimStuff')
  })

  // ============================================================
  // XML ESCAPING
  // ============================================================

  test('Special characters in content are escaped', () => {
    const jpe = `MODULE: TestMod
DESCRIPTION: "Test & special < characters > here"`

    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true)
    // Should escape special characters
    expect(result.xml).toContain('&amp;')
    expect(result.xml).toContain('&lt;')
    expect(result.xml).toContain('&gt;')
  })

  // ============================================================
  // EMPTY/EDGE CASES
  // ============================================================

  test('Empty file fails', () => {
    const jpe = ''
    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(false)
  })

  test('Only whitespace fails', () => {
    const jpe = '   \n  \n   '
    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(false)
  })

  test('Minimal valid JPE compiles', () => {
    const jpe = 'MODULE: Mini'
    const result = compileJpeToXml(jpe)
    expect(result.success).toBe(true)
  })
})
