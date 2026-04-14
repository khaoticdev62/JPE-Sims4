"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Activity, Wifi, ChevronRight, Sparkles, Shield,
  Zap, AlertTriangle,
  MoreHorizontal, Eye,
  Brain, CircleDot, Layers,
  Terminal,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

// Store & Service Imports
import { useActivityStore } from "@/stores/useActivityStore";
import { OllamaService } from "@/services/ai/OllamaService";
import { toast } from "sonner";

// High-Fidelity Asset: Diagnostic Nexus Hero
const nexusCoreImage = "/assets/diagnostic_nexus_hero.svg";
import {
  motion, StaggerList, StaggerItem,
  FadeIn,
} from "./jpe-motion";
import { useScaledPx } from "./jpe-settings-context";
import { type Diagnostic } from "@/types";

/* ═══ TYPES ═══ */
interface DiagnosticNexusViewProps {
  diagnostics?: Diagnostic[];
  isAiScanning?: boolean;
  onNavigate?: (mode: string) => void;
}

/* ═══════════════════════════════════════════════════════════════════
   DIAGNOSTIC NEXUS — TOKENS
   ═══════════════════════════════════════════════════════════════════ */
const N = {
  bg: "#0a0c10",
  bgPanel: "#0f1116",
  bgSurface: "#13151c",
  bgElevated: "#181b24",
  bgHover: "#1b1f2a",
  bgGlass: "rgba(15, 17, 22, 0.82)",
  bgGlassLight: "rgba(22, 25, 34, 0.72)",
  border: "rgba(255, 255, 255, 0.06)",
  borderSubtle: "rgba(255, 255, 255, 0.03)",
  borderCyan: "rgba(99, 179, 237, 0.25)",
  borderViolet: "rgba(139, 92, 246, 0.3)",
  borderEmerald: "rgba(72, 187, 120, 0.25)",
  cyan: "#63B3ED",
  cyanBright: "#90CDF4",
  cyanDim: "rgba(99, 179, 237, 0.08)",
  cyanMid: "rgba(99, 179, 237, 0.15)",
  violet: "#8B5CF6",
  violetBright: "#A78BFA",
  violetDim: "rgba(139, 92, 246, 0.08)",
  violetMid: "rgba(139, 92, 246, 0.15)",
  emerald: "#48BB78",
  emeraldBright: "#34D399",
  emeraldDim: "rgba(72, 187, 120, 0.08)",
  rose: "#FC8181",
  roseBright: "#FB7185",
  roseDim: "rgba(252, 129, 129, 0.08)",
  amber: "#F6AD55",
  amberBright: "#FBBF24",
  amberDim: "rgba(246, 173, 85, 0.08)",
  textPrimary: "#E2E8F0",
  textSecondary: "#A0AEC0",
  textTertiary: "#718096",
  textMuted: "#4A5568",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  sans: "'Inter', system-ui, sans-serif",
  glassBlur: "blur(24px)",
  noiseSvg: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
};


interface StackFrame {
  fn: string;
  file: string;
  line: number;
  isCorrupt?: boolean;
  isHighlight?: boolean;
}

const _stackFrames: StackFrame[] = [
  { fn: "Traceback (most recent call last)", file: "", line: 0 },
  { fn: "main()", file: "game_logic.py", line: 42 },
  { fn: "run_simulation()", file: "simulation.py", line: 318 },
  { fn: "process_events()", file: "event_handler.py", line: 127 },
  { fn: "resolve_interactions()", file: "interaction_mgr.py", line: 89, isHighlight: true },
  { fn: "apply_trait_effects()", file: "trait_system.py", line: 204, isCorrupt: true },
  { fn: 'TypeError: cannot concatenate \'str\' and \'int\' objects', file: "game_logic.py", line: 142 },
];

interface PatchAction {
  title: string;
  desc: string;
  confidence: number;
  variant: "primary" | "secondary" | "tertiary";
  icon: LucideIcon;
}

const _patchActions: PatchAction[] = [
  { title: "DEPLOY PATCH", desc: "Automatic Type Cast — str(count)", confidence: 98, variant: "primary", icon: Zap },
  { title: "VIEW CODE DIFF", desc: "Compare original vs patched output", confidence: 95, variant: "secondary", icon: Eye },
  { title: "IGNORE", desc: "Suppress this intercept", confidence: 0, variant: "tertiary", icon: AlertTriangle },
];

/* ═══ UTILITY COMPONENTS ═══ */
function GlassPanel({ children, className = "", style = {}, glow }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; glow?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: N.bgGlass,
        backdropFilter: N.glassBlur,
        WebkitBackdropFilter: N.glassBlur,
        border: `1px solid ${N.border}`,
        borderRadius: 12,
        boxShadow: glow ? `0 0 30px ${glow}, inset 0 1px 0 rgba(255,255,255,0.03)` : `inset 0 1px 0 rgba(255,255,255,0.03)`,
        ...style,
      }}
    >
      {/* noise texture overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: N.noiseSvg, opacity: 0.5 } as React.CSSProperties} />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

function NexusEyebrow({ children, color = N.textTertiary }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="uppercase select-none tracking-[0.16em]" style={{ fontFamily: N.sans, fontSize: 10, fontWeight: 700, color } as React.CSSProperties}>
      {children}
    </span>
  );
}

function SeverityPip({ color, pulse = false }: { color: string; pulse?: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 10, height: 10 } as React.CSSProperties}>
      <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}90` } as React.CSSProperties} />
      {pulse && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: color, opacity: 0.25 } as React.CSSProperties} />}
    </div>
  );
}

/* ═══ CONFIDENCE GAUGE ═══ */
function ConfidenceGauge({ value }: { value: number }) {
  const radius = 52;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (value / 100) * circumference;
  const gradientId = "gauge-grad-nexus";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 120, height: 120 } as React.CSSProperties}>
        <svg width="120" height="120" className="transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={N.violet} />
              <stop offset="50%" stopColor={N.cyan} />
              <stop offset="100%" stopColor={N.emerald} />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r={radius} fill="none" stroke={N.border} strokeWidth={stroke} />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={`url(#${gradientId})`} strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease-in-out", filter: `drop-shadow(0 0 6px ${N.cyan}60)` } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontFamily: N.mono, fontSize: 28, fontWeight: 800, color: N.textPrimary, lineHeight: 1 } as React.CSSProperties}>
            {value}%
          </span>
          <span style={{ fontFamily: N.sans, fontSize: 9, color: N.textTertiary, marginTop: 2 } as React.CSSProperties}>CONFIDENCE</span>
        </div>
      </div>
    </div>
  );
}

/* ═══ HOLOGRAPHIC TRACE — CANVAS VISUALIZATION ═══ */
function HolographicTrace({ selectedFrame }: { selectedFrame: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrame = useRef(0);
  const timeRef = useRef(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.clearRect(0, 0, w, h);

    // Grid floor
    ctx.strokeStyle = `rgba(0,220,255,0.04)`;
    ctx.lineWidth = 0.5;
    const gridSpacing = 30;
    for (let x = 0; x < w; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, h * 0.6);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = h * 0.6; y < h; y += gridSpacing * 0.6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Neural network nodes
    const layers = [4, 6, 8, 6, 4];
    const layerX = layers.map((_, i) => w * 0.15 + (w * 0.7 * i) / (layers.length - 1));
    const nodePositions: { x: number; y: number; layer: number; idx: number }[] = [];

    layers.forEach((count, li) => {
      const centerY = h * 0.32;
      const spread = Math.min(h * 0.4, count * 28);
      for (let ni = 0; ni < count; ni++) {
        const y = centerY - spread / 2 + (spread * ni) / (count - 1 || 1);
        const x = layerX[li] + Math.sin(t * 0.002 + ni + li) * 3;
        nodePositions.push({ x, y: y + Math.cos(t * 0.0015 + li * 0.5) * 4, layer: li, idx: ni });
      }
    });

    // Draw connections
    let prevLayerStart = 0;
    layers.forEach((count, li) => {
      if (li === 0) { prevLayerStart = 0; return; }
      const prevCount = layers[li - 1];
      const currStart = prevLayerStart + prevCount;
      for (let pi = 0; pi < prevCount; pi++) {
        for (let ci = 0; ci < count; ci++) {
          const from = nodePositions[prevLayerStart + pi];
          const to = nodePositions[currStart + ci];
          const isCorruptPath = li === 3 && (ci === 2 || ci === 3);
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          if (isCorruptPath) {
            ctx.strokeStyle = `rgba(139,92,246,${0.15 + Math.sin(t * 0.004) * 0.08})`;
            ctx.lineWidth = 1.2;
          } else {
            ctx.strokeStyle = `rgba(0,220,255,${0.06 + Math.sin(t * 0.003 + pi + ci) * 0.02})`;
            ctx.lineWidth = 0.4;
          }
          ctx.stroke();
        }
      }
      prevLayerStart = currStart;
    });

    // Draw nodes
    nodePositions.forEach((node) => {
      const isCorrupt = node.layer === 3 && (node.idx === 2 || node.idx === 3);
      const isActive = node.layer === selectedFrame;
      const pulseAlpha = 0.5 + Math.sin(t * 0.005 + node.idx) * 0.3;

      ctx.beginPath();
      ctx.arc(node.x, node.y, isCorrupt ? 5 : 3.5, 0, Math.PI * 2);
      if (isCorrupt) {
        ctx.fillStyle = `rgba(139,92,246,${pulseAlpha})`;
        ctx.shadowColor = N.violet;
        ctx.shadowBlur = 15;
      } else if (isActive) {
        ctx.fillStyle = `rgba(0,220,255,${pulseAlpha})`;
        ctx.shadowColor = N.cyan;
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = `rgba(0,220,255,0.25)`;
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Corruption glow ring
      if (isCorrupt) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 10 + Math.sin(t * 0.006) * 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139,92,246,${0.12 + Math.sin(t * 0.004) * 0.06})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Floating particles
    for (let i = 0; i < 30; i++) {
      const px = (Math.sin(t * 0.001 + i * 2.1) * 0.5 + 0.5) * w;
      const py = (Math.cos(t * 0.0008 + i * 1.7) * 0.5 + 0.5) * h * 0.7;
      const alpha = 0.1 + Math.sin(t * 0.003 + i) * 0.08;
      ctx.beginPath();
      ctx.arc(px, py, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,220,255,${alpha})`;
      ctx.fill();
    }

    // Corruption label
    const corruptNode = nodePositions.find(n => n.layer === 3 && n.idx === 2);
    if (corruptNode) {
      ctx.font = `600 9px ${N.sans}`;
      ctx.fillStyle = `rgba(167,139,250,${0.6 + Math.sin(t * 0.004) * 0.2})`;
      ctx.textAlign = "center";
      ctx.fillText("CORRUPTION NODE", corruptNode.x, corruptNode.y - 18);
      ctx.font = `500 8px ${N.mono}`;
      ctx.fillStyle = N.textTertiary;
      ctx.fillText("trait_system.py:204", corruptNode.x, corruptNode.y - 8);
    }
  }, [selectedFrame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const loop = (ts: number) => {
      timeRef.current = ts;
      const rect = canvas.parentElement!.getBoundingClientRect();
      draw(ctx, rect.width, rect.height, ts);
      animFrame.current = requestAnimationFrame(loop);
    };
    animFrame.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrame.current);
      ro.disconnect();
    };
  }, [draw]);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN: DIAGNOSTIC NEXUS VIEW
   ═══════════════════════════════════════════════════════════════════ */
export function DiagnosticNexusView({ diagnostics: _diagnostics, isAiScanning: _isAiScanning, onNavigate: _onNavigate }: DiagnosticNexusViewProps) {
  const leftW = useScaledPx(260);
  const rightW = useScaledPx(280);
  
  const activities = useActivityStore(state => state.activities);
  
  const [selectedIntercept, setSelectedIntercept] = useState(0);
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "scanning" | "complete">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [neuralLinkPulse, setNeuralLinkPulse] = useState(true);
  const [aiFix, setAiFix] = useState<any>(null);

  // Map activities to intercepts
  const displayIntercepts = activities
    .filter(a => a.type === 'exception' || a.type === 'bridge_event')
    .map(a => ({
      id: a.id.split('-').pop()?.toUpperCase() || "INT",
      title: a.fileName,
      subtitle: `[${a.type.toUpperCase()}]`,
      severity: a.type === 'exception' ? 'critical' : 'info',
      time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      color: a.type === 'exception' ? N.rose : N.cyan,
      payload: (a as any).payload // Assuming payload has traceback if any
    }));

  // Neural link pulse
  useEffect(() => {
    const t = setInterval(() => setNeuralLinkPulse(p => !p), 2000);
    return () => clearInterval(t);
  }, []);

  const handleDeployPatch = async () => {
    const active = displayIntercepts[selectedIntercept];
    if (!active) return;

    setAnalysisStatus("scanning");
    setScanProgress(0);
    
    // Industrial Simulation of AI analysis
    const timer = setInterval(() => {
      setScanProgress(p => p < 90 ? p + 5 : p);
    }, 150);

    try {
      const ollama = OllamaService.getInstance();
      const traceback = active.title + (active as any).payload?.traceback || "";
      const result = await ollama.analyzeException(traceback);

      if (result.success && result.report) {
        setAiFix(result.report);
        setAnalysisStatus("complete");
      } else {
        setAnalysisStatus("idle");
      }
    } catch (err) {
      console.error("[Nexus] Flash-Fix Failed:", err);
      setAnalysisStatus("idle");
    } finally {
      clearInterval(timer);
      setScanProgress(100);
    }
  };

  const handleSystemReload = async () => {
    const activeIntercept = displayIntercepts[selectedIntercept];
    const moduleName = (activeIntercept as any)?.payload?.module || null;
    
    if (typeof window !== "undefined" && (window as any).electron?.invoke) {
      toast.info("Dispatching Reload Command", {
        description: moduleName ? `Targeting: ${moduleName}` : "Targeting all modules"
      });
      await (window as any).electron.invoke('bridge:sendCommand', 'RELOAD', { module: moduleName });
    }
  };

  const activeIntercept = displayIntercepts[selectedIntercept];

  return (
    <div className="flex flex-col h-full w-full" style={{ background: N.bg, fontFamily: N.sans, color: N.textPrimary } as React.CSSProperties}>
      {/* ─── HEADER BAR ─── */}
      <div
        className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
        style={{
          background: "rgba(5,5,5,0.95)",
          backdropFilter: N.glassBlur,
          borderBottom: `1px solid ${N.border}`,
        }}
      >
        <div className="flex items-center gap-3">
          {/* JPE Logo */}
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 28, height: 28, background: `linear-gradient(135deg, ${N.violet}, ${N.cyan})` } as React.CSSProperties}
          >
            <span style={{ fontFamily: N.sans, fontSize: 11, fontWeight: 800, color: "#fff" } as React.CSSProperties}>JP</span>
          </div>
          <div className="flex flex-col">
            <span style={{ fontSize: 9, color: N.textTertiary, letterSpacing: "0.1em" } as React.CSSProperties}>JPE STUDIO</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: N.textPrimary } as React.CSSProperties}>BetterExceptions AI</span>
          </div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 ml-4">
            {["Sentinel", "Intercepts", "CR-8822", "AI Deep Scan"].map((crumb, i) => (
              <div key={crumb} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={10} color={N.textMuted} />}
                <span
                  className="cursor-pointer transition-colors hover:text-white"
                  style={{
                    fontSize: 11,
                    color: i === 3 ? N.cyan : N.textTertiary,
                    fontWeight: i === 3 ? 600 : 400,
                  }}
                >
                  {crumb}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Neural Link Status */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Activity size={13} color={N.emerald} />
              {neuralLinkPulse && (
                <div
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-ping"
                  style={{ background: N.emerald } as React.CSSProperties}
                />
              )}
            </div>
            <span style={{ fontSize: 10, color: N.emerald, fontWeight: 600, letterSpacing: "0.05em" } as React.CSSProperties}>
              ACTIVE NEURAL LINK
            </span>
          </div>
          <div className="h-4 w-px" style={{ background: N.border } as React.CSSProperties} />
          <Wifi size={13} color={N.textTertiary} />
          <MoreHorizontal size={14} color={N.textTertiary} className="cursor-pointer" />
        </div>
      </div>

      {/* ─── MAIN TRIPTYCH ─── */}
      <div className="flex flex-1 min-h-0 gap-2 p-2">
        {/* ════ LEFT: SIGNAL INTERCEPTS ════ */}
        <FadeIn delay={0.05} className="flex flex-col" style={{ width: leftW, flexShrink: 0 } as React.CSSProperties}>
        <GlassPanel className="flex flex-col h-full">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${N.border}` } as React.CSSProperties}>
            <div className="flex items-center gap-2">
              <Shield size={13} color={N.cyan} />
              <NexusEyebrow color={N.textSecondary}>Signal Intercept</NexusEyebrow>
            </div>
            <MoreHorizontal size={13} color={N.textMuted} className="cursor-pointer" />
          </div>

          <div className="flex-1 overflow-y-auto py-1">
            {displayIntercepts.map((item, i) => {
              const isActive = i === selectedIntercept;
              return (
                <div
                  key={item.id}
                  className="relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-all"
                  style={{
                    background: isActive ? `rgba(0,220,255,0.04)` : "transparent",
                    borderLeft: isActive ? `2px solid ${N.cyan}` : "2px solid transparent",
                  }}
                  onClick={() => {
                    setSelectedIntercept(i);
                    setSelectedFrame(0);
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = N.bgHover; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                    <SeverityPip
                      color={item.severity === "critical" ? N.rose : item.severity === "warning" ? N.amber : N.cyan}
                      pulse={item.severity === "critical" && isActive}
                    />
                    {i < displayIntercepts.length - 1 && (
                      <div className="w-px flex-1 min-h-[20px]" style={{ background: `linear-gradient(to bottom, ${item.color}30, transparent)` } as React.CSSProperties} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: N.mono, fontSize: 11, fontWeight: 700, color: N.textPrimary } as React.CSSProperties}>
                        {item.id}:
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: N.textSecondary, marginTop: 1 } as React.CSSProperties}>{item.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span style={{
                        fontFamily: N.mono, fontSize: 9, fontWeight: 700,
                        color: item.severity === "critical" ? N.rose : item.severity === "warning" ? N.amber : N.cyan,
                      }}>
                        {item.subtitle}
                      </span>
                      <span className="text-[9px]" style={{ color: N.textMuted } as React.CSSProperties}>|</span>
                      <SeverityPip color={item.color} />
                      <span style={{ fontSize: 9, color: N.textMuted, fontFamily: N.mono } as React.CSSProperties}>{item.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
        </FadeIn>

        {/* ════ CENTER: AI DIAGNOSTIC NEXUS ════ */}
        <FadeIn delay={0.1} className="flex-1 flex flex-col">
        <GlassPanel className="flex-1 flex flex-col" glow="rgba(0,220,255,0.04)">
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${N.border}` } as React.CSSProperties}>
            <div className="flex items-center gap-3">
              <Brain size={14} color={N.violet} />
              <span style={{ fontSize: 14, fontWeight: 700, color: N.textPrimary } as React.CSSProperties}>AI Diagnostic Nexus</span>
            </div>
            <MoreHorizontal size={14} color={N.textMuted} className="cursor-pointer" />
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-6 px-5 py-2.5" style={{ borderBottom: `1px solid ${N.borderSubtle}` } as React.CSSProperties}>
            <div className="flex flex-col gap-0.5">
              <span style={{ fontSize: 9, color: N.textTertiary, letterSpacing: "0.08em" } as React.CSSProperties}>STATUS</span>
              <span style={{
                fontFamily: N.mono, fontSize: 12, fontWeight: 700,
                color: analysisStatus === "complete" ? N.emerald : N.amber,
              }}>
                {analysisStatus === "complete" ? "COMPLETE" : `ANALYZING (${Math.round(scanProgress)}%)`}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span style={{ fontSize: 9, color: N.textTertiary, letterSpacing: "0.08em" } as React.CSSProperties}>SEVERITY</span>
              <span style={{ fontFamily: N.mono, fontSize: 12, fontWeight: 700, color: N.rose } as React.CSSProperties}>High</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span style={{ fontSize: 9, color: N.textTertiary, letterSpacing: "0.08em" } as React.CSSProperties}>ROOT CAUSE</span>
              <span style={{ fontFamily: N.mono, fontSize: 12, fontWeight: 600, color: N.textPrimary } as React.CSSProperties}>Type Mismatch</span>
            </div>
          </div>

          {/* Traceback text */}
          <div className="px-5 py-3" style={{ borderBottom: `1px solid ${N.borderSubtle}` } as React.CSSProperties}>
            <div style={{ fontFamily: N.mono, fontSize: 11, color: N.textTertiary } as React.CSSProperties}>
              Traceback (most recent call last)
            </div>
            <div style={{ fontFamily: N.mono, fontSize: 11, color: N.rose, marginTop: 2 } as React.CSSProperties}>
              {activeIntercept?.title || "No selective intercept"}
            </div>
            <div style={{ fontFamily: N.mono, fontSize: 10, color: N.textMuted, marginTop: 1, whiteSpace: 'pre-wrap', maxHeight: '60px', overflowY: 'auto' } as React.CSSProperties}>
              {(activeIntercept as any)?.payload?.traceback?.substring(0, 500) || "Sensor monitoring active..."}
            </div>
          </div>

          {/* Holographic Trace Visualization */}
          <div className="flex-1 relative overflow-hidden">
            {/* Nexus core hero image — subtle backdrop */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={nexusCoreImage}
                alt="Diagnostic Nexus Core"
                className="w-full h-full object-cover"
                style={{
                  filter: "brightness(0.18) saturate(1.4) contrast(1.2)",
                  opacity: 0.45,
                }}
              />
            </div>
            {/* Radial gradient overlay to blend hero with canvas */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at center, rgba(10,12,16,0.3) 0%, rgba(10,12,16,0.85) 60%, ${N.bg} 100%)`,
              }}
            />
            {/* Gradient border glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(ellipse at center, rgba(139,92,246,0.04) 0%, transparent 70%)`,
            }} />
            <HolographicTrace selectedFrame={selectedFrame} />

            {/* Stack Trace label overlay */}
            <div className="absolute top-4 left-5 px-3 py-1.5 rounded-lg" style={{
              background: "rgba(5,5,5,0.7)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: `1px solid ${N.border}`,
            }}>
              <span style={{ fontSize: 10, fontFamily: N.mono, color: N.textTertiary } as React.CSSProperties}>Stack trace</span>
            </div>

            {/* Floating error context */}
            <div className="absolute bottom-4 right-4 px-3 py-2 rounded-lg max-w-[200px]" style={{
              background: "rgba(5,5,5,0.8)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: `1px solid ${N.borderViolet}`,
              boxShadow: `0 0 20px rgba(139,92,246,0.1)`,
            }}>
              <div style={{ fontSize: 9, color: N.violetBright, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 3 } as React.CSSProperties}>
                {aiFix ? "RESOLUTION FOUND" : "CORRUPTION DETECTED"}
              </div>
              <div style={{ fontFamily: N.mono, fontSize: 10, color: N.textSecondary } as React.CSSProperties}>
                {aiFix?.rootCause || "Monitoring Layer 4..."}
              </div>
              <div style={{ fontFamily: N.mono, fontSize: 10, color: N.textMuted, marginTop: 1 } as React.CSSProperties}>
                {aiFix?.affectedSystems?.join(' / ') || "Awaiting signal parity"}
              </div>
            </div>
          </div>

          {/* Bottom status */}
          <div className="flex items-center justify-between px-5 py-2" style={{ borderTop: `1px solid ${N.border}`, background: "rgba(5,5,5,0.5)" } as React.CSSProperties}>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 9, color: N.textTertiary } as React.CSSProperties}>Status:</span>
                <span style={{
                  fontFamily: N.mono, fontSize: 10, fontWeight: 600,
                  color: analysisStatus === "complete" ? N.emerald : N.amber,
                }}>
                  {analysisStatus === "complete" ? "COMPLETE" : `ANALYZING (${Math.round(scanProgress)}%)`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 9, color: N.textTertiary } as React.CSSProperties}>Severity:</span>
                <span style={{ fontFamily: N.mono, fontSize: 10, fontWeight: 600, color: N.rose } as React.CSSProperties}>
                  {aiFix?.severity?.toUpperCase() || (activeIntercept?.severity === 'critical' ? 'CRITICAL' : 'HIGH')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 9, color: N.textTertiary } as React.CSSProperties}>Root Cause:</span>
                <span style={{ fontFamily: N.mono, fontSize: 10, fontWeight: 600, color: N.textSecondary } as React.CSSProperties}>
                  {aiFix ? "IDENTIFIED" : "UNKNOWN"}
                </span>
              </div>
            </div>
          </div>
        </GlassPanel>
        </FadeIn>

        {/* ════ RIGHT: AI SOLUTION MATRIX ════ */}
        <FadeIn delay={0.15} className="flex flex-col" style={{ width: rightW, flexShrink: 0 } as React.CSSProperties}>
        <GlassPanel className="flex flex-col h-full" glow="rgba(139,92,246,0.03)">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${N.border}` } as React.CSSProperties}>
            <div className="flex items-center gap-2">
              <Sparkles size={13} color={N.violet} />
              <NexusEyebrow color={N.textSecondary}>AI Solution Matrix</NexusEyebrow>
            </div>
          </div>

          {/* Self-Healing Patch dropdown */}
          <div className="mx-3 mt-3">
            <div
              className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer"
              style={{
                background: N.bgElevated as any,
                border: `1px solid ${N.border}`,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: N.textPrimary } as React.CSSProperties}>Self-Healing Patch</span>
              <ChevronDown size={13} color={N.textTertiary} />
            </div>
          </div>

          {/* Confidence Gauge */}
          <div className="flex flex-col items-center py-4">
            <ConfidenceGauge value={98} />
          </div>

          {/* Recommended Solution */}
          <div className="mx-3 mb-3">
            <div className="rounded-xl p-3" style={{
              background: N.bgGlassLight,
              border: `1px solid ${N.borderCyan}`,
              boxShadow: `0 0 20px rgba(0,220,255,0.05)`,
            }}>
              <div style={{ fontSize: 9, color: N.textTertiary, letterSpacing: "0.1em", marginBottom: 4 } as React.CSSProperties}>
                RECOMMENDED SOLUTION
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: N.textPrimary } as React.CSSProperties}>
                {aiFix ? "Apply Flash-Fix" : "Select Intercept"}
              </div>
              <div style={{ fontSize: 11, color: N.emerald, fontWeight: 600, marginTop: 2 } as React.CSSProperties}>
                {aiFix ? "Deep Scan Optimal" : "Awaiting Analysis"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <StaggerList className="flex flex-col gap-2 mx-3">
            {/* Deploy Patch - Primary */}
            <StaggerItem>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleDeployPatch}
              disabled={analysisStatus === "scanning"}
              className="w-full py-2.5 rounded-lg transition-colors"
              style={{
                backgroundImage: analysisStatus === "scanning" 
                  ? `linear-gradient(135deg, ${N.bgElevated}, ${N.bgSurface})`
                  : `linear-gradient(135deg, ${N.emerald}, ${N.emeraldBright})`,
                border: "none",
                fontFamily: N.mono,
                fontSize: 11,
                fontWeight: 800,
                color: analysisStatus === "scanning" ? N.textMuted : "#050505",
                letterSpacing: "0.1em",
                boxShadow: analysisStatus === "scanning" ? "none" : `0 0 20px rgba(16,185,129,0.3)`,
                cursor: analysisStatus === "scanning" ? "wait" : "pointer",
              } as React.CSSProperties}
            >
              {analysisStatus === "scanning" ? "ANALYZING..." : "DEPLOY PATCH"}
            </motion.button>
            </StaggerItem>

            {/* View Code Diff - Secondary */}
            <StaggerItem>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 rounded-lg transition-colors"
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${N.border}`,
                fontFamily: N.mono,
                fontSize: 11,
                fontWeight: 700,
                color: N.textSecondary,
                letterSpacing: "0.08em",
                cursor: "pointer",
              } as React.CSSProperties}
            >
              VIEW CODE DIFF
            </motion.button>
            </StaggerItem>

            {/* System Reload - Industrial Secondary */}
            <StaggerItem>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSystemReload}
              className="w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${N.borderCyan}`,
                fontFamily: N.mono,
                fontSize: 11,
                fontWeight: 700,
                color: N.cyan,
                letterSpacing: "0.08em",
                cursor: "pointer",
                boxShadow: `0 0 15px ${N.cyanDim}`,
              } as React.CSSProperties}
            >
              <Zap size={12} />
              SYSTEM RELOAD
            </motion.button>
            </StaggerItem>

            {/* Ignore - Tertiary */}
            <StaggerItem>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 rounded-lg transition-colors"
              style={{
                backgroundColor: N.roseDim,
                border: `1px solid rgba(244,63,94,0.15)`,
                fontFamily: N.mono,
                fontSize: 11,
                fontWeight: 700,
                color: N.roseBright,
                letterSpacing: "0.08em",
                cursor: "pointer",
              } as React.CSSProperties}
            >
              IGNORE
            </motion.button>
            </StaggerItem>
          </StaggerList>

          {/* Code Preview */}
          <div className="mx-3 mt-3 rounded-xl overflow-hidden" style={{
            background: "rgba(5,5,5,0.6)",
            border: `1px solid ${N.border}`,
          }}>
            <div className="px-3 py-2" style={{ borderBottom: `1px solid ${N.borderSubtle}` } as React.CSSProperties}>
              <span style={{ fontSize: 9, color: N.textTertiary, letterSpacing: "0.08em" } as React.CSSProperties}>SUGGESTED FIX</span>
            </div>
            <div className="p-3">
              <div style={{ 
                fontFamily: N.mono, 
                fontSize: 10, 
                color: N.emerald, 
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
                maxHeight: '120px',
                overflowY: 'auto'
              } as React.CSSProperties}>
                {aiFix?.suggestedJpeFix || "Select an intercept and click 'DEPLOY PATCH' to generate a solution via local AI."}
              </div>
            </div>
          </div>

          {/* Alternative Solution Card */}
          <div className="mx-3 mt-3 mb-3 rounded-xl p-3" style={{
            background: N.bgGlassLight,
            border: `1px solid ${N.border}`,
          }}>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 9, color: N.textTertiary, letterSpacing: "0.08em" } as React.CSSProperties}>ALTERNATIVE</span>
              <span style={{ fontFamily: N.mono, fontSize: 13, fontWeight: 700, color: N.textPrimary } as React.CSSProperties}>92%</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: N.textPrimary, marginTop: 4 } as React.CSSProperties}>Value Validation</div>
          </div>
        </GlassPanel>
        </FadeIn>
      </div>

      {/* ─── FOOTER STATUS BAR ─── */}
      <div
        className="flex items-center justify-between px-4 py-1.5 flex-shrink-0"
        style={{
          background: "rgba(5,5,5,0.95)",
          borderTop: `1px solid ${N.border}`,
        }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: N.mono, fontSize: 10, color: N.textMuted } as React.CSSProperties}>14:02:45</span>
          <div className="h-2.5 w-px" style={{ background: N.border } as React.CSSProperties} />
          <span style={{ fontSize: 10, color: N.textTertiary } as React.CSSProperties}>BetterExceptions AI v4.2</span>
          <div className="h-2.5 w-px" style={{ background: N.border } as React.CSSProperties} />
          <span style={{ fontSize: 10, color: N.textTertiary } as React.CSSProperties}>Nexus Online</span>
          <div className="h-2.5 w-px" style={{ background: N.border } as React.CSSProperties} />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: N.emerald, boxShadow: `0 0 4px ${N.emerald}` } as React.CSSProperties} />
            <span style={{ fontSize: 10, color: N.emerald, fontWeight: 500 } as React.CSSProperties}>Connected</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[CircleDot, Layers, Terminal].map((Icon, i) => (
            <Icon key={i} size={12} color={N.textMuted} className="cursor-pointer hover:opacity-80 transition-opacity" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DiagnosticNexusView;
