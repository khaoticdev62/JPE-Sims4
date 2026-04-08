"use client";

import { useState, useCallback } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { FileService } from '@/services/FileService'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { FilePlus, X, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react'

/** Supported file extensions */
const SUPPORTED_EXTENSIONS = new Set([
  'xml', 'jpe', 'stbl', 'ts4script', 'package', 'py', 'json', 'cfg',
])

interface SelectedFile {
  path: string
  name: string
  extension: string
  supported: boolean
}

interface FileAddStatus {
  file: SelectedFile
  status: 'pending' | 'adding' | 'success' | 'failed'
  error?: string
}

interface AddFileDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddFileDialog({ isOpen, onClose }: AddFileDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [addStatuses, setAddStatuses] = useState<FileAddStatus[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const { currentProject, addFile, setError: setStoreError } = useProjectStore()
  const { openTab } = useEditorStore()

  /**
   * Check if a file extension is supported
   */
  const isExtensionSupported = useCallback((filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase() ?? ''
    return SUPPORTED_EXTENSIONS.has(ext)
  }, [])

  /**
   * Handle file selection from file picker
   */
  const handleSelectFiles = async () => {
    setError('')
    setSelectedFiles([])
    setAddStatuses([])
    setShowPreview(false)

    try {
      const filePaths = await FileService.openFile()
      if (!filePaths || filePaths.length === 0) {
        return
      }

      // Ensure filePaths is an array
      const paths = Array.isArray(filePaths) ? filePaths : [filePaths]

      const files: SelectedFile[] = paths.map((fp: string) => {
        const name = fp.split('/').pop()?.split('\\').pop() ?? fp
        const ext = name.split('.').pop()?.toLowerCase() ?? ''
        return {
          path: fp,
          name,
          extension: ext,
          supported: isExtensionSupported(name),
        }
      })

      setSelectedFiles(files)
      setShowPreview(true)

      // Check for unsupported files
      const unsupported = files.filter((f) => !f.supported)
      if (unsupported.length > 0) {
        setError(
          `Skipping ${unsupported.length} unsupported file(s): ${unsupported.map((f) => f.name).join(', ')}`
        )
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to select files'
      setError(errorMsg)
      setStoreError(errorMsg)
    }
  }

  /**
   * Remove a file from the selection list
   */
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  /**
   * Add all selected (supported) files to the project
   */
  const handleAddFiles = async () => {
    const supportedFiles = selectedFiles.filter((f) => f.supported)
    if (supportedFiles.length === 0) {
      setError('No supported files selected')
      return
    }

    setIsLoading(true)
    setError('')

    // Initialize statuses
    const statuses: FileAddStatus[] = supportedFiles.map((file) => ({
      file,
      status: 'pending' as const,
    }))
    setAddStatuses(statuses)

    let successCount = 0
    let failCount = 0

    // Add files one by one with progress
    for (let i = 0; i < supportedFiles.length; i++) {
      const sf = supportedFiles[i]

      // Update status to 'adding'
      setAddStatuses((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: 'adding' } : s))
      )

      try {
        const newFile = await addFile(sf.path)

        if (newFile) {
          // Open file in editor
          const tabId = `tab-${newFile.id}`
          openTab({
            id: tabId,
            fileId: newFile.id,
            name: newFile.name,
            isDirty: false,
          })

          setAddStatuses((prev) =>
            prev.map((s, idx) => (idx === i ? { ...s, status: 'success' } : s))
          )
          successCount++
        } else {
          setAddStatuses((prev) =>
            prev.map((s, idx) =>
              idx === i
                ? { ...s, status: 'failed', error: 'File could not be added' }
                : s
            )
          )
          failCount++
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setAddStatuses((prev) =>
          prev.map((s, idx) =>
            idx === i ? { ...s, status: 'failed', error: errorMsg } : s
          )
        )
        failCount++
      }
    }

    // Set final message
    if (failCount > 0) {
      setError(`${successCount} file(s) added, ${failCount} failed`)
    }

    setIsLoading(false)

    // Close after a brief delay to show results
    if (failCount === 0) {
      setTimeout(() => {
        setSelectedFiles([])
        setAddStatuses([])
        setShowPreview(false)
        onClose()
      }, 800)
    }
  }

  if (!currentProject) {
    return (
      <Modal isOpen={isOpen} title="Add File" onClose={onClose}>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <FilePlus className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-sm text-slate-300 mb-1">No project loaded</p>
          <p className="text-xs text-slate-500">
            Create or open a project first
          </p>
        </div>
      </Modal>
    )
  }

  const supportedCount = selectedFiles.filter((f) => f.supported).length
  const unsupportedCount = selectedFiles.filter((f) => !f.supported).length

  return (
    <Modal isOpen={isOpen} title="Add File to Project" onClose={onClose}>
      <div className="space-y-4">
        {/* Project Info */}
        <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <FilePlus className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-100 font-medium truncate">
              {currentProject.name}
            </p>
            <p className="text-xs text-slate-400">
              Select files to add to your project
            </p>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
            Supported Formats
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(SUPPORTED_EXTENSIONS).map((ext) => (
              <span
                key={ext}
                className="px-2 py-0.5 bg-slate-700/50 text-xs text-slate-300 rounded font-mono"
              >
                .{ext}
              </span>
            ))}
          </div>
        </div>

        {/* File Preview (after selection) */}
        {showPreview && selectedFiles.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
              Selected Files ({selectedFiles.length})
              {unsupportedCount > 0 && (
                <span className="text-yellow-400 ml-1">
                  • {unsupportedCount} unsupported
                </span>
              )}
            </p>

            <div className="space-y-1 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.path}-${index}`}
                  className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/30 rounded group"
                >
                  {file.supported ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  )}
                  <span className={`text-xs flex-1 truncate ${
                    file.supported ? 'text-slate-200' : 'text-slate-500 line-through'
                  }`}>
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Progress (during adding) */}
        {addStatuses.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
              Adding Files
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {addStatuses.map((item, index) => (
                <div
                  key={`status-${index}`}
                  className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/30 rounded"
                >
                  {item.status === 'pending' && (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 flex-shrink-0" />
                  )}
                  {item.status === 'adding' && (
                    <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin flex-shrink-0" />
                  )}
                  {item.status === 'success' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  )}
                  {item.status === 'failed' && (
                    <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  )}
                  <span className="text-xs flex-1 truncate text-slate-200">
                    {item.file.name}
                  </span>
                  {item.status === 'failed' && item.error && (
                    <span className="text-[10px] text-red-400 truncate max-w-[120px]" title={item.error}>
                      {item.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className={`p-3 rounded-lg border flex items-start gap-2 ${
            unsupportedCount > 0
              ? 'bg-yellow-950/30 border-yellow-700/50'
              : 'bg-red-950/30 border-red-700/50'
          }`}>
            <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              unsupportedCount > 0 ? 'text-yellow-400' : 'text-red-400'
            }`} />
            <p className={`text-xs ${
              unsupportedCount > 0 ? 'text-yellow-200' : 'text-red-200'
            }`}>
              {error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-800">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSelectedFiles([])
              setAddStatuses([])
              setShowPreview(false)
              setError('')
              onClose()
            }}
            disabled={isLoading}
            className="flex-1"
          >
            {showPreview ? 'Back' : 'Cancel'}
          </Button>
          {!showPreview ? (
            <Button
              type="button"
              variant="primary"
              isLoading={isLoading}
              onClick={handleSelectFiles}
              className="flex-1"
            >
              <FilePlus className="w-4 h-4 mr-1" />
              Select Files
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              isLoading={isLoading}
              onClick={handleAddFiles}
              disabled={supportedCount === 0}
              className="flex-1"
            >
              Add {supportedCount} File{supportedCount !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
