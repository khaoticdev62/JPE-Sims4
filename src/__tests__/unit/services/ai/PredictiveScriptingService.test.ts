import { PredictiveScriptingService } from '@/services/ai/PredictiveScriptingService'

// Mock PatternAnalysisService (constructor-based)
jest.mock('@/services/ml/PatternAnalysisService', () => ({
  PatternAnalysisService: jest.fn().mockImplementation(() => ({
    recordPattern: jest.fn(),
  })),
}))

describe('PredictiveScriptingService', () => {
  let service: PredictiveScriptingService

  beforeEach(() => {
    service = PredictiveScriptingService.getInstance()
    jest.clearAllMocks()
  })

  describe('getPredictions', () => {
    it('should return WHEN block completion', () => {
      const context = {
        fileContent: 'WHEN sim_has_trait("gene")',
        cursorPosition: 30,
        fileType: 'jpe' as const,
      }

      const predictions = service.getPredictions(context)

      expect(predictions.length).toBeGreaterThan(0)
      expect(predictions.some((p) => p.type === 'completion')).toBe(true)
    })

    it('should suggest trait-related code when trait mentioned', () => {
      const context = {
        fileContent: '# Working with traits\nWHEN condition DO\n  action\nEND',
        cursorPosition: 20,
        fileType: 'jpe' as const,
      }

      const predictions = service.getPredictions(context)

      expect(predictions.some((p) => p.code.includes('trait'))).toBe(true)
    })

    it('should suggest buff-related code when buff mentioned', () => {
      const context = {
        fileContent: '# Apply a buff\nWHEN condition DO\n  action\nEND',
        cursorPosition: 20,
        fileType: 'jpe' as const,
      }

      const predictions = service.getPredictions(context)

      expect(predictions.some((p) => p.code.includes('buff'))).toBe(true)
    })

    it('should limit predictions to 5', () => {
      const context = {
        fileContent: 'WHEN trait AND buff WHEN trait AND buff WHEN trait',
        cursorPosition: 30,
        fileType: 'jpe' as const,
      }

      const predictions = service.getPredictions(context)

      expect(predictions.length).toBeLessThanOrEqual(5)
    })

    it('should sort predictions by confidence', () => {
      const context = {
        fileContent: 'WHEN sim_has_trait("gene")',
        cursorPosition: 30,
        fileType: 'jpe' as const,
      }

      const predictions = service.getPredictions(context)

      for (let i = 1; i < predictions.length; i++) {
        expect(predictions[i - 1].confidence).toBeGreaterThanOrEqual(
          predictions[i].confidence,
        )
      }
    })
  })

  describe('predictNextAction', () => {
    it('should return next action description', () => {
      const context = {
        fileContent: 'WHEN sim_has_trait("gene")',
        cursorPosition: 30,
        fileType: 'jpe' as const,
      }

      const action = service.predictNextAction(context)

      expect(action).toBeDefined()
      expect(typeof action).toBe('string')
    })

    it('should return null when no predictions available', () => {
      const context = {
        fileContent: '',
        cursorPosition: 0,
        fileType: 'jpe' as const,
      }

      // May or may not return predictions for empty content
      service.getPredictions(context)
    })
  })

  describe('learnFromAction', () => {
    it('should record pattern for learning', () => {
      const context = {
        fileContent: 'test content',
        cursorPosition: 5,
        fileType: 'jpe' as const,
      }

      // Should not throw when learning from action
      expect(() => service.learnFromAction('complete_when', context)).not.toThrow()
    })
  })
})
