/* ─────────────────────────────────────────────────────────────
   JPE Studio — Conflict Resolution Wizard (Phase 13)
   4-step interactive wizard: Scan → Analyze → Strategy → Apply
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect, useCallback } from "react";
import {
  X, Shield, AlertTriangle, CheckCircle2, Search, XCircle,
  Package, ChevronRight, ChevronLeft,
  Merge, Eye, Zap, ArrowRight,
  GitMerge, Check, SplitSquareHorizontal, RotateCcw,
  Info, Hash,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type ConflictSeverity = "critical" | "warning" | "info";
type ResolutionStrategy = "keep-ours" | "keep-theirs" | "merge" | "skip";

interface ConflictItem {
  id: string;
  resourceKey: string;
  type: string;
  severity: ConflictSeverity;
  ourFile: string;
  theirFile: string;
  description: string;
  diffLines: { line: number; ours: string; theirs: string }[];
  resolution: ResolutionStrategy | null;
}

/* ── Mock conflict data ── */
const MOCK_CONFLICTS: ConflictItem[] = [
  {
    id: "c1", resourceKey: "034AEECB!00000000!trait_Evil",
    type: "XML Tuning", severity: "critical",
    ourFile: "Evil_Trait_Override.package", theirFile: "Trait_Overhaul_Mod.package",
    description: "Both mods override the same trait tuning file. The 'conflicting_traits' list differs.",
    diffLines: [
      { line: 11, ours: '    <TunableList name="conflicting_traits">', theirs: '    <TunableList name="conflicting_traits">' },
      { line: 12, ours: "      <Tunable>trait_Good</Tunable>",          theirs: "      <Tunable>trait_Good</Tunable>" },
      { line: 13, ours: "      <Tunable>trait_Childish</Tunable>",      theirs: "      <Tunable>trait_Brave</Tunable>" },
    ],
    resolution: null,
  },
  {
    id: "c2", resourceKey: "0A3B4C5D!00000000!interaction_Hug",
    type: "Interaction", severity: "critical",
    ourFile: "Evil_Trait_Override.package", theirFile: "Expanded_Interactions.package",
    description: "Conflicting interaction tuning: both mods add custom EmotionOutcome nodes.",
    diffLines: [
      { line: 24, ours: "  EmotionOutcome anger 0.7", theirs: "  EmotionOutcome anger 0.4" },
      { line: 25, ours: "  EmotionOutcome happy 0.1", theirs: "  EmotionOutcome happy 0.3" },
    ],
    resolution: null,
  },
  {
    id: "c3", resourceKey: "0A3B4C5D!E0000000!en_US_strings",
    type: "STBL String Table", severity: "warning",
    ourFile: "Evil_Trait_Override.package", theirFile: "Translation_Pack_v2.package",
    description: "String hash 0x0A3B4C5D has different translations in each package.",
    diffLines: [
      { line: 1, ours: '"Evil" (en_US)',  theirs: '"Wicked" (en_US)' },
      { line: 2, ours: '"These Sims..."', theirs: '"Sims with this trait..."' },
    ],
    resolution: null,
  },
  {
    id: "c4", resourceKey: "F8B24C0A!00000000!buff_Evil_Aura",
    type: "Buff Tuning", severity: "warning",
    ourFile: "Evil_Trait_Override.package", theirFile: "Trait_Overhaul_Mod.package",
    description: "Buff intensity values differ — may cause stacking issues.",
    diffLines: [
      { line: 6, ours: '  <Tunable name="intensity">1.5</Tunable>', theirs: '  <Tunable name="intensity">2.0</Tunable>' },
    ],
    resolution: null,
  },
  {
    id: "c5", resourceKey: "A1B2C3D4!00000000!cameraData",
    type: "Camera Data", severity: "info",
    ourFile: "Evil_Trait_Override.package", theirFile: "Camera_Enhancement.package",
    description: "Minor camera angle override — low risk of visual issues.",
    diffLines: [
      { line: 3, ours: "  angle: 45.0", theirs: "  angle: 47.5" },
    ],
    resolution: null,
  },
];

const STEPS = [
  { id: "scan",     label: "Scan",     icon: Search,   desc: "Detect all mod conflicts" },
  { id: "analyze",  label: "Analyze",  icon: Eye,      desc: "Review each conflict in detail" },
  { id: "strategy", label: "Strategy", icon: GitMerge, desc: "Choose resolution for each conflict" },
  { id: "apply",    label: "Apply",    icon: Zap,      desc: "Apply resolutions and rebuild" },
];

const SEVERITY_STYLES: Record<ConflictSeverity, { color: string; bg: string; icon: typeof AlertTriangle; label: string }> = {
  critical: { color: T.rose,    bg: T.roseDim,    icon: XCircle,       label: "Critical" },
  warning:  { color: T.amber,   bg: T.amberDim,   icon: AlertTriangle, label: "Warning"  },
  info:     { color: T.cyan,    bg: T.cyanDim,    icon: Info,          label: "Info"     },
};

const STRATEGY_OPTIONS: { id: ResolutionStrategy; label: string; desc: string; icon: typeof Check; color: string }[] = [
  { id: "keep-ours",   label: "Keep Ours",   desc: "Use our version of this resource",               icon: Check,               color: T.emerald },
  { id: "keep-theirs", label: "Keep Theirs", desc: "Use the conflicting mod's version",              icon: ArrowRight,           color: T.violet  },
  { id: "merge",       label: "Smart Merge", desc: "Attempt automatic merge of both versions",        icon: Merge,               color: T.cyan    },
  { id: "skip",        label: "Skip",        desc: "Leave both intact — may cause in-game issues",   icon: RotateCcw,           color: T.textMuted},
];

function SeverityBadge({ severity }: { severity: ConflictSeverity }) {
  const s = SEVERITY_STYLES[severity];
  const Icon = s.icon;
  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
      <Icon size={9} color={s.color} />
      <span style={{ fontSize: 9, fontWeight: 700, color: s.color, letterSpacing: "0.04em" }}>{s.label.toUpperCase()}</span>
    </div>
  );
}

export function ConflictResolutionWizard({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "done">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [applyState, setApplyState] = useState<"idle" | "applying" | "done">("idle");
  const [applyProgress, setApplyProgress] = useState(0);
  const [applyLog, setApplyLog] = useState<string[]>([]);

  /* Reset on open */
  useEffect(() => {
    if (isOpen) {
      setStep(0); setScanState("idle"); setScanProgress(0); setScanLog([]);
      setConflicts([]); setSelected(null); setApplyState("idle"); setApplyProgress(0); setApplyLog([]);
    }
  }, [isOpen]);

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  const runScan = useCallback(async () => {
    setScanState("scanning");
    setScanProgress(0);
    setScanLog([]);

    const logLines = [
      "Indexing installed mods directory…",
      "Loading Evil_Trait_Override.package — 9 resources",
      "Loading Trait_Overhaul_Mod.package — 24 resources",
      "Loading Expanded_Interactions.package — 41 resources",
      "Loading Translation_Pack_v2.package — 3 resources",
      "Loading Camera_Enhancement.package — 7 resources",
      "Building resource key index…",
      "Cross-referencing 84 resource keys…",
      `Detected ${MOCK_CONFLICTS.length} conflict(s)!`,
      "Scan complete.",
    ];

    for (let i = 0; i < logLines.length; i++) {
      await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
      setScanLog(prev => [...prev, logLines[i]]);
      setScanProgress(Math.round(((i + 1) / logLines.length) * 100));
    }

    setConflicts(MOCK_CONFLICTS.map(c => ({ ...c })));
    setScanState("done");
  }, []);

  const setResolution = (id: string, strategy: ResolutionStrategy) => {
    setConflicts(prev => prev.map(c => c.id === id ? { ...c, resolution: strategy } : c));
  };

  const unresolvedCount = conflicts.filter(c => !c.resolution).length;
  const criticalCount = conflicts.filter(c => c.severity === "critical").length;

  const runApply = useCallback(async () => {
    setApplyState("applying");
    setApplyProgress(0);
    setApplyLog([]);

    const resolved = conflicts.filter(c => c.resolution);

    for (let i = 0; i < resolved.length; i++) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      const c = resolved[i];
      const stratLabel = STRATEGY_OPTIONS.find(s => s.id === c.resolution)?.label ?? c.resolution;
      setApplyLog(prev => [...prev, `[${stratLabel}] ${c.type} — ${c.resourceKey}`]);
      setApplyProgress(Math.round(((i + 1) / resolved.length) * 100));
    }

    await new Promise(r => setTimeout(r, 400));
    setApplyLog(prev => [...prev, "Rebuilding resource index…", "✓ All resolutions applied successfully!"]);
    setApplyState("done");
    toast.success("Conflict resolution complete!", {
      description: `${resolved.length} resolved · ${conflicts.filter(c => !c.resolution).length} skipped`,
    });
  }, [conflicts]);

  const selectedConflict = conflicts.find(c => c.id === selected);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: "min(940px, 96vw)",
              maxHeight: "92vh",
              background: T.bgElevated,
              border: `1px solid ${T.border}`,
              boxShadow: `0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 5%, ${T.rose}80, ${T.amber}80, transparent 95%)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.rose}20, ${T.amber}20)`, border: `1px solid ${T.borderSubtle}` }}>
                  <GitMerge size={16} color={T.rose} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: T.display }}>Conflict Resolution Wizard</div>
                  <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono }}>Detect, analyze, and resolve mod resource conflicts interactively</div>
                </div>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10" style={{ border: `1px solid ${T.borderSubtle}` }}>
                <X size={14} color={T.textMuted} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 px-6 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: "rgba(0,0,0,0.15)" }}>
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === step;
                const isDone = i < step;
                const canNav = i <= step || isDone;
                return (
                  <div key={s.id} className="flex items-center min-w-0 flex-1">
                    <button
                      onClick={() => { if (canNav) setStep(i); }}
                      disabled={!canNav}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                      style={{ background: isActive ? "rgba(252,129,129,0.06)" : "transparent", opacity: !canNav ? 0.4 : 1, cursor: canNav ? "pointer" : "default" }}
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: isDone ? T.emerald : isActive ? T.rose : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isDone ? T.emerald : isActive ? `${T.rose}60` : T.borderSubtle}`,
                      }}>
                        {isDone ? <Check size={11} color="#fff" /> : <span style={{ fontSize: 9, fontWeight: 700, fontFamily: T.mono, color: isActive ? T.rose : T.textDim }}>{i + 1}</span>}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? T.textPrimary : T.textTertiary }}>{s.label}</div>
                        {isActive && <div style={{ fontSize: 9, color: T.textMuted }}>{s.desc}</div>}
                      </div>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 mx-2 h-[1px]" style={{ background: i < step ? `${T.emerald}40` : T.borderSubtle }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden min-h-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-y-auto"
                >

                  {/* ── Step 1: Scan ── */}
                  {step === 0 && (
                    <div className="p-6 space-y-5">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Scan for Conflicts</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>Scans all installed mod packages and cross-references resource keys to find conflicts.</div>
                      </div>

                      {/* Mod list */}
                      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                        <div className="px-4 py-2" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>MODS TO SCAN (5)</span>
                        </div>
                        {[
                          { name: "Evil_Trait_Override.package",     resources: 9,  status: "ours" },
                          { name: "Trait_Overhaul_Mod.package",       resources: 24, status: "other" },
                          { name: "Expanded_Interactions.package",    resources: 41, status: "other" },
                          { name: "Translation_Pack_v2.package",      resources: 3,  status: "other" },
                          { name: "Camera_Enhancement.package",       resources: 7,  status: "other" },
                        ].map(mod => (
                          <div key={mod.name} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                            <Package size={12} color={mod.status === "ours" ? T.cyan : T.textMuted} className="flex-shrink-0" />
                            <span className="flex-1" style={{ fontSize: 12, color: mod.status === "ours" ? T.textPrimary : T.textSecondary, fontFamily: T.mono }}>{mod.name}</span>
                            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{mod.resources} res.</span>
                            {mod.status === "ours" && (
                              <span className="px-1.5 py-0 rounded" style={{ fontSize: 8, fontWeight: 700, color: T.cyan, background: T.cyanDim }}>OUR MOD</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {scanState === "idle" && (
                        <div className="flex flex-col items-center gap-4 py-8">
                          <button
                            onClick={runScan}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all"
                            style={{
                              background: `linear-gradient(135deg, ${T.rose}CC, ${T.amber}CC)`,
                              boxShadow: `0 0 20px ${T.rose}20`,
                              fontSize: 13, fontWeight: 700, color: "#fff",
                            }}
                          >
                            <Search size={15} /> Start Scan
                          </button>
                          <span style={{ fontSize: 11, color: T.textMuted }}>This will analyse 84 resource keys across 5 mods</span>
                        </div>
                      )}

                      {(scanState === "scanning" || scanState === "done") && (
                        <>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>SCAN PROGRESS</span>
                              <span style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 700, color: scanState === "done" ? T.emerald : T.amber }}>{scanProgress}%</span>
                            </div>
                            <div className="relative rounded-full overflow-hidden" style={{ height: 5, background: "rgba(255,255,255,0.04)" }}>
                              <motion.div className="absolute inset-y-0 left-0 rounded-full"
                                style={{ background: scanState === "done" ? `linear-gradient(90deg, ${T.emerald}, ${T.cyan})` : `linear-gradient(90deg, ${T.rose}, ${T.amber})` }}
                                animate={{ width: `${scanProgress}%` }} transition={{ duration: 0.3 }} />
                            </div>
                          </div>

                          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                            <div className="px-3 py-2" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
                              <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>SCAN LOG</span>
                            </div>
                            <div className="p-3 space-y-1 max-h-40 overflow-y-auto" style={{ background: T.bgDeep }}>
                              <AnimatePresence>
                                {scanLog.map((line, i) => (
                                  <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.12 }}
                                    style={{ fontSize: 11, fontFamily: T.mono, color: line.includes("Detected") ? T.amber : line.includes("complete") ? T.emerald : T.textSecondary }}>
                                    {line}
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          </div>

                          {scanState === "done" && (
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { label: "Total Conflicts", value: conflicts.length, color: T.amber },
                                { label: "Critical",        value: criticalCount,    color: T.rose  },
                                { label: "Mods Affected",  value: 5,                 color: T.cyan  },
                              ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-center p-3 rounded-xl" style={{ background: `${stat.color}06`, border: `1px solid ${stat.color}20` }}>
                                  <span style={{ fontSize: 22, fontWeight: 800, color: stat.color, fontFamily: T.mono }}>{stat.value}</span>
                                  <span style={{ fontSize: 10, color: T.textMuted }}>{stat.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* ── Step 2: Analyze ── */}
                  {step === 1 && (
                    <div className="flex h-full" style={{ minHeight: 400 }}>
                      {/* Conflict list */}
                      <div className="flex flex-col" style={{ width: 260, borderRight: `1px solid ${T.border}`, background: T.bgPanel }}>
                        <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>CONFLICTS ({conflicts.length})</span>
                        </div>
                        <div className="flex-1 overflow-y-auto py-1">
                          {conflicts.map(c => {
                            const s = SEVERITY_STYLES[c.severity];
                            const isActive = selected === c.id;
                            return (
                              <div
                                key={c.id}
                                className="flex flex-col gap-1 px-3 py-2.5 cursor-pointer transition-colors"
                                style={{ background: isActive ? `${s.color}08` : "transparent", borderLeft: `2px solid ${isActive ? s.color : "transparent"}` }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.bgHover; }}
                                onMouseLeave={e => { e.currentTarget.style.background = isActive ? `${s.color}08` : "transparent"; }}
                                onClick={() => setSelected(c.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <SeverityBadge severity={c.severity} />
                                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{c.type}</span>
                                </div>
                                <span style={{ fontSize: 10, fontFamily: T.mono, color: isActive ? T.textPrimary : T.textSecondary }} className="truncate">{c.resourceKey}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Conflict detail */}
                      <div className="flex-1 overflow-y-auto">
                        {!selectedConflict ? (
                          <div className="flex flex-col items-center justify-center h-full gap-3">
                            <GitMerge size={24} color={T.textDim} />
                            <span style={{ fontSize: 12, color: T.textDim }}>Select a conflict to view details</span>
                          </div>
                        ) : (
                          <div className="p-5 space-y-4">
                            <div className="flex items-center gap-3">
                              <SeverityBadge severity={selectedConflict.severity} />
                              <span style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 700, color: T.cyan }}>{selectedConflict.type}</span>
                              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>#{selectedConflict.id}</span>
                            </div>

                            <div className="p-3 rounded-lg" style={{ background: T.bgDeep, border: `1px solid ${T.borderSubtle}` }}>
                              <div className="flex items-center gap-1.5 mb-1">
                                <Hash size={10} color={T.textMuted} />
                                <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>RESOURCE KEY</span>
                              </div>
                              <code style={{ fontSize: 12, fontFamily: T.mono, color: T.violetBright }}>{selectedConflict.resourceKey}</code>
                            </div>

                            <p style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.65 }}>{selectedConflict.description}</p>

                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: "OUR FILE",   value: selectedConflict.ourFile,   color: T.cyan  },
                                { label: "THEIR FILE", value: selectedConflict.theirFile, color: T.amber },
                              ].map((col, i) => (
                                <div key={i} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
                                  <span style={{ fontSize: 9, fontWeight: 700, color: col.color, letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>{col.label}</span>
                                  <div className="flex items-center gap-1.5">
                                    <Package size={10} color={col.color} />
                                    <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary }} className="truncate">{col.value}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Diff viewer */}
                            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                              <div className="flex items-center gap-2 px-3 py-2" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
                                <SplitSquareHorizontal size={12} color={T.textMuted} />
                                <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>DIFF VIEW</span>
                              </div>
                              <div style={{ background: T.bgDeep }}>
                                {selectedConflict.diffLines.map((diff, i) => (
                                  <div key={i} className="grid" style={{ gridTemplateColumns: "32px 1fr 1fr", borderBottom: `1px solid ${T.borderSubtle}` }}>
                                    <div className="flex items-center justify-center py-1.5" style={{ borderRight: `1px solid ${T.borderSubtle}`, background: "rgba(0,0,0,0.15)" }}>
                                      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{diff.line}</span>
                                    </div>
                                    <div className="px-3 py-1.5" style={{ borderRight: `1px solid ${T.borderSubtle}`, background: "rgba(72,187,120,0.03)" }}>
                                      <span style={{ fontSize: 10, fontFamily: T.mono, color: T.emerald }}>{diff.ours || " "}</span>
                                    </div>
                                    <div className="px-3 py-1.5" style={{ background: "rgba(246,173,85,0.03)" }}>
                                      <span style={{ fontSize: 10, fontFamily: T.mono, color: T.amber }}>{diff.theirs || " "}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex" style={{ borderTop: `1px solid ${T.border}` }}>
                                <div className="flex-1 flex items-center gap-2 px-3 py-1.5" style={{ borderRight: `1px solid ${T.borderSubtle}` }}>
                                  <div className="w-2 h-2 rounded-sm" style={{ background: T.emerald }} />
                                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>Ours ({selectedConflict.ourFile})</span>
                                </div>
                                <div className="flex-1 flex items-center gap-2 px-3 py-1.5">
                                  <div className="w-2 h-2 rounded-sm" style={{ background: T.amber }} />
                                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>Theirs ({selectedConflict.theirFile})</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Strategy ── */}
                  {step === 2 && (
                    <div className="p-6 space-y-4">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Choose Resolution Strategy</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>{unresolvedCount} of {conflicts.length} conflicts unresolved. Apply "Keep Ours" to all with one click.</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setConflicts(prev => prev.map(c => ({ ...c, resolution: "keep-ours" })))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                          style={{ fontSize: 11, color: T.emerald, background: T.emeraldDim, border: `1px solid ${T.emerald}20` }}
                        >
                          <Check size={11} /> Keep All Ours
                        </button>
                        <button
                          onClick={() => setConflicts(prev => prev.map(c => ({ ...c, resolution: "merge" })))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                          style={{ fontSize: 11, color: T.cyan, background: T.cyanDim, border: `1px solid ${T.cyan}20` }}
                        >
                          <Merge size={11} /> Merge All
                        </button>
                        <button
                          onClick={() => setConflicts(prev => prev.map(c => ({ ...c, resolution: null })))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                          style={{ fontSize: 11, color: T.textMuted, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}
                        >
                          <RotateCcw size={11} /> Reset All
                        </button>
                      </div>

                      <div className="space-y-2">
                        {conflicts.map(c => {
                          const svStyle = SEVERITY_STYLES[c.severity];
                          const resolvedOpt = STRATEGY_OPTIONS.find(s => s.id === c.resolution);
                          return (
                            <div key={c.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.resolution ? `${T.emerald}20` : T.border}` }}>
                              <div className="flex items-center justify-between px-4 py-2.5" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.borderSubtle}` }}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <SeverityBadge severity={c.severity} />
                                  <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary }} className="truncate">{c.resourceKey}</span>
                                </div>
                                {c.resolution && (
                                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                    <CheckCircle2 size={11} color={T.emerald} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: T.emerald }}>{resolvedOpt?.label}</span>
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-4 gap-0" style={{ background: "rgba(0,0,0,0.1)" }}>
                                {STRATEGY_OPTIONS.map(opt => {
                                  const Icon = opt.icon;
                                  const isChosen = c.resolution === opt.id;
                                  return (
                                    <button
                                      key={opt.id}
                                      onClick={() => setResolution(c.id, opt.id)}
                                      className="flex flex-col items-center gap-1 px-2 py-2.5 transition-all"
                                      style={{
                                        background: isChosen ? `${opt.color}10` : "transparent",
                                        borderRight: `1px solid ${T.borderSubtle}`,
                                        borderTop: `2px solid ${isChosen ? opt.color : "transparent"}`,
                                      }}
                                    >
                                      <Icon size={12} color={isChosen ? opt.color : T.textMuted} />
                                      <span style={{ fontSize: 9, fontWeight: isChosen ? 700 : 500, color: isChosen ? opt.color : T.textMuted, whiteSpace: "nowrap" }}>{opt.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Step 4: Apply ── */}
                  {step === 3 && (
                    <div className="p-6 space-y-5">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>Apply Resolutions</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>{conflicts.filter(c => c.resolution).length} of {conflicts.length} conflicts will be resolved.</div>
                      </div>

                      {/* Summary table */}
                      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                        <div className="px-3 py-2" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>RESOLUTION SUMMARY</span>
                        </div>
                        {conflicts.map(c => {
                          const sOpt = STRATEGY_OPTIONS.find(s => s.id === c.resolution);
                          const svStyle = SEVERITY_STYLES[c.severity];
                          return (
                            <div key={c.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                              <svStyle.icon size={11} color={svStyle.color} className="flex-shrink-0" />
                              <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary, flex: 1 }} className="truncate">{c.resourceKey}</span>
                              {sOpt
                                ? <div className="flex items-center gap-1.5 flex-shrink-0"><sOpt.icon size={10} color={sOpt.color} /><span style={{ fontSize: 10, fontWeight: 700, color: sOpt.color }}>{sOpt.label}</span></div>
                                : <span style={{ fontSize: 10, color: T.textDim, fontStyle: "italic" }}>Not resolved</span>
                              }
                            </div>
                          );
                        })}
                      </div>

                      {applyState === "idle" && (
                        <div className="flex justify-center">
                          <button
                            onClick={runApply}
                            disabled={conflicts.filter(c => c.resolution).length === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all disabled:opacity-40"
                            style={{
                              background: `linear-gradient(135deg, ${T.violet}CC, ${T.cyan}CC)`,
                              boxShadow: `0 0 20px ${T.violet}20`,
                              fontSize: 13, fontWeight: 700, color: "#fff",
                            }}
                          >
                            <Zap size={15} /> Apply {conflicts.filter(c => c.resolution).length} Resolutions
                          </button>
                        </div>
                      )}

                      {(applyState === "applying" || applyState === "done") && (
                        <>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>APPLYING</span>
                              <span style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 700, color: applyState === "done" ? T.emerald : T.violet }}>{applyProgress}%</span>
                            </div>
                            <div className="relative rounded-full overflow-hidden" style={{ height: 5, background: "rgba(255,255,255,0.04)" }}>
                              <motion.div className="absolute inset-y-0 left-0 rounded-full"
                                style={{ background: applyState === "done" ? `linear-gradient(90deg, ${T.emerald}, ${T.cyan})` : `linear-gradient(90deg, ${T.violet}, ${T.cyan})` }}
                                animate={{ width: `${applyProgress}%` }} transition={{ duration: 0.3 }} />
                            </div>
                          </div>

                          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                            <div className="px-3 py-2" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
                              <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em" }}>APPLY LOG</span>
                            </div>
                            <div className="p-3 space-y-1 max-h-40 overflow-y-auto" style={{ background: T.bgDeep }}>
                              <AnimatePresence>
                                {applyLog.map((line, i) => (
                                  <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.12 }}
                                    style={{ fontSize: 11, fontFamily: T.mono, color: line.startsWith("✓") ? T.emerald : T.textSecondary }}>
                                    {line}
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          </div>

                          {applyState === "done" && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: T.emeraldDim, border: `1px solid ${T.emerald}20` }}>
                                <CheckCircle2 size={16} color={T.emerald} />
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: T.emerald }}>All resolutions applied successfully</div>
                                  <div style={{ fontSize: 10, color: `${T.emerald}99` }}>Rebuild your .package to publish the resolved version</div>
                                </div>
                              </div>
                              <button
                                onClick={onClose}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all"
                                style={{ background: `linear-gradient(135deg, ${T.emerald}CC, ${T.cyan}CC)`, fontSize: 13, fontWeight: 700, color: "#fff" }}
                              >
                                <CheckCircle2 size={14} /> Done — Close Wizard
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: "rgba(0,0,0,0.15)" }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(s => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all disabled:opacity-30"
                  style={{ fontSize: 12, color: T.textSecondary, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}
                >
                  <ChevronLeft size={13} /> Back
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="px-3 py-1.5 rounded-lg transition-all" style={{ fontSize: 12, color: T.textMuted, border: `1px solid ${T.borderSubtle}` }}>Cancel</button>
                {step < STEPS.length - 1 && (
                  <button
                    onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                    disabled={step === 0 && scanState !== "done"}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all disabled:opacity-40"
                    style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${T.rose}CC, ${T.amber}CC)` }}
                  >
                    Next <ChevronRight size={13} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConflictResolutionWizard;