import { ReferenceRule } from '../../engine/validators/rules/ReferenceRule'
import { useSymbolStore } from '../../stores/useSymbolStore'

describe('ReferenceRule', () => {
  beforeEach(() => {
    // Note: useSymbolStore now uses updateFileSymbols(fileId, interactions, stblKeys)
    const { updateFileSymbols, clearSymbols } = useSymbolStore.getState()
    clearSymbols()
    updateFileSymbols('file-1', new Set(['cool_interaction']), new Set(['0x12345678']))
  })

  it('should pass for valid interaction and STBL references', () => {
    const content = 'Interaction: { do: "cool_interaction", text: "0x12345678" }'
    const result = ReferenceRule.check(content)
    expect(result.diagnostics).toHaveLength(0)
  })

  it('should warn for missing interaction reference', () => {
    const content = 'do: "missing_interaction"'
    const result = ReferenceRule.check(content)
    expect(result.diagnostics).toHaveLength(1)
    expect(result.diagnostics[0].message).toContain('Interaction reference "missing_interaction" not found')
  })

  it('should verify the "Stale Symbol" cleanup fix (Hardening)', () => {
    const { updateFileSymbols } = useSymbolStore.getState()
    
    // 1. Rename 'cool_interaction' to 'new_interaction' in File-1
    updateFileSymbols('file-1', new Set(['new_interaction']), new Set(['0x12345678']))
    
    // 2. Check JPE code that still uses the OLD name
    const oldContent = 'do: "cool_interaction"'
    const oldResult = ReferenceRule.check(oldContent)
    expect(oldResult.diagnostics).toHaveLength(1)
    expect(oldResult.diagnostics[0].message).toContain('Interaction reference "cool_interaction" not found')
    
    // 3. Check JPE code that uses the NEW name
    const newContent = 'do: "new_interaction"'
    const newResult = ReferenceRule.check(newContent)
    expect(newResult.diagnostics).toHaveLength(0)
  })

  it('should warn for missing STBL reference', () => {
    const content = 'text: "0xDEADBEEF"'
    const result = ReferenceRule.check(content)
    expect(result.diagnostics).toHaveLength(1)
    expect(result.diagnostics[0].message).toContain('STBL reference "0xDEADBEEF" not found')
  })

  it('should handle multiple mixed issues', () => {
    const content = 'do: "missing_1"\ntext: "0x12345678"\ndo: "missing_2"'
    const result = ReferenceRule.check(content)
    expect(result.diagnostics).toHaveLength(2)
  })
})
