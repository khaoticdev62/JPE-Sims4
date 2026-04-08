"use client"

import * as React from "react"
import Editor, { Monaco } from "@monaco-editor/react"
import { useEditorStore } from "@/stores/useEditorStore"
import { useAIStore } from "@/stores/useAIStore"
import { useDiagnosticStore } from "@/stores/useDiagnosticStore"
import { Save, Code, Sparkles, Loader2, Brain, Zap, Globe, Server } from "lucide-react"
import { registerJPELanguage } from "@/utils/monaco-config"
import { AIServiceFactory } from "@/services/ai/AIServiceFactory"
import { AIProvider } from "@/services/ai/types"
import { ModFile } from "@/types/index"
import { toast } from "sonner"
import { ExportMenu } from "./ExportMenu"

const PROVIDER_ICONS = {
  [AIProvider.CLAUDE]: <Brain className="w-3.5 h-3.5 text-orange-400" />,
  [AIProvider.OPENAI]: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
  [AIProvider.GEMINI]: <Globe className="w-3.5 h-3.5 text-blue-400" />,
  [AIProvider.QWEN]: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
  [AIProvider.OLLAMA]: <Server className="w-3.5 h-3.5 text-white" />,
}

export function CodeEditor() {
  const {
    files,
    activeFileId,
    updateFileContent,
    setAIProcessing,
    addAIMessage,
    aiState
  } = useEditorStore()
  const { activeProvider } = useAIStore()
  const { getDiagnosticsForFile } = useDiagnosticStore()

  const activeFile = files.find((f: ModFile) => f.id === activeFileId)
  const editorRef = React.useRef<any>(null)
  const monacoRef = React.useRef<Monaco | null>(null)

  // Update markers when diagnostics change
  React.useEffect(() => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return
    const diagnostics = getDiagnosticsForFile(activeFile.id)
    const monaco = monacoRef.current
    const model = editorRef.current.getModel()
    if (!model) return

    const markers = diagnostics.map((d) => ({
      startLineNumber: d.line || 1,
      endLineNumber: d.line || 1,
      startColumn: d.column || 1,
      endColumn: (d.column || 1) + 1,
      message: d.message,
      severity: d.severity === 'error' ? monaco.MarkerSeverity.Error
        : d.severity === 'warning' ? monaco.MarkerSeverity.Warning
        : d.severity === 'info' ? monaco.MarkerSeverity.Info
        : monaco.MarkerSeverity.Hint,
    }))

    monaco.editor.setModelMarkers(model, 'jpe-validator', markers)
  }, [activeFile?.id, activeFile?.content, getDiagnosticsForFile])

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Add custom AI Fix action to context menu
    editor.addAction({
      id: 'jpe-ai-fix',
      label: `AI: Smart Fix with ${activeProvider?.toUpperCase()}`,
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: async (ed: any) => {
        const selection = ed.getSelection()
        const text = ed.getModel()?.getValueInRange(selection || { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }) || ed.getValue()
        handleSmartFix(text)
      }
    })
  }

  const handleSmartFix = async (contextText: string) => {
    const _currentProvider = activeProvider
    const currentFileId = activeFileId
    if (!activeFile || aiState.isProcessing) return

    setAIProcessing(true)
    try {
      const service = AIServiceFactory.getService(activeProvider)
      const result = await service.suggestFix(
        activeFile.content,
        activeFile.name,
        "Manual AI Fix Request",
        contextText
      )

      // [P3] Guard: Check if file still exists and is the same one after async await
      const stillActiveFile = useEditorStore.getState().files.find(f => f.id === currentFileId)
      if (!stillActiveFile) {
        console.warn("AI fix aborted: original file no longer exists or tab was closed.")
        return
      }

      if (result.success && result.fixedCode) {
        updateFileContent(stillActiveFile.id, result.fixedCode)
        addAIMessage({ 
          role: 'assistant', 
          content: `**[${activeProvider?.toUpperCase()} FIX]**\n\nI've fixed the code for you! Here's what I did: ${result.explanation}` 
        })
        toast.success(`${activeProvider?.toUpperCase()} fixed the logic!`)
      } else {
        toast.error(result.error || 'Failed to fix code')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'AI request failed'
      toast.error(message)
    } finally {
      setAIProcessing(false)
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    if (activeFileId && value !== undefined) {
      updateFileContent(activeFileId, value)
    }
  }

  return (
    <div className="flex flex-col h-full bg-jpe-bg">
      {/* Editor Toolbar */}
      <div className="flex flex-col border-b border-jpe-border bg-jpe-surface/30">
        <div className="flex items-center justify-between px-4 py-2 border-b border-jpe-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-jpe-muted uppercase tracking-widest">
              <Code className="w-3.5 h-3.5 text-jpe-primary" />
              Logic Editor
            </div>
            <div className="h-4 w-px bg-jpe-border" />
            <div className="flex items-center gap-1">
              {files.map((file: ModFile) => (
                <div 
                  key={file.id} 
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-t-md border-x border-t border-jpe-border cursor-pointer transition-all ${file.id === activeFileId ? "bg-jpe-bg text-jpe-primary border-jpe-primary/50" : "text-jpe-muted hover:bg-white/5"}`}
                >
                  {file.name}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleSmartFix(editorRef.current?.getValue() || "")}
              disabled={aiState.isProcessing}
              className="flex items-center gap-2 px-3 py-1 rounded-md bg-jpe-primary/10 text-jpe-primary text-[10px] font-bold border border-jpe-primary/20 hover:bg-jpe-primary/20 transition-all duration-fast ease-in-out disabled:opacity-50 mr-2 shadow-sm"
            >
              {aiState.isProcessing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                PROVIDER_ICONS[activeProvider as AIProvider]
              )}
              {activeProvider?.toUpperCase()} FIX
            </button>
            <ExportMenu />
            <button className="p-1.5 hover:bg-white/10 rounded-md text-jpe-muted hover:text-white transition-all duration-fast ease-in-out shadow-sm">
              <Save className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0 bg-[#0A0A0A]">
        <Editor
          height="100%"
          defaultLanguage={activeFile?.type === 'ts4script' || activeFile?.type === 'py' ? 'python' : 'xml'}
          value={activeFile?.content || ""}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          beforeMount={(monaco) => registerJPELanguage(monaco)}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', monospace",
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            lineNumbers: "on",
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            renderLineHighlight: "all",
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              verticalSliderSize: 6,
              horizontalSliderSize: 6,
            }
          }}
        />
      </div>
    </div>
  )
}
