/**
 * JPE COMPILER
 *
 * Compiles JPE text directly to XML, handling the full transformation:
 * JPE → AST → XML
 *
 * This module provides the compilation pipeline:
 * 1. Parse JPE text to AST
 * 2. Validate the AST
 * 3. Generate XML output
 * 4. Return compilation result with success/error status
 */

import { ASTNode, CompilationResult, ValidationError } from './types'
import { jpeToAst } from './jpeTranslator'
import { validateJpe } from './validator'

/**
 * MAIN FUNCTION: Compile JPE text to XML
 *
 * Input: JPE text (human-readable format)
 * Output: CompilationResult with XML string or error
 *
 * This is the key function that enables:
 * - User edits JPE in editor
 * - Clicks Compile
 * - Gets XML output to save to disk
 *
 * Example:
 * const result = compileJpeToXml("MODULE: MyMod\nDESCRIPTION: \"Test\"")
 * if (result.success) {
 *   console.log(result.xml) // Full XML string
 * } else {
 *   console.log(result.error) // Error message
 * }
 */
export function compileJpeToXml(jpeText: string): CompilationResult {
  try {
    // STEP 1: Validate JPE syntax
    const validationResult = validateJpe(jpeText)

    // Check for blocking errors (but allow warnings/info)
    const blockingErrors = validationResult.errors.filter(
      (e) => e.severity === 'error'
    )
    if (blockingErrors.length > 0) {
      return {
        success: false,
        error: `Compilation blocked by ${blockingErrors.length} error(s): ${blockingErrors[0].message}`,
        diagnostics: validationResult.errors,
      }
    }

    // STEP 2: Parse JPE to AST
    const parseResult = jpeToAst(jpeText)
    if (!parseResult.success || !parseResult.ast) {
      return {
        success: false,
        error: parseResult.error || 'Failed to parse JPE',
      }
    }

    // STEP 3: Generate XML from AST
    const xml = astToXmlString(parseResult.ast)

    // STEP 4: Return success with optional warnings
    return {
      success: true,
      xml,
      diagnostics: validationResult.errors,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown compilation error',
    }
  }
}

/**
 * Convert AST to XML string
 *
 * Recursively walks the AST and builds properly formatted XML
 * Handles:
 * - Attributes in tags
 * - Nested elements
 * - Text content
 * - Proper indentation
 */
function astToXmlString(node: ASTNode, indent: number = 0): string {
  const indentStr = '  '.repeat(indent)
  const nextIndentStr = '  '.repeat(indent + 1)

  // Build attribute string
  const attrs = Object.entries(node.attributes)
    .map(([key, value]) => ` ${key}="${escapeXmlAttribute(value)}"`)
    .join('')

  // Start tag
  let xml = `${indentStr}<${node.type}${attrs}>`

  // Handle content
  if (node.value) {
    // Element has text content
    xml += escapeXmlContent(node.value)
  } else if (node.children.length > 0) {
    // Element has child elements
    xml += '\n'
    for (const child of node.children) {
      xml += astToXmlString(child, indent + 1)
    }
    xml += indentStr
  }

  // End tag
  xml += `</${node.type}>\n`

  return xml
}

/**
 * Escape special XML characters in element content
 * Converts: < > & " '
 */
function escapeXmlContent(content: string): string {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Escape special XML characters in attribute values
 * Converts: < > & " '
 */
function escapeXmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * BONUS: Compile with detailed diagnostics
 *
 * Returns compilation result plus all validation warnings/info
 * Useful for editor to show issues even when compilation succeeds
 *
 * Example:
 * const result = compileJpeToXmlWithDiagnostics("MODULE: Mod\nWHEN: X")
 * // Will show warnings about missing DO block, etc.
 */
export function compileJpeToXmlWithDiagnostics(jpeText: string): CompilationResult {
  const result = compileJpeToXml(jpeText)
  return result // Already includes diagnostics from validateJpe
}

/**
 * BONUS: Get compilation diagnostics without generating XML
 *
 * Useful for real-time editor validation that doesn't need full XML output
 * Much faster than full compilation
 *
 * Example:
 * const diagnostics = getCompilationDiagnostics("MODULE: MyMod")
 * // Errors, warnings, info messages - no XML generation
 */
export function getCompilationDiagnostics(jpeText: string): {
  errors: ValidationError[]
  canCompile: boolean
} {
  const validationResult = validateJpe(jpeText)
  const blockingErrors = validationResult.errors.filter(
    (e) => e.severity === 'error'
  )

  return {
    errors: validationResult.errors,
    canCompile: blockingErrors.length === 0,
  }
}

/**
 * BONUS: Add XML declaration to compiled output
 *
 * Some systems require proper XML declaration at start
 * This wraps the compiler output with declaration
 *
 * Example:
 * const result = compileJpeToXmlWithDeclaration("MODULE: MyMod")
 * // Returns: <?xml version="1.0" encoding="UTF-8"?>
 *            <ModPackage>...</ModPackage>
 */
export function compileJpeToXmlWithDeclaration(jpeText: string): CompilationResult {
  const result = compileJpeToXml(jpeText)

  if (result.success && result.xml) {
    const declaration = '<?xml version="1.0" encoding="UTF-8"?>\n'
    return {
      ...result,
      xml: declaration + result.xml,
    }
  }

  return result
}
