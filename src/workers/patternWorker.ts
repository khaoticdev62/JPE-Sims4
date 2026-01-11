/**
 * Pattern Analysis Web Worker
 * Performs heavy pattern analysis in background without blocking UI
 */

import { PatternAnalyzer } from '@engine/ml/PatternAnalyzer'
import type { ModFile, ProjectPatterns } from '@engine/ml/types'

interface PatternWorkerMessage {
  type: 'analyze-patterns' | 'cancel'
  payload?: {
    files: ModFile[]
    timeout?: number
  }
}

interface PatternWorkerResponse {
  type: 'patterns-complete' | 'patterns-progress' | 'patterns-error'
  result?: ProjectPatterns
  error?: string
  progress?: number
}

/**
 * Handle incoming messages from main thread
 */
self.onmessage = async (event: MessageEvent<PatternWorkerMessage>) => {
  const { type, payload } = event.data

  if (type === 'analyze-patterns') {
    try {
      const files = payload?.files || []
      const timeout = payload?.timeout || 60000 // Default 60 second timeout

      // Set timeout for analysis
      const analysisPromise = analyzePatterns(files)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Pattern analysis timeout after ${timeout}ms`))
        }, timeout)
      })

      const result = await Promise.race([analysisPromise, timeoutPromise])

      // Send success response
      const response: PatternWorkerResponse = {
        type: 'patterns-complete',
        result,
      }

      self.postMessage(response)
    } catch (error) {
      // Send error response
      const response: PatternWorkerResponse = {
        type: 'patterns-error',
        error: error instanceof Error ? error.message : String(error),
      }

      self.postMessage(response)
    }
  } else if (type === 'cancel') {
    // Worker termination is handled by main thread
    self.close()
  }
}

/**
 * Perform pattern analysis
 */
async function analyzePatterns(files: ModFile[]): Promise<ProjectPatterns> {
  // Yield to event loop periodically for responsiveness
  const batchSize = 10
  let processed = 0

  for (let i = 0; i < files.length; i += batchSize) {
    processed += batchSize

    // Send progress update
    const progress = Math.min((processed / files.length) * 100, 100)
    const progressResponse: PatternWorkerResponse = {
      type: 'patterns-progress',
      progress,
    }

    self.postMessage(progressResponse)

    // Yield to event loop
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  // Perform analysis
  const patterns = PatternAnalyzer.analyzeProject(files)

  return patterns
}
