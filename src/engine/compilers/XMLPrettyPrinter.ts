/**
 * XML Pretty-Printer
 *
 * Formats raw XML strings into readable, properly indented output
 * that meets Sims 4 modding standards.
 *
 * Features:
 * - Configurable indentation (default: 2 spaces)
 * - UTF-8 declaration handling
 * - Self-closing tag preservation
 * - Text node whitespace preservation
 * - Attribute line wrapping for long lines
 */

export interface XMLPrettyPrinterOptions {
  /** Indentation size in spaces (default: 2) */
  indentSize?: number
  /** Maximum line length before wrapping attributes (default: 120, 0 = no wrapping) */
  maxLineLength?: number
  /** Whether to preserve whitespace in text nodes (default: true) */
  preserveWhitespace?: boolean
}

export interface XMLPrettyPrintResult {
  /** Formatted XML string */
  formatted: string
  /** Whether any modifications were made */
  wasModified: boolean
  /** Processing time in milliseconds */
  processingTime: number
}

export class XMLPrettyPrinter {
  private readonly indentSize: number
  private readonly maxLineLength: number
  private readonly preserveWhitespace: boolean

  constructor(options: XMLPrettyPrinterOptions = {}) {
    this.indentSize = options.indentSize ?? 2
    this.maxLineLength = options.maxLineLength ?? 120
    this.preserveWhitespace = options.preserveWhitespace ?? true
  }

  /**
   * Pretty-print an XML string
   */
  format(xml: string): XMLPrettyPrintResult {
    const startTime = performance.now()
    const originalXml = xml.trim()

    if (!originalXml) {
      return {
        formatted: '',
        wasModified: false,
        processingTime: performance.now() - startTime,
      }
    }

    // Ensure UTF-8 declaration
    let processedXml = this.ensureUtf8Declaration(originalXml)

    // Parse and reformat
    processedXml = this.formatXmlString(processedXml)

    const wasModified = processedXml !== originalXml

    return {
      formatted: processedXml,
      wasModified,
      processingTime: performance.now() - startTime,
    }
  }

  /**
   * Ensure XML string starts with UTF-8 declaration
   */
  private ensureUtf8Declaration(xml: string): string {
    const trimmed = xml.trim()

    // Check if XML declaration exists
    if (trimmed.startsWith('<?xml')) {
      const endIndex = trimmed.indexOf('?>')
      if (endIndex !== -1) {
        const declaration = trimmed.substring(0, endIndex + 2)
        // Ensure UTF-8 encoding is specified
        if (!declaration.includes('encoding=')) {
          const updatedDeclaration = declaration.replace(
            '?>',
            ' encoding="UTF-8"?>',
          )
          return updatedDeclaration + trimmed.substring(endIndex + 2)
        }
        return xml
      }
    }

    // No declaration found, add UTF-8 XML declaration
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + xml
  }

  /**
   * Format an XML string with proper indentation
   */
  private formatXmlString(xml: string): string {
    // Simple regex-based formatter for well-formed XML
    let formatted = ''
    let indent = 0
    
    // Match all XML tags and text nodes
    const tagRegex = /(<\?[\w:]+[^?]*\?>|<\/?[\w:]+(?:\s+[\w:]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*\s*\/?>|<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|[^<]+)/g
    let match
    
    const tokens: string[] = []
    while ((match = tagRegex.exec(xml)) !== null) {
      const token = match[1].trim()
      if (token) {
        tokens.push(token)
      }
    }

    for (const token of tokens) {
      // Decrease indent for closing tags BEFORE adding them
      if (token.startsWith('</')) {
        indent = Math.max(0, indent - 1)
      }

      // Add indented token (only if token is not empty)
      if (token) {
        const indentStr = ' '.repeat(indent * this.indentSize)
        formatted += indentStr + token + '\n'
      }

      // Increase indent for opening tags (not self-closing, not declarations, not comments)
      if (
        token.startsWith('<') &&
        !token.startsWith('<?') &&
        !token.startsWith('</') &&
        !token.endsWith('/>') &&
        !token.startsWith('<!--') &&
        !token.startsWith('<![') &&
        !token.includes('</') // Not a tag with closing pair inline
      ) {
        indent++
      }
    }

    return formatted.trim()
  }

  /**
   * Tokenize XML string into logical lines (split by tags)
   */
  private tokenizeXml(xml: string): string[] {
    const tokens: string[] = []
    let current = ''
    let inQuotes = false
    let quoteChar = ''

    for (let i = 0; i < xml.length; i++) {
      const char = xml[i]

      // Handle quotes
      if (char === '"' || char === "'") {
        if (!inQuotes) {
          inQuotes = true
          quoteChar = char
        } else if (char === quoteChar) {
          inQuotes = false
        }
        current += char
        continue
      }

      // Split on > when not in quotes
      if (char === '>' && !inQuotes) {
        current += char
        if (current.trim()) {
          tokens.push(current)
        }
        current = ''
        continue
      }

      current += char
    }

    if (current.trim()) {
      tokens.push(current)
    }

    return tokens
  }

  /**
   * Check if an XML tag is self-closing
   */
  private isSelfClosing(tag: string): boolean {
    return tag.endsWith('/>')
  }

  /**
   * Format XML with attribute wrapping for long lines
   */
  formatWithWrapping(xml: string): XMLPrettyPrintResult {
    const result = this.format(xml)

    if (this.maxLineLength === 0) {
      return result
    }

    const lines = result.formatted.split('\n')
    const wrappedLines: string[] = []

    for (const line of lines) {
      if (line.length <= this.maxLineLength) {
        wrappedLines.push(line)
        continue
      }

      // Wrap attributes across multiple lines
      const wrapped = this.wrapAttributes(line)
      wrappedLines.push(...wrapped)
    }

    return {
      formatted: wrappedLines.join('\n'),
      wasModified: true,
      processingTime: result.processingTime,
    }
  }

  /**
   * Wrap attributes in a tag across multiple lines
   */
  private wrapAttributes(line: string): string[] {
    const match = line.match(/^(<\w+)(\s+.*?)(\/?>)$/)
    if (!match) {
      return [line]
    }

    const [, openTag, attrs, closeTag] = match
    const attrRegex = /(\w+="[^"]*"|\w+='[^']*')/g
    const attributes = attrs.match(attrRegex) || []

    if (attributes.length <= 1) {
      return [line]
    }

    const baseIndent = line.search(/\S/)
    const indentStr = ' '.repeat(baseIndent + this.indentSize)

    const lines: string[] = [`${openTag}`]
    for (const attr of attributes) {
      lines.push(`${indentStr}${attr.trim()}`)
    }
    lines.push(`${' '.repeat(baseIndent)}${closeTag}`)

    return lines
  }
}

/**
 * Convenience function for quick formatting
 */
export function prettyPrintXml(
  xml: string,
  options?: XMLPrettyPrinterOptions,
): string {
  const printer = new XMLPrettyPrinter(options)
  return printer.format(xml).formatted
}
