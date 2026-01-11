/**
 * AI Configuration Store
 * Manages Claude API configuration, usage statistics, and preferences
 */

import { create } from 'zustand'
import { ClaudeService } from '@services/ai/ClaudeService'
import type { ApiUsageStats } from '@services/ai/types'

export interface AIState {
  // Configuration
  apiKeyConfigured: boolean
  useProxy: boolean
  initialized: boolean

  // Statistics
  usageStats: ApiUsageStats | null

  // UI State
  showAPISettings: boolean
  lastError: string | null

  // Actions
  initializeAI: () => Promise<void>
  checkApiKeyStatus: () => Promise<boolean>
  setShowAPISettings: (show: boolean) => void
  updateUsageStats: () => Promise<void>
  clearCache: () => void
  resetStats: () => void
  setLastError: (error: string | null) => void
}

export const useAIStore = create<AIState>((set, get) => ({
  // Initial state
  apiKeyConfigured: false,
  useProxy: true,
  initialized: false,
  usageStats: null,
  showAPISettings: false,
  lastError: null,

  /**
   * Initialize AI service
   */
  initializeAI: async () => {
    try {
      const service = ClaudeService.getInstance()
      await service.initialize()

      const configured = await service.isConfigured()
      const useProxy = service.isUsingProxy()
      const stats = service.getUsageStats()

      set({
        initialized: true,
        apiKeyConfigured: configured,
        useProxy,
        usageStats: stats,
        lastError: null,
      })

      console.debug('[AIStore] Initialization complete', {
        configured,
        useProxy,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[AIStore] Initialization failed:', message)

      set({
        initialized: true,
        apiKeyConfigured: false,
        useProxy: true,
        lastError: message,
      })
    }
  },

  /**
   * Check if API key is configured
   */
  checkApiKeyStatus: async () => {
    try {
      const service = ClaudeService.getInstance()
      const configured = await service.isConfigured()

      set({
        apiKeyConfigured: configured,
        useProxy: !configured,
      })

      return configured
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[AIStore] Status check failed:', message)
      set({ lastError: message })
      return false
    }
  },

  /**
   * Toggle API settings visibility
   */
  setShowAPISettings: (show) => {
    set({ showAPISettings: show })
  },

  /**
   * Update usage statistics
   */
  updateUsageStats: async () => {
    try {
      const service = ClaudeService.getInstance()
      const stats = service.getUsageStats()

      set({
        usageStats: stats,
        lastError: null,
      })

      console.debug('[AIStore] Statistics updated:', stats)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[AIStore] Failed to update stats:', message)
      set({ lastError: message })
    }
  },

  /**
   * Clear cache
   */
  clearCache: () => {
    try {
      const service = ClaudeService.getInstance()
      service.clearCache()

      set({ lastError: null })
      console.debug('[AIStore] Cache cleared')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[AIStore] Failed to clear cache:', message)
      set({ lastError: message })
    }
  },

  /**
   * Reset statistics
   */
  resetStats: () => {
    try {
      const service = ClaudeService.getInstance()
      service.resetStats()

      const stats = service.getUsageStats()
      set({
        usageStats: stats,
        lastError: null,
      })

      console.debug('[AIStore] Statistics reset')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[AIStore] Failed to reset stats:', message)
      set({ lastError: message })
    }
  },

  /**
   * Set last error message
   */
  setLastError: (error) => {
    set({ lastError: error })
  },
}))
