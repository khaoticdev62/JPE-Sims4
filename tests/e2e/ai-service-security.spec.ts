/**
 * AI Service E2E Tests
 * 
 * Tests complete user journeys with secure AI integration.
 * P0/P1 Priority: Critical user paths and security validation.
 * 
 * Note: These tests require Playwright and a running dev server.
 * They mock external AI provider API calls but test the full UI flow.
 */

import { test, expect } from '@playwright/test'

test.describe('Secure AI Integration E2E (P0)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any stored credentials before each test
    await page.evaluate(() => {
      localStorage.clear()
      indexedDB.databases().then(dbs => {
        dbs.forEach(db => indexedDB.deleteDatabase(db.name!))
      })
    })
  })

  test('6.1-E2E-001: User saves API key and retrieves on reload @p0 @smoke @security', async ({ page }) => {
    /**
     * Tests the complete credential storage and retrieval flow
     */
    
    // Navigate to settings
    await page.goto('/settings')
    
    // Wait for AI settings to load
    await expect(page.getByRole('heading', { name: 'AI Settings' })).toBeVisible()
    
    // Enter API key
    const apiKeyInput = page.getByLabel('OpenAI API Key')
    await apiKeyInput.fill('sk-proj-e2e-test-key-12345')
    
    // Save key
    const saveButton = page.getByRole('button', { name: 'Save' })
    await saveButton.click()
    
    // Wait for save confirmation
    await expect(page.getByText('API key saved successfully')).toBeVisible()
    
    // Reload page
    await page.reload()
    
    // Wait for settings to load
    await expect(page.getByRole('heading', { name: 'AI Settings' })).toBeVisible()
    
    // Verify key is still configured (should show masked or "configured" indicator)
    // The actual key should not be visible in the UI for security
    await expect(page.getByText('OpenAI: Configured')).toBeVisible()
    
    // Verify key is not exposed in page source
    const pageContent = await page.content()
    expect(pageContent).not.toContain('sk-proj-e2e-test-key-12345')
  })

  test('6.1-E2E-004: User sends prompt, receives AI response @p0 @critical-path', async ({ page }) => {
    /**
     * Tests the complete AI chat flow with secure API key handling
     */
    
    // Setup: Navigate to settings and configure API key
    await page.goto('/settings')
    
    // Mock the credential save (in real test, we'd use actual keytar)
    await page.evaluate(() => {
      window.localStorage.setItem('jpe-ai-key-openai', 'mock-api-key')
    })
    
    // Navigate to AI assistant
    await page.goto('/studio')
    
    // Wait for editor to load
    await expect(page.getByTestId('editor-layout')).toBeVisible()
    
    // Open AI assistant panel
    await page.getByRole('button', { name: 'Genie' }).click()
    
    // Wait for AI assistant to appear
    await expect(page.getByTestId('ai-assistant')).toBeVisible()
    
    // Mock the API response to avoid actual API calls
    await page.route('**/api/openai/chat', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          text: 'This is a test response from the AI assistant.',
          usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
          cached: false,
          timestamp: Date.now()
        })
      })
    })
    
    // Enter prompt
    const promptInput = page.getByLabel('Enter your prompt')
    await promptInput.fill('Hello, AI assistant!')
    
    // Send prompt
    const sendButton = page.getByRole('button', { name: 'Send' })
    await sendButton.click()
    
    // Wait for response
    await expect(page.getByText('This is a test response from the AI assistant.')).toBeVisible({ timeout: 10000 })
  })

  test('6.1-E2E-005: Invalid API key returns 401, not leaked @p0 @security', async ({ page }) => {
    /**
     * Tests error handling for invalid API keys
     */
    
    // Navigate to settings
    await page.goto('/settings')
    
    // Enter invalid API key
    const apiKeyInput = page.getByLabel('OpenAI API Key')
    await apiKeyInput.fill('sk-invalid-key-that-will-fail')
    
    // Save key
    const saveButton = page.getByRole('button', { name: 'Save' })
    await saveButton.click()
    
    // Navigate to AI assistant
    await page.goto('/studio')
    await page.getByRole('button', { name: 'Genie' }).click()
    
    // Mock 401 response from API
    await page.route('**/api/openai/chat', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Authentication failed. Please check your API key.',
          cached: false,
          timestamp: Date.now()
        })
      })
    })
    
    // Send prompt
    const promptInput = page.getByLabel('Enter your prompt')
    await promptInput.fill('Test prompt')
    
    const sendButton = page.getByRole('button', { name: 'Send' })
    await sendButton.click()
    
    // Wait for error message
    await expect(page.getByText('Authentication failed')).toBeVisible({ timeout: 10000 })
    
    // Verify API key is not exposed in error message
    const errorText = await page.getByText('Authentication failed').textContent()
    expect(errorText).not.toContain('sk-')
    expect(errorText).not.toContain('invalid-key')
    
    // Verify API key is not in network request headers (check devtools)
    // This would require additional Playwright setup to intercept and inspect headers
  })
})

test.describe('AI Provider Switching E2E (P1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear()
      indexedDB.databases().then(dbs => {
        dbs.forEach(db => indexedDB.deleteDatabase(db.name!))
      })
    })
  })

  test('6.1-E2E-002: User switches provider mid-session @p1', async ({ page }) => {
    /**
     * Tests provider switching functionality
     */
    
    // Navigate to settings
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'AI Settings' })).toBeVisible()
    
    // Configure Claude API key
    const claudeKeyInput = page.getByLabel('Claude API Key')
    await claudeKeyInput.fill('sk-ant-test-claude-key')
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Configure OpenAI API key
    const openaiKeyInput = page.getByLabel('OpenAI API Key')
    await openaiKeyInput.fill('sk-proj-test-openai-key')
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Navigate to AI assistant
    await page.goto('/studio')
    await page.getByRole('button', { name: 'Genie' }).click()
    
    // Verify default provider (Claude)
    await expect(page.getByText('Provider: Claude')).toBeVisible()
    
    // Switch provider to OpenAI
    const providerSelect = page.getByLabel('AI Provider')
    await providerSelect.selectOption('openai')
    
    // Verify provider changed
    await expect(page.getByText('Provider: OpenAI')).toBeVisible()
    
    // Mock API response for OpenAI
    await page.route('**/api/openai/chat', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          text: 'Response from OpenAI!',
          usage: { inputTokens: 10, outputTokens: 15, totalTokens: 25 },
          cached: false,
          timestamp: Date.now()
        })
      })
    })
    
    // Send prompt with new provider
    const promptInput = page.getByLabel('Enter your prompt')
    await promptInput.fill('Test with OpenAI')
    await page.getByRole('button', { name: 'Send' }).click()
    
    // Wait for OpenAI response
    await expect(page.getByText('Response from OpenAI!')).toBeVisible({ timeout: 10000 })
  })

  test('6.1-E2E-003: User clears all keys, none retrievable @p1 @security', async ({ page }) => {
    /**
     * Tests complete credential cleanup
     */
    
    // Navigate to settings and configure multiple keys
    await page.goto('/settings')
    
    // Configure Claude key
    await page.getByLabel('Claude API Key').fill('sk-ant-claude-key')
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Configure OpenAI key
    await page.getByLabel('OpenAI API Key').fill('sk-proj-openai-key')
    await page.getByRole('button', { name: 'Save' }).click()
    
    // Verify keys are configured
    await expect(page.getByText('Claude: Configured')).toBeVisible()
    await expect(page.getByText('OpenAI: Configured')).toBeVisible()
    
    // Clear all credentials
    const clearAllButton = page.getByRole('button', { name: 'Clear All Credentials' })
    await clearAllButton.click()
    
    // Confirm dialog
    await page.getByRole('button', { name: 'Confirm' }).click()
    
    // Wait for confirmation
    await expect(page.getByText('All credentials cleared')).toBeVisible()
    
    // Reload page
    await page.reload()
    
    // Verify no keys are configured
    await expect(page.getByText('Claude: Not configured')).toBeVisible()
    await expect(page.getByText('OpenAI: Not configured')).toBeVisible()
    
    // Verify localStorage is clean
    const localStorageKeys = await page.evaluate(() => {
      return Object.keys(localStorage).filter(k => k.startsWith('jpe-ai-key-'))
    })
    expect(localStorageKeys).toHaveLength(0)
  })
})
