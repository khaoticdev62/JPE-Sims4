/* FileDiffViewer.tsx — Phase 11
   Full-screen file diff comparison overlay. Side-by-side and unified modes,
   hunk navigation, line annotations, and keyboard-driven UX. */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X, ChevronUp, ChevronDown, GitBranch, GitCommit,
  ArrowLeftRight, AlignLeft, FileCode, Copy, Check,
  Hash, ChevronsUpDown, GitMerge,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { Eyebrow, Badge } from "../pages/jpe-shared";
import { toast } from "sonner";
import { useFocusTrap, useReturnFocus } from "./jpe-a11y";

/* ─── Types ─── */
type DiffLineType = "added" | "removed" | "unchanged";

interface DiffLine {
  id: number;
  type: DiffLineType;
  content: string;
  oldNum?: number;
  newNum?: number;
}

interface DiffHunk {
  id: number;
  header: string;
  lines: DiffLine[];
}

/* ─── Mock diff data ─── */
const DIFF_HUNKS: DiffHunk[] = [
  {
    id: 0,
    header: "@@ -1,5 +1,5 @@ Root element",
    lines: [
      { id: 1,  type: "unchanged", content: '<?xml version="1.0" encoding="utf-8"?>',                                oldNum: 1,  newNum: 1  },
      { id: 2,  type: "removed",   content: '<I c="Trait" i="trait" m="traits.trait_type" n="trait_Evil" s="21202">', oldNum: 2              },
      { id: 3,  type: "added",     content: '<I c="Trait" i="trait" m="traits.trait_type" n="trait_Evil" s="21203">',             newNum: 2  },
      { id: 4,  type: "unchanged", content: '  <L n="trait_type">',                                                  oldNum: 3,  newNum: 3  },
      { id: 5,  type: "unchanged", content: '    <E>PERSONALITY</E>',                                                oldNum: 4,  newNum: 4  },
      { id: 6,  type: "unchanged", content: '  </L>',                                                                oldNum: 5,  newNum: 5  },
    ],
  },
  {
    id: 1,
    header: "@@ -12,9 +12,14 @@ mood_buff_data section",
    lines: [
      { id: 10, type: "unchanged", content: '  <V n="mood_buff_data" t="enabled">',                   oldNum: 12, newNum: 12 },
      { id: 11, type: "unchanged", content: '    <U n="mood_buff_data_moodlet">',                     oldNum: 13, newNum: 13 },
      { id: 12, type: "unchanged", content: '      <T n="buff_ref">0x2A09E25E</T>',                   oldNum: 14, newNum: 14 },
      { id: 13, type: "unchanged", content: '      <T n="mood_override">None</T>',                    oldNum: 15, newNum: 15 },
      { id: 14, type: "removed",   content: '      <T n="mood_modifier">2</T>',                       oldNum: 16              },
      { id: 15, type: "added",     content: '      <T n="mood_modifier">3</T>',                                   newNum: 16 },
      { id: 16, type: "added",     content: '      <T n="mood_intensity">HIGH</T>',                               newNum: 17 },
      { id: 17, type: "unchanged", content: '    </U>',                                               oldNum: 17, newNum: 18 },
      { id: 18, type: "unchanged", content: '  </V>',                                                 oldNum: 18, newNum: 19 },
      { id: 19, type: "added",     content: '  <V n="autonomy_weight" t="enabled">',                             newNum: 20 },
      { id: 20, type: "added",     content: '    <T n="weight">0.85</T>',                                         newNum: 21 },
      { id: 21, type: "added",     content: '  </V>',                                                             newNum: 22 },
    ],
  },
  {
    id: 2,
    header: "@@ -22,8 +27,10 @@ appropriateness_flags",
    lines: [
      { id: 30, type: "unchanged", content: '  <L n="appropriateness_flags">',                        oldNum: 22, newNum: 27 },
      { id: 31, type: "unchanged", content: '    <E>Unhinged</E>',                                    oldNum: 23, newNum: 28 },
      { id: 32, type: "removed",   content: '    <E>Deprecated_Flag</E>',                             oldNum: 24              },
      { id: 33, type: "removed",   content: '    <E>Legacy_Evil</E>',                                 oldNum: 25              },
      { id: 34, type: "unchanged", content: '  </L>',                                                 oldNum: 26, newNum: 29 },
      { id: 35, type: "removed",   content: '  <T n="trait_vet_experience_modifier">1.0</T>',         oldNum: 27              },
      { id: 36, type: "added",     content: '  <T n="trait_mischief_modifier">1.25</T>',                          newNum: 30 },
      { id: 37, type: "added",     content: '  <T n="trait_active_decay">false</T>',                              newNum: 31 },
      { id: 38, type: "added",     content: '  <T n="trait_version" s="110800">true</T>',                         newNum: 32 },
      { id: 39, type: "unchanged", content: '</I>',                                                   oldNum: 28, newNum: 33 },
    ],
  },
];

const TOTAL_ADDITIONS = DIFF_HUNKS.flatMap(h => h.lines).filter(l => l.type === "added").length;
const TOTAL_DELETIONS = DIFF_HUNKS.flatMap(h => h.lines).filter(l => l.type === "removed").length;

/* ─── Helpers ─── */
function lineStyle(type: DiffLineType) {
  if (type === "added")   return { bg: `${T.emerald}10`, border: `${T.emerald}30`, text: T.emerald,        prefix: "+" };
  if (type === "removed") return { bg: `${T.rose}10`,    border: `${T.rose}30`,    text: T.rose,           prefix: "−" };
  return                         { bg: "transparent",    border: "transparent",    text: T.textSecondary,  prefix: " " };
}

type SidePair = { left: DiffLine | null; right: DiffLine | null };

function buildPairs(lines: DiffLine[]): SidePair[] {
  const pairs: SidePair[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.type === "unchanged") {
      pairs.push({ left: line, right: line }); i++;
    } else if (line.type === "removed") {
      const next = lines[i + 1];
      if (next?.type === "added") { pairs.push({ left: line, right: next }); i += 2; }
      else                        { pairs.push({ left: line, right: null }); i++;     }
    } else {
      pairs.push({ left: null, right: line }); i++;
    }
  }
  return pairs;
}

/* ─── FileDiffViewer ─── */
export function FileDiffViewer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [currentHunk, setCurrentHunk] = useState(0);
  const [copied, setCopied] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hunkRefs = useRef<(HTMLDivElement | null)[]>([]);

  useFocusTrap(overlayRef, isOpen);
  useReturnFocus(isOpen);

  const goHunk = useCallback((dir: 1 | -1) => {
    setCurrentHunk(prev => {
      const next = Math.max(0, Math.min(DIFF_HUNKS.length - 1, prev + dir));
      hunkRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")                                    onClose();
      if (e.altKey && e.key === "ArrowDown") { e.preventDefault(); goHunk(1);  }
      if (e.altKey && e.key === "ArrowUp")   { e.preventDefault(); goHunk(-1); }
      if (e.key === "Tab" && !e.shiftKey)    { e.preventDefault(); setViewMode(v => v === "split" ? "unified" : "split"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, goHunk, onClose]);

  const copyDiff = () => {
    const text = DIFF_HUNKS.flatMap(h => [
      h.header,
      ...h.lines.map(l => `${lineStyle(l.type).prefix} ${l.content}`),
    ]).join("\n");
    navigator.clipboard.writeText(text)
      .then(() => { toast.success("Diff copied to clipboard"); setCopied(true); setTimeout(() => setCopied(false), 1500); })
      .catch(() => {});
  };

  const addPct = Math.round((TOTAL_ADDITIONS / (TOTAL_ADDITIONS + TOTAL_DELETIONS)) * 100);

  /* ─── Line row (reusable) ─── */
  const LineCell = ({
    line, side,
  }: {
    line: DiffLine | null;
    side: "left" | "right";
  }) => {
    if (!line) return (
      <div className="flex-1 flex items-start" style={{ borderRight: side === "left" ? `1px solid ${T.border}` : undefined, background: "rgba(0,0,0,0.15)" }}>
        <span className="flex-shrink-0 select-none" style={{ fontSize: 11, width: 36, paddingTop: 3 }} />
        <span className="flex-shrink-0 select-none" style={{ fontSize: 11, width: 16, paddingTop: 3 }} />
        <span className="flex-1 px-1" style={{ fontSize: 11, paddingTop: 3, paddingBottom: 3 }} />
      </div>
    );
    const s = lineStyle(line.type);
    const isSelected = selectedLine === line.id;
    return (
      <div
        className="flex-1 flex items-start cursor-pointer transition-all"
        style={{
          borderRight: side === "left" ? `1px solid ${T.border}` : undefined,
          background: isSelected ? `${T.cyan}08` : s.bg,
          borderLeft: `3px solid ${isSelected ? T.cyan : s.border}`,
        }}
        onClick={() => setSelectedLine(isSelected ? null : line.id)}
      >
        <span className="flex-shrink-0 select-none text-right" style={{ fontSize: 11, fontFamily: T.mono, width: 36, color: T.textDim, paddingTop: 3, paddingLeft: 4, paddingRight: 6 }}>
          {side === "left" ? (line.oldNum ?? "") : (line.newNum ?? "")}
        </span>
        <span className="flex-shrink-0 select-none" style={{ fontSize: 11, fontFamily: T.mono, width: 16, color: s.text, paddingTop: 3, textAlign: "center" as const }}>
          {s.prefix}
        </span>
        <span className="flex-1 px-1 break-all" style={{ fontSize: 11, fontFamily: T.mono, color: line.type === "added" ? T.emerald : line.type === "removed" ? T.rose : T.textSecondary, paddingTop: 3, paddingBottom: 3, whiteSpace: "pre-wrap" as const, lineHeight: 1.5 }}>
          {line.content}
        </span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="File Diff Viewer"
          className="fixed inset-0 z-[200] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ background: "rgba(7,8,16,0.94)", backdropFilter: "blur(18px)" }}
        >
          {/* Top accent gradient */}
          <div className="h-[2px] flex-shrink-0" style={{ background: `linear-gradient(90deg, ${T.emerald}, ${T.cyan}, ${T.violet}, ${T.rose})` }} />

          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-5 py-2 flex-shrink-0"
            style={{ background: T.bgPanel, borderBottom: `1px solid ${T.border}` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${T.emerald}20, ${T.cyan}15)`, border: `1px solid ${T.emerald}20` }}>
                <GitMerge size={15} color={T.emerald} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, fontFamily: T.mono }}>
                    S4_034AEECB_trait_Evil.xml
                  </span>
                  <Badge color={T.emerald} bg={T.emeraldDim}>+{TOTAL_ADDITIONS}</Badge>
                  <Badge color={T.rose} bg={T.roseDim}>−{TOTAL_DELETIONS}</Badge>
                  <Badge color={T.textTertiary} bg="rgba(255,255,255,0.04)">{DIFF_HUNKS.length} hunks</Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <GitBranch size={9} color={T.textMuted} />
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>HEAD (v1.2.0)</span>
                  <span style={{ color: T.textDim, fontSize: 9 }}>→</span>
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.cyan }}>Working Tree</span>
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>· JPE_Project/src/tuning/</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${T.borderSubtle}` }}>
                {([["split", "Side-by-Side", ArrowLeftRight] as const, ["unified", "Unified", AlignLeft] as const]).map(([key, label, Icon]) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 transition-colors"
                    style={{
                      fontSize: 10, fontFamily: T.mono, fontWeight: viewMode === key ? 700 : 500,
                      color: viewMode === key ? T.cyan : T.textMuted,
                      background: viewMode === key ? T.cyanDim : "transparent",
                    }}
                  >
                    <Icon size={10} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Hunk navigation */}
              <div className="flex items-center gap-1 rounded-lg px-1" style={{ border: `1px solid ${T.borderSubtle}` }}>
                <button
                  onClick={() => goHunk(-1)}
                  disabled={currentHunk === 0}
                  className="p-1 rounded transition-colors"
                  style={{ color: currentHunk === 0 ? T.textDim : T.textSecondary }}
                  title="Previous hunk (Alt+↑)"
                >
                  <ChevronUp size={13} />
                </button>
                <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, minWidth: 52, textAlign: "center" }}>
                  {currentHunk + 1} / {DIFF_HUNKS.length}
                </span>
                <button
                  onClick={() => goHunk(1)}
                  disabled={currentHunk === DIFF_HUNKS.length - 1}
                  className="p-1 rounded transition-colors"
                  style={{ color: currentHunk === DIFF_HUNKS.length - 1 ? T.textDim : T.textSecondary }}
                  title="Next hunk (Alt+↓)"
                >
                  <ChevronDown size={13} />
                </button>
              </div>

              <button
                onClick={copyDiff}
                className="p-1.5 rounded-md transition-all"
                style={{ color: copied ? T.emerald : T.textMuted, background: "rgba(255,255,255,0.03)" }}
                title="Copy diff"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-md transition-all"
                style={{ color: T.textMuted, background: "rgba(255,255,255,0.03)" }}
                aria-label="Close diff viewer"
                title="Close (Esc)"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ── Stats bar ── */}
          <div className="flex items-center gap-4 px-5 py-1.5 flex-shrink-0" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.borderSubtle}` }}>
            {/* Visual stat bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 rounded-full overflow-hidden" style={{ width: 140, background: T.bgInput }}>
                <div style={{ width: `${addPct}%`, background: T.emerald, transition: "width 0.4s ease" }} />
                <div style={{ flex: 1, background: T.rose }} />
              </div>
              <span style={{ fontSize: 9, fontFamily: T.mono }}>
                <span style={{ color: T.emerald }}>+{TOTAL_ADDITIONS}</span>
                <span style={{ color: T.textDim }}> / </span>
                <span style={{ color: T.rose }}>−{TOTAL_DELETIONS}</span>
              </span>
            </div>

            {/* Hunk jump pills */}
            <div className="flex items-center gap-1">
              {DIFF_HUNKS.map((h, hi) => (
                <button
                  key={h.id}
                  onClick={() => { setCurrentHunk(hi); hunkRefs.current[hi]?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                  className="px-2 py-0.5 rounded-md transition-colors"
                  style={{
                    fontSize: 9, fontFamily: T.mono, fontWeight: 700,
                    color: currentHunk === hi ? T.cyan : T.textDim,
                    background: currentHunk === hi ? T.cyanDim : "rgba(255,255,255,0.02)",
                    border: `1px solid ${currentHunk === hi ? `${T.cyan}30` : T.borderSubtle}`,
                  }}
                  title={`Jump to ${h.header}`}
                >
                  H{hi + 1}
                </button>
              ))}
            </div>

            <div className="flex-1" />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>
              Tab: toggle mode · Alt+↑↓: navigate · Click line to annotate · Esc: close
            </span>
          </div>

          {/* ── Column headers (split only) ── */}
          {viewMode === "split" && (
            <div className="flex flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
              <div className="flex-1 flex items-center gap-2 px-4 py-1.5" style={{ borderRight: `1px solid ${T.border}` }}>
                <GitCommit size={11} color={T.textMuted} />
                <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textSecondary }}>HEAD (v1.2.0)</span>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>origin/main</span>
                <Badge color={T.rose} bg={T.roseDim}>−{TOTAL_DELETIONS}</Badge>
              </div>
              <div className="flex-1 flex items-center gap-2 px-4 py-1.5">
                <GitCommit size={11} color={T.cyan} />
                <span style={{ fontSize: 11, fontFamily: T.mono, color: T.cyan }}>Working Tree</span>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>modified</span>
                <Badge color={T.emerald} bg={T.emeraldDim}>+{TOTAL_ADDITIONS}</Badge>
              </div>
            </div>
          )}

          {/* ── Diff Content ── */}
          <div className="flex-1 overflow-y-auto select-text" style={{ fontFamily: T.mono }}>
            {DIFF_HUNKS.map((hunk, hi) => {
              const isCurrent = currentHunk === hi;
              const pairs = buildPairs(hunk.lines);

              return (
                <div
                  key={hunk.id}
                  ref={el => { hunkRefs.current[hi] = el; }}
                  style={{
                    outlineOffset: -1,
                    outline: isCurrent ? `1px solid ${T.cyan}20` : "none",
                    transition: "outline 0.2s",
                  }}
                >
                  {/* Hunk header */}
                  <button
                    className="w-full flex items-center gap-3 px-4 py-1.5 text-left transition-colors group"
                    style={{ background: T.bgElevated, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}
                    onClick={() => { setCurrentHunk(hi); }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.bgElevated; }}
                  >
                    <Hash size={10} color={isCurrent ? T.cyan : T.textMuted} />
                    <span style={{ fontSize: 10, fontFamily: T.mono, color: isCurrent ? T.cyan : T.textTertiary, fontWeight: 700 }}>
                      {hunk.header}
                    </span>
                    <div className="flex-1" />
                    {isCurrent && (
                      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim, background: T.cyanDim, padding: "1px 6px", borderRadius: 4 }}>
                        current
                      </span>
                    )}
                    <ChevronsUpDown size={9} color={T.textDim} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  {/* Lines */}
                  {viewMode === "split" ? (
                    pairs.map((pair, pi) => (
                      <div
                        key={pi}
                        className="flex"
                        style={{ minHeight: 22, borderBottom: `1px solid rgba(255,255,255,0.012)` }}
                      >
                        <LineCell line={pair.left} side="left" />
                        <LineCell line={pair.right} side="right" />
                      </div>
                    ))
                  ) : (
                    hunk.lines.map(line => {
                      const s = lineStyle(line.type);
                      const isSel = selectedLine === line.id;
                      return (
                        <div
                          key={line.id}
                          className="flex items-start cursor-pointer transition-all"
                          style={{
                            background: isSel ? `${T.cyan}08` : s.bg,
                            borderLeft: `3px solid ${isSel ? T.cyan : s.border}`,
                            minHeight: 22,
                            borderBottom: `1px solid rgba(255,255,255,0.012)`,
                          }}
                          onClick={() => setSelectedLine(isSel ? null : line.id)}
                        >
                          <span className="flex-shrink-0 select-none text-right" style={{ fontSize: 11, fontFamily: T.mono, width: 36, color: T.textDim, paddingTop: 3, paddingLeft: 4, paddingRight: 6 }}>
                            {line.oldNum ?? ""}
                          </span>
                          <span className="flex-shrink-0 select-none text-right" style={{ fontSize: 11, fontFamily: T.mono, width: 36, color: T.textDim, paddingTop: 3, paddingRight: 6 }}>
                            {line.newNum ?? ""}
                          </span>
                          <span className="flex-shrink-0 select-none" style={{ fontSize: 11, fontFamily: T.mono, width: 16, color: s.text, paddingTop: 3, textAlign: "center" as const }}>
                            {s.prefix}
                          </span>
                          <span className="flex-1 px-1 break-all" style={{ fontSize: 11, fontFamily: T.mono, color: line.type === "added" ? T.emerald : line.type === "removed" ? T.rose : T.textSecondary, paddingTop: 3, paddingBottom: 3, whiteSpace: "pre-wrap" as const, lineHeight: 1.5 }}>
                            {line.content}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}

            {/* Footer */}
            <div className="flex items-center justify-center gap-8 px-4 py-10" style={{ borderTop: `1px solid ${T.border}` }}>
              {[
                { color: T.emerald, label: `+${TOTAL_ADDITIONS} additions` },
                { color: T.rose,    label: `−${TOTAL_DELETIONS} deletions` },
                { color: T.textDim, label: `${DIFF_HUNKS.length} hunks` },
                { color: T.cyan,    label: "1 file changed" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
