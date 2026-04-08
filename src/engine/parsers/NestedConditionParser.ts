/**
 * Nested Condition Parser (Spike/Prototype)
 *
 * Parses deeply nested JPE WHEN/DO/ONLY_IF blocks into an AST.
 * This is a spike/prototype to validate the parsing approach for complex nested conditions.
 *
 * Example JPE:
 * ```
 * WHEN sim_has_trait("gene") DO
 *   interaction_apply_buff("confidence")
 *   ONLY_IF sim_has_buff("happy")
 *     interaction_set_value("mood", 100)
 *     ONLY_IF sim_relationship_level("friend") > 50
 *       interaction_unlock_option("deep_conversation")
 *     END
 *   END
 * END
 * ```
 */

export interface NestedConditionNode {
  type: 'WHEN' | 'DO' | 'ONLY_IF' | 'ACTION' | 'CONDITION'
  condition?: string
  action?: string
  children: NestedConditionNode[]
  depth: number
  scope: string
}

export interface ParseResult {
  ast: NestedConditionNode[]
  errors: string[]
  maxDepth: number
  scopeCount: number
}

/**
 * Generate a unique scope ID for each nesting level
 */
function generateScopeId(depth: number, index: number): string {
  return `scope_${depth}_${index}`
}

/**
 * Parse nested JPE conditions into an AST
 */
export class NestedConditionParser {
  private lines: string[]
  private position: number
  private errors: string[]
  private scopeCounter: number

  constructor() {
    this.lines = []
    this.position = 0
    this.errors = []
    this.scopeCounter = 0
  }

  /**
   * Parse JPE source into nested AST
   */
  parse(source: string): ParseResult {
    this.lines = source
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
    this.position = 0
    this.errors = []
    this.scopeCounter = 0

    const ast: NestedConditionNode[] = []

    try {
      while (this.position < this.lines.length) {
        const node = this.parseNode(0, generateScopeId(0, this.scopeCounter++))
        if (node) {
          ast.push(node)
        }
      }
    } catch (error) {
      this.errors.push(
        error instanceof Error ? error.message : 'Unknown parsing error',
      )
    }

    const maxDepth = this.getMaxDepth(ast)

    return {
      ast,
      errors: this.errors,
      maxDepth,
      scopeCount: this.scopeCounter,
    }
  }

  /**
   * Parse a single node (WHEN, DO, ONLY_IF, or ACTION)
   */
  private parseNode(depth: number, scope: string): NestedConditionNode | null {
    if (this.position >= this.lines.length) {
      return null
    }

    const line = this.lines[this.position]

    // Parse WHEN block
    if (line.startsWith('WHEN')) {
      return this.parseWhenBlock(depth, scope)
    }

    // Parse ONLY_IF block
    if (line.startsWith('ONLY_IF')) {
      return this.parseOnlyIfBlock(depth, scope)
    }

    // Parse DO block
    if (line.startsWith('DO')) {
      return this.parseDoBlock(depth, scope)
    }

    // Parse ACTION (simple statement)
    if (!line.startsWith('END') && !line.startsWith('#')) {
      return this.parseAction(depth, scope)
    }

    // Skip END or empty lines
    this.position++
    return null
  }

  /**
   * Parse WHEN block: WHEN <condition> DO ... END
   */
  private parseWhenBlock(depth: number, scope: string): NestedConditionNode {
    const line = this.lines[this.position]
    const condition = this.extractCondition(line)

    const node: NestedConditionNode = {
      type: 'WHEN',
      condition,
      children: [],
      depth,
      scope,
    }

    this.position++

    // Parse children until END
    let childIndex = 0
    while (
      this.position < this.lines.length &&
      !this.lines[this.position].startsWith('END')
    ) {
      const childScope = generateScopeId(depth + 1, this.scopeCounter++)
      const child = this.parseNode(depth + 1, childScope)
      if (child) {
        node.children.push(child)
        childIndex++
      }
    }

    // Skip END
    if (this.position < this.lines.length && this.lines[this.position].startsWith('END')) {
      this.position++
    } else {
      this.errors.push(`Missing END for WHEN block at line ${this.position}`)
    }

    return node
  }

  /**
   * Parse ONLY_IF block: ONLY_IF <condition> ... END
   */
  private parseOnlyIfBlock(depth: number, scope: string): NestedConditionNode {
    const line = this.lines[this.position]
    const condition = this.extractCondition(line)

    const node: NestedConditionNode = {
      type: 'ONLY_IF',
      condition,
      children: [],
      depth,
      scope,
    }

    this.position++

    // Parse children until END
    while (
      this.position < this.lines.length &&
      !this.lines[this.position].startsWith('END')
    ) {
      const childScope = generateScopeId(depth + 1, this.scopeCounter++)
      const child = this.parseNode(depth + 1, childScope)
      if (child) {
        node.children.push(child)
      }
    }

    // Skip END
    if (this.position < this.lines.length && this.lines[this.position].startsWith('END')) {
      this.position++
    } else {
      this.errors.push(`Missing END for ONLY_IF block at line ${this.position}`)
    }

    return node
  }

  /**
   * Parse DO block: DO ... END
   */
  private parseDoBlock(depth: number, scope: string): NestedConditionNode {
    const node: NestedConditionNode = {
      type: 'DO',
      children: [],
      depth,
      scope,
    }

    this.position++

    // Parse children until END
    while (
      this.position < this.lines.length &&
      !this.lines[this.position].startsWith('END')
    ) {
      const childScope = generateScopeId(depth + 1, this.scopeCounter++)
      const child = this.parseNode(depth + 1, childScope)
      if (child) {
        node.children.push(child)
      }
    }

    // Skip END
    if (this.position < this.lines.length && this.lines[this.position].startsWith('END')) {
      this.position++
    } else {
      this.errors.push(`Missing END for DO block at line ${this.position}`)
    }

    return node
  }

  /**
   * Parse simple action statement
   */
  private parseAction(depth: number, scope: string): NestedConditionNode {
    const line = this.lines[this.position]
    this.position++

    return {
      type: 'ACTION',
      action: line,
      children: [],
      depth,
      scope,
    }
  }

  /**
   * Extract condition from a line
   */
  private extractCondition(line: string): string | undefined {
    // WHEN <condition> DO or ONLY_IF <condition>
    const match = line.match(/^(?:WHEN|ONLY_IF)\s+(.+?)(?:\s+DO)?$/i)
    return match ? match[1] : undefined
  }

  /**
   * Get maximum nesting depth in AST
   */
  private getMaxDepth(nodes: NestedConditionNode[]): number {
    if (nodes.length === 0) return 0

    let maxDepth = 0
    for (const node of nodes) {
      const nodeDepth = node.depth
      const childDepth = this.getMaxDepth(node.children)
      maxDepth = Math.max(maxDepth, nodeDepth, childDepth)
    }

    return maxDepth
  }
}

/**
 * Convenience function for quick parsing
 */
export function parseNestedConditions(source: string): ParseResult {
  const parser = new NestedConditionParser()
  return parser.parse(source)
}
