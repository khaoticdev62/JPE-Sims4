/**
 * AIServiceFactory Unit Tests
 * 
 * Tests provider-agnostic service factory pattern.
 * P1 Priority: Core functionality - should pass before merge.
 */

import { AIServiceFactory } from '@/services/ai/AIServiceFactory'
import { AIProvider } from '@/services/ai/types'
import { GeminiService } from '@/services/ai/GeminiService'
import { ClaudeService } from '@/services/ai/ClaudeService'
import { OpenAIService } from '@/services/ai/OpenAIService'
import { QwenService } from '@/services/ai/QwenService'

describe('AIServiceFactory (P1)', () => {
  describe('Provider Service Resolution', () => {
    it('should return ClaudeService for CLAUDE provider', () => {
      const service = AIServiceFactory.getService(AIProvider.CLAUDE)
      expect(service).toBeInstanceOf(ClaudeService)
    })

    it('should return OpenAIService for OPENAI provider', () => {
      const service = AIServiceFactory.getService(AIProvider.OPENAI)
      expect(service).toBeInstanceOf(OpenAIService)
    })

    it('should return GeminiService for GEMINI provider', () => {
      const service = AIServiceFactory.getService(AIProvider.GEMINI)
      expect(service).toBeInstanceOf(GeminiService)
    })

    it('should return QwenService for QWEN provider', () => {
      const service = AIServiceFactory.getService(AIProvider.QWEN)
      expect(service).toBeInstanceOf(QwenService)
    })

    it('should return QwenService for OLLAMA provider', () => {
      const service = AIServiceFactory.getService(AIProvider.OLLAMA)
      expect(service).toBeInstanceOf(QwenService)
    })

    it('should fallback to GeminiService for unknown provider', () => {
      const service = AIServiceFactory.getService('UNKNOWN' as any)
      expect(service).toBeInstanceOf(GeminiService)
    })
  })

  describe('Provider Enum Validation', () => {
    it('should have all expected providers', () => {
      expect(AIProvider.CLAUDE).toBe('claude')
      expect(AIProvider.OPENAI).toBe('openai')
      expect(AIProvider.GEMINI).toBe('gemini')
      expect(AIProvider.QWEN).toBe('qwen')
      expect(AIProvider.OLLAMA).toBe('ollama')
    })
  })
})
