"use client";

/**
 * Logical Status Bar Component
 *
 * Displays the current JPE block nesting context based on cursor position.
 * Example: "WHEN: sim has trait > DO: apply buff > ONLY_IF: has mood"
 *
 * Color-coded by block type:
 * - WHEN = Teal (cyan)
 * - DO = Emerald (green)
 * - ONLY_IF = Amber
 * - CONDITIONS = Violet
 */

import { useMemo } from 'react'
import { T } from '@/components/robust/jpe-theme'

interface BlockContext {
  keyword: string
  condition: string
  color: string
}

interface LogicalStatusBarProps {
  content: string
  cursorLine: number
  fileType?: string
  errorCount?: number
  warningCount?: number
  lineCount?: number
  charCount?: number
}

/**
 * Parse JPE content to determine block context at a given line
 */
function parseBlockContext(content: string, targetLine: number): BlockContext[] {
  const lines = (content || "").split('\n')
  const contextStack: BlockContext[] = []

  // Regex patterns for JPE block keywords
  const whenPattern = /^\s*WHEN\s*\(?([^)]*)\)?\s*\{?\s*$/i
  const doPattern = /^\s*DO\s*\{?\s*$/i
  const onlyIfPattern = /^\s*ONLY_IF\s*\(?([^)]*)\)?\s*\{?\s*$/i
  const conditionsPattern = /^\s*CONDITIONS\s*\{?\s*$/i
  const closeBracePattern = /^\s*\}\s*$/

  for (let i = 0; i < Math.min(targetLine, lines.length); i++) {
    const line = lines[i]

    // Check for closing brace
    if (closeBracePattern.test(line)) {
      if (contextStack.length > 0) {
        contextStack.pop()
      }
      continue
    }

    // Check for WHEN block
    const whenMatch = line.match(whenPattern)
    if (whenMatch) {
      contextStack.push({
        keyword: 'WHEN',
        condition: whenMatch[1]?.trim() || 'condition',
        color: T.cyan,
      })
      continue
    }

    // Check for DO block
    const doMatch = line.match(doPattern)
    if (doMatch) {
      contextStack.push({
        keyword: 'DO',
        condition: 'actions',
        color: T.emerald,
      })
      continue
    }

    // Check for ONLY_IF block
    const onlyIfMatch = line.match(onlyIfPattern)
    if (onlyIfMatch) {
      contextStack.push({
        keyword: 'ONLY_IF',
        condition: onlyIfMatch[1]?.trim() || 'condition',
        color: T.amber,
      })
      continue
    }

    // Check for CONDITIONS block
    const condMatch = line.match(conditionsPattern)
    if (condMatch) {
      contextStack.push({
        keyword: 'CONDITIONS',
        condition: 'checks',
        color: T.violet,
      })
      continue
    }
  }

  return contextStack
}

export const LogicalStatusBar: React.FC<LogicalStatusBarProps> = ({
  content,
  cursorLine,
  fileType = 'jpe',
  errorCount = 0,
  warningCount = 0,
  lineCount = 0,
  charCount = 0,
}) => {
  const blockContext = useMemo(() => {
    if (fileType !== 'jpe' || !content) return []
    return parseBlockContext(content, cursorLine)
  }, [content, cursorLine, fileType])

  // Only show for JPE files
  if (fileType !== 'jpe') return null

  return (
    <div
      className="h-6 bg-bgDeep border-t border-border px-4 flex items-center justify-between text-[10px] text-textSecondary font-sans"
      role="status"
      aria-live="polite"
      aria-label={`JPE Context: ${blockContext.length > 0 ? (blockContext as BlockContext[]).map(b => `${b.keyword}: ${b.condition}`).join(' > ') : 'No active blocks'}. ${errorCount} errors, ${warningCount} warnings.`}
    >
      {/* Left side: Block context + diagnostics */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Block context trail */}
        <div className="flex items-center gap-1 min-w-0">
          {blockContext.length === 0 ? (
            <span
              className="text-text-muted truncate"
              title="No active blocks"
            >
              Root level
            </span>
          ) : (
            <div className="flex items-center gap-1 min-w-0 overflow-hidden">
              {(blockContext as BlockContext[]).map((block, index) => (
                <span key={index} className="flex items-center gap-1 shrink-0">
                  {index > 0 && (
                    <span className="text-text-muted mx-0.5">›</span>
                  )}
                  <span
                    className="font-semibold truncate max-w-[150px]"
                    style={{ color: block.color }}
                    title={`${block.keyword}: ${block.condition}`}
                  >
                    {block.keyword}
                  </span>
                  {block.condition !== 'actions' && block.condition !== 'checks' && (
                    <span className="text-text-secondary truncate max-w-[120px]">
                      : {block.condition}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        {blockContext.length > 0 && (
          <span className="text-text-muted mx-1">|</span>
        )}

        {/* Error/Warning counts */}
        <div className="flex items-center gap-2 shrink-0">
          {errorCount > 0 && (
            <span className="text-state-error flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" aria-hidden="true" />
              {errorCount} error{errorCount > 1 ? 's' : ''}
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-state-warning flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
              {warningCount} warning{warningCount > 1 ? 's' : ''}
            </span>
          )}
          {errorCount === 0 && warningCount === 0 && (
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Valid
            </span>
          )}
        </div>
      </div>

      {/* Right side: Line/character counts */}
      <div className="flex items-center gap-3 shrink-0 text-text-muted">
        <span>{lineCount} lines</span>
        <span>•</span>
        <span>{charCount} chars</span>
      </div>
    </div>
  )
}
