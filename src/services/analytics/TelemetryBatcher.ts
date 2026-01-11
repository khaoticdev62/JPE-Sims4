/**
 * Telemetry Batcher
 * Batches telemetry events for efficient transmission
 */

import { PIISanitizer } from './PIISanitizer'
import type { TelemetryEvent, TelemetryBatch } from './types'

export class TelemetryBatcher {
  private events: TelemetryEvent[] = []
  private readonly maxBatchSize = 50
  private readonly maxBatchAge = 60000 // 1 minute in milliseconds
  private batchTimer: NodeJS.Timeout | null = null
  private onBatch: ((batch: TelemetryBatch) => void) | null = null

  /**
   * Add event to batch
   */
  addEvent(event: TelemetryEvent): void {
    // Sanitize event metadata
    const sanitized: TelemetryEvent = {
      ...event,
      metadata: event.metadata ? PIISanitizer.sanitize(event.metadata) : undefined,
    }

    this.events.push(sanitized)

    console.debug(`[TelemetryBatcher] Event added: ${event.category}:${event.action}`)

    // Check if batch is full
    if (this.events.length >= this.maxBatchSize) {
      this.flush()
    } else if (!this.batchTimer) {
      // Set timer for batch age
      this.batchTimer = setTimeout(() => {
        if (this.events.length > 0) {
          this.flush()
        }
      }, this.maxBatchAge)
    }
  }

  /**
   * Flush current batch
   */
  private flush(): void {
    if (this.events.length === 0) {
      return
    }

    // Clear timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    // Create batch
    const batch: TelemetryBatch = {
      userId: this.events[0].userId,
      timestamp: Date.now(),
      events: this.events,
    }

    // Reset events
    this.events = []

    // Send batch
    if (this.onBatch) {
      this.onBatch(batch)
    }

    console.debug(
      `[TelemetryBatcher] Batch flushed with ${batch.events.length} events`
    )
  }

  /**
   * Register callback for batch events
   */
  onBatchReady(callback: (batch: TelemetryBatch) => void): void {
    this.onBatch = callback
  }

  /**
   * Get current batch size
   */
  getSize(): number {
    return this.events.length
  }

  /**
   * Clear pending events
   */
  clear(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    this.events = []
    console.debug('[TelemetryBatcher] Batch cleared')
  }

  /**
   * Get pending events
   */
  getPendingEvents(): TelemetryEvent[] {
    return [...this.events]
  }
}
