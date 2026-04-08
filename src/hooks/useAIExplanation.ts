/**
 * useAIExplanation Hook
 * Unified hook for fetching AI explanations across all providers (Gemini, Claude, OpenAI, Qwen)
 */

import { useState, useEffect, useCallback } from 'react'
import { AIServiceFactory } from '../services/ai/AIServiceFactory'
import { useAIStore } from '../stores/useAIStore'
import type { Explanation } from '../services/ai/types'

export interface UseAIExplanationResult {
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
 * Hook to fetch and cache AI explanations using the active provider
 * @param file The mod file to explain
 * @param autoFetch Whether to automatically fetch explanation when file changes (default: true)
 * @returns Explanation data and loading/error states
 */
export function useAIExplanation(
  file: ModFile | null | undefined,
  autoFetch = true
): UseAIExplanationResult {
  const { activeProvider } = useAIStore()
  const [explanation, setExplanation] = useState<Explanation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cached, setCached] = useState(false)

  /**
   * Fetch explanation from active AI provider
   */
  const fetchExplanation = useCallback(
    async (fileToExplain: ModFile) => {
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
        const service = AIServiceFactory.getService(activeProvider)
        const result = await service.explainMod(
          fileToExplain.content,
          fileToExplain.name
        )

        if (result.success && result.explanation) {
          setExplanation(result.explanation)
          setCached(result.cached || false)
          setError(null)
          console.debug(`[useAIExplanation] Explained via ${activeProvider}`)
        } else {
          setError(result.error || 'Failed to generate explanation')
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    },
    [activeProvider]
  )

  useEffect(() => {
    if (!autoFetch || !file) return
    const timer = setTimeout(() => fetchExplanation(file), 300)
    return () => clearTimeout(timer)
  }, [file, autoFetch, fetchExplanation])

  const retry = useCallback(async () => {
    if (!file) return
    await fetchExplanation(file)
  }, [file, fetchExplanation])

  const clear = useCallback(() => {
    setExplanation(null)
    setError(null)
    setCached(false)
    setLoading(false)
  }, [])

  return { explanation, loading, error, cached, retry, clear }
}
