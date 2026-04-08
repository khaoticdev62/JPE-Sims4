"use client";
import * as React from "react";
import { Position } from "@xyflow/react";
import { Terminal } from "lucide-react";
import { T } from "../robust/jpe-theme";
import { SpectralHandle } from "./SpectralHandle";

export const ActionNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="group relative min-w-[220px] bg-bgGlass backdrop-blur-2xl border border-white/5 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all hover:border-cyan/50 hover:shadow-cyan/10">
      {/* Target/Input Handle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
        <SpectralHandle 
          type="target" 
          position={Position.Top} 
          color={T.cyan} 
        />
      </div>

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay rounded-2xl bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Spectral Glow Background */}
      <div className="absolute inset-0 bg-cyan/5 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
        <div className="p-2 rounded-xl bg-cyan/10 border border-cyan/20 shadow-[0_0_15px_rgba(99,179,237,0.1)]">
          <Terminal className="w-4 h-4 text-cyan" />
        </div>
        <div>
           <div className="text-[8px] font-bold text-cyan/60 tracking-[0.2em] uppercase">Execution Block</div>
           <span className="text-[11px] font-extrabold tracking-wider text-textPrimary uppercase italic">{data.label}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 relative z-10">
        <span className="text-[8px] text-textTertiary uppercase font-bold tracking-widest">Logic Statement</span>
        <div className="px-3 py-3 bg-black/60 rounded-lg border border-white/5 text-[10px] font-mono text-emerald break-all shadow-inner leading-relaxed">
           {data.value || '# assignment here...'}
        </div>
      </div>

      {/* Connection Handle (Source) */}
      <div className="mt-4 flex justify-center translate-y-2">
        <SpectralHandle 
          type="source" 
          position={Position.Bottom} 
          color={T.cyan} 
        />
      </div>
    </div>
  );
};
