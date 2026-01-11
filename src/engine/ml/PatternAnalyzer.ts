/**
 * Pattern Analyzer
 * Analyzes mod files to detect tuning, enum, structural, and naming patterns
 */

import { v4 as uuidv4 } from 'uuid'
import type {
  ModFile,
  ProjectPatterns,
  TuningPattern,
  EnumPattern,
  StructuralPattern,
  NamingPattern,
} from './types'

export class PatternAnalyzer {
  /**
   * Analyze a project's mod files for patterns
   */
  static analyzeProject(files: ModFile[]): ProjectPatterns {
    const startTime = performance.now()

    const tuningPatterns = this.analyzeTuningPatterns(files)
    const enumPatterns = this.analyzeEnumPatterns(files)
    const structuralPatterns = this.analyzeStructuralPatterns(files)
    const namingPatterns = this.analyzeNamingPatterns(files)

    const analysisTime = performance.now() - startTime

    return {
      tuningPatterns,
      enumPatterns,
      structuralPatterns,
      namingPatterns,
      analysisTime: Math.round(analysisTime * 100) / 100,
      filesAnalyzed: files.length,
      timestamp: Date.now(),
    }
  }

  /**
   * Analyze tuning reference patterns
   */
  private static analyzeTuningPatterns(files: ModFile[]): TuningPattern[] {
    const usage = new Map<string, { count: number; files: Set<string> }>()

    files.forEach((file) => {
      const tuningRefs = this.extractTuningReferences(file.content)

      tuningRefs.forEach((ref) => {
        const entry = usage.get(ref) || { count: 0, files: new Set<string>() }
        entry.count++
        entry.files.add(file.name)
        usage.set(ref, entry)
      })
    })

    // Filter patterns with minimum frequency (3+ occurrences)
    const patterns = Array.from(usage.entries())
      .filter(([_, data]) => data.count >= 3)
      .map(([tuningId, data]) => ({
        id: uuidv4(),
        tuningId,
        frequency: data.count,
        confidence: Math.min(data.count / files.length, 1.0),
        files: Array.from(data.files),
      }))
      .sort((a, b) => b.frequency - a.frequency)

    console.debug(`[PatternAnalyzer] Found ${patterns.length} tuning patterns`)

    return patterns
  }

  /**
   * Analyze enum value patterns
   */
  private static analyzeEnumPatterns(files: ModFile[]): EnumPattern[] {
    const enumValues = new Map<string, { type: string; count: number; examples: Set<string> }>()

    files.forEach((file) => {
      const enums = this.extractEnumValues(file.content)

      enums.forEach((enumVal) => {
        const type = this.getEnumType(enumVal)
        const entry = enumValues.get(enumVal) || {
          type,
          count: 0,
          examples: new Set<string>(),
        }
        entry.count++
        entry.examples.add(enumVal)
        enumValues.set(enumVal, entry)
      })
    })

    // Group by type and filter high-frequency patterns
    const patterns = Array.from(enumValues.entries())
      .filter(([_, data]) => data.count >= 2)
      .map(([value, data]) => ({
        id: uuidv4(),
        value,
        type: data.type as 'UPPERCASE_SNAKE' | 'PascalCase' | 'camelCase' | 'CONSTANT',
        frequency: data.count,
        confidence: Math.min(data.count / files.length, 1.0),
        examples: Array.from(data.examples).slice(0, 3),
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10) // Limit to top 10 patterns

    console.debug(`[PatternAnalyzer] Found ${patterns.length} enum patterns`)

    return patterns
  }

  /**
   * Analyze XML structural patterns
   */
  private static analyzeStructuralPatterns(files: ModFile[]): StructuralPattern[] {
    const sequences = new Map<string, { count: number; description: string }>()

    files.forEach((file) => {
      const tags = this.extractXMLTags(file.content)
      const pairs = this.getPairSequences(tags, 2) // Get 2-tag sequences

      pairs.forEach((pair) => {
        const key = pair.join('→')
        const entry = sequences.get(key) || {
          count: 0,
          description: `${pair[0]} → ${pair[1]}`,
        }
        entry.count++
        sequences.set(key, entry)
      })
    })

    // Filter high-frequency sequences
    const patterns = Array.from(sequences.entries())
      .filter(([_, data]) => data.count >= 3)
      .map(([key, data]) => {
        const tags = key.split('→')
        return {
          id: uuidv4(),
          tagSequence: tags,
          frequency: data.count,
          confidence: Math.min(data.count / files.length, 1.0),
          description: data.description,
        }
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10) // Limit to top 10 patterns

    console.debug(`[PatternAnalyzer] Found ${patterns.length} structural patterns`)

    return patterns
  }

  /**
   * Analyze file naming patterns
   */
  private static analyzeNamingPatterns(files: ModFile[]): NamingPattern[] {
    const patterns: NamingPattern[] = []

    // Analyze prefixes
    const prefixes = this.extractCommonPrefixes(files.map((f) => f.name))
    prefixes.forEach((prefix) => {
      const files_with_prefix = files.filter((f) => f.name.startsWith(prefix.value))
      patterns.push({
        id: uuidv4(),
        prefix: prefix.value,
        pattern: `^${prefix.value}.*`,
        frequency: files_with_prefix.length,
        confidence: files_with_prefix.length / files.length,
        examples: files_with_prefix.slice(0, 3).map((f) => f.name),
      })
    })

    // Analyze suffixes
    const suffixes = this.extractCommonSuffixes(files.map((f) => f.name))
    suffixes.forEach((suffix) => {
      const files_with_suffix = files.filter((f) => f.name.endsWith(suffix.value))
      patterns.push({
        id: uuidv4(),
        suffix: suffix.value,
        pattern: `.*${suffix.value}$`,
        frequency: files_with_suffix.length,
        confidence: files_with_suffix.length / files.length,
        examples: files_with_suffix.slice(0, 3).map((f) => f.name),
      })
    })

    const sorted = patterns.sort((a, b) => b.frequency - a.frequency).slice(0, 10)

    console.debug(`[PatternAnalyzer] Found ${sorted.length} naming patterns`)

    return sorted
  }

  /**
   * Extract tuning references from content
   */
  private static extractTuningReferences(content: string): string[] {
    // Look for tuning class references: 0x12345678 or tuning_id format
    const tuningPattern = /0x[0-9a-fA-F]{8}/g
    const matches = content.match(tuningPattern) || []

    return matches
  }

  /**
   * Extract enum values from content
   */
  private static extractEnumValues(content: string): string[] {
    // Look for common enum-like patterns
    const patterns = [
      /:\s*([A-Z][a-z]+[A-Z][a-zA-Z]*)\b/g, // PascalCase
      /:\s*([a-z]+(?:_[a-z]+)*)\b/g, // snake_case
      /:\s*([A-Z_]{2,})\b/g, // CONSTANT_CASE
    ]

    const enums = new Set<string>()

    patterns.forEach((pattern) => {
      const matches = content.match(pattern) || []
      matches.forEach((match) => {
        const value = match.replace(/:\s*/, '').trim()
        if (value.length > 2 && value.length < 100) {
          enums.add(value)
        }
      })
    })

    return Array.from(enums)
  }

  /**
   * Extract XML tags from content
   */
  private static extractXMLTags(content: string): string[] {
    const tagPattern = /<([a-zA-Z_][a-zA-Z0-9_-]*)/g
    const matches = content.match(tagPattern) || []

    return matches.map((match) => match.replace(/^</, ''))
  }

  /**
   * Get consecutive sequences from array
   */
  private static getPairSequences(items: string[], size: number): string[][] {
    const sequences: string[][] = []

    for (let i = 0; i < items.length - size + 1; i++) {
      sequences.push(items.slice(i, i + size))
    }

    return sequences
  }

  /**
   * Determine enum type by naming convention
   */
  private static getEnumType(value: string): string {
    if (/^[A-Z_]+$/.test(value)) {
      return 'UPPERCASE_SNAKE'
    }
    if (/^[A-Z][a-zA-Z]*$/.test(value)) {
      return 'PascalCase'
    }
    if (/^[a-z][a-zA-Z]*$/.test(value)) {
      return 'camelCase'
    }
    return 'CONSTANT'
  }

  /**
   * Extract common prefixes from filenames
   */
  private static extractCommonPrefixes(
    names: string[]
  ): Array<{ value: string; frequency: number }> {
    const prefixes = new Map<string, number>()

    names.forEach((name) => {
      // Check 1-3 character prefixes
      for (let i = 1; i <= Math.min(3, name.length); i++) {
        const prefix = name.substring(0, i)
        if (prefix.match(/^[a-z0-9]+_?$/i)) {
          prefixes.set(prefix, (prefixes.get(prefix) || 0) + 1)
        }
      }
    })

    return Array.from(prefixes.entries())
      .filter(([_, count]) => count >= 2)
      .map(([value, count]) => ({ value, frequency: count }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)
  }

  /**
   * Extract common suffixes from filenames
   */
  private static extractCommonSuffixes(
    names: string[]
  ): Array<{ value: string; frequency: number }> {
    const suffixes = new Map<string, number>()

    names.forEach((name) => {
      // Check file extensions and common suffixes
      const parts = name.split('.')
      if (parts.length > 1) {
        const ext = '.' + parts[parts.length - 1]
        suffixes.set(ext, (suffixes.get(ext) || 0) + 1)
      }

      // Check other suffixes
      const namePart = name.split('.')[0]
      for (let i = 1; i <= Math.min(3, namePart.length); i++) {
        const suffix = namePart.substring(namePart.length - i)
        if (suffix.match(/^[a-z0-9_]+$/i)) {
          suffixes.set(suffix, (suffixes.get(suffix) || 0) + 1)
        }
      }
    })

    return Array.from(suffixes.entries())
      .filter(([_, count]) => count >= 2)
      .map(([value, count]) => ({ value, frequency: count }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5)
  }
}
