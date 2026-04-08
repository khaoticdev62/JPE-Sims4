"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { 
  FolderTree, 
  Search, 
  Layers,
  Brain,
  Book,
  ShieldCheck,
  Zap,
  Cpu,
  History,
  Info
} from "lucide-react"
import { useUIStore } from "@/stores/useUIStore"
import { useBuildStore } from "@/stores/useBuildStore"
import { cn } from "@/utils/cn"
import { T } from "../robust/jpe-theme"
import { motion, AnimatePresence } from "../jpe-motion"
import ProjectExplorer from "./ProjectExplorer"
import { DictionaryPanel } from "./DictionaryPanel"
import { AIAssistant } from "../ai/AIAssistant"

// Dynamic Import to solve 500 ENOENT: d3-interpolate issues in SSR
const TelemetryMiniChart = dynamic(
  () => import("../charts/DashboardCharts").then(mod => mod.TelemetryMiniChart),
  { ssr: false, loading: () => <div className="h-24 w-full bg-white/[0.02] animate-pulse rounded-xl" /> }
)

const perfData = Array.from({ length: 20 }, (_, i) => ({
  t: i, val: 20 + Math.sin(i * 0.5) * 15 + ((i * 3) % 5)
}));

export function Sidebar() {
  const { sidebarCollapsed, sidebarTab, setSidebarTab } = useUIStore()
  
  if (sidebarCollapsed) return null

  const tabs = [
    { id: 'explorer', icon: Layers, label: 'BUILD', color: T.cyan },
    { id: 'ai', icon: Brain, label: 'GENIE', color: T.violet },
    { id: 'dictionary', icon: Book, label: 'WIKI', color: T.amber },
    { id: 'health', icon: ShieldCheck, label: 'TELEMETRY', color: T.emerald },
  ] as const

  return (
    <aside 
      className="flex flex-col h-full overflow-hidden border-r relative z-20"
      style={{ background: T.bgPanel, borderColor: T.border }}
    >
      {/* Cinematic Sidebar Accent */}
      <div 
        className="absolute top-0 right-0 w-[1px] h-full opacity-30"
        style={{ background: `linear-gradient(180deg, transparent, ${T.cyan}, transparent)` }}
      />

      {/* ── TAB NAVIGATION (Industrial Vertical) ── */}
      <div className="flex bg-black/20 border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSidebarTab(tab.id as 'explorer' | 'ai' | 'dictionary' | 'health')}
            className={cn(
              "flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden group outline-none",
              sidebarTab === tab.id ? "text-white" : "text-text-muted hover:text-text-secondary"
            )}
            title={tab.label}
          >
            {sidebarTab === tab.id && (
              <motion.div 
                layoutId="sidebar-tab-accent"
                className="absolute inset-0 z-0 bg-white/[0.03]"
              />
            )}
            {sidebarTab === tab.id && (
              <motion.div 
                layoutId="sidebar-tab-line"
                className="absolute bottom-0 left-0 right-0 h-[2px] z-10"
                style={{ background: tab.color, boxShadow: `0 0 10px ${tab.color}80` }}
              />
            )}
            <tab.icon size={14} className="relative z-10" color={sidebarTab === tab.id ? tab.color : 'currentColor'} strokeWidth={sidebarTab === tab.id ? 2.5 : 2} />
            <span className="text-[8px] font-black tracking-widest relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
               {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── PANEL CONTENT ── */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={sidebarTab}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {sidebarTab === 'explorer' && <ProjectExplorerWrapper />}
            {sidebarTab === 'ai' && <AIAssistant />}
            {sidebarTab === 'dictionary' && <DictionaryPanel />}
            {sidebarTab === 'health' && <TelemetryPanel />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── SIDEBAR FOOTER ── */}
      <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between">
         <div className="flex gap-3">
            <Search size={14} className="text-text-muted hover:text-cyan transition-colors cursor-pointer" />
            <History size={14} className="text-text-muted hover:text-white transition-colors cursor-pointer" />
         </div>
         <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-text-muted opacity-50 uppercase tracking-tighter">KDBS_LINK:OK</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
         </div>
      </div>
    </aside>
  )
}

function ProjectExplorerWrapper() {
  const { buildStatus } = useBuildStore()

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header Actions */}
      <div className="p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FolderTree size={12} color={T.cyan} />
            <span className="text-[10px] font-black tracking-[0.2em] text-text-primary uppercase">Workspace</span>
          </div>
          <button 
            className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5 outline-none"
          >
             <Zap size={10} color={T.amber} className="fill-amber-500/20" />
          </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ProjectExplorer />
      </div>

      {/* Mini Build Pulse */}
      {buildStatus === 'running' && (
        <div className="p-4 bg-cyan/5 border-t border-cyan/20 animate-pulse">
           <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-cyan uppercase tracking-widest">Active Synthesis</span>
              <span className="text-[9px] font-mono text-cyan">BUS_LOAD: 82%</span>
           </div>
           <div className="h-1 w-full bg-cyan/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-cyan shadow-[0_0_10px_rgba(99,179,237,0.5)]"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                style={{ width: '40%' }}
              />
           </div>
        </div>
      )}
    </div>
  )
}

function TelemetryPanel() {
  return (
    <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar h-full">
       <section className="space-y-3">
          <div className="flex items-center gap-2 opacity-60">
             <Cpu size={12} color={T.cyan} />
             <span className="text-[10px] font-bold tracking-widest uppercase">System Load</span>
          </div>
          <TelemetryMiniChart data={perfData} />
       </section>

       <section className="space-y-2">
          <div className="flex items-center gap-2 opacity-60">
             <Info size={12} color={T.violet} />
             <span className="text-[10px] font-bold tracking-widest uppercase">Runtime Status</span>
          </div>
          <div className="space-y-1.5">
             <StatusRow label="JPE_THREAD_0" status="ACTIVE" color={T.emerald} />
             <StatusRow label="AI_COPROCESSOR" status="STANDBY" color={T.amber} />
             <StatusRow label="HANDHELD_SYNC" status="CONNECTED" color={T.cyan} />
          </div>
       </section>
    </div>
  )
}

function StatusRow({ label, status, color }: { label: string, status: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
       <span className="text-[9px] font-mono text-text-muted">{label}</span>
       <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
          <span className="text-[8px] font-black tracking-widest" style={{ color }}>{status}</span>
       </div>
    </div>
  )
}
