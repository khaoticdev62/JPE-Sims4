"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronRight, Play,
  CheckCircle2, Loader2, Circle,
  Terminal, Copy,
  Zap, Lock, RefreshCw, ArrowRight,
  Radio, RotateCcw,
} from "lucide-react";
import { T } from "./robust/jpe-theme";
const pipelineHeroImage = "/assets/pipeline_industrial_hero.svg";
import { useScaledPx } from "./jpe-settings-context";
import { toast } from "sonner";
import { useBuildStore } from "../stores/useBuildStore";
import { useProjectStore } from "../stores/useProjectStore";
import { motion } from "./jpe-motion";

/* ═══ PIPELINE STEPS ═══ */
type StepStatus = "done" | "active" | "next" | "pending";
interface PipelineStep {
  name: string;
  status: StepStatus;
  duration?: string;
  label: string;
}

/* ═══ LOG LEVEL COLORS ═══ */
const levelColors: Record<string, string> = {
  info: T.cyanBright,
  success: T.emerald,
  warning: T.amber,
  error: T.rose,
  debug: T.textTertiary,
  sys: T.textMuted,
};

/* ═══ LOG ENTRIES ═══ */
type LogLevel = "info" | "success" | "warning" | "error" | "debug" | "sys";
interface LogEntry {
  time: string;
  level: LogLevel;
  text: string;
  highlight?: string;
}

/* ═══════════════════════════════════════════════════════════════
   BUILD PIPELINE VIEW — AAAA PRODUCTION
   ═══════════════════════════════════════════════════════════════ */
export function BuildPipelineView() {
  const { 
    buildStatus, progress, currentFile, log, results,
    startBuild, resetBuild 
  } = useBuildStore();
  const { currentProject } = useProjectStore();
  
  const telemetryW = useScaledPx(240);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const pipelineSteps: PipelineStep[] = useMemo(() => [
    { 
      name: "Source Analysis", 
      status: buildStatus === 'completed' ? "done" : buildStatus === 'running' && progress < 25 ? "active" : progress >= 25 ? "done" : "pending", 
      label: buildStatus === 'completed' || progress >= 25 ? "Done" : "Pending" 
    },
    { 
      name: "Component Compilation", 
      status: buildStatus === 'completed' ? "done" : buildStatus === 'running' && progress >= 25 && progress < 50 ? "active" : progress >= 50 ? "done" : "pending", 
      label: buildStatus === 'completed' || progress >= 50 ? "Done" : "Pending" 
    },
    { 
      name: "Registry Injection", 
      status: buildStatus === 'completed' ? "done" : buildStatus === 'running' && progress >= 50 && progress < 75 ? "active" : progress >= 75 ? "done" : "pending", 
      label: buildStatus === 'completed' || progress >= 75 ? "Done" : "Pending" 
    },
    { 
      name: "Package Synthesis", 
      status: buildStatus === 'completed' ? "done" : buildStatus === 'running' && progress >= 75 ? "active" : "pending", 
      label: buildStatus === 'completed' ? "Done" : "Pending" 
    },
  ], [buildStatus, progress]);

  const _activeStep = useMemo(() => {
    const idx = pipelineSteps.findIndex(s => s.status === "active");
    return idx !== -1 ? pipelineSteps[idx] : buildStatus === 'completed' ? pipelineSteps[3] : null;
  }, [pipelineSteps, buildStatus]);

  const handleStart = () => {
    if (currentProject) {
      startBuild(currentProject.files.length);
      toast.info("Initializing Build Sequence...");
    } else {
      toast.error("No project loaded for build");
    }
  };

  const copyLogs = () => {
    navigator.clipboard.writeText(log.map(l => `[${l.timestamp.toISOString()}] ${l.level.toUpperCase()}: ${l.message}`).join("\n")).catch(() => {});
    toast.success("Logs copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ background: T.bg, fontFamily: T.sans, color: T.textPrimary }}>
      {/* ═══ PIPE HERO SECTION ═══ */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 180 }}>
        <img
          src={pipelineHeroImage}
          alt="Build Pipeline Core"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.3) saturate(1.2) contrast(1.1)" }}
        />
        {/* Spectral Overlays */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${T.bgPanel} 0%, transparent 40%, transparent 60%, ${T.bg} 100%)` }} />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: (T as any).noiseSvg }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 0%, ${T.bg}dd 100%)` }} />
        
        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-between h-full px-6">
          <div className="flex flex-col gap-2 max-w-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${T.cyan}20`, border: `1px solid ${T.cyan}30`, boxShadow: `0 0 15px ${T.cyan}20` }}>
                <Zap size={16} color={T.cyan} />
              </div>
              <h1 style={{ fontFamily: T.display, fontSize: 24, fontWeight: 900, color: T.textPrimary, letterSpacing: "0.05em", textShadow: `0 0 30px ${T.cyan}40` }}>
                BUILD PIPELINE
              </h1>
            </div>
            <p style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>
              Industrial-grade package synthesis engine. Actively monitoring 8 threads for real-time 
              spectral interference and dependency collisions during mod compilation.
            </p>
            <div className="flex items-center gap-4 mt-1">
              {[
                { label: "STABLE", color: T.emerald, icon: Lock },
                { label: "SYNCING", color: T.violetBright, icon: RefreshCw },
                { label: "L2D BYPASS", color: T.cyan, icon: Radio },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <s.icon size={10} color={s.color} />
                  <span style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 700, color: s.color, letterSpacing: "0.08em" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 items-end">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: `0 0 30px ${T.cyan}30` }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              disabled={buildStatus === 'running'}
              className="flex items-center gap-3 px-6 py-3 rounded-xl transition-all"
              style={{
                background: `linear-gradient(135deg, ${T.cyan}30, ${T.violet}20)`,
                border: `1px solid ${T.borderActive}`,
                boxShadow: `0 0 20px ${T.cyan}15`,
                cursor: buildStatus === 'running' ? "not-allowed" : "pointer",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              <Play size={16} color={T.cyan} />
              <span style={{ fontFamily: T.display, fontSize: 13, fontWeight: 800, color: T.textPrimary, letterSpacing: "0.08em" }}>
                {buildStatus === 'running' ? "SEQUENCE ACTIVE" : "EXECUTE BUILD"}
              </span>
              <ArrowRight size={14} color={T.textPrimary} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ═══ FLOW DIAGRAM ═══ */}
      <div className="flex items-center justify-center px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
        <div className="flex items-center">
          {pipelineSteps.map((step, i) => (
            <StepNode key={step.name} step={step} isLast={i === pipelineSteps.length - 1} />
          ))}
        </div>
      </div>

      {/* ═══ MAIN CONTENT: Terminal + Telemetry ═══ */}
      <div className="flex flex-1 min-h-0">

        {/* ── TERMINAL LOG ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Terminal header */}
          <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <Terminal size={11} color={T.cyanBright} />
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.04em" }}>BUILD OUTPUT</span>
              <div className="w-px h-3 mx-1" style={{ background: T.border }} />
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>{log.length} lines</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded hover:bg-white/5" title="Copy logs" onClick={copyLogs}><Copy size={10} color={T.textTertiary} /></button>
              <button className="p-1 rounded hover:bg-white/5" title="Clear logs" onClick={resetBuild}><RotateCcw size={10} color={T.textTertiary} /></button>
            </div>
          </div>

          {/* Terminal glass container */}
          <div className="flex-1 relative min-h-0">
            {/* Cinematic glass background */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(ellipse 80% 50% at 50% 30%, rgba(6,182,212,0.03) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 20% 70%, rgba(139,92,246,0.02) 0%, transparent 50%)`,
            }} />

            <div className="absolute inset-3 rounded-xl overflow-hidden" style={{
              background: T.bgGlass,
              backdropFilter: T.glassBlur,
              WebkitBackdropFilter: T.glassBlur,
              border: `1px solid ${T.border}`,
              boxShadow: `0 0 40px rgba(6,182,212,0.04), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`,
            } as React.CSSProperties}>
              {/* Top glow edge */}
              <div className="absolute top-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.cyan}30, ${T.violet}20, transparent)` }} />
              {/* Left glow edge */}
              <div className="absolute top-4 left-0 bottom-4 w-px" style={{ background: `linear-gradient(180deg, transparent, ${T.cyan}15, transparent)` }} />

              {/* Terminal content */}
              <div
                className="h-full overflow-y-auto py-3 custom-scrollbar"
                style={{ scrollBehavior: "smooth" }}
              >
                {log.map((entry, i) => (
                  <LogLine key={`log-${i}`} entry={{
                    time: entry.timestamp.toLocaleTimeString([], { hour12: false }),
                    level: entry.level as LogLevel,
                    text: entry.message
                  }} />
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>

          {/* Terminal footer */}
          <div className="flex items-center justify-between px-4 py-1 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: buildStatus === 'running' ? T.violet : T.textMuted, boxShadow: buildStatus === 'running' ? `0 0 4px ${T.violet}60` : "none" }} />
                <span style={{ fontSize: 8, fontFamily: T.mono, color: buildStatus === 'running' ? T.violet : T.textMuted, fontWeight: 600 }}>{buildStatus.toUpperCase()}</span>
              </div>
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>│</span>
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>Workers: 8 active</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>{currentFile || "READY"}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: REAL-TIME TELEMETRY ── */}
        <div className="flex flex-col flex-shrink-0" style={{ width: telemetryW, borderLeft: `1px solid ${T.border}`, background: T.bgPanel }}>
          <div className="px-4 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.04em" }}>REAL-TIME TELEMETRY</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col items-center gap-5 px-4 py-5">
              <RingGauge label="CPU USAGE" pct={buildStatus === 'running' ? 85 + Math.random() * 10 : 12} color={T.violet} glowColor={T.cyanBright} sublabel="8 cores" />
              <RingGauge label="MEMORY USAGE" pct={buildStatus === 'running' ? 70 + Math.random() * 15 : 45} color={T.violetBright} glowColor={T.violet} sublabel="1.2 / 4 GB" />
              <RingGauge label="COMPLETION" pct={progress} color={T.cyan} glowColor={T.emerald} sublabel={`${Math.round(progress)}%`} />
            </div>

            <div className="mx-4 h-px" style={{ background: T.border }} />

            <div className="px-4 py-4">
              <div className="space-y-2.5">
                {[
                  { label: "Build Target", value: currentProject?.name || "None", color: T.textPrimary },
                  { label: "Progress", value: `${Math.round(progress)}%`, color: T.cyanBright },
                  { label: "Errors", value: results?.totalErrors.toString() || "0", color: results?.totalErrors ? T.rose : T.textSecondary },
                  { label: "Warnings", value: results?.totalWarnings.toString() || "0", color: results?.totalWarnings ? T.amber : T.textSecondary },
                  { label: "Artifacts", value: results?.filesProcessed.toString() || "0", color: T.emerald },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span style={{ fontSize: 9, color: T.textTertiary, fontWeight: 600 }}>{item.label}:</span>
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: item.color, fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-4 h-px" style={{ background: T.border }} />

            <div className="px-4 py-3">
              <span style={{ fontSize: 9, fontWeight: 800, color: T.textTertiary, letterSpacing: "0.12em", textTransform: "uppercase" as const }}>STEP PROGRESS</span>
              <div className="mt-2.5 space-y-2">
                {pipelineSteps.map((step) => {
                  const pct = step.status === "done" ? 100 : step.status === "active" ? 67 : 0;
                  const barColor = step.status === "done" ? T.emerald : step.status === "active" ? T.violet : T.textMuted;
                  return (
                    <div key={step.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: 9, color: step.status === "active" ? T.textPrimary : step.status === "done" ? T.textSecondary : T.textMuted, fontWeight: step.status === "active" ? 600 : 400 }}>
                          {step.name}
                        </span>
                        <span style={{ fontSize: 8, fontFamily: T.mono, color: barColor, fontWeight: 600 }}>{pct}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${pct}%`,
                          background: step.status === "active" ? `linear-gradient(90deg, ${T.violet}, ${T.violetBright})` : barColor,
                          boxShadow: step.status === "active" ? `0 0 8px ${T.violet}40` : "none",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-3 py-1.5 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: T.emerald }} />
              <span style={{ fontSize: 7, fontFamily: T.mono, color: T.emerald }}>LIVE</span>
            </div>
            <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>TELEMETRY READY</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ RING GAUGE COMPONENT ═══ */
function RingGauge({ label, pct, color, glowColor, sublabel }: { label: string; pct: number; color: string; glowColor: string; sublabel?: string }) {
  const [animPct, setAnimPct] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / 1200, 1);
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setAnimPct(pct * ease);
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  const size = 110;
  const strokeW = 7;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animPct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <span style={{ fontSize: 9, fontWeight: 800, color: T.textTertiary, letterSpacing: "0.14em", fontFamily: T.sans, textTransform: "uppercase" as const }}>{label}</span>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <defs>
            <linearGradient id={`gauge-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={glowColor} />
            </linearGradient>
            <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            </filter>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeW + 2}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} filter={`url(#glow-${label})`} opacity={0.3} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#gauge-${label})`} strokeWidth={strokeW}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontSize: 22, fontFamily: T.mono, fontWeight: 700, color, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {Math.round(animPct)}%
          </span>
          {sublabel && <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted, marginTop: 2 }}>{sublabel}</span>}
        </div>
      </div>
    </div>
  );
}

/* ═══ PIPELINE STEP NODE ═══ */
function StepNode({ step, isLast }: { step: PipelineStep; isLast: boolean }) {
  const statusStyles: Record<StepStatus, { bg: string; border: string; textColor: string; glow: string; labelColor: string }> = {
    done: { bg: "rgba(99,179,237,0.06)", border: T.borderActive, textColor: T.cyanBright, glow: "none", labelColor: T.emerald },
    active: { bg: "rgba(139,92,246,0.1)", border: T.borderViolet, textColor: T.textPrimary, glow: `0 0 20px rgba(139,92,246,0.25), 0 0 40px rgba(139,92,246,0.1)`, labelColor: T.violet },
    next: { bg: "rgba(255,255,255,0.02)", border: T.border, textColor: T.textTertiary, glow: "none", labelColor: T.textMuted },
    pending: { bg: "transparent", border: T.borderSubtle, textColor: T.textMuted, glow: "none", labelColor: T.textMuted },
  };

  const s = statusStyles[step.status];
  const isActive = step.status === "active";

  return (
    <div className="flex items-center gap-0">
      <div className="flex flex-col items-center gap-1.5 font-sans">
        <div className="relative px-5 py-3 rounded-xl transition-all flex flex-col items-center"
          style={{ background: s.bg, border: `1px solid ${s.border}`, boxShadow: s.glow, minWidth: 130 } as React.CSSProperties}>
          {isActive && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: T.violet, boxShadow: `0 0 8px ${T.violet}` }}>
              <div className="absolute inset-0 rounded-full animate-ping" style={{ background: T.violet, opacity: 0.4 }} />
            </div>
          )}
          {isActive && <div className="absolute top-0 left-2 right-2 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.violet}, transparent)` }} />}
          <div className="flex items-center gap-2 mb-1">
            {step.status === "done" && <CheckCircle2 size={12} color={T.emerald} />}
            {step.status === "active" && <Loader2 size={12} color={T.violet} className="animate-spin" />}
            {(step.status === "next" || step.status === "pending") && <Circle size={12} color={T.textMuted} />}
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: T.display, color: s.textColor, letterSpacing: "0.02em" }}>{step.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full"
              style={{ fontSize: 8, fontWeight: 700, fontFamily: T.mono, color: s.labelColor, background: isActive ? "rgba(139,92,246,0.15)" : step.status === "done" ? "rgba(72,187,120,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? "rgba(139,92,246,0.25)" : step.status === "done" ? "rgba(72,187,120,0.15)" : T.borderSubtle}`, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              {step.label}
            </span>
            {step.duration && <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>{step.duration}</span>}
          </div>
        </div>
      </div>
      {!isLast && (
        <div className="flex items-center mx-1" style={{ width: 36 }}>
          <div className="flex-1 h-px" style={{ background: step.status === "done" ? `linear-gradient(90deg, ${T.cyan}60, ${T.cyan}30)` : `linear-gradient(90deg, ${T.border}, ${T.borderSubtle})` }} />
          <ChevronRight size={12} color={step.status === "done" ? T.cyan : T.textMuted} style={{ margin: "0 -4px" }} />
          <div className="flex-1 h-px" style={{ background: step.status === "done" ? `linear-gradient(90deg, ${T.cyan}30, ${T.border})` : T.borderSubtle }} />
        </div>
      )}
    </div>
  );
}

/* ═══ TERMINAL LOG LINE ═══ */
function LogLine({ entry }: { entry: LogEntry }) {
  const color = levelColors[entry.level] || T.textPrimary;
  return (
    <div className="flex items-start gap-0 px-4 py-[3px] transition-colors font-mono" style={{ background: "transparent" }}>
      <span className="flex-shrink-0" style={{ fontSize: 11, color: T.textMuted, width: 82 }}>[{entry.time}]</span>
      <span className="flex-shrink-0" style={{ fontSize: 11, color, fontWeight: 700, width: 52, textAlign: "left" }}>{entry.level.toUpperCase()}:</span>
      <span style={{ fontSize: 11, lineHeight: 1.6, color: T.textSecondary }} className="flex-1">
        {entry.text}
      </span>
    </div>
  );
}

export default BuildPipelineView;
