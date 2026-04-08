"use client";
import * as React from "react";
import { Zap, Map, UserPlus, Play, Milestone, GraduationCap, Flame } from "lucide-react";
import { T } from "../robust/jpe-theme";
import { simulator } from "@/services/playground/JpeSimulator";
import { motion } from "../jpe-motion";

export const TriggerDeck: React.FC = () => {
  const TRIGGERS = [
    { id: 'sims.spawn', label: 'SIM SPAWN', icon: <UserPlus className="w-4 h-4" />, color: T.emerald, desc: 'Fired when a new sim manifests' },
    { id: 'sims.travel', label: 'SIM TRAVEL', icon: <Map className="w-4 h-4" />, color: T.cyan, desc: 'Fired when sim changes lots' },
    { id: 'interaction.start', label: 'INTERACTION', icon: <Play className="w-4 h-4" />, color: T.violetBright, desc: 'Fired on interaction start' },
    { id: 'skill.up', label: 'SKILL LEVEL', icon: <GraduationCap className="w-4 h-4" />, color: T.amber, desc: 'Fired on skill progression' },
    { id: 'commodity.change', label: 'MOTIVE CHANGE', icon: <Flame className="w-4 h-4" />, color: T.rose, desc: 'Fired on need threshold' },
    { id: 'milestone.complete', label: 'MILESTONE', icon: <Milestone className="w-4 h-4" />, color: T.cyanBright, desc: 'Fired on life event' },
  ];

  const handleTrigger = (id: string) => {
    simulator.fireEvent({ type: id, payload: { timestamp: Date.now() } });
  };

  return (
    <div className="flex flex-col h-full bg-bgApp/50 border border-border rounded-lg overflow-hidden backdrop-blur-md shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-bgSurface/80">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold tracking-widest text-textPrimary uppercase">Event Trigger Deck</span>
        </div>
      </div>

      {/* Trigger Grid Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-1 gap-2.5">
          {TRIGGERS.map((trigger) => (
            <motion.button
              key={trigger.id}
              whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTrigger(trigger.id)}
              className="flex items-center gap-3 p-3 rounded-md border border-border/50 bg-black/20 text-left group transition-all"
            >
              <div 
                className="w-10 h-10 rounded flex items-center justify-center transition-colors shadow-lg"
                style={{ backgroundColor: `${trigger.color}15`, border: `1px solid ${trigger.color}30`, color: trigger.color }}
              >
                {trigger.icon}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-textPrimary group-hover:text-white transition-colors uppercase tracking-wider">
                  {trigger.label}
                </div>
                <div className="text-[9px] text-textTertiary line-clamp-1">
                  {trigger.desc}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                 <Zap className="w-3 h-3 text-amber-500 fill-amber-500/20" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Footer / Info */}
      <div className="p-3 bg-bgSurface/40 border-t border-border">
         <p className="text-[9px] text-textTertiary leading-relaxed">
           Click a trigger to manually emit a game-engine event. The simulator will match this against your active JPE code.
         </p>
      </div>
    </div>
  );
};
