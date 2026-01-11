/**
 * AI Service Types
 * Defines types for Claude API integration and caching
 */

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ClaudeRequest {
  model: string
  max_tokens: number
  messages: ClaudeMessage[]
  temperature?: number
  top_p?: number
}

export interface ClaudeResponse {
  id: string
  object: string
  created: number
  model: string
  content: Array<{
    type: string
    text: string
  }>
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export interface Explanation {
  overview: string
  purpose: string
  keyFields: string[]
  effects: string[]
  notes: string[]
}

export interface ExplanationResult {
  success: boolean
  explanation?: Explanation
  error?: string
  cached: boolean
  timestamp: number
}

export interface CacheConfig {
  max: number
  ttl: number // Time to live in milliseconds
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export interface RateLimiterConfig {
  points: number // Number of requests allowed
  duration: number // Duration in seconds
}

export interface ApiUsageStats {
  requestsToday: number
  requestsThisMonth: number
  cacheHits: number
  cacheMisses: number
  cacheHitRate: number
  totalTokensUsed: number
  averageResponseTime: number
}
