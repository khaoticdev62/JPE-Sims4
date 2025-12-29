/**
 * Hook for accessing and managing worker pools
 * Provides background execution for heavy operations
 */

import { useEffect, useRef } from 'react'
import { WorkerPool } from '@/workers/workerPool'

// Worker pool instances (singletons)
let validationPool: WorkerPool<any> | null = null
let compilationPool: WorkerPool<any> | null = null
let parsingPool: WorkerPool<any> | null = null

export interface UseWorkerPoolOptions {
  poolSize?: number
  timeout?: number
}

export function useWorkerPool(options: UseWorkerPoolOptions = {}) {
  const { poolSize = 4, timeout = 30000 } = options
  const poolsRef = useRef<{
    validation?: WorkerPool<any>
    compilation?: WorkerPool<any>
    parsing?: WorkerPool<any>
  }>({})

  useEffect(() => {
    // Initialize pools on component mount
    try {
      if (!validationPool) {
        validationPool = new WorkerPool(poolSize, './validationWorker.ts')
      }
      if (!compilationPool) {
        compilationPool = new WorkerPool(poolSize, './compilationWorker.ts')
      }
      if (!parsingPool) {
        parsingPool = new WorkerPool(poolSize, './parsingWorker.ts')
      }

      poolsRef.current = {
        validation: validationPool,
        compilation: compilationPool,
        parsing: parsingPool
      }
    } catch (error) {
      console.error('Failed to initialize worker pools:', error)
    }

    // Cleanup on component unmount
    return () => {
      // Optionally terminate pools - commented out to keep singleton pattern
      // poolsRef.current.validation?.terminate()
      // poolsRef.current.compilation?.terminate()
      // poolsRef.current.parsing?.terminate()
    }
  }, [poolSize])

  return {
    /**
     * Execute validation in background
     */
    validateInBackground: async (fileId: string, content: string, fileName: string) => {
      if (!poolsRef.current.validation) {
        throw new Error('Validation pool not initialized')
      }

      return poolsRef.current.validation.execute(
        {
          type: 'validate',
          payload: { fileId, fileContent: content, fileName }
        },
        timeout
      )
    },

    /**
     * Execute compilation in background
     */
    compileInBackground: async (
      fileId: string,
      content: string,
      fileName: string,
      fileType: 'xml' | 'jpe'
    ) => {
      if (!poolsRef.current.compilation) {
        throw new Error('Compilation pool not initialized')
      }

      return poolsRef.current.compilation.execute(
        {
          type: 'compile',
          payload: { fileId, fileContent: content, fileName, fileType }
        },
        timeout
      )
    },

    /**
     * Execute parsing in background
     */
    parseInBackground: async (fileId: string, content: string, fileName: string) => {
      if (!poolsRef.current.parsing) {
        throw new Error('Parsing pool not initialized')
      }

      return poolsRef.current.parsing.execute(
        {
          type: 'parse',
          payload: { fileId, content, fileName }
        },
        timeout
      )
    },

    /**
     * Get pool statistics
     */
    getStats: () => ({
      validation: poolsRef.current.validation?.getStats(),
      compilation: poolsRef.current.compilation?.getStats(),
      parsing: poolsRef.current.parsing?.getStats()
    })
  }
}

/**
 * Hook for a single background operation
 * Handles loading, error, and result states
 */
export function useBackgroundTask<T>(
  task: () => Promise<T>,
  deps: any[] = []
) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const [result, setResult] = React.useState<T | null>(null)

  const execute = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await task()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [...deps])

  React.useEffect(() => {
    execute()
  }, [execute])

  return { loading, error, result, execute }
}

// Re-export React for convenience
import * as React from 'react'
