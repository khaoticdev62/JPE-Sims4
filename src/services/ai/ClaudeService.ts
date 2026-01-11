/**
 * Claude Service
 * Main service for Claude API integration with caching, rate limiting, and hybrid API support
 */

import Anthropic from '@anthropic-ai/sdk'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { CredentialManager } from '@services/api/CredentialManager'
import { ClaudeCache } from './ClaudeCache'
import type {
  Explanation,
  ExplanationResult,
  ApiUsageStats,
  ClaudeMessage,
} from './types'

export class ClaudeService {
  private static instance: ClaudeService | null = null

  private client: Anthropic | null = null
  private cache: ClaudeCache
  private rateLimiter: RateLimiterMemory
  private useProxy = true
  private lastCacheHit = false
  private initialized = false

  // Usage statistics
  private usageStats = {
    requestsToday: 0,
    requestsThisMonth: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalTokensUsed: 0,
    responseTimes: [] as number[],
  }

  private constructor() {
    // Initialize cache: max 100 entries, 24-hour TTL
    this.cache = new ClaudeCache({
      max: 100,
      ttl: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    })

    // Initialize rate limiter: 50 requests per 60 seconds
    this.rateLimiter = new RateLimiterMemory({
      points: 50,
      duration: 60,
    })

    console.debug('[Claude] Service initialized with cache and rate limiter')
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ClaudeService {
    if (!ClaudeService.instance) {
      ClaudeService.instance = new ClaudeService()
    }
    return ClaudeService.instance
  }

  /**
   * Initialize the service with API credentials
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      const apiKey = await CredentialManager.getClaudeAPIKey()

      if (apiKey) {
        this.client = new Anthropic({ apiKey })
        this.useProxy = false
        console.info('[Claude] Using direct API with user-provided key')
      } else {
        this.useProxy = true
        console.info('[Claude] Using proxy tier (free)')
      }

      this.initialized = true
    } catch (error) {
      console.error('[Claude] Initialization error:', error)
      this.useProxy = true
      this.initialized = true
    }
  }

  /**
   * Ensure service is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  /**
   * Explain a mod file
   * @param fileContent The XML content of the mod file
   * @param fileName The name of the file
   * @returns Explanation result with parsed content
   */
  async explainMod(fileContent: string, fileName: string): Promise<ExplanationResult> {
    await this.ensureInitialized()

    // Check rate limit
    try {
      await this.rateLimiter.consume(1)
    } catch (error) {
      console.warn('[Claude] Rate limit exceeded')
      return {
        success: false,
        error: 'Rate limit exceeded. Maximum 50 requests per minute.',
        cached: false,
        timestamp: Date.now(),
      }
    }

    // Check cache first
    const cacheKey = ClaudeCache.generateKey(fileContent, fileName)
    const cachedResult = this.cache.get(cacheKey)

    if (cachedResult) {
      this.lastCacheHit = true
      this.usageStats.cacheHits++
      console.debug('[Claude] Cache hit for file:', fileName)

      try {
        const explanation = this.parseExplanation(cachedResult)
        return {
          success: true,
          explanation,
          cached: true,
          timestamp: Date.now(),
        }
      } catch (error) {
        console.warn('[Claude] Failed to parse cached explanation:', error)
      }
    }

    this.lastCacheHit = false
    this.usageStats.cacheMisses++

    // Call API
    const startTime = performance.now()

    try {
      const explanationText = this.useProxy
        ? await this.callProxyAPI(fileContent, fileName)
        : await this.callDirectAPI(fileContent, fileName)

      const duration = performance.now() - startTime
      this.usageStats.responseTimes.push(duration)

      // Cache the result
      this.cache.set(cacheKey, explanationText)

      const explanation = this.parseExplanation(explanationText)

      this.usageStats.requestsToday++
      this.usageStats.requestsThisMonth++

      return {
        success: true,
        explanation,
        cached: false,
        timestamp: Date.now(),
      }
    } catch (error) {
      const duration = performance.now() - startTime
      this.usageStats.responseTimes.push(duration)

      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[Claude] API call failed:', errorMessage)

      return {
        success: false,
        error: errorMessage,
        cached: false,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * Call direct Claude API with user's API key
   */
  private async callDirectAPI(fileContent: string, fileName: string): Promise<string> {
    if (!this.client) {
      throw new Error('Claude API client not initialized')
    }

    const prompt = this.buildModExplanationPrompt(fileContent, fileName)

    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ]

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: messages as Parameters<typeof this.client.messages.create>[0]['messages'],
      })

      if (response.content[0].type !== 'text') {
        throw new Error('Unexpected response format from Claude API')
      }

      // Track token usage
      this.usageStats.totalTokensUsed +=
        response.usage.input_tokens + response.usage.output_tokens

      return response.content[0].text
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      if (message.includes('401') || message.includes('authentication')) {
        throw new Error('Invalid Claude API key. Please check your credentials.')
      } else if (message.includes('429')) {
        throw new Error('Claude API rate limit exceeded. Please try again later.')
      } else if (message.includes('timeout') || message.includes('exceeded')) {
        throw new Error('Claude API request timed out. Please try again.')
      }

      throw new Error(`Claude API error: ${message}`)
    }
  }

  /**
   * Call proxy API (free tier)
   * In production, this would call a backend proxy server
   */
  private async callProxyAPI(fileContent: string, fileName: string): Promise<string> {
    // For now, return a placeholder message indicating proxy is needed
    // In production, this would make an HTTP request to a proxy endpoint

    console.warn(
      '[Claude] Proxy tier not yet implemented. Configure your Claude API key in settings.'
    )

    throw new Error(
      'Proxy API tier not configured. Please add your Claude API key in Settings → AI Configuration.'
    )
  }

  /**
   * Build prompt for mod file explanation
   */
  private buildModExplanationPrompt(fileContent: string, fileName: string): string {
    return `You are an expert Sims 4 mod creator. Explain this mod file in simple, beginner-friendly terms.

File: ${fileName}

Content:
\`\`\`xml
${fileContent.substring(0, 2000)}${fileContent.length > 2000 ? '\n... (truncated)' : ''}
\`\`\`

Provide a structured explanation with these sections:

1. **Overview**: What this mod does in 1-2 sentences
2. **Purpose**: Why a mod creator would use this (practical use cases)
3. **Key Fields**: List 3-5 important tuning parameters with brief explanations
4. **Effects**: What changes in gameplay when this mod is active
5. **Tips & Warnings**: Important considerations for modders

Keep explanations concise and avoid technical jargon where possible. Format your response with clear section headers.`
  }

  /**
   * Suggest a fix for an error in a mod file
   * @param fileContent Current file content
   * @param fileName File name
   * @param errorMessage Error message from diagnostics
   * @param errorContext Snippet around the error
   * @returns Fix result with proposed code
   */
  async suggestFix(
    fileContent: string, 
    fileName: string, 
    errorMessage: string,
    errorContext: string
  ): Promise<{ success: boolean; fixedCode?: string; explanation?: string; error?: string }> {
    await this.ensureInitialized()

    if (this.useProxy) {
      return {
        success: false,
        error: 'Proxy API tier does not support code fixes. Please add your Claude API key.'
      }
    }

    const prompt = `You are an expert Sims 4 mod creator. A user has an error in their JPE XML file.
    
File: ${fileName}
Error: ${errorMessage}
Context: 
${errorContext}

Current Full Content:
\`\`\`xml
${fileContent}
\`\`\`

Analyze the error and provide a fix. Return a JSON object with:
1. "fixedCode": The complete corrected content of the file.
2. "explanation": A short explanation of what you fixed and why.

Ensure the returned code is valid JPE XML and preserves all other parts of the file.`

    try {
      const response = await this.client!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      })

      if (response.content[0].type !== 'text') {
        throw new Error('Unexpected response format')
      }

      const text = response.content[0].text
      // Extract JSON from response if wrapped in text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Failed to parse AI response as JSON')
      
      const result = JSON.parse(jsonMatch[0])
      return {
        success: true,
        fixedCode: result.fixedCode,
        explanation: result.explanation
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Parse explanation text into structured format
   */
  private parseExplanation(text: string): Explanation {
    const sections = {
      overview: this.extractSection(text, 'Overview') || 'No overview available',
      purpose: this.extractSection(text, 'Purpose') || 'No purpose available',
      keyFields: this.extractListSection(text, 'Key Fields') || [],
      effects: this.extractListSection(text, 'Effects') || [],
      notes: this.extractListSection(text, 'Tips & Warnings') || [],
    }

    return sections
  }

  /**
   * Extract a section from explanation text
   */
  private extractSection(text: string, sectionName: string): string | null {
    const regex = new RegExp(
      `\\*\\*${sectionName}\\*\\*:?\\s*([^\\n]*(?:\\n(?!\\*\\*).*)*?)(?=\\n\\*\\*|$)`,
      'i'
    )
    const match = text.match(regex)
    return match ? match[1].trim() : null
  }

  /**
   * Extract a list section from explanation text
   */
  private extractListSection(text: string, sectionName: string): string[] {
    const regex = new RegExp(
      `\\*\\*${sectionName}\\*\\*:?\\s*([^\\n]*(?:\\n[-•*].*)*?)(?=\\n\\*\\*|$)`,
      'i'
    )
    const match = text.match(regex)

    if (!match) return []

    const items = match[1]
      .split('\n')
      .filter((line) => line.match(/^[-•*]/))
      .map((line) => line.replace(/^[-•*]\s*/, '').trim())
      .filter((item) => item.length > 0)

    return items
  }

  /**
   * Check if last operation was a cache hit
   */
  wasCacheHit(): boolean {
    return this.lastCacheHit
  }

  /**
   * Get current API usage statistics
   */
  getUsageStats(): ApiUsageStats {
    const avgResponseTime =
      this.usageStats.responseTimes.length > 0
        ? this.usageStats.responseTimes.reduce((a, b) => a + b, 0) /
          this.usageStats.responseTimes.length
        : 0

    const total = this.usageStats.cacheHits + this.usageStats.cacheMisses
    const cacheHitRate = total > 0 ? (this.usageStats.cacheHits / total) * 100 : 0

    return {
      requestsToday: this.usageStats.requestsToday,
      requestsThisMonth: this.usageStats.requestsThisMonth,
      cacheHits: this.usageStats.cacheHits,
      cacheMisses: this.usageStats.cacheMisses,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      totalTokensUsed: this.usageStats.totalTokensUsed,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
    }
  }

  /**
   * Reset usage statistics
   */
  resetStats(): void {
    this.usageStats = {
      requestsToday: 0,
      requestsThisMonth: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalTokensUsed: 0,
      responseTimes: [],
    }
    this.cache.resetStats()
    console.debug('[Claude] Statistics reset')
  }

  /**
   * Clear all cached explanations
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Check if API key is configured
   */
  async isConfigured(): Promise<boolean> {
    return await CredentialManager.hasClaudeAPIKey()
  }

  /**
   * Check if using proxy tier
   */
  isUsingProxy(): boolean {
    return this.useProxy
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats()
  }
}
