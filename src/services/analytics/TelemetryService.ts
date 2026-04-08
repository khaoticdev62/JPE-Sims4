/**
 * Telemetry Service
 * Main service for opt-in, anonymous telemetry collection
 */

import { v4 as uuidv4 } from 'uuid'
import { TelemetryBatcher } from './TelemetryBatcher'
import { PIISanitizer } from './PIISanitizer'
import type { TelemetryEvent, EventCategory, TelemetryStats } from './types'
import { safeStorage } from '@/utils/storage'

export class TelemetryService {
  private static instance: TelemetryService | null = null

  private userId: string = 'ssr-user'
  private batcher: TelemetryBatcher | null = null
  private enabled = false
  private stats = {
    totalEvents: 0,
    eventsThisSession: 0,
    lastEventTime: 0,
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.userId = this.getOrCreateUserId()
      this.batcher = new TelemetryBatcher()
      this.enabled = this.loadEnabledState()
      console.debug(`[Telemetry] Service initialized. Enabled: ${this.enabled}`)
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService()
    }
    return TelemetryService.instance
  }

  /**
   * Enable telemetry collection
   */
  enable(): void {
    this.enabled = true
    safeStorage.setItem('telemetry-enabled', 'true')
    console.info('[Telemetry] Telemetry enabled')
  }

  /**
   * Disable telemetry collection
   */
  disable(): void {
    this.enabled = false
    safeStorage.setItem('telemetry-enabled', 'false')
    console.info('[Telemetry] Telemetry disabled')
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Track a generic event
   */
  trackEvent(
    category: EventCategory,
    action: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.enabled || !this.batcher) return

    const event: TelemetryEvent = {
      userId: this.userId,
      timestamp: Date.now(),
      category,
      action,
      metadata: metadata ? PIISanitizer.sanitize(metadata) : undefined,
    }

    this.batcher.addEvent(event)
    this.stats.totalEvents++
    this.stats.eventsThisSession++
    this.stats.lastEventTime = Date.now()
  }

  /**
   * Track feature usage
   */
  trackFeature(feature: string, metadata?: Record<string, any>): void {
    this.trackEvent('feature', `use:${feature}`, metadata)
  }

  /**
   * Track performance metric
   */
  trackPerformance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent('performance', operation, {
      duration: Math.round(duration * 100) / 100,
      ...metadata,
    })
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: string): void {
    if (!this.enabled || !this.batcher) return

    const metadata: Record<string, any> = {
      errorName: error.name,
      errorMessage: error.message,
      context,
    }

    if (error.stack) {
      metadata.stack = PIISanitizer.sanitizeStackTrace(error.stack)
    }

    this.trackEvent('error', error.name, metadata)
  }

  /**
   * Track usage statistics
   */
  trackUsageStats(stats: Record<string, any>): void {
    this.trackEvent('usage', 'session-stats', stats)
  }

  /**
   * Get telemetry statistics
   */
  getStats(): TelemetryStats {
    return {
      totalEvents: this.stats.totalEvents,
      eventsThisSession: this.stats.eventsThisSession,
      lastEventTime: this.stats.lastEventTime,
      enabled: this.enabled,
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalEvents: 0,
      eventsThisSession: 0,
      lastEventTime: 0,
    }
    console.debug('[Telemetry] Statistics reset')
  }

  /**
   * Clear all telemetry data
   */
  clearAllData(): void {
    this.disable()
    safeStorage.removeItem('telemetry-user-id')
    safeStorage.removeItem('telemetry-enabled')
    if (this.batcher) this.batcher.clear()
    this.resetStats()
    this.userId = this.getOrCreateUserId()
    console.info('[Telemetry] All data cleared')
  }

  /**
   * Get or create anonymous user ID
   */
  private getOrCreateUserId(): string {
    let id = safeStorage.getItem('telemetry-user-id')

    if (!id) {
      id = uuidv4()
      safeStorage.setItem('telemetry-user-id', id)
      console.debug(`[Telemetry] Created new user ID: ${id}`)
    }

    return id
  }

  /**
   * Load enabled state from localStorage
   */
  private loadEnabledState(): boolean {
    const stored = safeStorage.getItem('telemetry-enabled')

    // Default to disabled (opt-in)
    if (stored === null) {
      return false
    }

    return stored === 'true'
  }

  /**
   * Get current user ID (for debugging only)
   */
  getUserId(): string {
    return this.userId
  }

  /**
   * Validate event data before sending
   */
  private validateEvent(event: TelemetryEvent): boolean {
    const validation = PIISanitizer.validate(event)

    if (!validation.clean) {
      console.warn('[Telemetry] PII detected in event:', validation.issues)
      return false
    }

    return true
  }
}

/**
 * Export singleton getter for convenience
 */
export function getTelemetryService(): TelemetryService {
  return TelemetryService.getInstance()
}
