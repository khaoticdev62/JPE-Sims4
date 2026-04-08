"use client";

/**
 * Analytics Dashboard
 * Displays comprehensive usage statistics and insights
 */

import { useState, useEffect } from 'react'
import { AnalyticsService } from '@/services/analytics/AnalyticsService'
import { useActivityStore } from '@/stores/useActivityStore'
import { useProjectStore } from '@/stores/useProjectStore'

export default function AnalyticsDashboard() {
  const [usage, setUsage] = useState<any>(null)
  const [performance, setPerformance] = useState<any>(null)
  const [complexity, setComplexity] = useState<any>(null)
  const [trend, setTrend] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = () => {
    setLoading(true)

    try {
      const { activities } = useActivityStore.getState()
      const { currentProject } = useProjectStore.getState()

      const usageStats = AnalyticsService.calculateUsageStats(activities)
      const perfMetrics = AnalyticsService.calculatePerformanceMetrics()
      const complexityMetrics = AnalyticsService.calculateProjectComplexity(currentProject)
      const activityTrend = AnalyticsService.calculateActivityTrend(activities)

      setUsage(usageStats)
      setPerformance(perfMetrics)
      setComplexity(complexityMetrics)
      setTrend(activityTrend)
    } catch (error) {
      console.error('[AnalyticsDashboard] Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-text-secondary">
          <div className="text-2xl mb-2 animate-spin">⏳</div>
          <div>Loading analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background-primary">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle space-y-2">
        <h2 className="text-2xl font-bold text-text-primary">Analytics</h2>
        <p className="text-sm text-text-secondary">
          Monitor your usage statistics and project insights
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Usage Statistics */}
        {usage && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">Usage Statistics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Projects */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-text-secondary">Projects</p>
                <p className="text-3xl font-bold text-text-primary">{usage.totalProjects}</p>
                <p className="text-xs text-text-tertiary">Created</p>
              </div>

              {/* Total Files */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-text-secondary">Files</p>
                <p className="text-3xl font-bold text-text-primary">{usage.totalFiles}</p>
                <p className="text-xs text-text-tertiary">Processed</p>
              </div>

              {/* Total Compilations */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-text-secondary">Compilations</p>
                <p className="text-3xl font-bold text-accent-primary">{usage.totalCompilations}</p>
                <p className="text-xs text-text-tertiary">Successful</p>
              </div>

              {/* Total Validations */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-text-secondary">Validations</p>
                <p className="text-3xl font-bold text-state-success">{usage.totalValidations}</p>
                <p className="text-xs text-text-tertiary">Completed</p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {performance && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">Performance</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Compilation Time */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-text-secondary">Avg Compilation</p>
                <p className="text-2xl font-bold text-text-primary">
                  {performance.averageCompilationTime}
                  <span className="text-lg text-text-tertiary">ms</span>
                </p>
              </div>

              {/* Validation Time */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-text-secondary">Avg Validation</p>
                <p className="text-2xl font-bold text-text-primary">
                  {performance.averageValidationTime}
                  <span className="text-lg text-text-tertiary">ms</span>
                </p>
              </div>

              {/* Explanation Time */}
              <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-text-secondary">Avg Explanation</p>
                <p className="text-2xl font-bold text-text-primary">
                  {(performance.averageExplanationTime / 1000).toFixed(1)}
                  <span className="text-lg text-text-tertiary">s</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Project Complexity */}
        {complexity && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">Project Complexity</h3>

            <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Files</span>
                  <span className="text-sm font-semibold text-text-primary">{complexity.fileCount}</span>
                </div>
                <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-primary rounded-full"
                    style={{ width: `${Math.min((complexity.fileCount / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Total Lines</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {complexity.totalLines.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-state-info rounded-full"
                    style={{ width: `${Math.min((complexity.totalLines / 10000) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Complexity Score</span>
                  <span className="text-sm font-semibold text-text-primary">
                    {complexity.complexityScore}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${complexity.complexityScore}%`,
                      backgroundColor:
                        complexity.complexityScore > 70
                          ? '#E12D39'
                          : complexity.complexityScore > 40
                            ? '#F5A623'
                            : '#2E8540',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Trend */}
        {trend.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">7-Day Activity</h3>

            <div className="bg-background-secondary border border-border-subtle rounded-lg p-4">
              <div className="flex items-end gap-2 h-32">
                {trend.map((day, idx) => {
                  const maxCount = Math.max(...trend.map((d) => d.count), 1)
                  const height = (day.count / maxCount) * 100

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-accent-primary/20 rounded flex items-end justify-center" style={{ height: '100px' }}>
                        <div
                          className="w-full bg-accent-primary rounded-t transition-all"
                          style={{
                            height: `${height}%`,
                            minHeight: day.count > 0 ? '4px' : '0px',
                          }}
                        />
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-text-tertiary bg-background-tertiary p-4 rounded border border-border-subtle space-y-2">
          <p>
            <strong>📊 Analytics:</strong> All data is collected locally and anonymously (if telemetry is enabled).
          </p>
          <p>
            <strong>🔒 Privacy:</strong> No personal information is stored or transmitted.
          </p>
        </div>
      </div>
    </div>
  )
}
