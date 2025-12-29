import { useMemo } from 'react'
import type { Diagnostic } from '@/types/index'
import DiagnosticItem from './DiagnosticItem'

interface DiagnosticsListProps {
  diagnostics: Diagnostic[]
  groupBy: 'file' | 'severity'
  onNavigate?: (fileId: string, line: number, column: number) => void
}

/**
 * Grouped list of diagnostics
 */
export default function DiagnosticsList({
  diagnostics,
  groupBy,
  onNavigate,
}: DiagnosticsListProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, Diagnostic[]> = {}

    diagnostics.forEach((diag) => {
      const key = groupBy === 'file' ? diag.fileId : diag.severity
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(diag)
    })

    return groups
  }, [diagnostics, groupBy])

  if (diagnostics.length === 0) {
    return (
      <div className="p-4 text-center text-text-secondary text-sm">
        No issues found
      </div>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-state-error bg-state-error/10'
      case 'warning':
        return 'text-state-warning bg-state-warning/10'
      case 'info':
        return 'text-state-info bg-state-info/10'
      default:
        return 'text-text-secondary'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'error':
        return '🔴 Errors'
      case 'warning':
        return '⚠️ Warnings'
      case 'info':
        return 'ℹ️ Info'
      default:
        return severity
    }
  }

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([groupKey, groupDiags]) => {
        const isFile = groupBy === 'file'
        const headerText = isFile ? groupKey : getSeverityLabel(groupKey)
        const headerColor = isFile ? '' : getSeverityColor(groupKey)

        return (
          <div key={groupKey}>
            {/* Group Header */}
            <div
              className={`px-4 py-2 text-xs font-semibold sticky top-0 ${headerColor} rounded`}
            >
              <span>{headerText}</span>
              <span className="ml-auto text-text-secondary float-right">
                ({groupDiags.length})
              </span>
            </div>

            {/* Group Items */}
            <div className="space-y-1 pl-2 border-l border-border-subtle">
              {groupDiags.map((diag, index) => (
                <DiagnosticItem
                  key={`${groupKey}-${index}`}
                  diagnostic={diag}
                  fileName={isFile ? diag.fileId.split('/').pop() || diag.fileId : ''}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
