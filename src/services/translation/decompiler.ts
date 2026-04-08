import { XMLParser } from 'fast-xml-parser'

export class JPEDecompiler {
  private parser: XMLParser

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      allowBooleanAttributes: true
    })
  }

  decompile(xml: string, namespace?: string): string {
    const jsonObj = this.parser.parse(xml)
    const root = jsonObj.I
    if (!root) return ''

    let jpe = ''
    if (namespace) {
      jpe += `NAMESPACE: ${namespace}\n`
    }
    
    // 1. Interaction Header
    const name = root['@_n'] || 'Unnamed_Interaction'
    const className = root['@_c']
    const id = root['@_s']
    
    jpe += `WHEN ${name}:\n`
    if (id) {
      jpe += `  id: ${id}\n`
    }
    if (className) {
      jpe += `  class: ${className}\n`
    }

    // 2. Properties & Blocks
    jpe += this.decompileBody(root, 1)

    return jpe.trim()
  }

  private decompileBody(node: any, level: number): string {
    let jpe = ''
    const s = '  '.repeat(level)

    // Handle <T> (Properties)
    if (node.T) {
      const ts = Array.isArray(node.T) ? node.T : [node.T]
      for (const t of ts) {
        const name = t['@_n']
        const value = t['#text'] || ''
        if (name) jpe += `${s}${name}: ${this.unescapeXml(value.toString())}\n`
      }
    }

    // Handle <V> (Variants/Blocks)
    if (node.V) {
      const vs = Array.isArray(node.V) ? node.V : [node.V]
      for (const v of vs) {
        jpe += this.decompileBlock(v, level)
      }
    }

    // Handle <L> (Lists/Blocks)
    if (node.L) {
      const ls = Array.isArray(node.L) ? node.L : [node.L]
      for (const l of ls) {
        jpe += this.decompileBlock(l, level)
      }
    }

    return jpe
  }

  private decompileBlock(node: any, level: number): string {
    let jpe = ''
    const s = '  '.repeat(level)
    const s1 = '  '.repeat(level + 1)
    
    const name = node['@_n'] || node['@_t']
    const mappedName = this.unmapBlockName(name)
    
    jpe += `${s}${mappedName}:\n`
    
    // Check for nested children in L or V structure
    const body = node.L || node.U || node
    
    // If it's a test or action list
    if (body.V || body.T || body.L) {
      // Recursively decompile structure
      const ts = body.T ? (Array.isArray(body.T) ? body.T : [body.T]) : []
      const vs = body.V ? (Array.isArray(body.V) ? body.V : [body.V]) : []
      
      for (const t of ts) {
        const name = t['@_n']
        const val = this.extractValue(t)
        if (name) {
          jpe += `${s1}${name}: ${this.unescapeXml(val)}\n`
        } else {
          jpe += `${s1}- ${this.unescapeXml(val)}\n`
        }
      }
      for (const v of vs) {
        // Handle mapped tests/actions like sims_info
        const actionOrTests = this.decompileActionTest(v)
        if (actionOrTests) {
          for (const item of actionOrTests) {
            jpe += `${s1}- ${item}\n`
          }
        } else {
          jpe += this.decompileBlock(v, level + 1)
        }
      }
    }

    return jpe
  }

  private decompileActionTest(node: any): string[] | null {
    const t = node['@_t']
    if (t === 'sim_info') return ['is adult']
    
    if (t === 'trait' || t === 'loot') {
      const type = t === 'trait' ? 'trait' : 'loot'
      const itemsNode = node.U?.L?.T
      if (!itemsNode) return [`${type}: Unknown_${type.charAt(0).toUpperCase() + type.slice(1)}`]
      
      const items = Array.isArray(itemsNode) ? itemsNode : [itemsNode]
      return items.map(i => `${type}: ${this.unescapeXml(this.extractValue(i))}`)
    }
    return null
  }

  private unmapBlockName(name: string): string {
    const map: Record<string, string> = {
      'test_globals': 'tests',
      'basic_extras': 'effects',
      'at_least_one': 'ONLY_IF'
    }
    return map[name] || name
  }

  private extractValue(node: any): string {
    if (typeof node === 'object' && node !== null) {
      return node['#text']?.toString() || ''
    }
    return node?.toString() || ''
  }

  private unescapeXml(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
  }
}
