/**
 * XMLParser handles Sims 4 XML tuning file parsing
 * Converts XML to intermediate JPE format
 */

import type { ValidationResult, Diagnostic } from '@types/index'

export interface XMLElement {
  tag: string
  attributes: Record<string, string>
  children: XMLElement[]
  text?: string
}

export interface JPEModule {
  type: string
  id: string
  name?: string
  description?: string
  version?: string
  sections: JPESection[]
  metadata: Record<string, any>
}

export interface JPESection {
  type: 'when' | 'do' | 'condition' | 'localization'
  content: string
}

export class XMLParser {
  /**
   * Parse XML string to JSX elements
   */
  static parseXML(content: string): XMLElement | null {
    try {
      const trimmed = content.trim()
      if (!trimmed.startsWith('<?xml') && !trimmed.startsWith('<')) {
        return null
      }

      // Simple XML parser for Sims 4 tuning files
      const root = this.parseElement(trimmed, 0).element
      return root
    } catch (error) {
      console.error('XML parse error:', error)
      return null
    }
  }

  /**
   * Parse XML element recursively
   */
  private static parseElement(
    xml: string,
    startIndex: number
  ): { element: XMLElement | null; endIndex: number } {
    // Find opening tag
    const openMatch = xml.substring(startIndex).match(/^<([a-zA-Z0-9_:.-]+)([^>]*)>/)
    if (!openMatch) {
      return { element: null, endIndex: startIndex }
    }

    const tagName = openMatch[1]
    const attributesStr = openMatch[2]
    const tagStart = startIndex + openMatch[0].length

    // Parse attributes
    const attributes = this.parseAttributes(attributesStr)

    // Check for self-closing tag
    if (attributesStr.trim().endsWith('/')) {
      return {
        element: {
          tag: tagName,
          attributes,
          children: [],
        },
        endIndex: tagStart,
      }
    }

    const children: XMLElement[] = []
    let currentIndex = tagStart
    let text = ''

    // Parse children
    while (currentIndex < xml.length) {
      const remainingXml = xml.substring(currentIndex)

      // Check for closing tag
      const closeMatch = remainingXml.match(new RegExp(`^</${tagName}>`))
      if (closeMatch) {
        if (text.trim()) {
          children.push({
            tag: '#text',
            attributes: {},
            children: [],
            text: text.trim(),
          })
        }
        return {
          element: {
            tag: tagName,
            attributes,
            children,
            text: text || undefined,
          },
          endIndex: currentIndex + closeMatch[0].length,
        }
      }

      // Check for child element
      const childMatch = remainingXml.match(/^<([a-zA-Z0-9_:.-]+)/)
      if (childMatch) {
        if (text.trim()) {
          children.push({
            tag: '#text',
            attributes: {},
            children: [],
            text: text.trim(),
          })
          text = ''
        }

        const result = this.parseElement(xml, currentIndex)
        if (result.element) {
          children.push(result.element)
          currentIndex = result.endIndex
        } else {
          break
        }
      } else {
        // Collect text content
        const nextTagIndex = remainingXml.indexOf('<')
        if (nextTagIndex === -1) {
          text += remainingXml
          break
        }
        text += remainingXml.substring(0, nextTagIndex)
        currentIndex += nextTagIndex
      }
    }

    return {
      element: {
        tag: tagName,
        attributes,
        children,
        text: text || undefined,
      },
      endIndex: currentIndex,
    }
  }

  /**
   * Parse XML attributes from attribute string
   */
  private static parseAttributes(
    attributesStr: string
  ): Record<string, string> {
    const attributes: Record<string, string> = {}

    // Match attribute="value" or attribute='value'
    const attrRegex = /([a-zA-Z_:-]+)=["']([^"']*)["']/g
    let match

    while ((match = attrRegex.exec(attributesStr)) !== null) {
      attributes[match[1]] = match[2]
    }

    return attributes
  }

  /**
   * Convert parsed XML to JPE format
   */
  static convertToJPE(xmlElement: XMLElement): JPEModule {
    const module: JPEModule = {
      type: xmlElement.tag,
      id: xmlElement.attributes['id'] || `${xmlElement.tag}-${Date.now()}`,
      name: xmlElement.attributes['name'],
      description: xmlElement.attributes['desc'] || xmlElement.attributes['description'],
      version: xmlElement.attributes['version'] || '1.0.0',
      sections: [],
      metadata: xmlElement.attributes,
    }

    // Extract sections from children
    for (const child of xmlElement.children) {
      if (child.tag === '#text') continue

      const section: JPESection = {
        type: (child.tag as any) || 'condition',
        content: this.elementToString(child),
      }

      module.sections.push(section)
    }

    return module
  }

  /**
   * Convert element back to readable string
   */
  private static elementToString(element: XMLElement): string {
    if (element.tag === '#text') {
      return element.text || ''
    }

    const attrs = Object.entries(element.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')

    const attrStr = attrs ? ` ${attrs}` : ''
    const childrenStr = element.children
      .map((c) => this.elementToString(c))
      .join('')

    return `<${element.tag}${attrStr}>${childrenStr}</${element.tag}>`
  }

  /**
   * Validate XML structure
   */
  static validate(content: string): ValidationResult {
    const diagnostics: Diagnostic[] = []
    const warnings: string[] = []

    // Check for opening/closing tags
    const openTags = content.match(/<[^/][^>]*>/g) || []
    const closeTags = content.match(/<\/[^>]+>/g) || []

    if (openTags.length !== closeTags.length) {
      diagnostics.push({
        id: `xml-001`,
        fileId: '',
        line: 0,
        column: 0,
        severity: 'error',
        message: 'XML has mismatched tags',
        code: 'XML001',
        suggestion: 'Check that all opening tags have closing tags',
      })
    }

    // Check for XML declaration
    if (!content.trim().startsWith('<?xml')) {
      warnings.push('No XML declaration found. Consider starting with <?xml version="1.0"?>')
    }

    // Check for common issues
    if (content.includes('&') && !content.includes('&amp;')) {
      warnings.push('Unescaped & character found. Use &amp; instead.')
    }

    return {
      valid: diagnostics.length === 0,
      diagnostics,
      warnings,
    }
  }
}
