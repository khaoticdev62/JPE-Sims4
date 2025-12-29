import { useState, useMemo } from 'react'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useEditorStore } from '@/stores/useEditorStore'
import DiagnosticsFilters from './DiagnosticsFilters'
import DiagnosticsList from './DiagnosticsList'

/**
 * Enhanced diagnostics panel with filtering and grouping
 */
export default function DiagnosticsPanel() {
  const { diagnostics } = useDiagnosticStore()
  const { openTab } = useEditorStore()

  const [filters, setFilters] = useState({
    errors: true,
    warnings: true,
    info: true,
  })
  const [groupBy, setGroupBy] = useState<'file' | 'severity'>('file')

  // Filter diagnostics
  const filteredDiagnostics = useMemo(() => {
    return diagnostics.filter((diag) => {
      if (diag.severity === 'error' && !filters.errors) return false
      if (diag.severity === 'warning' && !filters.warnings) return false
      if (diag.severity === 'info' && !filters.info) return false
      return true
    })
  }, [diagnostics, filters])

  // Calculate counts
  const counts = useMemo(() => {
    return {
      errors: diagnostics.filter((d) => d.severity === 'error').length,
      warnings: diagnostics.filter((d) => d.severity === 'warning').length,
      info: diagnostics.filter((d) => d.severity === 'info').length,
    }
  }, [diagnostics])

  const handleNavigate = (fileId: string, line: number, column: number) => {
    openTab({
      id: `tab-${fileId}`,
      fileId,
      name: fileId,
      isDirty: false,
    })
  }

  return (
    <div className="flex flex-col h-full bg-background-secondary">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Problems</h2>
          <div className="flex gap-2 text-xs">
            {counts.errors > 0 && (
              <span className="text-state-error">
                🔴 {counts.errors}
              </span>
            )}
            {counts.warnings > 0 && (
              <span className="text-state-warning">
                ⚠️ {counts.warnings}
              </span>
            )}
            {counts.info > 0 && (
              <span className="text-state-info">
                ℹ️ {counts.info}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <DiagnosticsFilters
        filters={filters}
        onChange={setFilters}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        <DiagnosticsList
          diagnostics={filteredDiagnostics}
          groupBy={groupBy}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Footer Stats */}
      {diagnostics.length > 0 && (
        <div className="px-4 py-2 border-t border-border-subtle bg-background-tertiary text-xs text-text-secondary">
          Total: {diagnostics.length} issue{diagnostics.length !== 1 ? 's' : ''} •
          Showing: {filteredDiagnostics.length}
        </div>
      )}
    </div>
  )
}
