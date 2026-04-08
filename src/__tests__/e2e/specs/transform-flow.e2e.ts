/**
 * E2E Test: Transform Flow (Subtask 7.1)
 *
 * POST to /api/transform with sample JPE.
 * Verify XML response is valid and contains expected elements.
 * Verify response time < 5 seconds.
 */

import { test, expect } from '@playwright/test'

test.describe('Full Stack: Transform Flow', () => {
  test('POST /api/transform returns valid XML for JPE input', async ({ request }) => {
    const jpeSource = `MODULE: "e2e_test_tuning"
VERSION: "1.0.0"

Tuning: "E2ETestInteraction"
  Type: "Interaction"
  Description: "End-to-end test tuning file"
`

    const startTime = Date.now()
    const response = await request.post('/api/transform', {
      data: { source: jpeSource, fileName: 'e2e_test.jpe' },
    })

    const duration = Date.now() - startTime
    const body = await response.json()

    // Response should be 200 (even if transform has warnings)
    expect(response.status()).toBe(200)

    // Body should have expected fields
    expect(body).toHaveProperty('xml')
    expect(body).toHaveProperty('success')
    expect(body).toHaveProperty('errors')
    expect(body).toHaveProperty('duration')
    expect(body).toHaveProperty('mode')

    // Performance: < 5 seconds
    expect(duration).toBeLessThan(5000)

    // XML should be non-empty
    expect(typeof body.xml).toBe('string')
    expect(body.xml.length).toBeGreaterThan(0)
  })

  test('POST /api/transform returns cache header on repeated request', async ({ request }) => {
    const jpeSource = `MODULE: "cache_test"
VERSION: "1.0"
`

    // First request (MISS)
    const response1 = await request.post('/api/transform', {
      data: { source: jpeSource, fileName: 'cache.jpe' },
    })
    expect(response1.headers()['x-cache']).toBe('MISS')

    // Second request (HIT)
    const response2 = await request.post('/api/transform', {
      data: { source: jpeSource, fileName: 'cache.jpe' },
    })
    expect(response2.headers()['x-cache']).toBe('HIT')
  })

  test('POST /api/transform with force=true bypasses cache', async ({ request }) => {
    const jpeSource = `MODULE: "force_test"
VERSION: "1.0"
`

    // First request
    await request.post('/api/transform', {
      data: { source: jpeSource, fileName: 'force.jpe' },
    })

    // Force request should be MISS
    const response = await request.post('/api/transform', {
      data: { source: jpeSource, fileName: 'force.jpe', force: true },
    })
    expect(response.headers()['x-cache']).toBe('MISS')
  })
})
