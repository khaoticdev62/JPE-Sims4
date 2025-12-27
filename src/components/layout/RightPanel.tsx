import { useDiagnosticStore } from '@stores/useDiagnosticStore'
import { useUIStore } from '@stores/useUIStore'

export default function RightPanel() {
  const { getFilteredDiagnostics } = useDiagnosticStore()
  const { rightPanelCollapsed } = useUIStore()

  const diagnostics = getFilteredDiagnostics()

  if (rightPanelCollapsed) {
    return (
      <div className="w-12 bg-bg-secondary border-l border-border-subtle flex flex-col items-center py-4">
        <div className="text-xs text-text-secondary">Diagnostics</div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-bg-secondary border-l border-border-subtle flex flex-col overflow-hidden">
      <div className="h-12 border-b border-border-subtle flex items-center px-4">
        <h2 className="text-sm font-semibold text-text-primary">
          Diagnostics ({diagnostics.length})
        </h2>
      </div>

      {/* Diagnostics List */}
      <div className="flex-1 overflow-y-auto">
        {diagnostics.length > 0 ? (
          <div className="p-2">
            {diagnostics.map((diagnostic) => (
              <div
                key={diagnostic.id}
                className={`mb-2 p-2 rounded text-xs border-l-2 ${
                  diagnostic.severity === 'error'
                    ? 'bg-state-error bg-opacity-10 border-state-error text-state-error'
                    : diagnostic.severity === 'warning'
                      ? 'bg-state-warning bg-opacity-10 border-state-warning text-state-warning'
                      : 'bg-accent-primary bg-opacity-10 border-accent-primary text-accent-primary'
                }`}
              >
                <div className="font-semibold text-text-primary">
                  {diagnostic.code}: {diagnostic.severity.toUpperCase()}
                </div>
                <div className="mt-1 text-text-secondary">{diagnostic.message}</div>
                <div className="mt-1 text-xs text-text-secondary opacity-75">
                  Line {diagnostic.line + 1}, Col {diagnostic.column + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-xs text-text-secondary text-center">
            No diagnostics
          </div>
        )}
      </div>
    </div>
  )
}
