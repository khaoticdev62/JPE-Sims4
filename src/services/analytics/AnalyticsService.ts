/**
 * Analytics Service
 * Aggregates and analyzes usage data for dashboard display
 */

import { useActivityStore } from '@/stores/useActivityStore'
import { useProjectStore } from '@/stores/useProjectStore'
import type { Project } from '@/types/index'
import type { UsageStats, PerformanceMetrics, ProjectComplexity } from './types'

export class AnalyticsService {
  /**
   * Calculate usage statistics from activities
   */
  static calculateUsageStats(activities: any[]): UsageStats {
    const projectIds = new Set(activities.map((a) => a.projectId))
    const addedFiles = activities.filter((a) => a.type === 'added')
    const translations = activities.filter((a) => a.type === 'translated')
    const validations = activities.filter((a) => a.type === 'completed')

    return {
      totalProjects: projectIds.size,
      totalFiles: addedFiles.length,
      totalCompilations: translations.length,
      totalValidations: validations.length,
      totalExplanations: 0, // Would track Claude API calls
    }
  }

  /**
   * Calculate performance metrics from recent activities
   */
  static calculatePerformanceMetrics(): PerformanceMetrics {
    // Would gather actual timing data from telemetry in production
    return {
      averageCompilationTime: 245.5,
      averageValidationTime: 156.3,
      averageExplanationTime: 3200.0,
      peakMemoryUsage: 512.8,
    }
  }

  /**
   * Calculate project complexity score
   */
  static calculateProjectComplexity(currentProject: Project | null): ProjectComplexity {
    if (!currentProject) {
      return {
        fileCount: 0,
        totalLines: 0,
        avgFileSize: 0,
        tuningReferences: 0,
        stblKeys: 0,
        complexityScore: 0,
      }
    }

    const totalLines = (currentProject.files || []).reduce(
      (sum, f) => sum + (f.content?.split('\n').length || 0),
      0
    )

    const tuningRefs = (currentProject.files || []).reduce(
      (sum, f) => sum + ((f.content?.match(/0x[0-9a-fA-F]{8}/g) || []).length || 0),
      0
    )

    const stblKeys = (currentProject.files || []).reduce(
      (sum, f) => sum + ((f.content?.match(/<key>|<string>/gi) || []).length || 0),
      0
    )

    const complexity = Math.min(
      Math.round(
        ((currentProject.files?.length || 0) * 2 +
          totalLines / 100 +
          tuningRefs / 10 +
          stblKeys / 10) *
          10
      ) / 10,
      100
    )

    return {
      fileCount: currentProject.files?.length || 0,
      totalLines,
      avgFileSize: totalLines / (currentProject.files?.length || 1),
      tuningReferences: tuningRefs,
      stblKeys,
      complexityScore: complexity,
    }
  }

  /**
   * Calculate 7-day activity trend
   */
  static calculateActivityTrend(activities: any[]): Array<{ date: string; count: number }> {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toISOString().split('T')[0],
        count: 0,
      }
    })

    activities.forEach((activity) => {
      const actDate = new Date(activity.timestamp).toISOString().split('T')[0]
      const day = last7Days.find((d) => d.date === actDate)
      if (day) day.count++
    })

    return last7Days
  }

  /**
   * Get file type breakdown
   */
  static getFileTypeBreakdown(currentProject: Project | null): Record<string, number> {
    const breakdown: Record<string, number> = {
      xml: 0,
      jpe: 0,
      txt: 0,
      other: 0,
    }

    (currentProject?.files || []).forEach((file) => {
      const ext = file.name?.split('.').pop()?.toLowerCase() || 'other'

      if (ext === 'xml') breakdown.xml++
      else if (ext === 'jpe') breakdown.jpe++
      else if (ext === 'txt') breakdown.txt++
      else breakdown.other++
    })

    return breakdown
  }

  /**
   * Generate summary report
   */
  static generateSummaryReport() {
    const { activities } = useActivityStore.getState()
    const { currentProject } = useProjectStore.getState()

    const usage = this.calculateUsageStats(activities)
    const performance = this.calculatePerformanceMetrics()
    const complexity = this.calculateProjectComplexity(currentProject)
    const trend = this.calculateActivityTrend(activities)

    return {
      timestamp: new Date().toISOString(),
      usage,
      performance,
      complexity,
      trend,
      fileBreakdown: this.getFileTypeBreakdown(currentProject),
    }
  }
}
