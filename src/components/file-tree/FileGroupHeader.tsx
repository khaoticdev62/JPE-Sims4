import { useState } from 'react'

interface FileGroupHeaderProps {
  name: string
  icon: string
  fileCount: number
  errorCount: number
  warningCount: number
  children: React.ReactNode
}

/**
 * Displays a collapsible file group header
 * Shows group name, file count, and error/warning counts
 */
export default function FileGroupHeader({
  name,
  icon,
  fileCount,
  errorCount,
  warningCount,
  children,
}: FileGroupHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="space-y-1">
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-primary hover:bg-background-tertiary rounded transition-colors"
      >
        {/* Expand/Collapse Arrow */}
        <span className={`text-base leading-none transition-transform ${isExpanded ? '' : '-rotate-90'}`}>
          ▼
        </span>

        {/* Group Icon */}
        <span className="text-base leading-none">{icon}</span>

        {/* Group Name */}
        <span>{name}</span>

        {/* File Count */}
        <span className="text-xs text-text-secondary ml-auto">
          ({fileCount})
        </span>

        {/* Error/Warning Badges */}
        <div className="flex gap-1 ml-2">
          {errorCount > 0 && (
            <span
              className="text-xs bg-state-error/20 text-state-error px-2 py-0.5 rounded"
              title={`${errorCount} error${errorCount !== 1 ? 's' : ''}`}
            >
              {errorCount}
            </span>
          )}
          {warningCount > 0 && (
            <span
              className="text-xs bg-state-warning/20 text-state-warning px-2 py-0.5 rounded"
              title={`${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
            >
              {warningCount}
            </span>
          )}
        </div>
      </button>

      {/* Group Content */}
      {isExpanded && (
        <div className="space-y-0.5 pl-4">
          {children}
        </div>
      )}
    </div>
  )
}
