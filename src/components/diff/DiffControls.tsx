interface DiffControlsProps {
  viewMode: 'side-by-side' | 'inline'
  onViewModeChange: (mode: 'side-by-side' | 'inline') => void
  changeCount: number
  currentChange: number
  onPreviousChange: () => void
  onNextChange: () => void
}

/**
 * Control buttons for diff viewer mode switching and navigation
 */
export default function DiffControls({
  viewMode,
  onViewModeChange,
  changeCount,
  currentChange,
  onPreviousChange,
  onNextChange,
}: DiffControlsProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle bg-background-secondary">
      {/* View Mode Toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => onViewModeChange('side-by-side')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            viewMode === 'side-by-side'
              ? 'bg-accent-primary text-text-primary'
              : 'bg-background-tertiary text-text-secondary hover:text-accent-primary'
          }`}
          title="Side-by-side view"
        >
          ↔️ Side by Side
        </button>
        <button
          onClick={() => onViewModeChange('inline')}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            viewMode === 'inline'
              ? 'bg-accent-primary text-text-primary'
              : 'bg-background-tertiary text-text-secondary hover:text-accent-primary'
          }`}
          title="Inline view"
        >
          ↓ Inline
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-border-subtle" />

      {/* Navigation */}
      {changeCount > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviousChange}
            disabled={currentChange === 0}
            className="px-2 py-1.5 text-xs font-medium bg-background-tertiary text-text-secondary hover:text-accent-primary disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Previous change (Shift+Up)"
          >
            ↑ Prev
          </button>

          <span className="text-xs text-text-secondary">
            {currentChange + 1} / {changeCount}
          </span>

          <button
            onClick={onNextChange}
            disabled={currentChange === changeCount - 1}
            className="px-2 py-1.5 text-xs font-medium bg-background-tertiary text-text-secondary hover:text-accent-primary disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            title="Next change (Shift+Down)"
          >
            Next ↓
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="ml-auto text-xs text-text-secondary">
        {changeCount} change{changeCount !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
