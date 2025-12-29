/**
 * Diagnostic Type Definitions
 *
 * Defines types for formatted diagnostics, error codes, and suggestions.
 */

/**
 * Severity level of a diagnostic
 */
export type DiagnosticSeverity = 'error' | 'warning' | 'info' | 'hint'

/**
 * Category of diagnostic
 */
export type DiagnosticCategory =
  | 'syntax'
  | 'reference'
  | 'type'
  | 'semantic'
  | 'performance'
  | 'style'
  | 'other'

/**
 * Formatted diagnostic message
 */
export interface FormattedDiagnostic {
  // Unique error code (e.g., "E001", "W002")
  code: string
  // Severity level
  severity: DiagnosticSeverity
  // Human-readable message
  message: string
  // Location in source file
  location: DiagnosticLocation
  // Category for grouping
  category: DiagnosticCategory
  // Suggestion for fixing the issue
  suggestion?: string
  // Example of correct usage
  example?: string
  // Related documentation link
  docLink?: string
  // Related diagnostics
  relatedInfo?: RelatedDiagnosticInfo[]
  // Tags for filtering/sorting
  tags?: string[]
}

/**
 * Location of a diagnostic in source code
 */
export interface DiagnosticLocation {
  file: string
  line: number // 1-based
  column: number // 0-based (matches LSP convention)
  length?: number // Length of problematic text
  endLine?: number // For multiline issues
  endColumn?: number
}

/**
 * Related diagnostic information
 */
export interface RelatedDiagnosticInfo {
  location: DiagnosticLocation
  message: string
}

/**
 * Diagnostic with raw error data
 */
export interface DiagnosticInput {
  type: string
  severity: 'error' | 'warning'
  message: string
  file: string
  line: number
  column: number
  value: string
  suggestion?: string
  relatedFile?: string
  relatedLine?: number
}

/**
 * Collection of formatted diagnostics
 */
export interface DiagnosticReport {
  // File being reported on
  file: string
  // Total diagnostics
  totalCount: number
  // Errors
  errors: FormattedDiagnostic[]
  // Warnings
  warnings: FormattedDiagnostic[]
  // Info messages
  info: FormattedDiagnostic[]
  // Summary statistics
  stats: DiagnosticStats
}

/**
 * Diagnostic statistics
 */
export interface DiagnosticStats {
  totalErrors: number
  totalWarnings: number
  totalInfo: number
  byCategory: Record<DiagnosticCategory, number>
  bySeverity: Record<DiagnosticSeverity, number>
}

/**
 * Suggestion for fixing a diagnostic
 */
export interface DiagnosticSuggestion {
  title: string
  description: string
  edit?: TextEdit // The actual code change to apply
  command?: DiagnosticCommand
}

/**
 * Text edit to apply to a file
 */
export interface TextEdit {
  range: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
  newText: string
}

/**
 * Command to execute for a fix
 */
export interface DiagnosticCommand {
  title: string
  command: string
  arguments?: any[]
}

/**
 * Diagnostic rule definition
 */
export interface DiagnosticRule {
  code: string
  name: string
  description: string
  category: DiagnosticCategory
  severity: DiagnosticSeverity
  // Pattern to match against error types
  matchPattern: (errorType: string) => boolean
  // Format message
  formatMessage: (error: DiagnosticInput) => string
  // Generate suggestion
  generateSuggestion: (error: DiagnosticInput) => string | undefined
}

/**
 * Diagnostic configuration
 */
export interface DiagnosticConfig {
  // Which diagnostic rules to enable
  enabledRules?: string[]
  // Override severity for specific rules
  ruleSeverityOverrides?: Record<string, DiagnosticSeverity>
  // Include documentation links
  includeDocs?: boolean
  // Include related information
  includeRelated?: boolean
  // Max diagnostics to report
  maxDiagnostics?: number
}

/**
 * Diagnostic collection for multiple files
 */
export interface DiagnosticCollection {
  // Diagnostics by file
  byFile: Map<string, DiagnosticReport>
  // All diagnostics sorted by location
  allDiagnostics: FormattedDiagnostic[]
  // Overall statistics
  stats: DiagnosticStats
}
