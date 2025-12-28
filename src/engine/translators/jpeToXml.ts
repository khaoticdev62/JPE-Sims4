/**
 * JPE to XML Translator
 *
 * Converts JPE AST (ASTNode from parser) back to XML AST (XMLElement).
 * Reconstructs hierarchical XML structure from readable JPE format.
 *
 * Process:
 * Input JPE AST (ASTNode):
 * {
 *   type: 'Document',
 *   children: [
 *     { type: 'Section', name: 'Metadata', children: [...] },
 *     { type: 'Section', name: 'Instance', children: [...] }
 *   ]
 * }
 *
 * Output XMLElement:
 * {
 *   tag: 'Instance',
 *   attributes: { c: 'Trait', i: '123456' },
 *   children: [...]
 * }
 */

import type { ASTNode } from '@/engine/jpe/parser'
import type { XMLElement } from '@/engine/parsers/XMLParser'

/**
 * Converts JPE AST to XML AST
 */
export class JPEToXMLTranslator {
  /**
   * Translate JPE AST to XMLElement
   * @param astNode JPE AST from parser
   * @returns XMLElement AST
   */
  static translate(astNode: ASTNode): XMLElement | null {
    if (astNode.type !== 'Document') {
      return null
    }

    // Extract metadata section
    const metadataSection = astNode.children?.find(
      (node) => node.type === 'Section' && node.name === 'Metadata'
    ) as ASTNode | undefined

    const metadata = this.extractMetadata(metadataSection)

    // Get root element tag and attributes
    const rootTag = metadata.type || 'Instance'
    const rootAttributes = this.extractAttributes(metadata)

    // Create root element with text content from metadata
    const rootElement: XMLElement = {
      tag: rootTag,
      attributes: rootAttributes,
      children: [],
      text: metadata.content ? String(metadata.content) : undefined,
    }

    // Convert remaining sections to children
    if (astNode.children) {
      for (const child of astNode.children) {
        if (child.type === 'Section' && child.name !== 'Metadata') {
          const childElement = this.sectionToElement(child)
          if (childElement) {
            rootElement.children.push(childElement)
          }
        }
      }
    }

    return rootElement
  }

  /**
   * Extract metadata from metadata section
   */
  private static extractMetadata(section: ASTNode | undefined): Record<string, any> {
    const metadata: Record<string, any> = {}

    if (!section || !section.children) {
      return metadata
    }

    for (const assignment of section.children) {
      if (assignment.type === 'Assignment' && assignment.key) {
        metadata[assignment.key] = assignment.value
      }
    }

    return metadata
  }

  /**
   * Extract XML attributes from metadata
   */
  private static extractAttributes(metadata: Record<string, any>): Record<string, string> {
    const attributes: Record<string, string> = {}

    // Map common metadata fields to XML attributes
    const fieldMap: Record<string, string> = {
      class: 'c',
      id: 'i',
      module: 'm',
    }

    for (const [field, attr] of Object.entries(fieldMap)) {
      if (metadata[field]) {
        attributes[attr] = String(metadata[field])
      }
    }

    // Add any other metadata as attributes
    for (const [key, value] of Object.entries(metadata)) {
      if (!['type', 'class', 'id', 'module'].includes(key) && value !== undefined) {
        attributes[this.unSanitizeKey(key)] = String(value)
      }
    }

    return attributes
  }

  /**
   * Convert JPE section to XML element
   */
  private static sectionToElement(section: ASTNode): XMLElement | null {
    if (section.type !== 'Section' || !section.name) {
      return null
    }

    const element: XMLElement = {
      tag: this.sectionNameToTag(section.name),
      attributes: {},
      children: [],
      text: undefined,
    }

    if (!section.children) {
      return element
    }

    // Process section contents
    for (const child of section.children) {
      if (child.type === 'Assignment') {
        if (child.key === 'content') {
          // Text content
          element.text = String(child.value)
        } else {
          // Attribute
          element.attributes[child.key] = String(child.value)
        }
      } else if (child.type === 'Section') {
        // Nested element
        const nestedElement = this.sectionToElement(child)
        if (nestedElement) {
          element.children.push(nestedElement)
        }
      } else if (child.type === 'Comment') {
        // Skip comments in XML output
        continue
      }
    }

    return element
  }

  /**
   * Convert JPE section name back to XML tag
   */
  private static sectionNameToTag(sectionName: string): string {
    // Convert Title_Case or Title-Case back to camelCase
    return sectionName
      .split(/[_-]/)
      .map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toLowerCase() + word.slice(1)
        }
        return word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join('')
  }

  /**
   * Reverse of sanitizeKey - reconstruct original key
   */
  private static unSanitizeKey(key: string): string {
    // This is a simple reverse - in practice, we may lose some information
    return key
  }
}

/**
 * Quick helper function to translate JPE to XML
 */
export function jpeToXml(astNode: ASTNode): XMLElement | null {
  return JPEToXMLTranslator.translate(astNode)
}
