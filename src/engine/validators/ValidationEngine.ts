/**
 * ValidationEngine provides real-time validation with detailed diagnostics
 * Checks for syntax errors, semantic issues, and best practices
 */

import type { Diagnostic, ValidationResult } from '@/types/index'
import type { ValidationRule } from './ValidationRule'

// Import rules
import { XMLDeclarationRule } from './rules/XMLDeclarationRule'
import { TagMatchingRule } from './rules/TagMatchingRule'
import { TagNestingRule } from './rules/TagNestingRule'
import { AttributeQuotesRule } from './rules/AttributeQuotesRule'
import { SpecialCharacterRule } from './rules/SpecialCharacterRule'
import { ModuleDeclarationRule } from './rules/ModuleDeclarationRule'
import { JpeSyntaxRule } from './rules/JpeSyntaxRule'
import { DescriptionRequiredRule } from './rules/DescriptionRequiredRule'
import { IndentationRule } from './rules/IndentationRule'
import { LocalizationCompletenessRule } from './rules/LocalizationCompletenessRule'
import { CompatibilityWarningRule } from './rules/CompatibilityWarningRule'
import { ReferenceRule } from './rules/ReferenceRule'

export type { ValidationRule }

export class ValidationEngine {
  private static readonly rules: ValidationRule[] = [
    XMLDeclarationRule,
    TagMatchingRule,
    TagNestingRule,
    AttributeQuotesRule,
    SpecialCharacterRule,
    ModuleDeclarationRule,
    JpeSyntaxRule,
    DescriptionRequiredRule,
    IndentationRule,
    LocalizationCompletenessRule,
    CompatibilityWarningRule,
    ReferenceRule,
  ]

  /**
   * Run validation rules for a specific language
   */
  static validate(content: string, language: 'xml' | 'jpe' = 'xml'): ValidationResult {
    const allDiagnostics: Diagnostic[] = []
    const allWarnings: string[] = []
    let isValid = true

    for (const rule of this.rules) {
      // Filter rules based on language prefix
      if (language === 'xml' && !rule.id.startsWith('xml')) continue
      if (language === 'jpe' && !rule.id.startsWith('jpe')) continue

      const result = rule.check(content)

      allDiagnostics.push(...result.diagnostics)
      allWarnings.push(...result.warnings)

      if (!result.valid && rule.severity === 'error') {
        isValid = false
      }
    }

    return {
      valid: isValid,
      diagnostics: allDiagnostics,
      warnings: allWarnings,
    }
  }

  /**
   * Validate specific rule
   */
  static validateRule(ruleId: string, content: string): ValidationResult | null {
    const rule = this.rules.find((r) => r.id === ruleId)
    if (!rule) return null
    return rule.check(content)
  }

  /**
   * Get all available rules
   */
  static getRules(): Array<{ id: string; name: string; severity: string }> {
    return this.rules.map((r) => ({
      id: r.id,
      name: r.name,
      severity: r.severity,
    }))
  }

  /**
   * Count diagnostics by severity
   */
  static countBySeverity(diagnostics: Diagnostic[]): {
    errors: number
    warnings: number
    infos: number
  } {
    return {
      errors: diagnostics.filter((d) => d.severity === 'error').length,
      warnings: diagnostics.filter((d) => d.severity === 'warning').length,
      infos: diagnostics.filter((d) => d.severity === 'info').length,
    }
  }
}