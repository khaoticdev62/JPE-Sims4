/**
 * Semantic Validator
 *
 * Validates cross-file references, STBL keys, and enum values in a Sims 4 mod project.
 * Maintains registries of tuning IDs, STBL keys, and enum values.
 */

import type {
  SemanticError,
  SemanticValidationResult,
  TuningRegistry,
  STBLRegistry,
  EnumRegistry,
  SemanticValidatorConfig,
  TuningReference,
  EnumValidationContext,
  STBLKeyValidationContext,
} from './types/semantic'

/**
 * Semantic Validator class
 */
export class SemanticValidator {
  private tuningRegistry: TuningRegistry = {
    ids: new Map(),
    metadata: new Map(),
  }

  private stblRegistry: STBLRegistry = {
    keys: new Map(),
    files: new Map(),
  }

  private enumRegistry: EnumRegistry = {
    enums: new Map(),
  }

  private config: Required<SemanticValidatorConfig> = {
    checkTuningReferences: true,
    checkSTBLKeys: true,
    checkEnumValues: true,
    reportWarnings: true,
    maxErrors: 100,
  }

  /**
   * Create a new semantic validator
   */
  constructor(config?: SemanticValidatorConfig) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  /**
   * Register a tuning ID from parsed XML
   */
  registerTuningId(id: string, file: string, line: number, name?: string, type?: string): void {
    const normalizedId = this.normalizeTuningId(id)
    this.tuningRegistry.ids.set(normalizedId, file)
    this.tuningRegistry.metadata.set(normalizedId, {
      id: normalizedId,
      name,
      type,
      file,
      line,
    })
  }

  /**
   * Register an STBL key
   */
  registerSTBLKey(key: string, value: string, file: string): void {
    const normalizedKey = this.normalizeSTBLKey(key)
    this.stblRegistry.keys.set(normalizedKey, value)
    this.stblRegistry.files.set(normalizedKey, file)
  }

  /**
   * Register an enum with allowed values
   */
  registerEnum(enumName: string, values: string[]): void {
    this.enumRegistry.enums.set(enumName, values)
  }

  /**
   * Validate tuning references in a file
   */
  validateTuningReferences(file: string, content: string): SemanticError[] {
    if (!this.config.checkTuningReferences) {
      return []
    }

    const errors: SemanticError[] = []
    const references = this.extractTuningReferences(content, file)

    for (const ref of references) {
      // Check if tuning ID is registered
      if (!this.tuningRegistry.ids.has(ref.id)) {
        const metadata = this.tuningRegistry.metadata.get(ref.id)
        const suggestion = metadata
          ? `Tuning ID "${ref.id}" found in ${metadata.file}:${metadata.line}`
          : `Tuning ID "${ref.id}" not found in project. Make sure the file containing this tuning is included in your project.`

        errors.push({
          type: 'missing_reference',
          severity: 'error',
          message: `Tuning reference "${ref.id}" not found`,
          file: ref.file,
          line: ref.line,
          column: ref.column,
          value: ref.id,
          suggestion,
          relatedFile: metadata?.file,
          relatedLine: metadata?.line,
        })
      }
    }

    return errors
  }

  /**
   * Validate STBL keys in a file
   */
  validateSTBLKeys(file: string, content: string): SemanticError[] {
    if (!this.config.checkSTBLKeys) {
      return []
    }

    const errors: SemanticError[] = []
    const keys = this.extractSTBLKeys(content, file)

    for (const keyInfo of keys) {
      const normalizedKey = this.normalizeSTBLKey(keyInfo.key)

      // Check if STBL key is registered
      if (!this.stblRegistry.keys.has(normalizedKey)) {
        errors.push({
          type: 'invalid_stbl_key',
          severity: 'error',
          message: `STBL key "${keyInfo.key}" not found in any STBL file`,
          file: keyInfo.file,
          line: keyInfo.line,
          column: 0,
          value: keyInfo.key,
          suggestion: `Add this key to your STBL files or update the reference to use an existing key.`,
          relatedFile: this.stblRegistry.files.get(normalizedKey),
        })
      }
    }

    return errors
  }

  /**
   * Validate enum values in a file
   */
  validateEnumValues(file: string, content: string): SemanticError[] {
    if (!this.config.checkEnumValues) {
      return []
    }

    const errors: SemanticError[] = []
    const enumRefs = this.extractEnumReferences(content, file)

    for (const enumRef of enumRefs) {
      const allowedValues = this.enumRegistry.enums.get(enumRef.enumName)

      if (!allowedValues) {
        // Enum not registered - warning only
        if (this.config.reportWarnings) {
          errors.push({
            type: 'invalid_enum',
            severity: 'warning',
            message: `Enum "${enumRef.enumName}" not defined`,
            file: enumRef.file,
            line: enumRef.line,
            column: 0,
            value: enumRef.enumName,
            suggestion: `Register this enum or remove the reference if it's not needed.`,
          })
        }
      } else if (!allowedValues.includes(enumRef.value)) {
        // Value not in allowed list - error
        errors.push({
          type: 'invalid_enum',
          severity: 'error',
          message: `Invalid enum value "${enumRef.value}" for enum "${enumRef.enumName}"`,
          file: enumRef.file,
          line: enumRef.line,
          column: 0,
          value: enumRef.value,
          suggestion: `Use one of: ${allowedValues.slice(0, 3).join(', ')}${allowedValues.length > 3 ? '...' : ''}`,
        })
      }
    }

    return errors
  }

  /**
   * Validate an entire project
   */
  validateProject(files: Map<string, string>): SemanticValidationResult {
    const startTime = performance.now()
    const errors: SemanticError[] = []
    const warnings: SemanticError[] = []

    let referencesChecked = 0
    let enumsValidated = 0
    let stblKeysChecked = 0

    // Validate each file
    for (const [file, content] of files) {
      const tuningErrors = this.validateTuningReferences(file, content)
      const stblErrors = this.validateSTBLKeys(file, content)
      const enumErrors = this.validateEnumValues(file, content)

      referencesChecked += this.extractTuningReferences(content, file).length
      stblKeysChecked += this.extractSTBLKeys(content, file).length
      enumsValidated += this.extractEnumReferences(content, file).length

      for (const error of [...tuningErrors, ...stblErrors, ...enumErrors]) {
        if (error.severity === 'error') {
          errors.push(error)
        } else {
          warnings.push(error)
        }

        if (errors.length >= this.config.maxErrors) {
          break
        }
      }

      if (errors.length >= this.config.maxErrors) {
        break
      }
    }

    const validationTime = performance.now() - startTime

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        filesValidated: files.size,
        referencesChecked,
        enumsValidated,
        stblKeysChecked,
      },
      validationTime,
    }
  }

  /**
   * Extract tuning references (ref:TuningId) from content
   */
  private extractTuningReferences(content: string, file: string): TuningReference[] {
    const references: TuningReference[] = []
    const lines = content.split('\n')

    // Match patterns like: ref:12345, ref:0x123ABC, id="12345"
    const refPattern = /ref[_:]?(0x[0-9A-Fa-f]+|\d+)/gi
    const idPattern = /id\s*=\s*["']?(0x[0-9A-Fa-f]+|\d+)["']?/gi

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum]
      let match

      // Find ref: references
      while ((match = refPattern.exec(line)) !== null) {
        references.push({
          id: match[1],
          file,
          line: lineNum + 1,
          column: match.index,
          context: line.trim(),
        })
      }

      // Find id= references (Sims 4 style)
      while ((match = idPattern.exec(line)) !== null) {
        references.push({
          id: match[1],
          file,
          line: lineNum + 1,
          column: match.index,
          context: line.trim(),
        })
      }
    }

    return references
  }

  /**
   * Extract STBL key references from content
   */
  private extractSTBLKeys(content: string, file: string): STBLKeyValidationContext[] {
    const keys: STBLKeyValidationContext[] = []
    const lines = content.split('\n')

    // Match patterns like: 0x123ABC, key="0x123ABC"
    const keyPattern = /0x[0-9A-Fa-f]{8}/gi

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum]
      let match

      while ((match = keyPattern.exec(line)) !== null) {
        keys.push({
          key: match[0],
          file,
          line: lineNum + 1,
          context: line.trim(),
        })
      }
    }

    return keys
  }

  /**
   * Extract enum references from content
   */
  private extractEnumReferences(content: string, file: string): EnumValidationContext[] {
    const refs: EnumValidationContext[] = []
    const lines = content.split('\n')

    // Match patterns like: EnumName.VALUE, enum="VALUE"
    const enumPattern = /([A-Z][a-zA-Z0-9_]*)[.=\s]+([A-Z][A-Z0-9_]*)/g

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum]
      let match

      while ((match = enumPattern.exec(line)) !== null) {
        const enumName = match[1]
        const value = match[2]

        // Only add if this enum is registered
        if (this.enumRegistry.enums.has(enumName)) {
          refs.push({
            enumName,
            value,
            allowedValues: this.enumRegistry.enums.get(enumName) || [],
            file,
            line: lineNum + 1,
          })
        }
      }
    }

    return refs
  }

  /**
   * Normalize tuning ID to standard format
   */
  private normalizeTuningId(id: string): string {
    // If it's a hex string, normalize to lowercase
    if (id.startsWith('0x')) {
      return id.toLowerCase()
    }
    // If it's a decimal number, convert to hex for consistency
    if (/^\d+$/.test(id)) {
      return '0x' + parseInt(id, 10).toString(16).toLowerCase()
    }
    return id.toLowerCase()
  }

  /**
   * Normalize STBL key to standard format
   */
  private normalizeSTBLKey(key: string): string {
    if (key.startsWith('0x')) {
      return key.toLowerCase()
    }
    return '0x' + key.toLowerCase()
  }

  /**
   * Get tuning registry
   */
  getTuningRegistry(): TuningRegistry {
    return this.tuningRegistry
  }

  /**
   * Get STBL registry
   */
  getSTBLRegistry(): STBLRegistry {
    return this.stblRegistry
  }

  /**
   * Get enum registry
   */
  getEnumRegistry(): EnumRegistry {
    return this.enumRegistry
  }

  /**
   * Clear all registries
   */
  clearRegistries(): void {
    this.tuningRegistry = {
      ids: new Map(),
      metadata: new Map(),
    }
    this.stblRegistry = {
      keys: new Map(),
      files: new Map(),
    }
    this.enumRegistry = {
      enums: new Map(),
    }
  }

  /**
   * Set config options
   */
  setConfig(config: Partial<SemanticValidatorConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

/**
 * Helper function to create a validator
 */
export function createSemanticValidator(config?: SemanticValidatorConfig): SemanticValidator {
  return new SemanticValidator(config)
}
