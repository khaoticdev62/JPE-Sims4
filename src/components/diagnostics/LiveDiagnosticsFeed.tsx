"use client";

import React, { useMemo } from 'react'
import { 
  Zap,
  Terminal,
  ExternalLink as _ExternalLink,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  Clock
} from 'lucide-react'
import { useLiveSyncStore, LiveLog } from '@/stores/useLiveSyncStore'
import { useLinkServer } from '@/hooks/useLinkServer'
import { useCodeFix } from '@/hooks/useCodeFix'
import { useProjectStore } from '@/stores/useProjectStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { _T } from '../robust/jpe-theme'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

/**
 * LiveDiagnosticsFeed (Story 13.1)
 * Real-time telemetry feed from the TS4 Spectral Bridge.
 */
export default function LiveDiagnosticsFeed() {
  const { logs, isConnected, clearLogs } = useLiveSyncStore()
  const { sendCommand } = useLinkServer()

  // Reverse logs to show newest at top
  const sortedLogs = useMemo(() => [...logs], [logs])

  const handleHotReload = async () => {
    toast.promise(
      sendCommand('RELOAD_ALL', {}),
      {
        loading: 'Injecting Spectral Pulse...',
        success: 'Engine Synchronized',
        error: 'Engine Injection Failed'
      }
    )
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-10">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
          <Terminal size={24} className="text-white/20" />
        </div>
        <div>
          <h3 className="text-xs font-black uppercase text-white tracking-[0.2em]">Bridge Offline</h3>
          <p className="text-[10px] text-white/40 mt-1">Waiting for TS4 Spectral Link handshake...</p>
        </div>
        <button 
          onClick={() => handleHotReload()}
          className="px-4 py-2 rounded border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── FEED ACTIONS ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan">Live Stream active</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleHotReload}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase text-white/60 hover:text-white transition-all"
          >
            <RefreshCcw size={10} />
            Hot Reload
          </button>
          <button 
            onClick={clearLogs}
            className="text-[9px] font-black uppercase text-white/30 hover:text-white transition-all ml-2"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ── LOG LIST ── */}
      <div className="flex-1 overflow-y-auto p-2 font-mono scrollbar-hide">
        {sortedLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full opacity-20 italic text-[10px]">
            Waiting for engine events...
          </div>
        ) : (
          sortedLogs.map((log) => (
            <LogItem key={log.id} log={log} />
          ))
        )}
      </div>
    </div>
  )
}

function LogItem({ log }: { log: LiveLog }) {
  const isException = log.severity === 'critical' || log.severity === 'error'
  const { requestFix } = useCodeFix()
  const { currentProject } = useProjectStore()
  const { openTab } = useEditorStore()

  const handleFixWithAI = () => {
    if (!log.traceback || !currentProject) return

    // 1. Traceback Parsing Logic
    // Pattern: File "...", line 123, in ...
    const lines = log.traceback.split('\n')
    let projectFrame = null

    // Scan backwards to find the last frame that matches a file in our project
    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i].match(/File "(.+)", line (\d+), in/)
      if (match) {
        const filePath = match[1]
        const lineNumber = parseInt(match[2], 10)
        
        // Find corresponding file in project
        const projectFile = currentProject.files.find(f => 
          f.path.toLowerCase().includes(filePath.toLowerCase()) || 
          filePath.toLowerCase().includes(f.name.toLowerCase())
        )

        if (projectFile) {
          projectFrame = { file: projectFile, line: lineNumber }
          break
        }
      }
    }

    if (!projectFrame) {
      toast.error("Source mapping failed. Exception outside project scope.")
      return
    }

    // 2. Navigation & AI Activation
    toast.info(`Mapping to ${projectFrame.file.name}:L${projectFrame.line}`)
    
    openTab({
      id: `tab-${projectFrame.file.id}`,
      fileId: projectFrame.file.id,
      name: projectFrame.file.name,
      isDirty: projectFrame.file.isDirty
    })

    // Trigger AI Fix Workflow
    requestFix({
      id: `engine-${log.id}`,
      fileId: projectFrame.file.id,
      line: projectFrame.line,
      column: 1,
      severity: 'error',
      message: log.message,
      code: log.exceptionType || 'ENGINE_ERROR',
      source: 'ai'
    })
  }

  return (
    <div className={cn(
      "mb-1 p-2 rounded border transition-all hover:bg-white/5 group",
      isException ? "bg-red-500/5 border-red-500/10" : "bg-white/[0.02] border-white/5"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {log.severity === 'critical' && <AlertCircle size={12} className="text-red-500" />}
            {log.severity === 'info' && <CheckCircle2 size={12} className="text-cyan" />}
            {log.severity === 'warn' && <AlertCircle size={12} className="text-amber-500" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                isException ? "text-red-500" : "text-white/60"
              )}>
                {log.exceptionType || log.severity}
              </span>
              <span className="text-[8px] text-white/20 flex items-center gap-1">
                <Clock size={8} />
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed font-mono">
              {log.message}
            </p>
            
            {log.traceback && (
              <div className="mt-3 p-2 bg-black/40 rounded border border-white/5 text-[10px] text-white/40 leading-normal max-h-32 overflow-y-auto scrollbar-hide">
                <pre>{log.traceback}</pre>
              </div>
            )}
          </div>
        </div>

        {log.traceback && (
          <button 
            onClick={handleFixWithAI}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase text-red-400 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
          >
            <Zap size={10} className="fill-current" />
            Flash Fix
          </button>
        )}
      </div>
    </div>
  )
}
