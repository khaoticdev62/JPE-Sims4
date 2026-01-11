/**
 * Analytics Integration Tests
 * Test telemetry collection, PII sanitization, and analytics dashboard
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { TelemetryService } from '@services/analytics/TelemetryService'
import { PIISanitizer } from '@services/analytics/PIISanitizer'
import { AnalyticsService } from '@services/analytics/AnalyticsService'
import { TelemetryBatcher } from '@services/analytics/TelemetryBatcher'

describe('Analytics Integration', () => {
  let telemetryService: TelemetryService
  let batcher: TelemetryBatcher

  beforeEach(() => {
    telemetryService = TelemetryService.getInstance()
    batcher = new TelemetryBatcher()
    telemetryService.enable()
  })

  afterEach(() => {
    telemetryService.disable()
  })

  describe('Telemetry lifecycle', () => {
    it('should enable and disable telemetry', () => {
      expect(telemetryService.isEnabled()).toBe(true)

      telemetryService.disable()
      expect(telemetryService.isEnabled()).toBe(false)

      telemetryService.enable()
      expect(telemetryService.isEnabled()).toBe(true)
    })

    it('should track events when enabled', () => {
      telemetryService.enable()
      const statsBefore = telemetryService.getStats()

      telemetryService.trackFeature('test-feature', { value: 'test' })

      const statsAfter = telemetryService.getStats()
      expect(statsAfter.eventsThisSession).toBeGreaterThan(statsBefore.eventsThisSession)
    })

    it('should not track events when disabled', () => {
      telemetryService.disable()
      const statsBefore = telemetryService.getStats()

      telemetryService.trackFeature('test-feature', { value: 'test' })

      const statsAfter = telemetryService.getStats()
      expect(statsAfter.eventsThisSession).toBe(statsBefore.eventsThisSession)
    })
  })

  describe('Event tracking', () => {
    it('should track feature usage', () => {
      telemetryService.enable()
      const statsBefore = telemetryService.getStats()

      telemetryService.trackFeature('explain-mod', { fileName: 'test.xml' })

      const statsAfter = telemetryService.getStats()
      expect(statsAfter.eventsThisSession).toBeGreaterThan(statsBefore.eventsThisSession)
    })

    it('should track performance metrics', () => {
      telemetryService.enable()
      const statsBefore = telemetryService.getStats()

      telemetryService.trackPerformance('compilation', 234.5, {
        fileCount: 5,
        success: true,
      })

      const statsAfter = telemetryService.getStats()
      expect(statsAfter.eventsThisSession).toBeGreaterThan(statsBefore.eventsThisSession)
    })

    it('should track errors', () => {
      telemetryService.enable()
      const statsBefore = telemetryService.getStats()

      const error = new Error('Test error')
      telemetryService.trackError(error, 'test-context')

      const statsAfter = telemetryService.getStats()
      expect(statsAfter.eventsThisSession).toBeGreaterThan(statsBefore.eventsThisSession)
    })
  })

  describe('Event batching', () => {
    it('should batch events for efficiency', () => {
      const batchedEvents: any[] = []

      batcher.onBatchReady((batch) => {
        batchedEvents.push(batch)
      })

      // Add events
      for (let i = 0; i < 5; i++) {
        batcher.addEvent({
          userId: 'test-user',
          timestamp: Date.now(),
          category: 'usage',
          action: `event-${i}`,
        })
      }

      expect(batcher.getSize()).toBe(5)
    })

    it('should flush batch when full', (done) => {
      let flushed = false

      batcher.onBatchReady((batch) => {
        flushed = true
        expect(batch.events.length).toBe(50)
      })

      // Add 50 events to trigger flush
      for (let i = 0; i < 50; i++) {
        batcher.addEvent({
          userId: 'test-user',
          timestamp: Date.now(),
          category: 'usage',
          action: `event-${i}`,
        })
      }

      // Check that batch was flushed
      setTimeout(() => {
        expect(flushed).toBe(true)
        done()
      }, 100)
    })
  })

  describe('PII protection', () => {
    it('should sanitize events automatically', () => {
      const event = {
        userId: 'safe-user-id',
        timestamp: Date.now(),
        category: 'error' as const,
        action: 'compilation-error',
        metadata: {
          path: 'C:\\Users\\john\\Documents\\file.xml',
          email: 'john@example.com',
        },
      }

      batcher.addEvent(event)
      const pending = batcher.getPendingEvents()

      expect(pending[0].metadata?.path).toContain('<path>')
      expect(pending[0].metadata?.email).toContain('<email>')
    })

    it('should validate data for PII', () => {
      const cleanData = { action: 'test', value: 123 }
      const validation = PIISanitizer.validate(cleanData)

      expect(validation.clean).toBe(true)
      expect(validation.issues.length).toBe(0)
    })

    it('should detect and report PII', () => {
      const dirtyData = {
        action: 'test',
        filePath: '/Users/john/Documents/file.xml',
      }

      const validation = PIISanitizer.validate(dirtyData)

      expect(validation.clean).toBe(false)
      expect(validation.issues.length).toBeGreaterThan(0)
    })
  })

  describe('Analytics calculations', () => {
    it('should calculate usage statistics', () => {
      const stats = AnalyticsService.calculateUsageStats()

      expect(stats).toHaveProperty('totalProjects')
      expect(stats).toHaveProperty('totalFiles')
      expect(stats).toHaveProperty('totalCompilations')
      expect(stats).toHaveProperty('totalValidations')

      expect(typeof stats.totalProjects).toBe('number')
      expect(stats.totalProjects).toBeGreaterThanOrEqual(0)
    })

    it('should calculate performance metrics', () => {
      const metrics = AnalyticsService.calculatePerformanceMetrics()

      expect(metrics).toHaveProperty('averageCompilationTime')
      expect(metrics).toHaveProperty('averageValidationTime')
      expect(metrics).toHaveProperty('averageExplanationTime')
      expect(metrics).toHaveProperty('peakMemoryUsage')

      expect(metrics.averageCompilationTime).toBeGreaterThan(0)
    })

    it('should calculate project complexity', () => {
      const complexity = AnalyticsService.calculateProjectComplexity()

      expect(complexity).toHaveProperty('fileCount')
      expect(complexity).toHaveProperty('totalLines')
      expect(complexity).toHaveProperty('complexity Score')

      expect(complexity['complexity Score']).toBeGreaterThanOrEqual(0)
      expect(complexity['complexity Score']).toBeLessThanOrEqual(100)
    })

    it('should calculate activity trend', () => {
      const trend = AnalyticsService.calculateActivityTrend()

      expect(Array.isArray(trend)).toBe(true)
      expect(trend.length).toBe(7) // 7-day trend

      trend.forEach((day) => {
        expect(day).toHaveProperty('date')
        expect(day).toHaveProperty('count')
        expect(typeof day.count).toBe('number')
        expect(day.count).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Statistics management', () => {
    it('should track statistics across events', () => {
      telemetryService.enable()
      telemetryService.resetStats()

      const statsBefore = telemetryService.getStats()
      expect(statsBefore.totalEvents).toBe(0)
      expect(statsBefore.eventsThisSession).toBe(0)

      telemetryService.trackFeature('test')
      telemetryService.trackFeature('test')

      const statsAfter = telemetryService.getStats()
      expect(statsAfter.eventsThisSession).toBe(2)
    })

    it('should reset statistics', () => {
      telemetryService.enable()

      telemetryService.trackFeature('test')
      let stats = telemetryService.getStats()
      expect(stats.eventsThisSession).toBeGreaterThan(0)

      telemetryService.resetStats()
      stats = telemetryService.getStats()
      expect(stats.totalEvents).toBe(0)
      expect(stats.eventsThisSession).toBe(0)
    })
  })

  describe('Data privacy compliance', () => {
    it('should not collect personal information', () => {
      const sensitiveData = {
        username: 'john',
        password: 'secret123',
        apiKey: 'sk-12345',
      }

      const sanitized = PIISanitizer.sanitize(sensitiveData)

      expect(sanitized.username).toBeUndefined()
      expect(sanitized.password).toBeUndefined()
      expect(sanitized.apiKey).toBeUndefined()
    })

    it('should anonymize timestamps to day level', () => {
      const now = new Date().getTime()
      const event = {
        timestamp: now,
        action: 'test',
      }

      const anonymized = PIISanitizer.anonymizeEvent(event)

      // Timestamp should be at midnight (00:00:00)
      const dayTimestamp = anonymized.timestamp
      expect(dayTimestamp % (24 * 60 * 60 * 1000)).toBe(0)
    })

    it('should provide clear data retention policy', () => {
      // This is more of a documentation test
      const stats = telemetryService.getStats()

      expect(stats).toHaveProperty('enabled')
      expect(typeof stats.enabled).toBe('boolean')

      // Stats should be clearable
      telemetryService.resetStats()
      const statsAfter = telemetryService.getStats()
      expect(statsAfter.totalEvents).toBe(0)
    })
  })

  describe('Error handling', () => {
    it('should handle sanitization errors gracefully', () => {
      const malformedData = {
        circular: undefined as any,
      }
      malformedData.circular = malformedData // Create circular reference

      // Should not throw
      expect(() => {
        PIISanitizer.sanitize(malformedData)
      }).not.toThrow()
    })

    it('should handle missing telemetry data', () => {
      const stats = telemetryService.getStats()

      expect(stats).toBeDefined()
      expect(stats.enabled).toBeDefined()
      expect(stats.eventsThisSession).toBe(0)
    })
  })
})
