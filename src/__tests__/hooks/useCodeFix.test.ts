import { renderHook, act } from '@testing-library/react'
import { useCodeFix } from '../../hooks/useCodeFix'

// Mock the AI service
const mockSuggestFix = jest.fn().mockResolvedValue({
  success: true,
  fixedCode: 'fixed_content',
  explanation: 'fixed it!',
})

jest.mock('../../services/ai/QwenService', () => ({
  QwenService: {
    getInstance: jest.fn(() => ({
      suggestFix: mockSuggestFix,
    })),
  },
}))

// Mock Zustand stores as hooks that return state
const mockEditorState = {
  tabs: [{ id: 'tab-1', fileId: 'file-1' }],
  activeTabId: 'tab-1',
  editorContent: { 'tab-1': 'do: "Greet" text: "0xBADHASH"' },
  updateTabContent: jest.fn(),
}

jest.mock('../../stores/useEditorStore', () => ({
  useEditorStore: jest.fn(() => mockEditorState),
}))

jest.mock('../../stores/useProjectStore', () => ({
  useProjectStore: jest.fn(() => ({
    getFile: jest.fn().mockReturnValue({ id: 'file-1', name: 'test.jpe' }),
    updateFile: jest.fn(),
  })),
}))

// Mock Symbol Store
const mockGetInteractions = jest.fn().mockReturnValue(new Set(['Greet', 'Goodbye']))
const mockGetStblKeys = jest.fn().mockReturnValue(new Set(['0x12345678', '0xBADHASH']))

jest.mock('../../stores/useSymbolStore', () => ({
  useSymbolStore: {
    getState: jest.fn(() => ({
      getInteractions: mockGetInteractions,
      getStblKeys: mockGetStblKeys,
    })),
  },
}))

describe('useCodeFix (Hardened II)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockEditorState.editorContent['tab-1'] = 'do: "Greet" text: "0xBADHASH"'
  })

  it('should prioritize Interaction attribute over STBL when message mentions Interactions', async () => {
    const { result } = renderHook(() => useCodeFix())
    
    await act(async () => {
      // Line: do: "Greet" text: "0xBADHASH"
      await result.current.requestFix('Missing Interaction: GreetTypo', 0)
    })

    const prompt = mockSuggestFix.mock.calls[0][3]
    expect(prompt).toContain('Target Token: "greet"')
  })

  it('should prioritize STBL attribute over Interaction when message mentions String/STBL/Hash', async () => {
    const { result } = renderHook(() => useCodeFix())
    
    await act(async () => {
      // Line: do: "Greet" text: "0xBADHASH"
      await result.current.requestFix('Invalid STBL Hash: 0xBADHASH', 0)
    })

    const prompt = mockSuggestFix.mock.calls[0][3]
    expect(prompt).toContain('Target Token: "0xbadhash"')
  })

  it('should apply Ranked Filtering (Starts-with > Includes)', async () => {
    mockGetInteractions.mockReturnValue(new Set(['GreetLater', 'SubGreet', 'Greet']))
    const { result } = renderHook(() => useCodeFix())
    
    await act(async () => {
      // Line: do: "Greet" text: "0xBADHASH"
      // Token will be "greet"
      await result.current.requestFix('Interaction error', 0)
    })

    const prompt = mockSuggestFix.mock.calls[0][3]
    // "Greet" and "GreetLater" should be prioritized over "SubGreet"
    expect(prompt).toContain('Valid Interactions: Greet, GreetLater, SubGreet')
  })
})
