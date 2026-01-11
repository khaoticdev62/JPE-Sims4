import React from 'react'

interface DiffChange {
  type: 'add' | 'remove' | 'equal'
  content: string
}

interface DiffInlineProps {
  changes: DiffChange[]
}

/**
 * Inline diff view similar to git diff output
 */
export default function DiffInline({ changes }: DiffInlineProps) {
  return (
    <div className="h-full overflow-y-auto bg-bg-primary font-mono text-xs leading-relaxed">
      <div className="min-w-full inline-block">
        {changes.map((change, idx) => {
          const isAdd = change.type === 'add'
          const isRemove = change.type === 'remove'
          
          const bgColor = isAdd 
            ? 'bg-state-success/10' 
            : isRemove 
              ? 'bg-state-error/10' 
              : ''
          
          const marker = isAdd ? '+' : isRemove ? '-' : ' '
          const markerColor = isAdd ? 'text-state-success' : isRemove ? 'text-state-error' : 'text-text-tertiary'

          return (
            <div 
              key={idx} 
              className={`flex hover:bg-bg-tertiary/50 transition-colors group ${bgColor}`}
            >
              {/* Marker Gutter */}
              <div className={`w-8 flex-shrink-0 flex items-center justify-center select-none font-bold ${markerColor}`}>
                {marker}
              </div>
              
              {/* Content */}
              <div className={`flex-1 px-2 py-0.5 whitespace-pre-wrap break-words ${
                isAdd ? 'text-text-primary' : isRemove ? 'text-text-secondary line-through' : 'text-text-secondary'
              }`}>
                {change.content}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}