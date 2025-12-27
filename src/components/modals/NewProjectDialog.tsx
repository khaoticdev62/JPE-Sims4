import { useState } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { FileService } from '@/services/FileService'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import TextInput from '@/components/common/TextInput'

interface NewProjectDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function NewProjectDialog({ isOpen, onClose }: NewProjectDialogProps) {
  const [projectName, setProjectName] = useState('')
  const [projectPath, setProjectPath] = useState('')
  const [errors, setErrors] = useState<{ name?: string; path?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const { createProject, setError } = useProjectStore()

  const handleSelectDirectory = async () => {
    const path = await FileService.openFolder()
    if (path) {
      setProjectPath(path)
      setErrors((prev) => ({ ...prev, path: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!projectName.trim()) {
      newErrors.name = 'Project name is required'
    }

    if (!projectPath.trim()) {
      newErrors.path = 'Project directory is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await createProject(projectName.trim(), projectPath.trim())
      setProjectName('')
      setProjectPath('')
      setErrors({})
      onClose()
    } catch (error) {
      setError(`Failed to create project: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} title="Create New Project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Project Name"
          type="text"
          placeholder="My Sims 4 Mod"
          value={projectName}
          onChange={(e) => {
            setProjectName(e.target.value)
            setErrors((prev) => ({ ...prev, name: undefined }))
          }}
          error={errors.name}
          disabled={isLoading}
        />

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
          {errors.path && (
            <div className="text-sm text-red-400 mt-1">{errors.path}</div>
          )}
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
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
