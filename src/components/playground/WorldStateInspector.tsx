"use client";
import * as React from "react";
import { User, Sun, CloudRain, MapPin, Activity, Heart, Clock, RefreshCw, Zap } from "lucide-react";
import { cn } from "../ui/utils";
import { usePlaygroundStore } from "@/stores/usePlaygroundStore";

export const WorldStateInspector: React.FC = () => {
  const { worldState, updateWorldState, updateSimState, resetWorldState } = usePlaygroundStore();
  const { activeSim } = worldState;

  const handleSliderChange = (stat: string, val: string) => {
    updateSimState({ [stat]: parseInt(val) });
  };

  return (
    <div className="flex flex-col h-full bg-bgApp/50 border border-border rounded-lg overflow-hidden backdrop-blur-md shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-bgSurface/80">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald" />
          <span className="text-[10px] font-bold tracking-widest text-textPrimary uppercase">World State Mocker</span>
        </div>
        <button 
          onClick={resetWorldState}
          className="p-1 hover:bg-white/10 rounded transition-colors text-textTertiary hover:text-textPrimary"
          title="Reset World"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* State Controls Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        
        {/* Environment Section */}
        <section className="space-y-3">
          <h3 className="text-[9px] font-bold text-textTertiary tracking-widest flex items-center gap-2">
            <Clock className="w-3 h-3" /> ENVIRONMENT
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => updateWorldState({ isDaytime: !worldState.isDaytime })}
              className={cn(
                "flex items-center justify-center gap-2 p-2 rounded border border-border bg-black/20 hover:bg-white/5 transition-all",
                worldState.isDaytime ? "text-amber-400 border-amber-500/30" : "text-blue-400 border-blue-500/30"
              )}
            >
              {worldState.isDaytime ? <Sun className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              <span className="text-[10px] font-medium">{worldState.isDaytime ? "Daytime" : "Nighttime"}</span>
            </button>

            <button 
              onClick={() => updateWorldState({ isRaining: !worldState.isRaining })}
              className={cn(
                "flex items-center justify-center gap-2 p-2 rounded border border-border bg-black/20 hover:bg-white/5 transition-all underline-offset-4",
                worldState.isRaining ? "text-cyan-400 border-cyan-500/30" : "text-textTertiary"
              )}
            >
              <CloudRain className="w-4 h-4" />
              <span className="text-[10px] font-medium">{worldState.isRaining ? "Rainy" : "Clear"}</span>
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
             <label className="text-[10px] text-textSecondary flex items-center gap-2">
               <MapPin className="w-3 h-3" /> Active Lot Type
             </label>
             <select 
               value={worldState.lotType}
               onChange={(e) => updateWorldState({ lotType: e.target.value })}
               className="w-full bg-black/40 border border-border rounded p-1.5 text-[10px] text-textPrimary focus:outline-none focus:border-cyan"
             >
               <option value="Residential">Residential</option>
               <option value="Bar">Dudley's Bar</option>
               <option value="Park">Willow Creek Park</option>
               <option value="Gym">The Gym</option>
               <option value="Library">Library</option>
             </select>
          </div>
        </section>

        {/* Sim Stats Section */}
        <section className="space-y-4 pt-2">
          <h3 className="text-[9px] font-bold text-textTertiary tracking-widest flex items-center gap-2">
             <User className="w-3 h-3" /> ACTIVE SIM: {activeSim.firstName.toUpperCase()}
          </h3>

          <div className="space-y-4">
             {/* Stat: Mood */}
             <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-textSecondary">Current Mood</span>
                  <span className="text-cyan font-bold">{activeSim.mood}</span>
                </div>
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {["Fine", "Happy", "Energized", "Flirty", "Angry", "Sad"].map(m => (
                    <button
                      key={m}
                      onClick={() => updateSimState({ mood: m })}
                      className={cn(
                        "px-2 py-1 rounded text-[9px] border transition-all whitespace-nowrap",
                        activeSim.mood === m ? "bg-cyan/20 border-cyan text-cyan" : "bg-white/5 border-border text-textTertiary hover:bg-white/10"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
             </div>

             {/* Stat: Needs (Sliders) */}
             {[
               { id: 'energy', label: 'Energy', icon: <Zap className="w-3 h-3" /> },
               { id: 'hunger', label: 'Hunger', icon: <Activity className="w-3 h-3" /> },
               { id: 'hygiene', label: 'Hygiene', icon: <Heart className="w-3 h-3" /> },
             ].map(stat => (
               <div key={stat.id} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-textSecondary flex items-center gap-2">
                      {stat.icon} {stat.label}
                    </span>
                    <span className="text-emerald font-mono font-bold">{(activeSim as any)[stat.id]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={(activeSim as any)[stat.id]}
                    onChange={(e) => handleSliderChange(stat.id, e.target.value)}
                    className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-emerald"
                  />
               </div>
             ))}
          </div>
        </section>

      </div>
      
      {/* Footer / Footer */}
      <div className="p-3 bg-bgSurface/40 border-t border-border flex flex-col gap-2">
         <div className="text-[9px] text-textTertiary font-mono flex justify-between">
           <span>ACTIVE BUFFER:</span>
           <span className="text-cyan">{activeSim.buffs.length} PULSES</span>
         </div>
      </div>
    </div>
  );
};
