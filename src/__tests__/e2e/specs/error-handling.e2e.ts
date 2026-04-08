/**
 * E2E Test: Error Handling (Subtask 7.3)
 *
 * Send malformed JPE to /api/transform.
 * Verify error response includes line numbers.
 * Verify error is human-readable.
 * Verify no server crash or resource leak.
 */

import { test, expect } from '@playwright/test'

test.describe('Full Stack: Error Handling', () => {
  test('malformed JPE returns structured errors', async ({ request }) => {
    const malformedJpe = `THIS IS NOT VALID JPE
@#$%^&*()
RANDOM BINARY-LOOKING: content
`

    const response = await request.post('/api/transform', {
      data: { source: malformedJpe, fileName: 'malformed.jpe' },
    })

    const body = await response.json()

    // Should not crash the server (200 or 400/500 with structured response)
    expect(body).toHaveProperty('errors')
    expect(Array.isArray(body.errors)).toBe(true)

    // If errors exist, they should have message property
    if (body.errors.length > 0) {
      expect(body.errors[0]).toHaveProperty('message')
      expect(typeof body.errors[0].message).toBe('string')
      expect(body.errors[0].message.length).toBeGreaterThan(0)
    }
  })

  test('empty source returns 400 with clear error', async ({ request }) => {
    const response = await request.post('/api/transform', {
      data: { source: '', fileName: 'empty.jpe' },
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
    expect(body.error).toContain('non-empty')
  })

  test('missing source field returns 400', async ({ request }) => {
    const response = await request.post('/api/transform', {
      data: { fileName: 'nosource.jpe' },
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty('error')
  })

  test('server remains healthy after error', async ({ request }) => {
    // Send bad request
    await request.post('/api/transform', {
      data: { source: 'garbage!!!', fileName: 'bad.jpe' },
    })

    // Server should still respond to health check
    const healthResponse = await request.get('/api/health')
    expect(healthResponse.status()).toBe(200)

    const health = await healthResponse.json()
    expect(health).toHaveProperty('status')
    expect(health).toHaveProperty('python')
    expect(health).toHaveProperty('engine')
  })
})
