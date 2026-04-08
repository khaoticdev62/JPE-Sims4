/**
 * Diagnostic Formatter
 *
 * Formats validation errors into user-friendly diagnostic messages with suggestions.
 */

import type {
  FormattedDiagnostic,
  DiagnosticInput,
  DiagnosticReport,
  DiagnosticSeverity,
  DiagnosticRule,
  DiagnosticConfig,
  DiagnosticCollection,
  DiagnosticStats,
} from './types/diagnostic'

/**
 * Default diagnostic rules
 */
const DEFAULT_RULES: DiagnosticRule[] = [
  {
    code: 'E001',
    name: 'Missing Tuning Reference',
    description: 'Tuning ID reference not found in project',
    category: 'reference',
    severity: 'error',
    matchPattern: (type) => type === 'missing_reference',
    formatMessage: (error) =>
      `Tuning reference "${error.value}" not found. Make sure the file containing this tuning ID is included in your project.`,
    generateSuggestion: (error) =>
      `Check that the mod file containing tuning ID ${error.value} is in your project folder.`,
  },
  {
    code: 'E002',
    name: 'Invalid STBL Key',
    description: 'STBL string table key not found',
    category: 'reference',
    severity: 'error',
    matchPattern: (type) => type === 'invalid_stbl_key',
    formatMessage: (error) => `STBL key "${error.value}" not found in any string table file.`,
    generateSuggestion: (error) =>
      `Verify the STBL key ${error.value} exists in your strings files, or update the reference to use a correct key.`,
  },
  {
    code: 'E003',
    name: 'Invalid Enum Value',
    description: 'Enum value not in allowed list',
    category: 'semantic',
    severity: 'error',
    matchPattern: (type) => type === 'invalid_enum',
    formatMessage: (error) => `Value "${error.value}" is not a valid enum value.`,
    generateSuggestion: (error) => `Use one of the allowed enum values instead of "${error.value}".`,
  },
  {
    code: 'W001',
    name: 'Undefined Enum',
    description: 'Enum type not defined',
    category: 'semantic',
    severity: 'warning',
    matchPattern: (type) => type === 'invalid_enum',
    formatMessage: (error) => `Enum "${error.value}" is not defined in this project.`,
    generateSuggestion: (error) =>
      `Define the enum "${error.value}" or remove the reference if not needed.`,
  },
]

/**
 * Diagnostic Formatter class
 */
export class DiagnosticFormatter {
  private rules: Map<string, DiagnosticRule> = new Map()
  private config: Required<DiagnosticConfig> = {
    enabledRules: [],
    ruleSeverityOverrides: {},
    includeDocs: false,
    includeRelated: true,
    maxDiagnostics: 1000,
  }

  private nextErrorCode = 1
  private errorCodeMap: Map<string, string> = new Map()

  /**
   * Create a new diagnostic formatter
   */
  constructor(config?: DiagnosticConfig) {
    // Register default rules
    for (const rule of DEFAULT_RULES) {
      this.rules.set(rule.code, rule)
    }

    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  /**
   * Register a custom diagnostic rule
   */
  registerRule(rule: DiagnosticRule): void {
    this.rules.set(rule.code, rule)
  }

  /**
   * Format a diagnostic input into a formatted diagnostic
   */
  formatDiagnostic(input: DiagnosticInput): FormattedDiagnostic {
    // Find matching rule
    let rule: DiagnosticRule | undefined

    for (const r of this.rules.values()) {
      if (r.matchPattern(input.type)) {
        rule = r
        break
      }
    }

    // Create generic diagnostic if no rule found
    if (!rule) {
      return this.createGenericDiagnostic(input)
    }

    // Get severity (apply overrides)
    const severity =
      (this.config.ruleSeverityOverrides[rule.code] as DiagnosticSeverity) || rule.severity

    // Generate suggestion
    const suggestion = rule.generateSuggestion(input)

    // Format message
    const message = rule.formatMessage(input)

    const diagnostic: FormattedDiagnostic = {
      code: rule.code,
      severity,
      message,
      location: {
        file: input.file,
        line: input.line,
        column: input.column,
      },
      category: rule.category,
      suggestion,
      tags: [`rule:${rule.code}`],
    }

    // Add documentation link if enabled
    if (this.config.includeDocs) {
      diagnostic.docLink = this.getDocumentationLink(rule.code)
    }

    return diagnostic
  }

  /**
   * Format multiple diagnostics
   */
  formatDiagnostics(inputs: DiagnosticInput[]): FormattedDiagnostic[] {
    const diagnostics: FormattedDiagnostic[] = []

    for (const input of inputs) {
      if (diagnostics.length >= this.config.maxDiagnostics) {
        break
      }

      diagnostics.push(this.formatDiagnostic(input))
    }

    return diagnostics
  }

  /**
   * Create a diagnostic report for a file
   */
  createReport(file: string, inputs: DiagnosticInput[]): DiagnosticReport {
    const formatted = this.formatDiagnostics(inputs)

    // Separate by severity
    const errors = formatted.filter((d) => d.severity === 'error')
    const warnings = formatted.filter((d) => d.severity === 'warning')
    const info = formatted.filter((d) => d.severity === 'info')

    // Calculate statistics
    const stats = this.calculateStats(formatted)

    return {
      file,
      totalCount: formatted.length,
      errors,
      warnings,
      info,
      stats,
    }
  }

  /**
   * Create a collection of reports for multiple files
   */
  createCollection(fileInputs: Map<string, DiagnosticInput[]>): DiagnosticCollection {
    const byFile = new Map<string, DiagnosticReport>()
    const allDiagnostics: FormattedDiagnostic[] = []

    for (const [file, inputs] of fileInputs) {
      const report = this.createReport(file, inputs)
      byFile.set(file, report)

      allDiagnostics.push(...report.errors, ...report.warnings, ...report.info)
    }

    // Sort by location
    allDiagnostics.sort((a, b) => {
      if (a.location.file !== b.location.file) {
        return a.location.file.localeCompare(b.location.file)
      }
      if (a.location.line !== b.location.line) {
        return a.location.line - b.location.line
      }
      return a.location.column - b.location.column
    })

    const stats = this.calculateStats(allDiagnostics)

    return {
      byFile,
      allDiagnostics,
      stats,
    }
  }

  /**
   * Format diagnostic as human-readable string
   */
  formatAsString(diagnostic: FormattedDiagnostic): string {
    const severityIcon = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      hint: '💡',
    }

    const icon = severityIcon[diagnostic.severity]
    const location = `${diagnostic.location.file}:${diagnostic.location.line}:${diagnostic.location.column}`
    const code = diagnostic.code ? ` [${diagnostic.code}]` : ''

    let result = `${icon} ${diagnostic.severity.toUpperCase()}${code}: ${diagnostic.message}\n`
    result += `   at ${location}\n`

    if (diagnostic.suggestion) {
      result += `   💡 Suggestion: ${diagnostic.suggestion}\n`
    }

    return result
  }

  /**
   * Format report as human-readable string
   */
  formatReportAsString(report: DiagnosticReport): string {
    let result = `\n📋 Diagnostics for ${report.file}\n`
    result += `${'='.repeat(60)}\n`

    if (report.errors.length > 0) {
      result += `\n❌ Errors (${report.errors.length}):\n`
      for (const error of report.errors) {
        result += this.formatAsString(error)
      }
    }

    if (report.warnings.length > 0) {
      result += `\n⚠️  Warnings (${report.warnings.length}):\n`
      for (const warning of report.warnings) {
        result += this.formatAsString(warning)
      }
    }

    if (report.info.length > 0) {
      result += `\n ℹ️  Info (${report.info.length}):\n`
      for (const info of report.info) {
        result += this.formatAsString(info)
      }
    }

    // Add summary
    result += `\n${'-'.repeat(60)}\n`
    result += `📊 Summary: ${report.stats.totalErrors} errors, ${report.stats.totalWarnings} warnings\n`

    return result
  }

  /**
   * Create a generic diagnostic when no rule matches
   */
  private createGenericDiagnostic(input: DiagnosticInput): FormattedDiagnostic {
    const code = this.getOrCreateErrorCode(input.type)

    return {
      code,
      severity: input.severity,
      message: input.message,
      location: {
        file: input.file,
        line: input.line,
        column: input.column,
      },
      category: 'other',
      suggestion: input.suggestion,
      tags: ['generated'],
    }
  }

  /**
   * Calculate diagnostic statistics
   */
  private calculateStats(diagnostics: FormattedDiagnostic[]): DiagnosticStats {
    const stats: DiagnosticStats = {
      totalErrors: 0,
      totalWarnings: 0,
      totalInfo: 0,
      byCategory: {
        syntax: 0,
        reference: 0,
        type: 0,
        semantic: 0,
        performance: 0,
        style: 0,
        other: 0,
      },
      bySeverity: {
        error: 0,
        warning: 0,
        info: 0,
        hint: 0,
      },
    }

    for (const diag of diagnostics) {
      if (diag.severity === 'error') stats.totalErrors++
      else if (diag.severity === 'warning') stats.totalWarnings++
      else if (diag.severity === 'info') stats.totalInfo++

      stats.byCategory[diag.category]++
      stats.bySeverity[diag.severity]++
    }

    return stats
  }

  /**
   * Get documentation link for error code
   */
  private getDocumentationLink(code: string): string {
    const docBaseUrl = 'https://github.com/jpesims4/jpe-translator/docs/diagnostics'
    return `${docBaseUrl}#${code.toLowerCase()}`
  }

  /**
   * Get or create error code for unknown error types
   */
  private getOrCreateErrorCode(errorType: string): string {
    if (!this.errorCodeMap.has(errorType)) {
      const code = `E${(1000 + this.nextErrorCode).toString().slice(1)}`
      this.errorCodeMap.set(errorType, code)
      this.nextErrorCode++
    }

    return this.errorCodeMap.get(errorType)!
  }

  /**
   * Register custom error code
   */
  registerErrorCode(errorType: string, code: string): void {
    this.errorCodeMap.set(errorType, code)
  }

  /**
   * Get all registered rules
   */
  getRules(): DiagnosticRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<DiagnosticConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

/**
 * Helper function to create a formatter
 */
export function createDiagnosticFormatter(config?: DiagnosticConfig): DiagnosticFormatter {
  return new DiagnosticFormatter(config)
}
