/**
 * Qwen Service (DashScope Implementation)
 */

import axios from 'axios'
import { BaseAIService } from './BaseAIService'
import { AIKeyStore } from './AIKeyStore'
import { AIMessage, AIResult, AIProvider } from './types'
import { Diagnostic } from '@/types/index'

export class QwenService extends BaseAIService {
  private static instance: QwenService | null = null
  private model = 'qwen-plus'
  private baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

  private constructor() {
    super({ max: 100, ttl: 24 * 60 * 60 * 1000 })
  }

  static getInstance(): QwenService {
    if (!QwenService.instance) {
      QwenService.instance = new QwenService()
    }
    return QwenService.instance
  }

  async initialize(): Promise<void> {
    this.initialized = true
  }

  protected async ensureInitialized(): Promise<void> {
    this.initialized = true
  }

  private async getApiKey(): Promise<string> {
    return await AIKeyStore.getKey(AIProvider.QWEN)
  }

  async chat(messages: AIMessage[]): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await this.getApiKey()

    // Support for Local Ollama if no key is provided and baseUrl is local
    const isLocal = this.baseUrl.includes('localhost') || this.baseUrl.includes('127.0.0.1')
    
    if (!apiKey && !isLocal) {
      return { success: false, error: 'Qwen API not configured.', cached: false, timestamp: Date.now() }
    }

    try {
      let response: any
      if (this.isElectron) {
        response = await this.callNativeBridge<any>('qwen', 'post', '/api/qwen/chat', {
          model: this.model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }, {
          'Authorization': apiKey ? `Bearer ${apiKey}` : '',
          'Content-Type': 'application/json'
        })
      } else {
        response = await this.performRequest<any>('chat', () => axios.post(
          '/api/qwen/chat',
          {
            model: this.model,
            messages: messages.map(m => ({
              role: m.role,
              content: m.content
            }))
          },
          {
            headers: {
              'Authorization': apiKey ? `Bearer ${apiKey}` : '',
              'Content-Type': 'application/json'
            }
          }
        ), messages.map(m => m.content).join(' '), false)
      }

      const data = response.data
      if (!data?.success || !data?.text) {
        throw new Error(data?.error || 'Chat failed')
      }

      if (data.usage?.totalTokens) {
        this.usageStats.totalTokensUsed += data.usage.totalTokens
      }

      return { 
        success: true, 
        text: data.text, 
        cached: false, 
        timestamp: Date.now() 
      }
    } catch (error: any) {
      return { success: false, error: error.message, cached: false, timestamp: Date.now() }
    }
  }

  private truncateContent(content: string, maxChars = 6000): string {
    if (content.length <= maxChars) return content
    const half = Math.floor(maxChars / 2) - 50
    return `${content.substring(0, half)}\n\n... [TRUNCATED ${content.length - maxChars} CHARACTERS] ...\n\n${content.substring(content.length - half)}`
  }

  async explainMod(fileContent: string, fileName: string): Promise<AIResult> {
    await this.ensureInitialized()
    const truncated = this.truncateContent(fileContent)
    const prompt = `Explain this Sims 4 mod file: ${fileName}\n\n${truncated}`
    const res = await this.chat([{ role: 'user', content: prompt }])
    if (res.success && res.text) {
      return { ...res, explanation: this.parseExplanation(res.text) }
    }
    return res
  }

  async suggestFix(
    fileContent: string, 
    fileName: string, 
    errorMessage: string,
    errorContext: string
  ): Promise<AIResult> {
    await this.ensureInitialized()
    const prompt = `Fix this Sims 4 JPE error in ${fileName}:\nError: ${errorMessage}\nContext: ${errorContext}\n\nContent:\n${fileContent}\n\nReturn JSON with "fixedCode" and "explanation".`
    
    await this.ensureInitialized()
    const apiKey = await this.getApiKey()
    
    try {
      const res = await this.performRequest<any>('fix', () => axios.post(
        '/api/qwen/chat',
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }]},
        {
          headers: {
            'Authorization': apiKey ? `Bearer ${apiKey}` : '',
            'Content-Type': 'application/json'
          }
        }
      ), prompt, false)

      const data = res.data
      if (!data.success || !data.text) {
        throw new Error(data.error || 'Fix suggestion failed')
      }

      if (data.usage?.totalTokens) {
        this.usageStats.totalTokensUsed += data.usage.totalTokens
      }

      const content = data.text
      const result = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || '{}')
      return { success: true, fixedCode: result.fixedCode, explanation: result.explanation, cached: false, timestamp: Date.now() }
    } catch (e: any) {
      return { success: false, error: e.message, cached: false, timestamp: Date.now() }
    }
  }

  async analyzeProjectConflicts(map: any): Promise<AIResult> {
    await this.ensureInitialized()
    const prompt = `Analyze these Sims 4 project elements for conflicts:\n${JSON.stringify(map)}\n\nReturn JSON with "diagnostics": [ { fileId, line, column, severity, message, code } ]`
    
    await this.ensureInitialized()
    const apiKey = await this.getApiKey()

    try {
      const res = await this.performRequest<any>('conflict', () => axios.post(
        '/api/qwen/chat',
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }]},
        {
          headers: {
            'Authorization': apiKey ? `Bearer ${apiKey}` : '',
            'Content-Type': 'application/json'
          }
        }
      ), prompt, false)

      const data = res.data
      if (!data.success || !data.text) {
        throw new Error(data.error || 'Conflict analysis failed')
      }

      if (data.usage?.totalTokens) {
        this.usageStats.totalTokensUsed += data.usage.totalTokens
      }

      const content = data.text
      const result = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || '{}')
      return { success: true, diagnostics: result.diagnostics, cached: false, timestamp: Date.now() }
    } catch (e: any) {
      return { success: false, error: e.message, cached: false, timestamp: Date.now() }
    }
  }

  async analyzeException(logContent: string): Promise<AIResult> {
    await this.ensureInitialized()
    const apiKey = await this.getApiKey()
    try {
      const prompt = `Analyze this Sims 4 exception log and explain it in Plain English for a modder:\n${logContent}\n\nReturn JSON with "report": { "explanation", "rootCause", "suggestedJpeFix" }`

      const res = await this.performRequest<any>('exception', () => axios.post(
        '/api/qwen/chat',
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }]},
        {
          headers: {
            'Authorization': apiKey ? `Bearer ${apiKey}` : '',
            'Content-Type': 'application/json'
          }
        }
      ), prompt, false)

      const data = res.data
      if (!data.success || !data.text) {
        throw new Error(data.error || 'Analysis failed')
      }

      if (data.usage?.totalTokens) {
        this.usageStats.totalTokensUsed += data.usage.totalTokens
      }

      let report: any = { explanation: 'Analysis failed', rootCause: 'Unknown', suggestedJpeFix: 'None' }
      try {
        const jsonStr = data.text.match(/\{[\s\S]*\}/)?.[0]
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr)
          report = parsed.report || parsed
        }
      } catch (_e) {
        console.warn('[Qwen] JSON Parse failed for exception report')
      }

      return {
        success: true,
        report,
        cached: false,
        timestamp: Date.now()
      }
    } catch (_error: unknown) {
      return { success: false, error: 'Analysis failed', cached: false, timestamp: Date.now() }
    }
  }

  async explainDiagnostic(fileContent: string, fileName: string, diagnostic: Diagnostic): Promise<AIResult> {
    await this.ensureInitialized()
    const context = this.extractContext(fileContent, diagnostic.line - 1)
    
    const prompt = `As a QVQ Logic Analysis Expert, explain this Sims 4 Modding error.\n\nFile: ${fileName}\nError Line: ${diagnostic.line}\nError: ${diagnostic.message}\nContext:\n${context}`
    
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

  setBaseUrl(url: string) {
    this.baseUrl = url
  }
}
