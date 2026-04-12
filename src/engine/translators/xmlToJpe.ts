/**
 * XML to JPE Translator
 *
 * Converts XML AST (XMLElement) to JPE (Just Plain English) string format.
 * Transforms hierarchical XML structure into readable JPE sections.
 *
 * Process:
 * Input XMLElement:
 * {
 *   tag: 'Instance',
 *   attributes: { c: 'Trait', i: '123456' },
 *   children: [...]
 * }
 *
 * Output JPE string:
 * [Metadata]
 * type = "Trait"
 * id = "123456"
 *
 * [Instance]
 * # content...
 */

import type { XMLElement } from '@/engine/parsers/XMLParser'

/**
 * Converts XML AST to JPE string format
 */
export class XMLToJPETranslator {
  /**
   * Translate XMLElement AST to JPE string
   * @param xmlElement Root XML element
   * @returns JPE string representation
   */
  static translate(xmlElement: XMLElement): string {
    const sections: string[] = []

    // Create metadata section from root element attributes
    const metadataSection = this.createMetadataSection(xmlElement)
    if (metadataSection) {
      sections.push(metadataSection)
    }

    // Convert XML structure to JPE sections
    const contentSections = this.convertElementToSections(xmlElement, 0)
    sections.push(...contentSections)

    // Join sections with blank lines
    return sections.filter(s => s.trim().length > 0).join('\n\n')
  }

  /**
   * Create metadata section from root element attributes
   */
  private static createMetadataSection(element: XMLElement): string {
    const metadata = [
      '[Metadata]',
      `type = "${element.tag}"`,
    ]

    // Map common DBPF Tuning attributes
    if (element.attributes.s) {
      metadata.push(`instance = "0x${this.escapeString(element.attributes.s)}"`)
    }
    if (element.attributes.c) {
      metadata.push(`class = "${this.escapeString(element.attributes.c)}"`)
    }
    if (element.attributes.i) {
      metadata.push(`id = "${this.escapeString(element.attributes.i)}"`)
    }
    if (element.attributes.m) {
      metadata.push(`module = "${this.escapeString(element.attributes.m)}"`)
    }
    if (element.attributes.n) {
      metadata.push(`name = "${this.escapeString(element.attributes.n)}"`)
    }

    // Add any other attributes to ensure parity
    for (const [key, value] of Object.entries(element.attributes)) {
      if (!['s', 'c', 'i', 'm', 'n'].includes(key) && value) {
        const sanitizedKey = this.sanitizeKey(key)
        metadata.push(`${sanitizedKey} = "${this.escapeString(value)}"`)
      }
    }

    // Add root text content if present
    if (element.text && element.text.trim()) {
      metadata.push(`content = "${this.escapeString(element.text.trim())}"`)
    }

    return metadata.join('\n')
  }

  /**
   * Convert XML element to JPE sections
   */
  private static convertElementToSections(element: XMLElement, depth: number): string[] {
    const sections: string[] = []

    // Skip root element for section, but process its children as top-level sections
    if (depth === 0) {
      for (const child of element.children) {
        sections.push(...this.convertElementToSections(child, 1))
      }
      return sections
    }

    const indent = '  '.repeat(depth - 1)
    const keyword = this.rehydrateKeyword(element)
    const n = element.attributes.n

    // --- Semantic Flattening for <T> tags (Values) ---
    if (element.tag === 'T' && n && element.children.length === 0) {
      const value = element.text?.trim() || ''
      return [`${indent}${this.sanitizeKey(n)} = "${this.escapeString(value)}"`]
    }

    // --- Smart Section Naming ---
    // Use 'n' attribute as the section name if available, prioritized by JPE Keywords
    const sectionName = keyword || (n ? this.sanitizeKey(n) : this.getSectionName(element.tag))
    const sectionHeader = `[${sectionName}]`
    
    const assignments: string[] = []
    
    // Add element attributes as assignments
    for (const [key, value] of Object.entries(element.attributes)) {
      // Skip 'n' if it's already used as the section name or rehydrated
      if ((keyword || n) && key === 'n') continue
      assignments.push(`${indent}  ${this.sanitizeKey(key)} = "${this.escapeString(value)}"`)
    }

    // Add text content
    if (element.text && element.text.trim()) {
      assignments.push(`${indent}  content = "${this.escapeString(element.text.trim())}"`)
    }

    // Recursively process children
    const childOutput: string[] = []
    for (const child of element.children) {
      const result = this.convertElementToSections(child, depth + 1)
      childOutput.push(...result)
    }

    // Final Assembly
    const output = [`${indent}${sectionHeader}`]
    output.push(...assignments)
    output.push(...childOutput)

    return output
  }

  /**
   * Recognizes Sims 4 XML patterns and "rehydrates" them into JPE keywords
   */
  private static rehydrateKeyword(element: XMLElement): string | null {
    const n = element.attributes.n
    if (!n) return null

    const lowerN = n.toLowerCase()
    
    if (lowerN === 'tests' || lowerN === 'test_globals' || lowerN === 'at_least_one') return 'ONLY_IF'
    if (lowerN === 'outcome' || lowerN === 'outcomes') return 'DO'
    if (lowerN === 'enabled') return 'WHEN'
    if (lowerN === 'interactions') return 'Interactions'
    if (lowerN === 'buffs') return 'Buffs'
    if (lowerN === 'basic_extras') return 'effects'

    return null
  }

  /**
   * Generate section name from element tag
   */
  private static getSectionName(tag: string): string {
    // Specialized Tag Conversions
    if (tag === 'T') return 'Value'
    if (tag === 'U') return 'Unit'
    if (tag === 'V') return 'Variant'
    if (tag === 'L') return 'List'

    // Convert camelCase or snake_case to Title Case
    return tag
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .split(/[_-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('_')
  }

  /**
   * Sanitize key for JPE format (remove invalid characters)
   */
  private static sanitizeKey(key: string): string {
    // JPE identifiers can only contain alphanumeric and underscores
    // Replace any other character (including hyphens and dots) with underscores
    return key.replace(/[^a-zA-Z0-9_]/g, '_')
  }

  /**
   * Escape special characters in string values
   */
  private static escapeString(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t')
      .replace(/\r/g, '\\r')
  }
}

/**
 * Quick helper function to translate XML to JPE
 */
export function xmlToJpe(xmlElement: XMLElement): string {
  return XMLToJPETranslator.translate(xmlElement)
}
