/**
 * AI Service Types
 * Defines types for AI API integration and caching
 */

export enum AIProvider {
  CLAUDE = 'claude',
  OPENAI = 'openai',
  GEMINI = 'gemini',
  QWEN = 'qwen',
  OLLAMA = 'ollama'
}

export interface AIModelConfig {
  id: string
  name: string
  maxTokens: number
  contextWindow: number
}

export interface AIConfig {
  activeProvider: AIProvider
  models: Record<AIProvider, string>
  temperature: number
  maxTokens: number
  baseUrl?: string // For local/proxy serving
}

export interface AISecret {
  provider: AIProvider
  key: string
  updatedAt: number
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResult {
  success: boolean
  text?: string
  explanation?: Explanation
  fixedCode?: string
  diagnostics?: any[]
  report?: any
  error?: string
  cached: boolean
  timestamp: number
  provider?: AIProvider
}

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
  rootCause?: string     // BETTER EXCEPTIONS: What triggered the error
  logicPath?: string     // BETTER EXCEPTIONS: Component relationship
  fixStrategy?: string   // BETTER EXCEPTIONS: Step-by-step resolution
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
  responseTimes: number[]
}
