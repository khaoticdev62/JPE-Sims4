/**
 * Base AI Service (Abstract)
 */

import { RateLimiterMemory } from 'rate-limiter-flexible'
import { AICache } from './AICache'
import { 
  AIMessage, 
  AIResult, 
  Explanation, 
  ApiUsageStats, 
  CacheConfig 
} from './types'
import { Diagnostic } from '@/types/index'

export abstract class BaseAIService {
  protected cache: AICache
  protected rateLimiter: RateLimiterMemory
  protected initialized = false

  protected usageStats = {
    requestsToday: 0,
    requestsThisMonth: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalTokensUsed: 0,
    responseTimes: [] as number[],
  }

  // Story 6.1 Proxy Config
  protected useProxy = true
  protected apiBaseUrl = '/api'

  constructor(cacheConfig: CacheConfig = { max: 100, ttl: 24 * 60 * 60 * 1000 }) {
    this.cache = new AICache(cacheConfig)
    this.rateLimiter = new RateLimiterMemory({
      points: 50,
      duration: 60,
    })
  }

  abstract initialize(): Promise<void>;
  
  protected abstract ensureInitialized(): Promise<void>;

  abstract chat(messages: AIMessage[]): Promise<AIResult>;

  abstract explainMod(fileContent: string, fileName: string): Promise<AIResult>;

  abstract suggestFix(
    fileContent: string, 
    fileName: string, 
    errorMessage: string,
    errorContext: string
  ): Promise<AIResult>;

  /**
   * AI-powered project-wide conflict detection
   * @param map Symbolic map of the project
   */
  abstract analyzeProjectConflicts(map: any): Promise<AIResult>;

  /**
   * AI-powered next-token prediction/completion
   */
  abstract getPredictiveCompletion(
    content: string,
    fileName: string,
    cursorOffset: number,
    projectContext?: string
  ): Promise<AIResult>;

  /**
   * Explain a specific JPE diagnostic/error
   */
  abstract explainDiagnostic(
    fileContent: string, 
    fileName: string, 
    diagnostic: Diagnostic
  ): Promise<AIResult>;

  /**
   * Generate a code fix for a specific JPE diagnostic/error
   */
  abstract fixDiagnostic(
    fileContent: string, 
    fileName: string, 
    diagnostic: Diagnostic,
    context: string
  ): Promise<AIResult>;

  /**
   * AI-powered Sims 4 exception analysis
   * @param logContent The lastException.txt content
   */
  abstract analyzeException(logContent: string): Promise<AIResult>;

  /**
   * Extract code context around a specific line
   */
  protected extractContext(content: string, line: number, window = 10): string {
    if (!content) return "Empty file content"
    const lines = content.split('\n')
    const start = Math.max(0, line - window)
    const end = Math.min(lines.length, line + window)
    const contextualLines = lines.slice(start, end)
    
    if (contextualLines.length === 0) return `Line ${line} is out of bounds or empty`
    return contextualLines.join('\n')
  }

  /**
   * Purge the local semantic cache for this provider
   */
  clearCache(): void {
    this.cache.clear()
    console.info(`[AI] Cache purged for provider instance`)
  }

  /**
   * Standardized Execution Wrapper (Story 6.5)
   * Handles Latency measurement and Usage stats
   */
  protected async performRequest<T>(
    label: string, 
    task: () => Promise<T>,
    tokenCountText?: string,
    useHeuristicTokens: boolean = true
  ): Promise<T> {
    const start = Date.now()
    
    try {
      const result = await this.executeWithRetry(task)
      
      // Only count successful requests for "Today" metric (Story 6.5 Review)
      this.usageStats.requestsToday++
      const duration = Date.now() - start
      
      // Update latency stats
      this.usageStats.responseTimes.push(duration)
      if (this.usageStats.responseTimes.length > 50) {
        this.usageStats.responseTimes.shift() // Keep moving window
      }

      // Update tokens (Only if heuristic is requested or no API count provided later)
      if (useHeuristicTokens && tokenCountText) {
        this.usageStats.totalTokensUsed += this.estimateTokens(tokenCountText)
      }

      console.info(`[AI:${label}] Success in ${duration}ms`)
      return result
    } catch (error) {
      console.error(`[AI:${label}] Failed after retries:`, error)
      throw error
    }
  }

  /**
   * Exponential Backoff Retry Logic (Story 6.5)
   */
  protected async executeWithRetry<T>(task: () => Promise<T>, retries = 3): Promise<T> {
    let lastError: any
    
    for (let i = 0; i < retries; i++) {
      try {
        return await task()
      } catch (error: any) {
        lastError = error
        
        // Retry on rate limits (429), timeouts, or service unavailable (503/502/504)
        const status = error?.response?.status
        const isRetryable = status === 429 || status === 503 || status === 502 || status === 504 || 
                            error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')
        
        if (isRetryable && i < retries - 1) {
          const delay = Math.pow(2, i) * 1000
          console.warn(`[AI] Transient error (${status || 'Timeout'}). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        throw error
      }
    }
    
    throw lastError
  }

  /**
   * Local Token Estimator (Story 6.5)
   * A resilient heuristic (approx 4 chars per token / 0.75 tokens per word)
   */
  protected estimateTokens(text: string): number {
    if (!text) return 0
    return Math.ceil(text.length / 4)
  }

  /**
   * Standard Prompt Segment for "Better Exceptions" (Story 6.4)
   */
  protected getBetterExceptionsPrompt(diagnostic: Diagnostic, context: string): string {
    return `
As a Sims 4 Modding Expert (JPE Studio), provide a "Better Exceptions" style report for this error.
Use the following structured format exactly:
**Overview**: Plain English description of the error.
**Purpose**: The intended purpose of this tuning element.
**Root Cause**: Exactly what triggered the error (e.g. "The field 'X' is invalid").
**Logic Path**: How this relates to Sims 4 tuning logic or other files.
**Fix Strategy**: Step-by-step resolution plan.
**Key Fields**:
- List each field involved
**Effects**:
- List each in-game effect

Error: ${diagnostic.message} (L${diagnostic.line}:${diagnostic.column})
Snippet:
${context}
`
  }

  protected parseExplanation(text: string): Explanation {
    const extract = (section: string) => {
      const regex = new RegExp(`\\*\\*${section}\\*\\*:?\\s*([^\\n]*(?:\\n(?!(?:\\*\\*|###)).*)*)`, 'i')
      const match = text.match(regex)
      return match ? match[1].trim() : ''
    }

    const parseList = (section: string) => {
      const content = extract(section)
      // Robust bullet parsing: handle -, *, •, or numbered lists 1., 2. etc
      return content.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .map(l => l.replace(/^[-*•\d.]?\s*/, '').trim())
        .filter(l => l.length > 0)
    }

    return {
      overview: extract('Overview'),
      purpose: extract('Purpose') || 'Mod customization',
      rootCause: extract('Root Cause'),
      logicPath: extract('Logic Path'),
      fixStrategy: extract('Fix Strategy'),
      keyFields: parseList('Key Fields'),
      effects: parseList('Effects'),
      notes: [],
    }
  }

  getUsageStats(): ApiUsageStats {
    // Reset "Today" count if date has changed (Story 6.5 Review)
    const todayStr = new Date().toISOString().split('T')[0]
    const lastSessionDate = localStorage.getItem('jpe_ai_last_request_date')
    if (lastSessionDate !== todayStr) {
      this.usageStats.requestsToday = 0
      localStorage.setItem('jpe_ai_last_request_date', todayStr)
    }

    const avgResponseTime = this.usageStats.responseTimes.length > 0
      ? this.usageStats.responseTimes.reduce((a, b) => a + b, 0) / this.usageStats.responseTimes.length
      : 0
    
    const hits = this.usageStats.cacheHits
    const misses = this.usageStats.cacheMisses
    
    return {
      requestsToday: this.usageStats.requestsToday,
      requestsThisMonth: this.usageStats.requestsThisMonth,
      cacheHits: hits,
      cacheMisses: misses,
      cacheHitRate: hits / (hits + misses || 1),
      totalTokensUsed: this.usageStats.totalTokensUsed,
      averageResponseTime: avgResponseTime,
      responseTimes: [...this.usageStats.responseTimes]
    }
  }
}
