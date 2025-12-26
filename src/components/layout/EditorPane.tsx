import { useState } from 'react'
import { useEditorStore } from '@stores/useEditorStore'
import { useProjectStore } from '@stores/useProjectStore'
import { useDiagnosticStore } from '@stores/useDiagnosticStore'
import { useFileLoader } from '@hooks/useFileLoader'
import { useRealTimeValidation } from '@hooks/useRealTimeValidation'

export default function EditorPane() {
  const { tabs, activeTabId, setActiveTab, closeTab, editorContent, updateTabContent } =
    useEditorStore()
  const { getFile, updateFile } = useProjectStore()
  const { getDiagnosticsForFile } = useDiagnosticStore()
  const [editMode, setEditMode] = useState(true)

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

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* Editor Tabs */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center overflow-x-auto">
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
                  className={`px-3 py-2 text-xs border-r border-slate-800 whitespace-nowrap flex items-center gap-2 transition-colors ${
                    tab.id === activeTabId
                      ? 'bg-slate-800 text-slate-100'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                  title={tabFile?.path}
                >
                  <span>{tab.name}</span>
                  {tabErrorCount > 0 && (
                    <span className="text-red-500 text-xs font-bold">{tabErrorCount}</span>
                  )}
                  {tab.isDirty && <span className="text-yellow-500">●</span>}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeTab(tab.id)
                    }}
                    className="ml-1 text-slate-500 hover:text-slate-300"
                  >
                    ✕
                  </button>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-xs text-slate-500 px-4">No files open</div>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden">
        {activeFile ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* File header */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 flex justify-between items-center">
              <div>
                <span>{activeFile.path}</span>
                <span className="ml-4">Type: {activeFile.type.toUpperCase()}</span>
                <span className="ml-4">{activeFile.size} bytes</span>
              </div>
              {(errorCount > 0 || warningCount > 0) && (
                <div className="text-xs flex gap-4">
                  {errorCount > 0 && <span className="text-red-400">Errors: {errorCount}</span>}
                  {warningCount > 0 && <span className="text-yellow-400">Warnings: {warningCount}</span>}
                </div>
              )}
            </div>

            {/* Editor content area with line numbers and editable textarea */}
            <div className="flex-1 overflow-auto bg-slate-950 flex font-mono text-xs">
              {/* Line numbers gutter */}
              <div className="bg-slate-900 text-slate-600 px-3 py-4 select-none border-r border-slate-800 overflow-hidden">
                {fileContent.split('\n').map((_, lineIndex) => (
                  <div key={lineIndex} className="leading-relaxed h-5">
                    {lineIndex + 1}
                  </div>
                ))}
              </div>

              {/* Editable content area */}
              <div className="flex-1 relative">
                <textarea
                  value={fileContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="absolute inset-0 w-full h-full p-4 bg-slate-950 text-slate-300 font-mono text-xs resize-none outline-none focus:outline-none whitespace-pre focus:ring-0 focus:border-0"
                  spellCheck="false"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                />

                {/* Error/Warning indicators overlay */}
                {fileDiagnostics.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {fileDiagnostics.map((diagnostic, diagIndex) => {
                      if (diagnostic.line <= 0) return null
                      const lines = fileContent.split('\n')
                      const lineNumber = diagnostic.line
                      if (lineNumber > lines.length) return null

                      return (
                        <div
                          key={diagIndex}
                          className={`absolute left-0 right-0 h-5 border-l-2 ${
                            diagnostic.severity === 'error'
                              ? 'border-red-500 bg-red-500 bg-opacity-10'
                              : 'border-yellow-500 bg-yellow-500 bg-opacity-10'
                          }`}
                          style={{
                            top: `${lineNumber * 1.25}rem + 1rem`, // 1rem for padding
                          }}
                          title={diagnostic.message}
                        />
                      )
                    })}
                  </div>
                )}

                {/* Placeholder for empty files */}
                {!fileContent && (
                  <div className="absolute inset-0 p-4 text-slate-500 pointer-events-none">
                    <span>No content loaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status bar */}
            <div className="h-6 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400">
              <span>
                {errorCount > 0 && <span className="text-red-500">{errorCount} error{errorCount > 1 ? 's' : ''}</span>}
                {errorCount > 0 && warningCount > 0 && <span className="mx-2">•</span>}
                {warningCount > 0 && <span className="text-yellow-500">{warningCount} warning{warningCount > 1 ? 's' : ''}</span>}
              </span>
              <span>
                {fileContent.split('\n').length} lines • {fileContent.length} characters
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="text-4xl mb-4">📄</div>
            <div className="text-sm mb-2">No file selected</div>
            <div className="text-xs">Click a file in the project tree to open it</div>
          </div>
        )}
      </div>
    </div>
  )
}
