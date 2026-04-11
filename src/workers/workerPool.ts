/**
 * Worker Pool Manager
 * Manages a pool of web workers for parallel processing
 */

export interface WorkerTask<T> {
  id: string
  message: Record<string, unknown>
  resolve: (value: T) => void
  reject: (error: Error) => void
  timeout: NodeJS.Timeout
}

export class WorkerPool<T> {
  private workers: Worker[] = []
  private availableWorkers: Worker[] = []
  private taskQueue: WorkerTask<T>[] = []
  private taskMap: Map<string, WorkerTask<T>> = new Map()
  private nextTaskId = 0
  private size: number
  private workerScript: string

  constructor(size: number, workerScript: string) {
    this.size = size
    this.workerScript = workerScript
    try {
      for (let i = 0; i < size; i++) {
        this.createWorker()
      }
    } catch (error) {
      console.error('Failed to create worker pool:', error)
    }
  }

  private createWorker(): void {
    const worker = new Worker(this.workerScript, { type: 'module' })

    // Handle worker messages
    worker.onmessage = (event) => {
      this.handleWorkerMessage(event.data)
    }

    // Handle worker errors
    worker.onerror = (error) => {
      console.error('Worker error:', error)
      this.recycleWorker(worker)
    }

    this.workers.push(worker)
    this.availableWorkers.push(worker)
    this.processQueue()
  }

  /**
   * Execute a task using the worker pool
   */
  async execute<R = T>(message: Record<string, unknown>, timeout = 30000): Promise<R> {
    return new Promise((resolve, reject) => {
      const taskId = `task-${this.nextTaskId++}`
      const timeoutHandle = setTimeout(() => {
        this.taskMap.delete(taskId)
        reject(new Error(`Task ${taskId} timed out after ${timeout}ms`))
      }, timeout)

      const task: WorkerTask<T> = {
        id: taskId,
        message,
        resolve: resolve as (value: T) => void,
        reject,
        timeout: timeoutHandle,
      }

      this.taskMap.set(taskId, task)

      // Try to execute immediately or queue
      this.executeTask(task)
    })
  }

  private executeTask(task: WorkerTask<T>): void {
    if (this.availableWorkers.length > 0) {
      const worker = this.availableWorkers.pop()!
      worker.postMessage({ ...task.message, _taskId: task.id })
    } else {
      // Queue the task for later
      this.taskQueue.push(task)
    }
  }

  private handleWorkerMessage(data: Record<string, any>): void {
    const taskId = data._taskId
    if (!taskId) return

    const task = this.taskMap.get(taskId)
    if (!task) return

    clearTimeout(task.timeout)
    this.taskMap.delete(taskId)

    if (data.error) {
      task.reject(new Error(data.error))
    } else {
      task.resolve(data as unknown as T)
    }

    // Process next queued task
    this.processQueue()
  }

  private processQueue(): void {
    if (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift()
      if (task) {
        this.executeTask(task)
      }
    }
  }

  private recycleWorker(worker: Worker): void {
    const index = this.workers.indexOf(worker)
    if (index > -1) {
      this.workers.splice(index, 1)
      this.availableWorkers = this.availableWorkers.filter((w) => w !== worker)

      // Create replacement worker if needed
      if (this.workers.length < this.size) {
        console.warn(`Worker recycled, spawning replacement. Active: ${this.workers.length}/${this.size}`)
        try {
          this.createWorker()
        } catch (err) {
          console.error('Failed to spawn replacement worker:', err)
        }
      }
    }
  }

  /**
   * Terminate all workers
   */
  terminate(): void {
    this.workers.forEach((worker) => worker.terminate())
    this.workers = []
    this.availableWorkers = []
    this.taskQueue = []
    this.taskMap.clear()
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    totalWorkers: number
    availableWorkers: number
    queuedTasks: number
    activeTasks: number
  } {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      queuedTasks: this.taskQueue.length,
      activeTasks: this.taskMap.size,
    }
  }
}
