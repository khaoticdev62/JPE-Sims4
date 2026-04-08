"use client";
import * as React from "react";
import { Terminal, Trash2, ChevronRight, Info, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { cn } from "../ui/utils";
import { usePlaygroundStore, SimulationLog } from "@/stores/usePlaygroundStore";
import { motion, AnimatePresence } from "../jpe-motion";

export const SimulationConsole: React.FC = () => {
  const { logs, clearLogs } = usePlaygroundStore();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  const getLogIcon = (type: SimulationLog["type"]) => {
    switch (type) {
      case "event": return <Zap className="w-3 h-3 text-amber-400" />;
      case "match": return <CheckCircle className="w-3 h-3 text-emerald-400" />;
      case "action": return <ChevronRight className="w-3 h-3 text-cyan-400" />;
      case "error": return <AlertTriangle className="w-3 h-3 text-rose-400" />;
      case "warn": return <AlertTriangle className="w-3 h-3 text-amber-500" />;
      default: return <Info className="w-3 h-3 text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-bgApp/50 border border-border rounded-lg overflow-hidden backdrop-blur-md shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-bgSurface/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan" />
          <span className="text-[10px] font-bold tracking-widest text-textPrimary uppercase">Simulation Feed</span>
        </div>
        <button 
          onClick={clearLogs}
          className="p-1 hover:bg-rose-500/10 rounded transition-colors text-textTertiary hover:text-rose-400"
          title="Clear Logs"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Logs Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1.5 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-textMuted opacity-50 space-y-2">
              <Terminal className="w-8 h-8 stroke-[1px]" />
              <p>Awaiting engine events...</p>
            </div>
          ) : (
            logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex gap-2 p-1.5 rounded-sm group transition-colors",
                  log.type === 'error' ? "bg-rose-500/5 text-rose-200 border-l-2 border-rose-500" :
                  log.type === 'match' ? "bg-emerald-500/5 text-emerald-200 border-l-2 border-emerald-500" :
                  "hover:bg-white/5 text-textSecondary"
                )}
              >
                <div className="mt-0.5 opacity-70">{getLogIcon(log.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <span className={cn(
                      "font-semibold uppercase text-[9px] tracking-tight opacity-50",
                      log.type === 'event' && "text-amber-400",
                      log.type === 'match' && "text-emerald-400",
                      log.type === 'action' && "text-cyan-400"
                    )}>
                      {log.type}
                    </span>
                    <span className="text-[9px] opacity-30">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="mt-0.5 leading-relaxed break-words">{log.message}</div>
                  {log.details && (
                    <div className="mt-1 p-2 bg-black/40 rounded border border-white/5 text-[10px] text-textTertiary italic">
                      {log.details}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer / Status */}
      <div className="px-3 py-1.5 bg-bgSurface/40 border-t border-border flex items-center gap-4 text-[9px] text-textTertiary">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>SIMULATOR ACTIVE</span>
        </div>
        <div className="ml-auto flex gap-3">
          <span>{logs.length} LOGS RECORDED</span>
        </div>
      </div>
    </div>
  );
};
