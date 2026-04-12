"use client";
import * as React from "react";
import {
  Rocket, X, Terminal, CheckCircle2, AlertCircle,
  Loader2, Download, Package, Shield, Settings,
  Zap
} from "lucide-react";
import { motion, AnimatePresence as _AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { JpeBundlerService, BuildLog, BuildResult, BuildProgress } from "@/services/JpeBundlerService";
import { useProjectStore } from "@/stores/useProjectStore";
import { toast } from "sonner";
import { useUIStore } from "@/stores/useUIStore";

export interface ProjectExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectExportDialog({ isOpen, onClose }: ProjectExportDialogProps) {
  const { currentProject } = useProjectStore();
  const [isBuilding, setIsBuilding] = React.useState(false);
  const [result, setResult] = React.useState<BuildResult | null>(null);
  const [logs, setLogs] = React.useState<BuildLog[]>([]);
  const [progress, setProgress] = React.useState<BuildProgress | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { setPublishBuffer, setPublishProjectName, setPublishModOpen } = useUIStore();

  // Auto-scroll logs
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleProgress = (p: BuildProgress) => {
    setProgress(p);
    // Add progress message to logs if it's a new stage or significant
    setLogs(prev => [
      ...prev, 
      { timestamp: Date.now(), level: 'info', message: p.message }
    ]);
  };

  const runBuild = async () => {
    if (!currentProject) return;
    
    setIsBuilding(true);
    setResult(null);
    setLogs([]);
    setProgress({ stage: 'STARTING', progress: 0, message: "Initializing Industrial Build Pipeline..." });

    try {
      const buildResult = await JpeBundlerService.buildProject(currentProject, handleProgress);
      setResult(buildResult);
      setIsBuilding(false);
    } catch (err: any) {
      toast.error(`Build failed: ${err.message}`);
      setIsBuilding(false);
    }
  };

  const handleDownload = () => {
    if (!result?.packageBuffer || !currentProject) return;
    
    const packageName = `${currentProject.name.replace(/\s+/g, '_')}.package`;
    const blob = new Blob([result.packageBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = packageName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${packageName}`);
  };

  const handlePublishToRebels = () => {
    if (!result?.packageBuffer || !currentProject) return;
    
    setPublishBuffer(result.packageBuffer);
    setPublishProjectName(currentProject.name);
    setPublishModOpen(true);
    onClose(); // Close export dialog when moving to publish
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#0A0A0B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative"
        style={{ height: 500 }}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber/10 blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-cyan/10 border border-cyan/20">
              <Package className="w-6 h-6 text-cyanBright" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase italic text-white leading-none">Industrial Project Export</h2>
              <p className="text-[10px] text-textMuted font-mono uppercase mt-1.5 tracking-tighter">DBPF v2.1 Bundler • Spectral Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isBuilding}
            className="p-2 hover:bg-white/5 rounded-lg text-textMuted hover:text-white transition-colors disabled:opacity-20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
          
          {/* Status Display */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 {isBuilding ? (
                   <Loader2 className="w-5 h-5 text-cyanBright animate-spin" />
                 ) : result?.success ? (
                   <CheckCircle2 className="w-5 h-5 text-emerald" />
                 ) : result?.success === false ? (
                   <AlertCircle className="w-5 h-5 text-rose" />
                 ) : (
                   <Zap className="w-5 h-5 text-textMuted" />
                 )}
                 <div>
                    <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                      {isBuilding ? progress?.stage : result ? (result.success ? "BUILD_COMPLETE" : "BUILD_FAILED") : "AWAITING_TRIGGER"}
                    </div>
                    <div className="text-[9px] text-textMuted font-mono uppercase">
                      {currentProject?.name} • {result?.success ? "Ready for distribution" : "Validation Pending"}
                    </div>
                 </div>
              </div>
              
              {!isBuilding && !result && (
                <button 
                  onClick={runBuild}
                  className="px-4 py-2 rounded-lg bg-cyanBright text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
                >
                  Start Build <Rocket size={14} />
                </button>
              )}
              
              {result?.success && (
                <div className="flex gap-2">
                  <button 
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-lg bg-emerald text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-2"
                  >
                    <Download size={14} /> Download Package
                  </button>
                  <button 
                    onClick={handlePublishToRebels}
                    className="px-4 py-2 rounded-lg bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-cyanBright transition-all flex items-center gap-2 border border-white/20"
                  >
                    <Globe size={14} /> Publish to TS4Rebels
                  </button>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {(isBuilding || result) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[8px] font-mono text-textMuted uppercase tracking-widest">
                  <span>Progress</span>
                  <span>{progress?.progress || 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress?.progress || 0}%` }}
                    className="h-full bg-gradient-to-r from-cyan to-cyanBright"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Logs Terminal */}
          <div className="flex-1 flex flex-col bg-black/60 border border-white/5 rounded-xl overflow-hidden shadow-inner">
            <div className="px-4 py-2 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-textMuted" />
                <span className="text-[9px] font-bold text-textMuted uppercase tracking-widest">Build_Telemetry</span>
              </div>
              {result && (
                <span className="text-[9px] text-textMuted font-mono uppercase">
                  Duration: {result.duration}ms
                </span>
              )}
            </div>
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar font-mono text-[10px]"
            >
              {logs.length > 0 ? logs.map((log, i) => (
                <div key={i} className="flex gap-3 leading-relaxed opacity-80 hover:opacity-100 transition-opacity">
                  <span className="text-textMuted shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                  <span className={cn(
                    log.level === 'error' ? 'text-rose' : log.level === 'warn' ? 'text-amber' : 'text-cyanBright'
                  )}>
                    {log.level.toUpperCase().padEnd(5)}
                  </span>
                  <span className="text-textSecondary">{log.message}</span>
                </div>
              )) : (
                <div className="h-full flex items-center justify-center text-textMuted italic opacity-30 text-[11px] font-mono">
                  READY_FOR_SYNTHESIS
                </div>
              )}
              {isBuilding && (
                <div className="flex gap-3 animate-pulse">
                   <span className="text-textMuted shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                   <span className="text-cyanBright">PROCESS</span>
                   <span className="text-cyanBright italic">Extracting logic nodes...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-[8px] text-textMuted font-mono uppercase tracking-widest opacity-60">
           <div className="flex items-center gap-4">
             <span className="flex items-center gap-1"><Shield size={10} className="text-emerald" /> DBPF v2.1 Verified</span>
             <span className="flex items-center gap-1"><Settings size={10} className="text-cyanBright" /> ZLIB High-Ratio</span>
           </div>
           <span>Spectral Mod Engine v2.1</span>
        </div>
      </motion.div>
    </div>
  );
}
