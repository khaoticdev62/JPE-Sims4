"use client";
import * as React from "react";
import { X, CheckCircle, AlertCircle, Loader2, Package, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { cn } from "./ui/utils";
import { T } from "./robust/jpe-theme";

interface BuildProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "idle" | "building" | "success" | "error";
  steps: Array<{ label: string; status: "pending" | "active" | "complete" | "error" }>;
}

export const BuildProgressModal: React.FC<BuildProgressModalProps> = ({ 
  isOpen, 
  onClose, 
  status, 
  steps 
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 flex items-center justify-center p-6 backdrop-blur-md bg-black/60"
        style={{ zIndex: T.zModal }}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-bgSurface/90 border border-border shadow-[0_0_50px_-12px_rgba(34,211,238,0.3)] rounded-2xl overflow-hidden"
        >
          {/* Industrial Header */}
          <header className="p-6 border-b border-border bg-gradient-to-r from-bgSurface to-cyan/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                status === "building" ? "bg-cyan/10 text-cyan animate-pulse" : 
                status === "success" ? "bg-emerald/10 text-emerald" : 
                status === "error" ? "bg-rose/10 text-rose" : "bg-white/5 text-textTertiary"
              )}>
                {status === "building" ? <Zap className="w-5 h-5" /> : <Package className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-widest text-white uppercase italic">
                  Industrial Build Loop
                </h2>
                <div className="text-[10px] text-textTertiary font-mono tracking-tighter uppercase opacity-70">
                  {status === "building" ? "Engine Synthesis Active" : "Cycle Concluded"}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              disabled={status === "building"}
              className="p-2 hover:bg-white/5 rounded-lg text-textTertiary transition-colors disabled:opacity-30"
            >
              <X className="w-4 h-4" />
            </button>
          </header>

          {/* Build Pipeline Steps */}
          <div className="p-6 space-y-4 bg-bgSurface/40">
            {steps.map((step, idx) => (
              <div 
                key={idx}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl border transition-all duration-300",
                  step.status === "active" ? "bg-white/5 border-cyan/30 shadow-[0_0_20px_-10px_rgba(34,211,238,0.2)]" :
                  step.status === "complete" ? "bg-emerald/5 border-emerald/20 opacity-80" : 
                  "bg-transparent border-transparent opacity-40"
                )}
              >
                <div className="relative">
                  {step.status === "active" ? (
                    <Loader2 className="w-4 h-4 text-cyan animate-spin" />
                  ) : step.status === "complete" ? (
                    <CheckCircle className="w-4 h-4 text-emerald" />
                  ) : step.status === "error" ? (
                    <AlertCircle className="w-4 h-4 text-rose" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-textTertiary/30" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={cn(
                    "text-[11px] font-bold tracking-wide uppercase transition-colors",
                    step.status === "active" ? "text-cyan" : 
                    step.status === "complete" ? "text-emerald" : "text-textTertiary"
                  )}>
                    {step.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status Footer */}
          <footer className="p-6 border-t border-border bg-black/20">
            {status === "building" ? (
              <div className="space-y-4">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="h-full bg-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  />
                </div>
                <div className="text-[9px] text-cyan font-mono text-center tracking-[0.2em] uppercase opacity-80 animate-pulse">
                  Synthesizing Industrial DBPF v2.1 Artifacts...
                </div>
              </div>
            ) : status === "success" ? (
              <div className="flex flex-col items-center gap-4">
                 <div className="flex items-center gap-2 text-emerald">
                   <ShieldCheck className="w-4 h-4" />
                   <span className="text-[10px] font-bold tracking-[0.1em] uppercase">Build Core: Certified Operational</span>
                 </div>
                 <button 
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-emerald/10 text-emerald border border-emerald/40 hover:bg-emerald hover:text-black font-bold text-[10px] tracking-widest uppercase transition-all shadow-xl active:scale-95"
                 >
                   Open Export Directory
                 </button>
              </div>
            ) : status === "error" ? (
              <div className="text-center space-y-4">
                <div className="text-[10px] text-rose font-bold tracking-widest uppercase italic bg-rose/10 py-2 rounded-lg border border-rose/30">
                  Critical Synthesis Failure Detected
                </div>
                <button 
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-white/5 text-textPrimary hover:bg-white/10 border border-white/10 font-bold text-[10px] tracking-widest uppercase transition-all"
                >
                  Dismiss & Re-Audit Toolchain
                </button>
              </div>
            ) : null}
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
