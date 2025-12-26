import { useDiagnosticStore } from '@stores/useDiagnosticStore'
import { useUIStore } from '@stores/useUIStore'

export default function RightPanel() {
  const { getFilteredDiagnostics } = useDiagnosticStore()
  const { rightPanelCollapsed } = useUIStore()

  const diagnostics = getFilteredDiagnostics()

  if (rightPanelCollapsed) {
    return (
      <div className="w-12 bg-slate-900 border-l border-slate-800 flex flex-col items-center py-4">
        <div className="text-xs text-slate-400">Diagnostics</div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
      <div className="h-12 border-b border-slate-800 flex items-center px-4">
        <h2 className="text-sm font-semibold text-slate-100">
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
                    ? 'bg-red-950 border-red-500 text-red-200'
                    : diagnostic.severity === 'warning'
                      ? 'bg-yellow-950 border-yellow-500 text-yellow-200'
                      : 'bg-blue-950 border-blue-500 text-blue-200'
                }`}
              >
                <div className="font-semibold">
                  {diagnostic.code}: {diagnostic.severity.toUpperCase()}
                </div>
                <div className="mt-1">{diagnostic.message}</div>
                <div className="mt-1 text-xs opacity-75">
                  Line {diagnostic.line + 1}, Col {diagnostic.column + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-xs text-slate-500 text-center">
            No diagnostics
          </div>
        )}
      </div>
    </div>
  )
}
