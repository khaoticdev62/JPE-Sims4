"use client"

import * as React from "react"
import Editor from "@monaco-editor/react"
import { useEditorStore } from "@/stores/useEditorStore"
import { useAIStore } from "@/stores/useAIStore"
import { AIServiceFactory } from "@/services/ai/AIServiceFactory"
import { toast } from "sonner"
import { 
  Terminal,
  Activity,
  CheckCircle2,
  Brain,
  Loader2,
  Copy,
  Zap,
  Globe,
  Sparkles,
  Server
} from "lucide-react"
import { AIProvider } from "@/services/ai/types"

const PROVIDER_ICONS = {
  [AIProvider.CLAUDE]: <Brain className="w-3.5 h-3.5 text-orange-400" />,
  [AIProvider.OPENAI]: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
  [AIProvider.GEMINI]: <Globe className="w-3.5 h-3.5 text-blue-400" />,
  [AIProvider.QWEN]: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
  [AIProvider.OLLAMA]: <Server className="w-3.5 h-3.5 text-white" />,
}

export function XMLPreview() {
  const { previewContent, activeFileId, files, setAIProcessing, addAIMessage, aiState } = useEditorStore()
  const { activeProvider } = useAIStore()
  const activeFile = files.find(f => f.id === activeFileId)

  const handleAIExplain = async () => {
    if (!activeFile || aiState.isProcessing) return

    setAIProcessing(true)
    try {
      const service = AIServiceFactory.getService(activeProvider)
      const result = await service.explainMod(activeFile.content, activeFile.name)
      
      if (result.success && result.explanation) {
        const keyFields = Array.isArray(result.explanation.keyFields) ? result.explanation.keyFields : []
        const effects = Array.isArray(result.explanation.effects) ? result.explanation.effects : []
        const response = `**[${activeProvider.toUpperCase()} ANALYSIS]**\n\n**Overview**: ${result.explanation.overview}\n\n**Purpose**: ${result.explanation.purpose}\n\n**Key Fields**:\n${keyFields.map((f: string) => `- ${f}`).join('\n')}\n\n**Effects**:\n${effects.map((e: string) => `- ${e}`).join('\n')}`
        addAIMessage({ role: 'assistant', content: response })
        toast.success(`${activeProvider.toUpperCase()} analysis complete!`)
      } else {
        toast.error(result.error || 'Failed to explain file')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'AI request failed'
      toast.error(message)
    } finally {
      setAIProcessing(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(previewContent)
      .then(() => toast.success("XML copied to clipboard"))
      .catch(() => toast.error("Failed to copy — clipboard access denied"))
  }

  return (
    <div className="flex flex-col h-full bg-jpe-bg border-l border-jpe-border">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-jpe-border bg-jpe-surface/30">
        <div className="flex items-center gap-2 text-xs font-bold text-jpe-muted uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5 text-jpe-secondary" />
          XML Preview
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleAIExplain}
            disabled={aiState.isProcessing}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-jpe-primary/10 text-jpe-primary text-[10px] font-bold border border-jpe-primary/20 hover:bg-jpe-primary/20 transition-all disabled:opacity-50"
          >
            {aiState.isProcessing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              PROVIDER_ICONS[activeProvider as AIProvider]
            )}
            Analyze with {activeProvider.toUpperCase()}
          </button>
          <button 
            onClick={handleCopy}
            className="p-1.5 hover:bg-white/10 rounded-md text-jpe-muted hover:text-white transition-all shadow-sm"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Stats Bar */}
      <div className="flex items-center gap-4 px-4 py-1.5 bg-jpe-bg/50 border-b border-jpe-border text-[10px] text-jpe-muted uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span className="font-medium text-emerald-500/80">Valid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-jpe-primary" />
          <span className="font-medium">Direct Transform</span>
        </div>
        <div className="ml-auto font-mono text-[9px] opacity-60">
          {activeFile?.name.replace(".jpe", ".xml")}
        </div>
      </div>

      {/* Read-only Monaco XML Editor */}
      <div className="flex-1 min-h-0 bg-[#0A0A0A]">
        <Editor
          height="100%"
          defaultLanguage="xml"
          value={previewContent}
          theme="vs-dark"
          options={{
            readOnly: true,
            fontSize: 13,
            lineNumbers: "on",
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: "all",
            wordWrap: "on",
            fontFamily: "'Fira Code', monospace",
            renderWhitespace: "none",
            scrollbar: {
              vertical: "visible",
              horizontal: "auto",
              verticalSliderSize: 4,
              horizontalSliderSize: 4
            }
          }}
        />
      </div>
    </div>
  )
}
