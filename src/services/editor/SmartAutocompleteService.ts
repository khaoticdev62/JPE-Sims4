/**
 * Smart Autocomplete Service
 * Merges learned patterns with registry data for intelligent code completion
 */

import { PatternStore } from '@engine/ml/PatternStore'
import type { TuningPattern, EnumPattern, NamingPattern } from '@engine/ml/types'

export interface AutocompleteContext {
  fileContent: string
  position: number
  fileName: string
  prefix: string
}

export interface Completion {
  value: string
  label: string
  type: 'tuning' | 'enum' | 'pattern' | 'keyword'
  confidence: number
  frequency?: number
  source: 'registry' | 'learned'
  description?: string
}

export class SmartAutocompleteService {
  /**
   * Get smart completions based on context and learned patterns
   */
  static getCompletions(context: AutocompleteContext): Completion[] {
    // Get base completions from registry
    const baseCompletions = this.getBaseCompletions(context)

    // Get learned patterns for this context
    const _patterns = PatternStore.loadPatterns('default')
    if (!_patterns) {
      return baseCompletions
    }

    // Merge and score completions
    const merged = this.mergeCompletions(baseCompletions, _patterns, context)

    // Sort by confidence and frequency
    return merged
      .sort((a, b) => {
        const scoreA = (a.confidence * 100 + (a.frequency || 0)) / 101
        const scoreB = (b.confidence * 100 + (b.frequency || 0)) / 101
        return scoreB - scoreA
      })
      .slice(0, 50) // Limit to 50 suggestions
  }

  /**
   * Get base completions from registry
   */
  private static getBaseCompletions(context: AutocompleteContext): Completion[] {
    const completions: Completion[] = []

    // Common Sims 4 keywords
    const keywords = [
      'interaction',
      'buff',
      'trait',
      'whim',
      'affordance',
      'animation',
      'outfit',
      'loot',
      'event',
      'commodity',
      'skill',
      'reward',
      'situation',
      'aspiration',
      'relationship',
    ]

    keywords.forEach((keyword) => {
      if (keyword.startsWith(context.prefix.toLowerCase())) {
        completions.push({
          value: keyword,
          label: keyword,
          type: 'keyword',
          confidence: 0.8,
          source: 'registry',
          description: `Sims 4 game concept: ${keyword}`,
        })
      }
    })

    // Common enum patterns
    const commonEnums = [
      'TRUE',
      'FALSE',
      'ALWAYS',
      'NEVER',
      'AUTONOMY_LEVEL',
      'INTERACTION_PRIORITY',
      'OUTCOME_SUCCESS',
      'OUTCOME_FAILURE',
    ]

    commonEnums.forEach((enumVal) => {
      if (enumVal.startsWith(context.prefix.toUpperCase())) {
        completions.push({
          value: enumVal,
          label: enumVal,
          type: 'enum',
          confidence: 0.7,
          source: 'registry',
          description: `Common Sims 4 enum value`,
        })
      }
    })

    return completions
  }

  /**
   * Merge base completions with learned patterns
   */
  private static mergeCompletions(
    baseCompletions: Completion[],
    patterns: any,
    context: AutocompleteContext
  ): Completion[] {
    const completionMap = new Map<string, Completion>()

    // Add base completions
    baseCompletions.forEach((completion) => {
      completionMap.set(completion.value, completion)
    })

    // Boost learned tuning patterns
    if (patterns.tuningPatterns) {
      patterns.tuningPatterns
        .filter((p: TuningPattern) => p.tuningId.startsWith(context.prefix))
        .slice(0, 10)
        .forEach((pattern: TuningPattern) => {
          const key = pattern.tuningId
          completionMap.set(key, {
            value: pattern.tuningId,
            label: `${pattern.tuningId} (${pattern.frequency}x)`,
            type: 'tuning',
            confidence: pattern.confidence,
            frequency: pattern.frequency,
            source: 'learned',
            description: `Used in ${pattern.files.length} files`,
          })
        })
    }

    // Boost learned enum patterns
    if (patterns.enumPatterns) {
      patterns.enumPatterns
        .filter((p: EnumPattern) => p.value.startsWith(context.prefix))
        .slice(0, 10)
        .forEach((pattern: EnumPattern) => {
          const existing = completionMap.get(pattern.value)
          if (existing) {
            existing.confidence = Math.max(existing.confidence, pattern.confidence)
            existing.frequency = (existing.frequency || 0) + pattern.frequency
            existing.source = 'learned'
          } else {
            completionMap.set(pattern.value, {
              value: pattern.value,
              label: `${pattern.value} (${pattern.type})`,
              type: 'enum',
              confidence: pattern.confidence,
              frequency: pattern.frequency,
              source: 'learned',
              description: `Enum pattern: ${pattern.type}`,
            })
          }
        })
    }

    // Boost learned naming patterns
    if (patterns.namingPatterns) {
      patterns.namingPatterns
        .filter((p: NamingPattern) => p.examples[0]?.startsWith(context.prefix))
        .slice(0, 5)
        .forEach((pattern: NamingPattern) => {
          pattern.examples.forEach((example: string) => {
            if (!completionMap.has(example)) {
              completionMap.set(example, {
                value: example,
                label: example,
                type: 'pattern',
                confidence: pattern.confidence,
                frequency: pattern.frequency,
                source: 'learned',
                description: `Naming pattern: ${pattern.prefix || pattern.suffix || 'custom'}`,
              })
            }
          })
        })
    }

    return Array.from(completionMap.values())
  }

  /**
   * Get context-specific completions for a position in the file
   */
  static getContextSpecificCompletions(
    content: string,
    position: number,
    fileName: string
  ): Completion[] {
    // Determine what we're completing (tuning ref, enum, keyword, etc)
    const context = this.analyzeContext(content, position, fileName)

    return this.getCompletions(context)
  }

  /**
   * Analyze the context at a position in the file
   */
  private static analyzeContext(
    content: string,
    position: number,
    fileName: string
  ): AutocompleteContext {
    // Get prefix from current position
    const prefix = this.extractPrefix(content, position)

    return {
      fileContent: content,
      position,
      fileName,
      prefix,
    }
  }

  /**
   * Extract the completion prefix from position
   */
  private static extractPrefix(content: string, position: number): string {
    let start = position

    // Find the start of the word
    while (start > 0 && /[a-zA-Z0-9_x]/.test(content[start - 1])) {
      start--
    }

    return content.substring(start, position)
  }

  /**
   * Score a completion based on multiple factors
   */
  static scoreCompletion(
    completion: Completion,
    prefix: string,
    _patterns: unknown
  ): number {
    let score = completion.confidence * 100

    // Boost if source is learned patterns
    if (completion.source === 'learned') {
      score += (completion.frequency || 0) * 10
    }

    // Boost for exact prefix match
    if (completion.value.toLowerCase().startsWith(prefix.toLowerCase())) {
      score += 20
    }

    // Boost for high-frequency patterns
    if ((completion.frequency || 0) > 5) {
      score += 15
    }

    return score
  }
}
