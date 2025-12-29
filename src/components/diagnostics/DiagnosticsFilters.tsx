interface DiagnosticsFiltersProps {
  filters: {
    errors: boolean
    warnings: boolean
    info: boolean
  }
  onChange: (filters: { errors: boolean; warnings: boolean; info: boolean }) => void
  groupBy: 'file' | 'severity'
  onGroupByChange: (groupBy: 'file' | 'severity') => void
}

/**
 * Filter controls for diagnostics panel
 */
export default function DiagnosticsFilters({
  filters,
  onChange,
  groupBy,
  onGroupByChange,
}: DiagnosticsFiltersProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle flex-wrap">
      {/* Severity Filters */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange({ ...filters, errors: !filters.errors })}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            filters.errors
              ? 'bg-state-error text-text-primary'
              : 'bg-background-tertiary text-text-secondary'
          }`}
        >
          🔴 Errors
        </button>
        <button
          onClick={() => onChange({ ...filters, warnings: !filters.warnings })}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            filters.warnings
              ? 'bg-state-warning text-text-primary'
              : 'bg-background-tertiary text-text-secondary'
          }`}
        >
          ⚠️ Warnings
        </button>
        <button
          onClick={() => onChange({ ...filters, info: !filters.info })}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            filters.info
              ? 'bg-state-info text-text-primary'
              : 'bg-background-tertiary text-text-secondary'
          }`}
        >
          ℹ️ Info
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-border-subtle" />

      {/* Group By */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary">Group by:</span>
        <select
          value={groupBy}
          onChange={(e) => onGroupByChange(e.target.value as 'file' | 'severity')}
          className="px-2 py-1 text-xs bg-background-tertiary text-text-primary rounded border border-border-subtle outline-none cursor-pointer hover:border-accent-primary transition-colors"
        >
          <option value="file">File</option>
          <option value="severity">Severity</option>
        </select>
      </div>
    </div>
  )
}
