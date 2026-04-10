/**
 * Fix Suggestion Engine
 *
 * Generates intelligent fix suggestions for common JPE/XML errors.
 * Uses pattern matching, edit distance, and context analysis to suggest corrections.
 *
 * Common Fix Catalog:
 * - Misspelled keywords (WEN → WHEN)
 * - Missing block END
 * - Invalid references (suggest similar names)
 * - Syntax errors (malformed strings, operators)
 * - Missing required elements
 */

import type { Diagnostic } from '@/types/index'

/**
 * A suggested fix with confidence score and diff
 */
export interface FixSuggestion {
  /** Human-readable description */
  description: string
  /** Confidence score 0-1 */
  confidence: number
  /** Text range to replace */
  range: {
    startLine: number
    startColumn: number
    endLine: number
    endColumn: number
  }
  /** Replacement text */
  replacementText: string
  /** Fix category */
  category: FixCategory
  /** Optional diff preview */
  diffPreview?: string
}

/**
 * Fix categories for filtering and UI display
 */
export enum FixCategory {
  TYPO = 'typo',
  MISSING_KEYWORD = 'missing_keyword',
  MISSING_END = 'missing_end',
  INVALID_REFERENCE = 'invalid_reference',
  SYNTAX_ERROR = 'syntax_error',
  SUGGESTION = 'suggestion',
}

/**
 * Context for fix generation
 */
export interface FixContext {
  /** Full document content */
  document: string
  /** File type */
  fileType: 'jpe' | 'xml'
  /** Available symbols for reference suggestions */
  availableSymbols?: string[]
}

/**
 * Fix strategy interface
 */
export interface FixStrategy {
  /** Check if this strategy can handle the error */
  match(diagnostic: Diagnostic): boolean
  /** Generate fix suggestions */
  suggest(diagnostic: Diagnostic, context: FixContext): FixSuggestion[]
}

/**
 * Calculate Levenshtein edit distance between two strings
 */
function editDistance(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) => [i])
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Find closest matches from a list using edit distance
 */
function findClosestMatches(
  target: string,
  candidates: string[],
  maxDistance: number = 3,
): Array<{ word: string; distance: number }> {
  return candidates
    .map((word) => ({
      word,
      distance: editDistance(target.toLowerCase(), word.toLowerCase()),
    }))
    .filter((result) => result.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
}

// ─────────────────────────────────────────────────────────────
// Fix Strategies
// ─────────────────────────────────────────────────────────────

/**
 * Strategy: Misspelled JPE Keywords
 * Matches errors containing near-misses of JPE keywords
 */
export class MisspelledKeywordStrategy implements FixStrategy {
  private readonly JPE_KEYWORDS = [
    'WHEN',
    'DO',
    'ONLY_IF',
    'CONDITIONS',
    'LOCALIZATION',
    'NAMESPACE',
    'MODULE',
    'VERSION',
    'END',
    'AND',
    'OR',
    'NOT',
    'true',
    'false',
  ]

  match(diagnostic: Diagnostic): boolean {
    const msg = diagnostic.message.toLowerCase()
    return (
      msg.includes('unknown keyword') ||
      msg.includes('unexpected token') ||
      msg.includes('unrecognized')
    )
  }

  suggest(diagnostic: Diagnostic, _context: FixContext): FixSuggestion[] {
    const suggestions: FixSuggestion[] = []

    // Extract the problematic word from the error message
    const match = diagnostic.message.match(/['"`]([\w]+)['"`]/)
    if (!match) return suggestions

    const typo = match[1]
    const closest = findClosestMatches(typo, this.JPE_KEYWORDS, 2)

    for (const { word, distance } of closest) {
      const confidence = Math.max(0.3, 1 - distance * 0.25)

      suggestions.push({
        description: `Replace "${typo}" with "${word}"`,
        confidence,
        range: {
          startLine: diagnostic.line,
          startColumn: diagnostic.column,
          endLine: diagnostic.endLine || diagnostic.line,
          endColumn: diagnostic.endColumn || diagnostic.column + typo.length,
        },
        replacementText: word,
        category: FixCategory.TYPO,
        diffPreview: `${typo} → ${word}`,
      })
    }

    return suggestions.slice(0, 3)
  }
}

/**
 * Strategy: Missing END Block
 * Matches errors about unclosed blocks
 */
export class MissingEndStrategy implements FixStrategy {
  match(diagnostic: Diagnostic): boolean {
    const msg = diagnostic.message.toLowerCase()
    return (
      msg.includes('missing end') ||
      msg.includes('unclosed block') ||
      msg.includes('expected end') ||
      msg.includes('unterminated')
    )
  }

  suggest(diagnostic: Diagnostic, _context: FixContext): FixSuggestion[] {
    return [
      {
        description: 'Insert missing END',
        confidence: 0.95,
        range: {
          startLine: diagnostic.line,
          startColumn: diagnostic.column,
          endLine: diagnostic.line,
          endColumn: diagnostic.column,
        },
        replacementText: '\nEND',
        category: FixCategory.MISSING_END,
        diffPreview: '+ END',
      },
    ]
  }
}

/**
 * Strategy: Invalid References (undefined trait/buff/interaction)
 * Suggests similar names from available symbols
 */
export class InvalidReferenceStrategy implements FixStrategy {
  match(diagnostic: Diagnostic): boolean {
    const msg = diagnostic.message.toLowerCase()
    return (
      msg.includes('undefined') ||
      msg.includes('not found') ||
      msg.includes('unknown reference') ||
      msg.includes('missing definition')
    )
  }

  suggest(diagnostic: Diagnostic, context: FixContext): FixSuggestion[] {
    if (!context.availableSymbols || context.availableSymbols.length === 0) {
      return []
    }

    // Extract the undefined reference name
    const match = diagnostic.message.match(/['"`]([\w]+)['"`]/)
    if (!match) return []

    const undefinedRef = match[1]
    const closest = findClosestMatches(undefinedRef, context.availableSymbols, 3)

    return closest.map(({ word, distance }) => ({
      description: `Use "${word}" instead of "${undefinedRef}"`,
      confidence: Math.max(0.3, 1 - distance * 0.2),
      range: {
        startLine: diagnostic.line,
        startColumn: diagnostic.column,
        endLine: diagnostic.endLine || diagnostic.line,
        endColumn: diagnostic.endColumn || diagnostic.column + undefinedRef.length,
      },
      replacementText: word,
      category: FixCategory.INVALID_REFERENCE,
      diffPreview: `${undefinedRef} → ${word}`,
    }))
  }
}

/**
 * Strategy: Missing String Quotes
 * Matches errors about unterminated strings
 */
export class MissingQuoteStrategy implements FixStrategy {
  match(diagnostic: Diagnostic): boolean {
    const msg = diagnostic.message.toLowerCase()
    return (
      msg.includes('unterminated string') ||
      msg.includes('unclosed quote') ||
      msg.includes('missing quote')
    )
  }

  suggest(diagnostic: Diagnostic, context: FixContext): FixSuggestion[] {
    const lineStr = context.document.split('\n')[diagnostic.line - 1] || ''

    // Find the opening quote
    const lastQuote = lineStr.lastIndexOf('"', diagnostic.column - 1)
    if (lastQuote === -1) return []

    return [
      {
        description: 'Add closing quote',
        confidence: 0.9,
        range: {
          startLine: diagnostic.line,
          startColumn: lineStr.length,
          endLine: diagnostic.line,
          endColumn: lineStr.length,
        },
        replacementText: '"',
        category: FixCategory.SYNTAX_ERROR,
        diffPreview: '+ "',
      },
    ]
  }
}

/**
 * Strategy: Missing Colon in Key-Value
 * Matches errors about malformed assignments
 */
export class MissingColonStrategy implements FixStrategy {
  match(diagnostic: Diagnostic): boolean {
    const msg = diagnostic.message.toLowerCase()
    return (
      msg.includes('expected :') ||
      msg.includes('missing colon') ||
      msg.includes('invalid assignment')
    )
  }

  suggest(diagnostic: Diagnostic, _context: FixContext): FixSuggestion[] {
    return [
      {
        description: 'Insert missing colon',
        confidence: 0.85,
        range: {
          startLine: diagnostic.line,
          startColumn: diagnostic.column,
          endLine: diagnostic.line,
          endColumn: diagnostic.column,
        },
        replacementText: ': ',
        category: FixCategory.SYNTAX_ERROR,
        diffPreview: '+ :',
      },
    ]
  }
}

// ─────────────────────────────────────────────────────────────
// Fix Suggestion Engine
// ─────────────────────────────────────────────────────────────

/**
 * Configuration for the fix suggestion engine
 */
export interface FixSuggestionEngineConfig {
  /** Maximum suggestions per error (default: 3) */
  maxSuggestionsPerError?: number
  /** Minimum confidence threshold (default: 0.5) */
  minConfidence?: number
}

/**
 * Fix Suggestion Engine
 *
 * Generates ranked fix suggestions for diagnostics.
 * Uses multiple strategies to cover common error types.
 */
export class FixSuggestionEngine {
  private readonly strategies: FixStrategy[]
  private readonly maxSuggestions: number
  private readonly minConfidence: number

  constructor(config: FixSuggestionEngineConfig = {}) {
    this.strategies = [
      new MisspelledKeywordStrategy(),
      new MissingEndStrategy(),
      new InvalidReferenceStrategy(),
      new MissingQuoteStrategy(),
      new MissingColonStrategy(),
    ]
    this.maxSuggestions = config.maxSuggestionsPerError ?? 3
    this.minConfidence = config.minConfidence ?? 0.5
  }

  /**
   * Generate fix suggestions for a single diagnostic
   */
  generateFixes(
    diagnostic: Diagnostic,
    context: FixContext,
  ): FixSuggestion[] {
    const allSuggestions: FixSuggestion[] = []

    // Try each matching strategy
    for (const strategy of this.strategies) {
      if (strategy.match(diagnostic)) {
        const suggestions = strategy.suggest(diagnostic, context)
        allSuggestions.push(...suggestions)
      }
    }

    // Filter by confidence and sort
    return allSuggestions
      .filter((s) => s.confidence >= this.minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.maxSuggestions)
  }

  /**
   * Generate fixes for multiple diagnostics
   */
  generateFixesForDiagnostics(
    diagnostics: Diagnostic[],
    context: FixContext,
  ): Map<string, FixSuggestion[]> {
    const results = new Map<string, FixSuggestion[]>()

    for (const diagnostic of diagnostics) {
      const fixes = this.generateFixes(diagnostic, context)
      if (fixes.length > 0) {
        results.set(diagnostic.id || diagnostic.message, fixes)
      }
    }

    return results
  }

  /**
   * Get available fix categories
   */
  getAvailableCategories(): FixCategory[] {
    return Object.values(FixCategory)
  }
}

/**
 * Convenience function for quick fix generation
 */
export function generateFixes(
  diagnostic: Diagnostic,
  context: FixContext,
  config?: FixSuggestionEngineConfig,
): FixSuggestion[] {
  const engine = new FixSuggestionEngine(config)
  return engine.generateFixes(diagnostic, context)
}
