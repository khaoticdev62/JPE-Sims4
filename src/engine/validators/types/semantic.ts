/**
 * Semantic Validation Type Definitions
 *
 * Defines types for cross-file validation rules including tuning references,
 * STBL key validation, and enum value validation.
 */

/**
 * Semantic validation error
 */
export interface SemanticError {
  type: 'missing_reference' | 'invalid_enum' | 'invalid_stbl_key' | 'duplicate_id'
  severity: 'error' | 'warning'
  message: string
  file: string
  line: number
  column: number
  // The problematic value (e.g., "ref:12345" or "MISSING_ENUM_VALUE")
  value: string
  // Suggestion for fixing the error
  suggestion?: string
  // Related information
  relatedFile?: string
  relatedLine?: number
}

/**
 * Project-wide validation result
 */
export interface SemanticValidationResult {
  valid: boolean
  errors: SemanticError[]
  warnings: SemanticError[]
  // Statistics about what was validated
  stats: {
    filesValidated: number
    referencesChecked: number
    enumsValidated: number
    stblKeysChecked: number
  }
  // Timing information
  validationTime: number
}

/**
 * Registry of all tuning IDs in the project
 */
export interface TuningRegistry {
  // Map of tuning ID (as hex string) to file path
  ids: Map<string, string>
  // Map of tuning ID to metadata
  metadata: Map<string, TuningMetadata>
}

/**
 * Metadata about a tuning instance
 */
export interface TuningMetadata {
  id: string
  name?: string
  type?: string // e.g., "Trait", "Buff", "Object"
  file: string
  line: number
}

/**
 * STBL registry for validating string table keys
 */
export interface STBLRegistry {
  // Map of key (hex string) to value
  keys: Map<string, string>
  // Map of key to file path
  files: Map<string, string>
}

/**
 * Enum value registry for validation
 */
export interface EnumRegistry {
  // Map of enum name to allowed values
  enums: Map<string, string[]>
}

/**
 * Configuration for semantic validator
 */
export interface SemanticValidatorConfig {
  // Whether to check for missing tuning references
  checkTuningReferences?: boolean
  // Whether to validate STBL keys
  checkSTBLKeys?: boolean
  // Whether to validate enum values
  checkEnumValues?: boolean
  // Whether to report warnings in addition to errors
  reportWarnings?: boolean
  // Maximum number of errors to report
  maxErrors?: number
}

/**
 * AST node with location information
 */
export interface ASTNodeWithLocation {
  type: string
  value?: any
  file: string
  line: number
  column: number
  children?: ASTNodeWithLocation[]
}

/**
 * Tuning reference found in XML
 */
export interface TuningReference {
  id: string
  file: string
  line: number
  column: number
  context: string // The element or attribute containing the reference
}

/**
 * Enum value validation error
 */
export interface EnumValidationContext {
  enumName: string
  value: string
  allowedValues: string[]
  file: string
  line: number
}

/**
 * STBL key validation error
 */
export interface STBLKeyValidationContext {
  key: string
  file: string
  line: number
  context: string // The element or attribute containing the key
}
