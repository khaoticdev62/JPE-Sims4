import { useState } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { FileService } from '@/services/FileService'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'

interface OpenProjectDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function OpenProjectDialog({ isOpen, onClose }: OpenProjectDialogProps) {
  const [projectPath, setProjectPath] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { openProject, setError: setStoreError } = useProjectStore()

  const handleSelectDirectory = async () => {
    const path = await FileService.openFolder()
    if (path) {
      setProjectPath(path)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!projectPath.trim()) {
      setError('Please select a project directory')
      return
    }

    setIsLoading(true)
    try {
      await openProject(projectPath.trim())
      setProjectPath('')
      setError('')
      onClose()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to open project'
      setError(errorMsg)
      setStoreError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} title="Open Project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
              Browse
            </Button>
          </div>
          {error && <div className="text-sm text-red-400 mt-1">{error}</div>}
          <div className="text-xs text-slate-400 mt-2">
            Select a folder that contains Sims 4 mod files
          </div>
        </div>

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
            className="flex-1"
          >
            Open Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
