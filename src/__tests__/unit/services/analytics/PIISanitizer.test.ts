/**
 * PII Sanitizer Tests
 * Unit tests for PII detection and removal
 */

import { describe, it, expect } from 'vitest'
import { PIISanitizer } from '@services/analytics/PIISanitizer'

describe('PIISanitizer', () => {
  describe('sanitizeString', () => {
    it('should remove file paths', () => {
      const input = 'Error in C:\\Users\\john\\Documents\\project.xml'
      const result = PIISanitizer.sanitize(input)

      expect(result).toContain('<path>')
      expect(result).not.toContain('john')
      expect(result).not.toContain('Documents')
    })

    it('should remove email addresses', () => {
      const input = 'Contact admin@example.com for help'
      const result = PIISanitizer.sanitize(input)

      expect(result).toContain('<email>')
      expect(result).not.toContain('admin@example.com')
    })

    it('should truncate long strings', () => {
      const longString = 'a'.repeat(300)
      const result = PIISanitizer.sanitize(longString)

      expect(result.length).toBeLessThanOrEqual(210) // 200 + '...'
    })

    it('should remove API keys', () => {
      const input = 'API key: sk-abcdefghijklmnopqrstuvwxyz1234567890'
      const result = PIISanitizer.sanitize(input)

      expect(result).not.toContain('sk-')
      expect(result).toContain('<token>')
    })

    it('should remove credit card numbers', () => {
      const input = 'Card: 4111-1111-1111-1111'
      const result = PIISanitizer.sanitize(input)

      expect(result).toContain('<credit_card>')
      expect(result).not.toContain('4111')
    })
  })

  describe('sanitizeObject', () => {
    it('should skip sensitive keys', () => {
      const data = {
        username: 'john',
        password: 'secret123',
        email: 'john@example.com',
        action: 'login',
      }

      const result = PIISanitizer.sanitize(data)

      expect(result.action).toBe('login')
      expect(result.password).toBeUndefined()
      expect(result.username).toBeUndefined()
      expect(result.email).toBeUndefined()
    })

    it('should recursively sanitize nested objects', () => {
      const data = {
        user: {
          apiKey: 'secret-key',
          action: 'login',
        },
      }

      const result = PIISanitizer.sanitize(data)

      expect(result.user.action).toBe('login')
      expect(result.user.apiKey).toBeUndefined()
    })

    it('should sanitize array items', () => {
      const data = ['path/to/file', 'C:\\Users\\john\\file.txt', 'normal-text']

      const result = PIISanitizer.sanitize(data)

      expect(Array.isArray(result)).toBe(true)
      expect(result[1]).toContain('<path>')
      expect(result[2]).toBe('normal-text')
    })
  })

  describe('stackTraceFiltering', () => {
    it('should truncate stack traces', () => {
      const stack = `Error: Something went wrong
        at Function.method (C:\\path\\to\\file.ts:123:45)
        at Function.other (C:\\path\\to\\other.ts:456:78)
        at Function.another (C:\\path\\to\\another.ts:789:10)`

      const result = PIISanitizer.sanitizeStackTrace(stack)

      expect(result).toBeDefined()
      if (result) {
        expect(result.length).toBeLessThanOrEqual(500 + 100) // Some buffer
      }
    })

    it('should handle undefined stack traces', () => {
      const result = PIISanitizer.sanitizeStackTrace(undefined)

      expect(result).toBeUndefined()
    })
  })

  describe('validation', () => {
    it('should detect clean data', () => {
      const data = {
        action: 'login',
        timestamp: Date.now(),
        duration: 234,
      }

      const validation = PIISanitizer.validate(data)

      expect(validation.clean).toBe(true)
      expect(validation.issues.length).toBe(0)
    })

    it('should detect PII in data', () => {
      const data = {
        action: 'error',
        error: 'File not found at /Users/john/Documents/file.xml',
      }

      const validation = PIISanitizer.validate(data)

      expect(validation.clean).toBe(false)
      expect(validation.issues.length).toBeGreaterThan(0)
    })

    it('should detect email addresses', () => {
      const data = {
        contact: 'admin@example.com',
      }

      const validation = PIISanitizer.validate(data)

      expect(validation.clean).toBe(false)
      expect(validation.issues.some((i) => i.includes('email'))).toBe(true)
    })

    it('should detect sensitive keys', () => {
      const data = {
        apiKey: 'secret',
        password: 'hidden',
      }

      const validation = PIISanitizer.validate(data)

      expect(validation.clean).toBe(false)
    })
  })

  describe('anonymization', () => {
    it('should anonymize events', () => {
      const data = {
        timestamp: Date.now(),
        email: 'user@example.com',
        action: 'compile',
      }

      const result = PIISanitizer.anonymizeEvent(data)

      expect(result.action).toBe('compile')
      expect(result.email).toBeUndefined()
      // Timestamp should be at day level, not exact time
      expect(result.timestamp % (24 * 60 * 60 * 1000)).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('should handle null and undefined', () => {
      expect(PIISanitizer.sanitize(null)).toBeNull()
      expect(PIISanitizer.sanitize(undefined)).toBeUndefined()
    })

    it('should handle empty objects', () => {
      const result = PIISanitizer.sanitize({})

      expect(result).toEqual({})
    })

    it('should handle empty arrays', () => {
      const result = PIISanitizer.sanitize([])

      expect(result).toEqual([])
    })

    it('should preserve numeric values', () => {
      const data = {
        duration: 123.45,
        count: 42,
      }

      const result = PIISanitizer.sanitize(data)

      expect(result.duration).toBe(123.45)
      expect(result.count).toBe(42)
    })

    it('should preserve boolean values', () => {
      const data = {
        success: true,
        error: false,
      }

      const result = PIISanitizer.sanitize(data)

      expect(result.success).toBe(true)
      expect(result.error).toBe(false)
    })
  })
})
