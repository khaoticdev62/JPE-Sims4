import { useMemo } from 'react'
import type { Diagnostic } from '@/types/index'

interface BuildErrorListProps {
  errors: Diagnostic[]
  onNavigateToError?: (fileId: string, line: number) => void
}

/**
 * Aggregated error list grouped by file
 */
export default function BuildErrorList({
  errors,
  onNavigateToError,
}: BuildErrorListProps) {
  // Group errors by file
  const groupedErrors = useMemo(() => {
    const groups: Record<string, Diagnostic[]> = {}

    errors.forEach((error) => {
      if (!groups[error.fileId]) {
        groups[error.fileId] = []
      }
      groups[error.fileId].push(error)
    })

    return groups
  }, [errors])

  if (errors.length === 0) {
    return null
  }

  const errorCount = errors.filter((e) => e.severity === 'error').length
  const warningCount = errors.filter((e) => e.severity === 'warning').length

  return (
    <div className="space-y-3 p-4 bg-background-tertiary rounded-lg border border-border-subtle">
      {/* Header */}
      <h3 className="text-sm font-semibold text-text-primary">
        Issues ({errors.length})
      </h3>

      {/* Summary */}
      <div className="flex gap-3 text-xs">
        {errorCount > 0 && (
          <span className="text-state-error">
            🔴 {errorCount} error{errorCount !== 1 ? 's' : ''}
          </span>
        )}
        {warningCount > 0 && (
          <span className="text-state-warning">
            ⚠️ {warningCount} warning{warningCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Grouped Errors */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {Object.entries(groupedErrors).map(([fileId, fileErrors]) => (
          <div key={fileId} className="space-y-1">
            {/* File Header */}
            <div className="text-xs font-medium text-text-secondary px-2 py-1 bg-background-secondary rounded">
              📄 {fileId}
            </div>

            {/* Error Items */}
            {fileErrors.map((error, index) => (
              <button
                key={`${fileId}-${index}`}
                onClick={() => onNavigateToError?.(fileId, error.line)}
                className="w-full text-left px-3 py-2 text-xs rounded transition-colors hover:bg-background-secondary"
              >
                <div className="flex gap-2">
                  {/* Severity Icon */}
                  <span className="flex-shrink-0 mt-0.5">
                    {error.severity === 'error' ? (
                      <span className="text-state-error">🔴</span>
                    ) : (
                      <span className="text-state-warning">⚠️</span>
                    )}
                  </span>

                  {/* Error Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 items-start">
                      <span className={error.severity === 'error' ? 'text-state-error' : 'text-state-warning'}>
                        Line {error.line}:{error.column}
                      </span>
                      <span className="text-text-secondary flex-shrink-0">
                        [{error.code || 'E000'}]
                      </span>
                    </div>
                    <p className="text-text-secondary truncate mt-0.5">
                      {error.message}
                    </p>
                    {error.suggestion && (
                      <p className="text-text-tertiary text-xs mt-1">
                        💡 {error.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
