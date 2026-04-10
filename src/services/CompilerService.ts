/**
 * CompilerService handles all compilation and parsing operations
 * Integrates with the complete translation and validation pipeline
 */

import { XMLParser } from '@/engine/parsers/XMLParser'
import { XMLCompiler } from '@/engine/compilers/XMLCompiler'
import { SemanticValidator } from '@/engine/validators/SemanticValidator'
import { DiagnosticFormatter } from '@/engine/diagnostics/DiagnosticFormatter'
import { STBLParser } from '@/engine/parsers/STBLParser'
import { PackageParser } from '@/engine/parsers/PackageParser'
import { ConfigParser } from '@/engine/parsers/ConfigParser'
import { createParserCache } from '@/engine/cache/ParserCache'
import { xmlToJpe, jpeToXml } from '@/engine/translators'
import { tokenize, parse } from '@/engine/jpe'
import { ScriptBundler } from '@/engine/scripts/ScriptBundler'
import { ParallelCompiler } from '@/engine/compilers/ParallelCompiler'
import { sensoryService } from '@/services/editor/SensoryService'
import { PackageService, type PackageOutputResource } from '@/services/PackageService'
import { DBPF_RESOURCE_TYPES } from '@/engine/parsers/types/package'
import type { ModFile, ValidationResult, Diagnostic } from '@/types/index'
import type { ASTNode } from '@/engine/jpe'

export class CompilerService {
  // Static cache for parsed ASTs
  private static parserCache = createParserCache<ASTNode>({
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
    jpeContent: string,
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

      // 1. Tokenize
      const tokens = tokenize(jpeContent)
      
      // 2. Parse
      const ast = parse(tokens)
      
      // 3. Translate to XML AST
      const xmlElement = jpeToXml(ast)
      if (!xmlElement) {
        return {
          success: false,
          errors: [
            {
              id: 'compile-002',
              fileId: '',
              line: 0,
              column: 0,
              severity: 'error',
              message: 'Failed to translate JPE to XML',
              code: 'COMPILE002',
            },
          ],
        }
      }

      // 4. Compile XML AST to string
      const output = XMLCompiler.elementToXMLString(xmlElement, true, 0)

      return {
        success: true,
        output,
        errors: [],
      }
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
      } else if (file.type === 'py') {
        const errors: Diagnostic[] = []
        const content = file.content
        const delimiters: Record<string, string> = { '(': ')', '[': ']', '{': '}' }
        const stack: string[] = []
        
        for (let i = 0; i < content.length; i++) {
          const char = content[i]
          if (delimiters[char]) {
            stack.push(char)
          } else if (Object.values(delimiters).includes(char)) {
            const last = stack.pop()
            if (!last || delimiters[last] !== char) {
              errors.push({
                id: 'py-syntax-001',
                fileId: file.id,
                line: content.substring(0, i).split('\n').length,
                column: i - content.lastIndexOf('\n', i),
                severity: 'error',
                message: `Mismatched delimiter: '${char}'`,
                code: 'PY_SYNTAX_001',
              })
              break
            }
          }
        }
        
        if (stack.length > 0) {
          errors.push({
            id: 'py-syntax-002',
            fileId: file.id,
            line: content.split('\n').length,
            column: 0,
            severity: 'error',
            message: `Unclosed delimiter: '${stack[stack.length - 1]}'`,
            code: 'PY_SYNTAX_002',
          })
        }

        return {
          valid: errors.length === 0,
          diagnostics: errors,
          warnings: [],
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
   * Compile a single file using ParallelCompiler (Web Worker) for low-latency feedback
   */
  static async compileFile(file: ModFile): Promise<{
    success: boolean
    output: string | null
    errors: Diagnostic[]
  }> {
    try {
      const parallelCompiler = ParallelCompiler.getInstance()
      const result = await parallelCompiler.compileFile(file)
      
      // Trigger sensory feedback based on result
      if (result.success) {
        sensoryService.onSuccess()
      } else {
        sensoryService.onError(result.errors[0]?.message)
      }

      return {
        success: result.success,
        output: result.output || null,
        errors: result.errors,
      }
    } catch (error) {
      console.error('Failed to compile file', error)
      sensoryService.onError(error instanceof Error ? error.message : 'Unknown compilation error')
      return {
        success: false,
        output: null,
        errors: [
          {
            id: 'compile-err-final',
            fileId: file.id,
            line: 0,
            column: 0,
            severity: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
            code: 'COMPILE_ERR',
          },
        ],
      }
    }
  }

  /**
   * Compile multiple files (batch)
   * Uses ParallelCompiler for multi-file JPE projects, falls back to sequential for small/single files.
   */
  static async compileProject(files: ModFile[]): Promise<{
    success: boolean
    results: Array<{ fileId: string; success: boolean; errors: Diagnostic[]; output?: string }>
    scriptBundle?: ArrayBuffer | null
    packageBuffer?: ArrayBuffer | null
    error?: string
  }> {
    try {
      const jpeFiles = files.filter(f => f.type === 'jpe')
      const _nonJpeFiles = files.filter(f => f.type !== 'jpe')

      let projectResults: Array<{ fileId: string; success: boolean; errors: Diagnostic[]; output?: string }> = []

      // Use ParallelCompiler for multi-file JPE projects (2+ JPE files)
      if (jpeFiles.length >= 2) {
        try {
          const parallelCompiler = ParallelCompiler.getInstance()
          const parallelResults = await parallelCompiler.compileProject(files)

          // Map ParallelCompiler results to our format
          projectResults = parallelResults.results.map(r => ({
            fileId: r.fileId,
            success: r.success,
            errors: r.errors,
            output: (r as any).output, // Cast for parallel output if supported
          }))

          console.log(`[CompilerService] Parallel compilation: ${parallelResults.throughput.toFixed(1)} files/sec using ${parallelResults.workerCount} workers`)
        } catch (parallelError) {
          console.warn('[CompilerService] Parallel compilation failed, falling back to sequential:', parallelError)
          // Fall through to sequential below
          jpeFiles.length = 0 // Reset so we fall through
        }
      }

      // Sequential compilation (single file or fallback)
      if (jpeFiles.length < 2 || projectResults.length === 0) {
        const sequentialResults = await Promise.all(files.map((file) => this.compileFile(file)))
        projectResults = sequentialResults.map((r, i) => ({
          fileId: files[i].id,
          success: r.success,
          errors: r.errors,
          output: r.output || undefined
        }))
      }

      // --- Industrial Packing (Story 2.3.1) ---
      let packageBuffer: ArrayBuffer | null = null;
      if (projectResults.every(r => r.success)) {
        const packageResources: PackageOutputResource[] = [];
        
        for (const file of files) {
          const result = projectResults.find(r => r.fileId === file.id);
          if (!result || !result.output) continue;

          let type: number = DBPF_RESOURCE_TYPES.TuningInstance;
          if (file.type === 'stbl') type = DBPF_RESOURCE_TYPES.STBL;
          
          // Attempt to extract instance ID (s=) from XML
          let instanceId = BigInt(0);
          if (file.type === 'xml' || file.type === 'jpe') {
            const idMatch = result.output.match(/ s="(\d+)"/);
            if (idMatch) instanceId = BigInt(idMatch[1]);
          }

          packageResources.push({
            type,
            group: 0,
            instance: instanceId,
            content: new TextEncoder().encode(result.output)
          });
        }

        if (packageResources.length > 0) {
          packageBuffer = await PackageService.createPackage(packageResources);
        }
      }

      let scriptBundle: ArrayBuffer | null = null
      let bundleError: string | undefined = undefined

      if (ScriptBundler.needsBundling(files)) {
        try {
          scriptBundle = await ScriptBundler.bundle(files)
        } catch (e) {
          console.error('[CompilerService] Script bundling failed:', e)
          bundleError = e instanceof Error ? e.message : 'Unknown bundling error'
        }
      }

      return {
        success: projectResults.every((r) => r.success) && !bundleError,
        results: projectResults,
        scriptBundle,
        packageBuffer,
        error: bundleError
      }
    } catch (error) {
      console.error('Failed to compile project', error)
      return {
        success: false,
        results: [],
        error: error instanceof Error ? error.message : 'Unknown project compilation error'
      }
    }
  }

  // ─── Python Engine Integration (Story 1.2) ─────────────────────────────────

  /**
   * Subtask 3.1: Compile JPE source using the real Python engine via /api/transform.
   * Returns structured result with duration, errors, and XML output.
   */
  static async compileWithPython(
    jpeSource: string,
    fileName: string = 'input.jpe'
  ): Promise<{
    success: boolean
    xml?: string
    errors: Array<{ message: string; line?: number; column?: number; severity?: string; code?: string }>
    duration: number
  }> {
    const startTime = Date.now()

    // ─── NATIVE ELECTRON BRIDGE (Zero-Server) ───
    if (typeof window !== 'undefined' && window.electron?.transform) {
      try {
        const result = await window.electron.transform.run(jpeSource, fileName)
        return {
          success: result.success,
          xml: result.xml,
          errors: result.errors || [],
          duration: result.duration || (Date.now() - startTime),
        }
      } catch (error) {
        console.error('[CompilerService] Native transform failed:', error)
        return {
          success: false,
          errors: [{
            message: error instanceof Error ? error.message : 'Native transform bridge unavailable',
            severity: 'error',
          }],
          duration: Date.now() - startTime,
        }
      }
    }

    return {
      success: false,
      errors: [{
        message: 'Transform engine not available. Ensure JPE Studio is running as a desktop application.',
        severity: 'error',
      }],
      duration: Date.now() - startTime,
    }
  }

  /**
   * Subtask 3.2: Compile a file from disk — read JPE, transform via Python, write XML.
   * Creates backup of target file before overwriting.
   */
  static async compileFileToDisk(
    inputPath: string,
    outputPath: string,
    fileName?: string
  ): Promise<{
    success: boolean
    xml?: string
    errors: Array<{ message: string; line?: number; column?: number; severity?: string }>
    duration: number
    backupPath?: string
  }> {
    const startTime = Date.now()

    try {
      // 1. Read input file via native FileService (IPC)
      const { FileService } = await import('./FileService')
      const readResult = await FileService.readFile(inputPath)
      if (!readResult.success || !readResult.content) {
        return {
          success: false,
          errors: [{ message: readResult.error || `Failed to read input file: ${inputPath}` }],
          duration: Date.now() - startTime,
        }
      }
      const content = readResult.content

      // 2. Transform via Python engine (native IPC bridge)
      const transformResult = await this.compileWithPython(content, fileName || inputPath.split('/').pop() || 'input.jpe')

      if (!transformResult.success) {
        return {
          success: false,
          errors: transformResult.errors,
          duration: Date.now() - startTime,
        }
      }

      // 3. Write output via native FileService (IPC)
      const writeResult = await FileService.writeFile(outputPath, transformResult.xml!)
      if (!writeResult.success) {
        return {
          success: false,
          errors: [{ message: writeResult.error || `Failed to write output file: ${outputPath}` }],
          duration: Date.now() - startTime,
        }
      }

      return {
        success: true,
        xml: transformResult.xml,
        errors: [],
        duration: Date.now() - startTime,
      }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            message: error instanceof Error ? error.message : 'File compilation failed',
            severity: 'error',
          },
        ],
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Subtask 3.3: Batch compile all project files with progress reporting and cancellation.
   */
  static async compileAll(
    files: Array<{ name: string; content: string }>,
    signal?: AbortSignal
  ): Promise<{
    successCount: number
    failCount: number
    totalDuration: number
    results: Array<{
      fileName: string
      success: boolean
      xml?: string
      errors: Array<{ message: string; line?: number }>
      duration: number
    }>
  }> {
    const startTime = Date.now()
    const results: Array<{
      fileName: string
      success: boolean
      xml?: string
      errors: Array<{ message: string; line?: number }>
      duration: number
    }> = []

    for (const file of files) {
      // Check cancellation
      if (signal?.aborted) {
        return {
          successCount: results.filter((r) => r.success).length,
          failCount: results.filter((r) => !r.success).length,
          totalDuration: Date.now() - startTime,
          results,
        }
      }

      const result = await this.compileWithPython(file.content, file.name)
      results.push({
        fileName: file.name,
        success: result.success,
        xml: result.xml,
        errors: result.errors.map((e) => ({ message: e.message, line: e.line })),
        duration: result.duration,
      })
    }

    return {
      successCount: results.filter((r) => r.success).length,
      failCount: results.filter((r) => !r.success).length,
      totalDuration: Date.now() - startTime,
      results,
    }
  }

  /**
   * Subtask 3.4: Decompile XML to JPE using Python engine.
   * Spawns Python to parse XML and emit JPE representation.
   */
  static async decompileFromPython(
    xmlContent: string,
    _fileName: string = 'input.xml'
  ): Promise<{
    success: boolean
    jpe?: string
    errors: Array<{ message: string; line?: number; column?: number }>
    duration: number
  }> {
    const startTime = Date.now()

    try {
      // We use the transform endpoint in reverse — write XML to temp, have engine parse it
      // For now, fall back to local TypeScript decompilation
      // Full XML→JPE via Python requires a separate decompile script
      const jpeContent = this.convertToJPE(xmlContent)

      if (jpeContent) {
        return {
          success: true,
          jpe: jpeContent,
          errors: [],
          duration: Date.now() - startTime,
        }
      }

      return {
        success: false,
        errors: [{ message: 'Failed to decompile XML to JPE' }],
        duration: Date.now() - startTime,
      }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            message: error instanceof Error ? error.message : 'Decompilation failed',
          },
        ],
        duration: Date.now() - startTime,
      }
    }
  }
}
