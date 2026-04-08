/**
 * Epic 6: AI Services Comprehensive Tests
 *
 * Tests for OpenAIService, QwenService, GeminiService, and ConflictAnalyzer
 */

// Mock dependencies
jest.mock('@/services/ai/AIKeyStore', () => ({
  AIKeyStore: {
    getKey: jest.fn().mockResolvedValue('mock-api-key'),
  },
}))

jest.mock('axios', () => ({
  post: jest.fn(),
}))

import axios from 'axios'
import { OpenAIService } from '@/services/ai/OpenAIService'
import { QwenService } from '@/services/ai/QwenService'
import { GeminiService } from '@/services/ai/GeminiService'
import { ConflictAnalyzer } from '@/services/ai/ConflictAnalyzer'
import type { AIMessage } from '@/services/ai/types'

// ─────────────────────────────────────────────────────────────
// OpenAIService Tests
// ─────────────────────────────────────────────────────────────

describe('OpenAIService', () => {
  let service: OpenAIService

  beforeEach(() => {
    // Reset singleton
    ;(OpenAIService as any).instance = null
    service = OpenAIService.getInstance()
    jest.clearAllMocks()
  })

  it('should return singleton instance', () => {
    const instance1 = OpenAIService.getInstance()
    const instance2 = OpenAIService.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should initialize successfully', async () => {
    await service.initialize()
    expect(service).toBeDefined()
  })

  it('should return error result when API key is missing', async () => {
    jest.requireMock('@/services/ai/AIKeyStore').AIKeyStore.getKey.mockResolvedValueOnce(null)

    const result = await service.chat([{ role: 'user', content: 'test' }])

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should handle chat errors gracefully', async () => {
    const mockAxios = axios.post as jest.Mock
    mockAxios.mockRejectedValueOnce(new Error('Network error'))

    const result = await service.chat([{ role: 'user', content: 'test' }])

    expect(result.success).toBe(false)
    expect(result.error).toContain('Network error')
  })

  it('should cache successful responses', async () => {
    const mockAxios = axios.post as jest.Mock
    mockAxios.mockResolvedValueOnce({
      data: { success: true, text: 'AI response', usage: { totalTokens: 50 } },
    })

    const messages: AIMessage[] = [{ role: 'user', content: 'test' }]
    const result1 = await service.chat(messages)
    const result2 = await service.chat(messages)

    expect(result1.success).toBe(true)
    expect(result2.success).toBe(true)
    expect(result2.cached).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────
// QwenService Tests
// ─────────────────────────────────────────────────────────────

describe('QwenService', () => {
  let service: QwenService

  beforeEach(() => {
    ;(QwenService as any).instance = null
    service = QwenService.getInstance()
    jest.clearAllMocks()
  })

  it('should return singleton instance', () => {
    const instance1 = QwenService.getInstance()
    const instance2 = QwenService.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should initialize successfully', async () => {
    await service.initialize()
    expect(service).toBeDefined()
  })

  it('should handle chat errors gracefully', async () => {
    const mockAxios = axios.post as jest.Mock
    mockAxios.mockRejectedValueOnce(new Error('Qwen API error'))

    const result = await service.chat([{ role: 'user', content: 'test' }])

    expect(result.success).toBe(false)
    expect(result.error).toContain('Qwen API error')
  })

  it('should cache successful responses', async () => {
    const mockAxios = axios.post as jest.Mock
    mockAxios.mockResolvedValueOnce({
      data: { success: true, text: 'Qwen response', usage: { totalTokens: 40 } },
    })

    const messages: AIMessage[] = [{ role: 'user', content: 'test' }]
    const result1 = await service.chat(messages)
    const result2 = await service.chat(messages)

    expect(result1.success).toBe(true)
    expect(result2.cached).toBe(true)
  })

  it('should use correct model', async () => {
    const mockAxios = axios.post as jest.Mock
    mockAxios.mockResolvedValueOnce({
      data: { success: true, text: 'response' },
    })

    await service.chat([{ role: 'user', content: 'test' }])

    expect(mockAxios).toHaveBeenCalledWith(
      expect.stringContaining('/qwen/'),
      expect.objectContaining({ model: expect.any(String) }),
      expect.any(Object),
    )
  })
})

// ─────────────────────────────────────────────────────────────
// GeminiService Tests
// ─────────────────────────────────────────────────────────────

describe('GeminiService', () => {
  let service: GeminiService

  beforeEach(() => {
    ;(GeminiService as any).instance = null
    service = GeminiService.getInstance()
    jest.clearAllMocks()
  })

  it('should return singleton instance', () => {
    const instance1 = GeminiService.getInstance()
    const instance2 = GeminiService.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should initialize successfully', async () => {
    await service.initialize()
    expect(service).toBeDefined()
  })

  it('should handle chat errors gracefully', async () => {
    const mockAxios = axios.post as jest.Mock
    mockAxios.mockRejectedValueOnce(new Error('Gemini API error'))

    const result = await service.chat([{ role: 'user', content: 'test' }])

    expect(result.success).toBe(false)
    expect(result.error).toContain('Gemini API error')
  })

  it('should cache successful responses', async () => {
    const mockAxios = axios.post as jest.Mock
    mockAxios.mockResolvedValueOnce({
      data: { success: true, text: 'Gemini response', usage: { totalTokens: 60 } },
    })

    const messages: AIMessage[] = [{ role: 'user', content: 'test' }]
    const result1 = await service.chat(messages)
    const result2 = await service.chat(messages)

    expect(result1.success).toBe(true)
    expect(result2.cached).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────
// ConflictAnalyzer Tests
// ─────────────────────────────────────────────────────────────

describe('ConflictAnalyzer', () => {
  let analyzer: ConflictAnalyzer

  beforeEach(() => {
    ;(ConflictAnalyzer as any).instance = null
    analyzer = ConflictAnalyzer.getInstance()
  })

  it('should return singleton instance', () => {
    const instance1 = ConflictAnalyzer.getInstance()
    const instance2 = ConflictAnalyzer.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should extract tuning IDs from JPE content', () => {
    const content = `
WHEN sim_has_trait("trait_0x00000001") DO
  interaction_apply_buff("buff_0x00000002")
END
`

    const tuningIds = analyzer.extractTuningIds(content)

    expect(tuningIds.length).toBeGreaterThan(0)
  })

  it('should detect duplicate tuning IDs', () => {
    const files = [
      { name: 'mod1.jpe', content: 'WHEN sim_has_trait("trait_001") DO\n  action\nEND' },
      { name: 'mod2.jpe', content: 'WHEN sim_has_trait("trait_001") DO\n  action\nEND' },
    ]

    const conflicts = analyzer.detectConflicts(files)

    expect(conflicts.length).toBeGreaterThan(0)
  })

  it('should return empty conflicts for unique files', () => {
    const files = [
      { name: 'mod1.jpe', content: 'WHEN sim_has_trait("trait_001") DO\n  action\nEND' },
      { name: 'mod2.jpe', content: 'WHEN sim_has_trait("trait_002") DO\n  action\nEND' },
    ]

    const conflicts = analyzer.detectConflicts(files)

    expect(conflicts.length).toBe(0)
  })

  it('should analyze file for mod elements', () => {
    const content = `
WHEN sim_has_trait("creative") DO
  interaction_apply_buff("inspiration")
  ONLY_IF sim_has_buff("focused")
    interaction_set_value("creativity", 150)
  END
END
`

    const elements = analyzer.extractModElements(content)

    expect(elements.traits?.length).toBeGreaterThan(0)
    expect(elements.buffs?.length).toBeGreaterThan(0)
  })

  it('should handle empty content gracefully', () => {
    const tuningIds = analyzer.extractTuningIds('')
    expect(tuningIds).toHaveLength(0)

    const elements = analyzer.extractModElements('')
    expect(elements.traits).toHaveLength(0)
  })
})
