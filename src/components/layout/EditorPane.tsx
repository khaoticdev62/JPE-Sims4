import { useState, useEffect, useMemo } from 'react'
import MonacoEditor from '@/components/editor/MonacoEditor'
import { useEditorStore } from '@/stores/useEditorStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useFileLoader } from '@/hooks/useFileLoader'
import { useRealTimeValidation } from '@/hooks/useRealTimeValidation'
import { FileService } from '@/services/FileService'
import { useActivityStore } from '@/stores/useActivityStore'
import { memo } from 'react'

function EditorPaneComponent() {
  const { tabs, activeTabId, setActiveTab, closeTab, editorContent, updateTabContent, markTabClean } =
    useEditorStore()
  const { getFile, updateFile, currentProject } = useProjectStore()
  const { getDiagnosticsForFile } = useDiagnosticStore()
  const { addActivity } = useActivityStore()
  const [editMode, setEditMode] = useState(true)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const activeTab = tabs.find((t) => t.id === activeTabId)
  const activeFile = activeTab ? getFile(activeTab.fileId) : null
  const fileContent = activeFile ? editorContent.get(activeTab!.id) || '' : ''

  // Load file content when tab changes
  useFileLoader(activeTab?.id ?? null, activeFile?.id ?? null)

  // Enable real-time validation
  useRealTimeValidation(activeFile?.id ?? null, fileContent || null)

  // Get diagnostics for current file
  const fileDiagnostics = activeFile ? getDiagnosticsForFile(activeFile.id) : []
  const errorCount = fileDiagnostics.filter((d) => d.severity === 'error').length
  const warningCount = fileDiagnostics.filter((d) => d.severity === 'warning').length

  // Handle file save
  const handleSaveFile = async () => {
    if (!activeFile || !activeTab) return

    try {
      const result = await FileService.writeFile(activeFile.path, fileContent)

      if (result.success) {
        // Mark tab as clean
        markTabClean(activeTab.id)

        // Update file metadata
        updateFile(activeFile.id, {
          isDirty: false,
          size: fileContent.length,
        })

        // Log activity
        if (currentProject) {
          addActivity({
            type: 'modified',
            fileName: activeFile.name,
            projectName: currentProject.name,
            projectId: currentProject.id,
          })
        }

        // Show save message
        setSaveMessage('File saved')
        setTimeout(() => setSaveMessage(null), 2000)
      } else {
        setSaveMessage(`Save failed: ${result.error}`)
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch (error) {
      setSaveMessage(`Error saving file: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const handleContentChange = (newContent: string) => {
    if (activeTab) {
      updateTabContent(activeTab.id, newContent)
      if (activeFile) {
        updateFile(activeFile.id, {
          content: newContent,
          isDirty: true,
        })
      }
    }
  }

  // Handle keyboard shortcuts (Ctrl+S to save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSaveFile()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeFile, activeTab, fileContent])

  return (
    <div data-testid="editor-pane" className="flex-1 flex flex-col bg-bg-primary overflow-hidden">
      {/* Editor Tabs */}
      <div className="h-10 bg-bg-secondary border-b border-border-subtle flex items-center overflow-x-auto">
        {tabs.length > 0 ? (
          <div className="flex">
            {tabs.map((tab) => {
              const tabFile = getFile(tab.fileId)
              const tabDiagnostics = getDiagnosticsForFile(tab.fileId)
              const tabErrorCount = tabDiagnostics.filter((d) => d.severity === 'error').length
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs border-r border-border-subtle whitespace-nowrap flex items-center gap-2 transition-colors ${
                    tab.id === activeTabId
                      ? 'bg-bg-tertiary text-text-primary'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
                  }`}
                  title={tabFile?.path}
                >
                  <span>{tab.name}</span>
                  {tabErrorCount > 0 && (
                    <span className="text-state-error text-xs font-bold">{tabErrorCount}</span>
                  )}
                  {tab.isDirty && <span className="text-state-warning">●</span>}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTab(tab.id)
                    }}
                    className="ml-1 text-text-secondary hover:text-text-primary"
                  >
                    ✕
                  </button>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-xs text-text-secondary px-4">No files open</div>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-bg-primary flex flex-col overflow-hidden">
        {activeFile ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* File header */}
            <div className="px-4 py-2 bg-bg-secondary border-b border-border-subtle text-xs text-text-secondary flex justify-between items-center">
              <div>
                <span>{activeFile.path}</span>
                <span className="ml-4">Type: {activeFile.type.toUpperCase()}</span>
                <span className="ml-4">{activeFile.size} bytes</span>
              </div>
              <div className="flex items-center gap-4">
                {(errorCount > 0 || warningCount > 0) && (
                  <div className="text-xs flex gap-4">
                    {errorCount > 0 && <span className="text-state-error">Errors: {errorCount}</span>}
                    {warningCount > 0 && <span className="text-state-warning">Warnings: {warningCount}</span>}
                  </div>
                )}
                {saveMessage && (
                  <span className={`text-xs ${saveMessage.includes('saved') ? 'text-state-success' : 'text-state-error'}`}>
                    {saveMessage}
                  </span>
                )}
                {activeTab?.isDirty && (
                  <button
                    onClick={handleSaveFile}
                    className="px-2 py-1 bg-accent-primary hover:bg-accent-focus text-text-primary rounded text-xs transition-colors"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>

            {/* Monaco Editor with syntax highlighting and validation */}
            <div data-testid="monaco-editor" className="flex-1 overflow-hidden bg-bg-primary">
              <MonacoEditor
                value={fileContent}
                onChange={handleContentChange}
                language={activeFile.type === 'jpe' ? 'jpe' : 'xml'}
                theme="dark"
                readOnly={false}
                markers={fileDiagnostics.map((d) => ({
                  line: d.line || 1,
                  column: 1,
                  severity: d.severity as 'error' | 'warning' | 'info',
                  message: d.message,
                }))}
              />
            </div>

            {/* Status bar */}
            <div className="h-6 bg-bg-secondary border-t border-border-subtle px-4 flex items-center justify-between text-xs text-text-secondary">
              <span>
                {errorCount > 0 && <span className="text-state-error">{errorCount} error{errorCount > 1 ? 's' : ''}</span>}
                {errorCount > 0 && warningCount > 0 && <span className="mx-2">•</span>}
                {warningCount > 0 && <span className="text-state-warning">{warningCount} warning{warningCount > 1 ? 's' : ''}</span>}
              </span>
              <span>
                {fileContent.split('\n').length} lines • {fileContent.length} characters
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-secondary">
            <div className="text-4xl mb-4">📄</div>
            <div className="text-sm mb-2">No file selected</div>
            <div className="text-xs">Click a file in the project tree to open it</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(EditorPaneComponent)
