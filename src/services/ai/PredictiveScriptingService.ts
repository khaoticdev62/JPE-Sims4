/**
 * Predictive Scripting Service
 *
 * Provides context-aware AI suggestions and code completions
 * based on the current file content, project symbols, and user behavior.
 *
 * Uses pattern matching and AI to predict what the user wants to write next.
 */

import type { Completion } from '@/services/editor/SmartAutocompleteService'
import { PatternAnalysisService } from '@/services/ml/PatternAnalysisService'

export interface PredictionContext {
  /** Current file content */
  fileContent: string
  /** Cursor position */
  cursorPosition: number
  /** File type */
  fileType: 'jpe' | 'xml' | 'py'
  /** Available project symbols */
  projectSymbols?: string[]
  /** Recent user actions */
  recentActions?: string[]
}

export interface Prediction {
  /** Suggested code */
  code: string
  /** Confidence score 0-1 */
  confidence: number
  /** Description of what this does */
  description: string
  /** Prediction type */
  type: 'completion' | 'snippet' | 'block' | 'refactor'
}

/**
 * Predictive Scripting Service
 *
 * Analyzes context and provides intelligent code suggestions
 */
export class PredictiveScriptingService {
  private static instance: PredictiveScriptingService | null = null
  private readonly patternAnalysis: PatternAnalysisService

  private constructor() {
    this.patternAnalysis = new PatternAnalysisService()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PredictiveScriptingService {
    if (!this.instance) {
      this.instance = new PredictiveScriptingService()
    }
    return this.instance
  }

  /**
   * Get predictions based on context
   */
  getPredictions(context: PredictionContext): Prediction[] {
    const predictions: Prediction[] = []

    // Pattern-based predictions
    const patternPredictions = this.getPatternPredictions(context)
    predictions.push(...patternPredictions)

    // Context-based predictions
    const contextPredictions = this.getContextPredictions(context)
    predictions.push(...contextPredictions)

    // Sort by confidence
    return predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5) // Limit to top 5 predictions
  }

  /**
   * Get predictions based on learned patterns
   */
  private getPatternPredictions(context: PredictionContext): Prediction[] {
    const predictions: Prediction[] = []
    const lines = context.fileContent.split('\n')
    const currentLine = this.getCurrentLine(lines, context.cursorPosition)

    // Common JPE patterns
    if (currentLine.includes('WHEN') && !currentLine.includes('DO')) {
      predictions.push({
        code: ' DO\n  ',
        confidence: 0.95,
        description: 'Complete WHEN block with DO',
        type: 'completion',
      })
    }

    if (currentLine.includes('ONLY_IF') && !currentLine.includes('DO') && !currentLine.includes('END')) {
      predictions.push({
        code: '\n  ',
        confidence: 0.9,
        description: 'Add indented block after ONLY_IF',
        type: 'completion',
      })
    }

    return predictions
  }

  /**
   * Get predictions based on file context
   */
  private getContextPredictions(context: PredictionContext): Prediction[] {
    const predictions: Prediction[] = []
    const content = context.fileContent.toLowerCase()

    // If file mentions traits, suggest trait-related code
    if (content.includes('trait') && context.fileType === 'jpe') {
      predictions.push({
        code: 'WHEN sim_has_trait("${1:trait_name}") DO\n  ${0}\nEND',
        confidence: 0.7,
        description: 'Add trait check',
        type: 'snippet',
      })
    }

    // If file mentions buffs, suggest buff-related code
    if (content.includes('buff') && context.fileType === 'jpe') {
      predictions.push({
        code: 'interaction_apply_buff("${1:buff_name}")',
        confidence: 0.7,
        description: 'Apply buff to Sim',
        type: 'snippet',
      })
    }

    // If file has WHEN blocks but no ONLY_IF, suggest adding conditions
    if (content.includes('when') && !content.includes('only_if')) {
      predictions.push({
        code: '  ONLY_IF (${1:additional_condition})\n    ${0}\n  END',
        confidence: 0.5,
        description: 'Add guard clause to existing WHEN block',
        type: 'block',
      })
    }

    return predictions
  }

  /**
   * Get the current line based on cursor position
   */
  private getCurrentLine(lines: string[], cursorPosition: number): string {
    let charCount = 0
    for (let i = 0; i < lines.length; i++) {
      charCount += lines[i].length + 1 // +1 for newline
      if (cursorPosition <= charCount) {
        return lines[i]
      }
    }
    return lines[lines.length - 1] || ''
  }

  /**
   * Get next action prediction (what user is likely to do next)
   */
  predictNextAction(context: PredictionContext): string | null {
    const predictions = this.getPredictions(context)
    return predictions.length > 0 ? predictions[0].description : null
  }

  /**
   * Learn from user actions to improve future predictions
   */
  learnFromAction(_action: string, _context: PredictionContext): void {
    // TODO: Wire to PatternAnalysisService when method is available
    // this.patternAnalysis.recordPattern(action, context.fileContent)
    console.log('[PredictiveScripting] Learning from action (stub)')
  }
}
