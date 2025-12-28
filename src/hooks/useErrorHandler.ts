import { useState, useCallback } from 'react'

interface ErrorState {
  message: string | null
  error: Error | null
  isVisible: boolean
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    message: null,
    error: null,
    isVisible: false,
  })

  const showError = useCallback((message: string, error?: Error) => {
    console.error('Error:', message, error)
    setErrorState({
      message,
      error: error || null,
      isVisible: true,
    })
  }, [])

  const clearError = useCallback(() => {
    setErrorState({
      message: null,
      error: null,
      isVisible: false,
    })
  }, [])

  const handleAsyncError = useCallback(
    async <T,>(promise: Promise<T>, errorMessage: string): Promise<T | null> => {
      try {
        return await promise
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        showError(errorMessage, err)
        return null
      }
    },
    [showError]
  )

  return {
    ...errorState,
    showError,
    clearError,
    handleAsyncError,
  }
}
