"use client";
import { useState, useEffect, useCallback, useRef } from 'react'
import MonacoEditor from '@/components/editor/MonacoEditor'
import EditorToolbar from '@/components/editor/EditorToolbar'
import { LogicalStatusBar } from '@/components/statusbar/LogicalStatusBar'
import { useEditorStore } from '@/stores/useEditorStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useDiagnosticStore } from '@/stores/useDiagnosticStore'
import { useFileLoader } from '@/hooks/useFileLoader'
import { useRealTimeValidation } from '@/hooks/useRealTimeValidation'
import { useEditorActions } from '@/hooks/useEditorActions'
import { CompilerService } from '@/services/CompilerService'
import { STBLCompiler } from '@/engine/compilers/STBLCompiler'
import { ConfigCompiler } from '@/engine/compilers/ConfigCompiler'
import { FileService } from '@/services/FileService'
import { useActivityStore } from '@/stores/useActivityStore'
import { useUIStore } from '@/stores/useUIStore'
import { memo } from 'react'
import { toast } from 'sonner'
import { AssetList } from '@/components/editor/AssetList'
import ResourcePreviewer from '@/components/editor/ResourcePreviewer'
import WelcomeScreen from '@/components/editor/WelcomeScreen'
import { PackageService } from '@/services/PackageService'
import { SensoryOverlay } from '@/components/editor/SensoryOverlay'
import type { VirtualFile } from '@/services/PackageService'
import LiveXMLPreview from '@/components/preview/LiveXMLPreview'
import { useScrollSync } from '@/hooks/useScrollSync'

function EditorPaneComponent() {
  const { 
    tabs, activeTabId, setActiveTab, closeTab, editorContent, updateTabContent,
    showPreview, previewContent, previewOutOfDate, scrollSync, togglePreview
  } = useEditorStore()
  const { getFile, updateFile, currentProject, saveFile } = useProjectStore()
  const { getDiagnosticsForFile } = useDiagnosticStore()
  const { addActivity } = useActivityStore()
  const { undo, redo, format, find, replace } = useEditorActions()
  const { theme } = useUIStore()
  const [isCompiling, setIsCompiling] = useState(false)
  const [cursorLine, setCursorLine] = useState(1)
  const _monacoCursorHandler = useRef<any>(null)

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

  // Handle file save — compiles to native format if needed (Story 1.5/2.1.1)
  const handleSaveFile = useCallback(async () => {
    if (!activeFile) return

    let contentToSave = fileContent
    let binaryToSave: ArrayBuffer | null = null

    // If this is an XML file that was translated to JPE, compile back to XML
    if (activeFile.type === 'xml') {
      try {
        const compileResult = await CompilerService.compileWithPython(fileContent, activeFile.name)
        if (compileResult.success && compileResult.xml) {
          contentToSave = compileResult.xml
        } else {
          toast.error('Cannot save: JPE has compilation errors. Fix errors first.')
          return
        }
      } catch (error) {
        toast.error(`Compile failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        return
      }
    }

    // If this is an STBL file, compile JPE text back to binary STBL
    if (activeFile.type === 'stbl') {
      const compileResult = STBLCompiler.compile(fileContent)
      if (compileResult.success && compileResult.buffer) {
        binaryToSave = compileResult.buffer
        toast.success(`Compiled STBL: ${compileResult.metadata.entryCount} entries in ${compileResult.metadata.compileTime.toFixed(0)}ms`)
      } else {
        const errorMsg = compileResult.errors[0] || 'STBL compilation failed'
        toast.error(`Cannot save STBL: ${errorMsg}`)
        return
      }
    }

    // If this is a JSON file, compile JPE text back to JSON
    if (activeFile.type === 'json') {
      const originalContent = (activeFile as any)._originalContent
      if (originalContent) {
        try {
          // Try to parse editor content as JSON and re-stringify
          const parsed = JSON.parse(fileContent)
          contentToSave = JSON.stringify(parsed, null, 2)
        } catch {
          // If editor content is not valid JSON, save as-is
          contentToSave = fileContent
        }
      }
    }

    // If this is a CFG file, compile JPE text back to CFG format
    if (activeFile.type === 'cfg') {
      const compileResult = ConfigCompiler.compileToJpe(fileContent, 'cfg')
      if (compileResult.success && compileResult.content) {
        contentToSave = compileResult.content
        toast.success(`Compiled CFG in ${compileResult.metadata.compileTime.toFixed(0)}ms`)
      } else {
        const errorMsg = compileResult.errors[0] || 'CFG compilation failed'
        toast.error(`Cannot save CFG: ${errorMsg}`)
        return
      }
    }

    // For Python/TS4Script files, always save the original source (not edited JPE)
    // JPE view is read-only decompilation for understanding structure
    if (activeFile.type === 'py' || activeFile.type === 'ts4script') {
      const originalSource = (activeFile as any)._originalSource
      if (originalSource) {
        // Save original Python source, not the JPE display
        contentToSave = originalSource
      }
      // Fall through to normal save
    }

    // Update the file content in the project store before saving
    updateFile(activeFile.id, { content: contentToSave })

    // For STBL, save binary; for others, save text
    if (binaryToSave && activeFile.type === 'stbl') {
      const result = await FileService.writeFileBuffer(activeFile.path, binaryToSave)
      if (result?.success) {
        toast.success(`Saved: ${activeFile.name}`)
      } else {
        toast.error(`Failed to save: ${activeFile.name}`)
      }
    } else {
      await saveFile(activeFile.id)
      toast.success(`Saved: ${activeFile.name}`)
    }
  }, [activeFile, fileContent, updateFile, saveFile])

  // Handle Save All (Ctrl+Shift+S) — saves all dirty files (Story 1.5)
  const handleSaveAll = useCallback(async () => {
    const dirtyTabs = tabs.filter((t) => t.isDirty)
    if (dirtyTabs.length === 0) {
      toast.info('No unsaved changes')
      return
    }

    toast.info(`Saving ${dirtyTabs.length} file(s)...`)
    let failCount = 0

    for (const tab of dirtyTabs) {
      const file = getFile(tab.fileId)
      if (!file) continue

      let contentToSave = editorContent[tab.id] || file.content

      // Compile JPE→XML if needed
      if (file.type === 'xml') {
        try {
          const compileResult = await CompilerService.compileWithPython(contentToSave, file.name)
          if (compileResult.success && compileResult.xml) {
            contentToSave = compileResult.xml
          } else {
            failCount++
            continue
          }
        } catch {
          failCount++
          continue
        }
      }

      updateFile(file.id, { content: contentToSave })
      await saveFile(file.id)
    }

    const successCount = dirtyTabs.length - failCount
    if (failCount > 0) {
      toast.error(`${successCount} saved, ${failCount} failed`)
    } else {
      toast.success(`All ${successCount} file(s) saved`)
    }
  }, [tabs, getFile, editorContent, updateFile, saveFile])

  // Handle compilation
  const handleCompile = useCallback(async () => {
    if (!activeFile) return

    setIsCompiling(true)
    try {
      // Use Python engine for JPE→XML compilation (Story 1.2/1.4)
      const result = await CompilerService.compileWithPython(
        fileContent,
        activeFile.name
      )

      if (result.success && result.xml) {
        toast.success(`Compiled successfully in ${result.duration}ms`)

        // Set preview content
        useEditorStore.getState().setPreviewContent(result.xml)
        useEditorStore.getState().setPreviewOutOfDate(false)

        // Log activity
        if (currentProject) {
          addActivity({
            type: 'translated',
            fileName: activeFile.name,
            projectName: currentProject.name,
            projectId: currentProject.id})
        }
      } else {
        const errorMsg = result.errors?.[0]?.message || 'Compilation failed'
        toast.error(`Compilation failed: ${errorMsg}`)

        // Set diagnostics for errors
        if (result.errors?.length > 0) {
          useDiagnosticStore.getState().setDiagnosticsForFile(
            activeFile.id,
            result.errors.map((e: any, i: number) => ({
              id: `compile-${i}`,
              fileId: activeFile!.id,
              line: e.line || 1,
              column: e.column || 1,
              severity: e.severity || 'error',
              message: e.message,
              code: e.code || 'COMPILE_ERROR'}))
          )
        }
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
      // isDirty is now handled automatically by useEditorStore.updateTabContent
    }
  }, [activeTab, updateTabContent])

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [setActiveTab])

  const handleCloseTab = useCallback((tabId: string) => {
    closeTab(tabId)
  }, [closeTab])

  // Register centralized shortcuts via ShortcutService (Story 1.7)
  useEffect(() => {
    const { shortcutService, ShortcutScope } = require('@/services/editor/ShortcutService')
    
    shortcutService.register({
      id: 'editor.save',
      label: 'Save File',
      keys: ['Control', 's'],
      scope: ShortcutScope.EDITOR,
      categoryId: 'file',
      action: handleSaveFile
    })

    shortcutService.register({
      id: 'editor.find',
      label: 'Find',
      keys: ['Control', 'f'],
      scope: ShortcutScope.EDITOR,
      categoryId: 'edit',
      action: find
    })

    shortcutService.register({
       id: 'editor.replace',
       label: 'Replace',
       keys: ['Control', 'h'],
       scope: ShortcutScope.EDITOR,
       categoryId: 'edit',
       action: replace
    })
    
    shortcutService.register({
      id: 'editor.togglePreview',
      label: 'Toggle Live Preview',
      keys: ['Control', 'Alt', 'p'],
      scope: ShortcutScope.GLOBAL,
      categoryId: 'navigation',
      action: togglePreview
    })

    // Note: Undo/Redo are registered by MonacoEditor component directly
    // since they require the editor instance.

    return () => {
      shortcutService.unregister('editor.save')
      shortcutService.unregister('editor.find')
      shortcutService.unregister('editor.replace')
      shortcutService.unregister('editor.togglePreview')
    }
  }, [handleSaveFile, find, replace, togglePreview])

  // Story 3.2: Synchronized Scrolling Logic
  useScrollSync('source-editor', 'preview-editor', showPreview && scrollSync)

  return (
    <div data-testid="editor-pane" data-tutorial="editor-pane" className="flex-1 flex flex-col bg-bg-primary overflow-hidden">
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
                    aria-label={`Close ${tab.name} tab`}
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

            {/* Monaco Editor or Asset List */}
            <div data-testid="monaco-editor" className="flex-1 overflow-hidden bg-bg-primary flex">
              <div className={`flex-1 relative ${showPreview ? 'border-r border-border-subtle' : ''}`}>
                {activeFile.type === 'package' ? (
                  <AssetList
                    packagePath={activeFile.path}
                    onOpenResource={(resource) => {
                      const { openTab } = useEditorStore.getState()
                      openTab({
                        id: resource.id,
                        fileId: resource.id,
                        name: resource.name,
                        isDirty: false
                      })
                    }}
                    onExtractResource={async (resource: VirtualFile) => {
                      try {
                        const { activePackageBuffer } = useProjectStore.getState()
                        if (!activePackageBuffer) {
                          toast.error('Package buffer not loaded')
                          return
                        }
                        const data = await PackageService.extractResourceFast(
                          activeFile.path,
                          resource.resource,
                          activePackageBuffer
                        )
                        if (data) {
                          toast.success(`Extracted: ${resource.name} (${(data.byteLength / 1024).toFixed(1)}KB)`)
                        } else {
                          toast.error(`Failed to extract: ${resource.name}`)
                        }
                      } catch (error) {
                        toast.error(`Extract error: ${error instanceof Error ? error.message : 'Unknown error'}`)
                      }
                    }}
                    onExtractAll={async () => {
                      const { activePackageBuffer } = useProjectStore.getState()
                      if (!activePackageBuffer) {
                        toast.error('Package buffer not loaded')
                        return
                      }
                      const virtualFiles = PackageService.getVirtualFiles(activeFile.path)
                      let successCount = 0
                      let failCount = 0
  
                      for (const vf of virtualFiles) {
                        try {
                          const data = await PackageService.extractResourceFast(
                            activeFile.path,
                            vf.resource,
                            activePackageBuffer
                          )
                          if (data) successCount++
                          else failCount++
                        } catch {
                          failCount++
                        }
                      }
  
                      if (failCount > 0) {
                        toast.info(`Extracted ${successCount}/${virtualFiles.length} resources (${failCount} failed)`)
                      } else {
                        toast.success(`Extracted all ${successCount} resources`)
                      }
                    }}
                  />
                ) : activeFile.type === 'image' ? (
                  <ResourcePreviewer
                     id={activeFile.id}
                     name={activeFile.name}
                     type={activeFile.type}
                     content={fileContent}
                     resource={{
                       type: parseInt(activeFile.id.split('-')[0] || '0', 16),
                       group: parseInt(activeFile.id.split('-')[1] || '0', 16),
                       instanceHex: activeFile.id.split('-')[2]?.toUpperCase() || '0',
                       size: activeFile.size || 0,
                       isCompressed: false 
                     }}
                  />
                ) : (
                  <MonacoEditor
                    id="source-editor"
                    value={fileContent}
                    onChange={handleContentChange}
                    onCursorChange={setCursorLine}
                    language={
                      activeFile.type === 'jpe' ? 'jpe' :
                      (activeFile.type === 'py' || activeFile.type === 'ts4script') ? 'python' :
                      'xml'
                    }
                    theme={theme}
                    readOnly={false}
                    markers={fileDiagnostics.map((d) => ({
                      line: d.line || 1,
                      column: 1,
                      severity: d.severity as 'error' | 'warning' | 'info',
                      message: d.message}))}
                  />
                )}
                {/* Spectral Sensory Overlay (HUD) */}
                <SensoryOverlay />
              </div>

              {/* Story 3.2: Live XML Preview Panel */}
              {showPreview && activeFile.type !== 'package' && activeFile.type !== 'image' && (
                <LiveXMLPreview 
                  id="preview-editor"
                  className="w-1/2"
                  content={previewContent}
                  isOutOfDate={previewOutOfDate}
                />
              )}
            </div>

            {/* Logical Status Bar (JPE block context + diagnostics) */}
            <LogicalStatusBar
              content={fileContent}
              cursorLine={cursorLine}
              fileType={activeFile.type}
              errorCount={errorCount}
              warningCount={warningCount}
              lineCount={fileContent.split('\n').length}
              charCount={fileContent.length}
            />
          </div>
        ) : (
          <WelcomeScreen hasProject={!!currentProject} />
        )}
      </div>
    </div>
  )
}

export default memo(EditorPaneComponent)
