import { create } from 'zustand'
import { AIServiceFactory } from '@/services/ai/AIServiceFactory'
import { AIKeyStore } from '@/services/ai/AIKeyStore'
import { AIProvider, ApiUsageStats } from '@/services/ai/types'
import { safeStorage } from '@/utils/storage'

export interface AIState {
  // Configuration
  activeProvider: AIProvider
  apiKeyConfigured: boolean
  initialized: boolean

  // Statistics
  usageStats: ApiUsageStats | null

  // UI State
  showAPISettings: boolean
  lastError: string | null

  // Context Settings
  includeProjectContext: boolean
  includeExternalSymbols: boolean

  // Latency History (Story 6.5)
  latencyHistory: Record<AIProvider, number[]>

  // Actions
  setProvider: (provider: AIProvider) => void
  initializeAI: () => Promise<void>
  updateUsageStats: () => void
  setApiKey: (provider: AIProvider, key: string) => void
  setContextSetting: (key: 'includeProjectContext' | 'includeExternalSymbols', value: boolean) => void
  clearCache: () => void
  setShowAPISettings: (show: boolean) => void
}

export const useAIStore = create<AIState>((set, get) => ({
  activeProvider: (safeStorage.getItem('jpe_ai_provider') as AIProvider) || AIProvider.GEMINI,
  apiKeyConfigured: false,
  initialized: false,
  usageStats: null,
  showAPISettings: false,
  lastError: null,
  latencyHistory: JSON.parse(safeStorage.getItem('jpe_ai_latency_history') || '{}') as Record<AIProvider, number[]>,
  includeProjectContext: safeStorage.getItem('jpe_ai_context_project') !== 'false',
  includeExternalSymbols: safeStorage.getItem('jpe_ai_context_external') === 'true',

  setProvider: (provider: AIProvider) => {
    safeStorage.setItem('jpe_ai_provider', provider)
    set({ activeProvider: provider })
    get().initializeAI()
  },

  initializeAI: async () => {
    try {
      const { activeProvider } = get()
      const service = AIServiceFactory.getService(activeProvider)
      await service.initialize()

      const stats = service.getUsageStats()
      const hasKey = !!(await AIKeyStore.getKey(activeProvider))

      set({
        initialized: true,
        usageStats: stats,
        apiKeyConfigured: hasKey,
        lastError: null
      })
    } catch (error: any) {
      set({ lastError: error.message, initialized: true })
    }
  },

  updateUsageStats: () => {
    const { activeProvider, latencyHistory } = get()
    const service = AIServiceFactory.getService(activeProvider)
    const stats = service.getUsageStats()
    
    // Sync latency history to store (Story 6.5)
    if (stats.responseTimes.length > 0) {
      const updatedHistory = { ...latencyHistory, [activeProvider]: [...stats.responseTimes] }
      safeStorage.setItem('jpe_ai_latency_history', JSON.stringify(updatedHistory))
      set({ usageStats: stats, latencyHistory: updatedHistory })
    } else {
      set({ usageStats: stats })
    }
  },

  setApiKey: (provider: AIProvider, key: string) => {
    if (key) {
      AIKeyStore.saveKey(provider, key)
    } else {
      AIKeyStore.deleteKey(provider)
    }
    
    if (get().activeProvider === provider) {
      set({ apiKeyConfigured: !!key })
    }
  },

  setContextSetting: (key, value) => {
    const storageKey = key === 'includeProjectContext' ? 'jpe_ai_context_project' : 'jpe_ai_context_external'
    safeStorage.setItem(storageKey, String(value))
    set({ [key]: value } as any)
  },

  clearCache: () => {
    const { activeProvider } = get()
    AIServiceFactory.getService(activeProvider).clearCache()
  },

  setShowAPISettings: (show: boolean) => set({ showAPISettings: show })
}))
