/**
 * OpenAI AI Service
 * 
 * Industrial-grade integration with OpenAI GPT-4 via secure proxy.
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

export class OpenAIService extends BaseAIService {
  private static instance: OpenAIService | null = null
  private model = 'gpt-4o'

  private constructor() {
    super({ max: 100, ttl: 24 * 60 * 60 * 1000 })
  }

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService()
    }
    return OpenAIService.instance
  }

  async initialize(): Promise<void> {
    this.initialized = true
  }

  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized) await this.initialize()
  }

  async chat(messages: AIMessage[]): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await AIKeyStore.getKey(AIProvider.OPENAI)
    
    const cacheKey = JSON.stringify(messages)
    const cachedResult = this.cache.get(cacheKey)
    if (cachedResult) {
      this.usageStats.cacheHits++
      return { success: true, text: cachedResult, cached: true, timestamp: Date.now() }
    }

    try {
      let response: any
      const apiUrl = 'https://api.openai.com/v1/chat/completions'
      const payload = {
        model: this.model,
        messages: messages.map(m => ({ role: m.role, content: m.content }))
      }
      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }

      if (this.isElectron) {
        response = await this.callNativeBridge<any>('openai', 'post', apiUrl, payload, headers)
      } else {
        response = await this.performRequest<any>('chat', () => axios.post(
          apiUrl, payload, { headers }
        ), messages.map(m => m.content).join(' '), false)
      }

      const data = response.data
      const text = data?.choices?.[0]?.message?.content
      if (!text) {
        throw new Error(data?.error?.message || 'OpenAI API request failed')
      }

      if (data.usage?.total_tokens) {
        this.usageStats.totalTokensUsed += data.usage.total_tokens
      }

      this.cache.set(cacheKey, text)
      return { success: true, text, cached: false, timestamp: Date.now() }
    } catch (error: any) {
      console.error('[OpenAIService] Chat Error:', error)
      return { success: false, error: error.message, cached: false, timestamp: Date.now() }
    }
  }

  async explainMod(fileContent: string, fileName: string): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await AIKeyStore.getKey(AIProvider.OPENAI)

    const cacheKey = `explain:openai:${fileName}:${this.estimateTokens(fileContent)}`
    const cachedResult = this.cache.get(cacheKey)
    if (cachedResult) {
      return { success: true, explanation: this.parseExplanation(cachedResult), cached: true, timestamp: Date.now() }
    }

    try {
      const apiUrl = 'https://api.openai.com/v1/chat/completions'
      const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
      const response = await this.performRequest<any>('explain', () => axios.post(
        apiUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: `Explain this Sims 4 mod file: ${fileName}\n\n${fileContent.substring(0, 4000)}` }]},
        { headers }
      ), fileContent, false)

      const data = response.data
      const text = data?.choices?.[0]?.message?.content
      if (!text) throw new Error(data?.error?.message || 'Explanation failed')
      
      if (data.usage?.total_tokens) this.usageStats.totalTokensUsed += data.usage.total_tokens

      this.cache.set(cacheKey, text)
      return { success: true, explanation: this.parseExplanation(text), cached: false, timestamp: Date.now() }
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
    const apiKey = await AIKeyStore.getKey(AIProvider.OPENAI)
    const aiPrompt = `Fix the following error in a JPE file: ${fileName}\nError: ${errorMessage}\nContext: ${errorContext}\n\nFull Content:\n${fileContent}\n\nReturn ONLY a JSON object with "fixedCode" and "explanation".`

    try {
      const apiUrl = 'https://api.openai.com/v1/chat/completions'
      const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
      const response = await this.performRequest<any>('fix', () => axios.post(
        apiUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: aiPrompt }],
          response_format: { type: 'json_object' }
        },
        { headers }
      ), aiPrompt, false)

      const data = response.data
      const text = data?.choices?.[0]?.message?.content
      if (!text) throw new Error(data?.error?.message || 'Fix suggestion failed')
      
      if (data.usage?.total_tokens) this.usageStats.totalTokensUsed += data.usage.total_tokens

      let result = { fixedCode: '', explanation: { overview: 'Extraction failed', purpose: '', keyFields: [], effects: [], notes: [] } as Explanation }
      try {
        const parsed = JSON.parse(text)
        result = {
          fixedCode: parsed.fixedCode || '',
          explanation: { overview: parsed.explanation || '', purpose: '', keyFields: [], effects: [], notes: [] }
        }
      } catch (_e) {
        console.warn('[OpenAI] JSON Parse failed')
      }

      return { success: true, fixedCode: result.fixedCode, explanation: result.explanation, cached: false, timestamp: Date.now() }
    } catch (error: any) {
      return { success: false, error: error.message, cached: false, timestamp: Date.now() }
    }
  }

  async analyzeProjectConflicts(map: any): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await AIKeyStore.getKey(AIProvider.OPENAI)
    const prompt = `Analyze these Sims 4 project elements for conflicts:\n${JSON.stringify(map)}\n\nReturn JSON with "diagnostics": [ { fileId, line, column, severity, message, code } ]`
    
    try {
      const apiUrl = 'https://api.openai.com/v1/chat/completions'
      const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
      const res = await this.performRequest<any>('conflicts', () => axios.post(
        apiUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        },
        { headers }
      ), prompt, false)

      const data = res.data
      const text = data?.choices?.[0]?.message?.content
      if (!text) throw new Error(data?.error?.message || 'Conflict analysis failed')
      const result = JSON.parse(text)
      return { success: true, diagnostics: result.diagnostics, cached: false, timestamp: Date.now() }
    } catch (error: any) {
      return { success: false, error: error.message, cached: false, timestamp: Date.now() }
    }
  }

  async analyzeException(logContent: string): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await AIKeyStore.getKey(AIProvider.OPENAI)
    const prompt = `Analyze this Sims 4 exception log and explain it in Plain English for a modder:\n${logContent}\n\nReturn JSON with "report": { "explanation", "rootCause", "suggestedJpeFix" }`

    try {
      const apiUrl = 'https://api.openai.com/v1/chat/completions'
      const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
      const res = await this.performRequest<any>('exception', () => axios.post(
        apiUrl,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        },
        { headers }
      ), prompt, false)

      const data = res.data
      const text = data?.choices?.[0]?.message?.content
      if (!text) throw new Error(data?.error?.message || 'Exception analysis failed')
      const result = JSON.parse(text)
      return { success: true, report: result.report || result, cached: false, timestamp: Date.now() }
    } catch (error: any) {
      return { success: false, error: error.message, cached: false, timestamp: Date.now() }
    }
  }

  async explainDiagnostic(fileContent: string, fileName: string, diagnostic: Diagnostic): Promise<AIResult> {
    await this.ensureInitialized()
    const context = this.extractContext(fileContent, diagnostic.line - 1)
    
    const prompt = `As a Sims 4 Modding Expert, explain why this error occurred and how it relates to Sims 4 tuning logic.\n\nFile: ${fileName}\nError Line: ${diagnostic.line}\nError: ${diagnostic.message}\nCode Snippet:\n${context}`
    
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
