/**
 * XMLCompiler converts JPE format back to valid XML
 * Handles round-trip compilation with proper formatting
 */

import type { Diagnostic } from '@/types/index'
import type { JPEModule, JPESection } from '@/engine/parsers/XMLParser'

export class XMLCompiler {
  /**
   * Compile JPE module back to XML string
   */
  static compileToXML(jpeModule: JPEModule, prettyPrint: boolean = true): {
    success: boolean
    output?: string
    errors: Diagnostic[]
  } {
    try {
      // Build XML declaration
      let xml = '<?xml version="1.0" encoding="utf-8"?>\n'

      // Build root element with metadata attributes
      const attributes = this.buildAttributeString(jpeModule.metadata)
      const openTag = attributes ? `<${jpeModule.type} ${attributes}>` : `<${jpeModule.type}>`
      xml += openTag

      if (prettyPrint) {
        xml += '\n'
      }

      // Add sections as child elements
      for (const section of jpeModule.sections) {
        const sectionXml = this.compileSectionToXML(section, prettyPrint, 1)
        xml += sectionXml
      }

      // Close root element
      xml += `</${jpeModule.type}>\n`

      return {
        success: true,
        output: xml,
        errors: [],
      }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            id: 'xml-compile-001',
            fileId: '',
            line: 0,
            column: 0,
            severity: 'error',
            message: `Compilation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'COMPILE001',
          },
        ],
      }
    }
  }

  /**
   * Compile a single JPE section to XML
   */
  private static compileSectionToXML(
    section: JPESection,
    prettyPrint: boolean,
    indentLevel: number
  ): string {
    const indent = prettyPrint ? '  '.repeat(indentLevel) : ''
    const newline = prettyPrint ? '\n' : ''

    let xml = ''

    // Parse section content (could be plain text or nested elements)
    if (section.content.startsWith('<')) {
      // Already XML content
      xml += indent + section.content + newline
    } else {
      // Wrap text content in section element
      xml += `${indent}<${section.type}>${newline}`
      xml += `${indent}  ${section.content}${newline}`
      xml += `${indent}</${section.type}>${newline}`
    }

    return xml
  }

  /**
   * Build an XML attribute string from metadata object
   */
  private static buildAttributeString(metadata: Record<string, any>): string {
    const attributes: string[] = []

    for (const [key, value] of Object.entries(metadata)) {
      if (value !== undefined && value !== null && typeof value !== 'object') {
        const escapedValue = this.escapeAttributeValue(String(value))
        attributes.push(`${key}="${escapedValue}"`)
      }
    }

    return attributes.join(' ')
  }

  /**
   * Escape special characters in XML attribute values
   */
  private static escapeAttributeValue(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  /**
   * Compile XML from raw parsed elements
   */
  static compileFromParsedXML(elements: any[], prettyPrint: boolean = true): string {
    let xml = '<?xml version="1.0" encoding="utf-8"?>\n'

    for (const element of elements) {
      xml += this.elementToXMLString(element, prettyPrint, 0)
    }

    return xml
  }

  /**
   * Convert a single element to XML string
   */
  private static elementToXMLString(
    element: any,
    prettyPrint: boolean,
    indentLevel: number
  ): string {
    const indent = prettyPrint ? '  '.repeat(indentLevel) : ''
    const newline = prettyPrint ? '\n' : ''

    if (element.tag === '#text') {
      return element.text || ''
    }

    const attributes = this.buildAttributeString(element.attributes)
    const attrStr = attributes ? ` ${attributes}` : ''

    if (!element.children || element.children.length === 0) {
      return `${indent}<${element.tag}${attrStr} />${newline}`
    }

    let xml = `${indent}<${element.tag}${attrStr}>${newline}`

    for (const child of element.children) {
      xml += this.elementToXMLString(child, prettyPrint, indentLevel + 1)
    }

    xml += `${indent}</${element.tag}>${newline}`

    return xml
  }

  /**
   * Minify XML (remove unnecessary whitespace)
   */
  static minifyXML(xml: string): string {
    return xml
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim()
  }

  /**
   * Pretty print XML with consistent indentation
   */
  static prettifyXML(xml: string, indentSize: number = 2): string {
    const indent = ' '.repeat(indentSize)
    let formatted = ''
    let indentLevel = 0

    const tagRegex = /(<[^>]+>)/g
    let lastIndex = 0
    let match

    while ((match = tagRegex.exec(xml)) !== null) {
      // Add text before tag
      const beforeTag = xml.substring(lastIndex, match.index).trim()
      if (beforeTag) {
        formatted += indent.repeat(indentLevel) + beforeTag + '\n'
      }

      // Process tag
      const tag = match[1]
      const isClosing = tag.startsWith('</')
      const isSelfClosing = tag.endsWith('/>')
      const isDeclaration = tag.startsWith('<?')

      if (!isDeclaration) {
        if (isClosing) {
          indentLevel = Math.max(0, indentLevel - 1)
        }
        formatted += indent.repeat(indentLevel) + tag + '\n'
        if (!isClosing && !isSelfClosing) {
          indentLevel++
        }
      } else {
        formatted += tag + '\n'
      }

      lastIndex = match.index + tag.length
    }

    // Add remaining text
    const remaining = xml.substring(lastIndex).trim()
    if (remaining) {
      formatted += indent.repeat(indentLevel) + remaining
    }

    return formatted.trim()
  }
}
