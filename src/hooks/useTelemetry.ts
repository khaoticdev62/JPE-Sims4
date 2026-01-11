/**
 * useTelemetry Hook
 * Custom hook for easy telemetry integration throughout the application
 */

import { useCallback } from 'react'
import { TelemetryService } from '@services/analytics/TelemetryService'
import { useTelemetryStore } from '@stores/useTelemetryStore'

export interface UseTelemetryResult {
  trackFeature: (feature: string, metadata?: Record<string, any>) => void
  trackPerformance: <T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ) => Promise<T>
  trackError: (error: Error, context?: string) => void
  enabled: boolean
}

/**
 * Hook to integrate telemetry tracking into components
 * @returns Telemetry tracking functions and enabled state
 */
export function useTelemetry(): UseTelemetryResult {
  const { enabled } = useTelemetryStore()
  const service = TelemetryService.getInstance()

  /**
   * Track feature usage
   */
  const trackFeature = useCallback(
    (feature: string, metadata?: Record<string, any>) => {
      if (!enabled) return

      try {
        service.trackFeature(feature, metadata)
      } catch (error) {
        console.error('[useTelemetry] Failed to track feature:', error)
      }
    },
    [enabled, service]
  )

  /**
   * Track performance of an async operation
   */
  const trackPerformance = useCallback(
    async <T,>(
      operation: string,
      fn: () => Promise<T>,
      metadata?: Record<string, any>
    ): Promise<T> => {
      const start = performance.now()

      try {
        const result = await fn()
        const duration = performance.now() - start

        if (enabled) {
          service.trackPerformance(operation, duration, metadata)
        }

        return result
      } catch (error) {
        const duration = performance.now() - start

        if (enabled) {
          service.trackPerformance(`${operation}:error`, duration, {
            ...metadata,
            error: error instanceof Error ? error.message : String(error),
          })
        }

        throw error
      }
    },
    [enabled, service]
  )

  /**
   * Track error occurrence
   */
  const trackError = useCallback(
    (error: Error, context?: string) => {
      if (!enabled) return

      try {
        service.trackError(error, context)
      } catch (err) {
        console.error('[useTelemetry] Failed to track error:', err)
      }
    },
    [enabled, service]
  )

  return {
    trackFeature,
    trackPerformance,
    trackError,
    enabled,
  }
}

/**
 * Hook to get telemetry status and controls
 */
export function useTelemetryStatus() {
  const { enabled, consentGiven, enableTelemetry, disableTelemetry } = useTelemetryStore()

  return {
    enabled,
    consentGiven,
    enableTelemetry,
    disableTelemetry,
  }
}

/**
 * Hook to track a component's lifecycle
 */
export function useTelemetryPageView(pageId: string) {
  const { trackFeature } = useTelemetry()

  // Track page view on mount
  React.useEffect(() => {
    trackFeature(`page-view:${pageId}`)
  }, [pageId, trackFeature])
}

// Import React for useEffect
import * as React from 'react'
