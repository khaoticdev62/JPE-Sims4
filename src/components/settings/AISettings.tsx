"use client"

import * as React from "react"
import {
  X,
  Brain,
  Key,
  ExternalLink,
  ShieldCheck,
  Globe,
  Zap,
  Sparkles,
  Shield,
  Server,
  RefreshCw
} from "lucide-react"
import { AIProvider } from "@/services/ai/types"
import { useAIStore } from "@/stores/useAIStore"
import { toast } from "sonner"
import { cn } from "@/utils/cn"

interface AISettingsProps {
  isOpen: boolean
  onClose: () => void
}

const PROVIDERS = [
  { id: AIProvider.GEMINI, name: 'Google Gemini', icon: <Globe className="w-4 h-4" />, color: 'text-blue-400', link: 'https://aistudio.google.com/' },
  { id: AIProvider.CLAUDE, name: 'Anthropic Claude', icon: <Brain className="w-4 h-4" />, color: 'text-orange-400', link: 'https://console.anthropic.com/' },
  { id: AIProvider.OPENAI, name: 'OpenAI GPT', icon: <Zap className="w-4 h-4" />, color: 'text-emerald-400', link: 'https://platform.openai.com/' },
  { id: AIProvider.QWEN, name: 'Alibaba Qwen', icon: <Sparkles className="w-4 h-4" />, color: 'text-purple-400', link: 'https://dashscope.aliyun.com/' },
  { id: AIProvider.OLLAMA, name: 'Local Qwen (Ollama)', icon: <Server className="w-4 h-4" />, color: 'text-white', link: 'https://ollama.com/' },
]

export function AISettings({ isOpen, onClose }: AISettingsProps) {
  const { 
    activeProvider, 
    setProvider, 
    setApiKey, 
    apiKeyConfigured,
    clearCache,
    includeProjectContext,
    includeExternalSymbols,
    setContextSetting,
    usageStats,
    updateUsageStats
  } = useAIStore()

  React.useEffect(() => {
    if (isOpen) {
      updateUsageStats()
      const interval = setInterval(updateUsageStats, 5000)
      return () => clearInterval(interval)
    }
  }, [isOpen, activeProvider, updateUsageStats])

  const [localKey, setLocalKey] = React.useState("")

  const handleSaveKey = () => {
    if (localKey.trim()) {
      setApiKey(activeProvider, localKey)
      toast.success(`${activeProvider.toUpperCase()} Key Secured!`)
      setLocalKey("")
    }
  }

  const handleClearCache = () => {
    clearCache()
    toast.success("AI Cache Purged")
  }

  if (!isOpen) return null

  const currentProvider = PROVIDERS.find(p => p.id === activeProvider)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-jpe-surface border border-jpe-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col md:flex-row h-[700px] md:h-[600px]">
        
        {/* Sidebar - Provider Selection */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-jpe-border bg-jpe-bg/30 p-5 space-y-2">
          <div className="px-2 py-3 mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-jpe-muted opacity-50 italic">Standardized AI Layer</h3>
          </div>
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all border border-transparent",
                activeProvider === p.id 
                  ? "bg-jpe-primary/10 border-jpe-primary/20 text-jpe-primary shadow-sm shadow-jpe-primary/5" 
                  : "text-jpe-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <span className={activeProvider === p.id ? p.color : "text-jpe-muted"}>{p.icon}</span>
              {p.name}
              {activeProvider === p.id && (
                <div className="ml-auto w-2 h-2 rounded-full bg-jpe-primary shadow-[0_0_10px_rgba(var(--jpe-primary-rgb),0.5)]" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-jpe-surface">
          {/* Header */}
          <div className="px-8 py-6 border-b border-jpe-border/50 flex items-center justify-between bg-jpe-bg/20">
            <div>
              <h2 className="text-xl font-black tracking-tight text-white uppercase italic">Intelligence Core</h2>
              <p className="text-[10px] text-jpe-muted mt-1 uppercase font-bold tracking-widest opacity-60">
                Switching to {currentProvider?.name} Active Instance
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-white/5 text-jpe-muted hover:text-white transition-all shadow-inner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 flex-1 space-y-8 overflow-y-auto scrollbar-hide">
            
            {/* Server Status & Performance - Story 6.5 */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-jpe-muted flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Intelligence Core Metrics
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Latency */}
                <div className="bg-jpe-bg/40 border border-jpe-border rounded-2xl p-4 flex flex-col justify-between h-24">
                  <span className="text-[9px] font-black uppercase tracking-widest text-jpe-muted opacity-50">Avg Latency</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-jpe-primary tracking-tighter">
                      {usageStats?.averageResponseTime ? (usageStats.averageResponseTime / 1000).toFixed(2) : "0.00"}
                    </span>
                    <span className="text-[10px] font-bold text-jpe-muted uppercase">sec</span>
                  </div>
                </div>

                {/* Tokens */}
                <div className="bg-jpe-bg/40 border border-jpe-border rounded-2xl p-4 flex flex-col justify-between h-24">
                  <span className="text-[9px] font-black uppercase tracking-widest text-jpe-muted opacity-50 text-wrap">Daily Intelligence</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white tracking-tighter">
                      {usageStats?.totalTokensUsed || 0}
                    </span>
                    <span className="text-[10px] font-bold text-jpe-muted uppercase tracking-tight">tokens</span>
                  </div>
                </div>

                {/* Cache efficiency */}
                <div className="bg-jpe-bg/40 border border-jpe-border rounded-2xl p-4 flex flex-col justify-between h-24">
                  <span className="text-[9px] font-black uppercase tracking-widest text-jpe-muted opacity-50">Cache Hit Rate</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-emerald-400 tracking-tighter">
                      {Math.round((usageStats?.cacheHitRate || 0) * 100)}
                    </span>
                    <span className="text-[10px] font-bold text-jpe-muted uppercase">%</span>
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              <div className={cn(
                "rounded-2xl p-6 flex items-center justify-between transition-all border",
                apiKeyConfigured 
                  ? "bg-jpe-primary/5 border-jpe-primary/20" 
                  : "bg-emerald-500/5 border-emerald-500/20"
              )}>
                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center relative",
                    apiKeyConfigured ? "bg-jpe-primary/20" : "bg-emerald-500/20"
                  )}>
                    {apiKeyConfigured ? (
                      <>
                        <RefreshCw className="w-5 h-5 text-jpe-primary animate-spin-slow" />
                        <div className="absolute inset-0 rounded-xl border border-jpe-primary animate-ping opacity-20" />
                      </>
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  <div>
                    <h3 className={cn("text-xs font-black uppercase tracking-widest", apiKeyConfigured ? "text-jpe-primary" : "text-emerald-500")}>
                      {apiKeyConfigured ? `${currentProvider?.name} Instance Active` : "Local Handshake Active"}
                    </h3>
                    <p className="text-[10px] text-jpe-muted font-bold mt-0.5 uppercase tracking-wide">
                      {apiKeyConfigured 
                        ? `Secure multi-model integration layer online`
                        : "Inheriting system-wide AI credentials"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Context Tuning - Story 6.2 */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-jpe-muted flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Context Tuning
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setContextSetting('includeProjectContext', !includeProjectContext)}
                  className={cn(
                    "flex flex-col items-start p-5 rounded-2xl border transition-all text-left",
                    includeProjectContext 
                      ? "bg-jpe-primary/5 border-jpe-primary/30" 
                      : "bg-white/5 border-white/10 opacity-60 hover:opacity-100"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className={cn("w-4 h-4", includeProjectContext ? "text-jpe-primary" : "text-jpe-muted")} />
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", includeProjectContext ? "text-jpe-primary" : "text-jpe-muted")}>Project Context</span>
                  </div>
                  <p className="text-[9px] text-jpe-muted font-inter leading-relaxed">Inject open tabs and file structure into every AI request.</p>
                </button>

                <button
                  onClick={() => setContextSetting('includeExternalSymbols', !includeExternalSymbols)}
                  className={cn(
                    "flex flex-col items-start p-5 rounded-2xl border transition-all text-left",
                    includeExternalSymbols 
                      ? "bg-purple-500/5 border-purple-500/30" 
                      : "bg-white/5 border-white/10 opacity-60 hover:opacity-100"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Server className={cn("w-4 h-4", includeExternalSymbols ? "text-purple-400" : "text-jpe-muted")} />
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", includeExternalSymbols ? "text-purple-400" : "text-jpe-muted")}>External Symbols</span>
                  </div>
                  <p className="text-[9px] text-jpe-muted font-inter leading-relaxed">Cross-reference game interactions and STBL strings (High Token Usage).</p>
                </button>
              </div>
            </div>

            {/* Custom Key Intervention */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-jpe-muted flex items-center gap-2">
                  <Key className="w-3.5 h-3.5" />
                  Provider Authorization
                </label>
                <a href={currentProvider?.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-jpe-primary hover:underline flex items-center gap-1 uppercase italic tracking-wider">
                  Generate Token <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              <div className="relative group">
                <input 
                  type="password"
                  placeholder={activeProvider === AIProvider.OLLAMA ? "Local URL (Default: http://localhost:11434)" : `Enter your ${currentProvider?.name} key...`}
                  className="w-full bg-jpe-bg border border-jpe-border rounded-xl px-5 py-4 text-sm font-mono focus:ring-2 focus:ring-jpe-primary focus:border-transparent outline-none transition-all pr-32 shadow-inner"
                  value={localKey}
                  onChange={(e) => setLocalKey(e.target.value)}
                />
                <button 
                  onClick={handleSaveKey}
                  disabled={!localKey.trim()}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-jpe-primary rounded-lg text-[10px] font-black text-jpe-bg hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:grayscale disabled:opacity-40 uppercase tracking-widest"
                >
                  Apply Key
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleClearCache}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-jpe-muted hover:text-white transition-all hover:bg-white/10"
                >
                  <RefreshCw className="w-3 h-3" />
                  Purge Semantic Cache
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-jpe-bg/50 border-t border-jpe-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2 opacity-30">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">XOR-Obfuscated Local Storage</span>
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-jpe-muted hover:text-white border border-transparent hover:border-jpe-border"
            >
              Verify & Return
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
