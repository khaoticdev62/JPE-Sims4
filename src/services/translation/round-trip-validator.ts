import * as fs from 'fs'
import * as path from 'path'
import { XMLParser } from 'fast-xml-parser'
import { JPEDecompiler } from './decompiler'
import { JPELexer } from './lexer'
import { JPELogicParser } from './parser'
import { JPETranslator } from './translator'

export interface ValidationResult {
  success: boolean
  error?: string
  diff?: string
  jpe?: string
  newXml?: string
}

export class RoundTripValidator {
  private static parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    preserveOrder: true, // Enforce strictly ordered validation for industrial fidelity
    parseTagValue: true, 
    parseAttributeValue: true
  })

  /**
   * Normalizes a value for semantic comparison (hex to dec, trim, stringify).
   */
  private static normalize(val: any): string {
    if (val === null || val === undefined) return ''
    let s = val.toString().trim()
    
    // Check for hex identifiers (common in Sims 4 Tuning)
    if (s.toLowerCase().startsWith('0x')) {
      try {
        return BigInt(s).toString()
      } catch {
        // Not a valid BigInt, return trimmed lowercase for stability
        return s.toLowerCase()
      }
    }
    return s.toLowerCase()
  }

  /**
   * Deeply compares two ordered XML structures (fast-xml-parser preserveOrder format).
   */
  private static isEquiv(a: any, b: any, path = ''): boolean {
    if (a === b) return true

    // Normalize and compare primitives / text nodes
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      return this.normalize(a) === this.normalize(b)
    }

    // handle array of nodes (preserveOrder = true structure)
    if (Array.isArray(a) && Array.isArray(b)) {
      // Filter out whitespace-only text nodes and XML declaration boilerplate (?xml)
      const filterNodes = (nodes: any[]) => nodes.filter(n => {
        if (n['?xml'] !== undefined) return false
        if (n['#text'] !== undefined && n['#text'].toString().trim() === '') return false
        return true
      })

      const nodesA = filterNodes(a)
      const nodesB = filterNodes(b)

      if (nodesA.length !== nodesB.length) return false

      for (let i = 0; i < nodesA.length; i++) {
        if (!this.isEquiv(nodesA[i], nodesB[i], `${path}[${i}]`)) return false
      }
      return true
    }

    // Handle single node object: { "Tag": [...children], ":@": { attrs } }
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false
    
    // Keys in preserveOrder structure are fixed (TagName and potentially :@)
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false
      
      // Attributes comparison (:@ key)
      if (key === ':@') {
        const attrsA = a[key]
        const attrsB = b[key]
        const attrKeysA = Object.keys(attrsA).filter(k => k !== '@_i' || attrsA[k] !== 'interaction')
        const attrKeysB = Object.keys(attrsB).filter(k => k !== '@_i' || attrsB[k] !== 'interaction')

        if (attrKeysA.length !== attrKeysB.length) return false
        for (const ak of attrKeysA) {
          if (!this.isEquiv(attrsA[ak], attrsB[ak], `${path}.@${ak}`)) return false
        }
        continue
      }

      // Recurse into tag children
      if (!this.isEquiv(a[key], b[key], `${path}.${key}`)) return false
    }

    return true
  }

  /**
   * Validates that an XML string can be decompiled to JPE and recompiled to a functionally identical XML.
   */
  static validate(xml: string, namespace?: string): ValidationResult {
    try {
      // 1. Decompile XML to JPE
      const decompiler = new JPEDecompiler()
      const jpe = decompiler.decompile(xml)
      
      // 2. Parse JPE to AST
      const lexer = new JPELexer(jpe)
      const tokens = lexer.tokenize()
      const parser = new JPELogicParser(tokens)
      const ast = parser.parse()
      
      // Override namespace if provided (essential for ID stability in tests)
      if (namespace) {
        ast.namespace = namespace
      }

      // 3. Translate AST back to XML
      const translator = new JPETranslator()
      const files = translator.translate(ast)
      
      // Extract the primary XML file (Interaction XML)
      const xmlFiles = Object.keys(files).filter(f => f.endsWith('.xml'))
      if (xmlFiles.length === 0) {
        return { success: false, error: 'No XML generated from decompiled JPE.' }
      }
      
      const newXml = files[xmlFiles[0]] as string

      // 4. Semantic Comparison
      const originalObj = this.parser.parse(xml)
      const newObj = this.parser.parse(newXml)

      if (!this.isEquiv(originalObj, newObj)) {
        return {
          success: false,
          error: 'Functional mismatch in round-trip conversion.',
          jpe,
          newXml
        }
      }

      return { success: true, jpe, newXml }

    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown validation error'
      return { 
        success: false, 
        error: `Conversion Error: ${message}` 
      }
    }
  }

  /**
   * Reads a file from disk and validates its round-trip fidelity using async I/O.
   */
  static async validateFile(filePath: string): Promise<ValidationResult> {
    try {
      try {
        await fs.promises.access(filePath, fs.constants.R_OK)
      } catch {
        return { success: false, error: `File not found or unreadable: ${filePath}` }
      }

      const xml = await fs.promises.readFile(filePath, 'utf-8')
      
      // Robust extraction of namespace/id from filename
      const filename = path.basename(filePath)
      const workspaceFormat = filename.includes('.Interaction.xml')
      const basename = workspaceFormat 
        ? filename.replace('.Interaction.xml', '') 
        : path.basename(filePath, path.extname(filePath))
      
      const parts = basename.split('_')
      // If the filename has multiple underscores, the namespace is likely everything before the first one
      // but we allow for more complex patterns if needed.
      const namespace = parts.length > 1 ? parts[0] : undefined

      return this.validate(xml, namespace)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown industrial telemetry error'
      return { success: false, error: `File Error: ${message}` }
    }
  }
}
