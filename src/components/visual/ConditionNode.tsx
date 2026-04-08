"use client";
import * as React from "react";
import { Position } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { T } from "../robust/jpe-theme";
import { SpectralHandle } from "./SpectralHandle";

export const ConditionNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="group relative min-w-[200px] bg-bgGlass backdrop-blur-2xl border border-white/5 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all hover:border-violet/50 hover:shadow-violet/10">
      {/* Target/Input Handle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
        <SpectralHandle 
          type="target" 
          position={Position.Top} 
          color={T.violet} 
        />
      </div>

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay rounded-2xl bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Spectral Glow Background */}
      <div className="absolute inset-0 bg-violet/5 blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
        <div className="p-2 rounded-xl bg-violet/10 border border-violet/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
          <GitBranch className="w-4 h-4 text-violet" />
        </div>
        <div>
           <div className="text-[8px] font-bold text-violet/60 tracking-[0.2em] uppercase">Branch Logic</div>
           <span className="text-[11px] font-extrabold tracking-wider text-textPrimary uppercase italic">{data.label}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 relative z-10">
        <span className="text-[8px] text-textTertiary uppercase font-bold tracking-widest">Boolean Expression</span>
        <div className="px-3 py-3 bg-black/60 rounded-lg border border-white/5 text-[10px] font-mono text-violetBright italic shadow-inner">
           {data.value || 'if sim.mood == "Angry"'}
        </div>
      </div>

      {/* Connection Handles (Outputs) */}
      <div className="flex justify-between mt-6 px-2 relative">
         <div className="flex flex-col items-center gap-2">
            <span className="text-[8px] text-emerald font-bold uppercase tracking-[0.2em]">True</span>
            <div className="translate-y-2">
              <SpectralHandle 
                type="source" 
                id="true"
                position={Position.Bottom} 
                color={T.emerald} 
              />
            </div>
         </div>
         <div className="flex flex-col items-center gap-2">
            <span className="text-[8px] text-rose font-bold uppercase tracking-[0.2em]">False</span>
            <div className="translate-y-2">
              <SpectralHandle 
                type="source" 
                id="false"
                position={Position.Bottom} 
                color={T.rose} 
              />
            </div>
         </div>
      </div>
    </div>
  );
};
