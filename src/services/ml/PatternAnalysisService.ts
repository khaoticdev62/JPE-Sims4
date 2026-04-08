/**
 * Pattern Analysis Service
 * Manages background pattern analysis using Web Workers
 */

import { PatternStore } from '@engine/ml/PatternStore'
import type { ModFile, ProjectPatterns, PatternAnalysisResult } from '@engine/ml/types'

export class PatternAnalysisService {
  private static worker: Worker | null = null
  private static isAnalyzing = false
  private static currentAbortController: AbortController | null = null

  /**
   * Analyze a project's patterns using Web Worker
   * @param files Array of mod files to analyze
   * @param projectName Project identifier for caching
   * @param timeout Maximum time for analysis in milliseconds
   * @returns Analysis result with patterns and optimizations
   */
  static async analyzeProject(
    files: ModFile[],
    projectName: string = 'default',
    timeout: number = 60000
  ): Promise<PatternAnalysisResult> {
    // Prevent overlapping analysis
    if (this.isAnalyzing) {
      return {
        success: false,
        error: 'Analysis already in progress',
        duration: 0,
        timestamp: Date.now(),
      }
    }

    this.isAnalyzing = true
    this.currentAbortController = new AbortController()
    const startTime = performance.now()

    try {
      // Check cache first
      if (PatternStore.hasValidPatterns(projectName)) {
        const cached = PatternStore.loadPatterns(projectName)
        if (cached) {
          console.debug('[PatternAnalysisService] Using cached patterns')
          this.isAnalyzing = false
          return {
            success: true,
            patterns: cached,
            duration: performance.now() - startTime,
            timestamp: Date.now(),
          }
        }
      }

      // Perform analysis with worker
      const patterns = await this.analyzeWithWorker(files, timeout)

      // Cache results
      PatternStore.savePatterns(patterns, projectName)

      const duration = performance.now() - startTime
      console.debug(
        `[PatternAnalysisService] Analysis complete in ${duration.toFixed(2)}ms`
      )

      return {
        success: true,
        patterns,
        duration: Math.round(duration * 100) / 100,
        timestamp: Date.now(),
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('[PatternAnalysisService] Analysis failed:', message)

      return {
        success: false,
        error: message,
        duration: performance.now() - startTime,
        timestamp: Date.now(),
      }
    } finally {
      this.isAnalyzing = false
      this.currentAbortController = null
    }
  }

  /**
   * Analyze patterns using Web Worker
   */
  private static analyzeWithWorker(
    files: ModFile[],
    timeout: number
  ): Promise<ProjectPatterns> {
    return new Promise((resolve, reject) => {
      // Create worker if not exists
      if (!this.worker) {
        try {
          this.worker = new Worker(new URL('@/workers/patternWorker.ts', import.meta.url), {
            type: 'module',
          })

          // Handle worker errors
          this.worker.onerror = (error) => {
            console.error('[PatternAnalysisService] Worker error:', error)
            reject(new Error(`Worker error: ${error.message}`))
          }
        } catch (error) {
          console.error('[PatternAnalysisService] Failed to create worker:', error)
          reject(new Error('Failed to create worker'))
        }
      }

      if (!this.worker) {
        reject(new Error('Failed to create worker'))
        return
      }

      const activeWorker = this.worker

      // Set timeout
      const timeoutId = setTimeout(() => {
        activeWorker.terminate()
        this.worker = null
        reject(new Error(`Analysis timeout after ${timeout}ms`))
      }, timeout)

      // Handle worker messages
      const handleMessage = (event: MessageEvent) => {
        const { type, result, error, progress } = event.data

        if (type === 'patterns-complete') {
          clearTimeout(timeoutId)
          activeWorker.removeEventListener('message', handleMessage)
          resolve(result)
        } else if (type === 'patterns-error') {
          clearTimeout(timeoutId)
          activeWorker.removeEventListener('message', handleMessage)
          reject(new Error(error || 'Analysis failed'))
        } else if (type === 'patterns-progress') {
          console.debug(`[PatternAnalysisService] Progress: ${progress?.toFixed(0)}%`)
        }
      }

      activeWorker.addEventListener('message', handleMessage)

      // Start analysis
      activeWorker.postMessage({
        type: 'analyze-patterns',
        payload: {
          files,
          timeout,
        },
      })
    })
  }

  /**
   * Cancel ongoing analysis
   */
  static cancelAnalysis(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'cancel' })
      this.worker.terminate()
      this.worker = null
    }

    if (this.currentAbortController) {
      this.currentAbortController.abort()
      this.currentAbortController = null
    }

    this.isAnalyzing = false
    console.debug('[PatternAnalysisService] Analysis cancelled')
  }

  /**
   * Check if analysis is currently running
   */
  static isRunning(): boolean {
    return this.isAnalyzing
  }

  /**
   * Force re-analysis even if cached
   */
  static async reanalyze(
    files: ModFile[],
    projectName: string = 'default',
    timeout: number = 60000
  ): Promise<PatternAnalysisResult> {
    // Clear cache
    PatternStore.clearPatterns(projectName)

    // Re-analyze
    return this.analyzeProject(files, projectName, timeout)
  }

  /**
   * Get storage statistics
   */
  static getStorageStats() {
    return PatternStore.getStats()
  }

  /**
   * Clear all cached patterns
   */
  static clearCache(): void {
    PatternStore.clearAll()
    console.debug('[PatternAnalysisService] Cache cleared')
  }
}
