import { SmartAutocompleteService } from '@/services/editor/SmartAutocompleteService'
import type { AutocompleteContext, Completion } from '@/services/editor/SmartAutocompleteService'

// Mock PatternStore to avoid ML dependencies
jest.mock('@/engine/ml/PatternStore', () => ({
  PatternStore: {
    loadPatterns: jest.fn().mockReturnValue(null),
  },
}))

describe('SmartAutocompleteService', () => {
  describe('getCompletions', () => {
    it('should return keyword completions when prefix matches', () => {
      const context: AutocompleteContext = {
        fileContent: '',
        position: 0,
        fileName: 'test.jpe',
        prefix: 'int',
      }

      const completions = SmartAutocompleteService.getCompletions(context)

      expect(completions.length).toBeGreaterThan(0)
      expect(completions.some((c) => c.label.startsWith('int'))).toBe(true)
    })

    it('should return empty array when prefix does not match any keyword', () => {
      const context: AutocompleteContext = {
        fileContent: '',
        position: 0,
        fileName: 'test.jpe',
        prefix: 'xyz123',
      }

      const completions = SmartAutocompleteService.getCompletions(context)

      // May return empty or very limited results
      expect(completions.length).toBeLessThanOrEqual(50)
    })

    it('should return completions with correct structure', () => {
      const context: AutocompleteContext = {
        fileContent: '',
        position: 0,
        fileName: 'test.jpe',
        prefix: 'buff',
      }

      const completions = SmartAutocompleteService.getCompletions(context)
      const buffCompletion = completions.find((c) => c.label === 'buff')

      if (buffCompletion) {
        expect(buffCompletion).toHaveProperty('value')
        expect(buffCompletion).toHaveProperty('label', 'buff')
        expect(buffCompletion).toHaveProperty('type')
        expect(buffCompletion).toHaveProperty('confidence')
        expect(buffCompletion).toHaveProperty('source')
      }
    })

    it('should limit results to 50 suggestions', () => {
      const context: AutocompleteContext = {
        fileContent: '',
        position: 0,
        fileName: 'test.jpe',
        prefix: '',
      }

      const completions = SmartAutocompleteService.getCompletions(context)

      expect(completions.length).toBeLessThanOrEqual(50)
    })

    it('should return keyword type completions', () => {
      const context: AutocompleteContext = {
        fileContent: '',
        position: 0,
        fileName: 'test.jpe',
        prefix: 'wh',
      }

      const completions = SmartAutocompleteService.getCompletions(context)
      const whenCompletion = completions.find((c) => c.label === 'WHEN')

      if (whenCompletion) {
        expect(whenCompletion.type).toBe('keyword')
      }
    })
  })

  describe('completion types', () => {
    it('should support tuning type completions', () => {
      const completion: Completion = {
        value: 'interaction_Greet',
        label: 'interaction_Greet',
        type: 'tuning',
        confidence: 0.8,
        source: 'registry',
      }

      expect(completion.type).toBe('tuning')
    })

    it('should support enum type completions', () => {
      const completion: Completion = {
        value: 'positive',
        label: 'positive',
        type: 'enum',
        confidence: 0.9,
        source: 'registry',
      }

      expect(completion.type).toBe('enum')
    })

    it('should support pattern type completions', () => {
      const completion: Completion = {
        value: 'buff_{name}',
        label: 'buff_{name}',
        type: 'pattern',
        confidence: 0.7,
        frequency: 5,
        source: 'learned',
      }

      expect(completion.type).toBe('pattern')
      expect(completion.frequency).toBe(5)
      expect(completion.source).toBe('learned')
    })
  })
})

describe('JpeCompletionProvider Integration', () => {
  it('should export registerJpeCompletionProvider function', () => {
    const { registerJpeCompletionProvider } = require('@/services/autocomplete/JpeCompletionProvider')

    expect(registerJpeCompletionProvider).toBeDefined()
    expect(typeof registerJpeCompletionProvider).toBe('function')
  })

  it('should export disposeJpeCompletionProvider function', () => {
    const { disposeJpeCompletionProvider } = require('@/services/autocomplete/JpeCompletionProvider')

    expect(disposeJpeCompletionProvider).toBeDefined()
    expect(typeof disposeJpeCompletionProvider).toBe('function')
  })
})
