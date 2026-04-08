import { useState, useEffect } from "react";
import {
  Sparkles, Wrench, Zap, Settings, Languages, Shield,
  Rocket, Network, GitMerge, Library, Puzzle, Bug,
  BarChart3, Package, Code2, LayoutGrid, BookOpen,
  CheckCircle2, AlertTriangle, XCircle, RotateCcw,
  Copy, Download, Play, Pause, StepForward, Database,
  Clock, GitBranch, HardDrive, Activity, Eye, EyeOff,
  TrendingUp, Globe, FileCode, Cpu, ArrowRight,
  Circle, RefreshCw, Terminal, Brain, Layers, Key,
  Star, Heart, Info, MessageSquare, ChevronRight,
  MemoryStick, Search, Plus, ExternalLink,
} from "lucide-react";
import { T } from "../pages/jpe-theme";
import type { WorkspaceMode } from "../pages/jpe-theme";
import { Eyebrow, GlowDot, Badge, PanelHeader, IconBtn } from "../pages/jpe-shared";
import { motion, AnimatePresence, easing } from "./jpe-motion";
import { JpeButton } from "./jpe-design-system";
import { toast } from "sonner";

/* ── shared micro-components ─────────────────────────────────── */
function PropRow({
  label,
  value,
  valueColor = T.textSecondary,
  mono = true,
}: {
  label: string;
  value: string;
  valueColor?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-1" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.09em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{ fontSize: 11, fontFamily: mono ? T.mono : T.sans, color: valueColor, fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

function SectionHeader({ title, icon: Icon, color }: { title: string; icon: typeof Sparkles; color: string }) {
  return (
    <PanelHeader title={title} icon={Icon} iconColor={color} />
  );
}

function MiniProgress({ pct, color, label }: { pct: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex-shrink-0" style={{ fontSize: 10, color: T.textTertiary, width: 52, textAlign: "right" as const }}>{label}</span>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: "rgba(255,255,255,0.04)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)`, boxShadow: `0 0 4px ${color}40` }} />
      </div>
      <span style={{ fontSize: 9, fontFamily: T.mono, color, width: 32 }}>{pct}%</span>
    </div>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="flex-1 rounded-xl px-2 py-1.5 text-center" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
      <div style={{ fontSize: 16, fontWeight: 800, fontFamily: T.mono, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 8, fontFamily: T.mono, color: `${color}80`, marginTop: 1 }}>{sub}</div>}
      <div style={{ fontSize: 9, color: T.textTertiary, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function InspectorFooter({ label = "Inspector v4.2", live = true }: { label?: string; live?: boolean }) {
  return (
    <div className="px-3 py-1.5 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{label}</span>
      {live && (
        <div className="flex items-center gap-1.5">
          <GlowDot color={T.emerald} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.emerald }}>LIVE</span>
        </div>
      )}
    </div>
  );
}

function QuickActions({ actions }: { actions: { icon: typeof Sparkles; label: string; onClick: () => void; variant?: "ghost" | "primary" | "success" | "danger" }[] }) {
  return (
    <div style={{ borderTop: `1px solid ${T.border}` }}>
      <SectionHeader title="QUICK ACTIONS" icon={Zap} color={T.amber} />
      <div className="px-3 py-2 space-y-1.5">
        {actions.map((a, i) => (
          <JpeButton key={i} variant={a.variant ?? "ghost"} size="sm" icon={a.icon} className="w-full justify-start" onClick={a.onClick}>
            {a.label}
          </JpeButton>
        ))}
      </div>
    </div>
  );
}

/* ── Animated ring ──────────────────────────────────────────── */
function RingProgress({ pct, color, size = 64, label, sub }: { pct: number; color: string; size?: number; label: string; sub?: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={5} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}60)`, transition: "stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: size > 56 ? 13 : 10, fontWeight: 800, fontFamily: T.mono, color }}>{pct}%</span>
        </div>
      </div>
      <span style={{ fontSize: 9, color: T.textTertiary, textAlign: "center" as const }}>{label}</span>
      {sub && <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>{sub}</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   1. DASHBOARD INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function DashboardInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="PROJECT OVERVIEW" icon={LayoutGrid} color={T.textSecondary} />

      {/* Health ring + stats */}
      <div className="px-3 py-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <RingProgress pct={87} color={T.emerald} size={72} label="Health" sub="Project score" />
        <div className="flex-1 space-y-1">
          <PropRow label="Files" value="14 total" valueColor={T.cyan} />
          <PropRow label="Modified" value="3" valueColor={T.amber} />
          <PropRow label="Warnings" value="2" valueColor={T.amber} />
          <PropRow label="Errors" value="0" valueColor={T.emerald} />
        </div>
      </div>

      {/* Build info */}
      <SectionHeader title="LAST BUILD" icon={Rocket} color={T.amber} />
      <div className="px-3 py-2 space-y-0.5" style={{ borderBottom: `1px solid ${T.border}` }}>
        <PropRow label="Build #" value="#4218" valueColor={T.violet} />
        <PropRow label="Status" value="Success" valueColor={T.emerald} />
        <PropRow label="Duration" value="12.4s" />
        <PropRow label="SDK" value="1.108.329" />
        <PropRow label="Branch" value="main" valueColor={T.cyan} />
      </div>

      {/* Translation coverage */}
      <SectionHeader title="TRANSLATION" icon={Languages} color={T.violet} />
      <div className="px-3 py-2 space-y-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <MiniProgress pct={100} color={T.emerald} label="en_US" />
        <MiniProgress pct={87} color={T.cyan} label="ja_JP" />
        <MiniProgress pct={92} color={T.violet} label="de_DE" />
        <MiniProgress pct={78} color={T.amber} label="fr_FR" />
      </div>

      <div className="flex-1" />
      <QuickActions actions={[
        { icon: Code2, label: "Open Editor", onClick: () => onNavigate("code") },
        { icon: Languages, label: "Translate Files", onClick: () => onNavigate("translation") },
        { icon: Rocket, label: "Build Package", onClick: () => onNavigate("build") },
        { icon: Shield, label: "Scan Conflicts", onClick: () => onNavigate("conflicts") },
      ]} />
      <InspectorFooter label="Dashboard v4.2" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   2. CODE INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function CodeInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  const [aiAccepted, setAiAccepted] = useState(false);
  const [aiRegenerating, setAiRegenerating] = useState(false);
  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      {/* AI suggestion */}
      <SectionHeader title="AI ASSISTANT" icon={Sparkles} color={T.violet} />
      <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="rounded-xl p-3" style={{ background: T.violetDim, border: `1px solid ${T.borderViolet}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={12} color={T.violet} />
            <span style={{ fontSize: 11, fontWeight: 700, color: T.violetBright }}>JPE Translation Suggestion</span>
          </div>
          <div className="space-y-2">
            <div>
              <span style={{ fontSize: 9, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Source XML:</span>
              <div className="mt-1 px-2 py-1.5 rounded-md" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textSecondary }}>trait_description: 0x1F2E3D4C</span>
              </div>
            </div>
            <div>
              <span style={{ fontSize: 9, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>JPE Output:</span>
              <div className="mt-1 px-2 py-1.5 rounded-md" style={{ background: "rgba(72,187,120,0.04)", border: "1px solid rgba(72,187,120,0.1)" }}>
                <span style={{ fontSize: 11, color: T.emerald, lineHeight: 1.5 }}>"Description text for Sim personality trait: Sims enjoy being mean and causing mayhem to others."</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge color={T.emerald} bg={T.emeraldDim}>95% confidence</Badge>
              <Badge color={T.textTertiary} bg="rgba(255,255,255,0.03)">GPT-4o</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <JpeButton variant={aiAccepted ? "ghost" : "success"} size="sm" icon={CheckCircle2} className="flex-1"
            onClick={() => { setAiAccepted(true); toast.success("Translation applied"); setTimeout(() => setAiAccepted(false), 2000); }}
            disabled={aiAccepted}>
            {aiAccepted ? "Applied ✓" : "Accept"}
          </JpeButton>
          <JpeButton variant="secondary" size="sm" icon={RotateCcw} className="flex-1"
            onClick={() => { setAiRegenerating(true); setTimeout(() => setAiRegenerating(false), 1500); toast.success("Suggestion regenerated"); }}
            loading={aiRegenerating} disabled={aiRegenerating}>
            {aiRegenerating ? "Generating..." : "Regen"}
          </JpeButton>
        </div>
      </div>

      {/* Properties */}
      <SectionHeader title="FILE PROPERTIES" icon={Wrench} color={T.cyan} />
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <PropRow label="Instance ID" value="0x034AEECB" valueColor={T.cyan} />
        <PropRow label="Type" value="trait" valueColor={T.violet} />
        <PropRow label="Group" value="0x00000000" />
        <PropRow label="Hash" value="a3f8e1d9" />
        <PropRow label="File Size" value="18.2 KB" />
        <PropRow label="Strings" value="8 entries" valueColor={T.emerald} />
        <PropRow label="Modified" value="2m ago" valueColor={T.amber} />
        <PropRow label="Encoding" value="UTF-8" />
      </div>

      <QuickActions actions={[
        { icon: Languages, label: "Convert to JPE", onClick: () => onNavigate("translation") },
        { icon: Shield, label: "Run Conflict Scan", onClick: () => onNavigate("conflicts") },
        { icon: Rocket, label: "Quick Build", onClick: () => onNavigate("build") },
        { icon: Copy, label: "Export Package", onClick: () => { navigator.clipboard.writeText("Evil_Trait_Override.package"); toast.success("Path copied"); } },
      ]} />
      <InspectorFooter />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   3. TRANSLATION INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function TranslationInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="ACTIVE STRING" icon={Languages} color={T.violet} />
      <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="rounded-xl p-3 space-y-2" style={{ background: T.violetDim, border: `1px solid ${T.borderViolet}` }}>
          <div className="flex items-center justify-between">
            <Badge color={T.violet} bg="rgba(139,92,246,0.12)">STR-001</Badge>
            <Badge color={T.emerald} bg={T.emeraldDim}>98% conf.</Badge>
          </div>
          <div>
            <span style={{ fontSize: 9, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Key</span>
            <div className="mt-1 px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
              <span style={{ fontSize: 11, fontFamily: T.mono, color: T.cyan }}>0x0A3B4C5D</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: 9, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Source</span>
            <div className="mt-1 px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
              <span style={{ fontSize: 11, color: T.textSecondary }}>"Evil"</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: 9, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>JPE</span>
            <div className="mt-1 px-2 py-1 rounded" style={{ background: "rgba(72,187,120,0.04)", border: "1px solid rgba(72,187,120,0.1)" }}>
              <span style={{ fontSize: 10, color: T.emerald, lineHeight: 1.5 }}>Trait name for a Sim personality that enjoys causing misery to others</span>
            </div>
          </div>
        </div>
      </div>

      {/* Locale coverage */}
      <SectionHeader title="LOCALE COVERAGE" icon={Globe} color={T.cyan} />
      <div className="px-3 py-3 space-y-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <MiniProgress pct={100} color={T.emerald} label="en_US" />
        <MiniProgress pct={87} color={T.cyan} label="ja_JP" />
        <MiniProgress pct={92} color={T.violet} label="de_DE" />
        <MiniProgress pct={78} color={T.amber} label="fr_FR" />
        <MiniProgress pct={65} color={T.rose} label="ko_KR" />
        <MiniProgress pct={71} color={T.amber} label="zh_CN" />
      </div>

      {/* Stats */}
      <SectionHeader title="STRING STATS" icon={Activity} color={T.textSecondary} />
      <div className="px-3 py-2 space-y-0.5 flex-1">
        <PropRow label="Total Strings" value="8 / 8" valueColor={T.emerald} />
        <PropRow label="Ready" value="5" valueColor={T.emerald} />
        <PropRow label="Draft" value="2" valueColor={T.amber} />
        <PropRow label="Review" value="1" valueColor={T.cyan} />
        <PropRow label="Warning" value="1" valueColor={T.rose} />
      </div>

      <QuickActions actions={[
        { icon: Sparkles, label: "Batch Translate", onClick: () => toast.success("Batch translation started — 8 strings queued") },
        { icon: Download, label: "Export STBL", onClick: () => toast.success("STBL file exported (8 entries)") },
        { icon: Database, label: "Import CSV", onClick: () => toast.info("CSV import dialog") },
        { icon: Globe, label: "Multi-Locale View", onClick: () => toast.info("Opening locale comparison panel…") },
      ]} />
      <InspectorFooter label="Translation v4.2" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   4. JPE LANGUAGE INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function JpeInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  const [activeKw, setActiveKw] = useState("interaction");
  const keywords = [
    { kw: "interaction", cat: "declaration", sig: "interaction: <name>", desc: "Declares a new Sim interaction with optional parameters" },
    { kw: "trait", cat: "declaration", sig: "trait: <name>", desc: "Declares a personality trait tuning block" },
    { kw: "buff", cat: "effect", sig: "buff: <id>", desc: "References a buff resource to apply or remove" },
  ];
  const active = keywords.find(k => k.kw === activeKw) || keywords[0];
  const catColor = { declaration: T.cyan, modifier: T.amber, effect: T.violet, logic: T.emerald }[active.cat] || T.textSecondary;

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="ACTIVE KEYWORD" icon={BookOpen} color={T.violetBright} />
      <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        {/* Keyword pills */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {keywords.map(k => (
            <button key={k.kw} onClick={() => setActiveKw(k.kw)}
              className="px-2 py-0.5 rounded-md transition-all"
              style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, background: activeKw === k.kw ? `${T.violet}18` : "rgba(255,255,255,0.02)", border: `1px solid ${activeKw === k.kw ? `${T.violet}40` : T.borderSubtle}`, color: activeKw === k.kw ? T.violetBright : T.textMuted }}>
              {k.kw}
            </button>
          ))}
        </div>
        <div className="rounded-xl p-3" style={{ background: "rgba(139,92,246,0.05)", border: `1px solid ${T.borderViolet}` }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span style={{ fontSize: 14, fontWeight: 800, fontFamily: T.mono, color: T.violetBright }}>{active.kw}</span>
            <Badge color={catColor} bg={`${catColor}12`}>{active.cat}</Badge>
          </div>
          <div className="mb-2 px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
            <span style={{ fontSize: 11, fontFamily: T.mono, color: T.cyan }}>{active.sig}</span>
          </div>
          <p style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.5 }}>{active.desc}</p>
        </div>
      </div>

      {/* Validation summary */}
      <SectionHeader title="VALIDATION" icon={Shield} color={T.emerald} />
      <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex gap-2">
          <StatCard label="Valid" value="42" color={T.emerald} />
          <StatCard label="Warn" value="2" color={T.amber} />
          <StatCard label="Error" value="1" color={T.rose} />
        </div>
        <div className="mt-2 space-y-0.5">
          <PropRow label="Last validated" value="Just now" valueColor={T.cyan} />
          <PropRow label="Schema" value="JPE v3.0" valueColor={T.violet} />
        </div>
      </div>

      <div className="flex-1" />
      <QuickActions actions={[
        { icon: FileCode, label: "Preview XML", onClick: () => toast.success("XML preview panel opened") },
        { icon: Shield, label: "Run Validator", onClick: () => toast.success("Schema validation passed — 42 valid, 2 warnings") },
        { icon: BookOpen, label: "Open Docs", onClick: () => onNavigate("jpe") },
        { icon: Copy, label: "Copy Signature", onClick: () => { navigator.clipboard.writeText(active.sig); toast.success("Signature copied"); } },
      ]} />
      <InspectorFooter label="JPE Inspector v4.2" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   5. DEPENDENCY GRAPH INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function GraphInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  const [filter, setFilter] = useState({ conflicts: true, optionals: true });
  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="NODE INSPECTOR" icon={Network} color={T.emerald} />
      <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="rounded-xl p-3" style={{ background: "rgba(16,185,129,0.06)", border: `1px solid rgba(16,185,129,0.18)` }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ background: T.emerald, boxShadow: `0 0 6px ${T.emerald}60` }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Evil Trait Override</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <StatCard label="Deps" value="3" color={T.cyan} />
            <StatCard label="Optionals" value="2" color={T.violet} />
            <StatCard label="Conflicts" value="1" color={T.rose} />
          </div>
          <div className="mt-2 space-y-0.5">
            <PropRow label="Version" value="2.1.0" valueColor={T.cyan} />
            <PropRow label="Status" value="OK" valueColor={T.emerald} />
            <PropRow label="Author" value="JPE_Dev" mono={false} />
          </div>
        </div>
      </div>

      {/* Graph controls */}
      <SectionHeader title="GRAPH CONTROLS" icon={Layers} color={T.cyan} />
      <div className="px-3 py-3 space-y-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
        {[
          { label: "Show Conflicts", key: "conflicts" as const, color: T.rose },
          { label: "Show Optionals", key: "optionals" as const, color: T.violet },
        ].map(f => (
          <div key={f.key} className="flex items-center justify-between">
            <span style={{ fontSize: 11, color: T.textSecondary }}>{f.label}</span>
            <button onClick={() => setFilter(p => ({ ...p, [f.key]: !p[f.key] }))}
              className="relative flex-shrink-0"
              style={{ width: 32, height: 18, borderRadius: 9, background: filter[f.key] ? f.color : "rgba(255,255,255,0.08)", transition: "background 0.2s" }}>
              <div className="absolute top-0.5 rounded-full transition-all" style={{ width: 14, height: 14, left: filter[f.key] ? 15 : 2, background: "#fff", boxShadow: filter[f.key] ? `0 0 4px ${f.color}60` : "none" }} />
            </button>
          </div>
        ))}
        <div className="space-y-0.5">
          <PropRow label="Nodes" value="12" valueColor={T.emerald} />
          <PropRow label="Edges" value="18" valueColor={T.textSecondary} />
          <PropRow label="Clusters" value="3" valueColor={T.violet} />
        </div>
      </div>

      <div className="flex-1" />
      <QuickActions actions={[
        { icon: Download, label: "Export SVG", onClick: () => toast.success("Dependency graph exported as SVG") },
        { icon: RefreshCw, label: "Center Graph", onClick: () => toast.success("Graph centered and reset") },
        { icon: Shield, label: "View Conflicts", onClick: () => onNavigate("conflicts") },
      ]} />
      <InspectorFooter label="Graph Inspector v4.2" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   6. CONFLICTS INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function ConflictsInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  const total = 5;
  const resolved = 2;
  const pct = Math.round((resolved / total) * 100);
  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="RESOLUTION STATUS" icon={GitMerge} color={T.rose} />
      <div className="px-3 py-3 flex items-center gap-4" style={{ borderBottom: `1px solid ${T.border}` }}>
        <RingProgress pct={pct} color={pct === 100 ? T.emerald : T.rose} size={72} label="Resolved" sub={`${resolved}/${total}`} />
        <div className="flex-1 space-y-1">
          <PropRow label="Critical" value="1" valueColor={T.rose} />
          <PropRow label="Warning" value="2" valueColor={T.amber} />
          <PropRow label="Info" value="2" valueColor={T.cyan} />
          <PropRow label="Files" value="2" valueColor={T.textSecondary} />
        </div>
      </div>

      {/* Active conflict */}
      <SectionHeader title="ACTIVE CONFLICT" icon={AlertTriangle} color={T.amber} />
      <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="rounded-xl p-3" style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.15)" }}>
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle size={11} color={T.rose} />
            <span style={{ fontSize: 11, fontWeight: 700, color: T.rose }}>CONFLICT</span>
          </div>
          <PropRow label="File" value="trait_Evil.xml" valueColor={T.textSecondary} />
          <PropRow label="Type" value="trait_type" valueColor={T.amber} />
          <PropRow label="Line" value="L4" valueColor={T.violet} />
          <PropRow label="Status" value="Unresolved" valueColor={T.rose} />
        </div>
      </div>

      {/* Merge strategy */}
      <SectionHeader title="RESOLUTION" icon={ChevronRight} color={T.textSecondary} />
      <div className="px-3 py-2 flex-1 space-y-1.5">
        {[
          { label: "Keep Local (Yours)", color: T.cyan },
          { label: "Keep Remote (Theirs)", color: T.rose },
          { label: "Smart Merge", color: T.emerald },
          { label: "Disable Both", color: T.textMuted },
        ].map((s, i) => (
          <button key={i} onClick={() => toast.success(`Resolution applied: ${s.label}`)}
            className="w-full text-left px-3 py-1.5 rounded-lg transition-colors"
            style={{ fontSize: 11, color: s.color, background: `${s.color}06`, border: `1px solid ${s.color}18` }}
            onMouseEnter={e => { e.currentTarget.style.background = `${s.color}12`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${s.color}06`; }}>
            {s.label}
          </button>
        ))}
      </div>

      <QuickActions actions={[
        { icon: CheckCircle2, label: "Accept All Left", onClick: () => toast.success("All conflicts resolved (Keep Left)") },
        { icon: Download, label: "Export Patch", onClick: () => toast.success("Conflict patch exported") },
      ]} />
      <InspectorFooter label="Conflict Inspector v4.2" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   7. BUILD INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function BuildInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="BUILD CONFIG" icon={Rocket} color={T.amber} />
      <div className="px-3 py-2 space-y-0.5" style={{ borderBottom: `1px solid ${T.border}` }}>
        <PropRow label="Target" value="EvilTrait.package" valueColor={T.amber} />
        <PropRow label="Environment" value="Production" valueColor={T.emerald} />
        <PropRow label="Optimization" value="Level 2" valueColor={T.violet} />
        <PropRow label="Platform" value="TS4 1.108" valueColor={T.cyan} />
        <PropRow label="Compression" value="zlib" />
        <PropRow label="Debug Symbols" value="Off" valueColor={T.textMuted} />
      </div>

      {/* Stage timings */}
      <SectionHeader title="STAGE TIMINGS" icon={Clock} color={T.violet} />
      <div className="px-3 py-2 space-y-0.5" style={{ borderBottom: `1px solid ${T.border}` }}>
        {[
          { name: "Validate", time: "0.8s", color: T.emerald },
          { name: "Compile", time: "2.1s", color: T.cyan },
          { name: "Link", time: "0.4s", color: T.violet },
          { name: "Package", time: "1.2s", color: T.amber },
          { name: "Deploy", time: "0.3s", color: T.emerald },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
              <span style={{ fontSize: 11, color: T.textSecondary }}>{s.name}</span>
            </div>
            <span style={{ fontSize: 11, fontFamily: T.mono, color: s.color }}>{s.time}</span>
          </div>
        ))}
      </div>

      {/* Artifacts */}
      <SectionHeader title="ARTIFACTS" icon={Package} color={T.emerald} />
      <div className="px-3 py-2 flex-1 space-y-1.5">
        {[
          { name: "EvilTraitOverride.package", size: "2.4 MB", color: T.rose },
          { name: "EvilTraitOverride_strings.package", size: "856 KB", color: T.rose },
        ].map((a, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}>
            <Package size={11} color={T.emerald} />
            <span className="flex-1 truncate" style={{ fontSize: 10, color: T.textSecondary }}>{a.name}</span>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.emerald }}>{a.size}</span>
          </div>
        ))}
      </div>

      <QuickActions actions={[
        { icon: Play, label: "Run Build", onClick: () => onNavigate("build"), variant: "success" },
        { icon: Download, label: "Export All Artifacts", onClick: () => toast.success("Artifacts exported to /build") },
        { icon: Terminal, label: "View Build Logs", onClick: () => toast.info("Opening build log console…") },
      ]} />
      <InspectorFooter label="Build Inspector v4.2" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   8. LIBRARY INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function LibraryInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="LIBRARY STATS" icon={Library} color={T.cyanBright} />
      <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <StatCard label="Installed" value="9" color={T.emerald} />
          <StatCard label="Updates" value="3" color={T.amber} />
          <StatCard label="Outdated" value="1" color={T.rose} />
          <StatCard label="Conflicts" value="4" color={T.rose} />
        </div>
        <div className="space-y-0.5 mt-2">
          <PropRow label="Enabled Mods" value="8 / 9" valueColor={T.emerald} />
          <PropRow label="Total Size" value="138.3 MB" valueColor={T.textSecondary} />
          <PropRow label="Sources" value="4 active" valueColor={T.cyan} />
          <PropRow label="Last Sync" value="2h ago" valueColor={T.textMuted} />
        </div>
      </div>

      {/* Category breakdown */}
      <SectionHeader title="BY CATEGORY" icon={Layers} color={T.violet} />
      <div className="px-3 py-2 space-y-1.5 flex-1" style={{ borderBottom: `1px solid ${T.border}` }}>
        {[
          { cat: "Traits", count: 2, color: T.cyan },
          { cat: "Objects", count: 2, color: T.violet },
          { cat: "Careers", count: 1, color: T.amber },
          { cat: "Graphics", count: 2, color: T.emerald },
          { cat: "Gameplay", count: 1, color: T.rose },
          { cat: "Utilities", count: 1, color: T.textSecondary },
        ].map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
            <span style={{ fontSize: 11, color: T.textSecondary, flex: 1 }}>{c.cat}</span>
            <span style={{ fontSize: 10, fontFamily: T.mono, color: c.color }}>{c.count}</span>
          </div>
        ))}
      </div>

      <QuickActions actions={[
        { icon: Download, label: "Update All (3)", onClick: () => toast.success("Updating 3 mods…") },
        { icon: Database, label: "Export Manifest", onClick: () => toast.success("Library manifest exported") },
        { icon: Network, label: "Open in Graph", onClick: () => onNavigate("depgraph") },
      ]} />
      <InspectorFooter label="Library Inspector v4.2" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   9. PLUGIN INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function PluginInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="PLUGIN REGISTRY" icon={Puzzle} color={T.cyanDeep} />
      <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <StatCard label="Installed" value="6" color={T.emerald} />
          <StatCard label="Verified" value="8" color={T.cyan} />
          <StatCard label="Updates" value="0" color={T.textMuted} sub="up to date" />
          <StatCard label="Total" value="12" color={T.violet} />
        </div>
        <div className="space-y-0.5 mt-2">
          <PropRow label="Registry Ver." value="v2.1" valueColor={T.violet} />
          <PropRow label="Last Check" value="12m ago" valueColor={T.textMuted} />
          <PropRow label="Auto-Update" value="Off" valueColor={T.textMuted} />
        </div>
      </div>

      {/* Featured plugin */}
      <SectionHeader title="FEATURED" icon={Star} color={T.amber} />
      <div className="px-3 py-3 flex-1" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="rounded-xl p-3" style={{ background: T.violetDim, border: `1px solid ${T.borderViolet}` }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} color={T.violet} />
            <span style={{ fontSize: 12, fontWeight: 700, color: T.violetBright }}>JPE Auto-Translate</span>
            <Badge color={T.emerald} bg={T.emeraldDim}>Verified</Badge>
          </div>
          <p style={{ fontSize: 10, color: T.textSecondary, lineHeight: 1.5 }}>AI-powered tuning XML to JPE translation with GPT-4o backend.</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={9} color={i < 5 ? T.amber : T.textDim} fill={i < 5 ? T.amber : "none"} />
              ))}
            </div>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>4.9 (1,247 reviews)</span>
          </div>
        </div>
      </div>

      <QuickActions actions={[
        { icon: RefreshCw, label: "Check Updates", onClick: () => toast.success("All plugins are up to date") },
        { icon: Settings, label: "Plugin Settings", onClick: () => onNavigate("settings") },
        { icon: ExternalLink, label: "Open Marketplace", onClick: () => onNavigate("plugin") },
      ]} />
      <InspectorFooter label="Plugin Inspector v4.2" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   10. VAULT INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function VaultInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  const [lastScan, setLastScan] = useState("4m ago");
  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="VAULT STATUS" icon={Package} color={T.violet} />
      <div className="px-3 py-3 flex items-center gap-4" style={{ borderBottom: `1px solid ${T.border}` }}>
        <RingProgress pct={99} color={T.emerald} size={72} label="Uptime" sub="99% / 30d" />
        <div className="flex-1 space-y-1">
          <PropRow label="Active Nodes" value="12" valueColor={T.emerald} />
          <PropRow label="Warnings" value="2" valueColor={T.amber} />
          <PropRow label="Critical" value="0" valueColor={T.emerald} />
          <PropRow label="Last Scan" value={lastScan} valueColor={T.textMuted} />
        </div>
      </div>

      {/* Top warning nodes */}
      <SectionHeader title="FLAGGED NODES" icon={AlertTriangle} color={T.amber} />
      <div className="px-3 py-2 space-y-1.5 flex-1" style={{ borderBottom: `1px solid ${T.border}` }}>
        {[
          { name: "WickedWhims Interface", score: 72, color: T.rose },
          { name: "MCCC Overrides", score: 45, color: T.amber },
        ].map((n, i) => (
          <div key={i} className="rounded-lg px-3 py-2" style={{ background: `${n.color}06`, border: `1px solid ${n.color}15` }}>
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary }}>{n.name}</span>
              <Badge color={n.color} bg={`${n.color}12`}>{n.score} risk</Badge>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.04)" }}>
              <div style={{ width: `${n.score}%`, height: "100%", background: `linear-gradient(90deg, ${n.color}, ${n.color}88)` }} />
            </div>
          </div>
        ))}
        <div className="space-y-0.5 mt-2">
          <PropRow label="Scan Mode" value="Deep Scan" valueColor={T.violet} />
          <PropRow label="Auto-Scan" value="Every 15m" valueColor={T.textMuted} />
        </div>
      </div>

      <QuickActions actions={[
        { icon: RefreshCw, label: "Scan All Nodes", onClick: () => { toast.success("Full vault scan started…"); setLastScan("Just now"); } },
        { icon: Download, label: "Export Report", onClick: () => toast.success("Vault diagnostic report exported") },
        { icon: Network, label: "View Vault Graph", onClick: () => onNavigate("depgraph") },
      ]} />
      <InspectorFooter label="Vault Inspector v4.2" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   11. DEBUG INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function DebugInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  const [watches, setWatches] = useState([
    { expr: "trait.type", value: '"personality"', color: T.violet },
    { expr: "buff_enabled", value: "true", color: T.emerald },
    { expr: "conflicts_with.length", value: "2", color: T.cyan },
  ]);

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="DEBUG SESSION" icon={Bug} color={T.rose} />
      <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <StatCard label="Breakpoints" value="3" color={T.rose} />
          <StatCard label="Stack Depth" value="4" color={T.amber} />
        </div>
        <div className="space-y-0.5">
          <PropRow label="Status" value="Paused" valueColor={T.amber} />
          <PropRow label="Thread" value="Main" valueColor={T.cyan} />
          <PropRow label="File" value="trait_Evil.xml" />
          <PropRow label="Line" value="Ln 12, Col 3" valueColor={T.violet} />
        </div>
      </div>

      {/* Call stack */}
      <SectionHeader title="CALL STACK" icon={Layers} color={T.amber} />
      <div className="px-3 py-2 space-y-1" style={{ borderBottom: `1px solid ${T.border}` }}>
        {[
          { frame: "trait_type_resolver", file: "trait_Evil.xml:12", active: true },
          { frame: "tuning_loader", file: "jpe_translator.ts4script:84", active: false },
          { frame: "mod_injector", file: "mod_injector.ts4script:22", active: false },
          { frame: "<main>", file: "boot.ts4script:1", active: false },
        ].map((f, i) => (
          <div key={i} className="flex items-start gap-2 py-0.5">
            <div className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: f.active ? T.rose : T.textDim, boxShadow: f.active ? `0 0 4px ${T.rose}60` : "none" }} />
            <div>
              <div style={{ fontSize: 10, fontFamily: T.mono, color: f.active ? T.textPrimary : T.textSecondary, fontWeight: f.active ? 700 : 400 }}>{f.frame}</div>
              <div style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{f.file}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Variable watch */}
      <SectionHeader title="VARIABLE WATCH" icon={Eye} color={T.cyan} />
      <div className="flex-1 px-3 py-2 space-y-0.5">
        {watches.map((w, i) => (
          <div key={i} className="flex items-center gap-2 py-1 rounded hover:bg-white/5 px-1" style={{ cursor: "pointer" }}>
            <code style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary, flex: 1 }}>{w.expr}</code>
            <code style={{ fontSize: 10, fontFamily: T.mono, color: w.color }}>{w.value}</code>
          </div>
        ))}
        <button onClick={() => toast.info("Add watch expression")}
          className="flex items-center gap-2 px-1 py-1 w-full rounded mt-1 transition-colors hover:bg-white/5"
          style={{ fontSize: 10, color: T.textDim }}>
          <Plus size={10} color={T.textDim} />
          Add watch…
        </button>
      </div>

      <QuickActions actions={[
        { icon: Play, label: "Resume (F5)", onClick: () => toast.success("Execution resumed"), variant: "success" },
        { icon: StepForward, label: "Step Over (F10)", onClick: () => toast.success("Stepped to next line") },
        { icon: XCircle, label: "Clear Breakpoints", onClick: () => toast.success("All 3 breakpoints cleared") },
      ]} />
      <InspectorFooter label="Debug Inspector v4.2" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   12. ANALYSIS INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function AnalysisInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  const [chartType, setChartType] = useState<"area" | "bar" | "line">("area");
  const [range, setRange] = useState<"30" | "60" | "90">("30");
  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="CHART CONTROLS" icon={BarChart3} color={T.emerald} />
      <div className="px-3 py-3 space-y-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        {/* Chart type */}
        <div>
          <span style={{ fontSize: 9, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Chart Type</span>
          <div className="flex gap-1.5 mt-1.5">
            {(["area", "bar", "line"] as const).map(t => (
              <button key={t} onClick={() => setChartType(t)}
                className="flex-1 py-1 rounded-md capitalize transition-colors"
                style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, background: chartType === t ? `${T.emerald}18` : "rgba(255,255,255,0.02)", border: `1px solid ${chartType === t ? `${T.emerald}40` : T.borderSubtle}`, color: chartType === t ? T.emerald : T.textMuted }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        {/* Sample range */}
        <div>
          <span style={{ fontSize: 9, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Sample Range</span>
          <div className="flex gap-1.5 mt-1.5">
            {(["30", "60", "90"] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className="flex-1 py-1 rounded-md transition-colors"
                style={{ fontSize: 10, fontFamily: T.mono, background: range === r ? `${T.cyan}18` : "rgba(255,255,255,0.02)", border: `1px solid ${range === r ? `${T.cyan}40` : T.borderSubtle}`, color: range === r ? T.cyan : T.textMuted }}>
                {r}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live metrics */}
      <SectionHeader title="LIVE METRICS" icon={Activity} color={T.cyan} />
      <div className="px-3 py-2 space-y-0.5 flex-1" style={{ borderBottom: `1px solid ${T.border}` }}>
        <PropRow label="CPU Avg" value="47%" valueColor={T.cyan} />
        <PropRow label="Mem Peak" value="62%" valueColor={T.violet} />
        <PropRow label="GC Time" value="8ms avg" valueColor={T.textSecondary} />
        <PropRow label="Heap" value="412 MB" valueColor={T.amber} />
        <PropRow label="Threads" value="4 / 8" valueColor={T.emerald} />
        <PropRow label="Net Latency" value="4ms" valueColor={T.emerald} />
        <div className="mt-3 space-y-1.5">
          <MiniProgress pct={47} color={T.cyan} label="CPU" />
          <MiniProgress pct={62} color={T.violet} label="Memory" />
        </div>
      </div>

      <QuickActions actions={[
        { icon: Download, label: "Export PNG", onClick: () => toast.success("Chart exported as PNG") },
        { icon: Database, label: "Export CSV", onClick: () => toast.success("Data exported as CSV (30 samples)") },
        { icon: RefreshCw, label: "Refresh Data", onClick: () => toast.success("Metrics refreshed") },
      ]} />
      <InspectorFooter label="Analysis Inspector v4.2" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   13. AI INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function AiInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  const tokenPct = Math.round((1247 / 8000) * 100);
  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="AI SESSION" icon={Sparkles} color={T.violetBright} />
      <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <StatCard label="Messages" value="5" color={T.violet} />
          <StatCard label="Avg Conf." value="92%" color={T.emerald} />
        </div>
        <div className="space-y-0.5">
          <PropRow label="Model" value="GPT-4o" valueColor={T.violetBright} />
          <PropRow label="Endpoint" value="OpenAI API" valueColor={T.textSecondary} />
          <PropRow label="Response" value="1.2s avg" valueColor={T.cyan} />
          <PropRow label="Domain" value="Sims 4 Modding" valueColor={T.violet} />
        </div>
      </div>

      {/* Token usage */}
      <SectionHeader title="TOKEN USAGE" icon={Brain} color={T.cyan} />
      <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ fontSize: 10, color: T.textSecondary }}>Tokens used</span>
          <span style={{ fontSize: 11, fontFamily: T.mono, color: T.violet }}>1,247 / 8,000</span>
        </div>
        <div className="rounded-full overflow-hidden mb-2" style={{ height: 6, background: "rgba(255,255,255,0.04)" }}>
          <div style={{ width: `${tokenPct}%`, height: "100%", background: `linear-gradient(90deg, ${T.violet}, ${T.cyan})`, boxShadow: `0 0 8px ${T.violet}40` }} />
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{tokenPct}% of context window</span>
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.emerald }}>6,753 remaining</span>
        </div>
      </div>

      {/* Suggestions */}
      <SectionHeader title="CONTEXT" icon={MessageSquare} color={T.textSecondary} />
      <div className="px-3 py-2 flex-1 space-y-0.5">
        <PropRow label="Active File" value="trait_Evil.xml" />
        <PropRow label="Mode" value="Translation" valueColor={T.violet} />
        <PropRow label="Session" value="JPE-20260311" valueColor={T.textMuted} />
        <PropRow label="Temperature" value="0.3" valueColor={T.cyan} />
        <PropRow label="System Prompt" value="Domain fine-tuned" valueColor={T.emerald} />
      </div>

      <QuickActions actions={[
        { icon: Plus, label: "New Session", onClick: () => toast.success("New AI session started") },
        { icon: Download, label: "Export Chat", onClick: () => toast.success("Conversation exported as JSON") },
        { icon: Settings, label: "Model Settings", onClick: () => onNavigate("settings") },
      ]} />
      <InspectorFooter label="AI Inspector v4.2" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   14. SETTINGS INSPECTOR
   ══════════════════════════════════════════════════════════════ */
function SettingsInspector({ onNavigate }: { onNavigate: (m: WorkspaceMode) => void }) {
  const sections = [
    { id: "general", label: "General", color: T.textTertiary },
    { id: "editor", label: "Editor", color: T.cyan },
    { id: "theme", label: "Appearance & Wallpaper", color: T.cyanBright },
    { id: "translation", label: "Translation", color: T.violet },
    { id: "ai", label: "AI Engine", color: T.violetBright },
    { id: "build", label: "Build Pipeline", color: T.amber },
    { id: "keybindings", label: "Keybindings", color: T.amber },
    { id: "notifications", label: "Notifications", color: T.textSecondary },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <SectionHeader title="SECTION NAVIGATOR" icon={Settings} color={T.textTertiary} />
      <div className="flex-1 overflow-y-auto" style={{ borderBottom: `1px solid ${T.border}` }}>
        {sections.map((s, i) => (
          <button key={s.id} onClick={() => toast.info(`Navigating to ${s.label} settings…`)}
            className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left"
            onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span style={{ fontSize: 11, color: T.textSecondary, flex: 1 }}>{s.label}</span>
            <ChevronRight size={10} color={T.textDim} />
          </button>
        ))}
      </div>

      {/* Config status */}
      <SectionHeader title="CONFIG STATUS" icon={Info} color={T.textSecondary} />
      <div className="px-3 py-2 space-y-0.5">
        <PropRow label="Modified" value="3 settings" valueColor={T.amber} />
        <PropRow label="Profile" value="Default" valueColor={T.textSecondary} />
        <PropRow label="Last Saved" value="2m ago" valueColor={T.textMuted} />
        <PropRow label="Sync" value="Local only" valueColor={T.textMuted} />
      </div>

      <QuickActions actions={[
        { icon: Download, label: "Export Config", onClick: () => toast.success("Config exported to settings.json") },
        { icon: RotateCcw, label: "Reset Defaults", onClick: () => toast("Reset to defaults?", { description: "Click Confirm to reset all settings", action: { label: "Confirm", onClick: () => toast.success("Settings reset to defaults") } }) },
      ]} />
      <InspectorFooter label="Settings Inspector v4.2" live={false} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT EXPORT — mode-switches with animated transition
   ══════════════════════════════════════════════════════════════ */
export function InspectorPanel({ mode, onNavigate }: { mode: WorkspaceMode; onNavigate: (m: WorkspaceMode) => void }) {
  const renderContent = () => {
    switch (mode) {
      case "dashboard":   return <DashboardInspector key="dashboard" onNavigate={onNavigate} />;
      case "code":        return <CodeInspector key="code" onNavigate={onNavigate} />;
      case "translation": return <TranslationInspector key="translation" onNavigate={onNavigate} />;
      case "jpe":         return <JpeInspector key="jpe" onNavigate={onNavigate} />;
      case "depgraph":    return <GraphInspector key="depgraph" onNavigate={onNavigate} />;
      case "conflicts":   return <ConflictsInspector key="conflicts" onNavigate={onNavigate} />;
      case "build":       return <BuildInspector key="build" onNavigate={onNavigate} />;
      case "library":     return <LibraryInspector key="library" onNavigate={onNavigate} />;
      case "plugin":      return <PluginInspector key="plugin" onNavigate={onNavigate} />;
      case "vault":       return <VaultInspector key="vault" onNavigate={onNavigate} />;
      case "debug":       return <DebugInspector key="debug" onNavigate={onNavigate} />;
      case "datavis":     return <AnalysisInspector key="datavis" onNavigate={onNavigate} />;
      case "ai":          return <AiInspector key="ai" onNavigate={onNavigate} />;
      case "settings":    return <SettingsInspector key="settings" onNavigate={onNavigate} />;
      default:            return <CodeInspector key="default" onNavigate={onNavigate} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        className="h-full"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.18, ease: easing.outStandard }}
        style={{ height: "100%" }}
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
}
