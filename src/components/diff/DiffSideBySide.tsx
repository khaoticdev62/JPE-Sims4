import { useMemo } from 'react'

interface DiffChange {
  type: 'add' | 'remove' | 'equal'
  content: string
  lineNumber?: number
}

interface DiffSideBySideProps {
  leftContent: string
  rightContent: string
  leftLabel: string
  rightLabel: string
  changes: DiffChange[]
}

/**
 * Side-by-side diff view showing XML and JPE comparison
 */
export default function DiffSideBySide({
  leftContent,
  rightContent,
  leftLabel,
  rightLabel,
  changes,
}: DiffSideBySideProps) {
  const { leftLines, rightLines } = useMemo(() => {
    const left: string[] = []
    const right: string[] = []
    let leftNum = 1
    let rightNum = 1

    changes.forEach((change) => {
      if (change.type === 'remove') {
        left.push(change.content)
        leftNum++
      } else if (change.type === 'add') {
        right.push(change.content)
        rightNum++
      } else {
        left.push(change.content)
        right.push(change.content)
        leftNum++
        rightNum++
      }
    })

    return { leftLines: left, rightLines: right }
  }, [changes])

  const renderLine = (
    line: string,
    index: number,
    type: 'add' | 'remove' | 'equal'
  ) => {
    const bgColor =
      type === 'add'
        ? 'bg-state-success/10'
        : type === 'remove'
          ? 'bg-state-error/10'
          : ''

    const borderColor =
      type === 'add'
        ? 'border-l-2 border-state-success'
        : type === 'remove'
          ? 'border-l-2 border-state-error'
          : ''

    return (
      <div
        key={`${type}-${index}`}
        className={`flex gap-2 ${bgColor} ${borderColor} hover:bg-background-tertiary transition-colors group`}
      >
        {/* Line Number */}
        <div className="w-12 flex-shrink-0 text-right pr-2 text-xs text-text-tertiary select-none bg-background-tertiary">
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 px-2 py-1 text-xs font-mono text-text-secondary overflow-x-auto">
          <code className="whitespace-pre-wrap break-words">{line}</code>
        </div>

        {/* Change Indicator */}
        {type !== 'equal' && (
          <div className="flex-shrink-0 w-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            {type === 'add' ? '✓' : '✕'}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex gap-2 h-full overflow-hidden">
      {/* Left Panel (Original) */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border-subtle">
        <div className="px-4 py-2 bg-background-tertiary border-b border-border-subtle text-xs font-semibold text-text-primary sticky top-0">
          {leftLabel}
        </div>
        <div className="flex-1 overflow-y-auto space-y-0">
          {leftLines.map((line, idx) => renderLine(line, idx, 'remove'))}
        </div>
      </div>

      {/* Right Panel (Modified) */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-2 bg-background-tertiary border-b border-border-subtle text-xs font-semibold text-text-primary sticky top-0">
          {rightLabel}
        </div>
        <div className="flex-1 overflow-y-auto space-y-0">
          {rightLines.map((line, idx) => renderLine(line, idx, 'add'))}
        </div>
      </div>
    </div>
  )
}
