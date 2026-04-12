import { useState, useEffect } from 'react'

export enum OllamaProviderType {
  SYSTEM = 'system',
  SANDBOX = 'sandbox',
  NONE = 'none'
}

export interface OllamaInfo {
  provider: OllamaProviderType
  port: number
  url: string
  isRunning: boolean
  isShielded: boolean
}

/**
 * useAIEngine Hook
 * 
 * Provides reactive status of the Industrial AI Engine.
 */
export const useAIEngine = () => {
  const [info, setInfo] = useState<OllamaInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const result = await window.electron.invoke('ai:ollama:info')
      setInfo(result)
    } catch (err) {
      console.error('[useAIEngine] Failed to fetch AI info:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [])

  return { info, loading, refresh }
}
