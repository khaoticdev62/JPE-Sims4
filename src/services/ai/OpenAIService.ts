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
      const response = await this.performRequest<any>('chat', () => axios.post(
        `${this.apiBaseUrl}/openai/chat`,
        {
          model: this.model,
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      ), messages.map(m => m.content).join(' '), false)

      const data = response.data
      if (!data.success || !data.text) {
        throw new Error(data.error || 'OpenAI API request failed')
      }

      if (data.usage?.totalTokens) {
        this.usageStats.totalTokensUsed += data.usage.totalTokens
      }

      this.cache.set(cacheKey, data.text)
      return { success: true, text: data.text, cached: false, timestamp: Date.now() }
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
      const response = await this.performRequest<any>('explain', () => axios.post(
        `${this.apiBaseUrl}/openai/chat`,
        {
          model: this.model,
          messages: [{ role: 'user', content: `Explain this Sims 4 mod file: ${fileName}\n\n${fileContent.substring(0, 4000)}` }]},
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      ), fileContent, false)

      const data = response.data
      if (!data.success || !data.text) throw new Error(data.error || 'Explanation failed')
      
      if (data.usage?.totalTokens) this.usageStats.totalTokensUsed += data.usage.totalTokens

      this.cache.set(cacheKey, data.text)
      return { success: true, explanation: this.parseExplanation(data.text), cached: false, timestamp: Date.now() }
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
      const response = await this.performRequest<any>('fix', () => axios.post(
        `${this.apiBaseUrl}/openai/chat`,
        {
          model: this.model,
          messages: [{ role: 'user', content: aiPrompt }],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      ), aiPrompt, false)

      const data = response.data
      if (!data.success || !data.text) throw new Error(data.error || 'Fix suggestion failed')
      
      if (data.usage?.totalTokens) this.usageStats.totalTokensUsed += data.usage.totalTokens

      let result = { fixedCode: '', explanation: { overview: 'Extraction failed', purpose: '', keyFields: [], effects: [], notes: [] } as Explanation }
      try {
        const parsed = JSON.parse(data.text)
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
      const res = await this.performRequest<any>('conflicts', () => axios.post(
        `${this.apiBaseUrl}/openai/chat`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      ), prompt, false)

      const data = res.data
      if (!data.success || !data.text) throw new Error(data.error || 'Conflict analysis failed')
      const result = JSON.parse(data.text)
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
      const res = await this.performRequest<any>('exception', () => axios.post(
        `${this.apiBaseUrl}/openai/chat`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      ), prompt, false)

      const data = res.data
      if (!data.success || !data.text) throw new Error(data.error || 'Exception analysis failed')
      const result = JSON.parse(data.text)
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
