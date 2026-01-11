/**
 * useClaudeExplanation Hook
 * Custom hook for fetching Claude API explanations with loading and error states
 */

import { useState, useEffect, useCallback } from 'react'
import { ClaudeService } from '@services/ai/ClaudeService'
import type { Explanation } from '@services/ai/types'

export interface UseClaudeExplanationResult {
  explanation: Explanation | null
  loading: boolean
  error: string | null
  cached: boolean
  retry: () => Promise<void>
  clear: () => void
}

export interface ModFile {
  name: string
  content: string
  path?: string
}

/**
 * Hook to fetch and cache Claude API explanations
 * @param file The mod file to explain
 * @param autoFetch Whether to automatically fetch explanation when file changes (default: true)
 * @returns Explanation data and loading/error states
 */
export function useClaudeExplanation(
  file: ModFile | null | undefined,
  autoFetch = true
): UseClaudeExplanationResult {
  const [explanation, setExplanation] = useState<Explanation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cached, setCached] = useState(false)

  // Initialize Claude service on first load
  useEffect(() => {
    const initializeService = async () => {
      try {
        const service = ClaudeService.getInstance()
        await service.initialize()
      } catch (err) {
        console.error('[useClaudeExplanation] Failed to initialize Claude service:', err)
      }
    }

    initializeService()
  }, [])

  /**
   * Fetch explanation from Claude API
   */
  const fetchExplanation = useCallback(
    async (fileToExplain: ModFile) => {
      // Validate file
      if (!fileToExplain.content || fileToExplain.content.trim() === '') {
        setError('File content is empty')
        setExplanation(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      setExplanation(null)

      try {
        const service = ClaudeService.getInstance()
        const result = await service.explainMod(
          fileToExplain.content,
          fileToExplain.name
        )

        if (result.success && result.explanation) {
          setExplanation(result.explanation)
          setCached(result.cached)
          setError(null)

          // Log success
          console.debug(
            `[useClaudeExplanation] Explanation fetched (cached: ${result.cached})`
          )
        } else if (result.error) {
          setError(result.error)
          setExplanation(null)
          setCached(false)

          // Log error
          console.error('[useClaudeExplanation] API error:', result.error)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(message)
        setExplanation(null)
        setCached(false)

        console.error('[useClaudeExplanation] Failed to fetch explanation:', message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Auto-fetch explanation when file changes
   */
  useEffect(() => {
    if (!autoFetch || !file) {
      return
    }

    // Small delay to avoid multiple rapid requests
    const timer = setTimeout(() => {
      fetchExplanation(file)
    }, 300)

    return () => clearTimeout(timer)
  }, [file, autoFetch, fetchExplanation])

  /**
   * Manual retry function
   */
  const retry = useCallback(async () => {
    if (!file) {
      setError('No file selected')
      return
    }

    await fetchExplanation(file)
  }, [file, fetchExplanation])

  /**
   * Clear explanation
   */
  const clear = useCallback(() => {
    setExplanation(null)
    setError(null)
    setCached(false)
    setLoading(false)
  }, [])

  return {
    explanation,
    loading,
    error,
    cached,
    retry,
    clear,
  }
}

/**
 * Hook to get Claude service instance and check configuration
 */
export function useClaudeServiceStatus() {
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        const service = ClaudeService.getInstance()
        await service.initialize()
        const isConfigured = await service.isConfigured()
        setConfigured(isConfigured)
      } catch (error) {
        console.error('[useClaudeServiceStatus] Error checking configuration:', error)
        setConfigured(false)
      } finally {
        setLoading(false)
      }
    }

    checkConfiguration()
  }, [])

  return { configured, loading }
}

/**
 * Hook to get Claude service usage statistics
 */
export function useClaudeStats() {
  const [stats, setStats] = useState(() => {
    const service = ClaudeService.getInstance()
    return service.getUsageStats()
  })

  const refreshStats = useCallback(() => {
    const service = ClaudeService.getInstance()
    setStats(service.getUsageStats())
  }, [])

  return { stats, refreshStats }
}
