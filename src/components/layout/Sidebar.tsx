import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useUIStore } from '@/stores/useUIStore'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { CompilerService } from '@/services/CompilerService'
import FileTree from '@/components/file-tree/FileTree'
import { memo, useCallback } from 'react'
import type { ModFile } from '@/types/index'

function SidebarComponent() {
  const { currentProject, removeFile, renameFile } = useProjectStore()
  const { openTab } = useEditorStore()
  const { sidebarCollapsed, focusedPane, setFocusedPane } = useUIStore()
  const { setDiagnosticsForFile } = useDiagnosticStore()

  const isFocused = focusedPane === 'sidebar'

  const handleOpenFile = useCallback(
    (file: ModFile) => {
      openTab({
        id: `tab-${file.id}`,
        fileId: file.id,
        name: file.name,
        isDirty: false,
      })
    },
    [openTab]
  )

  const handleValidateFile = useCallback(
    async (file: ModFile) => {
      try {
        const result = await CompilerService.validateFile(file)
        setDiagnosticsForFile(file.id, result.diagnostics)
      } catch (error) {
        console.error('Failed to validate file:', error)
      }
    },
    [setDiagnosticsForFile]
  )

  const handleDeleteFile = useCallback(
    async (file: ModFile) => {
      if (confirm(`Delete file "${file.name}"?`)) {
        try {
          await removeFile(file.id)
        } catch (error) {
          console.error('Failed to delete file:', error)
        }
      }
    },
    [removeFile]
  )

  const handleRenameFile = useCallback(async (file: ModFile) => {
    const newName = prompt(`Rename file to:`, file.name)
    if (newName && newName !== file.name) {
      try {
        await renameFile(file.id, newName)
      } catch (error) {
        console.error('Failed to rename file:', error)
      }
    }
  }, [renameFile])

  if (sidebarCollapsed) {
    return (
      <div
        className={`w-12 bg-background-secondary border-r border-border-subtle flex flex-col items-center py-4 transition-all duration-200 ${
          isFocused ? 'ring-1 ring-accent-primary ring-inset' : ''
        }`}
        onClick={() => setFocusedPane('sidebar')}
      >
        <div className="text-xs text-text-secondary">Files</div>
      </div>
    )
  }

  return (
    <div
      className={`w-64 bg-background-secondary border-r border-border-subtle flex flex-col overflow-hidden transition-all duration-200 ${
        isFocused ? 'ring-1 ring-accent-primary ring-inset' : ''
      }`}
      onClick={() => setFocusedPane('sidebar')}
    >
      <div className="h-12 border-b border-border-subtle flex items-center px-4">
        <h2 className="text-sm font-semibold text-text-primary">
          {currentProject?.name ? 'Project Files' : 'No Project'}
        </h2>
        {currentProject?.files && currentProject.files.length > 0 && (
          <span className="ml-auto text-xs bg-background-tertiary text-text-secondary px-2 py-1 rounded">
            {currentProject.files.length}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {currentProject && currentProject.files.length > 0 ? (
          <FileTree
            onOpenFile={handleOpenFile}
            onValidateFile={handleValidateFile}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
          />
        ) : (
          <div className="p-4 text-xs text-text-secondary text-center whitespace-pre-wrap">
            {currentProject
              ? 'No files in project\nUse File → Add File to add mods'
              : 'No project loaded\nUse File → New Project to start'}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(SidebarComponent)
