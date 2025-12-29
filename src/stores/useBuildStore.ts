import { create } from 'zustand'
import type { Diagnostic } from '@/types/index'

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
}

export interface BuildState {
  buildStatus: 'idle' | 'running' | 'completed' | 'failed'
  progress: number
  currentFile: string | null
  results: BuildResults | null
  errors: Diagnostic[]
  log: BuildLogEntry[]

  // Actions
  startBuild: () => void
  updateProgress: (progress: number, currentFile: string) => void
  completeBuild: (results: BuildResults, errors: Diagnostic[]) => void
  failBuild: (error: string) => void
  addLogEntry: (entry: BuildLogEntry) => void
  resetBuild: () => void
  clearLog: () => void
}

export const useBuildStore = create<BuildState>((set) => ({
  buildStatus: 'idle',
  progress: 0,
  currentFile: null,
  results: null,
  errors: [],
  log: [],

  startBuild: () => {
    set({
      buildStatus: 'running',
      progress: 0,
      currentFile: null,
      results: null,
      errors: [],
      log: [
        {
          timestamp: new Date(),
          level: 'info',
          message: 'Starting build...',
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

  completeBuild: (results, errors) => {
    set((state) => ({
      buildStatus: 'completed',
      progress: 100,
      results,
      errors,
      currentFile: null,
      log: [
        ...state.log,
        {
          timestamp: new Date(),
          level: 'success',
          message: `Build completed: ${results.filesProcessed} files processed, ${results.totalErrors} errors, ${results.totalWarnings} warnings`,
        },
      ],
    }))
  },

  failBuild: (error) => {
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
}))
