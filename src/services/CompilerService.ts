/**
 * CompilerService handles all compilation and parsing operations
 * Integrates with the translation engine
 */

import { XMLParser, type JPEModule } from '@/engine/parsers/XMLParser'
import { XMLCompiler } from '@/engine/compilers/XMLCompiler'
import { ValidationEngine } from '@/engine/validators/ValidationEngine'
import type { ModFile, ValidationResult, Diagnostic } from '@/types/index'
import { useActivityStore } from '@/stores/useActivityStore'
import { useProjectStore } from '@/stores/useProjectStore'

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

      // Log compilation activity on success
      const currentProject = useProjectStore.getState().currentProject
      if (currentProject) {
        const { addActivity } = useActivityStore.getState()
        addActivity({
          type: 'completed',
          fileName: file.name,
          projectName: currentProject.name,
          projectId: currentProject.id,
        })
      }

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
