/**
 * Config Parser
 *
 * Parses JSON and YAML configuration files for Sims 4 mod projects.
 * Validates configuration structure and provides defaults.
 *
 * Supported formats:
 * - JSON (strict)
 * - YAML (basic subset)
 */

import type {
  ProjectConfig,
  ConfigParseResult,
  ConfigError,
  ConfigWarning,
} from './types/config'
import {
  DEFAULT_CONFIG,
  detectConfigFormat,
  parseJSON,
  parseYAML,
} from './types/config'

/**
 * Configuration parser
 */
export class ConfigParser {
  /**
   * Parse configuration file content (JSON or YAML)
   */
  static parse(content: string, _filename?: string): ConfigParseResult {
    const startTime = performance.now()
    const errors: ConfigError[] = []
    const warnings: ConfigWarning[] = []

    try {
      // Detect format
      const format = detectConfigFormat(content)

      // Parse content
      let parsed: any
      try {
        if (format === 'json') {
          parsed = parseJSON(content)
        } else {
          parsed = parseYAML(content)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown parse error'
        return {
          success: false,
          errors: [
            {
              field: 'root',
              message: `Failed to parse ${format.toUpperCase()}: ${message}`,
              type: 'invalid',
            },
          ],
          warnings: [],
          metadata: {
            format,
            parseTime: performance.now() - startTime,
          },
        }
      }

      // Validate structure
      this.validateConfig(parsed, errors, warnings)

      // Build final config with defaults
      const config = this.mergeWithDefaults(parsed)

      const parseTime = performance.now() - startTime

      return {
        success: errors.length === 0,
        config,
        errors,
        warnings,
        metadata: {
          format,
          parseTime,
        },
      }
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: 'root',
            message: error instanceof Error ? error.message : 'Unknown error',
            type: 'invalid',
          },
        ],
        warnings: [],
        metadata: {
          format: 'json',
          parseTime: performance.now() - startTime,
        },
      }
    }
  }

  /**
   * Validate configuration structure
   */
  private static validateConfig(config: any, errors: ConfigError[], warnings: ConfigWarning[]): void {
    if (typeof config !== 'object' || config === null) {
      errors.push({
        field: 'root',
        message: 'Configuration must be an object',
        type: 'type_error',
        value: config,
      })
      return
    }

    // Check required metadata
    if (!config.metadata) {
      errors.push({
        field: 'metadata',
        message: 'Metadata section is required',
        type: 'missing',
      })
    } else {
      this.validateMetadata(config.metadata, errors, warnings)
    }

    // Validate optional sections
    if (config.files) {
      this.validateFiles(config.files, errors, warnings)
    }

    if (config.build) {
      this.validateBuild(config.build, errors, warnings)
    }

    if (config.validation) {
      this.validateValidation(config.validation, errors, warnings)
    }
  }

  /**
   * Validate metadata section
   */
  private static validateMetadata(metadata: any, errors: ConfigError[], warnings: ConfigWarning[]): void {
    if (typeof metadata !== 'object' || metadata === null) {
      errors.push({
        field: 'metadata',
        message: 'Metadata must be an object',
        type: 'type_error',
        value: metadata,
      })
      return
    }

    // Check required fields
    if (!metadata.name) {
      errors.push({
        field: 'metadata.name',
        message: 'Project name is required',
        type: 'missing',
      })
    } else if (typeof metadata.name !== 'string') {
      errors.push({
        field: 'metadata.name',
        message: 'Project name must be a string',
        type: 'type_error',
        value: metadata.name,
      })
    }

    if (!metadata.version) {
      errors.push({
        field: 'metadata.version',
        message: 'Project version is required',
        type: 'missing',
      })
    } else if (!this.isValidVersion(metadata.version)) {
      warnings.push({
        field: 'metadata.version',
        message: `Version "${metadata.version}" does not follow semantic versioning (e.g., 1.0.0)`,
        suggestion: 'Use semantic versioning format (MAJOR.MINOR.PATCH)',
      })
    }

    // Validate optional fields
    if (metadata.author && typeof metadata.author !== 'string') {
      errors.push({
        field: 'metadata.author',
        message: 'Author must be a string',
        type: 'type_error',
        value: metadata.author,
      })
    }

    if (metadata.description && typeof metadata.description !== 'string') {
      errors.push({
        field: 'metadata.description',
        message: 'Description must be a string',
        type: 'type_error',
        value: metadata.description,
      })
    }
  }

  /**
   * Validate files section
   */
  private static validateFiles(files: any, errors: ConfigError[], _warnings: ConfigWarning[]): void {
    if (typeof files !== 'object' || files === null) {
      errors.push({
        field: 'files',
        message: 'Files section must be an object',
        type: 'type_error',
        value: files,
      })
      return
    }

    // Check file patterns are arrays
    for (const [key, value] of Object.entries(files)) {
      if (!Array.isArray(value)) {
        errors.push({
          field: `files.${key}`,
          message: `File patterns must be an array`,
          type: 'type_error',
          value,
        })
      } else {
        // Validate array contents are strings
        for (let i = 0; i < (value as any[]).length; i++) {
          if (typeof value[i] !== 'string') {
            errors.push({
              field: `files.${key}[${i}]`,
              message: 'File pattern must be a string',
              type: 'type_error',
              value: value[i],
            })
          }
        }
      }
    }
  }

  /**
   * Validate build section
   */
  private static validateBuild(build: any, errors: ConfigError[], _warnings: ConfigWarning[]): void {
    if (typeof build !== 'object' || build === null) {
      errors.push({
        field: 'build',
        message: 'Build section must be an object',
        type: 'type_error',
        value: build,
      })
      return
    }

    // Validate field types
    if (build.outputDir && typeof build.outputDir !== 'string') {
      errors.push({
        field: 'build.outputDir',
        message: 'Output directory must be a string',
        type: 'type_error',
        value: build.outputDir,
      })
    }

    if (build.packageName && typeof build.packageName !== 'string') {
      errors.push({
        field: 'build.packageName',
        message: 'Package name must be a string',
        type: 'type_error',
        value: build.packageName,
      })
    }

    if (build.compress !== undefined && typeof build.compress !== 'boolean') {
      errors.push({
        field: 'build.compress',
        message: 'Compress must be a boolean',
        type: 'type_error',
        value: build.compress,
      })
    }

    if (build.includeSources !== undefined && typeof build.includeSources !== 'boolean') {
      errors.push({
        field: 'build.includeSources',
        message: 'Include sources must be a boolean',
        type: 'type_error',
        value: build.includeSources,
      })
    }
  }

  /**
   * Validate validation section
   */
  private static validateValidation(validation: any, errors: ConfigError[], _warnings: ConfigWarning[]): void {
    if (typeof validation !== 'object' || validation === null) {
      errors.push({
        field: 'validation',
        message: 'Validation section must be an object',
        type: 'type_error',
        value: validation,
      })
      return
    }

    // Validate field types
    const booleanFields = ['strictMode', 'checkReferences', 'validateEnums', 'reportWarnings']
    for (const field of booleanFields) {
      if (validation[field] !== undefined && typeof validation[field] !== 'boolean') {
        errors.push({
          field: `validation.${field}`,
          message: `${field} must be a boolean`,
          type: 'type_error',
          value: validation[field],
        })
      }
    }
  }

  /**
   * Check if version string is valid semantic version
   */
  private static isValidVersion(version: string): boolean {
    const semverRegex = /^\d+\.\d+\.\d+(-[a-z0-9]+)?(\+[a-z0-9]+)?$/i
    return semverRegex.test(version)
  }

  /**
   * Merge parsed config with defaults
   */
  private static mergeWithDefaults(parsed: any): ProjectConfig {
    const result: ProjectConfig = {
      metadata: {
        name: parsed.metadata?.name || DEFAULT_CONFIG.metadata.name,
        version: parsed.metadata?.version || DEFAULT_CONFIG.metadata.version,
        author: parsed.metadata?.author,
        description: parsed.metadata?.description,
        license: parsed.metadata?.license,
        homepage: parsed.metadata?.homepage,
        repository: parsed.metadata?.repository,
        keywords: parsed.metadata?.keywords,
      },
      files: {
        tuning: parsed.files?.tuning || DEFAULT_CONFIG.files?.tuning,
        strings: parsed.files?.strings || DEFAULT_CONFIG.files?.strings,
        scripts: parsed.files?.scripts || DEFAULT_CONFIG.files?.scripts,
        other: parsed.files?.other,
      },
      build: {
        outputDir: parsed.build?.outputDir ?? DEFAULT_CONFIG.build?.outputDir,
        packageName: parsed.build?.packageName ?? DEFAULT_CONFIG.build?.packageName,
        compress: parsed.build?.compress ?? DEFAULT_CONFIG.build?.compress,
        includeSources: parsed.build?.includeSources ?? DEFAULT_CONFIG.build?.includeSources,
      },
      validation: {
        strictMode: parsed.validation?.strictMode ?? DEFAULT_CONFIG.validation?.strictMode,
        checkReferences: parsed.validation?.checkReferences ?? DEFAULT_CONFIG.validation?.checkReferences,
        validateEnums: parsed.validation?.validateEnums ?? DEFAULT_CONFIG.validation?.validateEnums,
        reportWarnings: parsed.validation?.reportWarnings ?? DEFAULT_CONFIG.validation?.reportWarnings,
      },
      customFields: parsed.customFields || {},
    }

    // Preserve any custom fields not in standard structure
    for (const [key, value] of Object.entries(parsed)) {
      if (!['metadata', 'files', 'build', 'validation', 'customFields'].includes(key)) {
        result.customFields![key] = value
      }
    }

    return result
  }

  /**
   * Create a new default configuration
   */
  static createDefault(name: string, version: string = '1.0.0'): ProjectConfig {
    const config = JSON.parse(JSON.stringify(DEFAULT_CONFIG))
    config.metadata.name = name
    config.metadata.version = version
    return config
  }

  /**
   * Validate a complete configuration object
   */
  static validate(config: ProjectConfig): { valid: boolean; errors: ConfigError[]; warnings: ConfigWarning[] } {
    const errors: ConfigError[] = []
    const warnings: ConfigWarning[] = []

    this.validateMetadata(config.metadata, errors, warnings)
    if (config.files) this.validateFiles(config.files, errors, warnings)
    if (config.build) this.validateBuild(config.build, errors, warnings)
    if (config.validation) this.validateValidation(config.validation, errors, warnings)

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
}

/**
 * Quick helper function to parse config
 */
export function parseConfig(content: string, filename?: string): ConfigParseResult {
  return ConfigParser.parse(content, filename)
}
