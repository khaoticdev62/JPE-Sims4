import { useState, useMemo, useEffect } from 'react'
import DiffControls from './DiffControls'
import DiffSideBySide from './DiffSideBySide'
import DiffInline from './DiffInline'

interface DiffChange {
  type: 'add' | 'remove' | 'equal'
  content: string
}

interface DiffViewerProps {
  leftContent: string
  rightContent: string
  leftLabel?: string
  rightLabel?: string
  defaultViewMode?: 'side-by-side' | 'inline'
}

/**
 * Main diff viewer component for XML/JPE comparison
 * Supports side-by-side and inline views with change navigation
 */
export default function DiffViewer({
  leftContent,
  rightContent,
  leftLabel = 'Original',
  rightLabel = 'Modified',
  defaultViewMode = 'side-by-side',
}: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'inline'>(
    defaultViewMode
  )
  const [currentChangeIndex, setCurrentChangeIndex] = useState(0)

  // Simple line-by-line diff algorithm
  const changes = useMemo(() => {
    const leftLines = leftContent.split('\n')
    const rightLines = rightContent.split('\n')
    const result: DiffChange[] = []

    const maxLines = Math.max(leftLines.length, rightLines.length)

    for (let i = 0; i < maxLines; i++) {
      const leftLine = leftLines[i] || ''
      const rightLine = rightLines[i] || ''

      if (leftLine === rightLine) {
        if (leftLine) {
          result.push({ type: 'equal', content: leftLine })
        }
      } else {
        if (leftLine) {
          result.push({ type: 'remove', content: leftLine })
        }
        if (rightLine) {
          result.push({ type: 'add', content: rightLine })
        }
      }
    }

    return result
  }, [leftContent, rightContent])

  // Count actual changes
  const changeCount = useMemo(
    () => changes.filter((c) => c.type !== 'equal').length,
    [changes]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.shiftKey || e.ctrlKey) && e.key === 'ArrowUp') {
        e.preventDefault()
        setCurrentChangeIndex((prev) => Math.max(0, prev - 1))
      } else if ((e.shiftKey || e.ctrlKey) && e.key === 'ArrowDown') {
        e.preventDefault()
        setCurrentChangeIndex((prev) =>
          Math.min(changeCount - 1, prev + 1)
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [changeCount])

  const handlePreviousChange = () => {
    setCurrentChangeIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextChange = () => {
    setCurrentChangeIndex((prev) =>
      Math.min(changeCount - 1, prev + 1)
    )
  }

  return (
    <div className="flex flex-col h-full bg-background-primary border border-border-subtle rounded-lg overflow-hidden">
      {/* Controls */}
      <DiffControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        changeCount={changeCount}
        currentChange={currentChangeIndex}
        onPreviousChange={handlePreviousChange}
        onNextChange={handleNextChange}
      />

      {/* Diff View */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'side-by-side' ? (
          <DiffSideBySide
            leftContent={leftContent}
            rightContent={rightContent}
            leftLabel={leftLabel}
            rightLabel={rightLabel}
            changes={changes}
          />
        ) : (
          <DiffInline changes={changes} />
        )}
      </div>
    </div>
  )
}
