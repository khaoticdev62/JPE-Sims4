/**
 * AI Service Factory
 * Returns the appropriate service instance based on provider selection.
 */

import { AIProvider } from './types'
import { GeminiService } from './GeminiService'
import { ClaudeService } from './ClaudeService'
import { OpenAIService } from './OpenAIService'
import { QwenService } from './QwenService'
import { BaseAIService } from './BaseAIService'

export class AIServiceFactory {
  /**
   * Get service instance for the specified provider
   */
  static getService(provider: AIProvider): BaseAIService {
    switch (provider) {
      case AIProvider.GEMINI:
        return GeminiService.getInstance()
      case AIProvider.CLAUDE:
        return ClaudeService.getInstance()
      case AIProvider.OPENAI:
        return OpenAIService.getInstance()
      case AIProvider.QWEN:
      case AIProvider.OLLAMA:
        return QwenService.getInstance()
      default:
        return GeminiService.getInstance()
    }
  }

  /**
   * Convenience helper to get the currently selected service
   */
  static getActiveService(): BaseAIService | null {
    // This is a bridge for non-react contexts that don't use the store directly
    // but need the global active instance. 
    // In JPE, we'll assume the factory can resolve this via the store or a global config.
    try {
      // Dynamic import to avoid circular dependency if useEditorStore imports AIServices
      const { useEditorStore } = require('@/stores/useEditorStore')
      const state = useEditorStore.getState()
      if (!state || !state.aiState) throw new Error('Editor store not initialized')
      
      const provider = state.aiState.selectedProvider
      return this.getService(provider)
    } catch (error) {
      console.warn('[AI:Factory] Could not resolve active provider, falling back to Gemini:', error)
      return GeminiService.getInstance()
    }
  }
}
