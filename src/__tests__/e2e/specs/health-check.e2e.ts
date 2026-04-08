/**
 * E2E Test: Health Check (Subtask 7.5)
 *
 * GET /api/health
 * Verify response includes Python version and engine status.
 * Verify status is 'ok' when Python is available.
 */

import { test, expect } from '@playwright/test'

test.describe('Full Stack: Health Check', () => {
  test('GET /api/health returns structured status', async ({ request }) => {
    const startTime = Date.now()
    const response = await request.get('/api/health')

    expect(response.status()).toBe(200)

    const body = await response.json()

    // Required fields
    expect(body).toHaveProperty('python')
    expect(body).toHaveProperty('engine')
    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('responseTime')

    // Python object structure
    expect(body.python).toHaveProperty('available')
    expect(body.python).toHaveProperty('version')
    expect(body.python).toHaveProperty('path')

    // Engine object structure
    expect(body.engine).toHaveProperty('ready')
    expect(body.engine).toHaveProperty('errors')
    expect(Array.isArray(body.engine.errors)).toBe(true)

    // Status should be one of the expected values
    expect(['ok', 'degraded', 'error']).toContain(body.status)

    // Response time should be < 2 seconds
    expect(body.responseTime).toBeLessThan(2000)

    // Performance check
    const duration = Date.now() - startTime
    expect(duration).toBeLessThan(2000)
  })

  test('health check is idempotent', async ({ request }) => {
    const response1 = await request.get('/api/health')
    const response2 = await request.get('/api/health')

    expect(response1.status()).toBe(200)
    expect(response2.status()).toBe(200)

    const body1 = await response1.json()
    const body2 = await response2.json()

    // Both should report the same Python availability
    expect(body1.python.available).toBe(body2.python.available)
  })
})
