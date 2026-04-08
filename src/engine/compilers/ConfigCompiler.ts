/**
 * Config Compiler
 *
 * Compiles JPE text representation back to JSON or CFG format.
 *
 * JPE format for configs:
 *   // Config File
 *   // Format: json
 *
 *   key: "value"
 *   nested.key: "nested_value"
 *   number: 42
 *   boolean: true
 */

export interface ConfigCompileResult {
  success: boolean
  content?: string
  errors: string[]
  metadata: {
    format: 'json' | 'cfg'
    compileTime: number
  }
}

export class ConfigCompiler {
  /**
   * Compile JPE text to JSON format.
   */
  static compileToJpe(jpeText: string, format: 'json' | 'cfg' = 'json'): ConfigCompileResult {
    const startTime = performance.now()
    const errors: string[] = []

    try {
      const parsed = this.parseJPEConfig(jpeText, errors)

      if (errors.length > 0) {
        return {
          success: false,
          errors,
          metadata: { format, compileTime: performance.now() - startTime },
        }
      }

      // Convert back to target format
      let content: string
      if (format === 'json') {
        content = JSON.stringify(parsed, null, 2)
      } else {
        content = this.toCFG(parsed)
      }

      return {
        success: true,
        content,
        errors: [],
        metadata: {
          format,
          compileTime: performance.now() - startTime,
        },
      }
    } catch (error) {
      errors.push(`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        success: false,
        errors,
        metadata: { format, compileTime: performance.now() - startTime },
      }
    }
  }

  /**
   * Parse JPE config text into a structured object.
   *
   * JPE format:
   *   key: "value"
   *   nested.key: "nested_value"
   *   number: 42
   *   boolean: true
   */
  private static parseJPEConfig(text: string, errors: string[]): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    const lines = text.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Skip empty lines and comments
      if (!line || line.startsWith('//')) continue

      // Parse key: value
      const match = line.match(/^([\w.]+)\s*:\s*(.+)$/s)
      if (!match) {
        errors.push(`Line ${i + 1}: Invalid config entry format: "${line.substring(0, 80)}"`)
        continue
      }

      const keyPath = match[1]
      const valueStr = match[2].trim()

      // Parse value
      const value = this.parseValue(valueStr)

      // Set nested value
      this.setNestedValue(result, keyPath, value)
    }

    return result
  }

  /**
   * Parse a JPE value string into its proper type.
   */
  private static parseValue(valueStr: string): unknown {
    // Quoted string
    const stringMatch = valueStr.match(/^"(.*)"$/s)
    if (stringMatch) {
      return stringMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    }

    // Boolean
    if (valueStr === 'true') return true
    if (valueStr === 'false') return false

    // Null
    if (valueStr === 'null') return null

    // Number
    const num = Number(valueStr)
    if (!isNaN(num) && valueStr !== '') return num

    // Fallback: return as string
    return valueStr
  }

  /**
   * Set a nested value using dot notation path.
   */
  private static setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {}
      }
      current = current[key] as Record<string, unknown>
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * Convert a config object to CFG format (key=value).
   */
  private static toCFG(obj: Record<string, unknown>, prefix = ''): string {
    const lines: string[] = []

    for (const [key, value] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Nested object — flatten with dot notation
        lines.push(this.toCFG(value as Record<string, unknown>, fullPath))
      } else {
        // Leaf value
        const formattedValue = this.formatValue(value)
        lines.push(`${fullPath}=${formattedValue}`)
      }
    }

    return lines.join('\n')
  }

  /**
   * Format a value for CFG output.
   */
  private static formatValue(value: unknown): string {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    if (value === null) return 'null'
    return String(value)
  }
}
