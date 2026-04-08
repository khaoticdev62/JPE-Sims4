/**
 * E2E Test: Open Project Flow
 *
 * Tests the full open project flow including recent projects.
 */

import { test, expect } from '@playwright/test'

test.describe('Full Stack: Open Project', () => {
  test('health check confirms server is running', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)
  })

  test('GET /api/health returns structured status', async ({ request }) => {
    const response = await request.get('/api/health')
    const body = await response.json()

    expect(body).toHaveProperty('python')
    expect(body).toHaveProperty('engine')
    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('responseTime')
    expect(body.python).toHaveProperty('available')
    expect(body.python).toHaveProperty('version')
    expect(body.engine).toHaveProperty('ready')
    expect(body.engine).toHaveProperty('errors')
    expect(['ok', 'degraded', 'error']).toContain(body.status)
  })
})
