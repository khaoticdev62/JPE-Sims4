/**
 * Transformation Service - JPE to XML
 *
 * Supports two modes:
 * 1. Python Backend Mode (production): Calls /api/transform endpoint
 * 2. TypeScript Engine Mode (development): Uses Gemini's TypeScript engine from src/engine_legacy
 *
 * Mode is selected via environment variable:
 * - NEXT_PUBLIC_TRANSFORM_MODE='python' (default in production)
 * - NEXT_PUBLIC_TRANSFORM_MODE='typescript' (uses TypeScript engine)
 */

import { XMLPrettyPrinter } from '@/engine/compilers/XMLPrettyPrinter'
import { XMLNamespaceValidator } from '@/engine/validation/XMLNamespaceValidator'

interface ParserError {
  message: string;
  line?: number;
  column?: number;
}

interface TransformResult {
  xml: string;
  errors: ParserError[];
  success: boolean;
  mode: 'python' | 'typescript';
  namespaceFixes?: string[];
  formattingApplied?: boolean;
}

/**
 * Transformation Service
 */
export class TransformationService {
  private static mode: 'python' | 'typescript' = 
    (process.env.NEXT_PUBLIC_TRANSFORM_MODE as 'python' | 'typescript') || 'python';

  /**
   * Transform JPE source code to XML
   * Automatically selects backend based on configuration
   */
  static async transformJPEToXML(source: string, fileName?: string): Promise<TransformResult> {
    if (this.mode === 'python') {
      return this.transformWithPython(source, fileName);
    } else {
      return this.transformWithTypeScript(source);
    }
  }

  /**
   * Transform using Python backend via API
   */
  private static async transformWithPython(source: string, fileName?: string): Promise<TransformResult> {
    try {
      // Native Electron IPC Bridge (Zero-Server)
      if (typeof window !== 'undefined' && window.electron?.transform) {
        const result = await window.electron.transform.run(source, fileName || 'input.jpe');

        // Post-process: Validate namespaces and pretty-print
        const { processedXml, namespaceFixes } = this.postProcessXml(result.xml || '');

        return {
          xml: processedXml,
          errors: result.errors || [],
          success: result.success,
          mode: 'python',
          namespaceFixes,
          formattingApplied: true,
        };
      }

      return {
        xml: '<!-- Transform engine not available -->',
        errors: [{ message: 'Native transform bridge not available. Ensure JPE Studio is running as a desktop application.' }],
        success: false,
        mode: 'python',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transformation failed';
      return {
        xml: `<!-- Transformation error: ${message} -->`,
        errors: [{ message }],
        success: false,
        mode: 'python',
      };
    }
  }

  /**
   * Transform using Gemini's TypeScript engine
   * Falls back to stub if engine is not available
   * Note: Uses dynamic imports to avoid bundling engine_legacy in production
   */
  private static async transformWithTypeScript(source: string): Promise<TransformResult> {
    try {
      // Use the active translation service lexer/parser
      const { JPELexer } = await import('@/services/translation/lexer');
      const { JPELogicParser } = await import('@/services/translation/parser');

      // 1. Tokenize
      const lexer = new JPELexer(source)
      const tokens = lexer.tokenize()

      // 2. Parse
      try {
        const parser = new JPELogicParser(tokens)
        parser.parse()
      } catch (parseError: any) {
        return {
          xml: '<!-- Transformation failed due to syntax errors -->',
          errors: [{ message: parseError.message || 'Syntax error in JPE source', line: 1, column: 1 }],
          success: false,
          mode: 'typescript',
        }
      }

      // 3. Translate to XML (simplified stub - full implementation requires translators)
      // For production, use Python backend
      return {
        xml: '<!-- TypeScript engine: Use Python backend for full transformation -->',
        errors: [{ message: 'TypeScript translator not available - using Python backend recommended' }],
        success: false,
        mode: 'typescript',
      };
    } catch (error) {
      // Fallback: return stub with error message
      const message = error instanceof Error ? error.message : 'TypeScript engine not available';
      console.warn('[TransformationService] TypeScript engine error:', message);
      
      return {
        xml: `<!-- ${message} - Using Python backend -->
<root>
  <I c="Stub">
    <T n="_display_name">JPE Transformation</T>
  </I>
</root>`,
        errors: [{ message }],
        success: false,
        mode: 'typescript',
      };
    }
  }

  /**
   * Get current transformation mode
   */
  static getMode(): 'python' | 'typescript' {
    return this.mode;
  }

  /**
   * Set transformation mode (for testing)
   */
  static setMode(mode: 'python' | 'typescript'): void {
    this.mode = mode;
  }

  /**
   * Post-process XML output: validate namespaces and pretty-print
   */
  private static postProcessXml(xml: string): { processedXml: string; namespaceFixes: string[] } {
    const namespaceFixes: string[] = []

    // Step 1: Validate and fix namespaces
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
  }
}
