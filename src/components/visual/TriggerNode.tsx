"use client";
import * as React from "react";
import { Position } from "@xyflow/react";
import { Zap } from "lucide-react";
import { T } from "../robust/jpe-theme";
import { SpectralHandle } from "./SpectralHandle";

export const TriggerNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="group relative min-w-[200px] bg-bgGlass backdrop-blur-2xl border border-white/5 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all hover:border-amber/50 hover:shadow-amber/10">
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay rounded-2xl bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Spectral Glow Background */}
      <div className="absolute inset-0 bg-amber/5 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
        <div className="p-2 rounded-xl bg-amber/10 border border-amber/20 shadow-[0_0_15px_rgba(246,173,85,0.1)]">
          <Zap className="w-4 h-4 text-amber" />
        </div>
        <div>
           <div className="text-[8px] font-bold text-amber/60 tracking-[0.2em] uppercase">Trigger Engine</div>
           <span className="text-[11px] font-extrabold tracking-wider text-textPrimary uppercase italic">{data.label}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 relative z-10">
        <span className="text-[8px] text-textTertiary uppercase font-bold tracking-widest">Target Event</span>
        <div className="px-3 py-2 bg-black/60 rounded-lg border border-white/5 text-[10px] font-mono text-amber truncate shadow-inner">
           {data.subType || 'sims.spawn'}
        </div>
      </div>

      {/* Connection Handle */}
      <div className="mt-4 flex justify-center translate-y-2">
        <SpectralHandle 
          type="source" 
          position={Position.Bottom} 
          color={T.amber} 
        />
      </div>
    </div>
  );
};
