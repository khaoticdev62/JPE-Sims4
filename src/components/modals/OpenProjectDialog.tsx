"use client";

import { useState, useCallback } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { FileService } from '@/services/FileService'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { FolderOpen, Clock, AlertTriangle, FolderPlus } from 'lucide-react'

interface OpenProjectDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function OpenProjectDialog({ isOpen, onClose }: OpenProjectDialogProps) {
  const [projectPath, setProjectPath] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  const { openProject, setError: setStoreError, recentProjects } = useProjectStore()

  const handleSelectDirectory = async () => {
    const path = await FileService.openFolder()
    if (path) {
      setProjectPath(path)
      setError('')
    }
  }

  /**
   * Categorize error messages for better UX
   */
  const categorizeError = useCallback((message: string): { title: string; description: string; actionable: boolean } => {
    const lower = message.toLowerCase()
    if (lower.includes('not found') || lower.includes('no such')) {
      return { title: 'Directory Not Found', description: 'The selected folder does not exist. Please choose a valid directory.', actionable: true }
    }
    if (lower.includes('permission') || lower.includes('access')) {
      return { title: 'Permission Denied', description: 'Cannot access this folder. Try running the app as administrator or choose a different folder.', actionable: true }
    }
    if (lower.includes('not a jpe project') || lower.includes('metadata')) {
      return { title: 'Not a JPE Project', description: 'This folder does not contain a .jpe-project.json file. Would you like to create a new project here?', actionable: true }
    }
    if (lower.includes('empty')) {
      return { title: 'Empty Directory', description: 'No mod files found in this folder.', actionable: false }
    }
    return { title: 'Failed to Open', description: message, actionable: false }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!projectPath.trim()) {
      setError('Please select a project directory')
      return
    }

    setIsLoading(true)
    setLoadingMessage('Opening project...')
    try {
      await openProject(projectPath.trim())
      setProjectPath('')
      setError('')
      onClose()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to open project'
      const categorized = categorizeError(errorMsg)
      setError(`${categorized.title}: ${categorized.description}`)
      setStoreError(errorMsg)
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  /**
   * Open a recent project directly
   */
  const handleOpenRecent = async (projectRootPath: string) => {
    setIsLoading(true)
    setLoadingMessage('Opening recent project...')
    try {
      await openProject(projectRootPath)
      setProjectPath('')
      setError('')
      onClose()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to open recent project'
      setError(`Failed to open: ${errorMsg}`)
      setStoreError(errorMsg)
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  /**
   * Format timestamp to relative time
   */
  const formatTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const recentList = recentProjects.slice(0, 5)

  const errorInfo = error ? categorizeError(error) : null

  return (
    <Modal isOpen={isOpen} title="Open Project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Folder Picker */}
        <div>
          <label className="block text-sm font-medium text-slate-100 mb-1.5">
            Project Directory
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              placeholder="Select a folder..."
              value={projectPath}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-100 placeholder-slate-500 focus:outline-none cursor-not-allowed"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleSelectDirectory}
              disabled={isLoading}
            >
              <FolderOpen className="w-4 h-4 mr-1" />
              Browse
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center gap-2 mt-2 text-sm text-blue-400">
              <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span>{loadingMessage || 'Loading...'}</span>
            </div>
          )}

          {/* Error Display */}
          {error && errorInfo && (
            <div className={`mt-2 p-3 rounded border ${
              errorInfo.actionable
                ? 'bg-yellow-950/50 border-yellow-700/50'
                : 'bg-red-950/50 border-red-700/50'
            }`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-200 font-medium">{errorInfo.title}</p>
                  <p className="text-xs text-yellow-300/80 mt-0.5">{errorInfo.description}</p>
                </div>
              </div>
              {errorInfo.actionable && (
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSelectDirectory}
                    className="text-xs py-1 px-2"
                  >
                    <FolderPlus className="w-3 h-3 mr-1" />
                    Choose Another
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="text-xs py-1 px-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {!error && (
            <div className="text-xs text-slate-400 mt-2">
              Select a folder that contains Sims 4 mod files
            </div>
          )}
        </div>

        {/* Recent Projects */}
        {recentList.length > 0 && !error && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Recent Projects</span>
            </div>
            <div className="space-y-1.5">
              {recentList.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleOpenRecent(project.rootPath)}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-blue-500/30 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-100 font-medium truncate">{project.name}</p>
                        <p className="text-xs text-slate-500 truncate">{project.rootPath}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">
                      {project.metadata?.updatedAt ? formatTime(project.metadata.updatedAt) : ''}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dialog Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!projectPath.trim() || isLoading}
            className="flex-1"
          >
            Open Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
