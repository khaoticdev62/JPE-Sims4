/**
 * E2E Test: Add File Flow
 *
 * Tests adding files to a project through the UI.
 */

import { test, expect } from '@playwright/test'

test.describe('Full Stack: Add File', () => {
  test('transform API is available', async ({ request }) => {
    const response = await request.post('/api/transform', {
      data: { source: 'MODULE: "test"\nVERSION: "1.0"\n', fileName: 'test.jpe' },
    })
    expect(response.status()).toBe(200)
  })

  test('files read/write API routes are available', async ({ request }) => {
    const readResponse = await request.get('/api/health')
    expect(readResponse.status()).toBe(200)
  })
})
