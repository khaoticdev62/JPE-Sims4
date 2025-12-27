/**
 * JPE TRANSLATOR
 *
 * Converts between:
 * - XML → JPE: Takes an AST and converts to human-readable JPE format
 * - JPE → XML: Takes JPE text and converts back to XML
 *
 * This is the core translation logic that makes the tool useful.
 */

import { ASTNode, TranslationResult, CompilationResult } from './types'

/**
 * MAIN FUNCTION: Convert XML AST to JPE text format
 *
 * Input: AST from xmlParser.parse()
 * Output: Human-readable JPE text
 *
 * Example:
 * AST: { type: 'Module', children: [{ type: 'Name', value: 'MyMod' }] }
 * JPE: "MODULE: MyMod\n"
 */
export function astToJpe(ast: ASTNode): TranslationResult {
  try {
    const jpe = translateNode(ast, 0)
    return {
      success: true,
      jpe: jpe.trim(),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed',
    }
  }
}

/**
 * INTERNAL: Recursive translation function
 *
 * Walks the AST tree and converts each node to JPE format
 * Handles indentation based on nesting level
 */
function translateNode(node: ASTNode, indent: number): string {
  const indentStr = '  '.repeat(indent)
  const nextIndent = indent + 1
  const nextIndentStr = '  '.repeat(nextIndent)

  // SPECIAL HANDLING for known Sims 4 structures
  // These patterns map common XML tags to JPE keywords

  // 1. Root module/package declaration
  if (node.type === 'ModPackage' || node.type === 'Module') {
    let jpe = ''

    // Find and output MODULE name
    const nameNode = node.children.find((c) => c.type === 'Name')
    if (nameNode?.value) {
      jpe += `MODULE: ${nameNode.value}\n`
    }

    // Find and output DESCRIPTION
    const descNode = node.children.find((c) => c.type === 'Description')
    if (descNode?.value) {
      jpe += `DESCRIPTION: "${descNode.value}"\n`
    }

    // Find and output VERSION
    const versionNode = node.children.find((c) => c.type === 'Version')
    if (versionNode?.value) {
      jpe += `VERSION: ${versionNode.value}\n`
    }

    // Find and output AUTHOR
    const authorNode = node.children.find((c) => c.type === 'Author')
    if (authorNode?.value) {
      jpe += `AUTHOR: "${authorNode.value}"\n`
    }

    jpe += '\n'

    // Handle special sections
    for (const child of node.children) {
      // Skip already-handled nodes
      if (['Name', 'Description', 'Version', 'Author'].includes(child.type)) {
        continue
      }

      // Handle ITEMS section
      if (child.type === 'Items' || child.type === 'ClothingItems') {
        jpe += `ITEMS:\n`
        for (const item of child.children) {
          jpe += translateItem(item, nextIndent)
        }
        jpe += '\n'
      }

      // Handle COMPATIBILITY section
      else if (child.type === 'Compatibility') {
        jpe += `COMPATIBILITY:\n`
        for (const req of child.children) {
          if (req.type === 'Requirement') {
            const type = req.attributes['type'] || 'Unknown'
            jpe += `${nextIndentStr}- [${type}] ${req.value}\n`
          }
        }
        jpe += '\n'
      }

      // Handle LOCALIZATION section
      else if (child.type === 'Localization') {
        jpe += `LOCALIZATION:\n`
        for (const lang of child.children) {
          jpe += `${nextIndentStr}${lang.type}: "${lang.value}"\n`
        }
        jpe += '\n'
      }

      // Generic handling for unknown sections
      else if (child.children.length > 0) {
        jpe += `${child.type.toUpperCase()}:\n`
        for (const subchild of child.children) {
          jpe += `${nextIndentStr}- ${subchild.type}: ${subchild.value}\n`
        }
        jpe += '\n'
      }
    }

    return jpe
  }

  // Generic node translation (fallback)
  return `${indentStr}${node.type}: ${node.value || ''}\n`
}

/**
 * INTERNAL: Translate an ITEM node (clothing, traits, etc.)
 *
 * Items are special - they have structured content:
 * - ID, DisplayName, Description, Price, etc.
 */
function translateItem(item: ASTNode, indent: number): string {
  const indentStr = '  '.repeat(indent)
  let jpe = `${indentStr}ITEM:\n`

  const nextIndentStr = '  '.repeat(indent + 1)

  // Extract key fields from item
  const fields: Record<string, string> = {
    ID: '',
    DisplayName: '',
    Category: '',
    Description: '',
    Price: '',
    Gender: '',
    AgeGroup: '',
  }

  // Read values from children
  for (const child of item.children) {
    if (child.type in fields) {
      fields[child.type] = child.value || ''
    }
  }

  // Output in JPE format
  if (fields.ID) jpe += `${nextIndentStr}id: "${fields.ID}"\n`
  if (fields.DisplayName) jpe += `${nextIndentStr}name: "${fields.DisplayName}"\n`
  if (fields.Category) jpe += `${nextIndentStr}category: "${fields.Category}"\n`
  if (fields.Description)
    jpe += `${nextIndentStr}description: "${fields.Description}"\n`
  if (fields.Price) jpe += `${nextIndentStr}price: ${fields.Price}\n`
  if (fields.Gender) jpe += `${nextIndentStr}gender: "${fields.Gender}"\n`
  if (fields.AgeGroup) jpe += `${nextIndentStr}ages: "${fields.AgeGroup}"\n`

  // Handle variations (colors, styles, etc.)
  const variationsNode = item.children.find((c) => c.type === 'Variations')
  if (variationsNode && variationsNode.children.length > 0) {
    jpe += `${nextIndentStr}variations:\n`
    for (const color of variationsNode.children) {
      const colorName = color.attributes['name'] || 'Unknown'
      jpe += `${nextIndentStr}  - ${colorName}: ${color.value}\n`
    }
  }

  return jpe
}

/**
 * REVERSE: Parse JPE text back to AST
 *
 * This is the reverse process: JPE → AST
 * We'll build a simple parser that understands JPE syntax
 */
export function jpeToAst(jpeText: string): TranslationResult {
  try {
    const ast = parseJpe(jpeText)
    return {
      success: true,
      ast,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'JPE parsing failed',
    }
  }
}

/**
 * INTERNAL: Parse JPE text to AST
 *
 * Handles:
 * - KEY: value pairs
 * - Nested blocks (ITEMS:, COMPATIBILITY:, etc.)
 * - List items (- item syntax)
 * - Quoted strings
 */
function parseJpe(jpeText: string): ASTNode {
  const lines = jpeText.split('\n').map((l) => l.trimRight())
  let currentIndex = 0

  // Root will be ModPackage
  const root: ASTNode = {
    type: 'ModPackage',
    attributes: {},
    children: [],
  }

  // Parse module-level fields
  while (currentIndex < lines.length) {
    const line = lines[currentIndex].trim()

    if (!line) {
      currentIndex++
      continue
    }

    // MODULE: declaration
    if (line.startsWith('MODULE:')) {
      const name = line.substring('MODULE:'.length).trim()
      root.children.push({
        type: 'Name',
        value: name,
        attributes: {},
        children: [],
      })
      currentIndex++
    }
    // DESCRIPTION:
    else if (line.startsWith('DESCRIPTION:')) {
      const desc = extractQuotedValue(
        line.substring('DESCRIPTION:'.length).trim()
      )
      root.children.push({
        type: 'Description',
        value: desc,
        attributes: {},
        children: [],
      })
      currentIndex++
    }
    // VERSION:
    else if (line.startsWith('VERSION:')) {
      const version = line.substring('VERSION:'.length).trim()
      root.children.push({
        type: 'Version',
        value: version,
        attributes: {},
        children: [],
      })
      currentIndex++
    }
    // AUTHOR:
    else if (line.startsWith('AUTHOR:')) {
      const author = extractQuotedValue(
        line.substring('AUTHOR:'.length).trim()
      )
      root.children.push({
        type: 'Author',
        value: author,
        attributes: {},
        children: [],
      })
      currentIndex++
    }
    // ITEMS section
    else if (line.startsWith('ITEMS:')) {
      const itemsNode = parseItemsSection(lines, currentIndex)
      root.children.push(itemsNode.node)
      currentIndex = itemsNode.nextIndex
    }
    // COMPATIBILITY section
    else if (line.startsWith('COMPATIBILITY:')) {
      const compatNode = parseCompatibilitySection(lines, currentIndex)
      root.children.push(compatNode.node)
      currentIndex = compatNode.nextIndex
    }
    // LOCALIZATION section
    else if (line.startsWith('LOCALIZATION:')) {
      const locNode = parseLocalizationSection(lines, currentIndex)
      root.children.push(locNode.node)
      currentIndex = locNode.nextIndex
    } else {
      currentIndex++
    }
  }

  return root
}

/**
 * Parse ITEMS: ... section
 */
function parseItemsSection(
  lines: string[],
  startIndex: number
): { node: ASTNode; nextIndex: number } {
  const itemsNode: ASTNode = {
    type: 'ClothingItems',
    attributes: {},
    children: [],
  }

  let index = startIndex + 1

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    // Check if we're still in the items section
    if (trimmed && !line.startsWith('  ') && line.trim()) {
      break // End of section
    }

    if (trimmed.startsWith('ITEM:')) {
      const itemBlock = parseItemBlock(lines, index)
      itemsNode.children.push(itemBlock.node)
      index = itemBlock.nextIndex
    } else {
      index++
    }
  }

  return { node: itemsNode, nextIndex: index }
}

/**
 * Parse a single ITEM block
 */
function parseItemBlock(
  lines: string[],
  startIndex: number
): { node: ASTNode; nextIndex: number } {
  const itemNode: ASTNode = {
    type: 'Item',
    attributes: {},
    children: [],
  }

  let index = startIndex + 1
  const baseIndent = getIndentLevel(lines[startIndex])

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index++
      continue
    }

    const lineIndent = getIndentLevel(line)

    // Stop if we've dedented
    if (lineIndent <= baseIndent && trimmed) {
      break
    }

    // Parse field: value pairs
    if (trimmed.includes(':') && !trimmed.startsWith('-')) {
      const [key, value] = trimmed.split(':', 2)
      itemNode.children.push({
        type: key.trim(),
        value: extractQuotedValue(value.trim()),
        attributes: {},
        children: [],
      })
    }
    // Parse variations list
    else if (trimmed.startsWith('variations:')) {
      const variationsNode = parseVariations(lines, index)
      itemNode.children.push(variationsNode.node)
      index = variationsNode.nextIndex - 1
    }

    index++
  }

  return { node: itemNode, nextIndex: index }
}

/**
 * Parse variations section
 */
function parseVariations(
  lines: string[],
  startIndex: number
): { node: ASTNode; nextIndex: number } {
  const variationsNode: ASTNode = {
    type: 'Variations',
    attributes: {},
    children: [],
  }

  let index = startIndex + 1

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (trimmed.startsWith('- ')) {
      const [colorName, colorValue] = trimmed
        .substring(2)
        .split(':')
        .map((s) => s.trim())
      variationsNode.children.push({
        type: 'Color',
        value: colorValue,
        attributes: { name: colorName },
        children: [],
      })
      index++
    } else if (!trimmed || !line.startsWith('  ')) {
      break
    } else {
      index++
    }
  }

  return { node: variationsNode, nextIndex: index }
}

/**
 * Parse COMPATIBILITY: section
 */
function parseCompatibilitySection(
  lines: string[],
  startIndex: number
): { node: ASTNode; nextIndex: number } {
  const compatNode: ASTNode = {
    type: 'Compatibility',
    attributes: {},
    children: [],
  }

  let index = startIndex + 1

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index++
      continue
    }

    if (!line.startsWith('  ')) {
      break
    }

    if (trimmed.startsWith('- [')) {
      const match = trimmed.match(/- \[(\w+)\]\s*(.+)/)
      if (match) {
        compatNode.children.push({
          type: 'Requirement',
          value: match[2],
          attributes: { type: match[1] },
          children: [],
        })
      }
    }

    index++
  }

  return { node: compatNode, nextIndex: index }
}

/**
 * Parse LOCALIZATION: section
 */
function parseLocalizationSection(
  lines: string[],
  startIndex: number
): { node: ASTNode; nextIndex: number } {
  const locNode: ASTNode = {
    type: 'Localization',
    attributes: {},
    children: [],
  }

  let index = startIndex + 1

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index++
      continue
    }

    if (!line.startsWith('  ')) {
      break
    }

    if (trimmed.includes(':')) {
      const [lang, value] = trimmed.split(':', 2)
      locNode.children.push({
        type: lang.trim(),
        value: extractQuotedValue(value.trim()),
        attributes: {},
        children: [],
      })
    }

    index++
  }

  return { node: locNode, nextIndex: index }
}

/**
 * HELPER: Extract value from quoted string
 * "hello world" → hello world
 * hello → hello
 */
function extractQuotedValue(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.substring(1, value.length - 1)
  }
  return value
}

/**
 * HELPER: Get indentation level (count leading spaces / 2)
 */
function getIndentLevel(line: string): number {
  const match = line.match(/^(\s*)/)
  return (match?.[1]?.length || 0) / 2
}

/**
 * EXPORT: Compile JPE to XML string
 *
 * This chains: JPE → AST → XML
 */
export function jpeToXml(jpeText: string): CompilationResult {
  try {
    // First parse JPE to AST
    const astResult = jpeToAst(jpeText)
    if (!astResult.success || !astResult.ast) {
      return { success: false, error: astResult.error }
    }

    // Then convert AST to XML
    const xml = astToXml(astResult.ast)

    return {
      success: true,
      xml,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Compilation failed',
    }
  }
}

/**
 * Convert AST to XML string
 */
function astToXml(node: ASTNode, indent: number = 0): string {
  const indentStr = '  '.repeat(indent)
  const nextIndentStr = '  '.repeat(indent + 1)

  const attrs = Object.entries(node.attributes)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join('')

  let xml = `${indentStr}<${node.type}${attrs}>`

  if (node.value) {
    xml += node.value
  } else if (node.children.length > 0) {
    xml += '\n'
    for (const child of node.children) {
      xml += astToXml(child, indent + 1)
    }
    xml += indentStr
  }

  xml += `</${node.type}>\n`

  return xml
}
