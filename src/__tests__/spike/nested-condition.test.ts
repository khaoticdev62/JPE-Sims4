import {
  NestedConditionParser,
  parseNestedConditions,
  type NestedConditionNode,
} from '@/engine/parsers/NestedConditionParser'
import {
  NestedConditionCompiler,
  compileNestedConditions,
} from '@/engine/compilers/NestedConditionCompiler'

describe('NestedConditionParser (Spike)', () => {
  describe('Basic nested parsing', () => {
    it('should parse simple WHEN block', () => {
      const jpe = `
WHEN sim_has_trait("gene") DO
  interaction_apply_buff("confidence")
END
`

      const parser = new NestedConditionParser()
      const result = parser.parse(jpe)

      expect(result.errors).toHaveLength(0)
      expect(result.ast.length).toBeGreaterThan(0)
      expect(result.ast[0].type).toBe('WHEN')
      expect(result.ast[0].condition).toContain('sim_has_trait')
      expect(result.ast[0].children.length).toBeGreaterThan(0)
    })

    it('should parse 2-level nested conditions', () => {
      const jpe = `
WHEN sim_has_trait("gene") DO
  interaction_apply_buff("confidence")
  ONLY_IF sim_has_buff("happy")
    interaction_set_value("mood", 100)
  END
END
`

      const result = parseNestedConditions(jpe)

      expect(result.errors).toHaveLength(0)
      expect(result.maxDepth).toBeGreaterThanOrEqual(2)
      expect(result.scopeCount).toBeGreaterThan(1)

      // Verify structure
      const whenNode = result.ast[0]
      expect(whenNode.type).toBe('WHEN')
      expect(whenNode.children.some((c) => c.type === 'ONLY_IF')).toBe(true)
    })

    it('should parse 3-level nested conditions', () => {
      const jpe = `
WHEN sim_has_trait("gene") DO
  interaction_apply_buff("confidence")
  ONLY_IF sim_has_buff("happy")
    interaction_set_value("mood", 100)
    ONLY_IF sim_relationship_level("friend") > 50
      interaction_unlock_option("deep_conversation")
    END
  END
END
`

      const result = parseNestedConditions(jpe)

      expect(result.errors).toHaveLength(0)
      expect(result.maxDepth).toBeGreaterThanOrEqual(3)

      // Verify 3-level nesting
      const whenNode = result.ast[0]
      const onlyIfNode = whenNode.children.find((c) => c.type === 'ONLY_IF')
      expect(onlyIfNode).toBeDefined()

      if (onlyIfNode) {
        const nestedOnlyIf = onlyIfNode.children.find(
          (c) => c.type === 'ONLY_IF',
        )
        expect(nestedOnlyIf).toBeDefined()
        expect(nestedOnlyIf?.children.length).toBeGreaterThan(0)
      }
    })

    it('should track scopes for each nesting level', () => {
      const jpe = `
WHEN condition1 DO
  action1
  ONLY_IF condition2
    action2
  END
END
`

      const result = parseNestedConditions(jpe)

      const scopes = new Set<string>()
      const collectScopes = (nodes: NestedConditionNode[]) => {
        for (const node of nodes) {
          scopes.add(node.scope)
          collectScopes(node.children)
        }
      }
      collectScopes(result.ast)

      expect(scopes.size).toBeGreaterThan(2)
    })
  })

  describe('Error handling', () => {
    it('should report missing END', () => {
      const jpe = `
WHEN condition1 DO
  action1
`

      const result = parseNestedConditions(jpe)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some((e) => e.includes('Missing END'))).toBe(true)
    })

    it('should handle empty input gracefully', () => {
      const result = parseNestedConditions('')

      expect(result.ast).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
      expect(result.maxDepth).toBe(0)
    })

    it('should skip comments', () => {
      const jpe = `
# This is a comment
WHEN condition1 DO
  # Another comment
  action1
END
`

      const result = parseNestedConditions(jpe)

      expect(result.errors).toHaveLength(0)
      expect(result.ast.length).toBeGreaterThan(0)
    })
  })
})

describe('NestedConditionCompiler (Spike)', () => {
  describe('Basic compilation', () => {
    it('should compile simple WHEN block to XML', () => {
      const ast: NestedConditionNode[] = [
        {
          type: 'WHEN',
          condition: 'sim_has_trait("gene")',
          children: [
            {
              type: 'ACTION',
              action: 'interaction_apply_buff("confidence")',
              children: [],
              depth: 1,
              scope: 'scope_1_0',
            },
          ],
          depth: 0,
          scope: 'scope_0_0',
        },
      ]

      const compiler = new NestedConditionCompiler()
      const result = compiler.compile(ast)

      expect(result.success).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(result.xml).toContain('<L>')
      expect(result.xml).toContain('<V t="trait"')
      expect(result.xml).toContain('<V t="buff"')
      expect(result.xml).toContain('</L>')
    })

    it('should generate unique IDs for anonymous tests', () => {
      const ast: NestedConditionNode[] = [
        {
          type: 'WHEN',
          condition: 'condition1',
          children: [
            {
              type: 'ACTION',
              action: 'action1',
              children: [],
              depth: 1,
              scope: 'scope_1_0',
            },
            {
              type: 'ACTION',
              action: 'action2',
              children: [],
              depth: 1,
              scope: 'scope_1_1',
            },
          ],
          depth: 0,
          scope: 'scope_0_0',
        },
      ]

      const result = compileNestedConditions(ast)

      expect(result.anonymousIdCount).toBeGreaterThan(0)
      // Verify IDs are unique
      const idMatches = result.xml.match(/n="0x[0-9a-f]+"/g)
      if (idMatches) {
        const uniqueIds = new Set(idMatches)
        expect(uniqueIds.size).toBe(idMatches.length)
      }
    })

    it('should handle nested ONLY_IF blocks', () => {
      const ast: NestedConditionNode[] = [
        {
          type: 'WHEN',
          condition: 'condition1',
          children: [
            {
              type: 'ONLY_IF',
              condition: 'condition2',
              children: [
                {
                  type: 'ONLY_IF',
                  condition: 'condition3',
                  children: [],
                  depth: 2,
                  scope: 'scope_2_0',
                },
              ],
              depth: 1,
              scope: 'scope_1_0',
            },
          ],
          depth: 0,
          scope: 'scope_0_0',
        },
      ]

      const result = compileNestedConditions(ast)

      expect(result.success).toBe(true)
      // Count nested <L> elements
      const lOpenCount = (result.xml.match(/<L>/g) || []).length
      expect(lOpenCount).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Scope isolation', () => {
    it('should prevent property name collisions between scopes', () => {
      const ast: NestedConditionNode[] = [
        {
          type: 'WHEN',
          condition: 'sim_has_trait("trait1")',
          children: [
            {
              type: 'ACTION',
              action: 'set_value("mood", 100)',
              children: [],
              depth: 1,
              scope: 'scope_1_0',
            },
            {
              type: 'ONLY_IF',
              condition: 'sim_has_buff("buff1")',
              children: [
                {
                  type: 'ACTION',
                  action: 'set_value("mood", 200)', // Same action, different scope
                  children: [],
                  depth: 2,
                  scope: 'scope_2_0',
                },
              ],
              depth: 1,
              scope: 'scope_1_1',
            },
          ],
          depth: 0,
          scope: 'scope_0_0',
        },
      ]

      const result = compileNestedConditions(ast)

      expect(result.success).toBe(true)
      // Both actions should be present with different IDs
      expect(result.xml).toContain('set_value')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty AST', () => {
      const result = compileNestedConditions([])

      expect(result.xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(result.xml).toContain('<C></C>')
    })

    it('should handle unknown node types gracefully', () => {
      const ast: any[] = [
        {
          type: 'UNKNOWN',
          children: [],
          depth: 0,
          scope: 'scope_0_0',
        },
      ]

      const result = compileNestedConditions(ast)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.success).toBe(false)
    })

    it('should escape XML special characters', () => {
      const ast: NestedConditionNode[] = [
        {
          type: 'ACTION',
          action: 'test <value> & "quotes"',
          children: [],
          depth: 0,
          scope: 'scope_0_0',
        },
      ]

      const result = compileNestedConditions(ast)

      expect(result.xml).not.toContain('<value>')
      expect(result.xml).toContain('&lt;value&gt;')
      expect(result.xml).toContain('&quot;')
    })
  })
})

describe('Round-trip: Parse → Compile', () => {
  it('should parse JPE and compile to valid XML', () => {
    const jpe = `
WHEN sim_has_trait("gene") DO
  interaction_apply_buff("confidence")
  ONLY_IF sim_has_buff("happy")
    interaction_set_value("mood", 100)
  END
END
`

    // Parse
    const parseResult = parseNestedConditions(jpe)
    expect(parseResult.errors).toHaveLength(0)
    expect(parseResult.ast.length).toBeGreaterThan(0)

    // Compile
    const compileResult = compileNestedConditions(parseResult.ast)
    expect(compileResult.success).toBe(true)
    expect(compileResult.xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(compileResult.xml).toContain('<L>')
    expect(compileResult.xml).toContain('</L>')
  })

  it('should handle complex 3-level nesting', () => {
    const jpe = `
WHEN sim_has_trait("creative") DO
  interaction_apply_buff("inspiration")
  ONLY_IF sim_has_buff("focused")
    interaction_set_value("creativity", 150)
    ONLY_IF sim_relationship_level("mentor") > 75
      interaction_unlock_option("masterclass")
    END
  END
END
`

    const parseResult = parseNestedConditions(jpe)
    expect(parseResult.maxDepth).toBeGreaterThanOrEqual(3)

    const compileResult = compileNestedConditions(parseResult.ast)
    expect(compileResult.success).toBe(true)

    // Verify structure in XML
    const lCount = (compileResult.xml.match(/<L>/g) || []).length
    expect(lCount).toBeGreaterThanOrEqual(3)
  })
})
