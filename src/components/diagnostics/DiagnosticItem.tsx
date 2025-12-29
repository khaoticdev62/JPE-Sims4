import type { Diagnostic } from '@/types/index'

interface DiagnosticItemProps {
  diagnostic: Diagnostic
  fileName: string
  onNavigate?: (fileId: string, line: number, column: number) => void
}

/**
 * Individual diagnostic item with navigation
 */
export default function DiagnosticItem({
  diagnostic,
  fileName,
  onNavigate,
}: DiagnosticItemProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-state-error'
      case 'warning':
        return 'text-state-warning'
      case 'info':
        return 'text-state-info'
      default:
        return 'text-text-secondary'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return '🔴'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '•'
    }
  }

  return (
    <button
      onClick={() =>
        onNavigate?.(diagnostic.fileId, diagnostic.line, diagnostic.column)
      }
      className="w-full text-left px-3 py-2 text-xs rounded hover:bg-background-tertiary transition-colors group"
    >
      <div className="flex gap-2 items-start">
        {/* Severity Icon */}
        <span className="flex-shrink-0 mt-0.5 text-base leading-none">
          {getSeverityIcon(diagnostic.severity)}
        </span>

        {/* Diagnostic Content */}
        <div className="flex-1 min-w-0">
          {/* Line, Column, Code */}
          <div className={`flex gap-2 items-center mb-1 ${getSeverityColor(diagnostic.severity)}`}>
            <span className="font-medium">
              {fileName}:{diagnostic.line}:{diagnostic.column}
            </span>
            {diagnostic.code && (
              <span className="text-text-secondary text-xs">
                [{diagnostic.code}]
              </span>
            )}
          </div>

          {/* Message */}
          <p className="text-text-primary mb-1 group-hover:text-accent-primary transition-colors">
            {diagnostic.message}
          </p>

          {/* Suggestion */}
          {diagnostic.suggestion && (
            <p className="text-text-secondary text-xs">
              💡 {diagnostic.suggestion}
            </p>
          )}
        </div>

        {/* Hover Indicator */}
        <span className="flex-shrink-0 text-text-tertiary group-hover:text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity">
          →
        </span>
      </div>
    </button>
  )
}
