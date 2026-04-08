import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Search, Shield, Box, Zap, Lock, Unlock, RefreshCw,
  ChevronRight, ChevronDown, AlertTriangle, AlertOctagon,
  CheckCircle2, XCircle, MoreHorizontal, Eye,
  Activity, Cpu, Wifi, Database, Layers,
  Settings, ArrowRight, Download, Copy,
  Sparkles, TrendingUp, BarChart3, FileCode,
  Globe, Server, Radio, Sliders, Package,
  type LucideIcon,
} from "lucide-react";
import { useScaledPx } from "./jpe-settings-context";
import exampleImage from "figma:asset/0657311b995421e71ce4902e9bf797a9c18784f4.png";
import {
  motion, AnimatePresence, StaggerList, StaggerItem,
  FadeIn, easing, duration as dur,
} from "./jpe-motion";

/* ═══════════════════════════════════════════════════════════════════
   REBELS VAULT CRM — "SPECTRAL OVERHAUL" TOKENS
   ═══════════════════════════════════════════════════════════════════ */
const V = {
  bg: "#030305",
  bgPanel: "#08080c",
  bgSurface: "#0b0b12",
  bgElevated: "#0f0f18",
  bgHover: "#13131e",
  bgActive: "#17172a",
  bgGlass: "rgba(8,8,12,0.82)",
  bgGlassLight: "rgba(14,14,20,0.72)",
  bgGlassHeavy: "rgba(6,6,10,0.92)",
  border: "rgba(255,255,255,0.05)",
  borderSubtle: "rgba(255,255,255,0.03)",
  borderCyan: "rgba(0,220,255,0.2)",
  borderViolet: "rgba(139,92,246,0.25)",
  borderEmerald: "rgba(16,185,129,0.2)",
  borderRose: "rgba(244,63,94,0.2)",
  cyan: "#00DCFF",
  cyanBright: "#5EEEFF",
  cyanDim: "rgba(0,220,255,0.06)",
  cyanMid: "rgba(0,220,255,0.12)",
  violet: "#8B5CF6",
  violetBright: "#A78BFA",
  violetDim: "rgba(139,92,246,0.06)",
  violetMid: "rgba(139,92,246,0.12)",
  violetGlow: "rgba(139,92,246,0.18)",
  emerald: "#10B981",
  emeraldBright: "#34D399",
  emeraldDim: "rgba(16,185,129,0.06)",
  rose: "#F43F5E",
  roseBright: "#FB7185",
  roseDim: "rgba(244,63,94,0.06)",
  amber: "#F59E0B",
  amberBright: "#FBBF24",
  amberDim: "rgba(245,158,11,0.06)",
  textPrimary: "#E8E8F0",
  textSecondary: "#9CA3AF",
  textTertiary: "#6B7280",
  textMuted: "#3F3F50",
  textDim: "#2A2A3A",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  sans: "'Inter', system-ui, sans-serif",
  display: "'Outfit', 'Inter', system-ui, sans-serif",
  glassBlur: "blur(24px)",
  noiseSvg: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`,
};

/* ═══ DATA: DIAGNOSTIC NODES ═══ */
interface DiagNode {
  id: string;
  name: string;
  module: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  conflictScore: number;
  issueCount: number;
  lastScan: string;
  status: "active" | "resolved" | "monitoring";
  description: string;
  affectedFiles: string[];
  suggestedFix: string;
}

const severityConfig: Record<DiagNode["severity"], { color: string; label: string; icon: LucideIcon }> = {
  critical: { color: V.rose, label: "CRITICAL", icon: AlertOctagon },
  high: { color: V.amber, label: "HIGH", icon: AlertTriangle },
  medium: { color: V.cyan, label: "MEDIUM", icon: Activity },
  low: { color: V.emerald, label: "LOW", icon: CheckCircle2 },
  info: { color: V.textTertiary, label: "INFO", icon: Eye },
};

const diagNodes: DiagNode[] = [
  { id: "DN-001", name: "WickedWhims Override", module: "trait_system", severity: "critical", conflictScore: 94, issueCount: 8, lastScan: "2m ago", status: "active", description: "Critical override collision in WickedWhims trait injection layer. Trait_Evil buff stack is being silently overwritten by WW's autonomy module, causing cascading null references in buff resolution.", affectedFiles: ["S4_03B33DDF_BG_YA_shorts.xml", "WW_autonomy_core.ts4script", "trait_Evil_override.package"], suggestedFix: "Reorder load priority: move trait_Evil_override.package above WW_autonomy_core in the mod load manifest." },
  { id: "DN-002", name: "MCCC Interaction Patch", module: "interaction_mgr", severity: "high", conflictScore: 78, issueCount: 5, lastScan: "4m ago", status: "active", description: "MCCC's interaction override is injecting custom social interactions that conflict with base game interaction queue priority. Affected interactions: Cook, Repair, and all Mean socials.", affectedFiles: ["mc_interactions.ts4script", "S4_16CD1E22_interaction_Cook.xml"], suggestedFix: "Apply MCCC compatibility patch v8.3.2 or add exclusion rule for Mean social category." },
  { id: "DN-003", name: "UI Cheats Extension", module: "ui_framework", severity: "medium", conflictScore: 52, issueCount: 3, lastScan: "8m ago", status: "monitoring", description: "UI Cheats Extension is hooking into the CAS panel display pipeline, causing intermittent render lag on trait selection screens. No data corruption detected.", affectedFiles: ["ui_cheats_ext.ts4script", "cas_panel_hooks.xml"], suggestedFix: "Defer UI Cheats CAS hooks to post-render cycle using async injection." },
  { id: "DN-004", name: "Custom Food Overhaul", module: "recipe_system", severity: "low", conflictScore: 28, issueCount: 1, lastScan: "15m ago", status: "resolved", description: "Minor string table overlap detected in recipe descriptions. Custom food mod uses duplicate STBL keys for Salad and Grilled Cheese entries.", affectedFiles: ["S4_E882D22F_recipe_Salad.xml", "custom_food_strings.stbl"], suggestedFix: "Regenerate STBL keys using JPE's hash collision resolver." },
  { id: "DN-005", name: "Vampire Pack Tuning", module: "occult_system", severity: "medium", conflictScore: 61, issueCount: 4, lastScan: "12m ago", status: "active", description: "GP04 Vampires dark form trait is conflicting with custom CAS presets. Dark form meshes fail to load when custom body sliders exceed 1.5x multiplier.", affectedFiles: ["GP04_darkform_tuning.xml", "custom_sliders.package"], suggestedFix: "Clamp slider multiplier to 1.4x maximum or add dark form mesh override." },
  { id: "DN-006", name: "Basemental Drugs", module: "buff_system", severity: "high", conflictScore: 82, issueCount: 6, lastScan: "6m ago", status: "active", description: "Buff system collision: Basemental's custom buff categories are overwriting base game emotion buff slots, causing 'Feeling Evil' and 'Energized' buffs to stack incorrectly.", affectedFiles: ["basemental_buffs.ts4script", "S4_0904DF10_buff_Energized.xml", "buff_stack_resolver.xml"], suggestedFix: "Isolate Basemental buff categories into separate namespace using JPE's buff partitioner." },
  { id: "DN-007", name: "Slice of Life", module: "social_system", severity: "low", conflictScore: 19, issueCount: 1, lastScan: "22m ago", status: "resolved", description: "Minor text formatting issue in Slice of Life social event notifications. Unicode characters in Japanese locale cause truncation.", affectedFiles: ["sol_social_events.stbl", "ja_JP.stbl"], suggestedFix: "Apply UTF-8 normalization pass to SOL string tables." },
  { id: "DN-008", name: "Meaningful Stories", module: "emotion_system", severity: "medium", conflictScore: 45, issueCount: 2, lastScan: "18m ago", status: "monitoring", description: "Emotion system rebalance mod is adjusting base decay rates, which may interact unpredictably with Evil trait's passive aura buff timing.", affectedFiles: ["meaningful_stories_core.ts4script", "emotion_decay_tuning.xml"], suggestedFix: "Add exception rule for Evil trait aura in Meaningful Stories config." },
];

/* ═══ TAB CONFIG ═══ */
type NavTab = "system" | "warehouse" | "triage" | "satellite" | "config";
const navTabs: { key: NavTab; label: string }[] = [
  { key: "system", label: "[SYSTEM]" },
  { key: "warehouse", label: "[WAREHOUSE]" },
  { key: "triage", label: "[TRIAGE]" },
  { key: "satellite", label: "[SATELLITE]" },
  { key: "config", label: "[CONFIG]" },
];

/* ═══ UTILITY COMPONENTS ═══ */
function GlassPanel({ children, className = "", style = {}, glow, borderColor }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties; glow?: string; borderColor?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: V.bgGlass,
        backdropFilter: V.glassBlur,
        WebkitBackdropFilter: V.glassBlur,
        border: `1px solid ${borderColor || V.border}`,
        borderRadius: 14,
        boxShadow: glow
          ? `0 0 30px ${glow}, inset 0 1px 0 rgba(255,255,255,0.03)`
          : `inset 0 1px 0 rgba(255,255,255,0.03)`,
        ...style,
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: V.noiseSvg, opacity: 0.6 }} />
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  );
}

function Eyebrow({ children, color = V.textTertiary }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="uppercase select-none tracking-[0.14em]" style={{ fontFamily: V.sans, fontSize: 10, fontWeight: 700, color }}>
      {children}
    </span>
  );
}

function NeuralDot({ color = V.violet, size = 6 }: { color?: string; size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size + 4, height: size + 4 }}>
      <div className="rounded-full animate-pulse" style={{ width: size, height: size, background: color, boxShadow: `0 0 10px ${color}80, 0 0 4px ${color}` }} />
    </div>
  );
}

function SeverityDot({ severity }: { severity: DiagNode["severity"] }) {
  const cfg = severityConfig[severity];
  return (
    <div className="relative flex items-center justify-center" style={{ width: 10, height: 10 }}>
      <div className="rounded-full" style={{ width: 7, height: 7, background: cfg.color, boxShadow: `0 0 8px ${cfg.color}70` }} />
      {(severity === "critical") && (
        <div className="absolute inset-0 rounded-full animate-ping" style={{ background: cfg.color, opacity: 0.2 }} />
      )}
    </div>
  );
}

/* ═══ CONFLICT SCORE BAR ═══ */
function ConflictScoreBar({ score, height = 8 }: { score: number; height?: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return { from: V.amber, to: V.rose };
    if (s >= 50) return { from: V.cyan, to: V.amber };
    return { from: V.emerald, to: V.cyan };
  };
  const colors = getColor(score);
  return (
    <div className="w-full relative">
      <div className="w-full rounded-full overflow-hidden" style={{ height, background: "rgba(255,255,255,0.04)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(score, 100)}%`,
            background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
            boxShadow: `0 0 12px ${colors.to}30`,
          }}
        />
      </div>
      {/* Tick marks */}
      <div className="absolute top-0 left-0 right-0 flex justify-between px-0" style={{ height }}>
        {[25, 50, 75].map(tick => (
          <div key={tick} className="absolute top-0" style={{ left: `${tick}%`, width: 1, height, background: "rgba(255,255,255,0.06)" }} />
        ))}
      </div>
    </div>
  );
}

/* ═══ TELEMETRY CARD ═══ */
function TelemetryCard({ label, value, sub, icon: Icon, accentColor, glow }: {
  label: string; value: string; sub?: string; icon: LucideIcon; accentColor: string; glow?: string;
}) {
  return (
    <GlassPanel
      className="flex-1 min-w-[180px]"
      glow={glow || `${accentColor}08`}
      borderColor={`${accentColor}15`}
    >
      <div className="flex items-start justify-between p-4">
        <div className="flex flex-col gap-1.5">
          <Eyebrow color={V.textTertiary}>{label}</Eyebrow>
          <div style={{ fontFamily: V.mono, fontSize: 26, fontWeight: 800, color: V.textPrimary, lineHeight: 1 }}>
            {value}
          </div>
          {sub && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <NeuralDot color={accentColor} size={4} />
              <span style={{ fontSize: 10, fontFamily: V.mono, color: accentColor, fontWeight: 600 }}>{sub}</span>
            </div>
          )}
        </div>
        <div className="p-2 rounded-xl" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}15` }}>
          <Icon size={18} color={accentColor} />
        </div>
      </div>
      {/* Bottom accent line */}
      <div className="h-px mt-auto" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}25, transparent)` }} />
    </GlassPanel>
  );
}

/* ═══ NETWORK CANVAS VISUALIZATION ═══ */
function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.clearRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = "rgba(139,92,246,0.03)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Constellation nodes
    const nodes: { x: number; y: number; r: number; color: string }[] = [];
    const nodeCount = 12;
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2 + t * 0.0003;
      const radius = Math.min(w, h) * 0.28 + Math.sin(t * 0.001 + i * 1.5) * 15;
      const x = w / 2 + Math.cos(angle) * radius;
      const y = h / 2 + Math.sin(angle) * radius;
      const isViolet = i % 3 === 0;
      nodes.push({ x, y, r: isViolet ? 4 : 2.5, color: isViolet ? V.violet : V.cyan });
    }

    // Connections
    nodes.forEach((a, i) => {
      nodes.forEach((b, j) => {
        if (j <= i) return;
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < Math.min(w, h) * 0.5) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(139,92,246,${0.04 + Math.sin(t * 0.002 + i + j) * 0.02})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    nodes.forEach((n, i) => {
      const pulse = 0.5 + Math.sin(t * 0.004 + i * 0.8) * 0.3;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color.replace(")", `,${pulse})`).replace("rgb", "rgba").replace("#", "");

      // Hex to rgba
      if (n.color.startsWith("#")) {
        const hex = n.color.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        ctx.fillStyle = `rgba(${r},${g},${b},${pulse})`;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 12;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Floating particles
    for (let i = 0; i < 20; i++) {
      const px = (Math.sin(t * 0.0007 + i * 2.3) * 0.5 + 0.5) * w;
      const py = (Math.cos(t * 0.0005 + i * 1.9) * 0.5 + 0.5) * h;
      const alpha = 0.06 + Math.sin(t * 0.003 + i) * 0.04;
      ctx.beginPath();
      ctx.arc(px, py, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,220,255,${alpha})`;
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement!;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const loop = (ts: number) => {
      const parent = canvas.parentElement!;
      const rect = parent.getBoundingClientRect();
      draw(ctx, rect.width, rect.height, ts);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, [draw]);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />;
}

/* ═══════════════════════════════════════════════════════════════════
   TRIAGE CONTENT — extracted from the original inline view
   ═══════════════════════════════════════════════════════════════════ */
function TriageContent({ filteredNodes, selectedNode, setSelectedNode, searchQuery, setSearchQuery }: {
  filteredNodes: DiagNode[]; selectedNode: number; setSelectedNode: (i: number) => void;
  searchQuery: string; setSearchQuery: (q: string) => void;
}) {
  const panelW = useScaledPx(290);
  const activeNode = filteredNodes[selectedNode] || filteredNodes[0];
  return (
    <>
      <GlassPanel className="flex flex-col" style={{ width: panelW, flexShrink: 0 }} glow={`${V.violet}04`}>
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${V.border}` }}>
          <div className="flex items-center gap-2">
            <Box size={13} color={V.violet} />
            <Eyebrow color={V.textSecondary}>Diagnostic Nodes</Eyebrow>
            <span style={{ fontFamily: V.mono, fontSize: 9, color: V.textMuted }}>({filteredNodes.length})</span>
          </div>
          <MoreHorizontal size={13} color={V.textMuted} className="cursor-pointer" />
        </div>
        <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${V.borderSubtle}` }}>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${V.border}` }}>
            <Search size={11} color={V.textMuted} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search nodes..."
              className="flex-1 bg-transparent outline-none" style={{ fontSize: 11, fontFamily: V.sans, color: V.textPrimary }} />
          </div>
        </div>
        <StaggerList className="flex-1 overflow-y-auto py-1">
          {filteredNodes.map((node, i) => {
            const isActive = i === selectedNode;
            const svCfg = severityConfig[node.severity];
            return (
              <StaggerItem key={node.id}>
              <div className="relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-all"
                style={{ background: isActive ? V.violetDim : "transparent", borderLeft: isActive ? `2px solid ${V.violet}` : "2px solid transparent" }}
                onClick={() => setSelectedNode(i)}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = V.bgHover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? V.violetDim : "transparent"; }}>
                <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
                  <SeverityDot severity={node.severity} />
                  {i < filteredNodes.length - 1 && <div className="w-px flex-1 min-h-[16px]" style={{ background: `linear-gradient(to bottom, ${svCfg.color}20, transparent)` }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: V.mono, fontSize: 10, fontWeight: 700, color: V.textMuted }}>{node.id}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 8, fontFamily: V.mono, fontWeight: 700, color: svCfg.color, background: `${svCfg.color}10`, border: `1px solid ${svCfg.color}15` }}>{svCfg.label}</span>
                  </div>
                  <div className="mt-1" style={{ fontSize: 12, fontWeight: 600, color: V.textPrimary, lineHeight: 1.3 }}>{node.name}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span style={{ fontFamily: V.mono, fontSize: 9, color: V.textTertiary }}>{node.module}</span>
                    <span style={{ fontSize: 8, color: V.textDim }}>•</span>
                    <span style={{ fontFamily: V.mono, fontSize: 9, color: V.textMuted }}>{node.lastScan}</span>
                  </div>
                  <div className="mt-2"><ConflictScoreBar score={node.conflictScore} height={3} /></div>
                </div>
              </div>
              </StaggerItem>
            );
          })}
        </StaggerList>
        <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${V.border}` }}>
          <span style={{ fontSize: 9, color: V.textMuted }}>Last full scan: 2m ago</span>
          <NeuralDot color={V.violet} size={4} />
        </div>
      </GlassPanel>
      <GlassPanel className="flex-1 flex flex-col" glow={`${V.cyan}04`} borderColor={V.border}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: 14 }}><NetworkCanvas /></div>
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${V.border}`, background: "rgba(3,3,5,0.6)" }}>
          <div className="flex items-center gap-3">
            <Shield size={15} color={V.cyan} />
            <span style={{ fontSize: 15, fontWeight: 800, color: V.textPrimary, fontFamily: V.display }}>Issue Diagnosis</span>
            <span className="px-2 py-0.5 rounded-lg" style={{ fontFamily: V.mono, fontSize: 10, fontWeight: 700, color: V.violetBright, background: V.violetDim, border: `1px solid ${V.borderViolet}` }}>{activeNode?.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <NeuralDot color={V.violet} size={4} />
            <span style={{ fontSize: 9, fontFamily: V.mono, color: V.textTertiary }}>AI ANALYZING</span>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {activeNode && (
            <motion.div key={activeNode.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: dur.normal, ease: easing.outStandard }} className="flex-1 overflow-y-auto">
              <div className="flex items-center gap-6 px-5 py-3" style={{ borderBottom: `1px solid ${V.borderSubtle}`, background: "rgba(3,3,5,0.4)" }}>
                {[{ label: "MOD NAME", value: activeNode.name, color: V.textPrimary, weight: 700 }, { label: "MODULE", value: activeNode.module, color: V.cyan, weight: 600 }].map((f, fi) => (
                  <div key={fi} className="flex flex-col gap-0.5">
                    <span style={{ fontSize: 9, color: V.textTertiary, letterSpacing: "0.1em" }}>{f.label}</span>
                    <span style={{ fontFamily: V.mono, fontSize: 13, fontWeight: f.weight, color: f.color }}>{f.value}</span>
                  </div>
                ))}
                <div className="flex flex-col gap-0.5">
                  <span style={{ fontSize: 9, color: V.textTertiary, letterSpacing: "0.1em" }}>SEVERITY</span>
                  <div className="flex items-center gap-1.5">
                    <SeverityDot severity={activeNode.severity} />
                    <span style={{ fontFamily: V.mono, fontSize: 13, fontWeight: 700, color: severityConfig[activeNode.severity].color }}>{severityConfig[activeNode.severity].label}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span style={{ fontSize: 9, color: V.textTertiary, letterSpacing: "0.1em" }}>STATUS</span>
                  <span style={{ fontFamily: V.mono, fontSize: 13, fontWeight: 600, color: activeNode.status === "active" ? V.amber : activeNode.status === "resolved" ? V.emerald : V.cyan }}>{activeNode.status.toUpperCase()}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span style={{ fontSize: 9, color: V.textTertiary, letterSpacing: "0.1em" }}>ISSUES</span>
                  <span style={{ fontFamily: V.mono, fontSize: 13, fontWeight: 700, color: V.textPrimary }}>{activeNode.issueCount}</span>
                </div>
              </div>
              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${V.borderSubtle}`, background: "rgba(3,3,5,0.35)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Eyebrow color={V.textTertiary}>Conflict Score</Eyebrow><NeuralDot color={V.violet} size={4} /></div>
                  <span style={{ fontFamily: V.mono, fontSize: 24, fontWeight: 900, color: V.textPrimary }}>{activeNode.conflictScore}%</span>
                </div>
                <ConflictScoreBar score={activeNode.conflictScore} height={12} />
                <div className="flex items-center justify-between mt-2">
                  <span style={{ fontSize: 9, fontFamily: V.mono, color: V.emerald }}>0% Safe</span>
                  <span style={{ fontSize: 9, fontFamily: V.mono, color: V.amber }}>50% Elevated</span>
                  <span style={{ fontSize: 9, fontFamily: V.mono, color: V.rose }}>100% Critical</span>
                </div>
              </div>
              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${V.borderSubtle}`, background: "rgba(3,3,5,0.3)" }}>
                <Eyebrow color={V.textTertiary}>Analysis Report</Eyebrow>
                <p className="mt-2" style={{ fontSize: 12, color: V.textSecondary, lineHeight: 1.7 }}>{activeNode.description}</p>
              </div>
              <div className="flex gap-3 px-5 py-4" style={{ background: "rgba(3,3,5,0.25)" }}>
                <GlassPanel className="flex-1" style={{ borderRadius: 10 }}>
                  <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: `1px solid ${V.border}` }}>
                    <FileCode size={11} color={V.cyan} /><Eyebrow color={V.textTertiary}>Affected Files</Eyebrow>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {activeNode.affectedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${V.borderSubtle}` }}>
                        <FileCode size={10} color={V.textMuted} />
                        <span style={{ fontFamily: V.mono, fontSize: 10, color: V.textSecondary }}>{file}</span>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
                <GlassPanel className="flex-1" style={{ borderRadius: 10 }} glow={`${V.emerald}06`} borderColor={V.borderEmerald}>
                  <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: `1px solid ${V.border}` }}>
                    <Sparkles size={11} color={V.emerald} /><Eyebrow color={V.emerald}>AI Suggested Fix</Eyebrow><NeuralDot color={V.violet} size={4} />
                  </div>
                  <div className="p-3">
                    <p style={{ fontSize: 11, color: V.textSecondary, lineHeight: 1.7 }}>{activeNode.suggestedFix}</p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg w-full justify-center"
                      style={{ background: `linear-gradient(135deg, ${V.emerald}20, ${V.cyan}15)`, border: `1px solid ${V.borderEmerald}`, boxShadow: `0 0 12px ${V.emerald}10`, cursor: "pointer" }}>
                      <Zap size={12} color={V.emeraldBright} />
                      <span style={{ fontFamily: V.mono, fontSize: 10, fontWeight: 700, color: V.emeraldBright, letterSpacing: "0.08em" }}>APPLY FIX</span>
                    </motion.button>
                  </div>
                </GlassPanel>
              </div>
              <div className="flex items-center gap-2 px-5 py-3" style={{ borderTop: `1px solid ${V.border}`, background: "rgba(3,3,5,0.4)" }}>
                {[
                  { icon: Eye, label: "VIEW DIFF", color: V.violetBright, bg: `linear-gradient(135deg, ${V.violet}20, ${V.cyan}12)`, border: V.borderViolet },
                  { icon: Copy, label: "COPY REPORT", color: V.cyan, bg: V.cyanDim, border: V.borderCyan },
                  { icon: XCircle, label: "SUPPRESS", color: V.roseBright, bg: V.roseDim, border: V.borderRose },
                ].map((btn, bi) => (
                  <motion.button key={bi} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                    style={{ background: btn.bg, border: `1px solid ${btn.border}`, cursor: "pointer" }}>
                    <btn.icon size={12} color={btn.color} />
                    <span style={{ fontFamily: V.mono, fontSize: 10, fontWeight: 700, color: btn.color, letterSpacing: "0.06em" }}>{btn.label}</span>
                  </motion.button>
                ))}
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <NeuralDot color={V.violet} size={4} />
                  <span style={{ fontSize: 9, fontFamily: V.mono, color: V.textMuted }}>Neural Engine Processing</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SYSTEM TAB — Core health, resource usage, runtime metrics
   ═══════════════════════════════════════════════════════════════════ */
function SystemMetricRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-1" style={{ borderBottom: `1px solid ${V.borderSubtle}` }}>
      <span className="w-28" style={{ fontSize: 11, fontWeight: 600, color: V.textSecondary }}>{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)`, boxShadow: `0 0 8px ${color}30` }} />
      </div>
      <span style={{ fontFamily: V.mono, fontSize: 11, fontWeight: 700, color, minWidth: 60, textAlign: "right" as const }}>{value}</span>
    </div>
  );
}

const systemProcesses = [
  { name: "NeuralEngine.core", pid: "PID-0441", cpu: "12.4%", mem: "840 MB", status: "running", color: V.violet },
  { name: "ConflictResolver.svc", pid: "PID-0882", cpu: "4.2%", mem: "220 MB", status: "running", color: V.cyan },
  { name: "STBLHashIndexer", pid: "PID-1204", cpu: "0.8%", mem: "64 MB", status: "idle", color: V.emerald },
  { name: "PackageBuildDaemon", pid: "PID-2010", cpu: "18.1%", mem: "1.2 GB", status: "running", color: V.amber },
  { name: "TranslationSync", pid: "PID-3342", cpu: "2.1%", mem: "128 MB", status: "running", color: V.cyanBright },
  { name: "WatchdogMonitor", pid: "PID-4001", cpu: "0.3%", mem: "32 MB", status: "sleeping", color: V.textTertiary },
];

function SystemContent() {
  const panelW = useScaledPx(340);
  return (
    <>
      <GlassPanel className="flex flex-col" style={{ width: panelW, flexShrink: 0 }} glow={`${V.cyan}04`}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${V.border}` }}>
          <Cpu size={13} color={V.cyan} />
          <Eyebrow color={V.textSecondary}>System Resources</Eyebrow>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <SystemMetricRow label="CPU Usage" value="34.8%" pct={34.8} color={V.cyan} />
          <SystemMetricRow label="Memory" value="4.2 / 16 GB" pct={26} color={V.violet} />
          <SystemMetricRow label="Disk I/O" value="142 MB/s" pct={56} color={V.amber} />
          <SystemMetricRow label="Network" value="2.4 Mbps" pct={12} color={V.emerald} />
          <SystemMetricRow label="GPU Compute" value="18%" pct={18} color={V.cyanBright} />
          <SystemMetricRow label="Neural Load" value="62%" pct={62} color={V.violetBright} />
          <SystemMetricRow label="Cache Hit" value="94.2%" pct={94} color={V.emerald} />
          <SystemMetricRow label="Thread Pool" value="8 / 12" pct={67} color={V.cyan} />
        </div>
        <div className="flex items-center justify-between px-4 py-2" style={{ borderTop: `1px solid ${V.border}` }}>
          <span style={{ fontSize: 9, fontFamily: V.mono, color: V.textMuted }}>Uptime: 14d 6h 42m</span>
          <NeuralDot color={V.emerald} size={4} />
        </div>
      </GlassPanel>
      <GlassPanel className="flex-1 flex flex-col" glow={`${V.violet}04`}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${V.border}` }}>
          <div className="flex items-center gap-2">
            <Server size={13} color={V.violet} />
            <Eyebrow color={V.textSecondary}>Active Processes</Eyebrow>
            <span style={{ fontFamily: V.mono, fontSize: 9, color: V.textMuted }}>({systemProcesses.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <NeuralDot color={V.emerald} size={4} />
            <span style={{ fontSize: 9, fontFamily: V.mono, color: V.textTertiary }}>ALL NOMINAL</span>
          </div>
        </div>
        <div className="flex items-center gap-4 px-5 py-2" style={{ borderBottom: `1px solid ${V.borderSubtle}` }}>
          {["PROCESS", "PID", "CPU", "MEMORY", "STATUS"].map(h => (
            <span key={h} className={h === "PROCESS" ? "flex-1" : ""} style={{ fontSize: 8, fontWeight: 700, color: V.textMuted, letterSpacing: "0.12em", minWidth: h === "PROCESS" ? undefined : 70 }}>{h}</span>
          ))}
        </div>
        <StaggerList className="flex-1 overflow-y-auto">
          {systemProcesses.map(proc => (
            <StaggerItem key={proc.pid}>
              <div className="flex items-center gap-4 px-5 py-3 transition-colors cursor-pointer"
                style={{ borderBottom: `1px solid ${V.borderSubtle}` }}
                onMouseEnter={e => { e.currentTarget.style.background = V.bgHover; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: proc.color, boxShadow: `0 0 4px ${proc.color}60` }} />
                  <span style={{ fontFamily: V.mono, fontSize: 11, fontWeight: 600, color: V.textPrimary }}>{proc.name}</span>
                </div>
                <span style={{ fontFamily: V.mono, fontSize: 10, color: V.textMuted, minWidth: 70 }}>{proc.pid}</span>
                <span style={{ fontFamily: V.mono, fontSize: 10, color: V.cyan, fontWeight: 600, minWidth: 70 }}>{proc.cpu}</span>
                <span style={{ fontFamily: V.mono, fontSize: 10, color: V.violetBright, minWidth: 70 }}>{proc.mem}</span>
                <span className="px-2 py-0.5 rounded" style={{
                  fontFamily: V.mono, fontSize: 8, fontWeight: 700, minWidth: 70,
                  color: proc.status === "running" ? V.emerald : proc.status === "idle" ? V.amber : V.textTertiary,
                  background: proc.status === "running" ? V.emeraldDim : proc.status === "idle" ? V.amberDim : "rgba(255,255,255,0.03)",
                }}>{proc.status.toUpperCase()}</span>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </GlassPanel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WAREHOUSE TAB — Mod package inventory
   ═══════════════════════════════════════════════════════════════════ */
const warehousePackages = [
  { id: "WH-001", name: "WickedWhims", version: "v184.2", size: "48.2 MB", format: ".ts4script", integrity: 100, lastVerified: "12m ago", category: "Gameplay" },
  { id: "WH-002", name: "MCCC", version: "v8.3.1", size: "22.8 MB", format: ".ts4script", integrity: 100, lastVerified: "8m ago", category: "Core" },
  { id: "WH-003", name: "UI Cheats Extension", version: "v1.42", size: "4.1 MB", format: ".ts4script", integrity: 98, lastVerified: "20m ago", category: "UI" },
  { id: "WH-004", name: "Custom Food Overhaul", version: "v2.0.1", size: "18.6 MB", format: ".package", integrity: 100, lastVerified: "15m ago", category: "Objects" },
  { id: "WH-005", name: "Basemental Drugs", version: "v4.8.0", size: "34.4 MB", format: ".ts4script", integrity: 97, lastVerified: "6m ago", category: "Gameplay" },
  { id: "WH-006", name: "Slice of Life", version: "v5.3", size: "12.9 MB", format: ".package", integrity: 100, lastVerified: "22m ago", category: "Social" },
  { id: "WH-007", name: "Meaningful Stories", version: "v2.1.0", size: "8.2 MB", format: ".ts4script", integrity: 100, lastVerified: "18m ago", category: "Emotion" },
  { id: "WH-008", name: "Vampire Pack Tuning", version: "v1.4.2", size: "6.4 MB", format: ".package", integrity: 95, lastVerified: "30m ago", category: "Occult" },
];

/* Extended package metadata for inspection panel */
const warehousePackageMeta: Record<string, { hash: string; tunings: number; strings: number; scripts: number; resources: string[]; deps: string[]; loadOrder: number; lastModified: string; author: string }> = {
  "WH-001": { hash: "a3f8e1d9c7b2", tunings: 142, strings: 3200, scripts: 18, resources: ["WW_autonomy_core.ts4script", "WW_trait_injection.package", "WW_animations.package", "WW_strings_en.stbl"], deps: ["BaseGame 1.108+"], loadOrder: 1, lastModified: "2 days ago", author: "TURBODRIVER" },
  "WH-002": { hash: "b5d2e4f1a8c0", tunings: 98, strings: 1400, scripts: 12, resources: ["mc_interactions.ts4script", "mc_command_center.ts4script", "mc_cas.package"], deps: ["BaseGame 1.106+"], loadOrder: 2, lastModified: "5 days ago", author: "Deaderpool" },
  "WH-003": { hash: "c1e7a9d4b6f3", tunings: 34, strings: 280, scripts: 4, resources: ["ui_cheats_ext.ts4script", "cas_panel_hooks.xml"], deps: ["BaseGame 1.108+"], loadOrder: 3, lastModified: "1 week ago", author: "weerbesu" },
  "WH-004": { hash: "d8f3c2a1e5b7", tunings: 76, strings: 520, scripts: 0, resources: ["custom_food_recipes.package", "custom_food_strings.stbl", "food_objects.package"], deps: ["BaseGame 1.105+", "EP11 Cottage Living"], loadOrder: 5, lastModified: "3 days ago", author: "SrslySims" },
  "WH-005": { hash: "e2a4b7c9d1f6", tunings: 118, strings: 2800, scripts: 14, resources: ["basemental_buffs.ts4script", "basemental_objects.package", "basemental_interactions.package"], deps: ["BaseGame 1.107+"], loadOrder: 4, lastModified: "4 days ago", author: "Basemental" },
  "WH-006": { hash: "f6c1d3e8a2b5", tunings: 54, strings: 920, scripts: 2, resources: ["sol_social_events.stbl", "sol_core.package", "sol_buffs.package"], deps: ["BaseGame 1.105+"], loadOrder: 6, lastModified: "1 week ago", author: "KawaiiStacie" },
  "WH-007": { hash: "a9b2c4d6e8f1", tunings: 42, strings: 380, scripts: 6, resources: ["meaningful_stories_core.ts4script", "emotion_decay_tuning.xml"], deps: ["BaseGame 1.106+"], loadOrder: 7, lastModified: "2 weeks ago", author: "roBurky" },
  "WH-008": { hash: "b4d7e1f5a3c8", tunings: 28, strings: 160, scripts: 0, resources: ["GP04_darkform_tuning.xml", "custom_sliders.package", "vampire_traits.package"], deps: ["GP04 Vampires"], loadOrder: 8, lastModified: "3 weeks ago", author: "Mod Community" },
};

function WarehouseContent() {
  const panelW = useScaledPx(280);
  const detailW = useScaledPx(320);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const activePkg = selectedPkg ? warehousePackages.find(p => p.id === selectedPkg) : null;
  const activeMeta = selectedPkg ? warehousePackageMeta[selectedPkg] : null;

  return (
    <>
      <GlassPanel className="flex flex-col" style={{ width: panelW, flexShrink: 0 }} glow={`${V.amber}04`}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${V.border}` }}>
          <Database size={13} color={V.amber} />
          <Eyebrow color={V.textSecondary}>Storage Overview</Eyebrow>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {[
            { label: "Total Storage", value: "2.4 GB", max: "8 GB", pct: 30, color: V.cyan },
            { label: "Package Cache", value: "840 MB", max: "2 GB", pct: 42, color: V.violet },
            { label: "STBL Index", value: "128 MB", max: "512 MB", pct: 25, color: V.emerald },
            { label: "Build Artifacts", value: "420 MB", max: "1 GB", pct: 42, color: V.amber },
          ].map(s => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: 10, fontWeight: 600, color: V.textSecondary }}>{s.label}</span>
                <span style={{ fontFamily: V.mono, fontSize: 9, color: s.color }}>{s.value} / {s.max}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}30` }} />
              </div>
            </div>
          ))}
          <div className="h-px" style={{ background: V.border }} />
          <div className="space-y-2">
            {[
              { label: "Total Packages", value: `${warehousePackages.length}`, color: V.violet },
              { label: "Verified", value: `${warehousePackages.filter(p => p.integrity === 100).length}`, color: V.emerald },
              { label: "Needs Attention", value: `${warehousePackages.filter(p => p.integrity < 100).length}`, color: V.amber },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span style={{ fontSize: 10, color: V.textTertiary }}>{s.label}</span>
                <span style={{ fontFamily: V.mono, fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>
      <GlassPanel className={`flex flex-col ${selectedPkg ? "" : "flex-1"}`} style={selectedPkg ? { flex: "1 1 0%", minWidth: 0 } : {}} glow={`${V.cyan}04`}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${V.border}` }}>
          <div className="flex items-center gap-2">
            <Package size={13} color={V.cyan} />
            <Eyebrow color={V.textSecondary}>Package Inventory</Eyebrow>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: V.cyanDim, border: `1px solid ${V.borderCyan}`, cursor: "pointer" }}>
            <Download size={10} color={V.cyan} />
            <span style={{ fontFamily: V.mono, fontSize: 9, fontWeight: 700, color: V.cyan }}>EXPORT</span>
          </motion.button>
        </div>
        <div className="flex items-center gap-4 px-5 py-2" style={{ borderBottom: `1px solid ${V.borderSubtle}` }}>
          {["PACKAGE", "VERSION", "SIZE", "FORMAT", "INTEGRITY", "VERIFIED"].map(h => (
            <span key={h} className={h === "PACKAGE" ? "flex-1" : ""} style={{ fontSize: 8, fontWeight: 700, color: V.textMuted, letterSpacing: "0.12em", minWidth: h === "PACKAGE" ? undefined : 70 }}>{h}</span>
          ))}
        </div>
        <StaggerList className="flex-1 overflow-y-auto">
          {warehousePackages.map(pkg => {
            const isSel = selectedPkg === pkg.id;
            return (
              <StaggerItem key={pkg.id}>
                <div className="flex items-center gap-4 px-5 py-2.5 transition-colors cursor-pointer"
                  style={{
                    borderBottom: `1px solid ${V.borderSubtle}`,
                    background: isSel ? `${V.cyan}08` : "transparent",
                    borderLeft: isSel ? `2px solid ${V.cyan}` : "2px solid transparent",
                  }}
                  onClick={() => setSelectedPkg(isSel ? null : pkg.id)}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = V.bgHover; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isSel ? `${V.cyan}08` : "transparent"; }}>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: pkg.integrity === 100 ? V.emerald : V.amber, boxShadow: `0 0 4px ${pkg.integrity === 100 ? V.emerald : V.amber}60` }} />
                    <span style={{ fontFamily: V.mono, fontSize: 11, fontWeight: isSel ? 700 : 600, color: isSel ? V.cyanBright : V.textPrimary }}>{pkg.name}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 7, fontFamily: V.mono, color: V.textMuted, background: "rgba(255,255,255,0.03)" }}>{pkg.category}</span>
                  </div>
                  <span style={{ fontFamily: V.mono, fontSize: 10, color: V.cyanBright, minWidth: 70 }}>{pkg.version}</span>
                  <span style={{ fontFamily: V.mono, fontSize: 10, color: V.textTertiary, minWidth: 70 }}>{pkg.size}</span>
                  <span style={{ fontFamily: V.mono, fontSize: 10, color: V.textMuted, minWidth: 70 }}>{pkg.format}</span>
                  <span style={{ fontFamily: V.mono, fontSize: 10, fontWeight: 700, color: pkg.integrity === 100 ? V.emerald : V.amber, minWidth: 70 }}>{pkg.integrity}%</span>
                  <span style={{ fontFamily: V.mono, fontSize: 9, color: V.textMuted, minWidth: 70 }}>{pkg.lastVerified}</span>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerList>
      </GlassPanel>

      {/* Package Inspection Panel */}
      <AnimatePresence>
        {activePkg && activeMeta && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: detailW, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex-shrink-0 overflow-hidden"
          >
            <GlassPanel className="flex flex-col h-full" style={{ width: 320 }} glow={`${V.violet}06`} borderColor={V.borderViolet}>
              {/* Inspection Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${V.border}` }}>
                <div className="flex items-center gap-2">
                  <Eye size={13} color={V.violet} />
                  <Eyebrow color={V.textSecondary}>Package Inspector</Eyebrow>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedPkg(null)}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: V.textMuted, cursor: "pointer" }}>
                  <XCircle size={14} />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {/* Package Identity */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={14} color={V.cyan} />
                    <span style={{ fontFamily: V.display, fontSize: 14, fontWeight: 700, color: V.textPrimary }}>{activePkg.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: V.mono, fontSize: 10, color: V.cyanBright }}>{activePkg.version}</span>
                    <span style={{ fontSize: 10, color: V.textMuted }}>by</span>
                    <span style={{ fontSize: 10, color: V.violetBright }}>{activeMeta.author}</span>
                  </div>
                </div>

                {/* Integrity Gauge */}
                <div className="rounded-xl p-3" style={{ background: V.bgElevated, border: `1px solid ${V.border}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <Eyebrow color={V.textMuted}>INTEGRITY</Eyebrow>
                    <span style={{
                      fontFamily: V.mono, fontSize: 14, fontWeight: 700,
                      color: activePkg.integrity === 100 ? V.emerald : activePkg.integrity >= 97 ? V.amber : V.rose,
                    }}>{activePkg.integrity}%</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${activePkg.integrity}%` }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{
                        background: activePkg.integrity === 100 ? V.emerald : activePkg.integrity >= 97 ? V.amber : V.rose,
                        boxShadow: `0 0 8px ${activePkg.integrity === 100 ? V.emerald : V.amber}40`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span style={{ fontSize: 9, color: V.textMuted }}>Last verified: {activePkg.lastVerified}</span>
                    <span style={{ fontSize: 9, fontFamily: V.mono, color: activePkg.integrity === 100 ? V.emerald : V.amber }}>
                      {activePkg.integrity === 100 ? "VERIFIED" : "DEGRADED"}
                    </span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div>
                  <Eyebrow color={V.textMuted}>METADATA</Eyebrow>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { label: "Format", value: activePkg.format, color: V.cyan },
                      { label: "Size", value: activePkg.size, color: V.textSecondary },
                      { label: "Category", value: activePkg.category, color: V.violet },
                      { label: "Load Order", value: `#${activeMeta.loadOrder}`, color: V.amber },
                      { label: "Hash", value: activeMeta.hash, color: V.textMuted },
                      { label: "Modified", value: activeMeta.lastModified, color: V.textTertiary },
                    ].map(m => (
                      <div key={m.label} className="rounded-lg px-2.5 py-2" style={{ background: V.bgElevated, border: `1px solid ${V.borderSubtle}` }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: V.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{m.label}</span>
                        <div className="mt-0.5" style={{ fontFamily: V.mono, fontSize: 10, color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Stats */}
                <div>
                  <Eyebrow color={V.textMuted}>CONTENT STATS</Eyebrow>
                  <div className="mt-2 space-y-1.5">
                    {[
                      { label: "Tuning Files", value: activeMeta.tunings, color: V.violet },
                      { label: "String Entries", value: activeMeta.strings.toLocaleString(), color: V.cyan },
                      { label: "Script Modules", value: activeMeta.scripts, color: V.emerald },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg" style={{ background: V.bgElevated, border: `1px solid ${V.borderSubtle}` }}>
                        <span style={{ fontSize: 10, color: V.textTertiary }}>{s.label}</span>
                        <span style={{ fontFamily: V.mono, fontSize: 11, fontWeight: 700, color: s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <Eyebrow color={V.textMuted}>RESOURCES ({activeMeta.resources.length})</Eyebrow>
                  <div className="mt-2 space-y-1">
                    {activeMeta.resources.map(res => {
                      const ext = res.split(".").pop() || "";
                      const resColor = ext === "ts4script" ? V.emerald : ext === "package" ? V.violet : ext === "stbl" ? V.cyan : ext === "xml" ? V.amber : V.textMuted;
                      return (
                        <div key={res} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: V.bgElevated, border: `1px solid ${V.borderSubtle}` }}>
                          <FileCode size={10} color={resColor} />
                          <span className="flex-1 truncate" style={{ fontFamily: V.mono, fontSize: 10, color: V.textSecondary }}>{res}</span>
                          <span className="px-1 py-0.5 rounded" style={{ fontSize: 7, fontFamily: V.mono, color: resColor, background: `${resColor}10` }}>{ext.toUpperCase()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dependencies */}
                <div>
                  <Eyebrow color={V.textMuted}>DEPENDENCIES ({activeMeta.deps.length})</Eyebrow>
                  <div className="mt-2 space-y-1">
                    {activeMeta.deps.map(dep => (
                      <div key={dep} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: V.bgElevated, border: `1px solid ${V.borderSubtle}` }}>
                        <CheckCircle2 size={10} color={V.emerald} />
                        <span className="flex-1" style={{ fontFamily: V.mono, fontSize: 10, color: V.textSecondary }}>{dep}</span>
                        <span style={{ fontFamily: V.mono, fontSize: 8, color: V.emerald }}>OK</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg"
                    style={{ background: V.cyanDim, border: `1px solid ${V.borderCyan}`, cursor: "pointer" }}>
                    <RefreshCw size={10} color={V.cyan} />
                    <span style={{ fontFamily: V.mono, fontSize: 9, fontWeight: 700, color: V.cyan }}>RE-VERIFY</span>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg"
                    style={{ background: V.violetDim, border: `1px solid ${V.borderViolet}`, cursor: "pointer" }}>
                    <Download size={10} color={V.violet} />
                    <span style={{ fontFamily: V.mono, fontSize: 9, fontWeight: 700, color: V.violet }}>EXTRACT</span>
                  </motion.button>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SATELLITE TAB — Remote connections, sync endpoints
   ═══════════════════════════════════════════════════════════════════ */
const satelliteEndpoints = [
  { id: "SAT-01", name: "EA Origin CDN", region: "US-EAST", latency: "12ms", status: "connected", protocol: "HTTPS/2", lastSync: "Just now", uptime: "99.98%" },
  { id: "SAT-02", name: "Mod Registry Hub", region: "EU-WEST", latency: "34ms", status: "connected", protocol: "WSS", lastSync: "2m ago", uptime: "99.94%" },
  { id: "SAT-03", name: "STBL Translation API", region: "AP-EAST", latency: "68ms", status: "connected", protocol: "gRPC", lastSync: "4m ago", uptime: "99.87%" },
  { id: "SAT-04", name: "Neural Engine Cloud", region: "US-WEST", latency: "8ms", status: "connected", protocol: "WSS", lastSync: "Just now", uptime: "99.99%" },
  { id: "SAT-05", name: "Community Vault Mirror", region: "EU-CENTRAL", latency: "42ms", status: "degraded", protocol: "HTTPS/2", lastSync: "12m ago", uptime: "98.2%" },
  { id: "SAT-06", name: "Backup Storage (Cold)", region: "AP-SOUTH", latency: "180ms", status: "standby", protocol: "S3", lastSync: "2h ago", uptime: "100%" },
];

function SatelliteContent() {
  const panelW = useScaledPx(300);
  const [selectedEp, setSelectedEp] = useState<string | null>(null);
  const activeEp = selectedEp ? satelliteEndpoints.find(e => e.id === selectedEp) : null;

  return (
    <>
      <GlassPanel className="flex flex-col" style={{ width: panelW, flexShrink: 0 }} glow={`${V.emerald}04`}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${V.border}` }}>
          <Globe size={13} color={V.emerald} />
          <Eyebrow color={V.textSecondary}>Satellite Network</Eyebrow>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {[
            { label: "Active Connections", value: `${satelliteEndpoints.filter(e => e.status === "connected").length}`, color: V.emerald },
            { label: "Degraded", value: `${satelliteEndpoints.filter(e => e.status === "degraded").length}`, color: V.amber },
            { label: "Standby", value: `${satelliteEndpoints.filter(e => e.status === "standby").length}`, color: V.textTertiary },
            { label: "Avg Latency", value: `${Math.round(satelliteEndpoints.reduce((a, e) => a + parseInt(e.latency), 0) / satelliteEndpoints.length)}ms`, color: V.cyan },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${V.borderSubtle}` }}>
              <span style={{ fontSize: 11, color: V.textSecondary }}>{s.label}</span>
              <span style={{ fontFamily: V.mono, fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</span>
            </div>
          ))}
          <div className="h-px" style={{ background: V.border }} />
          <Eyebrow color={V.textMuted}>REGIONS</Eyebrow>
          {["US-EAST", "US-WEST", "EU-WEST", "EU-CENTRAL", "AP-EAST", "AP-SOUTH"].map(r => {
            const eps = satelliteEndpoints.filter(e => e.region === r);
            const color = eps.length > 0 ? (eps[0].status === "connected" ? V.emerald : eps[0].status === "degraded" ? V.amber : V.textMuted) : V.textDim;
            return (
              <div key={r} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}60` }} />
                <span style={{ fontFamily: V.mono, fontSize: 10, color: V.textTertiary }}>{r}</span>
                <span style={{ fontFamily: V.mono, fontSize: 9, color: V.textMuted, marginLeft: "auto" }}>{eps.length} endpoint{eps.length !== 1 ? "s" : ""}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between px-4 py-2" style={{ borderTop: `1px solid ${V.border}` }}>
          <span style={{ fontSize: 9, fontFamily: V.mono, color: V.textMuted }}>Network: Healthy</span>
          <NeuralDot color={V.emerald} size={4} />
        </div>
      </GlassPanel>
      <div className="flex-1 flex gap-2 min-w-0">
        <GlassPanel className={`flex flex-col ${activeEp ? "w-1/2" : "flex-1"}`} glow={`${V.cyan}04`}>
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${V.border}` }}>
            <div className="flex items-center gap-2">
              <Radio size={13} color={V.cyan} />
              <Eyebrow color={V.textSecondary}>Satellite Endpoints</Eyebrow>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: V.emeraldDim, border: `1px solid ${V.borderEmerald}`, cursor: "pointer" }}>
              <RefreshCw size={10} color={V.emerald} />
              <span style={{ fontFamily: V.mono, fontSize: 9, fontWeight: 700, color: V.emerald }}>REFRESH ALL</span>
            </motion.button>
          </div>
          <StaggerList className="flex-1 overflow-y-auto">
            {satelliteEndpoints.map(ep => {
              const statusColor = ep.status === "connected" ? V.emerald : ep.status === "degraded" ? V.amber : V.textTertiary;
              const isActive = selectedEp === ep.id;
              return (
                <StaggerItem key={ep.id}>
                  <div className="px-5 py-3.5 transition-colors cursor-pointer" style={{
                    borderBottom: `1px solid ${V.borderSubtle}`,
                    background: isActive ? `${V.cyan}08` : "transparent",
                    borderLeft: isActive ? `2px solid ${V.cyan}` : "2px solid transparent",
                  }}
                    onClick={() => setSelectedEp(isActive ? null : ep.id)}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = V.bgHover; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? `${V.cyan}08` : "transparent"; }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}60` }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: V.textPrimary }}>{ep.name}</span>
                        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 8, fontFamily: V.mono, fontWeight: 700, color: statusColor, background: `${statusColor}10` }}>{ep.status.toUpperCase()}</span>
                      </div>
                      <span style={{ fontFamily: V.mono, fontSize: 10, fontWeight: 700, color: V.cyanBright }}>{ep.latency}</span>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <span style={{ fontFamily: V.mono, fontSize: 9, color: V.textMuted }}>{ep.id}</span>
                      <span style={{ fontFamily: V.mono, fontSize: 9, color: V.textTertiary }}>{ep.region}</span>
                      <span style={{ fontFamily: V.mono, fontSize: 9, color: V.violet }}>{ep.protocol}</span>
                      <span style={{ fontSize: 9, color: V.textMuted }}>Synced: {ep.lastSync}</span>
                      <span style={{ fontSize: 9, color: V.emerald, marginLeft: "auto" }}>{ep.uptime} uptime</span>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </GlassPanel>
        {/* Endpoint Detail Panel */}
        <AnimatePresence>
          {activeEp && (
            <motion.div
              initial={{ opacity: 0, x: 16, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "50%" }}
              exit={{ opacity: 0, x: 16, width: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <GlassPanel className="h-full flex flex-col" glow={`${V.violet}06`} borderColor={V.borderViolet}>
                <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${V.border}`, background: "rgba(3,3,5,0.5)" }}>
                  <div className="flex items-center gap-2">
                    <Server size={13} color={V.violetBright} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: V.textPrimary, fontFamily: V.display }}>{activeEp.name}</span>
                  </div>
                  <button onClick={() => setSelectedEp(null)} className="p-1 rounded hover:bg-white/5 cursor-pointer">
                    <XCircle size={14} color={V.textMuted} />
                  </button>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeEp.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
                  >
                    {/* Status header */}
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{
                        background: activeEp.status === "connected" ? V.emerald : activeEp.status === "degraded" ? V.amber : V.textTertiary,
                        boxShadow: `0 0 10px ${activeEp.status === "connected" ? V.emerald : activeEp.status === "degraded" ? V.amber : V.textTertiary}60`,
                      }} />
                      <span style={{ fontFamily: V.mono, fontSize: 14, fontWeight: 800, color: activeEp.status === "connected" ? V.emerald : activeEp.status === "degraded" ? V.amber : V.textTertiary }}>
                        {activeEp.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Connection details */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "ENDPOINT ID", value: activeEp.id, color: V.violet },
                        { label: "REGION", value: activeEp.region, color: V.cyan },
                        { label: "PROTOCOL", value: activeEp.protocol, color: V.violetBright },
                        { label: "LATENCY", value: activeEp.latency, color: parseInt(activeEp.latency) < 50 ? V.emerald : V.amber },
                        { label: "LAST SYNC", value: activeEp.lastSync, color: V.textSecondary },
                        { label: "UPTIME", value: activeEp.uptime, color: V.emerald },
                      ].map(d => (
                        <div key={d.label} className="rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${V.borderSubtle}` }}>
                          <span style={{ fontSize: 8, fontWeight: 700, color: V.textMuted, letterSpacing: "0.12em" }}>{d.label}</span>
                          <div style={{ fontFamily: V.mono, fontSize: 13, fontWeight: 700, color: d.color, marginTop: 3 }}>{d.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Latency visualization */}
                    <div>
                      <Eyebrow color={V.textMuted}>LATENCY TREND</Eyebrow>
                      <div className="flex items-end gap-1 mt-2 h-12">
                        {Array.from({ length: 20 }, (_, i) => {
                          const base = parseInt(activeEp.latency);
                          const h = Math.max(4, base * 0.3 + Math.sin(i * 0.8) * base * 0.15 + Math.random() * 4);
                          const maxH = 48;
                          const pct = Math.min(h / maxH * 100, 100);
                          return (
                            <div key={i} className="flex-1 rounded-t" style={{
                              height: `${pct}%`,
                              background: h > base * 0.4 ? V.amber : V.emerald,
                              opacity: 0.5 + (i / 20) * 0.5,
                            }} />
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span style={{ fontSize: 8, fontFamily: V.mono, color: V.textDim }}>-60s</span>
                        <span style={{ fontSize: 8, fontFamily: V.mono, color: V.textDim }}>now</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${V.border}` }}>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg flex-1 justify-center"
                        style={{ background: V.emeraldDim, border: `1px solid ${V.borderEmerald}`, cursor: "pointer" }}>
                        <RefreshCw size={10} color={V.emerald} />
                        <span style={{ fontFamily: V.mono, fontSize: 9, fontWeight: 700, color: V.emerald }}>PING</span>
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg flex-1 justify-center"
                        style={{ background: V.violetDim, border: `1px solid ${V.borderViolet}`, cursor: "pointer" }}>
                        <Activity size={10} color={V.violetBright} />
                        <span style={{ fontFamily: V.mono, fontSize: 9, fontWeight: 700, color: V.violetBright }}>DIAGNOSE</span>
                      </motion.button>
                      {activeEp.status !== "standby" && (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg flex-1 justify-center"
                          style={{ background: V.roseDim, border: `1px solid ${V.borderRose}`, cursor: "pointer" }}>
                          <XCircle size={10} color={V.roseBright} />
                          <span style={{ fontFamily: V.mono, fontSize: 9, fontWeight: 700, color: V.roseBright }}>DISCONNECT</span>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CONFIG TAB — Vault settings, tuning, preferences
   ═══════════════════════════════════════════════════════════════════ */
function ConfigToggle({ label, description, value, onChange, color = V.emerald }: {
  label: string; description?: string; value: boolean; onChange: (v: boolean) => void; color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-1" style={{ borderBottom: `1px solid ${V.borderSubtle}` }}>
      <div className="flex-1 mr-4">
        <div style={{ fontSize: 12, fontWeight: 600, color: V.textPrimary }}>{label}</div>
        {description && <div style={{ fontSize: 10, color: V.textMuted, marginTop: 2 }}>{description}</div>}
      </div>
      <button onClick={() => onChange(!value)} className="relative flex-shrink-0"
        style={{ width: 36, height: 20, borderRadius: 10, background: value ? color : "rgba(255,255,255,0.08)", transition: "background 0.2s", border: `1px solid ${value ? `${color}50` : V.borderSubtle}` }}>
        <motion.div className="absolute top-0.5 rounded-full" animate={{ left: value ? 17 : 2 }}
          transition={{ type: "spring", stiffness: 520, damping: 35 }}
          style={{ width: 16, height: 16, background: value ? "#fff" : V.textMuted, boxShadow: value ? `0 0 6px ${color}60` : "none" }} />
      </button>
    </div>
  );
}

const configCategories = [
  { key: "scanning", icon: Shield, label: "Scanning", color: V.cyan },
  { key: "neural", icon: Sparkles, label: "Neural Engine", color: V.violet },
  { key: "monitoring", icon: Activity, label: "Monitoring", color: V.emerald },
  { key: "interface", icon: Settings, label: "Interface", color: V.textSecondary },
  { key: "security", icon: Lock, label: "Security", color: V.rose },
];

function ConfigContent() {
  const panelW = useScaledPx(220);
  const [activeCat, setActiveCat] = useState("scanning");
  const [cfg, setCfg] = useState({
    autoScan: true, deepScan: false, aiAssist: true, autoFix: false,
    neuralPrecision: true, neuralPredict: true, neuralParallel: false, neuralAutoRetrain: false,
    liveMonitor: true, alertThreshold: true, perfLogging: false, autoRestart: false,
    notifications: true, soundAlerts: false, darkMode: true, compactView: false,
    encryptVault: true, auditLog: true, twoFactor: false, sessionTimeout: true,
  });
  const u = (k: string, v: boolean) => setCfg(p => ({ ...p, [k]: v }));
  const cat = configCategories.find(c => c.key === activeCat)!;
  const CatIcon = cat.icon;

  const renderCategoryContent = () => {
    switch (activeCat) {
      case "scanning": return (
        <>
          <div className="mb-4"><Eyebrow color={V.textMuted}>SCAN SETTINGS</Eyebrow></div>
          <ConfigToggle label="Auto-Scan on Load" description="Automatically scan mods when vault opens" value={cfg.autoScan} onChange={v => u("autoScan", v)} color={V.cyan} />
          <ConfigToggle label="Deep Scan Mode" description="Enable thorough resource analysis (slower)" value={cfg.deepScan} onChange={v => u("deepScan", v)} color={V.violet} />
          <ConfigToggle label="AI-Assisted Analysis" description="Use Neural Engine for conflict prediction" value={cfg.aiAssist} onChange={v => u("aiAssist", v)} color={V.violetBright} />
          <ConfigToggle label="Auto-Fix Low Severity" description="Automatically resolve low-severity issues" value={cfg.autoFix} onChange={v => u("autoFix", v)} color={V.emerald} />
        </>
      );
      case "neural": return (
        <>
          <div className="mb-4"><Eyebrow color={V.textMuted}>NEURAL ENGINE SETTINGS</Eyebrow></div>
          <ConfigToggle label="High Precision Mode" description="Increase analysis accuracy at the cost of speed" value={cfg.neuralPrecision} onChange={v => u("neuralPrecision", v)} color={V.violet} />
          <ConfigToggle label="Predictive Conflicts" description="Predict future mod conflicts using ML patterns" value={cfg.neuralPredict} onChange={v => u("neuralPredict", v)} color={V.cyanBright} />
          <ConfigToggle label="Parallel Processing" description="Use multi-core inference for faster scans" value={cfg.neuralParallel} onChange={v => u("neuralParallel", v)} color={V.emerald} />
          <ConfigToggle label="Auto-Retrain Model" description="Retrain on new conflict resolution patterns" value={cfg.neuralAutoRetrain} onChange={v => u("neuralAutoRetrain", v)} color={V.amber} />
        </>
      );
      case "monitoring": return (
        <>
          <div className="mb-4"><Eyebrow color={V.textMuted}>MONITORING SETTINGS</Eyebrow></div>
          <ConfigToggle label="Live File Monitoring" description="Watch for file changes in real-time" value={cfg.liveMonitor} onChange={v => u("liveMonitor", v)} color={V.emerald} />
          <ConfigToggle label="Alert Threshold: High" description="Only alert on high+ severity issues" value={cfg.alertThreshold} onChange={v => u("alertThreshold", v)} color={V.amber} />
          <ConfigToggle label="Performance Logging" description="Log system performance metrics to disk" value={cfg.perfLogging} onChange={v => u("perfLogging", v)} color={V.cyan} />
          <ConfigToggle label="Auto-Restart Services" description="Automatically restart crashed monitoring daemons" value={cfg.autoRestart} onChange={v => u("autoRestart", v)} color={V.violet} />
        </>
      );
      case "interface": return (
        <>
          <div className="mb-4"><Eyebrow color={V.textMuted}>INTERFACE SETTINGS</Eyebrow></div>
          <ConfigToggle label="Push Notifications" description="Show alerts for new conflicts" value={cfg.notifications} onChange={v => u("notifications", v)} color={V.cyan} />
          <ConfigToggle label="Sound Alerts" description="Play audio on critical detections" value={cfg.soundAlerts} onChange={v => u("soundAlerts", v)} color={V.amber} />
          <ConfigToggle label="Dark Mode" description="Spectral Overhaul dark theme" value={cfg.darkMode} onChange={v => u("darkMode", v)} />
          <ConfigToggle label="Compact View" description="Reduce spacing in panels" value={cfg.compactView} onChange={v => u("compactView", v)} />
        </>
      );
      case "security": return (
        <>
          <div className="mb-4"><Eyebrow color={V.textMuted}>SECURITY SETTINGS</Eyebrow></div>
          <ConfigToggle label="Encrypt Vault Data" description="AES-256 encryption for stored data" value={cfg.encryptVault} onChange={v => u("encryptVault", v)} color={V.rose} />
          <ConfigToggle label="Audit Logging" description="Log all vault access events" value={cfg.auditLog} onChange={v => u("auditLog", v)} color={V.violet} />
          <ConfigToggle label="Two-Factor Auth" description="Require 2FA for vault unlock" value={cfg.twoFactor} onChange={v => u("twoFactor", v)} color={V.rose} />
          <ConfigToggle label="Session Timeout" description="Auto-lock vault after 30 min of inactivity" value={cfg.sessionTimeout} onChange={v => u("sessionTimeout", v)} color={V.amber} />
        </>
      );
      default: return null;
    }
  };

  return (
    <>
      <GlassPanel className="flex flex-col" style={{ width: panelW, flexShrink: 0 }} glow={`${V.violet}04`}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${V.border}` }}>
          <Sliders size={13} color={V.violet} />
          <Eyebrow color={V.textSecondary}>Configuration</Eyebrow>
        </div>
        <StaggerList className="flex-1 overflow-y-auto py-1">
          {configCategories.map(c => {
            const isActive = activeCat === c.key;
            return (
              <StaggerItem key={c.key}>
                <div className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-colors relative"
                  style={{ background: isActive ? V.violetDim : "transparent", borderLeft: isActive ? `2px solid ${V.violet}` : "2px solid transparent" }}
                  onClick={() => setActiveCat(c.key)}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = V.bgHover; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? V.violetDim : "transparent"; }}>
                  {isActive && (
                    <motion.div
                      layoutId="rv-config-indicator"
                      className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full"
                      style={{ background: V.violet, boxShadow: `0 0 6px ${V.violet}60` }}
                      transition={{ type: "spring", stiffness: 520, damping: 35 }}
                    />
                  )}
                  <c.icon size={13} color={isActive ? c.color : V.textMuted} />
                  <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? V.textPrimary : V.textTertiary }}>{c.label}</span>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerList>
      </GlassPanel>
      <GlassPanel className="flex-1 flex flex-col" glow={`${cat.color}04`}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${V.border}` }}>
          <div className="flex items-center gap-2">
            <CatIcon size={13} color={cat.color} />
            <Eyebrow color={V.textSecondary}>{cat.label} Configuration</Eyebrow>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: V.emeraldDim, border: `1px solid ${V.borderEmerald}`, cursor: "pointer" }}>
            <CheckCircle2 size={10} color={V.emerald} />
            <span style={{ fontFamily: V.mono, fontSize: 9, fontWeight: 700, color: V.emerald }}>SAVE ALL</span>
          </motion.button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCat}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 overflow-y-auto px-5 py-2"
          >
            {renderCategoryContent()}
          </motion.div>
        </AnimatePresence>
      </GlassPanel>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN: REBELS VAULT CRM
   ═══════════════════════════════════════════════════════════════════ */
export function RebelsVaultView() {
  const [activeTab, setActiveTab] = useState<NavTab>("triage");
  const [selectedNode, setSelectedNode] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [neuralPulse, setNeuralPulse] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setNeuralPulse(p => !p), 2200);
    return () => clearInterval(t);
  }, []);

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return diagNodes;
    const q = searchQuery.toLowerCase();
    return diagNodes.filter(n =>
      n.name.toLowerCase().includes(q) ||
      n.id.toLowerCase().includes(q) ||
      n.module.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeNode = filteredNodes[selectedNode] || filteredNodes[0];

  return (
    <div className="flex flex-col h-full w-full select-none" style={{ background: V.bg, fontFamily: V.sans, color: V.textPrimary }}>

      {/* ═══════════════════════════════════════════════════
          HEADER
         ═══════════════════════════════════════════════════ */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{
          background: "rgba(3,3,5,0.95)",
          backdropFilter: V.glassBlur,
          borderBottom: `1px solid ${V.border}`,
        }}
      >
        <div className="flex items-center gap-4">
          {/* Logo mark */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl relative overflow-hidden"
              style={{
                width: 34, height: 34,
                background: `linear-gradient(135deg, ${V.violet}30, ${V.cyan}20)`,
                border: `1px solid ${V.borderViolet}`,
                boxShadow: `0 0 20px ${V.violet}15`,
              }}
            >
              <Shield size={16} color={V.violetBright} />
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${V.violet}40, transparent)` }} />
            </div>
            <div className="flex flex-col">
              <span style={{
                fontFamily: V.display, fontSize: 18, fontWeight: 900,
                fontStyle: "italic", color: V.textPrimary,
                letterSpacing: "0.04em", lineHeight: 1,
              }}>
                REBELS VAULT CRM
              </span>
              <span style={{ fontSize: 9, color: V.violet, fontWeight: 600, letterSpacing: "0.15em", marginTop: 1 }}>
                SPECTRAL OVERHAUL • v4.2.0
              </span>
            </div>
          </div>

          {/* Neural Engine indicator */}
          <div className="flex items-center gap-2 ml-4 px-3 py-1.5 rounded-lg" style={{
            background: V.violetDim,
            border: `1px solid ${V.borderViolet}`,
          }}>
            <NeuralDot color={V.violet} size={5} />
            <span style={{ fontSize: 9, color: V.violetBright, fontWeight: 700, letterSpacing: "0.1em" }}>
              NEURAL ENGINE
            </span>
            <span style={{ fontSize: 9, color: V.textMuted }}>|</span>
            <span style={{ fontSize: 9, fontFamily: V.mono, color: neuralPulse ? V.emerald : V.textTertiary, fontWeight: 600 }}>
              ACTIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sync Button */}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:brightness-110 active:scale-[0.97]"
            style={{
              background: V.cyanDim,
              border: `1px solid ${V.borderCyan}`,
              boxShadow: `0 0 12px ${V.cyan}08`,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={12} color={V.cyan} />
            <span style={{ fontFamily: V.mono, fontSize: 11, fontWeight: 700, color: V.cyan, letterSpacing: "0.06em" }}>SYNC</span>
          </button>

          {/* Unlock Vault */}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:brightness-110 active:scale-[0.97]"
            style={{
              background: `linear-gradient(135deg, ${V.violet}25, ${V.cyan}15)`,
              border: `1px solid ${V.borderViolet}`,
              boxShadow: `0 0 16px ${V.violet}12`,
              cursor: "pointer",
            }}
          >
            <Unlock size={12} color={V.violetBright} />
            <span style={{ fontFamily: V.mono, fontSize: 11, fontWeight: 700, color: V.violetBright, letterSpacing: "0.06em" }}>UNLOCK VAULT</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          TELEMETRY BAR
         ═══════════════════════════════════════════════════ */}
      <StaggerList className="flex gap-2 px-3 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${V.border}`, background: V.bgPanel }}>
        <StaggerItem className="flex-1">
          <TelemetryCard
            label="Vault Integrity"
            value="HARDENED"
            sub="Status: Secure"
            icon={Shield}
            accentColor={V.emerald}
            glow={`${V.emerald}06`}
          />
        </StaggerItem>
        <StaggerItem className="flex-1">
          <TelemetryCard
            label="Active Mods"
            value="1,240"
            sub="12 new this week"
            icon={Box}
            accentColor={V.cyan}
            glow={`${V.cyan}06`}
          />
        </StaggerItem>
        <StaggerItem className="flex-1">
          <TelemetryCard
            label="Detected Issues"
            value="42"
            sub="8 critical"
            icon={AlertTriangle}
            accentColor={V.amber}
            glow={`${V.amber}06`}
          />
        </StaggerItem>
        <StaggerItem className="flex-1">
          <TelemetryCard
            label="Coverage"
            value="84%"
            sub="Scanning active"
            icon={BarChart3}
            accentColor={V.violet}
            glow={`${V.violet}06`}
          />
        </StaggerItem>
      </StaggerList>

      {/* ═══════════════════════════════════════════════════
          NAVIGATION TABS
         ═══════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 px-4 py-0 flex-shrink-0" style={{ borderBottom: `1px solid ${V.border}`, background: V.bgPanel }}>
        {navTabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative px-4 py-2.5 transition-all"
              style={{
                fontFamily: V.mono,
                fontSize: 11,
                fontWeight: isActive ? 800 : 500,
                color: isActive ? V.violetBright : V.textTertiary,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.06em",
              }}
            >
              {tab.label}
              {/* Active underline */}
              {isActive && (
                <motion.div
                  layoutId="rv-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${V.violet}, ${V.violetBright})`,
                    boxShadow: `0 0 8px ${V.violet}60, 0 2px 12px ${V.violet}30`,
                  }}
                  transition={{ type: "spring", stiffness: 520, damping: 35 }}
                />
              )}
            </button>
          );
        })}
        <div className="flex-1" />
        {/* Neural Engine micro-indicators */}
        <div className="flex items-center gap-3 pr-2">
          <div className="flex items-center gap-1.5">
            <NeuralDot color={V.violet} size={4} />
            <span style={{ fontSize: 8, fontFamily: V.mono, color: V.textMuted }}>NE-CORE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <NeuralDot color={V.cyan} size={4} />
            <span style={{ fontSize: 8, fontFamily: V.mono, color: V.textMuted }}>NE-SCAN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <NeuralDot color={V.emerald} size={4} />
            <span style={{ fontSize: 8, fontFamily: V.mono, color: V.textMuted }}>NE-SYNC</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT — TRIAGE VIEW
         ═══════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-1 min-h-0 gap-2 p-2"
        >
          {activeTab === "triage" && <TriageContent filteredNodes={filteredNodes} selectedNode={selectedNode} setSelectedNode={setSelectedNode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
          {activeTab === "system" && <SystemContent />}
          {activeTab === "warehouse" && <WarehouseContent />}
          {activeTab === "satellite" && <SatelliteContent />}
          {activeTab === "config" && <ConfigContent />}
        </motion.div>
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
          FOOTER STATUS BAR
         ═══════════════════════════════════════════════════ */}
      <div
        className="flex items-center justify-between px-4 py-1.5 flex-shrink-0"
        style={{ background: "rgba(3,3,5,0.95)", borderTop: `1px solid ${V.border}` }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: V.mono, fontSize: 10, color: V.textMuted }}>CRM v4.2.0</span>
          <div className="h-2.5 w-px" style={{ background: V.border }} />
          <span style={{ fontSize: 10, color: V.textTertiary }}>Spectral Overhaul</span>
          <div className="h-2.5 w-px" style={{ background: V.border }} />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: V.emerald, boxShadow: `0 0 4px ${V.emerald}` }} />
            <span style={{ fontSize: 10, color: V.emerald, fontWeight: 500 }}>Vault Connected</span>
          </div>
          <div className="h-2.5 w-px" style={{ background: V.border }} />
          <div className="flex items-center gap-1.5">
            <NeuralDot color={V.violet} size={3} />
            <span style={{ fontSize: 10, color: V.textTertiary }}>Neural Engine: 3 cores active</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: V.mono, fontSize: 9, color: V.textMuted }}>1,240 mods indexed</span>
          <div className="h-2.5 w-px" style={{ background: V.border }} />
          <span style={{ fontFamily: V.mono, fontSize: 9, color: V.textMuted }}>42 issues tracked</span>
          <div className="h-2.5 w-px" style={{ background: V.border }} />
          <div className="flex items-center gap-1.5">
            <Database size={10} color={V.textMuted} />
            <Layers size={10} color={V.textMuted} />
            <Cpu size={10} color={V.textMuted} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RebelsVaultView;