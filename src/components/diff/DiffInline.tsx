interface DiffChange {
  type: 'add' | 'remove' | 'equal'
  content: string
  lineNumber?: number
}

interface DiffInlineProps {
  changes: DiffChange[]
}

/**
 * Inline diff view similar to git diff output
 */
export default function DiffInline({ changes }: DiffInlineProps) {
  const getLinePrefix = (type: string) => {
    switch (type) {
      case 'add':
        return '+ '
      case 'remove':
        return '- '
      default:
        return '  '
    }
  }

  const getLineColor = (type: string) => {
    switch (type) {
      case 'add':
        return 'text-state-success bg-state-success/10'
      case 'remove':
        return 'text-state-error bg-state-error/10'
      default:
        return 'text-text-secondary'
    }
  }

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'add':
        return 'border-l-2 border-state-success'
      case 'remove':
        return 'border-l-2 border-state-error'
      default:
        return ''
    }
  }

  return (
    <div className="p-4 overflow-auto h-full">
      <div className="font-mono text-sm space-y-0 bg-background-tertiary rounded-lg overflow-hidden border border-border-subtle">
        {changes.map((change, index) => (
          <div
            key={index}
            className={`px-4 py-1 ${getLineColor(change.type)} ${getBorderColor(change.type)} hover:opacity-75 transition-opacity`}
          >
            <span className="select-none font-semibold">{getLinePrefix(change.type)}</span>
            <code className="whitespace-pre-wrap break-words">{change.content}</code>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 px-4 py-3 bg-background-tertiary rounded-lg border border-border-subtle text-xs text-text-secondary space-y-1">
        <div className="flex gap-2">
          <span className="text-state-success">+ Added</span>
          <span className="text-state-error">- Removed</span>
          <span className="text-text-secondary">  Unchanged</span>
        </div>
      </div>
    </div>
  )
}
