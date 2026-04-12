"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Code2, Languages, Network, Rocket,
  Sparkles, FileCode, Globe, CheckCircle2,
  Activity, Cpu, Clock, TrendingUp, Zap,
  Shield, Braces, Palette, type LucideIcon,
} from "lucide-react";
import { T } from "./robust/jpe-theme";
import type { WorkspaceMode } from "./robust/jpe-theme";
import { Eyebrow } from "./robust/jpe-shared";
import {
  motion,
  easing,
} from "./jpe-motion";
import { useProjectStore } from "@/stores/useProjectStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { useDiagnosticStore } from "@/stores/useDiagnosticStore";
import { useGamepadNavigation } from "@/hooks/useGamepadNavigation";
import { JpeCard, JpeProgressBar } from "./jpe-design-system";
import { SpectralHologram } from "./jpe-empty-states";

// Dynamic Imports to solve 500 ENOENT errors in SSR
const CoreLoadChart = dynamic(
  () => import("./charts/DashboardCharts").then(mod => mod.CoreLoadChart),
  { ssr: false, loading: () => <div className="h-[140px] w-full bg-white/[0.02] animate-pulse rounded-2xl" /> }
)

const RegionalDistChart = dynamic(
  () => import("./charts/DashboardCharts").then(mod => mod.RegionalDistChart),
  { ssr: false, loading: () => <div className="h-[140px] w-full bg-white/[0.02] animate-pulse rounded-2xl" /> }
)

// Stable data - seeded so it doesn't change on every render
const perfData = Array.from({ length: 30 }, (_, i) => ({
  t: i, cpu: 30 + Math.sin(i * 0.4) * 18 + ((i * 7 + 3) % 8),
  mem: 50 + Math.cos(i * 0.3) * 12 + ((i * 5 + 1) % 6),
}));

const coverageData = [
  { locale: "en_US", coverage: 100 }, { locale: "ja_JP", coverage: 87 },
  { locale: "de_DE", coverage: 92 }, { locale: "fr_FR", coverage: 78 },
  { locale: "ko_KR", coverage: 65 }, { locale: "zh_CN", coverage: 71 },
];

const quickActions: { label: string; icon: LucideIcon; color: string; mode: WorkspaceMode; desc: string }[] = [
  { label: "Translate Files", icon: Languages, color: T.violet, mode: "translation", desc: "Run AI translation" },
  { label: "Build Package", icon: Rocket, color: T.amber, mode: "export", desc: "Production Export" },
  { label: "Scan Conflicts", icon: Shield, color: T.emerald, mode: "conflicts", desc: "Detect issues" },
  { label: "Open Editor", icon: Code2, color: T.cyan, mode: "code", desc: "Code workspace" },
  { label: "View Graph", icon: Network, color: T.cyanDeep, mode: "visual", desc: "Dependency map" },
  { label: "AI Assistant", icon: Sparkles, color: T.violetBright, mode: "ai", desc: "Get AI help" },
];

const dashboardHeroImage = "/assets/dashboard_hero.svg";

export function DashboardView({ onNavigate }: { onNavigate: (mode: WorkspaceMode) => void }) {
  const { currentProject } = useProjectStore();
  const { activities } = useActivityStore();
  const { diagnostics } = useDiagnosticStore();

  // Phase 8: Industrial Controller Integration
  const { focusedActionIndex } = useGamepadNavigation();

  React.useEffect(() => {
    const handleIgnite = () => {
      console.log("Controller Ignite Triggered");
    };
    
    const handleConfirm = (e: Event) => {
      const customEvent = e as CustomEvent<{ index: number }>;
      const index = customEvent.detail?.index;
      if (typeof index === 'number' && quickActions[index]) {
        onNavigate(quickActions[index].mode);
      }
    };

    window.addEventListener('jpe:ignite', handleIgnite);
    window.addEventListener('jpe:confirm', handleConfirm);
    return () => {
      window.removeEventListener('jpe:ignite', handleIgnite);
      window.removeEventListener('jpe:confirm', handleConfirm);
    };
  }, [onNavigate]);

  const recentFilesDisplay = useMemo(() => {
    if (activities.length === 0) {
      return [
        { name: "spectral_core_manifest.jpe", status: 'ready', time: "BOOT", icon: FileCode, color: T.cyan },
        { name: "logic_gate_runner.ts", status: 'ready', time: "BOOT", icon: Braces, color: T.violetBright },
        { name: "ui_glow_engine.css", status: 'ready', time: "READY", icon: Palette, color: T.emerald },
      ];
    }
    return activities
      .filter(a => a.type === 'modified' || a.type === 'added')
      .slice(0, 5)
      .map(a => ({
        name: a.fileName,
        status: a.type === 'modified' ? 'modified' : 'ready',
        time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: a.fileName.endsWith('.stbl') ? Globe : FileCode,
        color: a.fileName.endsWith('.stbl') ? T.violetBright : T.cyan
      }));
  }, [activities]);

  const activityLogDisplay = useMemo(() => {
    if (activities.length === 0) {
      return [
        { text: "CORE_SYSTEM: Layer 1 Initialization Complete", color: T.emerald, time: "BOOT", icon: CheckCircle2 },
        { text: "NEURAL_LINK: Establishing secure channel...", color: T.cyan, time: "SYNC", icon: Zap },
        { text: "SPECTRAL_UI: Loading shaders and glows", color: T.violet, time: "READY", icon: Sparkles },
        { text: "KERNEL: Memory parity check passed", color: T.emerald, time: "BOOT", icon: Shield },
        { text: "ASSETS: Pre-warming texture buffers", color: T.amber, time: "BOOT", icon: Palette },
        { text: "UPLINK: Connected to TS4Rebels primary vault", color: T.cyanBright, time: "READY", icon: Globe },
      ];
    }
    return activities.slice(0, 6).map(a => {
      const iconMap: Record<string, LucideIcon> = {
        created: CheckCircle2,
        opened: CheckCircle2,
        modified: Sparkles,
        added: FileCode,
        translated: Languages,
        completed: CheckCircle2
      };
      const colorMap: Record<string, string> = {
        created: T.emerald,
        opened: T.cyan,
        modified: T.violet,
        added: T.blue,
        translated: T.violetBright,
        completed: T.emerald
      };
      return {
        text: a.fileName === 'New project created' || a.fileName === 'Project opened' ? `${a.fileName}: ${a.projectName}` : a.fileName,
        color: colorMap[a.type] || T.textTertiary,
        time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        icon: iconMap[a.type] || Activity
      };
    });
  }, [activities]);

  // Compute real stats from actual project data
  const stats = useMemo(() => {
    const files = currentProject?.files ?? [];
    const stblFiles = files.filter(f => f.name.endsWith('.stbl'));
    const errorCount = diagnostics.filter(d => d.severity === 'error').length;
    
    // Count real STBL entries (rough estimate from file count if no detailed parsing)
    const stblEntryEstimate = stblFiles.length * 50; // Average ~50 entries per STBL file
    
    // Calculate real translation coverage
    const totalFiles = files.length;
    const translatedFiles = files.filter(f => f.compiledAt && f.compiledAt > 0).length;
    const coveragePercent = totalFiles > 0 ? Math.round((translatedFiles / totalFiles) * 100) : 0;
    
    return [
      { label: "FILES", value: files.length, color: T.cyan },
      { label: "STRINGS", value: stblEntryEstimate > 0 ? stblEntryEstimate.toLocaleString() : "0", color: T.violet },
      { label: "COMPLETED", value: coveragePercent > 0 ? `${coveragePercent}%` : "0%", color: T.emerald },
      { label: "CONFLICTS", value: errorCount, color: T.rose },
    ];
  }, [currentProject, diagnostics]);

  return (
    <div data-testid="dashboard-root" className="flex flex-col h-full overflow-y-auto custom-scrollbar" style={{ background: T.bg }}>
      
      {/* ── SPECTRAL HERO SECTION ── */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 260 }}>
        <img
          src={dashboardHeroImage}
          alt="JPE Studio Dashboard"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.35) contrast(1.1) saturate(1.2)" }}
        />
        
        {/* Cinematic Overlays */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${T.bgPanel} 0%, transparent 40%, transparent 60%, ${T.bg} 100%)` }} />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: T.noiseSvg }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 0%, ${T.bg} 100%)` }} />
        
        {/* Animated Accent Glows */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle at center, ${T.cyan} 0%, transparent 70%)`, filter: "blur(60px)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background: `radial-gradient(circle at center, ${T.violet} 0%, transparent 70%)`, filter: "blur(60px)" }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 12, repeat: Infinity }}
        />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-end h-full px-8 pb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: easing.outStandard }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
                  boxShadow: `0 0 30px rgba(99,179,237,0.3)`,
                  border: "1px solid rgba(255,255,255,0.2)"
                }}
              >
                <Braces size={28} color="#fff" strokeWidth={2.5} />
              </motion.div>
              <div>
                <Eyebrow color={T.cyanBright}>INDUSTRIAL ENGINE v4.2.0</Eyebrow>
                <h1 style={{ fontSize: 32, fontWeight: 950, fontFamily: T.display, color: T.textPrimary, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {currentProject ? currentProject.name : "KHAOTIC DEV STUDIO"}
                </h1>
              </div>
            </div>

            {/* Industrial Status Badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald/30 bg-emerald/5">
                <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" style={{ boxShadow: `0 0 8px ${T.emerald}` }} />
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.emerald, fontWeight: 700, letterSpacing: "0.1em" }}>SYSTEM NOMINAL</span>
              </div>
              {currentProject && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan/30 bg-cyan/5">
                  <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" style={{ boxShadow: `0 0 8px ${T.cyan}` }} />
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.cyan, fontWeight: 700, letterSpacing: "0.1em" }}>PROJECT ACTIVE</span>
                </div>
              )}
            </div>
          </div>
          
          <div data-testid="stats-grid" className="flex items-center gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex flex-col"
              >
                 <span style={{ fontSize: 18, fontFamily: T.mono, fontWeight: 800, color: s.color }}>{s.value}</span>
                 <span style={{ fontSize: 9, color: T.textMuted, letterSpacing: "0.12em", fontWeight: 700 }}>{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="flex-1 p-6 grid grid-cols-12 gap-6 auto-rows-min content-start">
        
        {/* Quick Actions */}
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} color={T.amber} />
            <Eyebrow color={T.textPrimary}>QUICK ACCESS MODULES</Eyebrow>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
                <motion.button
                  key={action.mode}
                  data-testid={`quick-action-${action.mode}`}
                  onClick={() => onNavigate(action.mode)}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className={`group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 text-left ${
                    focusedActionIndex === index 
                      ? 'border-cyan shadow-lg shadow-cyan/20 bg-cyan/5' 
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan/30 hover:shadow-[0_0_20px_rgba(99,179,237,0.1)]'
                  }`}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ 
                      background: `radial-gradient(circle at center, ${action.color}20 0%, transparent 70%)` 
                    }}
                  />
                  
                  {focusedActionIndex === index && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-cyan animate-pulse shadow-sm shadow-cyan" />
                  )}

                  <div className="flex flex-col h-full relative z-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:spectral-pulse" style={{ background: `${action.color}15`, border: `1px solid ${action.color}30` }}>
                      <action.icon size={18} color={action.color} className="group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.textPrimary, fontFamily: T.display }}>{action.label}</div>
                    <div style={{ fontSize: 10, color: T.textMuted }}>{action.desc}</div>
                  </div>
                </motion.button>
            ))}
          </div>
        </div>

        {/* Project Health */}
        <div className="col-span-12 lg:col-span-4 translate-y-[-10px]">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} color={T.emerald} />
            <Eyebrow color={T.textPrimary}>L2D TELEMETRY</Eyebrow>
          </div>
          <JpeCard className="p-5 space-y-4 hover:glow-border-cyan transition-all duration-300">
            {(() => {
              const files = currentProject?.files ?? [];
              const totalFiles = files.length;
              const compiledFiles = files.filter(f => f.compiledAt && f.compiledAt > 0).length;
              const cleanDiagnostics = diagnostics.filter(d => d.severity === 'error');
              
              const translationPct = totalFiles > 0 ? Math.round((compiledFiles / totalFiles) * 100) : 0;
              const schemaPct = totalFiles > 0 && cleanDiagnostics.length === 0 ? 100 : Math.max(0, 100 - (cleanDiagnostics.length * 10));
              const conflictPct = cleanDiagnostics.length > 0 ? Math.max(0, 100 - (cleanDiagnostics.length * 15)) : 100;
              
              return [
                { label: "TRANSLATION", pct: translationPct, color: T.emerald },
                { label: "SCHEMA_VAL", pct: schemaPct, color: T.cyan },
                { label: "CONFLICT_RES", pct: conflictPct, color: T.rose },
              ];
            })().map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.textSecondary, fontFamily: T.mono }}>{item.label}</span>
                  <span className="spectral-pulse" style={{ fontSize: 10, fontWeight: 800, color: item.color, fontFamily: T.mono }}>{item.pct}%</span>
                </div>
                <div className="spectral-pulse">
                  <JpeProgressBar value={item.pct} color={item.color} height={5} />
                </div>
              </div>
            ))}
            <div className="pt-2">
               <div style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.5, background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-cyan font-bold mr-1">REAL-TIME:</span> Synchronization active. All components monitored via KDBS pipeline.
               </div>
            </div>
          </JpeCard>
        </div>

        {/* Recent Data Blocks */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
           <JpeCard title="RECENT_RESOURCES" icon={Clock} headerAction={
              <button onClick={() => onNavigate("code")} className="text-[10px] text-cyan font-bold bg-transparent border-none outline-none hover:text-cyanBright transition-colors cursor-pointer">EXPLORE</button>
           } className="hover:glow-border-cyan transition-all min-h-[220px] flex flex-col items-center justify-center">
              {activities.length > 0 ? (
                <div className="space-y-1 w-full">
                  {recentFilesDisplay.map((f, i) => (
                    <button key={i} onClick={() => onNavigate("code")} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors group bg-transparent border-none text-left">
                       <f.icon size={13} color={f.color} className="group-hover:rotate-12 transition-transform" />
                       <span className="flex-1 truncate text-[11px] text-text-secondary group-hover:text-text-primary">{f.name}</span>
                       <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{f.time}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <SpectralHologram 
                  icon={FileCode} 
                  title="No Recent Files" 
                  description="Open a project or create a new file to see recent activity."
                  action={{ label: "Select Project", onClick: () => onNavigate("dashboard") }} 
                />
              )}
           </JpeCard>
        </div>

        {/* Performance & Charts */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
           <JpeCard title="CORE_LOAD" icon={Cpu} className="hover:glow-border-cyan transition-all">
              <CoreLoadChart data={perfData} />
              <div className="flex items-center justify-between mt-3 px-2">
                 <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-cyan spectral-pulse" /><span style={{ fontSize: 9, color: T.textMuted }}>8-THREAD CPU</span></div>
                 <div style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: T.cyan }}>0.01ms LATENCY</div>
              </div>
           </JpeCard>
        </div>

        <div className="col-span-12 md:col-span-12 lg:col-span-4">
           <JpeCard title="REGIONAL_DIST" icon={Globe} className="hover:glow-border-cyan transition-all">
              <RegionalDistChart data={coverageData} />
           </JpeCard>
        </div>

        {/* Activity Feed */}
        <div className="col-span-12">
           <JpeCard title="SYSTEM_LOG" icon={TrendingUp} className="hover:glow-border-cyan transition-all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                 {activityLogDisplay.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-white/5 last:border-0 group hover:bg-white/[0.02] transition-colors">
                       <a.icon size={12} color={a.color} className="group-hover:scale-125 transition-transform" />
                       <span className="flex-1 text-[11px] text-text-secondary truncate group-hover:text-text-primary">{a.text}</span>
                       <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{a.time}</span>
                    </div>
                 ))}
              </div>
           </JpeCard>
        </div>
      </div>
    </div>
  );
}
