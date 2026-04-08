import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search, Zap, Activity, Cpu, Wifi,
  ChevronRight, ChevronDown, File, Folder, FolderOpen,
  Settings, Bell, GitBranch, GitCommit, Clock, AlertTriangle,
  CheckCircle2, XCircle, Plus, X,
  Terminal, Layers, BarChart3, Globe, Book, Package,
  Code2, RotateCcw, PanelBottomClose, PanelBottom,
  Sparkles, Database, FileCode, Languages,
  Info, MoreHorizontal, type LucideIcon, Boxes,
  Volume2, Wrench, FolderTree, FileJson,
  ArrowRight, Copy, ExternalLink, Filter,
  Rocket, Shield,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, AreaChart, Area,
} from "recharts";
import { SafeChartContainer } from "../components/SafeChartContainer";
import { MasterBibleView } from "../components/MasterBibleView";
import { ModAtlasView } from "../components/ModAtlasView";
import { ModSentinelView } from "../components/ModSentinelView";
import { BuildPipelineView } from "../components/BuildPipelineView";
import { RebelsVaultView } from "../components/RebelsVaultView";
import { SettingsCalibrationView } from "../components/SettingsCalibrationView";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════
   OBSIDIAN CRYSTAL DESIGN SYSTEM — TOKENS
   ═══════════════════════════════════════════════════════════════ */
const T = {
  bg: "#020204",
  bgPanel: "#0A0A0C",
  bgSurface: "#0c0c12",
  bgElevated: "#101018",
  bgHover: "#14141e",
  bgGlass: "rgba(6,6,10,0.85)",
  bgGlassHover: "rgba(12,12,20,0.92)",
  border: "rgba(255,255,255,0.04)",
  borderSubtle: "rgba(255,255,255,0.02)",
  borderActive: "rgba(139,92,246,0.4)",
  borderCyan: "rgba(6,182,212,0.4)",
  borderGlow: "rgba(139,92,246,0.2)",
  violet: "#8B5CF6",
  violetBright: "#A78BFA",
  violetDim: "rgba(139,92,246,0.12)",
  cyan: "#06B6D4",
  cyanBright: "#22D3EE",
  emerald: "#10B981",
  rose: "#F43F5E",
  amber: "#F59E0B",
  blue: "#3B82F6",
  lime: "#84CC16",
  textPrimary: "#E8E8ED",
  textSecondary: "#8B8B9E",
  textTertiary: "#55556A",
  textMuted: "#3D3D52",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  sans: "'Inter', system-ui, sans-serif",
  display: "'Outfit', 'Inter', system-ui, sans-serif",
  glassBlur: "blur(32px)",
};

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA — Enhanced density
   ═══════════════════════════════════════════════════════════════ */
const assetFiles = [
  { id: "0x08FE", name: "main_engine.cpp", pct: 100, status: "Translated", color: T.emerald, hash: "#24F936", size: "48.2 KB", lines: 1847, type: "code" as const },
  { id: "0x14:10", name: "physics.lua", pct: 73, status: "In Progress", color: T.amber, hash: "#D9F018", size: "12.8 KB", lines: 412, type: "lang" as const },
  { id: "0x031A1", name: "ai_manager.py", pct: 100, status: "Translated", color: T.emerald, hash: "#19D016", size: "34.1 KB", lines: 928, type: "lang" as const },
  { id: "0xA4:55", name: "audio.cpp", pct: 62, status: "Needs Review", color: T.rose, hash: "#F0A918", size: "8.4 KB", lines: 216, type: "code" as const },
  { id: "0x0841", name: "asset_registry.json", pct: 91, status: "Translated", color: T.cyanBright, hash: "#0CFED8", size: "156.7 KB", lines: 4218, type: "json" as const },
  { id: "0xB2:09", name: "strings_en.lang", pct: 88, status: "Translated", color: T.cyan, hash: "#3AF1E8", size: "22.3 KB", lines: 1024, type: "lang" as const },
  { id: "0xC3:7F", name: "config.json", pct: 100, status: "Translated", color: T.emerald, hash: "#08E4C2", size: "4.1 KB", lines: 87, type: "json" as const },
];

const langPairs = [
  { pair: "EN-JP", progress: 92, angle: -60 },
  { pair: "EN-DE", progress: 87, angle: -20 },
  { pair: "EN-FR", progress: 95, angle: 20 },
  { pair: "EN-ES", progress: 78, angle: 60 },
  { pair: "FR-ES", progress: 71, angle: 100 },
  { pair: "EN-ZH", progress: 65, angle: 140 },
  { pair: "EN-KO", progress: 88, angle: 180 },
  { pair: "EN-RU", progress: 82, angle: 220 },
];

const velocityData = Array.from({ length: 60 }, (_, i) => ({
  t: i,
  v: 70 + Math.sin(i * 0.3) * 15 + Math.random() * 10,
  w: 40 + Math.cos(i * 0.2) * 12 + Math.random() * 8,
}));

/* Right-panel file list (from reference) */
const rightPanelFiles = [
  { name: "Start Game", type: "String", ref: "CF-8716", status: "success" as const },
  { name: "controllers.yaml", type: "Config", ref: "STBL-0014", status: "success" as const },
  { name: "asset_registry.json", type: "Registry", ref: "REG-4218", status: "warning" as const },
  { name: "audio_config", type: "Audio", ref: "AUD-0055", status: "info" as const },
  { name: "physics_engine.lua", type: "Script", ref: "LUA-1410", status: "warning" as const },
  { name: "ui_hud_strings.xml", type: "UI", ref: "HUD-0841", status: "success" as const },
  { name: "mod_manifest.json", type: "Manifest", ref: "MAN-0001", status: "success" as const },
];

const logEntries = [
  { time: "14:32:25", type: "info" as const, text: 'Translated "Start Game" to EN-JP', ref: "LPRS-5710", detail: "Translation completed", hash: "a3f8e1" },
  { time: "14:32:21", type: "warning" as const, text: "Detected 3 untranslated segments in", ref: "level_01.entity", detail: "0xA455 flagged", hash: "b7c2d0" },
  { time: "14:32:18", type: "success" as const, text: "Merging translated files to master branch", ref: "LPRS-5710", detail: "messagepack integrated", hash: "c1d9e4" },
  { time: "14:32:16", type: "info" as const, text: "Automated QA check passed for EN-DE", ref: "", detail: "translation validation", hash: "d4e8f2" },
  { time: "14:32:15", type: "success" as const, text: "Automated QA check passed for EN-DE", ref: "", detail: "translation revision", hash: "e5f0a3" },
  { time: "14:32:13", type: "error" as const, text: "Ambiguous term: 'Jump' in context", ref: "LPR-112", detail: "Disambiguation needed", hash: "f6a1b4" },
  { time: "14:32:10", type: "info" as const, text: "Merging translated files to master branch", ref: "LPRS-5710", detail: "multilingual/extended phonetic", hash: "07b2c5" },
  { time: "14:32:08", type: "success" as const, text: "Translated/UpdateBatchlet translator: Item", ref: "level_01.entity", detail: "", hash: "18c3d6" },
  { time: "14:32:06", type: "info" as const, text: "Automated QA check passed for EN-DE", ref: "", detail: 'validation LPR-8 "Minor format"', hash: "29d4e7" },
  { time: "14:32:04", type: "warning" as const, text: "String overflow detected in ja_JP locale", ref: "UI_HUD_01", detail: "Max 32 chars exceeded", hash: "3ae5f8" },
  { time: "14:32:01", type: "success" as const, text: "Crystal Forge IDE v3.2.0 session initialized", ref: "", detail: "", hash: "4bf609" },
  { time: "14:31:58", type: "info" as const, text: "Loaded 4,218 string entries from 12 packages", ref: "STBL", detail: "", hash: "5c071a" },
  { time: "14:31:55", type: "success" as const, text: "WebSocket connected to relay server", ref: "wss://jpe-relay", detail: "", hash: "6d182b" },
];

const nodeTree = [
  { name: "Packages", icon: Package, count: 12, color: T.violet },
  { name: "Prefixes", icon: FileCode, count: 847, color: T.cyan },
  { name: "Audio", icon: Volume2, count: 24, color: T.emerald },
  { name: "Temp/configs", icon: Wrench, count: 8, color: T.amber },
];

/* ═══════════════════════════════════════════════════════════════
   EYEBROW LABEL — Obsidian Crystal micro-typography
   ═══════════════════════════════════════════════════════════════ */
function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`uppercase select-none ${className}`}
      style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: T.textTertiary }}
    >
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GLASSMORPHIC PANEL — 32px blur foundation
   ═══════════════════════════════════════════════════════════════ */
function GlassPanel({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: T.bgGlass,
        backdropFilter: T.glassBlur,
        WebkitBackdropFilter: T.glassBlur,
        border: `1px solid rgba(255,255,255,0.04)`,
        borderRadius: 32,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONCENTRIC TELEMETRY RINGS — SVG with "Mod Stability" ring
   ═══════════════════════════════════════════════════════════════ */
function TelemetryRings() {
  const [animPct, setAnimPct] = useState(0);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(elapsed / 2000, 1);
      setAnimPct(pct === 1 ? 1 : 1 - Math.pow(2, -10 * pct));
      if (pct < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const coveragePct = 84.3;
  const stabilityPct = 78;
  const velocityPct = 84.3;
  const cx = 250, cy = 250;

  const makeArc = (r: number, pct: number) => {
    const sweep = (pct / 100) * 360 * animPct;
    if (sweep <= 0) return `M ${cx} ${cy - r} L ${cx} ${cy - r}`;
    const rad = (sweep - 90) * (Math.PI / 180);
    const x2 = cx + r * Math.cos(rad);
    const y2 = cy + r * Math.sin(rad);
    const large = sweep > 180 ? 1 : 0;
    return `M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: "100%", height: "100%" }}>
      <svg viewBox="0 0 500 500" className="w-full h-full max-w-[520px] max-h-[520px]">
        <defs>
          <linearGradient id="ringGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={T.cyan} />
            <stop offset="50%" stopColor={T.violet} />
            <stop offset="100%" stopColor={T.cyanBright} />
          </linearGradient>
          <linearGradient id="ringGradMid" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={T.violet} />
            <stop offset="100%" stopColor={T.emerald} />
          </linearGradient>
          <linearGradient id="ringGradInner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={T.violet} />
            <stop offset="50%" stopColor={T.cyanBright} />
            <stop offset="100%" stopColor={T.violet} />
          </linearGradient>
          <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
          <filter id="glowViolet" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
          <filter id="glowEmerald" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>

        {/* Decorative grid lines */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle - 90) * (Math.PI / 180);
          return (
            <line
              key={`gridline-${angle}`}
              x1={cx + 95 * Math.cos(rad)} y1={cy + 95 * Math.sin(rad)}
              x2={cx + 205 * Math.cos(rad)} y2={cy + 205 * Math.sin(rad)}
              stroke="rgba(255,255,255,0.02)" strokeWidth={0.5}
            />
          );
        })}

        {/* Outer ring — Translation Coverage */}
        <circle cx={cx} cy={cy} r={195} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={14} />
        <path d={makeArc(195, coveragePct)} fill="none" stroke={T.cyan} strokeWidth={16} strokeLinecap="round" filter="url(#glowCyan)" opacity={0.35} />
        <path d={makeArc(195, coveragePct)} fill="none" stroke="url(#ringGradOuter)" strokeWidth={12} strokeLinecap="round" />

        {/* Middle ring — Mod Stability */}
        <circle cx={cx} cy={cy} r={155} fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth={10} />
        <path d={makeArc(155, stabilityPct)} fill="none" stroke={T.emerald} strokeWidth={10} strokeLinecap="round" filter="url(#glowEmerald)" opacity={0.25} />
        <path d={makeArc(155, stabilityPct)} fill="none" stroke="url(#ringGradMid)" strokeWidth={7} strokeLinecap="round" />

        {/* Inner ring — Translation Velocity */}
        <circle cx={cx} cy={cy} r={115} fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth={8} />
        <path d={makeArc(115, velocityPct)} fill="none" stroke={T.violet} strokeWidth={10} strokeLinecap="round" filter="url(#glowViolet)" opacity={0.3} />
        <path d={makeArc(115, velocityPct)} fill="none" stroke="url(#ringGradInner)" strokeWidth={6} strokeLinecap="round" />

        {/* Tick marks */}
        {[0, 25, 50, 75].map((pct) => {
          const angle = (pct / 100) * 360 - 90;
          const rad = angle * (Math.PI / 180);
          return (
            <g key={`tick-${pct}`}>
              <line x1={cx + 204 * Math.cos(rad)} y1={cy + 204 * Math.sin(rad)} x2={cx + 212 * Math.cos(rad)} y2={cy + 212 * Math.sin(rad)} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
              <text x={cx + 222 * Math.cos(rad)} y={cy + 222 * Math.sin(rad)} fill={T.textMuted} fontSize={7} fontFamily={T.mono} textAnchor="middle" dominantBaseline="middle">
                {pct}%
              </text>
            </g>
          );
        })}

        {/* TRANSLATION COMPLETION label */}
        <text x={cx} y={cy - 218} fill={T.textTertiary} fontSize={8} fontFamily={T.sans} textAnchor="middle" fontWeight={800} letterSpacing="0.2em">
          TRANSLATION COMPLETION
        </text>

        {/* Central data */}
        <text x={cx} y={cy - 32} fill={T.textPrimary} fontSize={44} fontFamily={T.mono} textAnchor="middle" fontWeight={700}>
          {(coveragePct * animPct).toFixed(1)}%
        </text>
        <text x={cx} y={cy - 10} fill={T.textTertiary} fontSize={9} fontFamily={T.sans} textAnchor="middle" fontWeight={700} letterSpacing="0.16em">
          COMPLETE
        </text>

        <text x={cx} y={cy + 14} fill={T.textMuted} fontSize={7} fontFamily={T.sans} textAnchor="middle" fontWeight={700} letterSpacing="0.12em">
          LANGUAGE PAIRS
        </text>

        <text x={cx} y={cy + 36} fill={T.textTertiary} fontSize={7} fontFamily={T.sans} textAnchor="middle" fontWeight={800} letterSpacing="0.14em">
          TRANSLATION VELOCITY
        </text>

        <text x={cx} y={cy + 62} fill={T.textPrimary} fontSize={26} fontFamily={T.mono} textAnchor="middle" fontWeight={700}>
          {(velocityPct * animPct).toFixed(1)}%
        </text>
        <text x={cx} y={cy + 78} fill={T.textTertiary} fontSize={7} fontFamily={T.sans} textAnchor="middle" fontWeight={600} letterSpacing="0.1em">
          MEAN/RPS
        </text>

        {/* Language pair labels */}
        {langPairs.map((lp) => {
          const rad = (lp.angle - 90) * (Math.PI / 180);
          const x = cx + 236 * Math.cos(rad);
          const y = cy + 236 * Math.sin(rad);
          return (
            <g key={`lp-${lp.pair}`}>
              <text x={x} y={y} fill={T.textSecondary} fontSize={8} fontFamily={T.mono} textAnchor="middle" dominantBaseline="middle" fontWeight={600}>
                {lp.pair}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   METRIC WIDGET — Glassmorphic stat card
   ═══════════════════════════════════════════════════════════════ */
function MetricWidget({ label, value, sub, color, icon: Icon }: { label: string; value: string; sub: string; color: string; icon: LucideIcon }) {
  return (
    <GlassPanel
      className="rounded-xl p-3 cursor-default transition-all group relative overflow-hidden"
      style={{
        borderColor: T.border,
      }}
    >
      {/* Top glow hairline */}
      <div className="absolute top-0 left-3 right-3 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}15, transparent)` }} />
      <div className="flex items-center justify-between mb-2">
        <Eyebrow>{label}</Eyebrow>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center transition-all group-hover:shadow-[0_0_10px]" style={{ background: `${color}12`, boxShadow: `0 0 0 ${color}00` }}>
          <Icon size={11} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 22, fontFamily: T.mono, fontWeight: 700, color, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{sub}</span>
      </div>
    </GlassPanel>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ASSET BROWSER — Left sidebar with enhanced density
   ═══════════════════════════════════════════════════════════════ */
function AssetBrowser() {
  const [assetFilter, setAssetFilter] = useState<"all" | "json" | "lang">("all");
  const filteredAssets = assetFilter === "all" ? assetFiles : assetFiles.filter(f => f.type === assetFilter);
  return (
    <div className="flex flex-col h-full select-none" style={{ fontFamily: T.sans }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2">
          <Eyebrow>ASSET BROWSER</Eyebrow>
          {assetFilter !== "all" && (
            <span style={{ fontSize: 8, fontFamily: T.mono, color: T.bg, background: assetFilter === "json" ? T.cyan : T.violet, borderRadius: 3, padding: "1px 5px", fontWeight: 700 }}>
              {filteredAssets.length} {assetFilter.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-white/5 transition-colors" title="Show JSON" onClick={() => setAssetFilter(p => p === "json" ? "all" : "json")}><FileJson size={10} color={assetFilter === "json" ? T.cyan : T.textTertiary} /></button>
          <button className="p-1 rounded hover:bg-white/5 transition-colors" title="Toggle filters" onClick={() => setAssetFilter("all")}><Filter size={10} color={assetFilter !== "all" ? T.cyan : T.textTertiary} /></button>
          <button className="p-1 rounded hover:bg-white/5 transition-colors" title="Show language files" onClick={() => setAssetFilter(p => p === "lang" ? "all" : "lang")}><Languages size={10} color={assetFilter === "lang" ? T.violet : T.textTertiary} /></button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto py-0.5">
        {filteredAssets.map((f) => (
          <div
            key={f.id}
            className="group px-3 py-2 cursor-pointer transition-all"
            style={{ borderBottom: `1px solid ${T.borderSubtle}`, borderLeft: "2px solid transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.bgHover;
              e.currentTarget.style.borderLeftColor = T.violet;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderLeftColor = "transparent";
            }}
          >
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted, flexShrink: 0 }}>[{f.id}]</span>
                <span className="truncate" style={{ fontSize: 11, fontWeight: 500, color: T.textPrimary }}>{f.name}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span style={{ fontSize: 9, fontFamily: T.mono, color: f.color, fontWeight: 700 }}>{f.pct}%</span>
                <span style={{ fontSize: 8, color: T.textTertiary }}>{f.status}</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-1.5 w-full h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${f.pct}%`,
                  background: `linear-gradient(90deg, ${T.violet}, ${f.color})`,
                  boxShadow: `0 0 6px ${f.color}40`,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>{f.hash}</span>
                <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>{f.size}</span>
                <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>{f.lines}L</span>
              </div>
              <MoreHorizontal size={9} color={T.textMuted} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {/* Node Tree */}
      <div className="px-3 py-2" style={{ borderTop: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <FolderTree size={9} color={T.textTertiary} />
            <Eyebrow>NODE</Eyebrow>
          </div>
          <button className="p-0.5 rounded hover:bg-white/5" onClick={() => setAssetFilter("all")} title="Add node"><Plus size={9} color={T.textMuted} /></button>
        </div>
        <div className="space-y-0.5">
          {nodeTree.map((node) => {
            const Icon = node.icon;
            return (
              <div key={node.name} className="flex items-center gap-2 py-0.5 cursor-pointer group">
                <div className="w-1 h-1 rounded-full" style={{ background: node.color }} />
                <Icon size={9} color={node.color} />
                <span style={{ fontSize: 10, color: T.textSecondary }} className="group-hover:text-white transition-colors">{node.name}</span>
                <span className="ml-auto" style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>{node.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RIGHT PANEL — Split: Files + Real-Time Logs (from reference)
   ═══════════════════════════════════════════════════════════════ */
function RightPanel() {
  const [logFilter, setLogFilter] = useState<string | null>(null);
  const [logCopied, setLogCopied] = useState(false);
  const typeColors: Record<string, string> = { info: T.textSecondary, success: T.emerald, warning: T.amber, error: T.rose };
  const typeBg: Record<string, string> = { info: "transparent", success: "rgba(16,185,129,0.03)", warning: "rgba(245,158,11,0.03)", error: "rgba(244,63,94,0.04)" };
  const typeIcon: Record<string, React.ReactNode> = {
    info: <Info size={8} color={T.textTertiary} />,
    success: <CheckCircle2 size={8} color={T.emerald} />,
    warning: <AlertTriangle size={8} color={T.amber} />,
    error: <XCircle size={8} color={T.rose} />,
  };
  const fileStatusDot: Record<string, string> = { success: T.emerald, warning: T.amber, info: T.cyan };

  return (
    <div className="flex flex-col h-full select-none" style={{ fontFamily: T.sans }}>
      {/* ── TOP: File Quick-Reference ── */}
      <div style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}` }}>
          <Eyebrow>FILES</Eyebrow>
          <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>{rightPanelFiles.length} items</span>
        </div>
        <div className="max-h-[180px] overflow-y-auto">
          {rightPanelFiles.map((f, i) => (
            <div
              key={`rpf-${i}`}
              className="flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors"
              style={{ borderBottom: `1px solid ${T.borderSubtle}` }}
              onMouseEnter={(e) => { e.currentTarget.style.background = T.bgHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: fileStatusDot[f.status], boxShadow: `0 0 4px ${fileStatusDot[f.status]}50` }} />
              <span className="flex-1 truncate" style={{ fontSize: 10, color: T.textPrimary, fontWeight: 500 }}>{f.name}</span>
              <span style={{ fontSize: 7, fontFamily: T.mono, color: T.violet, background: T.violetDim, padding: "0 4px", borderRadius: 2, fontWeight: 600 }}>{f.ref}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM: Real-Time Logs ── */}
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}` }}>
        <Eyebrow>REAL-TIME LOGS</Eyebrow>
        <div className="flex items-center gap-1">
          <button className="p-0.5 rounded hover:bg-white/5" title="Cycle filter" onClick={() => { const levels = ["info", "success", "warning", "error", null]; const idx = levels.indexOf(logFilter); setLogFilter(levels[(idx + 1) % levels.length]); }}><Filter size={9} color={logFilter ? T.cyan : T.textTertiary} /></button>
          <button className="p-0.5 rounded hover:bg-white/5" title="Copy logs" onClick={() => { navigator.clipboard.writeText(logEntries.map(e => `[${e.time}] ${e.type}: ${e.text}`).join("\n")).then(() => toast.success("Logs copied")).catch(() => {}); setLogCopied(true); setTimeout(() => setLogCopied(false), 1200); }}>{logCopied ? <CheckCircle2 size={9} color={T.emerald} /> : <Copy size={9} color={T.textTertiary} />}</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {logEntries.filter(e => !logFilter || e.type === logFilter).map((entry, i) => (
          <div
            key={`log-${i}`}
            className="px-3 py-1.5 transition-colors cursor-default"
            style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: typeBg[entry.type] }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.bgHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = typeBg[entry.type]; }}
          >
            <div className="flex items-start gap-1.5">
              <span className="mt-0.5 flex-shrink-0">{typeIcon[entry.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted, flexShrink: 0 }}>{entry.time}</span>
                  {entry.ref && (
                    <span style={{ fontSize: 7, fontFamily: T.mono, color: T.violet, background: "rgba(139,92,246,0.08)", padding: "0 3px", borderRadius: 2 }}>
                      {entry.ref}
                    </span>
                  )}
                  <span className="ml-auto flex-shrink-0" style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>{entry.hash}</span>
                </div>
                <div className="mt-0.5" style={{ fontSize: 10, color: typeColors[entry.type], lineHeight: 1.4 }}>
                  {entry.text}
                </div>
                {entry.detail && (
                  <div style={{ fontSize: 8, color: T.textMuted, marginTop: 1 }}>{entry.detail}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-3 py-1 flex items-center justify-between" style={{ borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 8, fontFamily: T.mono, color: T.emerald }}>● live</span>
        <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>{logEntries.length} entries</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VELOCITY SPARKLINE — with enhanced density
   ═══════════════════════════════════════════════════════════════ */
function VelocitySparkline() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}` }}>
        <Eyebrow>VELOCITY</Eyebrow>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.violet }} />
            <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>wpm</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-0.5 rounded" style={{ background: T.cyan, opacity: 0.7 }} />
            <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>rps</span>
          </div>
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.cyan, fontWeight: 600 }}>84.3%</span>
        </div>
      </div>
      <div className="flex-1 px-1" style={{ minHeight: 50 }}>
        <SafeChartContainer>
          <AreaChart data={velocityData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} accessibilityLayer={false} clipPathId="clip-cf-velocity">
            <defs key="cf-velocity-defs">
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.violet} stopOpacity={0.3} />
                <stop offset="100%" stopColor={T.violet} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area key="spark-v" type="monotone" dataKey="v" stroke={T.violet} fill="url(#sparkGrad)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Area key="spark-w" type="monotone" dataKey="w" stroke={T.cyan} fill="none" strokeWidth={1} dot={false} strokeDasharray="2 2" isAnimationActive={false} />
          </AreaChart>
        </SafeChartContainer>
      </div>
      <div className="flex items-center justify-between px-3 py-1" style={{ borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>words per minute/sec</span>
        <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>60s window</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATUS METRICS BAR — Bottom metrics ribbon
   ═══════════════════════════════════════════════════════════════ */
function MetricsBar() {
  const metrics = [
    { label: "STRT", value: "4,218", color: T.violet },
    { label: "PASS", value: "3,891", color: T.emerald },
    { label: "WARN", value: "214", color: T.amber },
    { label: "FAIL", value: "17", color: T.rose },
    { label: "PKGS", value: "12", color: T.cyan },
    { label: "AI-C", value: "94.2%", color: T.violetBright },
    { label: "HEAP", value: "128M", color: T.blue },
    { label: "PING", value: "12ms", color: T.emerald },
  ];

  return (
    <div className="flex items-center gap-4 px-4 py-1" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
      {metrics.map((m) => (
        <div key={m.label} className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-sm" style={{ background: m.color }} />
          <span style={{ fontSize: 8, fontFamily: T.mono, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em" }}>{m.label}</span>
          <span style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 600, color: m.color }}>{m.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMMAND BAR — Glassmorphic ⌘K overlay
   ═══════════════════════════════════════════════════════════════ */
function CommandBar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const cmds = [
    { icon: Search, label: "Search translations...", shortcut: "Enter", color: T.textSecondary },
    { icon: Languages, label: "Switch locale → ko_KR", shortcut: "⌘L", color: T.cyan },
    { icon: Sparkles, label: "AI Translate selection", shortcut: "⌘⇧T", color: T.violet },
    { icon: Globe, label: "Open Mod Atlas registry", shortcut: "⌘M", color: T.emerald },
    { icon: GitBranch, label: "Create translation branch", shortcut: "⌘B", color: T.amber },
    { icon: Rocket, label: "Deploy to production", shortcut: "⌘⇧D", color: T.rose },
    { icon: BarChart3, label: "View telemetry dashboard", shortcut: "⌘1", color: T.cyanBright },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh]" onClick={onClose}>
      <div className="absolute inset-0 z-50" style={{ background: "rgba(2,2,4,0.7)", backdropFilter: T.glassBlur }} />
      <div
        className="relative w-full max-w-lg rounded-[32px] overflow-hidden"
        style={{
          background: "rgba(6,6,10,0.88)",
          backdropFilter: T.glassBlur,
          WebkitBackdropFilter: T.glassBlur,
          border: `1px solid rgba(255,255,255,0.04)`,
          boxShadow: `0 0 80px rgba(139,92,246,0.12), 0 0 30px rgba(6,182,212,0.06), 0 25px 50px rgba(0,0,0,0.6)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.violet}, ${T.cyan}, transparent)` }} />

        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
          <Search size={14} color={T.textTertiary} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 13, fontFamily: T.sans, color: T.textPrimary }}
          />
          <kbd className="px-1.5 py-0.5 rounded" style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary, background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}` }}>
            ESC
          </kbd>
        </div>
        <div className="py-1 max-h-72 overflow-y-auto">
          {cmds.filter((c) => !query || c.label.toLowerCase().includes(query.toLowerCase())).map((cmd, i) => {
            const Icon = cmd.icon;
            return (
              <button
                key={`cmd-${i}`}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                style={{ color: T.textSecondary }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.bgHover; e.currentTarget.style.color = T.textPrimary; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSecondary; }}
                onClick={onClose}
              >
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: `${cmd.color}12` }}>
                  <Icon size={12} color={cmd.color} />
                </div>
                <span className="flex-1 text-left" style={{ fontSize: 12 }}>{cmd.label}</span>
                <kbd className="px-1.5 py-0.5 rounded" style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
                  {cmd.shortcut}
                </kbd>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CRYSTAL FORGE PAGE — OMEGA WORKSTATION
   ═══════════════════════════════════════════════════════════════ */
export function CrystalForgePage() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [time, setTime] = useState("14:32:25");
  const [workspace, setWorkspace] = useState<"telemetry" | "bible" | "atlas" | "sentinel" | "pipeline" | "vault" | "settings">("settings");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCommandOpen((p) => !p); }
      if (e.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const workspaceTabs = [
    { label: "Telemetry", key: "telemetry" as const, icon: Activity },
    { label: "Master Bible", key: "bible" as const, icon: Book },
    { label: "Mod Atlas", key: "atlas" as const, icon: Globe },
    { label: "Mod Sentinel", key: "sentinel" as const, icon: Shield },
    { label: "Build Pipeline", key: "pipeline" as const, icon: Zap },
    { label: "Rebel's Vault", key: "vault" as const, icon: Package },
    { label: "Settings", key: "settings" as const, icon: Settings },
  ];

  return (
    <div className="flex flex-col overflow-hidden select-none relative" style={{ background: T.bg, fontFamily: T.sans, color: T.textPrimary, zoom: 1.35, width: 'calc(100vw / 1.35)', height: 'calc(100vh / 1.35)' }}>

      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between px-4 h-9 flex-shrink-0" style={{ background: T.bgPanel, borderBottom: `1px solid ${T.border}` }}>
        {/* Left: Logo + Workspace Tabs */}
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.violet}, ${T.cyan})`, boxShadow: `0 0 8px rgba(139,92,246,0.3)` }}>
            <Sparkles size={10} color="#fff" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "-0.01em" }}>Crystal Forge Pro</span>
          <button
            onClick={() => window.location.href = "/"}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors hover:bg-white/5 flex-shrink-0"
            style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted, border: `1px solid ${T.borderSubtle}` }}
            title="Return to JPE Studio (Ctrl+Shift+F)"
          >
            ← JPE Studio
          </button>
          <div className="w-px h-3 ml-1" style={{ background: T.border }} />

          <div className="flex items-center gap-0.5 ml-1">
            {workspaceTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = workspace === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setWorkspace(tab.key)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all relative"
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? T.textPrimary : T.textTertiary,
                    background: isActive ? "rgba(139,92,246,0.1)" : "transparent",
                    border: isActive ? `1px solid rgba(139,92,246,0.2)` : "1px solid transparent",
                    boxShadow: isActive ? `0 0 10px rgba(139,92,246,0.08)` : "none",
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = T.textSecondary; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = T.textTertiary; e.currentTarget.style.background = "transparent"; } }}
                >
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-full" style={{ background: `linear-gradient(90deg, ${T.violet}, ${T.cyan})`, boxShadow: `0 0 6px ${T.violet}60` }} />
                  )}
                  <TabIcon size={10} color={isActive ? T.violet : T.textMuted} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Command bar trigger */}
        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2 px-3 py-1 rounded-md transition-all"
          style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.border}` }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.borderActive; e.currentTarget.style.boxShadow = `0 0 12px rgba(139,92,246,0.08)`; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
        >
          <Search size={10} color={T.textMuted} />
          <span style={{ fontSize: 10, color: T.textMuted }}>Search or command...</span>
          <kbd className="ml-4 px-1 py-0.5 rounded" style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}` }}>⌘K</kbd>
        </button>

        {/* Right: Time + Status + Telemetry */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.emerald, boxShadow: `0 0 6px ${T.emerald}80` }} />
            <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>CONNECTED</span>
          </div>
          <div className="w-px h-3" style={{ background: T.border }} />
          <div className="flex items-center gap-1.5">
            <Cpu size={9} color={T.textMuted} />
            <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>12ms</span>
          </div>
          <div className="w-px h-3" style={{ background: T.border }} />
          <div className="flex items-center gap-1.5">
            <GitBranch size={9} color={T.textTertiary} />
            <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>main</span>
          </div>
          <div className="w-px h-3" style={{ background: T.border }} />
          <span style={{ fontSize: 13, fontFamily: T.mono, fontWeight: 700, color: T.textPrimary, letterSpacing: "0.02em" }}>{time}</span>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex flex-1 min-h-0">
        {workspace === "bible" ? (
          <MasterBibleView />
        ) : workspace === "atlas" ? (
          <ModAtlasView />
        ) : workspace === "sentinel" ? (
          <ModSentinelView />
        ) : workspace === "pipeline" ? (
          <BuildPipelineView />
        ) : workspace === "vault" ? (
          <RebelsVaultView />
        ) : workspace === "settings" ? (
          <SettingsCalibrationView />
        ) : (
          <>
            {/* LEFT SIDEBAR — Asset Browser */}
            <div className="flex flex-col flex-shrink-0" style={{ width: 260, borderRight: `1px solid ${T.border}`, background: T.bgPanel }}>
              <AssetBrowser />
            </div>

            {/* CENTER — Telemetry Rings + Widgets + Velocity */}
            <div className="flex-1 flex flex-col min-w-0" style={{ background: T.bg }}>
              {/* Metric Widgets Row */}
              <div className="grid grid-cols-4 gap-2 px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
                <MetricWidget label="ACTIVE STRINGS" value="4,218" sub="12 packages · 8 locales" color={T.violet} icon={Layers} />
                <MetricWidget label="AI CONFIDENCE" value="94.2%" sub="GPT-4o · 128 ctx" color={T.emerald} icon={Sparkles} />
                <MetricWidget label="MOD STABILITY" value="98.1%" sub="6 mods · 0 critical" color={T.cyanBright} icon={Shield} />
                <MetricWidget label="LAST DEPLOY" value="2m ago" sub="Build 7804 · main" color={T.amber} icon={Rocket} />
              </div>

              {/* Rings area */}
              <div className="flex-1 flex items-center justify-center relative min-h-0 p-4">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse 60% 60% at center, rgba(139,92,246,0.06) 0%, rgba(6,182,212,0.03) 30%, transparent 70%)`,
                  }}
                />
                <TelemetryRings />
              </div>

              {/* Bottom: Velocity + Stats */}
              <div className="flex-shrink-0" style={{ height: 100, borderTop: `1px solid ${T.border}` }}>
                <div className="flex h-full">
                  <div className="flex-1" style={{ borderRight: `1px solid ${T.border}` }}>
                    <VelocitySparkline />
                  </div>
                  <div className="flex flex-col justify-center px-4 gap-1.5" style={{ width: 200 }}>
                    <span style={{ fontSize: 26, fontFamily: T.mono, fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.03em", lineHeight: 1 }}>84.3%</span>
                    <div className="flex items-center gap-1.5">
                      <Activity size={9} color={T.cyan} />
                      <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>records</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.violet }} />
                      <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>words per minute/sec</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL — Split Files + Logs */}
            <div className="flex flex-col flex-shrink-0" style={{ width: 340, borderLeft: `1px solid ${T.border}`, background: T.bgPanel }}>
              <RightPanel />
            </div>
          </>
        )}
      </div>

      {/* ═══ STATUS BAR ═══ */}
      <div
        className="flex items-center justify-between px-3 h-[22px] flex-shrink-0"
        style={{ background: T.bgPanel, borderTop: `1px solid ${T.border}`, fontSize: 8, fontFamily: T.mono }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.emerald, boxShadow: `0 0 4px ${T.emerald}` }} />
            <span style={{ color: T.textTertiary }}>SYNCED</span>
          </div>
          <span style={{ color: T.textMuted }}>│</span>
          <span style={{ color: T.textTertiary }}>4,218 strings</span>
          <span style={{ color: T.textMuted }}>│</span>
          <span style={{ color: T.textTertiary }}>12 packages</span>
          <span style={{ color: T.textMuted }}>│</span>
          <span style={{ color: T.textTertiary }}>8 locales</span>
          <span style={{ color: T.textMuted }}>│</span>
          <span style={{ color: T.textTertiary }}>Heap: 128M</span>
          <span style={{ color: T.textMuted }}>│</span>
          <span style={{ color: T.textTertiary }}>Latency: 12ms</span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ color: T.textTertiary }}>ja_JP</span>
          <span style={{ color: T.textMuted }}>│</span>
          <span style={{ color: T.textTertiary }}>UTF-8</span>
          <span style={{ color: T.textMuted }}>│</span>
          <div className="flex items-center gap-1">
            <AlertTriangle size={7} color={T.amber} />
            <span style={{ color: T.amber }}>3</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle size={7} color={T.rose} />
            <span style={{ color: T.rose }}>1</span>
          </div>
          <span style={{ color: T.textMuted }}>│</span>
          <span style={{ color: T.textTertiary }}>Crystal Forge v3.2.0</span>
          <span style={{ color: T.textMuted }}>│</span>
          <span style={{ color: T.textTertiary }}>CF-6716</span>
        </div>
      </div>

      {/* ═══ METRICS BAR ═══ */}
      <MetricsBar />

      {/* ═══ COMMAND BAR ═══ */}
      <CommandBar isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}

export default CrystalForgePage;