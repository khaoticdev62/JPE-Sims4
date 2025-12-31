import { useState, useEffect, useMemo, useCallback } from 'react'
import MonacoEditor from '@/components/editor/MonacoEditor'
import EditorToolbar from '@/components/editor/EditorToolbar'
import { useEditorStore } from '@/stores/useEditorStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useFileLoader } from '@/hooks/useFileLoader'
import { useRealTimeValidation } from '@/hooks/useRealTimeValidation'
import { FileService } from '@/services/FileService'
import { CompilerService } from '@/services/CompilerService'
import { useActivityStore } from '@/stores/useActivityStore'
import { memo } from 'react'

function EditorPaneComponent() {
  const { tabs, activeTabId, setActiveTab, closeTab, editorContent, updateTabContent, markTabClean } =
    useEditorStore()
  const { getFile, updateFile, currentProject } = useProjectStore()
  const { getDiagnosticsForFile } = useDiagnosticStore()
  const { addActivity } = useActivityStore()
  const [isCompiling, setIsCompiling] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const activeTab = tabs.find((t) => t.id === activeTabId)
  const activeFile = activeTab ? getFile(activeTab.fileId) : null
  const fileContent = activeFile && activeTab ? editorContent[activeTab.id] || '' : ''

  // Load file content when tab changes
  useFileLoader(activeTab?.id ?? null, activeFile?.id ?? null)

  // Enable real-time validation
  useRealTimeValidation(activeFile?.id ?? null, fileContent || null)

  // Get diagnostics for current file
  const fileDiagnostics = activeFile ? getDiagnosticsForFile(activeFile.id) : []
  const errorCount = fileDiagnostics.filter((d) => d.severity === 'error').length
  const warningCount = fileDiagnostics.filter((d) => d.severity === 'warning').length

  // Handle file save
  const handleSaveFile = useCallback(async () => {
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
        setSaveMessage({ type: 'success', text: 'File saved' })
        setTimeout(() => setSaveMessage(null), 2000)
      } else {
        setSaveMessage({ type: 'error', text: `Save failed: ${result.error}` })
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: `Error saving file: ${error instanceof Error ? error.message : 'Unknown error'}` })
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }, [activeFile, activeTab, fileContent, currentProject, markTabClean, updateFile, addActivity])

  // Handle compilation
  const handleCompile = useCallback(async () => {
    if (!activeFile) return

    setIsCompiling(true)
    try {
      // For now, let's assume we compile XML to JPE or JPE to XML based on type
      let result
      if (activeFile.type === 'xml') {
        const output = CompilerService.convertToJPE(fileContent)
        result = { success: !!output, output, error: output ? undefined : 'Translation failed' }
      } else {
        const output = CompilerService.convertToXML(fileContent)
        result = { success: !!output, output, error: output ? undefined : 'Compilation failed' }
      }

      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Compiled successfully' })
        
        // Log activity
        if (currentProject) {
          addActivity({
            type: 'translated',
            fileName: activeFile.name,
            projectName: currentProject.name,
            projectId: currentProject.id,
          })
        }
      } else {
        setSaveMessage({ type: 'error', text: `Compilation failed: ${result.error}` })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: `Compilation error: ${error instanceof Error ? error.message : 'Unknown error'}` })
    } finally {
      setIsCompiling(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }, [activeFile, fileContent, currentProject, addActivity])

  const handleContentChange = useCallback((newContent: string) => {
    if (activeTab) {
      updateTabContent(activeTab.id, newContent)
      if (activeFile) {
        updateFile(activeFile.id, {
          isDirty: true,
        })
      }
    }
  }, [activeTab, activeFile, updateTabContent, updateFile])

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [setActiveTab])

  const handleCloseTab = useCallback((tabId: string) => {
    closeTab(tabId)
  }, [closeTab])

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
                  onClick={() => handleTabClick(tab.id)}
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
                      handleCloseTab(tab.id)
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
            {/* Toolbar Area */}
            <EditorToolbar
              onSave={handleSaveFile}
              onCompile={handleCompile}
              isSaving={false} // Would come from store if async
              isCompiling={isCompiling}
              isDirty={activeTab?.isDirty}
              className="border-b border-border-subtle"
            />

            {/* File info bar */}
            <div className="px-4 py-1 bg-bg-secondary border-b border-border-subtle text-[10px] text-text-secondary flex justify-between items-center">
              <div className="truncate max-w-[70%]">
                <span>{activeFile.path}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Type: {activeFile.type.toUpperCase()}</span>
                {saveMessage && (
                  <span className={`font-medium ${saveMessage.type === 'success' ? 'text-state-success' : 'text-state-error'}`}>
                    {saveMessage.text}
                  </span>
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
