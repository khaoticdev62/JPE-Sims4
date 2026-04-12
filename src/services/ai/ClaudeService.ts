/**
 * Claude AI Service
 * 
 * Industrial-grade integration with Anthropic Claude via secure proxy.
 */


import axios from 'axios'
import { BaseAIService } from './BaseAIService'
import { 
  AIMessage, 
  AIResult, 
  AIProvider,
  Explanation
} from './types'
import { Diagnostic } from '@/types/index'
import { AIKeyStore } from './AIKeyStore'

export class ClaudeService extends BaseAIService {
  private static instance: ClaudeService | null = null
  private model = 'claude-3-5-sonnet-20241022'

  private constructor() {
    super({ max: 50, ttl: 24 * 60 * 60 * 1000 })
  }

  static getInstance(): ClaudeService {
    if (!ClaudeService.instance) {
      ClaudeService.instance = new ClaudeService()
    }
    return ClaudeService.instance
  }

  async initialize(): Promise<void> {
    this.initialized = true
  }

  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized) await this.initialize()
  }

  async chat(messages: AIMessage[]): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await AIKeyStore.getKey(AIProvider.CLAUDE)
    
    // Check cache first
    const cacheKey = JSON.stringify(messages)
    const cachedResult = this.cache.get(cacheKey)
    if (cachedResult) {
      this.usageStats.cacheHits++
      return { 
        success: true, 
        text: cachedResult, 
        cached: true, 
        timestamp: Date.now() 
      }
    }

    this.usageStats.cacheMisses++

    try {
      let response: any
      const apiUrl = 'https://api.anthropic.com/v1/messages'
      const payload = {
        model: this.model,
        max_tokens: 4096,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      }
      const headers = {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }

      if (this.isElectron) {
        response = await this.callNativeBridge<any>('claude', 'post', apiUrl, payload, headers)
      } else {
        response = await this.performRequest<any>('chat', () => axios.post(
          apiUrl, payload, { headers }
        ), messages.map(m => m.content).join(' '), false)
      }

      const data = response.data
      
      // Parse Anthropic response format
      const text = data?.content?.[0]?.text
      if (!text) {
        throw new Error(data?.error?.message || 'Claude API request failed')
      }

      // Update actual token usage
      if (data.usage) {
        const input = data.usage.input_tokens || 0
        const output = data.usage.output_tokens || 0
        this.usageStats.totalTokensUsed += (input + output)
      }

      this.cache.set(cacheKey, text)

      return {
        success: true,
        text,
        cached: false,
        timestamp: Date.now()
      }
    } catch (error: any) {
      console.error('[ClaudeService] Chat Error:', error)
      return { success: false, error: error.message, cached: false, timestamp: Date.now() }
    }
  }

  async explainMod(fileContent: string, fileName: string): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await AIKeyStore.getKey(AIProvider.CLAUDE)

    // Specific cache for explanations
    const cacheKey = `explain:${fileName}:${this.estimateTokens(fileContent)}`
    const cachedResult = this.cache.get(cacheKey)
    if (cachedResult) {
      this.usageStats.cacheHits++
      return { 
        success: true, 
        explanation: this.parseExplanation(cachedResult), 
        cached: true, 
        timestamp: Date.now() 
      }
    }

    try {
      const apiUrl = 'https://api.anthropic.com/v1/messages'
      const headers = {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
      const response = await this.performRequest<any>('explain', () => axios.post(
        apiUrl,
        {
          model: this.model,
          max_tokens: 4096,
          messages: [{ role: 'user', content: `Explain this Sims 4 mod file: ${fileName}\n\n${fileContent.substring(0, 4000)}` }]},
        { headers }
      ), fileContent, false)

      const data = response.data
      const text = data?.content?.[0]?.text
      if (!text) {
        throw new Error(data?.error?.message || 'Explanation failed')
      }
      
      if (data.usage) {
        this.usageStats.totalTokensUsed += (data.usage.input_tokens + data.usage.output_tokens)
      }

      this.cache.set(cacheKey, text)

      return {
        success: true,
        explanation: this.parseExplanation(text),
        cached: false,
        timestamp: Date.now()
      }
    } catch (error: any) {
      return { success: false, error: error.message, cached: false, timestamp: Date.now() }
    }
  }

  async suggestFix(
    fileContent: string,
    fileName: string,
    errorMessage: string,
    errorContext: string
  ): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await AIKeyStore.getKey(AIProvider.CLAUDE)

    const aiPrompt = `You are an expert Sims 4 mod creator. Fix the following error in a JPE file.\n\nFile: ${fileName}\nError: ${errorMessage}\nContext: ${errorContext || 'N/A'}\n\nFull Content:\n${fileContent}\n\nReturn ONLY a JSON object with:\n1. "fixedCode": The complete corrected content.\n2. "explanation": What you fixed.\n`

    if (!apiKey) return { success: false, error: 'AI not configured', cached: false, timestamp: Date.now() }

    try {
      const apiUrl = 'https://api.anthropic.com/v1/messages'
      const headers = {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
      const response = await this.performRequest<any>('fix', () => axios.post(
        apiUrl,
        {
          model: this.model,
          max_tokens: 4096,
          messages: [{ role: 'user', content: aiPrompt }]},
        { headers }
      ), aiPrompt, false)

      const data = response.data
      const text = data?.content?.[0]?.text
      if (!text) {
        throw new Error(data?.error?.message || 'Fix suggestion failed')
      }
      
      if (data.usage) {
        this.usageStats.totalTokensUsed += (data.usage.input_tokens + data.usage.output_tokens)
      }

      let result = { fixedCode: '', explanation: { overview: 'Extraction failed', purpose: '', keyFields: [], effects: [], notes: [] } as Explanation }
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          result = {
            fixedCode: parsed.fixedCode || '',
            explanation: { overview: parsed.explanation || '', purpose: '', keyFields: [], effects: [], notes: [] }
          }
        }
      } catch (_e) {
        console.warn('[Claude] JSON Parse failed, falling back to raw text')
      }
      
      return {
        success: true,
        fixedCode: result.fixedCode,
        explanation: result.explanation,
        cached: false,
        timestamp: Date.now()
      }
    } catch (error: any) {
      return { success: false, error: error.message, cached: false, timestamp: Date.now() }
    }
  }

  async analyzeProjectConflicts(map: any): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await AIKeyStore.getKey(AIProvider.CLAUDE)

    const prompt = `Analyze this symbolic map of a Sims 4 project for logical conflicts:\n${JSON.stringify(map, null, 2)}\n\nReturn ONLY a JSON object with "diagnostics": [ { "fileId", "line", "column", "severity", "message", "code" } ]`

    try {
      const apiUrl = 'https://api.anthropic.com/v1/messages'
      const headers = { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }
      const response = await this.performRequest<any>('conflicts', () => axios.post(
        apiUrl,
        {
          model: this.model,
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }]},
        { headers }
      ), prompt, false)

      const data = response.data
      const text = data?.content?.[0]?.text || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { diagnostics: [] }
      
      return { success: true, diagnostics: result.diagnostics, cached: false, timestamp: Date.now() }
    } catch (error: any) {
      return { success: false, error: error.message, cached: false, timestamp: Date.now() }
    }
  }

  async analyzeException(logContent: string): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await AIKeyStore.getKey(AIProvider.CLAUDE)

    const prompt = `Analyze this Sims 4 exception log and explain it in Plain English for a modder:\n${logContent}\n\nReturn ONLY a JSON object with "report": { "explanation", "rootCause", "suggestedJpeFix" }`

    try {
      const apiUrl = 'https://api.anthropic.com/v1/messages'
      const headers = { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }
      const response = await this.performRequest<any>('exception', () => axios.post(
        apiUrl,
        {
          model: this.model,
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }]},
        { headers }
      ), prompt, false)

      const data = response.data
      const text = data?.content?.[0]?.text || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { report: null }
      
      return { success: true, report: result.report, cached: false, timestamp: Date.now() }
    } catch (error: any) {
      return { success: false, error: error.message, cached: false, timestamp: Date.now() }
    }
  }

  async explainDiagnostic(fileContent: string, fileName: string, diagnostic: Diagnostic): Promise<AIResult> {
    await this.ensureInitialized()
    const context = this.extractContext(fileContent, diagnostic.line - 1)
    
    const prompt = `As a Sims 4 Modding Expert, explain why this error occurred and how it relates to Sims 4 tuning logic.\n\nFile: ${fileName}\nError Line: ${diagnostic.line}\nError: ${diagnostic.message}\nCode Snippet:\n${context}\n\nProvide a clear, concise explanation of the logical impact and the best way to resolve it.`
    
    return this.chat([{ role: 'user', content: prompt }])
  }

  async fixDiagnostic(fileContent: string, fileName: string, diagnostic: Diagnostic, context: string): Promise<AIResult> {
    return this.suggestFix(fileContent, fileName, diagnostic.message, context)
  }

  async getPredictiveCompletion(content: string, fileName: string, cursorOffset: number, projectContext?: string): Promise<AIResult> {
    await this.ensureInitialized()
    const beforeCursor = content.slice(0, cursorOffset)
    const afterCursor = content.slice(cursorOffset)
    const prompt = `As a Sims 4 Modding Expert (JPE Studio), provide a ONE-LINE completion for the code following (|).\n\nFile: ${fileName}\nContext: ${projectContext || 'General'}\n\nCode Context:\n---\n${beforeCursor.slice(-500)}|${afterCursor.slice(0, 100)}\n---\n\nReturn ONLY the predicted characters. No explanations.`
    return this.chat([{ role: 'user', content: prompt }])
  }
}
