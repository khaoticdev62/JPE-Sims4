/**
 * Performance Graph
 * Simple ASCII bar chart for performance visualization
 */

interface PerformanceGraphProps {
  title: string
  data: number[]
  color?: string
  unit?: string
}

export default function PerformanceGraph({
  title,
  data,
  color = '#2EC4B6',
  unit = 'ms'
}: PerformanceGraphProps) {
  if (data.length === 0) {
    return (
      <div className="bg-background-secondary border border-border-subtle rounded-lg p-4">
        <h4 className="text-sm font-semibold text-text-primary mb-4">{title}</h4>
        <p className="text-xs text-text-secondary">No data available</p>
      </div>
    )
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const avg = Math.round(data.reduce((a, b) => a + b, 0) / data.length)

  // Create simple text-based bar chart
  const chartHeight = 100 // pixels for visualization

  return (
    <div className="bg-background-secondary border border-border-subtle rounded-lg p-4">
      <div className="space-y-3">
        {/* Title */}
        <h4 className="text-sm font-semibold text-text-primary">{title}</h4>

        {/* Stats Row */}
        <div className="flex justify-between text-xs text-text-tertiary">
          <span>Min: {min}{unit}</span>
          <span>Avg: {avg}{unit}</span>
          <span>Max: {max}{unit}</span>
        </div>

        {/* Simple Bar Visualization */}
        <div className="space-y-1">
          {data.map((value, idx) => {
            const height = ((value - min) / range) * 100 || 5
            const isMax = value === max
            const isMin = value === min
            const isAboveAvg = value > avg

            return (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-text-tertiary w-6 text-right">{idx + 1}</span>

                <div className="flex-1 h-6 bg-background-tertiary rounded overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isMax
                        ? 'bg-state-warning'
                        : isAboveAvg
                          ? 'bg-accent-primary'
                          : 'bg-state-success'
                    }`}
                    style={{ width: `${Math.max(height, 5)}%` }}
                  />
                </div>

                <span
                  className={`text-xs font-mono w-12 text-right ${
                    isMax
                      ? 'text-state-warning'
                      : isAboveAvg
                        ? 'text-accent-primary'
                        : 'text-state-success'
                  }`}
                >
                  {value}{unit}
                </span>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-state-success rounded" />
            <span className="text-text-tertiary">Good</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-accent-primary rounded" />
            <span className="text-text-tertiary">Above Avg</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-state-warning rounded" />
            <span className="text-text-tertiary">Peak</span>
          </div>
        </div>
      </div>
    </div>
  )
}
