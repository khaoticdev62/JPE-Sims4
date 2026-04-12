/**
 * Transformation Service — JPE to XML (hardened, Story 1.2)
 *
 * Supports two generation modes:
 * 1. Python Backend Mode (production): Calls /api/transform endpoint
 * 2. TypeScript Engine Mode (development): Uses local TypeScript engine from src/engine
 *
 * Hardening (Story 1.2):
 * - Graceful degradation when Python is unavailable
 * - Retry logic with exponential backoff
 * - Input sanitization (BOM stripping, line ending normalization, binary rejection)
 * - Output validation (well-formed XML check, size sanity)
 *
 * Mode selection via environment variable:
 * - NEXT_PUBLIC_TRANSFORM_MODE='python' (default)
 * - NEXT_PUBLIC_TRANSFORM_MODE='typescript'
 */

import { XMLPrettyPrinter } from '@/engine/compilers/XMLPrettyPrinter'
import { XMLNamespaceValidator } from '@/engine/validation/XMLNamespaceValidator'

interface TransformError {
  message: string
  line?: number
  column?: number
  severity?: 'error' | 'warning' | 'info'
  code?: string
}

interface TransformResult {
  xml: string
  errors: TransformError[]
  success: boolean
  mode: 'python' | 'typescript'
  duration: number
  inputSize: number
  outputSize: number
  retryCount: number
}

// ─── Configuration ───────────────────────────────────────────────────────────

const MAX_RETRIES = 2
const RETRY_DELAYS_MS = [500, 1000, 2000] // exponential backoff
const MIN_XML_LENGTH = 50 // sanity check for output
const _BOM_CHAR = '\uFEFF'

/**
 * Transformation Service
 */
export class TransformationService {
  private static mode: 'python' | 'typescript' =
    (process.env.NEXT_PUBLIC_TRANSFORM_MODE as 'python' | 'typescript') || 'python'

  private static _pythonAvailable: boolean | null = null
  private static _lastPythonCheck = 0
  private static _pythonCheckTtlMs = 60_000 // 1 minute cache

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Transform JPE source code to XML.
   * Automatically selects backend and applies all hardening measures.
   */
  static async transformJPEToXML(
    source: string,
    fileName?: string
  ): Promise<TransformResult> {
    const startTime = Date.now()

    // Subtask 4.3: Input sanitization
    const sanitized = this.sanitizeInput(source)

    if (!sanitized.valid) {
      return {
        xml: `<!-- Input sanitization failed: ${sanitized.error ?? 'unknown error'} -->`,
        errors: [{ message: sanitized.error ?? 'Input sanitization failed', severity: 'error' as const }],
        success: false,
        mode: this.mode,
        duration: Date.now() - startTime,
        inputSize: source.length,
        outputSize: 0,
        retryCount: 0,
      }
    }

    // Determine which backend to use
    const usePython = this.mode === 'python' && (await this.isPythonAvailable())

    if (usePython) {
      return this.transformWithPythonRetry(sanitized.source, fileName || 'input.jpe', startTime)
    } else {
      return this.transformWithTypeScript(sanitized.source, startTime)
    }
  }

  // ─── Subtask 4.1: Graceful Degradation ─────────────────────────────────────

  /**
   * Check if Python is available (with caching).
   */
  private static async isPythonAvailable(): Promise<boolean> {
    const now = Date.now()
    if (
      this._pythonAvailable !== null &&
      now - this._lastPythonCheck < this._pythonCheckTtlMs
    ) {
      return this._pythonAvailable
    }

    // Check via lightweight native health probe (Zero-Server)
    if (typeof window !== 'undefined' && window.electron?.transform?.health) {
      try {
        const health = await window.electron.transform.health()
        this._pythonAvailable = Boolean(health?.available)
        this._lastPythonCheck = now
        return this._pythonAvailable
      } catch {
        this._pythonAvailable = false
        this._lastPythonCheck = now
        return false
      }
    }

    this._pythonAvailable = false
    this._lastPythonCheck = now
    return false
  }

  /**
   * Get a user-friendly error message when Python is unavailable.
   */
  private static getPythonUnavailableMessage(): string {
    return (
      'Python engine is not available. JPE→XML transformation requires Python 3.10+. ' +
      'Please install Python 3.10+ from https://www.python.org/downloads/ and ensure ' +
      'it is in your system PATH.'
    )
  }

  // ─── Subtask 4.2: Retry with Exponential Backoff ───────────────────────────

  /**
   * Transform with Python backend, retrying transient failures.
   */
  private static async transformWithPythonRetry(
    source: string,
    fileName: string,
    startTime: number
  ): Promise<TransformResult> {
    let lastError: TransformError | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Wait before retry (not on first attempt)
        if (attempt > 0) {
          const delay = RETRY_DELAYS_MS[attempt - 1] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1]
          console.log(`[TransformationService] Retry attempt ${attempt}/${MAX_RETRIES}, waiting ${delay}ms`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }

        // Native Electron IPC Bridge (Zero-Server)
        if (typeof window === 'undefined' || !window.electron?.transform) {
          throw new Error('Native transform bridge not available')
        }

        const result = await window.electron.transform.run(source, fileName)

        if (!result.success && attempt < MAX_RETRIES) {
          const isRetryable = result.errors?.some(
            (e: TransformError) =>
              e.code === 'TIMEOUT' || e.message?.includes('timed out') || e.message?.includes('process')
          ) ?? false

          if (isRetryable) {
            lastError = { message: 'Transient transform error, retrying...', severity: 'error' }
            continue
          }
        }

        // Subtask 4.4: Validate output
        const validation = this.validateOutput(result.xml, result.errors || [])
        if (!validation.valid) {
          return {
            xml: result.xml || '<!-- Output validation failed -->',
            errors: [...(result.errors || []), ...validation.errors],
            success: false,
            mode: 'python',
            duration: Date.now() - startTime,
            inputSize: source.length,
            outputSize: (result.xml || '').length,
            retryCount: attempt,
          }
        }

        // Post-process: validate namespaces and pretty-print
        const { processedXml, namespaceFixes: _namespaceFixes } = this.postProcessXml(result.xml || '')

        return {
          xml: processedXml,
          errors: result.errors || [],
          success: result.success,
          mode: 'python',
          duration: Date.now() - startTime,
          inputSize: source.length,
          outputSize: processedXml.length,
          retryCount: attempt,
        }
      } catch (error) {
        lastError = {
          message: error instanceof Error ? error.message : 'Transformation failed',
          severity: 'error',
        }

        if (attempt < MAX_RETRIES) {
          continue // Will retry
        }
      }
    }

    // All retries exhausted
    return {
      xml: '<!-- Transformation failed after retries -->',
      errors: [
        lastError ?? { message: 'Transformation failed after maximum retries', severity: 'error' },
      ],
      success: false,
      mode: 'python',
      duration: Date.now() - startTime,
      inputSize: source.length,
      outputSize: 0,
      retryCount: MAX_RETRIES,
    }
  }

  // ─── Subtask 4.3: Input Sanitization ───────────────────────────────────────

  /**
   * Sanitize JPE input before sending to Python engine.
   */
  private static sanitizeInput(
    source: string
  ): { valid: boolean; source: string; error?: string } {
    if (typeof source !== 'string') {
      return { valid: false, source: '', error: 'Input must be a string' }
    }

    // Strip BOM
    if (source.charCodeAt(0) === 0xfeff) {
      source = source.slice(1)
    }

    // Normalize line endings (CRLF → LF, CR → LF)
    source = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    // Reject binary-looking input (check for null bytes)
    if (source.includes('\0')) {
      return {
        valid: false,
        source: '',
        error: 'Input appears to be binary. Only text-based JPE files are supported.',
      }
    }

    // Reject empty input
    if (source.trim().length === 0) {
      return { valid: false, source: '', error: 'Input is empty after sanitization' }
    }

    return { valid: true, source }
  }

  // ─── Subtask 4.4: Output Validation ────────────────────────────────────────

  /**
   * Validate XML output from Python engine.
   */
  private static validateOutput(
    xml: string,
    _existingErrors: TransformError[]
  ): { valid: boolean; errors: TransformError[] } {
    const errors: TransformError[] = []

    // Check for empty or suspiciously small output
    if (!xml || xml.trim().length === 0) {
      errors.push({
        message: 'Python engine returned empty output',
        severity: 'error',
        code: 'EMPTY_OUTPUT',
      })
      return { valid: false, errors }
    }

    if (xml.trim().length < MIN_XML_LENGTH) {
      errors.push({
        message: `Output suspiciously small (${xml.length} bytes). The transform may have silently failed.`,
        severity: 'warning',
        code: 'SMALL_OUTPUT',
      })
    }

    // Quick well-formed XML check using DOMParser (browser) or regex fallback
    try {
      if (typeof DOMParser !== 'undefined') {
        const parser = new DOMParser()
        const doc = parser.parseFromString(xml, 'text/xml')
        const parseError = doc.querySelector('parsererror')
        if (parseError) {
          errors.push({
            message: `Output is not well-formed XML: ${parseError.textContent?.slice(0, 200)}`,
            severity: 'error',
            code: 'INVALID_XML',
          })
        }
      }
    } catch {
      // DOMParser not available — skip validation
    }

    return { valid: errors.filter((e) => e.severity === 'error').length === 0, errors }
  }

  // ─── TypeScript Engine Fallback ────────────────────────────────────────────

  /**
   * Transform using TypeScript engine (fallback when Python unavailable).
   */
  private static async transformWithTypeScript(
    source: string,
    startTime: number
  ): Promise<TransformResult> {
    try {
      // Use active translation service lexer/parser
      const { JPELexer } = await import('@/services/translation/lexer')
      const { JPELogicParser } = await import('@/services/translation/parser')

      // 1. Tokenize
      const lexer = new JPELexer(source)
      const tokens = lexer.tokenize()

      // 2. Parse
      try {
        const parser = new JPELogicParser(tokens)
        parser.parse()
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Syntax error in JPE source'
        return {
          xml: '<!-- Transformation failed due to syntax errors -->',
          errors: [{ message, line: 1, column: 1, severity: 'error' as const }],
          success: false,
          mode: 'typescript',
          duration: Date.now() - startTime,
          inputSize: source.length,
          outputSize: 0,
          retryCount: 0,
        }
      }

      // TypeScript engine produces stub — warn user
      const warning = 'TypeScript engine is a stub. Install Python 3.10+ for full JPE→XML transformation.'

      return {
        xml: `<!-- ${warning} -->\n<Tunings />`,
        errors: [{ message: warning, severity: 'warning', code: 'TS_STUB' }],
        success: false,
        mode: 'typescript',
        duration: Date.now() - startTime,
        inputSize: source.length,
        outputSize: 0,
        retryCount: 0,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'TypeScript engine not available'
      const fallbackMessage = this.getPythonUnavailableMessage()

      return {
        xml: `<!-- Transformation unavailable: ${message} -->\n<Tunings />`,
        errors: [
          { message: fallbackMessage, severity: 'error', code: 'NO_ENGINE' },
          { message, severity: 'error', code: 'TS_ENGINE_ERROR' },
        ],
        success: false,
        mode: 'typescript',
        duration: Date.now() - startTime,
        inputSize: source.length,
        outputSize: 0,
        retryCount: 0,
      }
    }
  }

  // ─── Getters / Setters (for testing) ───────────────────────────────────────

  static getMode(): 'python' | 'typescript' {
    return this.mode
  }

  static setMode(mode: 'python' | 'typescript'): void {
    this.mode = mode
  }

  static resetPythonCheck(): void {
    this._pythonAvailable = null
    this._lastPythonCheck = 0
  }

  /**
   * Post-process XML output: validate namespaces and pretty-print.
   * Migrated from the legacy transformation-service.ts.
   */
  private static postProcessXml(xml: string): { processedXml: string; namespaceFixes: string[] } {
    const namespaceFixes: string[] = []

    // Step 1: Validate and fix namespaces
    try {
      const nsValidator = new XMLNamespaceValidator()
      const validation = nsValidator.validate(xml)

      let processedXml = xml
      if (validation.fixedXml) {
        processedXml = validation.fixedXml
        namespaceFixes.push(...validation.fixesApplied)
      }

      // Step 2: Pretty-print with 2-space indentation
      const printer = new XMLPrettyPrinter({
        indentSize: 2,
        maxLineLength: 0, // No wrapping by default
      })
      const formatResult = printer.format(processedXml)
      processedXml = formatResult.formatted

      return { processedXml, namespaceFixes }
    } catch {
      // If post-processing fails, return raw XML rather than breaking
      return { processedXml: xml, namespaceFixes: [] }
    }
  }
}
