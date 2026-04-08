/**
 * Fix Applier Service
 *
 * Applies fix suggestions to the editor document.
 * Handles undo integration, re-validation triggers, and user notifications.
 */

import type { FixSuggestion } from './FixSuggestionEngine'

/**
 * Result of applying a fix
 */
export interface FixApplicationResult {
  /** Whether the fix was applied successfully */
  success: boolean
  /** Updated document content */
  newContent: string
  /** Error message if application failed */
  error?: string
  /** Timestamp of application */
  appliedAt: number
}

/**
 * Callback for notifying that a fix was applied (triggers re-validation)
 */
export type OnFixAppliedCallback = () => void

/**
 * FixApplier Service
 *
 * Applies fix suggestions to documents with proper undo tracking.
 */
export class FixApplier {
  private onFixAppliedCallback: OnFixAppliedCallback | null = null

  /**
   * Set callback to trigger after fix application
   */
  setOnFixApplied(callback: OnFixAppliedCallback): void {
    this.onFixAppliedCallback = callback
  }

  /**
   * Apply a fix suggestion to document content
   */
  applyFix(content: string, fix: FixSuggestion): FixApplicationResult {
    try {
      const lines = content.split('\n')

      // Validate range
      if (fix.range.startLine < 1 || fix.range.startLine > lines.length) {
        return {
          success: false,
          newContent: content,
          error: `Invalid start line: ${fix.range.startLine}`,
          appliedAt: Date.now(),
        }
      }

      const lineIndex = fix.range.startLine - 1
      const line = lines[lineIndex]

      // Calculate column positions (1-based to 0-based)
      const startCol = Math.max(0, fix.range.startColumn - 1)
      const endCol = Math.min(line.length, fix.range.endColumn - 1)

      // Apply the replacement
      const before = line.substring(0, startCol)
      const after = line.substring(endCol)
      const newLine = before + fix.replacementText + after

      lines[lineIndex] = newLine
      const newContent = lines.join('\n')

      // Trigger re-validation callback
      if (this.onFixAppliedCallback) {
        this.onFixAppliedCallback()
      }

      return {
        success: true,
        newContent,
        appliedAt: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        newContent: content,
        error: error instanceof Error ? error.message : 'Unknown error',
        appliedAt: Date.now(),
      }
    }
  }

  /**
   * Apply multiple fixes sequentially
   */
  applyFixes(
    content: string,
    fixes: FixSuggestion[],
  ): FixApplicationResult[] {
    let currentContent = content
    const results: FixApplicationResult[] = []

    for (const fix of fixes) {
      const result = this.applyFix(currentContent, fix)
      results.push(result)

      if (result.success) {
        currentContent = result.newContent
      }
    }

    return results
  }

  /**
   * Generate a diff preview for a fix
   */
  generateDiffPreview(content: string, fix: FixSuggestion): string {
    const lines = content.split('\n')

    if (fix.range.startLine < 1 || fix.range.startLine > lines.length) {
      return 'Invalid range'
    }

    const lineIndex = fix.range.startLine - 1
    const line = lines[lineIndex]
    const startCol = Math.max(0, fix.range.startColumn - 1)
    const endCol = Math.min(line.length, fix.range.endColumn - 1)

    const before = line.substring(0, startCol)
    const removed = line.substring(startCol, endCol)
    const after = line.substring(endCol)

    // Simple diff format
    return [
      `- ${line}`,
      `+ ${before}${fix.replacementText}${after}`,
    ].join('\n')
  }
}

/**
 * Singleton instance for global use
 */
export const fixApplier = new FixApplier()
