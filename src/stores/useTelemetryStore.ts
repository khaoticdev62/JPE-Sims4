/**
 * Telemetry Store
 * Zustand store for managing telemetry state and preferences
 */

import { create } from 'zustand'
import { TelemetryService } from '@services/analytics/TelemetryService'
import type { TelemetryStats } from '@services/analytics/types'

export interface TelemetryState {
  // Configuration
  enabled: boolean
  consentGiven: boolean

  // Statistics
  stats: TelemetryStats | null

  // UI State
  showConsentDialog: boolean

  // Actions
  enableTelemetry: () => void
  disableTelemetry: () => void
  setConsentGiven: (given: boolean) => void
  updateStats: () => void
  clearAllData: () => void
  setShowConsentDialog: (show: boolean) => void
  resetStats: () => void
}

export const useTelemetryStore = create<TelemetryState>((set) => {
  // Initialize service
  const service = TelemetryService.getInstance()
  const initialEnabled = service.isEnabled()

  return {
    // Initial state
    enabled: initialEnabled,
    consentGiven: initialEnabled,
    stats: service.getStats(),
    showConsentDialog: !initialEnabled, // Show dialog if not enabled

    /**
     * Enable telemetry
     */
    enableTelemetry: () => {
      const service = TelemetryService.getInstance()
      service.enable()

      set({
        enabled: true,
        consentGiven: true,
        showConsentDialog: false,
      })

      // Persist consent
      localStorage.setItem('telemetry-consent-given', 'true')
      console.debug('[TelemetryStore] Telemetry enabled')
    },

    /**
     * Disable telemetry
     */
    disableTelemetry: () => {
      const service = TelemetryService.getInstance()
      service.disable()

      set({
        enabled: false,
        showConsentDialog: false,
      })

      localStorage.setItem('telemetry-consent-given', 'false')
      console.debug('[TelemetryStore] Telemetry disabled')
    },

    /**
     * Set consent flag
     */
    setConsentGiven: (given) => {
      set({ consentGiven: given })
      localStorage.setItem('telemetry-consent-given', given ? 'true' : 'false')
    },

    /**
     * Update statistics
     */
    updateStats: () => {
      const service = TelemetryService.getInstance()
      const stats = service.getStats()

      set({ stats })
      console.debug('[TelemetryStore] Statistics updated')
    },

    /**
     * Clear all data
     */
    clearAllData: () => {
      const service = TelemetryService.getInstance()
      service.clearAllData()

      set({
        enabled: false,
        consentGiven: false,
        stats: service.getStats(),
      })

      console.debug('[TelemetryStore] All telemetry data cleared')
    },

    /**
     * Show/hide consent dialog
     */
    setShowConsentDialog: (show) => {
      set({ showConsentDialog: show })
    },

    /**
     * Reset statistics
     */
    resetStats: () => {
      const service = TelemetryService.getInstance()
      service.resetStats()

      set({ stats: service.getStats() })
      console.debug('[TelemetryStore] Statistics reset')
    },
  }
})
