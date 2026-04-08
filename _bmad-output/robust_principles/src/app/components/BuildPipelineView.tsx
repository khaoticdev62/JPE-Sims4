import { useState, useEffect, useRef } from "react";
import {
  Cpu, HardDrive, MemoryStick, Clock, GitCommit,
  ChevronRight, Play, Pause, RotateCcw, Download,
  CheckCircle2, Loader2, Circle, AlertTriangle,
  Terminal, Sparkles, MoreHorizontal, Copy,
  Server, Zap,
} from "lucide-react";
import { useScaledPx } from "./jpe-settings-context";
import { toast } from "sonner";

/* ═══ OBSIDIAN CRYSTAL TOKENS ═══ */
const T = {
  bg: "#020204",
  bgPanel: "#0A0A0C",
  bgSurface: "#0c0c12",
  bgElevated: "#101018",
  bgHover: "#14141e",
  bgGlass: "rgba(6,6,10,0.85)",
  border: "rgba(255,255,255,0.04)",
  borderSubtle: "rgba(255,255,255,0.02)",
  borderActive: "rgba(139,92,246,0.4)",
  borderCyan: "rgba(6,182,212,0.35)",
  violetDim: "rgba(139,92,246,0.12)",
  violet: "#8B5CF6",
  violetBright: "#A78BFA",
  cyan: "#06B6D4",
  cyanBright: "#22D3EE",
  emerald: "#10B981",
  rose: "#F43F5E",
  amber: "#F59E0B",
  blue: "#3B82F6",
  textPrimary: "#E8E8ED",
  textSecondary: "#8B8B9E",
  textTertiary: "#55556A",
  textMuted: "#3D3D52",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  sans: "'Inter', system-ui, sans-serif",
  display: "'Outfit', 'Inter', system-ui, sans-serif",
  glassBlur: "blur(32px)",
};

/* ═══ PIPELINE STEPS ═══ */
type StepStatus = "done" | "active" | "next" | "pending";
interface PipelineStep {
  name: string;
  status: StepStatus;
  duration?: string;
  label: string;
}

const pipelineSteps: PipelineStep[] = [
  { name: "Scoped Scan", status: "done", duration: "0:39s", label: "Done" },
  { name: "Desugaring", status: "done", duration: "1:12s", label: "Done" },
  { name: "STBL Injection", status: "active", label: "Active" },
  { name: "Deployment", status: "next", label: "Next" },
];

/* ═══ LOG ENTRIES ═══ */
type LogLevel = "INFO" | "DEPS" | "STEP" | "DEBUG" | "WARN" | "ERROR" | "SYS";
interface LogEntry {
  time: string;
  level: LogLevel;
  text: string;
  highlight?: string;
}

const logData: LogEntry[] = [
  { time: "14:23:41", level: "INFO", text: "Initializing build pipeline..." },
  { time: "14:23:41", level: "SYS", text: "Pipeline ID: BP_09874 | Node: k8s-node/alpha.02" },
  { time: "14:23:42", level: "DEPS", text: "Loading dependencies (5.2GB)..." },
  { time: "14:23:44", level: "DEPS", text: "Resolved 1,847 packages from registry" },
  { time: "14:23:46", level: "INFO", text: "Dependency tree validated — 0 conflicts" },
  { time: "14:24:01", level: "STEP", text: "Scoped Scan [OK] (0:39s)...", highlight: "OK" },
  { time: "14:24:01", level: "DEBUG", text: "Scanned 12,481 source files across 47 modules" },
  { time: "14:24:03", level: "INFO", text: "AST analysis complete — 248 transformable nodes" },
  { time: "14:24:40", level: "STEP", text: "Desugaring [OK] (1:12s)...", highlight: "OK" },
  { time: "14:24:41", level: "DEBUG", text: "Lowered 1,204 ES2025 constructs to ES5 targets" },
  { time: "14:24:44", level: "INFO", text: "Source map generation complete — 3.8MB" },
  { time: "14:25:52", level: "STEP", text: "STBL Injection [RUNNING]...", highlight: "RUNNING" },
  { time: "14:25:53", level: "DEBUG", text: "Loading STBL manifest: 4,218 string entries" },
  { time: "14:25:55", level: "DEBUG", text: "Modifying dex files [STBL_043]..." },
  { time: "14:25:56", level: "INFO", text: "Injecting locale pack: en_US, ja_JP, de_DE, ko_KR" },
  { time: "14:25:58", level: "WARN", text: "Memory usage high (89%)..." },
  { time: "14:26:00", level: "DEBUG", text: "GC pause: 12ms — heap compacted to 1.2GB" },
  { time: "14:26:02", level: "DEBUG", text: "Process ID 4153 spawned for STBL merge worker" },
  { time: "14:26:04", level: "INFO", text: "Patching binary resources [148/312]..." },
  { time: "14:26:06", level: "DEBUG", text: "Thread pool: 8/8 active | Queue depth: 24" },
];

/* ═══ LOG LEVEL COLORS ═══ */
const levelColors: Record<LogLevel, string> = {
  INFO: T.cyanBright,
  DEPS: T.violetBright,
  STEP: T.emerald,
  DEBUG: T.textTertiary,
  WARN: T.amber,
  ERROR: T.rose,
  SYS: T.textMuted,
};

const levelBg: Record<LogLevel, string> = {
  INFO: "transparent",
  DEPS: "transparent",
  STEP: "rgba(16,185,129,0.03)",
  DEBUG: "transparent",
  WARN: "rgba(245,158,11,0.04)",
  ERROR: "rgba(244,63,94,0.05)",
  SYS: "transparent",
};

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
          {/* Track */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeW} />
          {/* Glow */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeW + 2}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} filter={`url(#glow-${label})`} opacity={0.3} />
          {/* Ring */}
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
    done: {
      bg: "rgba(6,182,212,0.06)",
      border: T.borderCyan,
      textColor: T.cyanBright,
      glow: "none",
      labelColor: T.emerald,
    },
    active: {
      bg: "rgba(139,92,246,0.1)",
      border: T.borderActive,
      textColor: T.textPrimary,
      glow: `0 0 20px rgba(139,92,246,0.25), 0 0 40px rgba(139,92,246,0.1)`,
      labelColor: T.violet,
    },
    next: {
      bg: "rgba(255,255,255,0.02)",
      border: T.border,
      textColor: T.textTertiary,
      glow: "none",
      labelColor: T.textMuted,
    },
    pending: {
      bg: "transparent",
      border: T.borderSubtle,
      textColor: T.textMuted,
      glow: "none",
      labelColor: T.textMuted,
    },
  };

  const s = statusStyles[step.status];
  const isActive = step.status === "active";

  return (
    <div className="flex items-center gap-0">
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="relative px-5 py-3 rounded-xl transition-all flex flex-col items-center"
          style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            boxShadow: s.glow,
            minWidth: 130,
          }}
        >
          {/* Active indicator pulse */}
          {isActive && (
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: T.violet, boxShadow: `0 0 8px ${T.violet}` }}>
              <div className="absolute inset-0 rounded-full animate-ping" style={{ background: T.violet, opacity: 0.4 }} />
            </div>
          )}
          {/* Top glow line for active */}
          {isActive && <div className="absolute top-0 left-2 right-2 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.violet}, transparent)` }} />}

          <div className="flex items-center gap-2 mb-1">
            {step.status === "done" && <CheckCircle2 size={12} color={T.emerald} />}
            {step.status === "active" && <Loader2 size={12} color={T.violet} className="animate-spin" />}
            {(step.status === "next" || step.status === "pending") && <Circle size={12} color={T.textMuted} />}
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: T.display, color: s.textColor, letterSpacing: "0.02em" }}>
              {step.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full"
              style={{
                fontSize: 8,
                fontWeight: 700,
                fontFamily: T.mono,
                color: s.labelColor,
                background: isActive ? "rgba(139,92,246,0.15)" : step.status === "done" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? "rgba(139,92,246,0.25)" : step.status === "done" ? "rgba(16,185,129,0.15)" : T.borderSubtle}`,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
              }}
            >
              {step.label}
            </span>
            {step.duration && (
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>{step.duration}</span>
            )}
          </div>
        </div>
      </div>

      {/* Connector arrow */}
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
  const color = levelColors[entry.level];
  const bg = levelBg[entry.level];
  const isWarn = entry.level === "WARN";
  const isStep = entry.level === "STEP";

  // Highlight [OK], [RUNNING], etc.
  const renderText = (text: string, highlight?: string) => {
    if (!highlight) return <span style={{ color: entry.level === "DEBUG" ? T.textTertiary : T.textSecondary }}>{text}</span>;
    const parts = text.split(`[${highlight}]`);
    if (parts.length < 2) return <span style={{ color: T.textSecondary }}>{text}</span>;
    const hlColor = highlight === "OK" ? T.emerald : highlight === "RUNNING" ? T.violet : T.amber;
    return (
      <>
        <span style={{ color: T.textSecondary }}>{parts[0]}</span>
        <span style={{ color: hlColor, fontWeight: 700 }}>[{highlight}]</span>
        <span style={{ color: T.textSecondary }}>{parts[1]}</span>
      </>
    );
  };

  return (
    <div
      className="flex items-start gap-0 px-4 py-[3px] transition-colors"
      style={{
        background: bg,
        borderLeft: isWarn ? `2px solid ${T.amber}` : isStep ? `2px solid ${T.emerald}` : "2px solid transparent",
        fontFamily: T.mono,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = T.bgHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = bg; }}
    >
      <span className="flex-shrink-0" style={{ fontSize: 11, color: T.textMuted, width: 82 }}>
        [{entry.time}]
      </span>
      <span className="flex-shrink-0" style={{ fontSize: 11, color, fontWeight: 700, width: 52, textAlign: "left" }}>
        {entry.level}:
      </span>
      <span style={{ fontSize: 11, lineHeight: 1.6 }}>
        {renderText(entry.text, entry.highlight)}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN BUILD PIPELINE VIEW
   ═══════════════════════════════════════════════════════════════ */
export function BuildPipelineView() {
  const telemetryW = useScaledPx(240);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(141); // seconds from 14:23:41
  const [paused, setPaused] = useState(false);
  const [logCopied, setLogCopied] = useState(false);

  const copyLogs = () => {
    navigator.clipboard.writeText(logData.map(l => `[${l.time}] ${l.level}: ${l.text}`).join("\n")).catch(() => {});
    setLogCopied(true);
    setTimeout(() => setLogCopied(false), 1200);
    toast.success("Logs copied to clipboard!");
  };

  // Auto-scroll log & elapsed timer
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
    if (paused) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [paused]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ background: T.bg, fontFamily: T.sans, color: T.textPrimary }}>

      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between px-5 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${T.cyan}20, ${T.violet}20)`, border: `1px solid ${T.cyan}30` }}>
              <Zap size={14} color={T.cyan} />
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 800, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.05em" }}>BUILD PIPELINE</span>
            </div>
          </div>
          <div className="w-px h-5" style={{ background: T.border }} />
          <div className="flex items-center gap-1.5">
            <Loader2 size={11} color={T.violet} className="animate-spin" />
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: T.display, color: T.textPrimary }}>BUILD STATUS:</span>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: T.mono, color: T.violet }}>STBL INJECTION</span>
            <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary }}>(STEP 3/4)</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 8, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.1em" }}>PIPELINE ID:</span>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.cyanBright, fontWeight: 600 }}>BP_09874</span>
          </div>
          <div className="w-px h-3.5" style={{ background: T.border }} />
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 8, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.1em" }}>COMMIT:</span>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.violetBright, fontWeight: 600 }}>[b4a1c72]</span>
          </div>
          <div className="w-px h-3.5" style={{ background: T.border }} />
          <div className="flex items-center gap-1.5">
            <button className="p-1 rounded hover:bg-white/5 transition-colors" onClick={() => setPaused(false)}><Play size={11} color={T.emerald} /></button>
            <button className="p-1 rounded hover:bg-white/5 transition-colors" onClick={() => setPaused(true)}><Pause size={11} color={T.textTertiary} /></button>
            <button className="p-1 rounded hover:bg-white/5 transition-colors" onClick={() => { setPaused(false); setElapsed(0); }}><RotateCcw size={11} color={T.textTertiary} /></button>
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
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>{logData.length} lines</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded hover:bg-white/5" title="Copy logs" onClick={copyLogs}>{logCopied ? <CheckCircle2 size={10} color={T.emerald} /> : <Copy size={10} color={T.textTertiary} />}</button>
              <button className="p-1 rounded hover:bg-white/5" title="Download logs" onClick={copyLogs}><Download size={10} color={T.textTertiary} /></button>
              <button className="p-1 rounded hover:bg-white/5" title="Toggle pause" onClick={() => setPaused(p => !p)}>{paused ? <Play size={10} color={T.emerald} /> : <Pause size={10} color={T.textTertiary} />}</button>
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
            }}>
              {/* Top glow edge */}
              <div className="absolute top-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.cyan}30, ${T.violet}20, transparent)` }} />
              {/* Left glow edge */}
              <div className="absolute top-4 left-0 bottom-4 w-px" style={{ background: `linear-gradient(180deg, transparent, ${T.cyan}15, transparent)` }} />

              {/* Terminal content */}
              <div
                ref={logContainerRef}
                className="h-full overflow-y-auto py-3"
                style={{ scrollBehavior: "smooth" }}
              >
                {logData.map((entry, i) => (
                  <LogLine key={`log-${i}`} entry={entry} />
                ))}

                {/* Blinking cursor at bottom */}
                <div className="flex items-center gap-0 px-4 py-[3px]" style={{ fontFamily: T.mono }}>
                  <span style={{ fontSize: 11, color: T.textMuted, width: 82 }}>[{new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}]</span>
                  <span className="inline-block w-2 h-4 animate-pulse" style={{ background: T.cyan, opacity: 0.7 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Terminal footer */}
          <div className="flex items-center justify-between px-4 py-1 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.violet, boxShadow: `0 0 4px ${T.violet}60` }} />
                <span style={{ fontSize: 8, fontFamily: T.mono, color: T.violet, fontWeight: 600 }}>BUILDING</span>
              </div>
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>│</span>
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>PID: 4153</span>
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>│</span>
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>Workers: 8/8</span>
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>│</span>
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>Queue: 24</span>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>stdout</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: REAL-TIME TELEMETRY ── */}
        <div className="flex flex-col flex-shrink-0" style={{ width: telemetryW, borderLeft: `1px solid ${T.border}`, background: T.bgPanel }}>
          {/* Telemetry header */}
          <div className="px-4 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.04em" }}>REAL-TIME TELEMETRY</span>
          </div>

          {/* Ring gauges */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center gap-5 px-4 py-5">
              <RingGauge label="CPU USAGE" pct={91} color={T.violet} glowColor={T.cyanBright} sublabel="8 cores" />
              <RingGauge label="MEMORY USAGE" pct={89} color={T.violetBright} glowColor={T.violet} sublabel="1.2 / 1.4 GB" />
              <RingGauge label="DISK I/O" pct={74} color={T.cyan} glowColor={T.emerald} sublabel="842 MB/s" />
            </div>

            {/* Separator */}
            <div className="mx-4 h-px" style={{ background: T.border }} />

            {/* Build metadata */}
            <div className="px-4 py-4">
              <div className="space-y-2.5">
                {[
                  { label: "Build Start", value: "14:23:41", color: T.textPrimary },
                  { label: "Duration", value: formatDuration(elapsed), color: T.cyanBright },
                  { label: "Node", value: "k8s-node/alpha.02", color: T.textSecondary },
                  { label: "Status", value: "Processing", color: T.violet, badge: true },
                  { label: "Threads", value: "8 active", color: T.textSecondary },
                  { label: "Heap", value: "1.2 GB / 1.4 GB", color: T.amber },
                  { label: "GC Pauses", value: "3 (avg 12ms)", color: T.textTertiary },
                  { label: "Artifacts", value: "148 / 312", color: T.emerald },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span style={{ fontSize: 9, color: T.textTertiary, fontWeight: 600 }}>{item.label}:</span>
                    {item.badge ? (
                      <span className="px-2 py-0.5 rounded" style={{ fontSize: 8, fontFamily: T.mono, fontWeight: 700, color: item.color, background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                        {item.value}
                      </span>
                    ) : (
                      <span style={{ fontSize: 9, fontFamily: T.mono, color: item.color, fontWeight: 500 }}>{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="mx-4 h-px" style={{ background: T.border }} />

            {/* Step Progress Summary */}
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

          {/* Telemetry footer */}
          <div className="px-3 py-1.5 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: T.emerald }} />
              <span style={{ fontSize: 7, fontFamily: T.mono, color: T.emerald }}>LIVE</span>
            </div>
            <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>1s interval</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuildPipelineView;