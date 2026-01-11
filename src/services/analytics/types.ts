/**
 * Telemetry and Analytics Types
 * Type definitions for telemetry collection and analytics
 */

export type EventCategory = 'usage' | 'performance' | 'error' | 'feature'

export interface TelemetryEvent {
  userId: string
  timestamp: number
  category: EventCategory
  action: string
  metadata?: Record<string, any>
}

export interface TelemetryBatch {
  userId: string
  timestamp: number
  events: TelemetryEvent[]
}

export interface TelemetryStats {
  totalEvents: number
  eventsThisSession: number
  lastEventTime: number
  enabled: boolean
}

export interface UsageStats {
  totalProjects: number
  totalFiles: number
  totalCompilations: number
  totalValidations: number
  totalExplanations: number
}

export interface PerformanceMetrics {
  averageCompilationTime: number
  averageValidationTime: number
  averageExplanationTime: number
  peakMemoryUsage: number
}

export interface ProjectComplexity {
  fileCount: number
  totalLines: number
  avgFileSize: number
  tuningReferences: number
  stblKeys: number
  complexityScore: number
}
