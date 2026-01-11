/**
 * Pattern Insight Component
 * Displays individual pattern insights with confidence visualization
 */

interface PatternInsightProps {
  pattern: {
    id: string
    type: 'tuning' | 'enum' | 'naming'
    label: string
    frequency: number
    confidence: number
    metadata?: string
  }
}

function getPatternIcon(type: string): string {
  const icons: Record<string, string> = {
    tuning: '🔗',
    enum: '📝',
    naming: '📛',
    structure: '🏗️',
  }
  return icons[type] || '📊'
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#2E8540' // success green
  if (confidence >= 0.6) return '#2680C2' // info blue
  if (confidence >= 0.4) return '#F5A623' // warning amber
  return '#E12D39' // error red
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'High'
  if (confidence >= 0.6) return 'Medium'
  if (confidence >= 0.4) return 'Low'
  return 'Very Low'
}

export default function PatternInsight({ pattern }: PatternInsightProps) {
  const icon = getPatternIcon(pattern.type)
  const confidenceColor = getConfidenceColor(pattern.confidence)
  const confidenceLabel = getConfidenceLabel(pattern.confidence)
  const confidencePercent = Math.round(pattern.confidence * 100)

  return (
    <div className="space-y-2 p-3 bg-background-tertiary rounded-lg border border-border-subtle hover:border-accent-primary transition-colors">
      {/* Header with icon and label */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{pattern.label}</p>
            {pattern.metadata && (
              <p className="text-xs text-text-tertiary truncate">{pattern.metadata}</p>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-semibold text-text-primary">{pattern.frequency}x</p>
          <p className="text-xs text-text-tertiary">Used</p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-tertiary">Confidence</span>
          <span
            className="text-xs font-semibold"
            style={{ color: confidenceColor }}
          >
            {confidenceLabel} ({confidencePercent}%)
          </span>
        </div>
        <div className="w-full h-2 bg-background-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${confidencePercent}%`,
              backgroundColor: confidenceColor,
            }}
          />
        </div>
      </div>

      {/* Pattern type badge */}
      <div className="flex gap-2">
        <span className="text-xs px-2 py-1 bg-background-secondary rounded text-text-secondary">
          {pattern.type === 'tuning'
            ? 'Tuning Reference'
            : pattern.type === 'enum'
              ? 'Enum Value'
              : 'Naming Convention'}
        </span>
      </div>
    </div>
  )
}
