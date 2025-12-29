import type { BuildResults } from '@/stores/useBuildStore'

interface BuildResultsProps {
  results: BuildResults | null
}

/**
 * Build results summary showing statistics and metrics
 */
export default function BuildResults({ results }: BuildResultsProps) {
  if (!results) return null

  const successCount = results.filesProcessed - results.filesWithErrors - results.filesWithWarnings

  // Determine status color
  const statusColor =
    results.filesWithErrors > 0
      ? 'text-state-error'
      : results.filesWithWarnings > 0
        ? 'text-state-warning'
        : 'text-state-success'

  const statusIcon =
    results.filesWithErrors > 0 ? '✗' : results.filesWithWarnings > 0 ? '⚠️' : '✓'

  const statusText =
    results.filesWithErrors > 0
      ? 'Build Failed'
      : results.filesWithWarnings > 0
        ? 'Build Completed with Warnings'
        : 'Build Successful'

  return (
    <div className="space-y-4 p-4 bg-background-tertiary rounded-lg border border-border-subtle">
      {/* Status Header */}
      <div className="flex items-center gap-2">
        <span className={`text-2xl leading-none ${statusColor}`}>
          {statusIcon}
        </span>
        <h3 className={`text-lg font-semibold ${statusColor}`}>
          {statusText}
        </h3>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Files Processed */}
        <div className="p-3 bg-background-secondary rounded">
          <div className="text-xs text-text-secondary mb-1">Files Processed</div>
          <div className="text-xl font-bold text-accent-primary">
            {results.filesProcessed}
          </div>
        </div>

        {/* Success */}
        {successCount > 0 && (
          <div className="p-3 bg-background-secondary rounded">
            <div className="text-xs text-text-secondary mb-1">✅ Successful</div>
            <div className="text-xl font-bold text-state-success">
              {successCount}
            </div>
          </div>
        )}

        {/* Warnings */}
        {results.filesWithWarnings > 0 && (
          <div className="p-3 bg-background-secondary rounded">
            <div className="text-xs text-text-secondary mb-1">⚠️ With Warnings</div>
            <div className="text-xl font-bold text-state-warning">
              {results.filesWithWarnings}
            </div>
          </div>
        )}

        {/* Errors */}
        {results.filesWithErrors > 0 && (
          <div className="p-3 bg-background-secondary rounded">
            <div className="text-xs text-text-secondary mb-1">🔴 Failed</div>
            <div className="text-xl font-bold text-state-error">
              {results.filesWithErrors}
            </div>
          </div>
        )}

        {/* Total Errors */}
        <div className="p-3 bg-background-secondary rounded">
          <div className="text-xs text-text-secondary mb-1">Total Errors</div>
          <div className={`text-xl font-bold ${results.totalErrors > 0 ? 'text-state-error' : 'text-text-secondary'}`}>
            {results.totalErrors}
          </div>
        </div>

        {/* Total Warnings */}
        <div className="p-3 bg-background-secondary rounded">
          <div className="text-xs text-text-secondary mb-1">Total Warnings</div>
          <div className={`text-xl font-bold ${results.totalWarnings > 0 ? 'text-state-warning' : 'text-text-secondary'}`}>
            {results.totalWarnings}
          </div>
        </div>

        {/* Build Time */}
        <div className="p-3 bg-background-secondary rounded">
          <div className="text-xs text-text-secondary mb-1">Build Time</div>
          <div className="text-xl font-bold text-text-primary">
            {(results.buildTime / 1000).toFixed(2)}s
          </div>
        </div>
      </div>
    </div>
  )
}
