import type { Diagnostic } from '@/types/index'
import { useDiagnosticAction } from '@/hooks/useDiagnosticAction'
import { FixDiffModal } from '../editor/FixDiffModal'

interface DiagnosticItemProps {
  diagnostic: Diagnostic
  fileName: string
  onNavigate?: (fileId: string, line: number, column: number) => void
}

/**
 * Individual diagnostic item with navigation and AI actions
 */
export default function DiagnosticItem({
  diagnostic,
  fileName,
  onNavigate,
}: DiagnosticItemProps) {
  const { 
    explainDiagnostic, 
    fixDiagnostic, 
    isExplaining, 
    isFixing,
    diffData,
    setDiffData,
    applyFix
  } = useDiagnosticAction()

  const getSeverityColor = (severity: string, source?: string) => {
    if (source === 'ai') return 'text-indigo-400'
    if (source === 'community') return 'text-amber-400'

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

  const getSourceStyles = (source?: string) => {
    switch (source) {
      case 'ai':
        return 'bg-indigo-500/5 border-l-2 border-l-indigo-500 ring-1 ring-indigo-500/20'
      case 'community':
        return 'bg-amber-500/5 border-l-2 border-l-amber-500 ring-1 ring-amber-500/20'
      default:
        return 'border-l-2 border-l-transparent'
    }
  }

  const getSeverityIcon = (diagnostic: Diagnostic) => {
    if (isExplaining) return '🧠' // Animated or loading? Simple icon for now
    if (isFixing) return '🔧'

    if (diagnostic.source === 'ai') return '🧠'
    if (diagnostic.source === 'community') return '🛡️'
    
    switch (diagnostic.severity) {
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

  const handleAction = (e: React.MouseEvent, type: 'explain' | 'fix') => {
    e.stopPropagation()
    if (type === 'explain') explainDiagnostic(diagnostic)
    else fixDiagnostic(diagnostic)
  }

  return (
    <>
      <div
        onClick={() =>
          onNavigate?.(diagnostic.fileId, diagnostic.line, diagnostic.column)
        }
        className={`w-full text-left px-3 py-2 text-xs rounded transition-all duration-200 group relative overflow-hidden cursor-pointer ${getSourceStyles(diagnostic.source)} hover:bg-background-tertiary`}
      >
        {/* Beam effect for AI/Community */}
        {(diagnostic.source === 'ai' || diagnostic.source === 'community' || isExplaining || isFixing) && (
          <div className={`absolute top-0 right-0 w-1 h-full animate-pulse transition-colors ${
            (diagnostic.source === 'ai' || isExplaining) ? 'bg-indigo-500/30' : 'bg-amber-500/30'
          }`} />
        )}

        <div className="flex gap-2 items-start relative z-10">
          {/* Severity/Source Icon */}
          <span className={`flex-shrink-0 mt-0.5 text-base leading-none ${isExplaining || isFixing ? 'animate-spin-slow' : ''}`}>
            {getSeverityIcon(diagnostic)}
          </span>

          {/* Diagnostic Content */}
          <div className="flex-1 min-w-0">
            {/* Header row: Source Badge, Line, Column, Code */}
            <div className="flex flex-wrap gap-2 items-center mb-1">
              {diagnostic.source && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${
                  diagnostic.source === 'ai' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {diagnostic.source === 'ai' ? 'AI Logic' : 'Community'}
                </span>
              )}
              <div className={`flex gap-2 items-center ${getSeverityColor(diagnostic.severity, diagnostic.source)}`}>
                <span className="font-medium">
                  {fileName}:{diagnostic.line}:{diagnostic.column}
                </span>
                {diagnostic.code && (
                  <span className="opacity-60 text-[10px]">
                    [{diagnostic.code}]
                  </span>
                )}
              </div>

              {/* Action Buttons (Hover only) */}
              <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleAction(e, 'explain')}
                  disabled={isExplaining}
                  title="AI Explain"
                  className="p-1 hover:bg-indigo-500/20 text-indigo-400 rounded transition-colors"
                >
                  🧠
                </button>
                <button 
                  onClick={(e) => handleAction(e, 'fix')}
                  disabled={isFixing}
                  title="AI Fix"
                  className="p-1 hover:bg-accent-primary/20 text-accent-primary rounded transition-colors"
                >
                  🔧
                </button>
              </div>
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
          <span className="flex-shrink-0 text-text-tertiary group-hover:text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity self-center">
            →
          </span>
        </div>
      </div>

      {/* Render Fix Modal for THIS item if it has diffData */}
      {diffData && (
        <FixDiffModal
          isOpen={!!diffData}
          onClose={() => setDiffData(null)}
          onApply={applyFix}
          original={diffData.original}
          modified={diffData.modified}
          explanation={diffData.explanation}
          fileName={diffData.fileName}
        />
      )}
    </>
  )
}
