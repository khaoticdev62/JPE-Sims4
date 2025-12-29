interface BuildProgressProps {
  progress: number
  currentFile: string | null
  buildTime: number
}

/**
 * Progress bar and status display for ongoing build
 */
export default function BuildProgress({
  progress,
  currentFile,
  buildTime,
}: BuildProgressProps) {
  const estimatedTotal = buildTime > 0 ? Math.round(buildTime / (progress / 100)) : 0
  const remainingTime = Math.max(0, estimatedTotal - buildTime)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">
          Building Project...
        </span>
        <span className="text-sm font-semibold text-accent-primary">
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Current File */}
      {currentFile && (
        <div className="text-xs text-text-secondary truncate">
          Current: {currentFile}
        </div>
      )}

      {/* Time Stats */}
      <div className="flex gap-4 text-xs text-text-secondary">
        <span>Elapsed: {(buildTime / 1000).toFixed(1)}s</span>
        {progress > 0 && (
          <span>Remaining: ~{(remainingTime / 1000).toFixed(1)}s</span>
        )}
      </div>
    </div>
  )
}
