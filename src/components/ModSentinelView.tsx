"use client";
import { useState, useMemo } from "react";
import {
  ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon,
  Info, ChevronDown, ChevronRight, X, Clock,
  FileCode, Lock, Eye, Copy, ExternalLink,
  CheckCircle2, MoreHorizontal, Sparkles,
  type LucideIcon} from "lucide-react";
import { useScaledPx } from "./jpe-settings-context";
import { toast } from "sonner";
import { useDiagnosticStore } from "../stores/useDiagnosticStore";
import { useProjectStore } from "../stores/useProjectStore";
import { T } from "@/components/robust/jpe-theme";

/* ═══ SEVERITY SYSTEM ═══ */
type Severity = "CRITICAL" | "ALERT" | "HINT";
const severityConfig: Record<Severity, { color: string; bg: string; borderColor: string; glowColor: string; priorityLabel: string; priorityColor: string }> = {
  CRITICAL: { color: T.rose, bg: "rgba(252,129,129,0.06)", borderColor: "rgba(252,129,129,0.15)", glowColor: "rgba(252,129,129,0.3)", priorityLabel: "High Priority", priorityColor: T.rose },
  ALERT: { color: T.amber, bg: "rgba(246,173,85,0.05)", borderColor: "rgba(246,173,85,0.12)", glowColor: "rgba(246,173,85,0.2)", priorityLabel: "Moderate", priorityColor: T.amber },
  HINT: { color: T.cyan, bg: "rgba(99,179,237,0.04)", borderColor: "rgba(99,179,237,0.1)", glowColor: "rgba(99,179,237,0.15)", priorityLabel: "Low", priorityColor: T.cyan }};

/* ═══ ERROR DATA ═══ */
interface DiagnosticError {
  id: string;
  name: string;
  severity: Severity;
  source: string;
  timestamp: string;
  kernel: string;
  status: "UNRESOLVED" | "RESOLVING" | "RESOLVED";
  file: string;
  line: number;
  description: string;
}

/* ═══ CODE FOR FOCUSED VIEW ═══ */
interface CodeLine { num: number; text: string; type: "normal" | "error" | "context" }
const focusedCode: CodeLine[] = [
  { num: 140, text: "void core_system(cpp_safe_preset) {", type: "normal" },
  { num: 141, text: "    int station = args();", type: "normal" },
  { num: 142, text: "", type: "normal" },
  { num: 143, text: "    Error at Line 142", type: "context" },
  { num: 144, text: "    memcpy(destination, memcpy, destination);", type: "error" },
  { num: 145, text: "    return 0;", type: "normal" },
  { num: 146, text: "", type: "normal" },
  { num: 147, text: "    return null;", type: "normal" },
  { num: 148, text: "}", type: "normal" },
];

interface DiffLine { num: number; text: string; type: "unchanged" | "removed" | "added" }
const diffLeft: DiffLine[] = [
  { num: 140, text: "void crack(crsset) {", type: "unchanged" },
  { num: 141, text: "", type: "unchanged" },
  { num: 142, text: "    int args = *strlen(f);", type: "unchanged" },
  { num: 143, text: "", type: "unchanged" },
  { num: 144, text: "", type: "unchanged" },
  { num: 145, text: "    memcpy *destination);", type: "removed" },
  { num: 146, text: "    return N1;", type: "unchanged" },
  { num: 147, text: "", type: "unchanged" },
  { num: 148, text: "    return null;", type: "unchanged" },
];

const diffRight: DiffLine[] = [
  { num: 140, text: "void crack(crsset) {", type: "unchanged" },
  { num: 141, text: "", type: "unchanged" },
  { num: 142, text: "    int args = *strlen(f);", type: "unchanged" },
  { num: 143, text: "    // use strncpy(file,", type: "added" },
  { num: 144, text: "    //     strnepy_size,", type: "added" },
  { num: 145, text: "    //     validation);", type: "added" },
  { num: 146, text: "    memcpy *destination);", type: "added" },
  { num: 147, text: "    return 0;", type: "unchanged" },
  { num: 148, text: "    return null;", type: "unchanged" },
];

/* ═══ METADATA ═══ */
const fileMetadata = {
  name: "core_system.cpp",
  path: "/src/core/",
  size: "48.2 KB",
  created: "2023-10-15",
  modified: "2024-03-08",
  encoding: "UTF-8"};

const permissions = {
  owner: { name: "root", perms: "r w -" },
  group: { name: "devs", perms: "r - -" },
  others: { name: "—", perms: "— — —" }};

const hexOffsets = [
  { address: "0x0007FFD...", offset: "41 53 44 46..." },
  { address: "0x0007FFF3...", offset: "52 75 6E..." },
  { address: "0x00080014...", offset: "A3 F8 E1 00..." },
  { address: "0x00080028...", offset: "7C 2D 0B FF..." },
];

const validationStatus = {
  checksum: "88BC01A",
  build: "PASSED",
  security: "AUDITED"};

/* ═══ LOAD METER ═══ */
function LoadMeter({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ fontSize: 8, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.08em", fontFamily: T.sans, textTransform: "uppercase" as const }}>{label}</span>
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 6px ${color}40` }} />
      </div>
      <span style={{ fontSize: 8, fontFamily: T.mono, color, fontWeight: 600 }}>{pct}%</span>
    </div>
  );
}

/* ═══ SECTION HEADER ═══ */
function _SectionHeader({ children, icon: Icon, iconColor = T.textTertiary, collapsible = false, defaultOpen = true }: { children: React.ReactNode; icon?: LucideIcon; iconColor?: string; collapsible?: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 ${collapsible ? "cursor-pointer" : ""}`}
        style={{ borderBottom: `1px solid ${T.border}` }}
        onClick={() => collapsible && setOpen(!open)}
      >
        {collapsible && (open ? <ChevronDown size={9} color={T.textMuted} /> : <ChevronRight size={9} color={T.textMuted} />)}
        {Icon && <Icon size={10} color={iconColor} />}
        <span style={{ fontSize: 9, fontWeight: 800, color: T.textTertiary, letterSpacing: "0.14em", textTransform: "uppercase" as const, fontFamily: T.sans }}>
          {children}
        </span>
      </div>
      {collapsible && !open ? null : undefined}
    </div>
  );
}

/* ═══ ERROR LIST ITEM ═══ */
function ErrorItem({ error, isSelected, onSelect }: { error: DiagnosticError; isSelected: boolean; onSelect: () => void }) {
  const cfg = severityConfig[error.severity];
  return (
    <div
      className="px-3 py-2 cursor-pointer transition-all group"
      style={{
        background: isSelected ? cfg.bg : "transparent",
        borderLeft: `3px solid ${isSelected ? cfg.color : "transparent"}`,
        borderBottom: `1px solid ${T.borderSubtle}`}}
      onClick={onSelect}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = T.bgHover; }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = isSelected ? cfg.bg : "transparent"; }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.glowColor}` }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, fontFamily: T.display, letterSpacing: "0.02em" }}>{error.name}</span>
      </div>
      <div className="flex items-center gap-2 pl-3.5">
        <span style={{ fontSize: 8, color: cfg.color, fontWeight: 600 }}>{error.source}</span>
        <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>{error.timestamp}</span>
        <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>{error.kernel}</span>
        <span className="ml-auto px-1.5 py-0.5 rounded" style={{ fontSize: 7, fontFamily: T.mono, color: error.status === "RESOLVED" ? T.emerald : T.textTertiary, background: error.status === "RESOLVED" ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${error.status === "RESOLVED" ? "rgba(16,185,129,0.12)" : T.borderSubtle}` }}>
          {error.status}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN MOD SENTINEL VIEW
   ═══════════════════════════════════════════════════════════════ */

export function ModSentinelView() {
  const { diagnostics } = useDiagnosticStore();
  const getFile = useProjectStore((s) => s.getFile);
  const errListW = useScaledPx(320);
  const metaW = useScaledPx(260);
  const [selectedError, setSelectedError] = useState(0);
  const [showDiff, setShowDiff] = useState(true);
  const [copiedDiag, setCopiedDiag] = useState(false);

  const mappedErrors = useMemo(() => {
    if (diagnostics.length === 0) return [];
    return diagnostics.map((d): DiagnosticError => {
      const fileName = getFile(d.fileId)?.name || d.fileId || "Unknown File";
      return {
        id: d.id,
        name: (d.code || d.message.split(' ')[0] || "ERROR").toUpperCase(),
        severity: (d.severity === 'error' ? 'CRITICAL' : d.severity === 'warning' ? 'ALERT' : 'HINT') as Severity,
        source: d.source || "System",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        kernel: "Kernel_V4",
        status: "UNRESOLVED",
        file: fileName,
        line: d.line,
        description: d.message
      };
    });
  }, [diagnostics, getFile]);

  const criticals = useMemo(() => mappedErrors.filter((e) => e.severity === "CRITICAL"), [mappedErrors]);
  const alerts = useMemo(() => mappedErrors.filter((e) => e.severity === "ALERT"), [mappedErrors]);
  const hints = useMemo(() => mappedErrors.filter((e) => e.severity === "HINT"), [mappedErrors]);

  const activeError = useMemo(() => mappedErrors[selectedError] || {
    id: "N/A",
    name: "NO_ACTIVE_DIAGNOSTICS",
    severity: "HINT",
    source: "System",
    timestamp: "--:--:--",
    kernel: "V4",
    status: "RESOLVED",
    file: "none",
    line: 0,
    description: "No diagnostics found in the current environment."
  }, [mappedErrors, selectedError]);

  const cfg = severityConfig[activeError.severity];

  return (
    <div className="flex flex-col h-full w-full" style={{ background: T.bg, fontFamily: T.sans, color: T.textPrimary }}>

      {/* ═══ SENTINEL HEADER ═══ */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.violetDim}, rgba(244,63,94,0.08))`, border: `1px solid rgba(139,92,246,0.2)` }}>
              <ShieldAlert size={14} color={T.violet} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.03em" }}>MOD SENTINEL</span>
          </div>
          <div className="w-px h-5" style={{ background: T.border }} />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: T.rose, boxShadow: `0 0 6px ${T.rose}60` }} />
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.rose, fontWeight: 700 }}>{criticals.length} CRITICAL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: T.amber, boxShadow: `0 0 6px ${T.amber}60` }} />
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.amber, fontWeight: 700 }}>{alerts.length} ALERT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: T.cyan, boxShadow: `0 0 6px ${T.cyan}60` }} />
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.cyan, fontWeight: 700 }}>{hints.length} HINT</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LoadMeter label="Load Meter" pct={67} color={T.violet} />
          <LoadMeter label="Load Meter" pct={42} color={T.cyan} />
          <div className="w-px h-4" style={{ background: T.border }} />
          <div className="flex items-center gap-1.5">
            <Clock size={10} color={T.textTertiary} />
            <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: T.textPrimary }}>
              {new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>UTC</span>
          </div>
        </div>
      </div>

      {/* ═══ 3-COLUMN LAYOUT ═══ */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT: ACTIVE ERROR LIST ── */}
        <div className="flex flex-col flex-shrink-0" style={{ width: errListW, borderRight: `1px solid ${T.border}`, background: T.bgPanel }}>
          <div className="flex items-center justify-between px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: T.display, color: T.textPrimary }}>ACTIVE ERROR LIST ({mappedErrors.length})</span>
            <button className="p-1 rounded hover:bg-white/5" onClick={() => { navigator.clipboard.writeText(mappedErrors.map((e: DiagnosticError) => `[${e.severity}] ${e.name}: ${e.description}`).join("\n")).then(() => toast.success("Error list copied")).catch(() => {}); }} title="Copy error list"><MoreHorizontal size={12} color={T.textTertiary} /></button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* CRITICAL */}
            <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(244,63,94,0.03)" }}>
              <div className="flex items-center gap-2">
                <AlertOctagon size={10} color={T.rose} />
                <span style={{ fontSize: 9, fontWeight: 800, color: T.rose, letterSpacing: "0.08em" }}>CRITICAL ({criticals.length})</span>
              </div>
              <span className="px-2 py-0.5 rounded" style={{ fontSize: 7, fontWeight: 700, color: T.rose, background: "rgba(244,63,94,0.1)", border: `1px solid rgba(244,63,94,0.15)` }}>High Priority</span>
            </div>
            {criticals.map((err: DiagnosticError) => {
              const idx = mappedErrors.indexOf(err);
              return <ErrorItem key={err.id} error={err} isSelected={selectedError === idx} onSelect={() => setSelectedError(idx)} />;
            })}

            {/* ALERT */}
            <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(245,158,11,0.03)" }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={10} color={T.amber} />
                <span style={{ fontSize: 9, fontWeight: 800, color: T.amber, letterSpacing: "0.08em" }}>ALERT ({alerts.length})</span>
              </div>
              <span className="px-2 py-0.5 rounded" style={{ fontSize: 7, fontWeight: 700, color: T.amber, background: "rgba(245,158,11,0.08)", border: `1px solid rgba(245,158,11,0.12)` }}>Moderate</span>
            </div>
            {alerts.map((err: DiagnosticError) => {
              const idx = mappedErrors.indexOf(err);
              return <ErrorItem key={err.id} error={err} isSelected={selectedError === idx} onSelect={() => setSelectedError(idx)} />;
            })}

            {/* HINT */}
            <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(6,182,212,0.03)" }}>
              <div className="flex items-center gap-2">
                <Info size={10} color={T.cyan} />
                <span style={{ fontSize: 9, fontWeight: 800, color: T.cyan, letterSpacing: "0.08em" }}>HINT ({hints.length})</span>
              </div>
              <span className="px-2 py-0.5 rounded" style={{ fontSize: 7, fontWeight: 700, color: T.cyan, background: "rgba(6,182,212,0.06)", border: `1px solid rgba(6,182,212,0.1)` }}>Low</span>
            </div>
            {hints.map((err: DiagnosticError) => {
              const idx = mappedErrors.indexOf(err);
              return <ErrorItem key={err.id} error={err} isSelected={selectedError === idx} onSelect={() => setSelectedError(idx)} />;
            })}
          </div>

          {/* Error list footer */}
          <div className="px-3 py-1.5 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>{mappedErrors.filter((e: DiagnosticError) => e.status === "UNRESOLVED").length} unresolved</span>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>Sentinel v2.1</span>
            </div>
          </div>
        </div>

        {/* ── CENTER: FOCUSED DIAGNOSTIC VIEW ── */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: T.bg }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <FileCode size={11} color={cfg.color} />
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.02em" }}>
                FOCUSED DIAGNOSTIC VIEW:
              </span>
              <span style={{ fontSize: 10, fontFamily: T.mono, color: cfg.color, fontWeight: 600 }}>
                {activeError.file.toUpperCase()} — ERR_{activeError.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded hover:bg-white/5" onClick={() => setShowDiff(p => !p)} title={showDiff ? "Hide diff" : "Show diff"}><Eye size={10} color={showDiff ? T.cyan : T.textTertiary} /></button>
              <button className="p-1 rounded hover:bg-white/5" onClick={() => { navigator.clipboard.writeText(activeError.description).then(() => toast.success("Diagnostic copied")).catch(() => {}); setCopiedDiag(true); setTimeout(() => setCopiedDiag(false), 2000); }} title="Copy diagnostic">
                {copiedDiag ? <CheckCircle2 size={10} color={T.emerald} /> : <Copy size={10} color={T.textTertiary} />}
              </button>
              <button className="p-1 rounded hover:bg-white/5" onClick={() => setSelectedError(p => (p + 1) % (mappedErrors.length || 1))} title="Next error"><ExternalLink size={10} color={T.textTertiary} /></button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Code snippet */}
            <div className="px-4 py-3">
              <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${T.border}`, background: T.bgSurface }}>
                {/* Code header */}
                <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgElevated }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textSecondary }}>{activeError.file}</span>
                    <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>Line {activeError.line}</span>
                  </div>
                  <span style={{ fontSize: 8, fontFamily: T.mono, color: cfg.color }}>{activeError.severity}</span>
                </div>
                {/* Code lines */}
                <div className="py-1">
                  {focusedCode.map((line, i) => (
                    <div
                      key={`code-${i}`}
                      className="flex items-center px-0 py-px"
                      style={{
                        background: (line.type === "error"
                          ? "rgba(244,63,94,0.1)"
                          : line.type === "context"
                          ? "rgba(245,158,11,0.06)"
                          : "transparent") as any,
                        borderLeft: (line.type === "error" ? `3px solid ${T.rose}` : line.type === "context" ? `3px solid ${T.amber}` : "3px solid transparent") as any} as React.CSSProperties}
                    >
                      <span className="w-10 text-right pr-3 flex-shrink-0 select-none" style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>
                        {line.num}
                      </span>
                      <span style={{ fontSize: 11, fontFamily: T.mono, color: line.type === "error" ? T.rose : line.type === "context" ? T.amber : T.textSecondary, whiteSpace: "pre" }}>
                        {line.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI-Suggested Fix Button */}
            <div className="px-4 pb-3">
              <button
                className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${T.violet}, ${T.violet}cc)`,
                  border: `1px solid rgba(139,92,246,0.4)`,
                  boxShadow: `0 0 20px rgba(139,92,246,0.2), 0 4px 12px rgba(0,0,0,0.3)`,
                  fontFamily: T.display} as React.CSSProperties}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 30px rgba(139,92,246,0.35), 0 4px 16px rgba(0,0,0,0.4)`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 20px rgba(139,92,246,0.2), 0 4px 12px rgba(0,0,0,0.3)`; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <Sparkles size={14} color="#fff" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>AI-SUGGESTED FIX</span>
              </button>
            </div>

            {/* Fix Comparison (Diff) */}
            <div className="px-4 pb-3 flex-1">
              <div className="rounded-lg overflow-hidden h-full" style={{ border: `1px solid ${T.border}`, background: T.bgSurface }}>
                {/* Diff header */}
                <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgElevated }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.04em" }}>FIX COMPARISON (DIFF)</span>
                  </div>
                  <button onClick={() => setShowDiff(!showDiff)} className="p-0.5 rounded hover:bg-white/5">
                    <X size={10} color={T.textTertiary} />
                  </button>
                </div>

                {showDiff && (
                  <div className="flex min-h-0">
                    {/* Left: Current */}
                    <div className="flex-1" style={{ borderRight: `1px solid ${T.border}` }}>
                      <div className="px-3 py-1" style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: "rgba(255,255,255,0.015)" }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.08em" }}>Left (CURRENT)</span>
                      </div>
                      <div className="py-0.5">
                        {diffLeft.map((line, i) => (
                          <div
                            key={`dl-${i}`}
                            className="flex items-center px-0 py-px"
                            style={{
                              background: line.type === "removed" ? "rgba(244,63,94,0.08)" : "transparent",
                              borderLeft: line.type === "removed" ? `2px solid ${T.rose}` : "2px solid transparent"}}
                          >
                            <span className="w-8 text-right pr-2 flex-shrink-0 select-none" style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{line.num}</span>
                            <span style={{ fontSize: 10, fontFamily: T.mono, color: line.type === "removed" ? T.rose : T.textSecondary, whiteSpace: "pre", textDecoration: line.type === "removed" ? "line-through" : "none" }}>
                              {line.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Proposed Fix */}
                    <div className="flex-1">
                      <div className="px-3 py-1" style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: "rgba(255,255,255,0.015)" }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.08em" }}>Right (PROPOSED FIX)</span>
                      </div>
                      <div className="py-0.5">
                        {diffRight.map((line, i) => (
                          <div
                            key={`dr-${i}`}
                            className="flex items-center px-0 py-px"
                            style={{
                              background: line.type === "added" ? "rgba(16,185,129,0.06)" : "transparent",
                              borderLeft: line.type === "added" ? `2px solid ${T.emerald}` : "2px solid transparent"}}
                          >
                            <span className="w-8 text-right pr-2 flex-shrink-0 select-none" style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{line.num}</span>
                            <span style={{ fontSize: 10, fontFamily: T.mono, color: line.type === "added" ? T.emerald : T.textSecondary, whiteSpace: "pre" }}>
                              {line.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: METADATA INSPECTOR ── */}
        <div className="flex flex-col flex-shrink-0" style={{ width: metaW, borderLeft: `1px solid ${T.border}`, background: T.bgPanel }}>
          {/* Header */}
          <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.02em" }}>METADATA INSPECTOR</span>
            <div className="mt-0.5">
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>({activeError.file.toUpperCase()})</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* FILE DETAILS */}
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-1.5 mb-2">
                <ChevronDown size={9} color={T.textMuted} />
                <FileCode size={10} color={T.violet} />
                <span style={{ fontSize: 9, fontWeight: 800, color: T.textTertiary, letterSpacing: "0.12em" }}>FILE DETAILS</span>
              </div>
              <div className="space-y-1.5 pl-4">
                {[
                  { label: "Name:", value: fileMetadata.name, color: T.textPrimary },
                  { label: "Path:", value: fileMetadata.path, color: T.cyanBright },
                  { label: "Size:", value: fileMetadata.size, color: T.textSecondary },
                  { label: "Created:", value: fileMetadata.created, color: T.textSecondary },
                  { label: "Modified:", value: fileMetadata.modified, color: T.textSecondary },
                  { label: "Encoding:", value: fileMetadata.encoding, color: T.textMuted },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span style={{ fontSize: 9, color: T.textTertiary, fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: item.color, fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-3 h-px" style={{ background: T.border }} />

            {/* PERMISSIONS */}
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-1.5 mb-2">
                <ChevronDown size={9} color={T.textMuted} />
                <Lock size={10} color={T.amber} />
                <span style={{ fontSize: 9, fontWeight: 800, color: T.textTertiary, letterSpacing: "0.12em" }}>PERMISSIONS</span>
              </div>
              <div className="space-y-1.5 pl-4">
                {Object.entries(permissions).map(([key, val]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span style={{ fontSize: 9, color: T.textTertiary, fontWeight: 600, textTransform: "capitalize" as const }}>{key}:</span>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textPrimary }}>{val.name}</span>
                      <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>[{val.perms}]</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-3 h-px" style={{ background: T.border }} />

            {/* HEX OFFSETS */}
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-1.5 mb-2">
                <ChevronDown size={9} color={T.textMuted} />
                <span style={{ fontSize: 9, fontWeight: 800, color: T.textTertiary, letterSpacing: "0.12em" }}>HEX OFFSETS</span>
              </div>
              <div className="pl-4">
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: 7, fontWeight: 700, color: T.textMuted, letterSpacing: "0.1em" }}>ADDRESS</span>
                  <span style={{ fontSize: 7, fontWeight: 700, color: T.textMuted, letterSpacing: "0.1em" }}>OFFSET</span>
                </div>
                {hexOffsets.map((hex, i) => (
                  <div key={`hex-${i}`} className="flex items-center justify-between py-0.5">
                    <span style={{ fontSize: 8, fontFamily: T.mono, color: T.cyan }}>{hex.address}</span>
                    <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textSecondary }}>{hex.offset}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-3 h-px" style={{ background: T.border }} />

            {/* VALIDATION STATUS */}
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-1.5 mb-2">
                <ChevronDown size={9} color={T.textMuted} />
                <ShieldCheck size={10} color={T.emerald} />
                <span style={{ fontSize: 9, fontWeight: 800, color: T.textTertiary, letterSpacing: "0.12em" }}>VALIDATION STATUS</span>
              </div>
              <div className="space-y-1.5 pl-4">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 9, color: T.textTertiary, fontWeight: 600 }}>Checksum:</span>
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.violetBright, fontWeight: 600 }}>{validationStatus.checksum}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 9, color: T.textTertiary, fontWeight: 600 }}>Build:</span>
                  <span className="px-2 py-0.5 rounded" style={{ fontSize: 8, fontFamily: T.mono, fontWeight: 700, color: T.emerald, background: "rgba(16,185,129,0.1)", border: `1px solid rgba(16,185,129,0.15)` }}>
                    {validationStatus.build}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 9, color: T.textTertiary, fontWeight: 600 }}>Security:</span>
                  <span className="px-2 py-0.5 rounded" style={{ fontSize: 8, fontFamily: T.mono, fontWeight: 700, color: T.cyanBright, background: "rgba(6,182,212,0.08)", border: `1px solid rgba(6,182,212,0.12)` }}>
                    {validationStatus.security}
                  </span>
                </div>
              </div>
            </div>

            <div className="mx-3 h-px" style={{ background: T.border }} />

            {/* ERROR CONTEXT */}
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-1.5 mb-2">
                <ChevronDown size={9} color={T.textMuted} />
                <AlertTriangle size={10} color={cfg.color} />
                <span style={{ fontSize: 9, fontWeight: 800, color: T.textTertiary, letterSpacing: "0.12em" }}>ERROR CONTEXT</span>
              </div>
              <div className="pl-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 9, color: T.textTertiary, fontWeight: 600 }}>Error ID:</span>
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: cfg.color, fontWeight: 600 }}>{activeError.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 9, color: T.textTertiary, fontWeight: 600 }}>Severity:</span>
                  <span className="px-2 py-0.5 rounded" style={{ fontSize: 8, fontFamily: T.mono, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.borderColor}` }}>
                    {activeError.severity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 9, color: T.textTertiary, fontWeight: 600 }}>Line:</span>
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textPrimary }}>{activeError.line}</span>
                </div>
                <div>
                  <span style={{ fontSize: 9, color: T.textTertiary, fontWeight: 600 }}>Description:</span>
                  <div className="mt-1 px-2 py-1.5 rounded" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
                    <span style={{ fontSize: 9, color: T.textSecondary, lineHeight: 1.5 }}>{activeError.description}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inspector footer */}
          <div className="px-3 py-1.5 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>Inspector v1.2</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: T.emerald }} />
              <span style={{ fontSize: 7, fontFamily: T.mono, color: T.emerald }}>ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModSentinelView;
