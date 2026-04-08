import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Diagnostic } from '@/types/index'
import { sensory } from '@/services/SensoryService'

export interface BuildLogEntry {
  timestamp: Date
  level: 'info' | 'error' | 'warning' | 'success'
  message: string
}

export interface BuildResults {
  filesProcessed: number
  filesWithErrors: number
  filesWithWarnings: number
  totalErrors: number
  totalWarnings: number
  buildTime: number
  throughput?: number // files/sec
  workerCount?: number
}

export interface BuildState {
  buildStatus: 'idle' | 'running' | 'completed' | 'failed'
  progress: number
  currentFile: string | null
  results: BuildResults | null
  errors: Diagnostic[]
  log: BuildLogEntry[]
  packageBuffer: ArrayBuffer | null

  // Actions
  startBuild: (totalFiles?: number) => void
  updateProgress: (progress: number, currentFile: string) => void
  completeBuild: (results: BuildResults, errors: Diagnostic[], packageBuffer?: ArrayBuffer) => void
  failBuild: (error: string) => void
  addLogEntry: (entry: BuildLogEntry) => void
  resetBuild: () => void
  clearLog: () => void
}

export const useBuildStore = create<BuildState>()(
  subscribeWithSelector(
    (set) => ({
      buildStatus: 'idle',
      progress: 0,
      currentFile: null,
      results: null,
      errors: [],
      log: [],
      packageBuffer: null,

      startBuild: (totalFiles) => {
        set({
          buildStatus: 'running',
          progress: 0,
          currentFile: null,
          results: null,
          errors: [],
          packageBuffer: null,
          log: [
            {
              timestamp: new Date(),
              level: 'info',
              message: totalFiles ? `Starting parallel build for ${totalFiles} files...` : 'Starting build...',
            },
          ],
        })
      },

      updateProgress: (progress, currentFile) => {
        set((state) => ({
          progress: Math.min(100, Math.max(0, progress)),
          currentFile,
          log: [
            ...state.log,
            {
              timestamp: new Date(),
              level: 'info',
              message: `Processing: ${currentFile}`,
            },
          ],
        }))
      },

      completeBuild: (results, errors, packageBuffer) => {
        if (results.totalErrors === 0) {
          sensory.triggerSuccess();
        } else {
          sensory.triggerAlert('warn');
        }

        set((state) => {
          const throughputMsg = results.throughput 
            ? ` (Throughput: ${results.throughput.toFixed(1)} files/sec on ${results.workerCount} cores)`
            : ''
            
          return {
            buildStatus: 'completed',
            progress: 100,
            results,
            errors,
            packageBuffer: packageBuffer || null,
            currentFile: null,
            log: [
              ...state.log,
              {
                timestamp: new Date(),
                level: 'success',
                message: `Build completed: ${results.filesProcessed} files processed, ${results.totalErrors} errors${throughputMsg}`,
              },
            ],
          }
        })
      },

      failBuild: (error) => {
        sensory.triggerAlert('error');
        set((state) => ({
          buildStatus: 'failed',
          currentFile: null,
          log: [
            ...state.log,
            {
              timestamp: new Date(),
              level: 'error',
              message: `Build failed: ${error}`,
            },
          ],
        }))
      },

      addLogEntry: (entry) => {
        set((state) => ({
          log: [...state.log, entry],
        }))
      },

      resetBuild: () => {
        set({
          buildStatus: 'idle',
          progress: 0,
          currentFile: null,
          results: null,
          errors: [],
          log: [],
        })
      },

      clearLog: () => {
        set({
          log: [],
        })
      },
    })
  )
)
