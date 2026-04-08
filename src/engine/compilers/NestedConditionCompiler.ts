/**
 * Nested Condition Compiler (Spike/Prototype)
 *
 * Compiles nested JPE AST into Sims 4 XML test lists (<L> and <V> elements).
 * This is a spike/prototype to validate the compilation approach for complex nested conditions.
 *
 * Maps:
 * - WHEN → Outer <L> with condition
 * - ONLY_IF → Nested <L> or <V> with guard condition
 * - DO → Action outcomes
 * - ACTION → Individual <V> elements
 */

import type { NestedConditionNode } from './NestedConditionParser'

export interface CompilationResult {
  xml: string
  errors: string[]
  anonymousIdCount: number
  success: boolean
}

export interface CompilationOptions {
  /** Whether to use flattening strategy (default: nesting) */
  flatten?: boolean
  /** Hash-based ID generation for anonymous tests (default: true) */
  generateIds?: boolean
  /** Root element name (default: 'C') */
  rootElement?: string
}

/**
 * Simple hash function for generating unique IDs
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `0x${Math.abs(hash).toString(16).padStart(16, '0')}`
}

/**
 * Compile nested JPE AST to Sims 4 XML test lists
 */
export class NestedConditionCompiler {
  private anonymousIdCount: number
  private errors: string[]
  private options: Required<CompilationOptions>

  constructor(options: CompilationOptions = {}) {
    this.anonymousIdCount = 0
    this.errors = []
    this.options = {
      flatten: options.flatten ?? false,
      generateIds: options.generateIds ?? true,
      rootElement: options.rootElement ?? 'C',
    }
  }

  /**
   * Compile AST to XML string
   */
  compile(ast: NestedConditionNode[]): CompilationResult {
    this.anonymousIdCount = 0
    this.errors = []

    try {
      const xmlParts: string[] = []

      // XML declaration
      xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>')

      // Root element
      xmlParts.push(`<${this.options.rootElement}>`)

      // Compile each root node
      for (const node of ast) {
        const xml = this.compileNode(node)
        xmlParts.push(xml)
      }

      // Close root element
      xmlParts.push(`</${this.options.rootElement}>`)

      return {
        xml: xmlParts.join('\n'),
        errors: this.errors,
        anonymousIdCount: this.anonymousIdCount,
        success: this.errors.length === 0,
      }
    } catch (error) {
      return {
        xml: '',
        errors: [
          error instanceof Error ? error.message : 'Unknown compilation error',
        ],
        anonymousIdCount: this.anonymousIdCount,
        success: false,
      }
    }
  }

  /**
   * Compile a single node to XML
   */
  private compileNode(node: NestedConditionNode): string {
    switch (node.type) {
      case 'WHEN':
        return this.compileWhenNode(node)
      case 'ONLY_IF':
        return this.compileOnlyIfNode(node)
      case 'DO':
        return this.compileDoNode(node)
      case 'ACTION':
        return this.compileActionNode(node)
      default:
        this.errors.push(`Unknown node type: ${(node as any).type}`)
        return ''
    }
  }

  /**
   * Compile WHEN node to <L> with condition
   */
  private compileWhenNode(node: NestedConditionNode): string {
    const parts: string[] = []

    // Opening <L> with condition
    const conditionV = node.condition
      ? this.conditionToV(node.condition, node.scope)
      : ''

    if (conditionV) {
      parts.push('  '.repeat(node.depth + 1) + `<L>`)
      parts.push('  '.repeat(node.depth + 2) + conditionV)
    } else {
      parts.push('  '.repeat(node.depth + 1) + `<L>`)
    }

    // Compile children
    for (const child of node.children) {
      parts.push(this.compileNode(child))
    }

    // Close <L>
    parts.push('  '.repeat(node.depth + 1) + `</L>`)

    return parts.join('\n')
  }

  /**
   * Compile ONLY_IF node to nested <L> or <V>
   */
  private compileOnlyIfNode(node: NestedConditionNode): string {
    const parts: string[] = []

    if (node.children.length > 0) {
      // Has children: create nested <L>
      parts.push('  '.repeat(node.depth + 1) + `<L>`)
      parts.push(
        '  '.repeat(node.depth + 2) +
        this.conditionToV(node.condition, node.scope),
      )

      for (const child of node.children) {
        parts.push(this.compileNode(child))
      }

      parts.push('  '.repeat(node.depth + 1) + `</L>`)
    } else {
      // No children: simple <V>
      parts.push(
        '  '.repeat(node.depth + 1) +
        this.conditionToV(node.condition, node.scope),
      )
    }

    return parts.join('\n')
  }

  /**
   * Compile DO node (actions block)
   */
  private compileDoNode(node: NestedConditionNode): string {
    const parts: string[] = []

    // DO block is typically implicit in Sims 4 XML
    // Compile children directly
    for (const child of node.children) {
      parts.push(this.compileNode(child))
    }

    return parts.join('\n')
  }

  /**
   * Compile ACTION node to <V> element
   */
  private compileActionNode(node: NestedConditionNode): string {
    if (!node.action) {
      this.errors.push(`Action node missing action at depth ${node.depth}`)
      return ''
    }

    // Parse action into <V> element
    const vElement = this.actionToV(node.action, node.scope)
    return '  '.repeat(node.depth + 1) + vElement
  }

  /**
   * Convert condition string to <V> element
   */
  private conditionToV(condition: string | undefined, scope: string): string {
    if (!condition) {
      return '<V t="placeholder" />'
    }

    // Parse condition into Sims 4 format
    // Example: "sim_has_trait("gene")" → '<V t="trait" n="0x..."/>'
    const match = condition.match(/^(\w+)\((.*)\)$/)

    if (match) {
      const [, func, args] = match

      // Map common condition types
      const typeMap: Record<string, string> = {
        sim_has_trait: 'trait',
        sim_has_buff: 'buff',
        sim_relationship_level: 'relationship',
        has_trait: 'trait',
        has_buff: 'buff',
      }

      const vType = typeMap[func] || 'test'

      // Generate anonymous ID if needed
      let idAttr = ''
      if (this.options.generateIds) {
        const id = hashString(`${scope}_${condition}`)
        this.anonymousIdCount++
        idAttr = ` n="${id}"`
      }

      return `<V t="${vType}"${idAttr} />`
    }

    // Fallback: generic test
    return `<V t="test" n="${this.escapeXml(condition)}" />`
  }

  /**
   * Convert action string to <V> element
   */
  private actionToV(action: string, scope: string): string {
    // Parse action into Sims 4 format
    // Example: "interaction_apply_buff("confidence")" → '<V t="buff" n="..."/>'
    const match = action.match(/^(\w+)\((.*)\)$/)

    if (match) {
      const [, func, args] = match

      // Map common action types
      const typeMap: Record<string, string> = {
        interaction_apply_buff: 'buff',
        interaction_set_value: 'set_value',
        interaction_unlock_option: 'unlock',
        apply_buff: 'buff',
        set_value: 'set_value',
      }

      const vType = typeMap[func] || 'action'

      // Generate ID
      let idAttr = ''
      if (this.options.generateIds) {
        const id = hashString(`${scope}_${action}`)
        this.anonymousIdCount++
        idAttr = ` n="${id}"`
      }

      return `<V t="${vType}"${idAttr} />`
    }

    // Fallback: generic action
    return `<V t="action" n="${this.escapeXml(action)}" />`
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

/**
 * Convenience function for quick compilation
 */
export function compileNestedConditions(
  ast: NestedConditionNode[],
  options?: CompilationOptions,
): CompilationResult {
  const compiler = new NestedConditionCompiler(options)
  return compiler.compile(ast)
}
