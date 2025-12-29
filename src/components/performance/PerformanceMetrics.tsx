/**
 * Performance Metrics
 * Display statistics about performance operations
 */

interface Stats {
  avgValidation: number
  avgParse: number
  avgCompile: number
  maxValidation: number
  maxParse: number
  maxCompile: number
  totalOperations: number
}

interface PerformanceMetricsProps {
  stats: Stats
}

interface MetricCard {
  icon: string
  label: string
  value: string
  description: string
  color: string
}

export default function PerformanceMetrics({ stats }: PerformanceMetricsProps) {
  const metrics: MetricCard[] = [
    {
      icon: '✅',
      label: 'Avg Validation',
      value: `${stats.avgValidation}ms`,
      description: `Max: ${stats.maxValidation}ms`,
      color: 'text-state-success'
    },
    {
      icon: '📖',
      label: 'Avg Parse',
      value: `${stats.avgParse}ms`,
      description: `Max: ${stats.maxParse}ms`,
      color: 'text-state-info'
    },
    {
      icon: '🔨',
      label: 'Avg Compile',
      value: `${stats.avgCompile}ms`,
      description: `Max: ${stats.maxCompile}ms`,
      color: 'text-accent-primary'
    },
    {
      icon: '📊',
      label: 'Operations',
      value: `${stats.totalOperations}`,
      description: 'In current session',
      color: 'text-text-secondary'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className="bg-background-secondary border border-border-subtle rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-secondary">{metric.label}</p>
            <span className="text-2xl">{metric.icon}</span>
          </div>

          <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>

          <p className="text-xs text-text-tertiary">{metric.description}</p>
        </div>
      ))}
    </div>
  )
}
