import React from 'react'
import { Brain, ShieldCheck, Activity, AlertCircle } from 'lucide-react'
import { useAIEngine, OllamaProviderType } from '@/hooks/useAIEngine'
import { cn } from '@/utils/cn'

/**
 * AIEngineStatus Component
 * 
 * Premium bioluminescent indicator for the Local AI Engine state.
 * Integrated with Industrial Shielding (Story 6.6).
 */
export const AIEngineStatus: React.FC = () => {
  const { info, loading } = useAIEngine()

  if (loading || !info) {
    return (
      <div className="flex items-center gap-2 opacity-40 animate-pulse">
        <Brain size={12} />
        <span className="text-[9px] uppercase tracking-widest font-bold">AI Booting...</span>
      </div>
    )
  }

  const isReady = info.isRunning && info.isShielded
  const isSyncing = info.isRunning && !info.isShielded && info.provider === OllamaProviderType.SANDBOX
  const isError = !info.isRunning

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-2 py-0.5 rounded transition-all group cursor-default",
        isReady ? "text-emerald-400" : isSyncing ? "text-amber-400" : "text-red-400"
      )}
      title={`AI Engine: ${info.provider.toUpperCase()} (${info.port})\nShield: ${info.isShielded ? 'VERIFIED' : 'UNSTABLE'}`}
    >
      <div className="relative flex items-center justify-center">
        <Brain 
          size={14} 
          className={cn(
            "transition-all",
            isReady ? "drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" : 
            isSyncing ? "animate-pulse" : ""
          )} 
        />
        {isReady && (
          <ShieldCheck 
            size={8} 
            className="absolute -bottom-1 -right-1 text-emerald-300" 
          />
        )}
        {isError && (
          <AlertCircle 
            size={8} 
            className="absolute -bottom-1 -right-1 text-red-500" 
          />
        )}
      </div>

      <div className="flex flex-col items-start leading-none gap-0.5">
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">
          {isReady ? 'Shielded AI' : isSyncing ? 'Syncing...' : 'AI Offline'}
        </span>
        <div className="flex items-center gap-1 opacity-60">
          <Activity size={8} />
          <span className="text-[7px] font-mono tracking-tighter">
            {info.provider}:{info.port}
          </span>
        </div>
      </div>

      {/* Industrial Pulse Effect */}
      {isReady && (
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-20 ml-1" />
      )}
    </div>
  )
}
