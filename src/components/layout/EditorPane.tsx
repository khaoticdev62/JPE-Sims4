import { useState, useEffect, useCallback } from 'react'
import MonacoEditor from '@/components/editor/MonacoEditor'
import EditorToolbar from '@/components/editor/EditorToolbar'
import { useEditorStore } from '@/stores/useEditorStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useFileLoader } from '@/hooks/useFileLoader'
import { useRealTimeValidation } from '@/hooks/useRealTimeValidation'
import { useEditorActions } from '@/hooks/useEditorActions'
import { CompilerService } from '@/services/CompilerService'
import { useActivityStore } from '@/stores/useActivityStore'
import { memo } from 'react'

function EditorPaneComponent() {
  const { tabs, activeTabId, setActiveTab, closeTab, editorContent, updateTabContent } =
    useEditorStore()
  const { getFile, updateFile, currentProject, saveFile } = useProjectStore()
  const { getDiagnosticsForFile } = useDiagnosticStore()
  const { addActivity } = useActivityStore()
  const { undo, redo, format, find, replace } = useEditorActions()
  const [isCompiling, setIsCompiling] = useState(false)

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
    if (!activeFile) return
    await saveFile(activeFile.id)
  }, [activeFile, saveFile])

  // Handle compilation
  const handleCompile = useCallback(async () => {
    if (!activeFile) return

    setIsCompiling(true)
    try {
      const result = await CompilerService.compileFile({
        ...activeFile,
        content: fileContent
      })

      if (result.success) {
        toast.success('Compiled successfully')
        
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
        const errorMsg = result.errors?.[0]?.message || 'Compilation failed'
        toast.error(`Compilation failed: ${errorMsg}`)
      }
    } catch (error) {
      toast.error(`Compilation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCompiling(false)
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
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      if (cmdOrCtrl && e.key === 's') {
        e.preventDefault()
        handleSaveFile()
      } else if (cmdOrCtrl && e.key === 'f') {
        e.preventDefault()
        find()
      } else if (cmdOrCtrl && e.key === 'h') {
        e.preventDefault()
        replace()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSaveFile, find, replace])

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
              onUndo={undo}
              onRedo={redo}
              onFormat={format}
              canUndo={true} // Monaco keeps track internally
              canRedo={true}
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
