/**
 * CompilerService handles all compilation and parsing operations
 * Integrates with the translation engine
 */

import { XMLParser } from '@engine/parsers/XMLParser'
import type { ModFile, ValidationResult, Diagnostic } from '@types/index'

export class CompilerService {
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
   * Compile JPE back to original format
   */
  static async compileFromJPE(
    jpeContent: string,
    targetFormat: string
  ): Promise<string | null> {
    try {
      // Delegate to format-specific compiler
      // For now, return the original format
      console.warn(`Compilation to ${targetFormat} not yet implemented`)
      return jpeContent
    } catch (error) {
      console.error('Failed to compile from JPE', error)
      return null
    }
  }

  /**
   * Validate a file for errors
   */
  static async validateFile(file: ModFile): Promise<ValidationResult> {
    try {
      if (file.type === 'xml') {
        return XMLParser.validate(file.content)
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
