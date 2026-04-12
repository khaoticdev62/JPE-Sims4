/**
 * Gemini Service (Implementation)
 */

import axios from 'axios'
import { BaseAIService } from './BaseAIService'
import { AIKeyStore } from './AIKeyStore'
import { AICache } from './AICache'
import { AIMessage, AIResult, AIProvider } from './types'
import { Diagnostic } from '@/types/index'

export class GeminiService extends BaseAIService {
  private static instance: GeminiService | null = null
  private model = 'gemini-1.5-pro'

  private constructor() {
    super({ max: 100, ttl: 24 * 60 * 60 * 1000 })
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService()
    }
    return GeminiService.instance
  }

  async initialize(): Promise<void> {
    this.initialized = true
  }

  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  private async getApiKey(): Promise<string> {
    return await AIKeyStore.getKey(AIProvider.GEMINI)
  }

  async chat(messages: AIMessage[]): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await this.getApiKey()

    if (!apiKey) {
      return { success: false, error: 'Gemini API not configured.', cached: false, timestamp: Date.now() }
    }


    try {
      let response: any
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`
      const payload = {
        contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
      }

      if (this.isElectron) {
        response = await this.callNativeBridge<any>('gemini', 'post', apiUrl, payload)
      } else {
        response = await this.performRequest<any>('chat', () => axios.post(apiUrl, payload),
          messages.map(m => m.content).join(' '), false)
      }

      const resData = response.data
      if (resData?.usageMetadata?.totalTokenCount) {
        this.usageStats.totalTokensUsed += resData.usageMetadata.totalTokenCount
      }

      const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        throw new Error('Empty response from Gemini')
      }

      return { 
        success: true, 
        text, 
        cached: false, 
        timestamp: Date.now() 
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message || 'Chat failed'
      return { 
        success: false, 
        error: message, 
        cached: false, 
        timestamp: Date.now() 
      }
    }
  }

  async explainMod(fileContent: string, fileName: string): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await this.getApiKey()

    if (!apiKey) return { success: false, error: 'API not configured', cached: false, timestamp: Date.now() }

    const cacheKey = AICache.generateKey(fileContent, fileName)
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

    const prompt = `Summarize this Sims 4 JPE mod file.
File: ${fileName}
Content:
${fileContent.substring(0, 3000)}

Provide:
1. **Overview**: Purpose of this mod.
2. **Key Fields**: Major tunable parameters.
3. **Effects**: Gameplay impact.`

    try {
      let response: any
      if (this.isElectron) {
        response = await this.callNativeBridge<any>('gemini', 'post', `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`, {
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        })
      } else {
        response = await this.performRequest('explain', () => axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
          { contents: [{ role: 'user', parts: [{ text: prompt }] }] }
        ), prompt)
      }

      const resData = response.data
      if (resData.usageMetadata?.totalTokenCount) {
        this.usageStats.totalTokensUsed += resData.usageMetadata.totalTokenCount
      }

      const text = resData.candidates[0].content.parts[0].text
      this.cache.set(cacheKey, text)

      return {
        success: true,
        explanation: this.parseExplanation(text),
        cached: false,
        timestamp: Date.now(),
      }
    } catch (error: unknown) {
      const message = (error as any).response?.data?.error?.message || (error as any).message || 'API call failed'
      return { 
        success: false, 
        error: message, 
        cached: false, 
        timestamp: Date.now() 
      }
    }
  }

  async suggestFix(
    fileContent: string, 
    fileName: string, 
    errorMessage: string,
    errorContext: string
  ): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await this.getApiKey()

    if (!apiKey) return { success: false, error: 'AI not configured', cached: false, timestamp: Date.now() }

    try {
      const prompt = `Fix the following error in a JPE file: ${fileName}
Error: ${errorMessage}
Context: ${errorContext}

Full Content:
${fileContent}

Return ONLY a JSON object with "fixedCode" and "explanation".`

      let response: any
      if (this.isElectron) {
        response = await this.callNativeBridge<any>('gemini', 'post', 
          `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
          {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          }
        )
      } else {
        response = await this.performRequest('fix', () => axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
          {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          }
        ), prompt)
      }

      const resData = response.data
      if (resData.usageMetadata?.totalTokenCount) {
        this.usageStats.totalTokensUsed += resData.usageMetadata.totalTokenCount
      }

      const result = JSON.parse(resData.candidates[0].content.parts[0].text)
      return { 
        success: true, 
        fixedCode: result.fixedCode, 
        explanation: result.explanation, 
        cached: false, 
        timestamp: Date.now() 
      }
    } catch (error: unknown) {
      const message = (error as any).response?.data?.error?.message || (error as any).message || 'API call failed'
      return { 
        success: false, 
        error: message, 
        cached: false, 
        timestamp: Date.now() 
      }
    }
  }

  async analyzeProjectConflicts(map: any): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await this.getApiKey()

    if (!apiKey) return { success: false, error: 'AI not configured', cached: false, timestamp: Date.now() }

    try {
      const prompt = `Analyze this symbolic map of a Sims 4 project for logical conflicts:
${JSON.stringify(map, null, 2)}

Return ONLY a JSON object with "diagnostics": [ { "fileId", "line", "column", "severity", "message", "code" } ]`

      let response: any
      if (this.isElectron) {
        response = await this.callNativeBridge<any>('gemini', 'post', 
          `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
          {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          }
        )
      } else {
        response = await this.performRequest('conflicts', () => axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
          {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          }
        ), JSON.stringify(map), false)
      }

      const resData = response.data
      if (resData.usageMetadata?.totalTokenCount) {
        this.usageStats.totalTokensUsed += resData.usageMetadata.totalTokenCount
      }

      const result = JSON.parse(resData.candidates[0].content.parts[0].text)
      return { success: true, diagnostics: result.diagnostics, cached: false, timestamp: Date.now() }
    } catch (_error: unknown) {
      return { success: false, error: 'Conflict analysis failed', cached: false, timestamp: Date.now() }
    }
  }

  async analyzeException(logContent: string): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await this.getApiKey()

    if (!apiKey) return { success: false, error: 'AI not configured', cached: false, timestamp: Date.now() }

    try {
      const prompt = `Analyze this Sims 4 exception log and explain it in Plain English for a modder:
${logContent}

Return ONLY a JSON object with "report": { "explanation", "rootCause", "suggestedJpeFix" }`

      let response: any
      if (this.isElectron) {
        response = await this.callNativeBridge<any>('gemini', 'post', 
          `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
          {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          }
        )
      } else {
        response = await this.performRequest('exception', () => axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
          {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          }
        ), logContent, false)
      }

      const resData = response.data
      if (resData.usageMetadata?.totalTokenCount) {
        this.usageStats.totalTokensUsed += resData.usageMetadata.totalTokenCount
      }

      const result = JSON.parse(resData.candidates[0].content.parts[0].text)
      return { success: true, report: result.report, cached: false, timestamp: Date.now() }
    } catch (_error: unknown) {
      return { success: false, error: 'Exception analysis failed', cached: false, timestamp: Date.now() }
    }
  }

  async explainDiagnostic(fileContent: string, fileName: string, diagnostic: Diagnostic): Promise<AIResult> {
    await this.ensureInitialized()
    
    const context = this.extractContext(fileContent, diagnostic.line - 1)
    
    const prompt = `
    As a Sims 4 Modding Expert, explain why this error occurred and how it relates to Sims 4 tuning logic.
    
    File: ${fileName}
    Error Line: ${diagnostic.line}
    Error: ${diagnostic.message}
    Code Snippet:
    ${context}
    
    Provide a clear, concise explanation of the logical impact and the best way to resolve it.
    `
    
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
