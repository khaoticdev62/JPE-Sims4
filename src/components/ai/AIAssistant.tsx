"use client"

import * as React from "react"
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  Trash2, 
  Brain,
  Zap,
  Globe,
  Loader2,
  ShieldCheck,
  Key,
  Server
} from "lucide-react"
import { useEditorStore } from "@/stores/useEditorStore"
import { useAIStore } from "@/stores/useAIStore"
import { AIServiceFactory } from "@/services/ai/AIServiceFactory"
import { AIProvider, AIMessage } from "@/services/ai/types"
import { ContextService } from "@/services/ai/ContextService"
import { SYSTEM_PROMPT_JPE_GENERATOR } from "@/services/ai/JPEGeneratorPrompt"
import { toast } from "sonner"
import ReactMarkdown from 'react-markdown'
import { cn } from "@/utils/cn"

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  [AIProvider.CLAUDE]: <Brain className="w-4 h-4 text-orange-400" />,
  [AIProvider.OPENAI]: <Zap className="w-4 h-4 text-emerald-400" />,
  [AIProvider.GEMINI]: <Globe className="w-4 h-4 text-blue-400" />,
  [AIProvider.QWEN]: <Sparkles className="w-4 h-4 text-purple-400" />,
  [AIProvider.OLLAMA]: <Server className="w-4 h-4 text-white" />,
}

export function AIAssistant() {
  const { addAIMessage, clearAIHistory, setAIProcessing, aiState } = useEditorStore()
  const { activeProvider, apiKeyConfigured, includeProjectContext } = useAIStore()
  const [input, setInput] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [aiState.messages])

  // 🧠 Story 6.4: Listen for External AI Explanations (Diagnostic Actions)
  const addMessageRef = React.useRef(addAIMessage)
  React.useEffect(() => {
    addMessageRef.current = addAIMessage
  }, [addAIMessage])

  React.useEffect(() => {
    const handleExplain = (e: any) => {
      const { text, title } = e.detail
      addMessageRef.current({ 
        role: 'assistant', 
        content: `### ${title}\n\n${text}` 
      })
    }

    window.addEventListener('jpe:ai-explain', handleExplain)
    return () => window.removeEventListener('jpe:ai-explain', handleExplain)
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || aiState.isProcessing) return

    const activeCode = useEditorStore.getState().editorContent[useEditorStore.getState().activeTabId || ""] || ""
    const userMessage: AIMessage = { role: 'user', content: input }
    
    addAIMessage(userMessage)
    setInput("")
    setAIProcessing(true)

    try {
      const service = AIServiceFactory.getService(activeProvider)
      
      // 🚀 Story 6.2: Build Context-Aware Message Chain with JPE Grammar
      let systemPrompt = SYSTEM_PROMPT_JPE_GENERATOR
      
      if (includeProjectContext) {
        const snapshot = ContextService.getProjectSnapshot()
        systemPrompt += `\n\n### ACTIVE ENVIRONMENT CONTEXT ###\n${ContextService.formatContextForAI(snapshot)}`
      } else {
        systemPrompt += `\n\n### ACTIVE FILE CONTEXT ###\n[START_FILE]\n${activeCode || "# Empty file"}\n[END_FILE]`
      }

      const messages: AIMessage[] = [
        { role: 'system', content: systemPrompt },
        ...aiState.messages,
        userMessage
      ]
      
      const result = await service.chat(messages)

      if (result.success && result.text) {
        addAIMessage({ role: 'assistant', content: result.text })
      } else {
        toast.error(result.error || "AI Response Failed")
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setAIProcessing(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-jpe-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-jpe-border bg-jpe-surface/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-jpe-primary/10 flex items-center justify-center border border-jpe-primary/20">
            {PROVIDER_ICONS[activeProvider as string]}
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white italic">
              Studio Intelligence ({activeProvider})
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              <span className="text-[8px] font-black uppercase tracking-widest text-jpe-muted opacity-60 flex items-center gap-1">
                {apiKeyConfigured ? <Key className="w-2 h-2 text-jpe-primary" /> : <ShieldCheck className="w-2 h-2 text-emerald-500" />}
                {apiKeyConfigured ? "Using Private Key Override" : "Secure System Handshake"}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearAIHistory}
          className="p-2 hover:bg-white/5 rounded-xl text-jpe-muted hover:text-red-400 transition-all border border-transparent hover:border-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide" ref={scrollRef}>
        {aiState.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8 space-y-4 opacity-50">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Bot className="w-8 h-8 text-jpe-primary/40" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-white uppercase italic tracking-widest">Awaiting Transmission...</p>
              <p className="text-[10px] text-jpe-muted leading-relaxed uppercase tracking-wider font-bold">
                JPE Studio Intelligence is ready. Ask anything about Sims 4 modding logic or JPE optimization.
              </p>
            </div>
          </div>
        ) : (
          aiState.messages.map((m: AIMessage, i: number) => (
            <div 
              key={i} 
              className={cn(
                "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 shadow-sm",
                m.role === 'user' 
                  ? "bg-white/5 border-white/10 text-white" 
                  : "bg-jpe-primary/10 border-jpe-primary/20 text-jpe-primary"
              )}>
                {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : PROVIDER_ICONS[activeProvider as string]}
              </div>
              <div className={cn(
                "flex flex-col max-w-[85%] space-y-1",
                m.role === 'user' ? 'items-end' : 'items-start'
              )}>
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-[11px] leading-relaxed font-medium shadow-sm",
                  m.role === 'user' 
                    ? "bg-white/5 text-white/90 border border-white/10 rounded-tr-none" 
                    : "bg-jpe-surface border border-jpe-border/50 text-white/90 rounded-tl-none"
                )}>
                  <div className={
                    m.role === 'user'
                      ? "prose prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-pre:m-0 prose-code:text-jpe-primary"
                      : "prose prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-pre:m-0 prose-code:text-jpe-primary"
                  }>
                    <ReactMarkdown
                      components={{
                        code({ node: _node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/i.exec(className || '')
                          const codeText = String(children).replace(/\n$/, '')
                          const isJpe = match && match[1].toLowerCase() === 'jpe'

                          if (!inline && isJpe) {
                            return (
                              <div className="group/code relative my-4">
                                <div className="absolute -top-3 right-2 flex items-center gap-1.5 opacity-0 group-hover/code:opacity-100 transition-all z-10">
                                  <button
                                    onClick={() => {
                                      useEditorStore.getState().insertCodeToActiveTab(codeText)
                                      toast.success("JPE Logic applied to editor")
                                    }}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-jpe-primary text-jpe-bg rounded-md text-[9px] font-black uppercase tracking-tighter hover:scale-105 active:scale-95 shadow-lg shadow-jpe-primary/20"
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    Apply to Editor
                                  </button>
                                </div>
                                <pre className="p-4 bg-black/40 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
                                  <code className={cn(className, "text-[10px]")} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              </div>
                            )
                          }

                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
                <span className="text-[8px] font-black text-jpe-muted uppercase tracking-widest opacity-40 px-1 italic">
                  {m.role === 'user' ? 'SENT' : `${activeProvider.toUpperCase()} PROTOCOL RESPONSE`}
                </span>
              </div>
            </div>
          ))
        )}
        {aiState.isProcessing && (
          <div className="flex gap-4 animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-xl bg-jpe-primary/10 border border-jpe-primary/20 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-jpe-primary animate-spin" />
            </div>
            <div className="p-3 bg-jpe-surface border border-jpe-border/50 rounded-2xl rounded-tl-none animate-pulse">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-jpe-primary/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-jpe-primary/40 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-jpe-primary/40 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-jpe-border bg-jpe-surface/30">
        <div className="relative flex items-center group">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder={`Ask ${activeProvider}...`}
            className="w-full bg-jpe-bg border border-jpe-border rounded-2xl px-5 py-4 text-[11px] font-bold focus:ring-1 focus:ring-jpe-primary/50 outline-none transition-all pr-14 shadow-inner resize-none min-h-[56px] focus:bg-jpe-bg/50"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim() || aiState.isProcessing}
            className="absolute right-2.5 p-2.5 bg-jpe-primary rounded-xl text-jpe-bg hover:scale-105 active:scale-95 transition-all shadow-lg disabled:grayscale disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-3 text-[8px] font-black uppercase text-jpe-muted text-center tracking-[0.2em] opacity-30 italic">
          JPE Studio Intelligence Protocol • v2.0 Multi-Model Engine
        </p>
      </div>
    </div>
  )
}
