import { ProgramNode, InteractionNode, PropertyNode, BlockNode, TestNode, ActionNode, AstNodeType } from './types'
import { fnv64 } from './hash'
import { STBLService } from './stbl'

export class JPETranslator {
  // Mapping conditions to Sims 4 XML generators
  private static TEST_MAPPERS: Record<string, (node: TestNode, level: number, translator: JPETranslator) => string> = {
    'is adult': (node, level, t) => {
      const s = t.indent(level)
      const s1 = t.indent(level + 1)
      const s2 = t.indent(level + 2)
      const s3 = t.indent(level + 3)
      return `${s}<V t="sim_info">\n${s1}<U n="sim_info">\n${s2}<V t="ages" n="ages_allowed">\n${s3}<L n="ages_allowed">\n${s3}  <E>ADULT</E>\n${s3}</L>\n${s2}</V>\n${s1}</U>\n${s}</V>\n`
    },
    'trait': (node, level, t) => {
      const s = t.indent(level)
      const s1 = t.indent(level + 1)
      const s2 = t.indent(level + 2)
      const traitName = t.escapeXml(node.params?.[0] || 'Unknown_Trait')
      return `${s}<V t="trait">\n${s1}<U n="trait">\n${s2}<L n="whitelist_traits">\n${s2}  <T>${traitName}</T>\n${s2}</L>\n${s1}</U>\n${s}</V>\n`
    }
  }

  private static ACTION_MAPPERS: Record<string, (node: ActionNode, level: number, translator: JPETranslator) => string> = {
    'loot': (node, level, t) => {
      const s = t.indent(level)
      const s1 = t.indent(level + 1)
      const s2 = t.indent(level + 2)
      const lootName = t.escapeXml(node.params?.[0] || 'Unknown_Loot')
      return `${s}<V t="loot">\n${s1}<U n="loot">\n${s2}<L n="loot_list">\n${s2}  <T>${lootName}</T>\n${s2}</L>\n${s1}</U>\n${s}</V>\n`
    }
  }

  private localizedStrings: Set<string> = new Set()

  translate(program: ProgramNode): Record<string, string | Buffer> {
    const files: Record<string, string | Buffer> = {}
    
    // 1. Build localization lookup
    this.localizedStrings = new Set()
    if (program.localization) {
      const locales = new Set(program.localization.entries.map(e => e.locale.toUpperCase()))
      
      // Determine the base locale for XML hash replacement
      // Preference: EN > First available
      const baseLocale = locales.has('EN') ? 'EN' : Array.from(locales)[0]
      
      program.localization.entries.forEach(e => {
        if (e.locale.toUpperCase() === baseLocale) {
          this.localizedStrings.add(e.text)
        }
      })
      
      // 2. Generate Binary STBL files
      for (const locale of locales) {
        const buffer = STBLService.generate(program.localization, locale)
        files[`${locale}.stbl`] = buffer
      }
    }

    // 3. Translate Interactions to XML
    for (const interaction of program.children) {
      const xml = this.interaction(interaction, program.namespace)
      
      // Harden sanitization: apply sequence-collapsing regex to namespace and name
      const safeNamespace = program.namespace ? program.namespace.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') : ''
      let safeName = interaction.name.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')
      
      // Ensure name is not empty after sanitization
      if (!safeName) safeName = 'Unnamed_Interaction'
      
      // Handle the case where the whole namespace was special characters
      const finalNamespace = safeNamespace || ''
      const filename = `${finalNamespace ? finalNamespace + '_' : ''}${safeName}.Interaction.xml`
      files[filename] = xml
    }
    
    return files
  }

  private interaction(node: InteractionNode, namespace?: string): string {
    const id = node.instanceId || fnv64(node.name, namespace)
    const decimalId = id.toString().startsWith('0x') ? BigInt(id).toString() : id.toString()
    
    // Story 8.2: Dynamic Class & Module Detection
    let className = node.className || "Interaction"
    let moduleName = "interactions.base.interaction"
    
    if (node.name.toLowerCase().includes('social') || className.toLowerCase().includes('social')) {
      className = className === "Interaction" ? "SocialSuperInteraction" : className
      moduleName = "interactions.social.social_super_interaction"
    } else if (className !== "Interaction") {
      // If a custom class is provided but not social, default to super_interaction unless specified
      moduleName = "interactions.base.super_interaction"
    }

    let xml = '<?xml version="1.0" encoding="utf-8"?>\n'
    xml += `<I c="${this.escapeXml(className)}" i="interaction" m="${this.escapeXml(moduleName)}" n="${this.escapeXml(node.name)}" s="${this.escapeXml(decimalId)}">\n`
    
    // Group properties and blocks by mapped name to avoid duplicate <L> tags
    const groupedProps = new Map<string, (PropertyNode | BlockNode)[]>()
    for (const prop of node.properties) {
      if (prop.type === AstNodeType.PROPERTY || prop.type === AstNodeType.BLOCK) {
        const p = prop as PropertyNode | BlockNode
        const mapped = this.mapBlockName(p.name)
        if (!groupedProps.has(mapped)) groupedProps.set(mapped, [])
        groupedProps.get(mapped)!.push(p)
      }
    }

    for (const [mappedName, nodes] of groupedProps) {
      if (nodes.some(n => n.type === AstNodeType.BLOCK)) {
        // Collect all children if it's a list group
        const allChildren: (TestNode | ActionNode | PropertyNode | BlockNode)[] = []
        for (const n of nodes) {
          if (n.type === AstNodeType.BLOCK) {
            allChildren.push(...(n as BlockNode).children)
          } else {
            allChildren.push(n as PropertyNode)
          }
        }
        
        // Story 8.2: Fix empty logic blocks (skip if all children are empty/absent)
        if (allChildren.length === 0) continue

        const syntheticBlock: BlockNode = {
          type: AstNodeType.BLOCK,
          name: mappedName,
          children: allChildren,
          line: 0,
          column: 0
        }
        xml += this.block(syntheticBlock, 1, 0)
      } else {
        for (const n of nodes) {
           xml += this.property(n as PropertyNode, 1)
        }
      }
    }
    
    xml += '</I>'
    return xml
  }

  private property(node: PropertyNode, level: number): string {
    const s = this.indent(level)
    let value = node.value.type === AstNodeType.LITERAL ? node.value.value : ''
    
    // Auto-localize
    if (typeof value === 'string' && this.localizedStrings.has(value)) {
      value = STBLService.formatKey(value)
    } else {
      value = this.escapeXml(value.toString())
    }
    
    return `${s}<T n="${this.escapeXml(node.name)}">${value}</T>\n`
  }

  private block(node: BlockNode, level: number, depth: number = 0): string {
    if (depth > 20) return `${this.indent(level)}<!-- Max recursion depth exceeded -->\n`
    if (node.children.length === 0) return ''

    const s = this.indent(level)
    const mappedName = this.mapBlockName(node.name)
    const isInsideTests = mappedName === 'test_globals' || mappedName === 'at_least_one'
    
    let xml = ''
    
    const needsWrapper = level > 1 && isInsideTests && node.children.length > 1
    
    if (needsWrapper) {
      xml += `${s}<V t="at_least_one">\n`
      xml += `${s}  <L n="at_least_one">\n`
      
      for (const child of node.children) {
        if (child.type === AstNodeType.TEST) {
          xml += this.test(child as TestNode, level + 2)
        } else if (child.type === AstNodeType.BLOCK) {
          xml += this.block(child as BlockNode, level + 2, depth + 1)
        }
      }
      
      xml += `${s}  </L>\n`
      xml += `${s}</V>\n`
    } else if (level > 1 && isInsideTests && node.children.length === 1) {
      // Single child case: skip the at_least_one wrapper, it's redundant
      const child = node.children[0]
      if (child.type === AstNodeType.TEST) {
        xml += this.test(child as TestNode, level)
      } else if (child.type === AstNodeType.BLOCK) {
        xml += this.block(child as BlockNode, level, depth + 1)
      }
    } else {
      xml += `${s}<L n="${this.escapeXml(mappedName)}">\n`
      
      for (const child of node.children) {
        if (child.type === AstNodeType.TEST) {
          xml += this.test(child as TestNode, level + 1)
        } else if (child.type === AstNodeType.ACTION) {
          xml += this.action(child as ActionNode, level + 1)
        } else if (child.type === AstNodeType.PROPERTY) {
          xml += this.property(child as PropertyNode, level + 1)
        } else if (child.type === AstNodeType.BLOCK) {
          xml += this.block(child as BlockNode, level + 1, depth + 1)
        }
      }
      
      xml += `${s}</L>\n`
    }
    
    return xml
  }

  private test(node: TestNode, level: number): string {
    const mapper = JPETranslator.TEST_MAPPERS[node.condition.toLowerCase()]
    if (mapper) {
      return mapper(node, level, this)
    }
    const debugParams = node.params ? ' :' + this.escapeXml(node.params.join(':')).replace(/--/g, '__') : ''
    return `${this.indent(level)}<!-- Unknown test: ${this.escapeXml(node.condition)}${debugParams} -->\n`
  }

  private action(node: ActionNode, level: number): string {
    const mapper = JPETranslator.ACTION_MAPPERS[node.action.toLowerCase()]
    if (mapper) {
      return mapper(node, level, this)
    }
    const debugParams = node.params ? ' :' + this.escapeXml(node.params.join(':')).replace(/--/g, '__') : ''
    return `${this.indent(level)}<!-- Unknown action: ${this.escapeXml(node.action)}${debugParams} -->\n`
  }

  // --- Utilities ---

  public indent(level: number): string {
    return '  '.repeat(level)
  }

  public escapeXml(text: string): string {
    if (!text) return ''
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  private mapBlockName(name: string): string {
    const n = name.toUpperCase()
    const map: Record<string, string> = {
      'TESTS': 'test_globals',
      'ONLY_IF': 'test_globals',
      'CONDITIONS': 'test_globals',
      'EFFECTS': 'basic_extras',
      'DO': 'basic_extras',
      'INTERACTIONS': 'interactions'
    }
    return map[n] || name
  }
}

