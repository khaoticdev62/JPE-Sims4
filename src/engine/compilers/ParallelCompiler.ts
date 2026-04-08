import { WorkerPool } from '../../workers/workerPool'
import type { ModFile, Diagnostic } from '../../types'

export interface CompilationResult {
  fileId: string
  success: boolean
  output?: string
  errors: Diagnostic[]
  duration: number
}

export interface ProjectBuildResults {
  success: boolean
  results: CompilationResult[]
  totalDuration: number
  throughput: number // files per second
  workerCount: number
}

/**
 * ParallelCompiler
 * Orchestrates multi-threaded JPE to XML compilation
 */
export class ParallelCompiler {
  private pool: WorkerPool<any>
  private static instance: ParallelCompiler | null = null

  private constructor() {
    // Detect optimal core count (leave one for UI)
    const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) - 1 : 3
    const workerCount = Math.max(1, cores)
    
    // In Vite/Electron, we use the URL constructor for workers
    const workerUrl = new URL('../../workers/compilationWorker.ts', import.meta.url).href
    this.pool = new WorkerPool(workerCount, workerUrl)
  }

  static getInstance(): ParallelCompiler {
    if (!this.instance) {
      this.instance = new ParallelCompiler()
    }
    return this.instance
  }

  /**
   * Execute project-wide parallel compilation
   */
  async compileProject(files: ModFile[]): Promise<ProjectBuildResults> {
    const startTime = performance.now()
    const jpeFiles = files.filter(f => f.type === 'jpe')
    
    if (jpeFiles.length === 0) {
      return {
        success: true,
        results: [],
        totalDuration: 0,
        throughput: 0,
        workerCount: this.pool.getStats().totalWorkers
      }
    }

    // Distribute tasks across worker pool
    const tasks = jpeFiles.map(file => 
      this.pool.execute({
        type: 'compile',
        payload: {
          fileId: file.id,
          fileContent: file.content,
          fileName: file.name,
          fileType: 'jpe' as const
        }
      }).catch((err: Error) => ({
        type: 'compile-error',
        fileId: file.id,
        error: err.message
      }))
    )

    const rawResults = await Promise.all(tasks)
    const totalDuration = performance.now() - startTime

    // Map raw worker responses to typed results
    const results: CompilationResult[] = rawResults.map((res: any, index: number) => {
      if (res.type === 'compile-complete') {
        return {
          fileId: res.result.fileId,
          success: res.result.success,
          output: res.result.compiledContent,
          errors: [],
          duration: res.result.duration
        }
      } else {
        return {
          fileId: jpeFiles[index].id,
          success: false,
          errors: [{
            id: `worker-err-${jpeFiles[index].id}`,
            fileId: jpeFiles[index].id,
            line: 0,
            column: 0,
            severity: 'error',
            message: res.error || 'Worker execution failed',
            code: 'WORKER_ERR'
          }],
          duration: 0
        }
      }
    })

    return {
      success: results.every(r => r.success),
      results,
      totalDuration,
      throughput: (jpeFiles.length / (totalDuration / 1000)),
      workerCount: this.pool.getStats().totalWorkers
    }
  }

  /**
   * Execute single-file parallel compilation
   */
  async compileFile(file: ModFile): Promise<CompilationResult> {
    if (file.type !== 'jpe') {
      return {
        fileId: file.id,
        success: true,
        output: file.content,
        errors: [],
        duration: 0
      }
    }

    const startTime = performance.now()
    try {
      const res: any = await this.pool.execute({
        type: 'compile',
        payload: {
          fileId: file.id,
          fileContent: file.content,
          fileName: file.name,
          fileType: 'jpe' as const
        }
      })

      if (res.type === 'compile-complete') {
        return {
          fileId: res.result.fileId,
          success: res.result.success,
          output: res.result.compiledContent,
          errors: [],
          duration: res.result.duration
        }
      } else {
        throw new Error(res.error || 'Worker execution failed')
      }
    } catch (err) {
      return {
        fileId: file.id,
        success: false,
        errors: [{
          id: `worker-err-${file.id}`,
          fileId: file.id,
          line: 0,
          column: 0,
          severity: 'error',
          message: err instanceof Error ? err.message : 'Worker execution failed',
          code: 'WORKER_ERR'
        }],
        duration: performance.now() - startTime
      }
    }
  }

  /**
   * Shutdown the pool
   */
  dispose() {
    this.pool.terminate()
    ParallelCompiler.instance = null
  }
}
