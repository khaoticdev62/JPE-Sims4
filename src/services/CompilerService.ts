/**
 * CompilerService handles all compilation and parsing operations
 * Integrates with the complete translation and validation pipeline
 */

import { XMLParser, type JPEModule } from '@/engine/parsers/XMLParser'
import { XMLCompiler } from '@/engine/compilers/XMLCompiler'
import { ValidationEngine } from '@/engine/validators/ValidationEngine'
import { SemanticValidator } from '@/engine/validators/SemanticValidator'
import { DiagnosticFormatter } from '@/engine/diagnostics/DiagnosticFormatter'
import { STBLParser } from '@/engine/parsers/STBLParser'
import { PackageParser } from '@/engine/parsers/PackageParser'
import { ConfigParser } from '@/engine/parsers/ConfigParser'
import { createParserCache } from '@/engine/cache/ParserCache'
import { xmlToJpe, jpeToXml } from '@/engine/translators'
import { tokenize, parse } from '@/engine/jpe'
import type { ModFile, ValidationResult, Diagnostic } from '@/types/index'
import type { AST } from '@/engine/parsers/types/parser'

export class CompilerService {
  // Static cache for parsed ASTs
  private static parserCache = createParserCache<AST>({
    maxEntries: 500,
    ttlMs: 1000 * 60 * 60, // 1 hour
    trackStats: true,
  })

  // Semantic validator for cross-file validation
  private static semanticValidator = new SemanticValidator({
    checkTuningReferences: true,
    checkSTBLKeys: true,
    checkEnumValues: true,
    reportWarnings: true,
    maxErrors: 100,
  })

  // Diagnostic formatter
  private static diagnosticFormatter = new DiagnosticFormatter({
    includeDocs: true,
    maxDiagnostics: 100,
  })

  /**
   * Parse a file based on its type
   */
  static parseFile(content: string, fileType: string): string | null {
    try {
      if (fileType === 'xml') {
        const parsed = XMLParser.parseXML(content)
        if (parsed) {
          const jpe = XMLParser.convertToJPE(parsed)
          return JSON.stringify(jpe, null, 2)
        }
      }
      // For other types, return content as-is for now
      return content
    } catch (error) {
      console.error('Failed to parse file', error)
      return null
    }
  }

  /**
   * Convert XML to JPE format using translator
   */
  static convertToJPE(xmlContent: string): string | null {
    try {
      const xmlElement = XMLParser.parseXML(xmlContent)
      if (!xmlElement) return null
      
      const jpeContent = xmlToJpe(xmlElement)
      return jpeContent
    } catch (error) {
      console.error('Failed to convert XML to JPE', error)
      return null
    }
  }

  /**
   * Convert JPE to XML format using translator
   */
  static convertToXML(jpeContent: string): string | null {
    try {
      // 1. Tokenize JPE string
      const tokens = tokenize(jpeContent)
      
      // 2. Parse tokens to AST
      const ast = parse(tokens)
      
      // 3. Translate JPE AST to XML AST
      const xmlElement = jpeToXml(ast)
      if (!xmlElement) return null
      
      // 4. Compile XML AST to XML string
      return XMLCompiler.elementToXMLString(xmlElement, true, 0)
    } catch (error) {
      console.error('Failed to convert JPE to XML', error)
      return null
    }
  }

  /**
   * Parse STBL (string table) binary file
   */
  static parseSTBL(buffer: ArrayBuffer): { success: boolean; data?: any; error?: string } {
    try {
      const result = STBLParser.parse(buffer)
      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to parse STBL file', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown STBL parsing error',
      }
    }
  }

  /**
   * Parse package (.package) DBPF format
   */
  static parsePackage(buffer: ArrayBuffer): { success: boolean; data?: any; error?: string } {
    try {
      const result = PackageParser.parse(buffer)
      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to parse package file', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown package parsing error',
      }
    }
  }

  /**
   * Parse configuration file (JSON/YAML)
   */
  static parseConfig(
    content: string,
    format: 'json' | 'yaml' = 'json'
  ): { success: boolean; data?: any; error?: string } {
    try {
      const result = ConfigParser.parse(content, format)
      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to parse config file', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown config parsing error',
      }
    }
  }

  /**
   * Validate with semantic rules (cross-file references, enum values, etc.)
   */
  static validateProjectSemantic(files: Map<string, string>) {
    try {
      const result = this.semanticValidator.validateProject(files)
      return {
        success: result.valid,
        errors: result.errors,
        warnings: result.warnings,
        stats: result.stats,
      }
    } catch (error) {
      console.error('Failed semantic validation', error)
      return {
        success: false,
        errors: [],
        warnings: [error instanceof Error ? error.message : 'Unknown validation error'],
        stats: {
          filesValidated: 0,
          referencesChecked: 0,
          enumsValidated: 0,
          stblKeysChecked: 0,
        },
      }
    }
  }

  /**
   * Register tuning ID for cross-file validation
   */
  static registerTuningId(id: string, file: string, line: number, name?: string, type?: string) {
    this.semanticValidator.registerTuningId(id, file, line, name, type)
  }

  /**
   * Register STBL key for validation
   */
  static registerSTBLKey(key: string, value: string, file: string) {
    this.semanticValidator.registerSTBLKey(key, value, file)
  }

  /**
   * Register enum for validation
   */
  static registerEnum(enumName: string, values: string[]) {
    this.semanticValidator.registerEnum(enumName, values)
  }

  /**
   * Format diagnostic input into formatted diagnostics with suggestions
   */
  static formatDiagnostics(inputs: any[]) {
    return this.diagnosticFormatter.formatDiagnostics(inputs)
  }

  /**
   * Create diagnostic report for a file
   */
  static createDiagnosticReport(file: string, inputs: any[]) {
    return this.diagnosticFormatter.createReport(file, inputs)
  }

  /**
   * Get parser cache statistics
   */
  static getCacheStats() {
    return this.parserCache.getStats()
  }

  /**
   * Clear parser cache
   */
  static clearCache() {
    this.parserCache.clear()
  }

  /**
   * Get cache metrics
   */
  static getCacheMetrics() {
    return this.parserCache.getMetrics()
  }

  /**
   * Translate file content to JPE format
   */
  static async translateToJPE(file: ModFile): Promise<string | null> {
    try {
      const jpeContent = this.parseFile(file.content, file.type)
      return jpeContent
    } catch (error) {
      console.error('Failed to translate to JPE', error)
      return null
    }
  }

  /**
   * Compile JPE back to original XML format
   */
  static async compileFromJPE(
    jpeModule: JPEModule | string,
    targetFormat: string = 'xml'
  ): Promise<{
    success: boolean
    output?: string
    errors: Diagnostic[]
  }> {
    try {
      if (targetFormat !== 'xml') {
        return {
          success: false,
          errors: [
            {
              id: 'compile-001',
              fileId: '',
              line: 0,
              column: 0,
              severity: 'error',
              message: `Compilation to ${targetFormat} not yet supported`,
              code: 'COMPILE001',
            },
          ],
        }
      }

      // Parse JPE module if it's a string
      let module: JPEModule
      if (typeof jpeModule === 'string') {
        try {
          module = JSON.parse(jpeModule)
        } catch {
          return {
            success: false,
            errors: [
              {
                id: 'compile-002',
                fileId: '',
                line: 0,
                column: 0,
                severity: 'error',
                message: 'Invalid JPE module format',
                code: 'COMPILE002',
              },
            ],
          }
        }
      } else {
        module = jpeModule
      }

      // Compile to XML
      return XMLCompiler.compileToXML(module, true)
    } catch (error) {
      console.error('Failed to compile from JPE', error)
      return {
        success: false,
        errors: [
          {
            id: 'compile-003',
            fileId: '',
            line: 0,
            column: 0,
            severity: 'error',
            message: `Compilation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'COMPILE003',
          },
        ],
      }
    }
  }

  /**
   * Validate a file for errors (syntax + semantic validation)
   */
  static async validateFile(file: ModFile): Promise<ValidationResult> {
    try {
      if (file.type === 'xml') {
        // Perform syntax validation
        const syntaxResult = XMLParser.validate(file.content)

        // Perform semantic validation
        const semanticErrors = this.semanticValidator.validateTuningReferences(file.name, file.content)
        const stblErrors = this.semanticValidator.validateSTBLKeys(file.name, file.content)
        const enumErrors = this.semanticValidator.validateEnumValues(file.name, file.content)

        // Combine results
        const allErrors = [...semanticErrors, ...stblErrors, ...enumErrors]
        const formattedDiagnostics = this.diagnosticFormatter.formatDiagnostics(allErrors)

        return {
          valid: syntaxResult.valid && allErrors.length === 0,
          diagnostics: formattedDiagnostics.map((d) => ({
            id: d.code,
            fileId: file.id,
            line: d.location.line,
            column: d.location.column,
            severity: d.severity,
            message: d.message,
            code: d.code,
          })),
          warnings: allErrors.filter((e) => e.severity === 'warning').map((e) => e.message),
        }
      }

      // Default validation
      return {
        valid: true,
        diagnostics: [],
        warnings: [],
      }
    } catch (error) {
      console.error('Failed to validate file', error)
      return {
        valid: false,
        diagnostics: [],
        warnings: [`Validation error: ${error}`],
      }
    }
  }

  /**
   * Compile a single file
   */
  static async compileFile(file: ModFile): Promise<{
    success: boolean
    output: string | null
    errors: Diagnostic[]
  }> {
    try {
      const validation = await this.validateFile(file)

      if (!validation.valid) {
        return {
          success: false,
          output: null,
          errors: validation.diagnostics,
        }
      }

      // Parse and translate
      const jpe = await this.translateToJPE(file)

      return {
        success: true,
        output: jpe,
        errors: [],
      }
    } catch (error) {
      console.error('Failed to compile file', error)
      return {
        success: false,
        output: null,
        errors: [],
      }
    }
  }

  /**
   * Compile multiple files (batch)
   */
  static async compileProject(files: ModFile[]): Promise<{
    success: boolean
    results: Array<{ fileId: string; success: boolean; errors: Diagnostic[] }>
  }> {
    try {
      const results = await Promise.all(files.map((file) => this.compileFile(file)))
      return {
        success: results.every((r) => r.success),
        results: results.map((r, i) => ({
          fileId: files[i].id,
          success: r.success,
          errors: r.errors,
        })),
      }
    } catch (error) {
      console.error('Failed to compile project', error)
      return {
        success: false,
        results: [],
      }
    }
  }
}
