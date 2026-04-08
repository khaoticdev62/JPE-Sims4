"use client";
import * as React from "react";
import {
  Rocket, X, Terminal, CheckCircle2, AlertCircle,
  Loader2, Download, Package, Shield, Settings
} from "lucide-react";
import { motion} from "../jpe-motion";
import { cn } from "../ui/utils";
import { JpeBundlerService, BuildLog, BuildResult } from "@/services/JpeBundlerService";
import { useProjectStore } from "@/stores/useProjectStore";
import { FileService } from "@/services/FileService";

export interface BuildProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuildProgressModal({ isOpen, onClose }: BuildProgressModalProps) {
  const { currentProject } = useProjectStore();
  const [isBuilding, setIsBuilding] = React.useState(false);
  const [result, setResult] = React.useState<BuildResult | null>(null);
  const [logs, setLogs] = React.useState<BuildLog[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const runBuild = async () => {
    if (!currentProject) return;
    
    setIsBuilding(true);
    setResult(null);
    setLogs([{ timestamp: Date.now(), level: 'info', message: "Initializing Industrial Build Pipeline..." }]);

    // Small delay for UI animation feel
    await new Promise(r => setTimeout(r, 800));

    const buildResult = await JpeBundlerService.buildProject(currentProject);
    
    setResult(buildResult);
    setLogs(buildResult.logs);
    setIsBuilding(false);

    // If success, save the package to the exports folder
    if (buildResult.success && buildResult.packageBuffer) {
      try {
        const exportDir = `${currentProject.rootPath}/exports`;
        await FileService.createDirectory(exportDir);
        const fileName = `${currentProject.name.replace(/\s+/g, '_')}_v1.0. package`;
        await FileService.writeFile(
          `${exportDir}/${fileName}`, 
          new Uint8Array(buildResult.packageBuffer) as any
        );
      } catch (err) {
        console.error("Failed to save build to exports folder", err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-bgPanel border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ height: 500 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-amber/10 border border-amber/20">
              <Rocket className="w-6 h-6 text-amber" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase italic text-white leading-none">Industrial Bundler</h2>
              <p className="text-[10px] text-textMuted font-mono uppercase mt-1.5 tracking-tighter">Mod Package Generator • Stage 1</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-textMuted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
          
          {/* Status Display */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
               {isBuilding ? (
                 <Loader2 className="w-5 h-5 text-amber animate-spin" />
               ) : result?.success ? (
                 <CheckCircle2 className="w-5 h-5 text-emerald" />
               ) : result?.success === false ? (
                 <AlertCircle className="w-5 h-5 text-rose" />
               ) : (
                 <Package className="w-5 h-5 text-textMuted" />
               )}
               <div>
                  <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                    {isBuilding ? "BUILD_IN_PROGRESS" : result ? (result.success ? "BUILD_COMPLETE" : "BUILD_FAILED") : "AWAITING_TRIGGER"}
                  </div>
                  <div className="text-[9px] text-textMuted font-mono uppercase">
                    {currentProject?.name} • v1.0.0
                  </div>
               </div>
            </div>
            
            {!isBuilding && !result && (
              <button 
                onClick={runBuild}
                className="px-4 py-2 rounded-lg bg-amber text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center gap-2"
              >
                Start Build <Rocket size={14} />
              </button>
            )}
            
            {result?.success && (
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1.5 rounded-lg bg-emerald/10 border border-emerald/20 text-emerald text-[9px] font-bold uppercase flex items-center gap-1.5 hover:bg-emerald/20"
                >
                  <Download size={12} /> Local Copy
                </button>
                <button 
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-[9px] font-bold uppercase flex items-center gap-1.5 hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Logs Terminal */}
          <div className="flex-1 flex flex-col bg-black/60 border border-white/5 rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-textMuted" />
                <span className="text-[9px] font-bold text-textMuted uppercase tracking-widest">Compiler_Output</span>
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
                <div key={i} className="flex gap-3 leading-relaxed">
                  <span className="text-textMuted shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                  <span className={cn(
                    log.level === 'error' ? 'text-rose' : log.level === 'warn' ? 'text-amber' : 'text-cyanBright'
                  )}>
                    {log.level.toUpperCase().padEnd(5)}
                  </span>
                  <span className="text-textSecondary">{log.message}</span>
                </div>
              )) : (
                <div className="h-full flex items-center justify-center text-textMuted italic opacity-40">
                  Ready for industrial mod synthesis.
                </div>
              )}
              {isBuilding && (
                <div className="flex gap-3 animate-pulse">
                   <span className="text-textMuted shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                   <span className="text-amber">PROCESS</span>
                   <span className="text-amber italic">Sensing logic nodes...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[8px] text-textMuted font-mono uppercase tracking-widest opacity-60">
           <div className="flex items-center gap-4">
             <span className="flex items-center gap-1"><Shield size={10} /> DBPF v2.1 Verified</span>
             <span className="flex items-center gap-1"><Settings size={10} /> ZLIB Optimized</span>
           </div>
           <span>Powered by Spectral Mod Engine</span>
        </div>
      </motion.div>
    </div>
  );
}
