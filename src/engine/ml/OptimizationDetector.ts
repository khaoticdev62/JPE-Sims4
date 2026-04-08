/**
 * Optimization Detector
 * Analyzes projects for optimization opportunities and best practice violations
 */

import { v4 as uuidv4 } from 'uuid'
import type { ModFile, ProjectPatterns, Optimization, TuningPattern } from './types'

export class OptimizationDetector {
  /**
   * Detect optimizations for a project
   */
  static detectOptimizations(
    files: ModFile[],
    patterns: ProjectPatterns
  ): Optimization[] {
    const optimizations: Optimization[] = []

    // Detect redundancy issues
    optimizations.push(...this.detectRedundancy(patterns.tuningPatterns, files))

    // Detect naming inconsistencies
    optimizations.push(...this.detectNamingInconsistency(files, patterns.namingPatterns))

    // Detect unused definitions
    optimizations.push(...this.detectUnusedContent(files))

    // Detect duplicate structures
    optimizations.push(...this.detectDuplicateStructures(files))

    // Sort by severity
    return optimizations.sort((a, b) => {
      const severityScore: Record<string, number> = {
        high: 3,
        medium: 2,
        low: 1,
      }
      return severityScore[b.severity] - severityScore[a.severity]
    })
  }

  /**
   * Detect redundant tuning references
   */
  private static detectRedundancy(
    patterns: TuningPattern[],
    _files: ModFile[]
  ): Optimization[] {
    const optimizations: Optimization[] = []

    // Find tuning refs used frequently (>20 times)
    patterns
      .filter((p) => p.frequency > 20)
      .slice(0, 5) // Limit to top 5
      .forEach((pattern) => {
        optimizations.push({
          id: uuidv4(),
          type: 'redundancy',
          severity: 'medium',
          message: `Tuning reference "${pattern.tuningId}" used ${pattern.frequency} times`,
          suggestion:
            'Consider extracting to a shared constant or reusable component to reduce duplication',
          impact: 'Reduces file size and improves maintainability across your project',
          files: pattern.files,
        })
      })

    return optimizations
  }

  /**
   * Detect naming inconsistencies
   */
  private static detectNamingInconsistency(
    files: ModFile[],
    namingPatterns: any[]
  ): Optimization[] {
    const optimizations: Optimization[] = []

    if (namingPatterns.length === 0) {
      return optimizations
    }

    // Find the most common prefix pattern
    const prefixPatterns = namingPatterns.filter((p) => p.prefix)
    if (prefixPatterns.length > 0) {
      const commonPrefix = prefixPatterns[0]
      const inconsistentFiles = files.filter((f) => !f.name.startsWith(commonPrefix.prefix))

      if (inconsistentFiles.length > 0 && inconsistentFiles.length < files.length) {
        optimizations.push({
          id: uuidv4(),
          type: 'naming',
          severity: 'low',
          message: `${inconsistentFiles.length} files don't follow the project's naming pattern`,
          suggestion: `Most files start with "${commonPrefix.prefix}". Rename inconsistent files for consistency.`,
          impact: 'Improves project organization and makes files easier to discover',
          files: inconsistentFiles.map((f) => f.name),
        })
      }
    }

    // Check for mixed casing in filenames
    const hasLowercase = files.some((f) => f.name !== f.name.toLowerCase() && f.name !== f.name.toUpperCase())
    const hasUppercase = files.some((f) => f.name === f.name.toUpperCase())

    if (hasLowercase && hasUppercase) {
      optimizations.push({
        id: uuidv4(),
        type: 'naming',
        severity: 'low',
        message: 'Mixed case conventions detected in filenames',
        suggestion: 'Use consistent naming: either all lowercase or snake_case',
        impact: 'Reduces confusion and improves cross-platform compatibility',
        files: files.map((f) => f.name),
      })
    }

    return optimizations
  }

  /**
   * Detect unused content (empty sections, unused variables)
   */
  private static detectUnusedContent(files: ModFile[]): Optimization[] {
    const optimizations: Optimization[] = []

    files.forEach((file) => {
      // Detect empty XML sections
      const emptyTags = (file.content.match(/<\w+>\s*<\/\w+>/g) || []).length
      if (emptyTags > 0) {
        optimizations.push({
          id: uuidv4(),
          type: 'unused',
          severity: 'low',
          message: `File "${file.name}" has ${emptyTags} empty XML sections`,
          suggestion: 'Remove empty tags and organize your XML structure',
          impact: 'Reduces file size and improves readability',
          files: [file.name],
        })
      }

      // Detect commented-out code
      const commentedLines = (file.content.match(/<!--[\s\S]*?-->/g) || []).length
      if (commentedLines > 3) {
        optimizations.push({
          id: uuidv4(),
          type: 'unused',
          severity: 'low',
          message: `File "${file.name}" has ${commentedLines} commented-out sections`,
          suggestion: 'Remove commented code or use version control for history',
          impact: 'Improves code clarity and reduces file size',
          files: [file.name],
        })
      }
    })

    return optimizations
  }

  /**
   * Detect duplicate XML structures
   */
  private static detectDuplicateStructures(files: ModFile[]): Optimization[] {
    const optimizations: Optimization[] = []
    const structures = new Map<string, string[]>()

    // Extract common XML patterns (simplified)
    files.forEach((file) => {
      const lines = file.content.split('\n')
      let current = ''

      lines.forEach((line) => {
        if (line.trim().startsWith('<') && line.trim().endsWith('>')) {
          current += line.trim() + '\n'

          if (current.length > 200) {
            // Hash the structure
            const hash = this.hashString(current)
            const files_list = structures.get(hash) || []
            files_list.push(file.name)
            structures.set(hash, files_list)
            current = ''
          }
        }
      })
    })

    // Find duplicates
    Array.from(structures.entries())
      .filter(([_, files_list]) => files_list.length > 1)
      .slice(0, 3) // Limit to top 3 duplicates
      .forEach(([_, files_list]) => {
        optimizations.push({
          id: uuidv4(),
          type: 'duplicate',
          severity: 'medium',
          message: `Duplicate XML structure found in ${files_list.length} files`,
          suggestion: 'Extract common structure to a reusable template or base file',
          impact: 'Reduces duplication and makes updates easier across multiple files',
          files: files_list,
        })
      })

    return optimizations
  }

  /**
   * Simple hash function for structure comparison
   */
  private static hashString(str: string): string {
    let hash = 0

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }

    return Math.abs(hash).toString(16)
  }

  /**
   * Validate optimization suggestions
   */
  static validateOptimizations(optimizations: Optimization[]): boolean {
    // Check that all optimizations have required fields
    return optimizations.every(
      (opt) =>
        opt.id &&
        opt.type &&
        opt.severity &&
        opt.message &&
        opt.suggestion &&
        opt.impact &&
        Array.isArray(opt.files)
    )
  }
}
