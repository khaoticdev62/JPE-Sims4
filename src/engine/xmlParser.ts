/**
 * XML PARSER
 *
 * This module takes raw XML text and converts it to an AST
 * (Abstract Syntax Tree) - a tree structure representing the data.
 *
 * LEARNING CONCEPT: Parsing
 * Parsing is breaking text into pieces and understanding its structure
 *
 * Example:
 * Input:  "<Name>My Mod</Name>"
 * Output: { type: "Name", value: "My Mod", children: [] }
 *
 * This is how we move from "just text" to "structured data we can use"
 */

import { ASTNode, ParseResult } from './types'

/**
 * MAIN FUNCTION: Parse XML string to AST
 *
 * This is the entry point. Call this with XML text, get back a tree.
 */
export function parseXML(xmlContent: string): ParseResult {
  try {
    // Clean up the XML (remove extra whitespace between tags)
    const cleaned = xmlContent.trim()

    // Check for XML declaration (<?xml ... ?>)
    // Real Sims 4 files always have this, but it's not part of the tree
    let startIndex = 0
    if (cleaned.startsWith('<?xml')) {
      const endIndex = cleaned.indexOf('?>')
      if (endIndex !== -1) {
        startIndex = endIndex + 2
      }
    }

    // Parse the content after the XML declaration
    const content = cleaned.substring(startIndex).trim()

    // Use our parser to create the tree
    const { node, consumed } = parseNode(content, 0)

    // Make sure we consumed all the content
    // If there's leftover text, something is wrong
    const remaining = content.substring(consumed).trim()
    if (remaining.length > 0 && !remaining.match(/^<\/\w+>$/)) {
      return {
        success: false,
        error: `Extra content after closing tag: "${remaining.substring(0, 50)}..."`,
      }
    }

    return {
      success: true,
      ast: node,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
    }
  }
}

/**
 * INTERNAL FUNCTION: Parse a single node and its children
 *
 * This is the recursive workhorse. It:
 * 1. Reads the opening tag
 * 2. Reads any children (by calling itself recursively)
 * 3. Reads the closing tag
 * 4. Returns the complete node
 *
 * LEARNING CONCEPT: Recursion
 * A recursive function calls itself. Here, parseNode calls parseNode for children.
 * This naturally handles nested structures (tags inside tags inside tags...)
 */
function parseNode(
  content: string,
  startPos: number
): { node: ASTNode; consumed: number } {
  let pos = startPos

  // Skip whitespace
  while (pos < content.length && /\s/.test(content[pos])) {
    pos++
  }

  // STEP 1: Read opening tag
  if (content[pos] !== '<') {
    throw new Error(
      `Expected "<" at position ${pos}, got "${content[pos]}"  at "${content.substring(pos, pos + 20)}"`
    )
  }

  // Find the end of the opening tag
  const openingTagEnd = content.indexOf('>', pos)
  if (openingTagEnd === -1) {
    throw new Error(
      `Opening tag not closed at position ${pos}: "${content.substring(pos, pos + 50)}..."`
    )
  }

  // Extract the tag content (without < and >)
  const tagContent = content.substring(pos + 1, openingTagEnd)

  // Parse tag attributes (e.g., id="123" name="test")
  // For v0.1, we'll keep this simple
  const attributes = parseAttributes(tagContent)

  // Extract the tag name (first word before space)
  const tagNameMatch = tagContent.match(/^\w+/)
  if (!tagNameMatch) {
    throw new Error(
      `Invalid tag name at position ${pos}: "${tagContent.substring(0, 30)}..."`
    )
  }

  const tagName = tagNameMatch[0]
  pos = openingTagEnd + 1

  // Check for self-closing tag (e.g., <Tag/>)
  // These have no children and close immediately
  if (tagContent.trim().endsWith('/')) {
    return {
      node: {
        type: tagName,
        value: '',
        attributes,
        children: [],
      },
      consumed: pos - startPos,
    }
  }

  // STEP 2: Read children and text content
  const children: ASTNode[] = []
  let textContent = ''
  let childrenStarted = false

  while (pos < content.length) {
    // Skip whitespace
    const whitespaceStart = pos
    while (pos < content.length && /\s/.test(content[pos])) {
      pos++
    }

    // Check for closing tag
    if (content[pos] === '<' && content[pos + 1] === '/') {
      const closingTagEnd = content.indexOf('>', pos)
      if (closingTagEnd === -1) {
        throw new Error(
          `Closing tag not finished at position ${pos}: "${content.substring(pos, pos + 50)}..."`
        )
      }

      const closingTagName = content.substring(pos + 2, closingTagEnd).trim()

      if (closingTagName !== tagName) {
        throw new Error(
          `Mismatched closing tag. Expected </${tagName}>, got </${closingTagName}> at position ${pos}`
        )
      }

      // STEP 3: Return the complete node
      // Decide: is it just text, or does it have child elements?
      const finalNode: ASTNode = {
        type: tagName,
        value: textContent.trim() || undefined,
        attributes,
        children,
      }

      return {
        node: finalNode,
        consumed: closingTagEnd + 1 - startPos,
      }
    }

    // Otherwise, we expect a child tag
    if (content[pos] === '<') {
      childrenStarted = true

      // Save any text that came before this tag
      if (textContent.trim()) {
        // For now, we drop text before child elements
        // In a more complex parser, we'd handle mixed content
        textContent = ''
      }

      // Parse the child node
      const { node: childNode, consumed: childConsumed } = parseNode(
        content,
        pos
      )
      children.push(childNode)
      pos += childConsumed
    } else {
      // Not a tag, so it's text content
      if (childrenStarted) {
        throw new Error(
          `Text after child elements not allowed at position ${pos}: "${content.substring(pos, pos + 30)}..."`
        )
      }

      // Read text until we hit a tag
      const nextTag = content.indexOf('<', pos)
      if (nextTag === -1) {
        throw new Error(
          `No closing tag found. Unclosed tag <${tagName}> at position ${startPos}`
        )
      }

      textContent += content.substring(pos, nextTag)
      pos = nextTag
    }
  }

  throw new Error(
    `Unexpected end of file while parsing tag <${tagName}> at position ${startPos}`
  )
}

/**
 * INTERNAL FUNCTION: Parse attributes from a tag
 *
 * Input: 'id="123" name="test"'
 * Output: { id: "123", name: "test" }
 *
 * LEARNING CONCEPT: Regular Expressions
 * Regex is a pattern language for finding text
 * The pattern /(\w+)="([^"]*)"/g finds: word="anything"
 */
function parseAttributes(tagContent: string): Record<string, string> {
  const attributes: Record<string, string> = {}

  // Remove the tag name from the start
  const afterName = tagContent.replace(/^\w+\s*/, '')

  // Find all attribute patterns: name="value"
  // LEARNING: This regex matches:
  // (\w+)     = a word (the attribute name)
  // =          = equals sign
  // "([^"]*)"  = quotes with anything inside (the value)
  // g          = global (find all, not just first)
  const attrRegex = /(\w+)="([^"]*)"/g
  let match

  while ((match = attrRegex.exec(afterName)) !== null) {
    const attrName = match[1]
    const attrValue = match[2]
    attributes[attrName] = attrValue
  }

  return attributes
}

/**
 * HELPER FUNCTION: Pretty-print an AST (for debugging)
 *
 * When you want to see what the parser created, use this.
 * It shows the tree structure in a human-readable way.
 */
export function printAST(node: ASTNode, indent = 0): string {
  const prefix = '  '.repeat(indent)
  const attrs =
    Object.keys(node.attributes).length > 0
      ? ` ${JSON.stringify(node.attributes)}`
      : ''
  const value = node.value ? ` = "${node.value}"` : ''

  let result = `${prefix}<${node.type}${attrs}>${value}\n`

  for (const child of node.children) {
    result += printAST(child, indent + 1)
  }

  result += `${prefix}</${node.type}>\n`

  return result
}

/**
 * HELPER FUNCTION: Find a child by tag name
 *
 * Usage: findChild(node, 'Name') returns the first <Name> child
 */
export function findChild(node: ASTNode, tagName: string): ASTNode | null {
  return node.children.find((child) => child.type === tagName) || null
}

/**
 * HELPER FUNCTION: Find all children by tag name
 *
 * Usage: findChildren(node, 'Item') returns all <Item> children
 */
export function findChildren(node: ASTNode, tagName: string): ASTNode[] {
  return node.children.filter((child) => child.type === tagName)
}

/**
 * HELPER FUNCTION: Get child's text value
 *
 * Usage: getChildValue(node, 'Name') returns text inside <Name>
 */
export function getChildValue(node: ASTNode, tagName: string): string {
  const child = findChild(node, tagName)
  return child?.value || ''
}

/**
 * ============================================================
 * LEARNING SECTION: How to use this parser
 * ============================================================
 *
 * Example usage:
 *
 * ```typescript
 * const xml = `
 *   <?xml version="1.0"?>
 *   <ModPackage>
 *     <Name>My Mod</Name>
 *     <Description>Does things</Description>
 *     <Version>1.0</Version>
 *   </ModPackage>
 * `
 *
 * const result = parseXML(xml)
 * if (result.success) {
 *   console.log(result.ast)
 *   // {
 *   //   type: 'ModPackage',
 *   //   attributes: {},
 *   //   children: [
 *   //     { type: 'Name', value: 'My Mod', children: [] },
 *   //     { type: 'Description', value: 'Does things', children: [] },
 *   //     { type: 'Version', value: '1.0', children: [] }
 *   //   ]
 *   // }
 * } else {
 *   console.error(result.error)
 * }
 *
 * // Now you have an AST (Abstract Syntax Tree)
 * // The next step is to convert this to JPE format
 * ```
 *
 * KEY CONCEPTS:
 * - parseXML() is the main function
 * - parseNode() is internal, called recursively
 * - The result is an AST: a tree of nodes
 * - Each node has: type, value, attributes, children
 * - Helper functions let you navigate the tree easily
 */
