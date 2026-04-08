import {
  FixSuggestionEngine,
  MisspelledKeywordStrategy,
  MissingEndStrategy,
  InvalidReferenceStrategy,
  MissingQuoteStrategy,
  MissingColonStrategy,
  FixCategory,
  generateFixes,
  type FixContext,
} from '@/services/fixes/FixSuggestionEngine'
import { FixApplier, fixApplier } from '@/services/fixes/FixApplier'
import type { Diagnostic } from '@/types/index'

// ─────────────────────────────────────────────────────────────
// FixSuggestionEngine Tests
// ─────────────────────────────────────────────────────────────

describe('FixSuggestionEngine', () => {
  let engine: FixSuggestionEngine

  beforeEach(() => {
    engine = new FixSuggestionEngine()
  })

  describe('MisspelledKeywordStrategy', () => {
    const strategy = new MisspelledKeywordStrategy()

    it('should match unknown keyword errors', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: "Unknown keyword 'WEN'",
        severity: 'error',
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 4,
        source: 'syntax',
      }

      expect(strategy.match(diagnostic)).toBe(true)
    })

    it('should suggest WHEN for WEN typo', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: "Unknown keyword 'WEN'",
        severity: 'error',
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 4,
        source: 'syntax',
      }

      const context: FixContext = {
        document: 'WEN condition DO\n  action\nEND',
        fileType: 'jpe',
      }

      const suggestions = strategy.suggest(diagnostic, context)

      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions.some((s) => s.replacementText === 'WHEN')).toBe(true)
    })

    it('should calculate confidence based on edit distance', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: "Unknown keyword 'WHN'",
        severity: 'error',
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 4,
        source: 'syntax',
      }

      const context: FixContext = {
        document: 'WHN condition DO',
        fileType: 'jpe',
      }

      const suggestions = strategy.suggest(diagnostic, context)

      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0].confidence).toBeGreaterThan(0.5)
    })
  })

  describe('MissingEndStrategy', () => {
    const strategy = new MissingEndStrategy()

    it('should match missing end errors', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: 'Missing END for WHEN block',
        severity: 'error',
        startLine: 5,
        startColumn: 1,
        endLine: 5,
        endColumn: 1,
        source: 'syntax',
      }

      expect(strategy.match(diagnostic)).toBe(true)
    })

    it('should suggest inserting END', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: 'Missing END for WHEN block',
        severity: 'error',
        startLine: 5,
        startColumn: 1,
        endLine: 5,
        endColumn: 1,
        source: 'syntax',
      }

      const context: FixContext = {
        document: 'WHEN condition DO\n  action\n',
        fileType: 'jpe',
      }

      const suggestions = strategy.suggest(diagnostic, context)

      expect(suggestions.length).toBe(1)
      expect(suggestions[0].replacementText).toContain('END')
      expect(suggestions[0].confidence).toBeGreaterThan(0.9)
    })
  })

  describe('InvalidReferenceStrategy', () => {
    const strategy = new InvalidReferenceStrategy()

    it('should match undefined reference errors', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: 'Undefined reference: "trait_happynes"',
        severity: 'warning',
        startLine: 2,
        startColumn: 20,
        endLine: 2,
        endColumn: 34,
        source: 'semantic',
      }

      expect(strategy.match(diagnostic)).toBe(true)
    })

    it('should suggest similar symbols', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: 'Undefined reference: "trait_happynes"',
        severity: 'warning',
        startLine: 2,
        startColumn: 20,
        endLine: 2,
        endColumn: 34,
        source: 'semantic',
      }

      const context: FixContext = {
        document: 'WHEN sim_has_trait("trait_happynes") DO',
        fileType: 'jpe',
        availableSymbols: ['trait_happiness', 'trait_sadness', 'trait_creative'],
      }

      const suggestions = strategy.suggest(diagnostic, context)

      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0].replacementText).toBe('trait_happiness')
    })

    it('should return empty if no symbols available', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: 'Undefined reference: "something"',
        severity: 'warning',
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 10,
        source: 'semantic',
      }

      const context: FixContext = {
        document: 'content',
        fileType: 'jpe',
      }

      const suggestions = strategy.suggest(diagnostic, context)

      expect(suggestions).toHaveLength(0)
    })
  })

  describe('MissingQuoteStrategy', () => {
    const strategy = new MissingQuoteStrategy()

    it('should match unterminated string errors', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: 'Unterminated string constant',
        severity: 'error',
        startLine: 1,
        startColumn: 20,
        endLine: 1,
        endColumn: 20,
        source: 'syntax',
      }

      expect(strategy.match(diagnostic)).toBe(true)
    })

    it('should suggest adding closing quote', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: 'Unterminated string constant',
        severity: 'error',
        startLine: 1,
        startColumn: 30,
        endLine: 1,
        endColumn: 30,
        source: 'syntax',
      }

      const context: FixContext = {
        document: 'WHEN sim_has_trait("gene) DO',
        fileType: 'jpe',
      }

      const suggestions = strategy.suggest(diagnostic, context)

      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0].replacementText).toBe('"')
    })
  })

  describe('MissingColonStrategy', () => {
    const strategy = new MissingColonStrategy()

    it('should match missing colon errors', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: 'Expected : after key',
        severity: 'error',
        startLine: 1,
        startColumn: 10,
        endLine: 1,
        endColumn: 10,
        source: 'syntax',
      }

      expect(strategy.match(diagnostic)).toBe(true)
    })

    it('should suggest inserting colon', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: 'Expected : after key',
        severity: 'error',
        startLine: 1,
        startColumn: 10,
        endLine: 1,
        endColumn: 10,
        source: 'syntax',
      }

      const context: FixContext = {
        document: 'key value',
        fileType: 'jpe',
      }

      const suggestions = strategy.suggest(diagnostic, context)

      expect(suggestions.length).toBe(1)
      expect(suggestions[0].replacementText).toBe(': ')
    })
  })

  describe('Engine integration', () => {
    it('should generate fixes for matching diagnostics', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: 'Missing END for WHEN block',
        severity: 'error',
        startLine: 5,
        startColumn: 1,
        endLine: 5,
        endColumn: 1,
        source: 'syntax',
      }

      const context: FixContext = {
        document: 'WHEN test DO\n  action\n',
        fileType: 'jpe',
      }

      const fixes = engine.generateFixes(diagnostic, context)

      expect(fixes.length).toBeGreaterThan(0)
      expect(fixes[0].category).toBe(FixCategory.MISSING_END)
    })

    it('should return empty for non-matching diagnostics', () => {
      const diagnostic: Diagnostic = {
        id: '1',
        message: 'Some unrelated error',
        severity: 'error',
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 10,
        source: 'syntax',
      }

      const context: FixContext = {
        document: 'content',
        fileType: 'jpe',
      }

      const fixes = engine.generateFixes(diagnostic, context)

      expect(fixes).toHaveLength(0)
    })

    it('should limit suggestions to maxSuggestionsPerError', () => {
      const engine = new FixSuggestionEngine({ maxSuggestionsPerError: 1 })

      const diagnostic: Diagnostic = {
        id: '1',
        message: "Unknown keyword 'WEN'",
        severity: 'error',
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 4,
        source: 'syntax',
      }

      const context: FixContext = {
        document: 'WEN test DO',
        fileType: 'jpe',
        availableSymbols: ['WHEN', 'WENT', 'WEND'],
      }

      const fixes = engine.generateFixes(diagnostic, context)

      expect(fixes.length).toBeLessThanOrEqual(1)
    })

    it('should filter by minimum confidence', () => {
      const engine = new FixSuggestionEngine({ minConfidence: 0.9 })

      const diagnostic: Diagnostic = {
        id: '1',
        message: "Unknown keyword 'xyz'",
        severity: 'error',
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 4,
        source: 'syntax',
      }

      const context: FixContext = {
        document: 'xyz test',
        fileType: 'jpe',
      }

      const fixes = engine.generateFixes(diagnostic, context)

      // 'xyz' is too far from any keyword, so no fixes above 0.9 confidence
      fixes.forEach((fix) => {
        expect(fix.confidence).toBeGreaterThanOrEqual(0.9)
      })
    })

    it('should generate fixes for multiple diagnostics', () => {
      const diagnostics: Diagnostic[] = [
        {
          id: '1',
          message: 'Missing END',
          severity: 'error',
          startLine: 5,
          startColumn: 1,
          endLine: 5,
          endColumn: 1,
          source: 'syntax',
        },
        {
          id: '2',
          message: 'Unterminated string',
          severity: 'error',
          startLine: 2,
          startColumn: 15,
          endLine: 2,
          endColumn: 15,
          source: 'syntax',
        },
      ]

      const context: FixContext = {
        document: 'WHEN test DO\n  action("value\nEND\n',
        fileType: 'jpe',
      }

      const results = engine.generateFixesForDiagnostics(diagnostics, context)

      expect(results.size).toBeGreaterThan(0)
    })
  })
})

// ─────────────────────────────────────────────────────────────
// FixApplier Tests
// ─────────────────────────────────────────────────────────────

describe('FixApplier', () => {
  let applier: FixApplier

  beforeEach(() => {
    applier = new FixApplier()
  })

  describe('applyFix', () => {
    it('should apply fix successfully', () => {
      const content = 'WEN test DO'
      const fix = {
        description: 'Replace WEN with WHEN',
        confidence: 0.9,
        range: {
          startLine: 1,
          startColumn: 1,
          endLine: 1,
          endColumn: 4,
        },
        replacementText: 'WHEN',
        category: FixCategory.TYPO,
      }

      const result = applier.applyFix(content, fix)

      expect(result.success).toBe(true)
      expect(result.newContent).toBe('WHEN test DO')
    })

    it('should handle invalid line numbers', () => {
      const content = 'line 1'
      const fix = {
        description: 'Fix',
        confidence: 0.9,
        range: {
          startLine: 10,
          startColumn: 1,
          endLine: 10,
          endColumn: 5,
        },
        replacementText: 'text',
        category: FixCategory.TYPO,
      }

      const result = applier.applyFix(content, fix)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should insert text at cursor position', () => {
      const content = 'WHEN test DO\n  action\n'
      const fix = {
        description: 'Insert END',
        confidence: 0.95,
        range: {
          startLine: 3,
          startColumn: 1,
          endLine: 3,
          endColumn: 1,
        },
        replacementText: 'END',
        category: FixCategory.MISSING_END,
      }

      const result = applier.applyFix(content, fix)

      expect(result.success).toBe(true)
      expect(result.newContent).toContain('END')
    })

    it('should replace text in range', () => {
      const content = 'sim_has_buff("happynes")'
      const fix = {
        description: 'Fix typo',
        confidence: 0.85,
        range: {
          startLine: 1,
          startColumn: 18,
          endLine: 1,
          endColumn: 26,
        },
        replacementText: 'happiness',
        category: FixCategory.TYPO,
      }

      const result = applier.applyFix(content, fix)

      expect(result.success).toBe(true)
      expect(result.newContent).toContain('happiness')
    })
  })

  describe('applyFixes (multiple)', () => {
    it('should apply multiple fixes sequentially', () => {
      const content = 'WEN test DO\n  action("value)\n'
      const fixes = [
        {
          description: 'Fix WEN',
          confidence: 0.9,
          range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 4 },
          replacementText: 'WHEN',
          category: FixCategory.TYPO,
        },
        {
          description: 'Add quote',
          confidence: 0.9,
          range: { startLine: 2, startColumn: 17, endLine: 2, endColumn: 17 },
          replacementText: '"',
          category: FixCategory.SYNTAX_ERROR,
        },
      ]

      const results = applier.applyFixes(content, fixes)

      expect(results.every((r) => r.success)).toBe(true)
      expect(results[1].newContent).toContain('WHEN')
      expect(results[1].newContent).toContain('"value"')
    })
  })

  describe('generateDiffPreview', () => {
    it('should generate diff preview', () => {
      const content = 'WEN test DO'
      const fix = {
        description: 'Fix typo',
        confidence: 0.9,
        range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 4 },
        replacementText: 'WHEN',
        category: FixCategory.TYPO,
        diffPreview: 'WEN → WHEN',
      }

      const diff = applier.generateDiffPreview(content, fix)

      expect(diff).toContain('- WEN test DO')
      expect(diff).toContain('+ WHEN test DO')
    })
  })

  describe('callback', () => {
    it('should trigger onFixApplied callback', () => {
      const callback = jest.fn()
      applier.setOnFixApplied(callback)

      const content = 'WEN test'
      const fix = {
        description: 'Fix',
        confidence: 0.9,
        range: { startLine: 1, startColumn: 1, endLine: 1, endColumn: 4 },
        replacementText: 'WHEN',
        category: FixCategory.TYPO,
      }

      applier.applyFix(content, fix)

      expect(callback).toHaveBeenCalled()
    })
  })
})

// ─────────────────────────────────────────────────────────────
// Convenience Function Tests
// ─────────────────────────────────────────────────────────────

describe('generateFixes convenience function', () => {
  it('should generate fixes using default engine', () => {
    const diagnostic: Diagnostic = {
      id: '1',
      message: 'Missing END for WHEN block',
      severity: 'error',
      startLine: 5,
      startColumn: 1,
      endLine: 5,
      endColumn: 1,
      source: 'syntax',
    }

    const context: FixContext = {
      document: 'WHEN test DO\n  action\n',
      fileType: 'jpe',
    }

    const fixes = generateFixes(diagnostic, context)

    expect(fixes.length).toBeGreaterThan(0)
  })
})
