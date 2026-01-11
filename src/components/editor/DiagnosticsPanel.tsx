/**
 * DIAGNOSTICS PANEL COMPONENT
 *
 * Displays all validation errors, warnings, and info messages:
 * - Organized by severity
 * - Click to navigate to line
 * - Filter by severity
 * - Summary count
 *
 * Part of the IDE-like experience for professional editing
 */

import { useState } from 'react'

interface Diagnostic {
  line: number
  severity: 'error' | 'warning' | 'info'
  message: string
  code?: string
}

interface DiagnosticsPanelProps {
  diagnostics: Diagnostic[]
  onSelectDiagnostic?: (diagnostic: Diagnostic) => void
  onFix?: (diagnostic: Diagnostic) => void
  isFixing?: boolean
  className?: string
  isOpen?: boolean
}

export default function DiagnosticsPanel({
  diagnostics,
  onSelectDiagnostic,
  onFix,
  isFixing = false,
  className = '',
  isOpen = true,
}: DiagnosticsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all')

  // Count by severity
  const errorCount = diagnostics.filter((d) => d.severity === 'error').length
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length
  const infoCount = diagnostics.filter((d) => d.severity === 'info').length

  // Filter diagnostics
  const filteredDiagnostics =
    filter === 'all' ? diagnostics : diagnostics.filter((d) => d.severity === filter)

  // Severity colors and icons (per PRDs: Error #E12D39, Warning #F5A623, Info #2680C2)
  const severityConfig = {
    error: { color: 'text-state-error', bg: 'bg-state-error bg-opacity-10', icon: '●', label: 'Error' },
    warning: { color: 'text-state-warning', bg: 'bg-state-warning bg-opacity-10', icon: '⚠', label: 'Warning' },
    info: { color: 'text-state-info', bg: 'bg-state-info bg-opacity-10', icon: 'ℹ', label: 'Info' },
  }

  if (!isOpen || diagnostics.length === 0) {
    return null
  }

  return (
    <div className={`bg-bg-secondary border-t border-border-subtle flex flex-col ${className}`}>
      {/* Header with summary */}
      <div className="px-4 py-2 bg-bg-secondary border-b border-border-subtle flex items-center justify-between">
        <div className="text-xs font-semibold text-text-primary flex items-center gap-4">
          <span>PROBLEMS</span>
          <div className="flex gap-3">
            {errorCount > 0 && (
              <span className="text-state-error flex items-center gap-1">
                <span className="text-xs">●</span>
                {errorCount} error{errorCount > 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-state-warning flex items-center gap-1">
                <span className="text-xs">⚠</span>
                {warningCount} warning{warningCount > 1 ? 's' : ''}
              </span>
            )}
            {infoCount > 0 && (
              <span className="text-accent-primary flex items-center gap-1">
                <span className="text-xs">ℹ</span>
                {infoCount} info
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 py-2 bg-bg-secondary border-b border-border-subtle text-xs">
        {(['all', 'error', 'warning', 'info'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-1 rounded transition-colors ${
              filter === f
                ? 'bg-accent-primary text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Diagnostics list */}
      <div className="flex-1 overflow-y-auto">
        {filteredDiagnostics.length > 0 ? (
          <div className="space-y-1 p-2">
            {filteredDiagnostics.map((diagnostic, index) => {
              const config = severityConfig[diagnostic.severity]
              return (
                <div
                  key={index}
                  onClick={() => onSelectDiagnostic?.(diagnostic)}
                  className={`
                    p-3 rounded cursor-pointer transition-colors
                    ${config.bg} hover:opacity-80
                    border-l-2
                    ${
                      diagnostic.severity === 'error'
                        ? 'border-state-error'
                        : diagnostic.severity === 'warning'
                          ? 'border-state-warning'
                          : 'border-accent-primary'
                    }
                  `}
                >
                  {/* Diagnostic header */}
                  <div className="flex items-start gap-2 mb-1">
                    <span className={`text-lg leading-none ${config.color}`}>
                      {config.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold ${config.color}`}>
                        {diagnostic.severity === 'error' && 'Error'}
                        {diagnostic.severity === 'warning' && 'Warning'}
                        {diagnostic.severity === 'info' && 'Info'}
                        {diagnostic.code && ` [${diagnostic.code}]`}
                      </div>
                      <div className="text-xs text-text-primary mt-1 break-words">
                        {diagnostic.message}
                      </div>
                    </div>
                  </div>

                  {/* Line number and Actions */}
                  <div className="flex items-center justify-between ml-7 mt-2">
                    <div className="text-xs text-text-secondary">
                      Line {diagnostic.line}
                    </div>
                    {onFix && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFix(diagnostic);
                        }}
                        disabled={isFixing}
                        className="px-2 py-1 bg-accent-primary/20 hover:bg-accent-primary text-accent-primary hover:text-bg-primary rounded text-[10px] font-bold transition-all disabled:opacity-50"
                      >
                        {isFixing ? 'Generating...' : 'FIX WITH AI'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-text-secondary text-sm">
            No {filter !== 'all' ? filter + 's' : 'diagnostics'}
          </div>
        )}
      </div>
    </div>
  )
}
