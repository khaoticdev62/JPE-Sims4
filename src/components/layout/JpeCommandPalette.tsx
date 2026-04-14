"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Command, CornerDownLeft, 
  LayoutDashboard, Code2, Rocket, Shield, 
  Zap, Settings, BookOpen, Sparkles, Globe, 
  Trash2, RefreshCw, Maximize2, Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { T } from "../robust/jpe-theme";
import { useUIStore } from "@/stores/useUIStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { useDiagnosticStore } from "@/stores/useDiagnosticStore";
import { hub } from "@/services/HubService";
import { cn } from "@/components/ui/utils";

// ── SPECTRAL ICON WRAPPER ──
const SpectralIcon = ({ icon: Icon, color }: { icon: any; color: string }) => (
  <div className="relative flex items-center justify-center min-w-[32px]">
    <div className="absolute inset-0 blur-md opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }} />
    <Icon size={16} color={color} className="relative z-10" />
  </div>
);

// ── ACTION REGISTRY ──
const SYSTEM_ACTIONS = [
  { id: 'nav_dash', label: 'Go to Dashboard', icon: LayoutDashboard, color: T.cyan, category: 'NAVI', action: () => hub.navigate('dashboard') },
  { id: 'nav_code', label: 'Open Code Editor', icon: Code2, color: T.cyan, category: 'NAVI', action: () => hub.navigate('code') },
  { id: 'nav_rebels', label: 'Rebels Mod Portal', icon: Globe, color: T.violet, category: 'NAVI', action: () => hub.navigate('rebels') },
  { id: 'nav_manual', label: 'Reference Manual', icon: BookOpen, color: T.cyan, category: 'NAVI', action: () => hub.navigate('manual') },
  { id: 'nav_settings', label: 'System Settings', icon: Settings, color: T.textTertiary, category: 'NAVI', action: () => hub.navigate('settings') },
  
  { id: 'task_build', label: 'Start Mod Build', icon: Rocket, color: T.amber, category: 'TASK', action: () => window.dispatchEvent(new CustomEvent('jpe:export')) },
  { id: 'task_clear', label: 'Clear System Logs', icon: Trash2, color: T.rose, category: 'TASK', action: () => useDiagnosticStore.getState().clearDiagnostics() },
  { id: 'task_sync', label: 'Sync Rebels Link', icon: RefreshCw, color: T.emerald, category: 'TASK', action: () => console.log('Syncing Rebels...') },
  { id: 'task_zen', label: 'Toggle Zen Mode', icon: Maximize2, color: T.violetBright, category: 'TASK', action: () => {
      const current = useUIStore.getState().immersionMode;
      useUIStore.getState().setImmersionMode(current === 'zen' ? 'normal' : 'zen');
  }},
  { id: 'task_diagnostics', label: 'Toggle Diagnostics', icon: Monitor, color: T.cyanBright, category: 'TASK', action: () => useUIStore.getState().toggleDiagnostics() },
  { id: 'task_ai', label: 'Open AI Assistant', icon: Sparkles, color: T.violet, category: 'TASK', action: () => hub.navigate('ai' as any) },
];

export function JpeCommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { activities } = useActivityStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Construct dynamic recent actions
  const recentActivities = useMemo(() => {
    return activities
      .filter(a => a.type === 'modified' || a.type === 'opened')
      .slice(0, 3)
      .map(a => ({
        id: `recent_${a.id}`,
        label: `Open ${a.fileName}`,
        icon: FileIcon,
        color: T.cyanBright,
        category: 'RECENT',
        action: () => hub.navigate('code')
      }));
  }, [activities]);

  const allActions = useMemo(() => [...recentActivities, ...SYSTEM_ACTIONS], [recentActivities]);

  // 2. Filter logic
  const filteredActions = useMemo(() => {
    if (!query) return allActions;
    const lowerQuery = query.toLowerCase();
    return allActions.filter(a => 
      a.label.toLowerCase().includes(lowerQuery) || 
      a.category.toLowerCase().includes(lowerQuery)
    );
  }, [allActions, query]);

  // AAA: Auto-select top result
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // 3. Navigation HUD Logic
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [isCommandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      e.preventDefault();
    } else if (e.key === "Enter" && filteredActions[selectedIndex]) {
      filteredActions[selectedIndex].action();
      setCommandPaletteOpen(false);
    } else if (e.key === "Escape") {
      setCommandPaletteOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 overflow-hidden"
          onClick={() => setCommandPaletteOpen(false)}
        >
          {/* SCRIM */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* PALETTE CONTAINER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[640px] bg-bg-glass border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col"
            style={{ backdropFilter: "blur(40px)" }}
          >
            {/* Header / Search */}
            <div className="flex items-center gap-4 px-6 h-16 border-b border-white/5 relative bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Command size={18} color={T.cyan} className="animate-pulse" />
                <div className="h-4 w-[1px] bg-white/10" />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, files, or navigation..."
                className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted font-medium text-sm"
              />
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-black/40 border border-white/5">
                <span className="text-[10px] font-bold text-text-tertiary">ESC</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="max-h-[400px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredActions.length > 0 ? (
                filteredActions.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      setCommandPaletteOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden text-left",
                      selectedIndex === index 
                        ? "bg-white/10 scale-[1.01]" 
                        : "bg-transparent hover:bg-white/[0.03]"
                    )}
                  >
                    {/* Spectral Glow Indicator */}
                    {selectedIndex === index && (
                      <motion.div 
                        layoutId="active-glow"
                        className="absolute inset-x-0 bottom-0 h-[100%] z-0 pointer-events-none"
                        style={{ background: `linear-gradient(to top, ${item.color}08, transparent)` }}
                      />
                    )}

                    <SpectralIcon icon={item.icon} color={item.color} />
                    
                    <div className="flex flex-col items-start flex-1 relative z-10">
                      <span className={cn(
                        "text-[13px] font-semibold transition-colors",
                        selectedIndex === index ? "text-text-primary" : "text-text-secondary"
                      )}>
                        {item.label}
                      </span>
                      <span className="text-[9px] font-bold tracking-[0.14em] text-text-muted uppercase">
                        {item.category}
                      </span>
                    </div>

                    {/* Shortcuts Visual */}
                    {selectedIndex === index && (
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 border border-white/10">
                          <span className="text-[9px] font-extrabold text-cyanBright">ENTER</span>
                          <CornerDownLeft size={10} color={T.cyan} />
                        </div>
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center opacity-40">
                   <Shield size={40} className="mb-4 text-rose" />
                   <p className="text-xs font-mono">NO_MATCH_DETECTED</p>
                </div>
              )}
            </div>

            {/* Footer / Context */}
            <div className="px-6 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 grayscale opacity-50">
                    <div className="px-1.5 py-0.5 rounded border border-white/20 text-[9px]">↑↓</div>
                    <span className="text-[10px]">Navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5 grayscale opacity-50">
                    <div className="px-1.5 py-0.5 rounded border border-white/20 text-[9px] leading-none">ENTER</div>
                    <span className="text-[10px]">Select</span>
                  </div>
               </div>
               <div className="flex items-center gap-1.5">
                  <Zap size={10} color={T.amber} />
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary }}>JPE_PALETTE_v1.0</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const FileIcon = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
