import React from 'react'
import { useBuildStore } from '@/stores/useBuildStore'
import { Zap, Cpu, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Story 4.5: High-Performance Parallel Build Overlay
 * A premium, full-screen overlay for building projects with multi-core visibility.
 */
export function BuildProgressOverlay() {
  const { buildStatus, progress, currentFile, results, errors } = useBuildStore()

  if (buildStatus === 'idle') return null

  const isPacking = progress > 90 && buildStatus === 'running';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#070810]/95 backdrop-blur-xl animate-in fade-in duration-500">
      {/* Background Pulse */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative w-full max-w-2xl bg-[#0a0c10] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              buildStatus === 'running' ? "bg-emerald-500/10 text-emerald-500" :
              buildStatus === 'completed' ? "bg-emerald-500/20 text-emerald-400" :
              "bg-red-500/10 text-red-500"
            )}>
              {buildStatus === 'running' && <Loader2 className="w-4 h-4 animate-spin" />}
              {buildStatus === 'completed' && <CheckCircle2 className="w-4 h-4" />}
              {buildStatus === 'failed' && <AlertCircle className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Spectral Build Engine</h3>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {isPacking ? 'Industrial Packing & Compression' :
                 buildStatus === 'running' ? 'Compiling Multi-Core Architecture' :
                 buildStatus === 'completed' ? 'Build Successful' : 'Build Failed'}
              </p>
            </div>
          </div>

          {buildStatus === 'running' && (
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
              <Cpu className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                Accelerated Core Pool Active
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Main Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Global Progress</span>
                <div className="text-2xl font-black text-white font-mono tabular-nums">
                  {Math.round(progress)}<span className="text-emerald-500/50 text-sm ml-1">%</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active File</span>
                <div className="text-xs text-emerald-400 font-mono truncate max-w-[300px]">
                  {currentFile || '--'}
                </div>
              </div>
            </div>

            {/* Premium Progress Bar */}
            <div className="h-3 w-full bg-black/40 rounded-full border border-white/5 p-0.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-500 rounded-full transition-all duration-300 relative"
                style={{ width: `${progress}%` }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-white/10 blur-sm" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-400 rounded-full blur-md opacity-40 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Results Area */}
          {(buildStatus === 'completed' || buildStatus === 'failed') && (
            <div className="grid grid-cols-3 gap-4 animate-in slide-in-from-bottom-4 duration-500">
               <ResultCard 
                label="Files Processed" 
                value={results?.filesProcessed || 0} 
                icon={<Zap className="w-3.5 h-3.5" />}
                color="emerald"
              />
              <ResultCard 
                label="Total Time" 
                value={`${((results?.buildTime || 0) / 1000).toFixed(2)}s`} 
                icon={<Loader2 className="w-3.5 h-3.5" />}
                color="blue"
              />
              <ResultCard 
                label="Throughput" 
                value={`${results?.throughput?.toFixed(1) || 0} f/s`} 
                icon={<Cpu className="w-3.5 h-3.5" />}
                color="amber"
              />
            </div>
          )}

          {/* Error List */}
          {errors.length > 0 && (
            <div className="max-h-40 overflow-y-auto border border-red-500/20 bg-red-500/5 rounded-xl p-4 space-y-2">
              <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">Build Errors Detected</h4>
              {errors.slice(0, 5).map((err, i) => (
                <div key={i} className="text-[11px] text-red-300 flex items-start gap-2">
                  <span className="font-mono text-red-500/50">[{err.code}]</span>
                  {err.message}
                </div>
              ))}
              {errors.length > 5 && (
                <div className="text-[10px] text-red-500/50 italic">...and {errors.length - 5} more</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/30 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[9px] text-slate-500 font-mono">
            BUILD ARCHITECTURE V4.5 // PROJECT IDENTIFIER: JPE-STUDIO-CORE
          </p>
          {(buildStatus === 'completed' || buildStatus === 'failed') && (
            <button 
              onClick={() => useBuildStore.getState().resetBuild()}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase rounded-lg transition-all"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultCard({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: string }) {
  const colors: any = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  }
  
  return (
    <div className={cn("p-4 rounded-xl border", colors[color])}>
      <div className="flex items-center gap-2 mb-2 opacity-60">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-lg font-black font-mono tracking-tight text-white">{value}</div>
    </div>
  )
}
