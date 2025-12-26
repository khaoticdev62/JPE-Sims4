import { useState } from 'react'
import { useProjectStore } from '@stores/useProjectStore'
import { useEditorStore } from '@stores/useEditorStore'
import { FileService } from '@services/FileService'
import Modal from '@components/common/Modal'
import Button from '@components/common/Button'

interface AddFileDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddFileDialog({ isOpen, onClose }: AddFileDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { currentProject, addFile, setError: setStoreError } = useProjectStore()
  const { openTab, updateTabContent } = useEditorStore()

  if (!currentProject) {
    return (
      <Modal isOpen={isOpen} title="Add File" onClose={onClose}>
        <div className="text-center py-4">
          <p className="text-sm text-slate-400">No project loaded</p>
          <p className="text-xs text-slate-500 mt-2">
            Create or open a project first
          </p>
        </div>
      </Modal>
    )
  }

  const handleAddFiles = async () => {
    setIsLoading(true)
    setError('')

    try {
      const filePaths = await FileService.openFile()
      if (!filePaths || filePaths.length === 0) {
        setIsLoading(false)
        return
      }

      // Create file objects and add to project
      for (const filePath of filePaths) {
        const fileName = filePath.split('\\').pop() || filePath
        const fileType = fileName.split('.').pop() || 'txt'

        // Read file content
        const fileContent = await FileService.readFile(filePath)

        const newFile = {
          id: `file-${Date.now()}-${Math.random()}`,
          projectId: currentProject.id,
          name: fileName,
          path: filePath,
          type: fileType as any,
          content: fileContent.success ? fileContent.content || '' : '',
          isDirty: false,
          size: fileContent.size || 0,
          lastModified: Date.now(),
        }

        addFile(newFile)

        // Open file in editor
        const tabId = `tab-${newFile.id}`
        openTab({
          id: tabId,
          fileId: newFile.id,
          name: newFile.name,
          isDirty: false,
        })

        // Load content into editor
        if (fileContent.success && fileContent.content) {
          updateTabContent(tabId, fileContent.content)
        }
      }

      onClose()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add files'
      setError(errorMsg)
      setStoreError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} title="Add File to Project" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-slate-800 rounded p-4 text-center">
          <p className="text-sm text-slate-100 mb-2">
            📁 {currentProject.name}
          </p>
          <p className="text-xs text-slate-400">
            Select mod files to add to your project
          </p>
        </div>

        <div className="bg-slate-800 border-2 border-dashed border-slate-600 rounded p-6 text-center">
          <p className="text-sm text-slate-300 mb-4">
            Supported formats:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['XML', 'STBL', 'TS4Script', 'Package', 'Python', 'JSON', 'CFG'].map(
              (format) => (
                <span
                  key={format}
                  className="px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded"
                >
                  {format}
                </span>
              )
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-500 rounded p-3">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

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
            type="button"
            variant="primary"
            isLoading={isLoading}
            onClick={handleAddFiles}
            className="flex-1"
          >
            Select Files
          </Button>
        </div>
      </div>
    </Modal>
  )
}
