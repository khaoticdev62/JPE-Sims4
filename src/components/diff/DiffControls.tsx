import React from 'react'
import { Columns2, LayoutList, ChevronUp, ChevronDown } from 'lucide-react'

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
    <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary border-b border-border-subtle">
      {/* View Mode Toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewModeChange('side-by-side')}
          className={`p-1.5 rounded transition-all ${
            viewMode === 'side-by-side'
              ? 'bg-accent-primary text-bg-primary shadow-sm'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
          title="Side-by-Side View"
        >
          <Columns2 size={16} />
        </button>
        <button
          onClick={() => onViewModeChange('inline')}
          className={`p-1.5 rounded transition-all ${
            viewMode === 'inline'
              ? 'bg-accent-primary text-bg-primary shadow-sm'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
          title="Inline View"
        >
          <LayoutList size={16} />
        </button>
        <div className="ml-2 h-4 w-px bg-border-subtle" />
        <span className="text-xs font-medium text-text-secondary">
          {changeCount} {changeCount === 1 ? 'change' : 'changes'} detected
        </span>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        {changeCount > 0 && (
          <div className="flex items-center gap-1 bg-bg-secondary rounded border border-border-subtle p-0.5">
            <button
              onClick={onPreviousChange}
              disabled={currentChange <= 0}
              className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Change (Ctrl+Up)"
            >
              <ChevronUp size={16} />
            </button>
            <span className="text-[10px] font-mono text-text-secondary px-1 min-w-[40px] text-center">
              {currentChange + 1} / {changeCount}
            </span>
            <button
              onClick={onNextChange}
              disabled={currentChange >= changeCount - 1}
              className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Change (Ctrl+Down)"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
