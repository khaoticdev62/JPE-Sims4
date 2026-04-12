import { OllamaService } from '@/services/ai/OllamaService'

// No need to mock axios if we are going through the Electron bridge
// But we should stay consistent. Let's force non-electron mode for these unit tests.

describe('OllamaService', () => {
  let service: OllamaService

  beforeEach(() => {
    jest.clearAllMocks()
    service = OllamaService.getInstance()
    service.setConfig('http://localhost:11434', 'llama3')
    
    // @ts-expect-error - Internal state override for test isolation
    service.initialized = true
    service.clearCache()

    // Mock the Electron bridge which is globally defined in jest.env.js
    if (window.electron) {
      window.electron.ai.invoke = jest.fn().mockResolvedValue({
        success: true,
        data: {
          message: { content: 'Mocked response' },
          eval_count: 50,
          prompt_eval_count: 20
        }
      })
    }
  })

  it('should be a singleton', () => {
    const s1 = OllamaService.getInstance()
    const s2 = OllamaService.getInstance()
    expect(s1).toBe(s2)
  })

  it('should include the Sims 4 system prompt in chat requests', async () => {
    const result = await service.chat([{ role: 'user', content: 'What is this mod?' }])

    expect(result.success).toBe(true)
    expect(result.text).toBe('Mocked response')
    
    const invokeCall = (window.electron.ai.invoke as jest.Mock).mock.calls[0]
    const payload = invokeCall[2] as any
    expect(payload.data.messages[0].role).toBe('system')
  })

  it('should cache chat results', async () => {
    const messages = [{ role: 'user' as const, content: 'Cache test message for Electron' }]
    
    await service.chat(messages)
    const callCountAfterFirst = (window.electron.ai.invoke as jest.Mock).mock.calls.length

    const result = await service.chat(messages)
    expect((window.electron.ai.invoke as jest.Mock).mock.calls.length).toBe(callCountAfterFirst)
    expect(result.cached).toBe(true)
  })

  it('should format connection errors correctly', async () => {
    if (window.electron) {
      (window.electron.ai.invoke as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'ECONNREFUSED'
      })
    }

    const result = await service.chat([{ role: 'user', content: 'hello' }])

    expect(result.success).toBe(false)
    expect(result.error).toContain('Ollama is not running')
  })
})
