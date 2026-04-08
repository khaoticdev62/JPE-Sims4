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
    const rootTag = metadata.type || 'Instance'

    // 1. Partition Metadata into True Attributes vs Flattened Children
    const rootAttributes: Record<string, string> = {}
    const rootChildren: XMLElement[] = []

    for (const [key, value] of Object.entries(metadata)) {
      if (key === 'type' || key === 'content') continue

      if (this.isMetadataAttribute(key)) {
        // Map common metadata names to XML attributes (class -> c, id -> i, etc.)
        const attrKey = this.mapMetadataToAttribute(key)
        rootAttributes[attrKey] = String(value)
      } else {
        // Smart Key: Flattened Sims 4 tuning <T n="key">value</T> at root
        rootChildren.push({
          tag: 'T',
          attributes: { n: this.unSanitizeKey(key) },
          children: [],
          text: String(value)
        })
      }
    }

    // Create root element
    const rootElement: XMLElement = {
      tag: rootTag,
      attributes: rootAttributes,
      children: rootChildren,
      text: metadata.content ? String(metadata.content) : undefined,
    }

    // Convert remaining content to children
    if (astNode.children) {
      for (const child of astNode.children) {
        if (child.type === 'Section' && child.name !== 'Metadata') {
          // Standard nested sections
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
   * Maps JPE Metadata keys back to Sims 4 XML attributes
   */
  private static mapMetadataToAttribute(key: string): string {
    const fieldMap: Record<string, string> = {
      class: 'c',
      id: 'i',
      module: 'm',
      name: 'n',
      instance: 's',
      n: 'n',
      t: 't',
      s: 's',
      c: 'c',
      i: 'i',
      m: 'm'
    }
    return fieldMap[key] || key
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

    // Determine Tag and initial attributes based on JPE Keywords
    const { tag, attributes } = this.rehydrateTag(section.name)

    const element: XMLElement = {
      tag,
      attributes,
      children: [],
      text: undefined,
    }

    if (!section.children) {
      return element
    }

    // Process section contents
    for (const child of section.children) {
      if (child.type === 'Assignment' && child.key) {
        const value = child.value !== undefined ? String(child.value) : ''
        if (child.key === 'content') {
          // Text content
          element.text = value
        } else if (this.isMetadataAttribute(child.key)) {
          // Known metadata attribute
          element.attributes[child.key] = value
        } else {
          // Smart Key: Flattened Sims 4 tuning <T n="key">value</T>
          element.children.push({
            tag: 'T',
            attributes: { n: child.key },
            children: [],
            text: value
          })
        }
      } else if (child.type === 'Section') {
        // Nested element
        const nestedElement = this.sectionToElement(child)
        if (nestedElement) {
          element.children.push(nestedElement)
        }
      } else if (child.type === 'Comment') {
        continue
      }
    }

    return element
  }

  /**
   * Identifies JPE Keywords and maps them back to Sims 4 XML tags/attributes
   */
  private static rehydrateTag(sectionName: string): { tag: string, attributes: Record<string, string> } {
    const mappings: Record<string, { tag: string, attributes: Record<string, string> }> = {
      'ONLY_IF': { tag: 'L', attributes: { n: 'tests' } },
      'DO': { tag: 'U', attributes: { n: 'outcome' } },
      'WHEN': { tag: 'V', attributes: { n: 'enabled' } },
      'Interactions': { tag: 'L', attributes: { n: 'interactions' } },
      'Buffs': { tag: 'L', attributes: { n: 'buffs' } }
    }

    if (mappings[sectionName]) {
      return { ...mappings[sectionName] }
    }

    // --- Smart Container Heuristic ---
    // If the section name starts with an uppercase letter (Title_Case) 
    // and it's not a known primitive tag, it's likely a named unit/instance.
    // Sims 4 Tunings: <U n="name"> or <V n="name"> or <L n="name">
    // Default to Unit (U) which is the most common container.
    if (/^[A-Z]/.test(sectionName) && !['Value', 'Unit', 'Variant', 'List'].includes(sectionName)) {
      const lowerName = sectionName.toLowerCase()
      // If it ends with 's' it's often a List (L)
      if (lowerName.endsWith('s')) {
        return {
          tag: 'L',
          attributes: { n: this.unSanitizeKey(lowerName) }
        }
      }
      return {
        tag: 'U',
        attributes: { n: this.unSanitizeKey(lowerName) }
      }
    }

    // Default: Convert Title_Case section name to camelCase tag
    return {
      tag: this.sectionNameToTag(sectionName),
      attributes: {}
    }
  }

  /**
   * Checks if a key should be treated as a standard XML attribute
   */
  private static isMetadataAttribute(key: string): boolean {
    const metadataFields = [
      'c', 'i', 'm', 'n', 't', 's',
      'class', 'id', 'module', 'type', 'content', 'name', 'instance'
    ]
    return metadataFields.includes(key)
  }

  /**
   * Convert JPE section name back to XML tag
   */
  private static sectionNameToTag(sectionName: string): string {
    // Specialized Tag Restoration
    if (sectionName === 'Value') return 'T'
    if (sectionName === 'Unit') return 'U'
    if (sectionName === 'Variant') return 'V'
    if (sectionName === 'List') return 'L'

    // Convert Title_Case back to camelCase
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
   * Reconstruct original key (reverse of sanitizeKey)
   */
  private static unSanitizeKey(key: string): string {
    return key
  }
}

/**
 * Quick helper function to translate JPE to XML
 */
export function jpeToXml(astNode: ASTNode): XMLElement | null {
  return JPEToXMLTranslator.translate(astNode)
}
