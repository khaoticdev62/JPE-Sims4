/**
 * Performance Panel
 * Display performance metrics and profiling information
 */

import { useState, useMemo } from 'react'
import PerformanceMetrics from './PerformanceMetrics'
import PerformanceGraph from './PerformanceGraph'

interface PerformanceMetric {
  timestamp: Date
  validationTime: number
  parseTime: number
  compileTime: number
}

interface PerformanceWarning {
  type: 'cache' | 'validation' | 'build'
  severity: 'info' | 'warning' | 'error'
  message: string
  suggestion?: string
}

export default function PerformancePanel() {
  const [metrics] = useState<PerformanceMetric[]>([
    { timestamp: new Date(Date.now() - 10 * 60000), validationTime: 45, parseTime: 12, compileTime: 28 },
    { timestamp: new Date(Date.now() - 9 * 60000), validationTime: 52, parseTime: 14, compileTime: 31 },
    { timestamp: new Date(Date.now() - 8 * 60000), validationTime: 48, parseTime: 11, compileTime: 29 },
    { timestamp: new Date(Date.now() - 7 * 60000), validationTime: 156, parseTime: 45, compileTime: 78 },
    { timestamp: new Date(Date.now() - 6 * 60000), validationTime: 51, parseTime: 13, compileTime: 30 },
    { timestamp: new Date(Date.now() - 5 * 60000), validationTime: 49, parseTime: 12, compileTime: 28 },
    { timestamp: new Date(Date.now() - 4 * 60000), validationTime: 47, parseTime: 11, compileTime: 27 },
    { timestamp: new Date(Date.now() - 3 * 60000), validationTime: 50, parseTime: 13, compileTime: 29 },
    { timestamp: new Date(Date.now() - 2 * 60000), validationTime: 46, parseTime: 12, compileTime: 28 },
    { timestamp: new Date(Date.now() - 60000), validationTime: 48, parseTime: 11, compileTime: 27 }
  ])

  const performanceWarnings = useMemo((): PerformanceWarning[] => {
    const warnings: PerformanceWarning[] = []

    // Analyze for slow operations
    const avgValidationTime = metrics.reduce((sum, m) => sum + m.validationTime, 0) / metrics.length
    const slowValidations = metrics.filter((m) => m.validationTime > avgValidationTime * 2)

    if (slowValidations.length > 2) {
      warnings.push({
        type: 'validation',
        severity: 'warning',
        message: `${slowValidations.length} validation operations exceeded 2x average time`,
        suggestion: 'Consider enabling background validation for large files'
      })
    }

    // Check for cache effectiveness
    const currentMetrics = metrics[metrics.length - 1]
    if (currentMetrics && currentMetrics.parseTime > 40) {
      warnings.push({
        type: 'cache',
        severity: 'info',
        message: 'Parser cache may not be effective for current file set',
        suggestion: 'Verify parser cache is enabled in settings'
      })
    }

    return warnings
  }, [metrics])

  const stats = useMemo(() => {
    if (metrics.length === 0) {
      return {
        avgValidation: 0,
        avgParse: 0,
        avgCompile: 0,
        maxValidation: 0,
        maxParse: 0,
        maxCompile: 0,
        totalOperations: 0
      }
    }

    return {
      avgValidation: Math.round(metrics.reduce((sum, m) => sum + m.validationTime, 0) / metrics.length),
      avgParse: Math.round(metrics.reduce((sum, m) => sum + m.parseTime, 0) / metrics.length),
      avgCompile: Math.round(metrics.reduce((sum, m) => sum + m.compileTime, 0) / metrics.length),
      maxValidation: Math.max(...metrics.map((m) => m.validationTime)),
      maxParse: Math.max(...metrics.map((m) => m.parseTime)),
      maxCompile: Math.max(...metrics.map((m) => m.compileTime)),
      totalOperations: metrics.length
    }
  }, [metrics])

  return (
    <div className="flex flex-col h-full bg-background-primary">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Performance</h2>
        <p className="text-sm text-text-secondary">
          Monitor performance metrics and identify bottlenecks
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Statistics Grid */}
        <PerformanceMetrics stats={stats} />

        {/* Performance Graphs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Operation Times (Last 10)</h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <PerformanceGraph
              title="Validation Time"
              data={metrics.map((m) => m.validationTime)}
              color="#2EC4B6"
              unit="ms"
            />

            <PerformanceGraph
              title="Parse Time"
              data={metrics.map((m) => m.parseTime)}
              color="#2680C2"
              unit="ms"
            />

            <PerformanceGraph
              title="Compile Time"
              data={metrics.map((m) => m.compileTime)}
              color="#2E8540"
              unit="ms"
            />
          </div>
        </div>

        {/* Performance Warnings */}
        {performanceWarnings.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">Performance Insights</h3>

            {performanceWarnings.map((warning, idx) => {
              const bgColor =
                warning.severity === 'error'
                  ? 'bg-state-error/10'
                  : warning.severity === 'warning'
                    ? 'bg-state-warning/10'
                    : 'bg-state-info/10'

              const borderColor =
                warning.severity === 'error'
                  ? 'border-state-error/30'
                  : warning.severity === 'warning'
                    ? 'border-state-warning/30'
                    : 'border-state-info/30'

              const textColor =
                warning.severity === 'error'
                  ? 'text-state-error'
                  : warning.severity === 'warning'
                    ? 'text-state-warning'
                    : 'text-state-info'

              const icon =
                warning.severity === 'error' ? '❌' : warning.severity === 'warning' ? '⚠️' : 'ℹ️'

              return (
                <div key={idx} className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
                  <p className={`text-sm font-semibold ${textColor} mb-1`}>
                    {icon} {warning.message}
                  </p>

                  {warning.suggestion && (
                    <p className={`text-xs ${textColor}/80`}>💡 {warning.suggestion}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {performanceWarnings.length === 0 && (
          <div className="bg-state-success/10 border border-state-success/30 rounded-lg p-4">
            <p className="text-sm text-state-success">
              ✅ All performance metrics within normal range. Keep up the good work!
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="bg-background-secondary border border-border-subtle rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">Performance Tips</h3>

          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex gap-3">
              <span className="text-accent-primary">•</span>
              <span>Enable parser cache to speed up repeated file operations</span>
            </li>

            <li className="flex gap-3">
              <span className="text-accent-primary">•</span>
              <span>Use background validation to keep the UI responsive</span>
            </li>

            <li className="flex gap-3">
              <span className="text-accent-primary">•</span>
              <span>Batch file operations instead of processing one at a time</span>
            </li>

            <li className="flex gap-3">
              <span className="text-accent-primary">•</span>
              <span>Close unused projects to reduce memory usage</span>
            </li>

            <li className="flex gap-3">
              <span className="text-accent-primary">•</span>
              <span>Monitor performance during large builds using this panel</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
