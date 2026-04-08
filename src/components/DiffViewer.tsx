"use client";

/* ─────────────────────────────────────────────────────────────
   JPE Studio — Phase 24 — DiffViewer
   Side-by-side XML diff viewer for Sims 4 mod conflict analysis.
   Uses conflictFiles data from jpe-data.ts.
   ───────────────────────────────────────────────────────────── */
import { useState, useRef, useEffect, useCallback } from "react";
import {
  GitMerge, ChevronUp, ChevronDown, AlertTriangle, Info,
  XCircle, Eye, Columns, AlignLeft, Copy, CheckCircle2,
  ExternalLink, Hash, Layers, FileCode, Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { conflictFiles, type ConflictFile, type ConflictRegion } from "./robust/jpe-data";
import { Eyebrow, Badge } from "./robust/jpe-shared";

/* ── Helpers ─────────────────────────────────────────────────── */
function isLineInRegion(lineNum: number, regions: ConflictRegion[]): ConflictRegion | null {
  return regions.find(r => lineNum >= r.startLine && lineNum <= r.endLine) ?? null;
}

const regionColors: Record<ConflictRegion["type"], { bg: string; border: string; text: string; badge: string }> = {
  conflict: { bg: "rgba(252,129,129,0.06)", border: "rgba(252,129,129,0.25)", text: T.rose,    badge: "CONFLICT" },
  warning:  { bg: "rgba(246,173,85,0.06)",  border: "rgba(246,173,85,0.25)",  text: T.amber,   badge: "WARN" },
  info:     { bg: "rgba(139,92,246,0.06)",  border: "rgba(139,92,246,0.25)",  text: T.violet,  badge: "INFO" },
};

const RegionIcon = ({ type }: { type: ConflictRegion["type"] }) => {
  if (type === "conflict") return <XCircle size={10} color={T.rose} />;
  if (type === "warning")  return <AlertTriangle size={10} color={T.amber} />;
  return <Info size={10} color={T.violet} />;
};

function syntaxColor(text: string, lineType: string): string {
  if (lineType === "comment") return T.textMuted;
  if (text.startsWith("<?") || text.startsWith("</") || text.startsWith("<L") || text.startsWith("<V") || text.startsWith("<I") || text.startsWith("</"))
    return T.cyan;
  if (text.includes('n="') && text.includes(">") && !text.startsWith("<!--"))
    return T.violetBright;
  return T.textSecondary;
}

/* ── Single diff pane ───────────────────────────────────────────*/
interface DiffPaneProps {
  file: ConflictFile;
  side: "left" | "right";
  activeRegionIdx: number | null;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  suppressedLines: Set<number>;
}

function DiffPane({ file, side, activeRegionIdx, scrollRef, onScroll, suppressedLines }: DiffPaneProps) {
  const lines = side === "left" ? file.leftLines : file.rightLines;
  const mod   = side === "left" ? file.leftMod   : file.rightMod;

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden" style={{ borderRight: side === "left" ? `1px solid ${T.border}` : undefined }}>
      {/* Pane header */}
      <div className="flex items-center gap-2.5 px-4 py-2 flex-shrink-0" style={{ background: `${mod.color}06`, borderBottom: `1px solid ${mod.color}20` }}>
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: `${mod.color}14`, border: `1px solid ${mod.color}25` }}>
          <FileCode size={10} color={mod.color} />
        </div>
        <div className="flex-1 min-w-0">
          <span style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary }}>{mod.name}</span>
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, marginLeft: 6 }}>v{mod.version}</span>
          <span style={{ fontSize: 9, color: T.textDim, marginLeft: 4 }}>by {mod.author}</span>
        </div>
        <span style={{ fontSize: 9, fontFamily: T.mono, color: mod.color }}>{side === "left" ? "BASE" : "THEIRS"}</span>
      </div>

      {/* Code lines */}
      <div
        ref={scrollRef as React.RefObject<HTMLDivElement>}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto overflow-x-auto"
        style={{ fontFamily: T.mono, fontSize: 12 }}
      >
        {lines.map((line, idx) => {
          const region = isLineInRegion(line.num, file.conflicts);
          const isActiveRegion = region !== null && file.conflicts.indexOf(region) === activeRegionIdx;
          const isSuppressed = suppressedLines.has(line.num);
          const rc = region ? regionColors[region.type] : null;
          const color = isSuppressed ? T.textDim : syntaxColor(line.text, line.type);

          return (
            <div
              key={idx}
              className="flex items-stretch"
              style={{
                background: isActiveRegion
                  ? rc?.bg
                  : region
                    ? `${rc?.bg}` + "88"
                    : "transparent",
                borderLeft: region
                  ? `2px solid ${isActiveRegion ? rc?.border : rc?.border + "55"}`
                  : "2px solid transparent",
                opacity: isSuppressed ? 0.35 : 1,
                transition: "background 0.15s",
              }}
            >
              {/* Line number */}
              <div className="flex items-center justify-end px-3 select-none flex-shrink-0"
                style={{ width: 40, fontSize: 10, color: region ? rc?.text + "80" : T.textDim, background: region ? `${rc?.bg}` : "rgba(0,0,0,0.15)", borderRight: `1px solid ${region ? rc?.border + "30" : T.borderSubtle}`, minHeight: 22 }}>
                {line.num}
              </div>
              {/* Code */}
              <div className="flex-1 px-3 py-0.5 whitespace-pre" style={{ color, fontSize: 11.5, lineHeight: "22px" }}>
                {line.text || "\u00A0"}
              </div>
            </div>
          );
        })}
        {/* spacer */}
        <div style={{ height: 120 }} />
      </div>
    </div>
  );
}

/* ── Conflict region list panel ─────────────────────────────── */
function ConflictList({ file, activeIdx, onSelect }: { file: ConflictFile; activeIdx: number | null; onSelect: (i: number) => void }) {
  return (
    <div className="flex flex-col gap-1 px-3 py-2" style={{ overflowY: "auto", maxHeight: "100%" }}>
      {file.conflicts.map((r, i) => {
        const rc = regionColors[r.type];
        const isAct = i === activeIdx;
        return (
          <button
            key={r.id}
            onClick={() => onSelect(i)}
            className="w-full text-left rounded-lg px-3 py-2 transition-all"
            style={{
              background: isAct ? rc.bg : "transparent",
              border: `1px solid ${isAct ? rc.border : T.borderSubtle}`,
            }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <RegionIcon type={r.type} />
              <span style={{ fontSize: 9, fontWeight: 700, color: rc.text, fontFamily: T.mono, letterSpacing: "0.06em" }}>{rc.badge}</span>
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim, marginLeft: "auto" }}>L{r.startLine}{r.endLine !== r.startLine ? `–${r.endLine}` : ""}</span>
            </div>
            <p style={{ fontSize: 10, color: isAct ? T.textSecondary : T.textMuted, lineHeight: 1.4 }}>{r.description}</p>
          </button>
        );
      })}
    </div>
  );
}

/* ══ DiffViewer Main ═══════════════════════════════════════════ */
interface DiffViewerProps {
  onOpenConflictWizard?: () => void;
  initialFileId?: string;
}

export function DiffViewer({ onOpenConflictWizard, initialFileId }: DiffViewerProps) {
  const [activeFileId, setActiveFileId] = useState(initialFileId ?? conflictFiles[0].id);
  const [activeRegionIdx, setActiveRegionIdx] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [showPanel, setShowPanel] = useState(true);
  const [copiedLine, setCopiedLine] = useState<string | null>(null);
  const [suppressedLines] = useState(new Set<number>());

  const leftScrollRef  = useRef<HTMLDivElement | null>(null);
  const rightScrollRef = useRef<HTMLDivElement | null>(null);
  const syncingRef     = useRef(false);

  const file = conflictFiles.find(f => f.id === activeFileId) ?? conflictFiles[0];

  /* Sync scroll */
  const handleLeftScroll  = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (rightScrollRef.current) rightScrollRef.current.scrollTop = (e.target as HTMLDivElement).scrollTop;
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  const handleRightScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (leftScrollRef.current)  leftScrollRef.current.scrollTop  = (e.target as HTMLDivElement).scrollTop;
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  /* Jump to region */
  const jumpToRegion = useCallback((idx: number) => {
    setActiveRegionIdx(idx);
    const region = file.conflicts[idx];
    if (!region) return;
    const lineH = 22;
    const offset = (region.startLine - 4) * lineH;
    const scrollTo = Math.max(0, offset);
    leftScrollRef.current?.scrollTo({ top: scrollTo, behavior: "smooth" });
    rightScrollRef.current?.scrollTo({ top: scrollTo, behavior: "smooth" });
  }, [file.conflicts]);

  /* Keyboard navigation */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowDown") {
        e.preventDefault();
        setActiveRegionIdx(p => {
          const next = p === null ? 0 : Math.min(file.conflicts.length - 1, p + 1);
          jumpToRegion(next);
          return next;
        });
      }
      if (e.altKey && e.key === "ArrowUp") {
        e.preventDefault();
        setActiveRegionIdx(p => {
          const prev = p === null ? 0 : Math.max(0, p - 1);
          jumpToRegion(prev);
          return prev;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [file.conflicts.length, jumpToRegion]);

  const conflictCount = file.conflicts.filter(r => r.type === "conflict").length;
  const warningCount  = file.conflicts.filter(r => r.type === "warning").length;
  const infoCount     = file.conflicts.filter(r => r.type === "info").length;
  const maxLines      = Math.max(file.leftLines.length, file.rightLines.length);

  const severityColor = file.severity === "critical" ? T.rose : file.severity === "major" ? T.amber : T.violet;

  const copyPath = useCallback(() => {
    navigator.clipboard?.writeText(file.filename).catch(() => {});
    setCopiedLine(file.filename);
    setTimeout(() => setCopiedLine(null), 1500);
  }, [file.filename]);

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <GitMerge size={14} color={T.rose} />
          <Eyebrow color={T.textPrimary}>DIFF VIEWER</Eyebrow>
          <div className="w-px h-4" style={{ background: T.border }} />
          <Badge color={severityColor} bg={`${severityColor}10`}>{(file?.severity || "major").toUpperCase()}</Badge>
          {conflictCount > 0 && <Badge color={T.rose} bg={T.roseDim}>{conflictCount} conflict{conflictCount > 1 ? "s" : ""}</Badge>}
          {warningCount  > 0 && <Badge color={T.amber} bg={T.amberDim}>{warningCount} warn{warningCount > 1 ? "s" : ""}</Badge>}
          {infoCount     > 0 && <Badge color={T.violet} bg={T.violetDim}>{infoCount} note{infoCount > 1 ? "s" : ""}</Badge>}
          <div className="w-px h-4" style={{ background: T.border }} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{maxLines} lines · {file.resource} · {file.instance}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-md overflow-hidden" style={{ border: `1px solid ${T.borderSubtle}` }}>
            {([["split", Columns, "Split"], ["unified", AlignLeft, "Unified"]] as const).map(([key, Icon, label]) => (
              <button key={key} onClick={() => setViewMode(key)}
                className="flex items-center gap-1.5 px-2.5 py-1 transition-colors"
                style={{ background: viewMode === key ? T.cyanDim : "transparent", color: viewMode === key ? T.cyan : T.textMuted, fontSize: 10 }}>
                <Icon size={10} />{label}
              </button>
            ))}
          </div>

          {/* Region navigation */}
          <div className="flex items-center rounded-md overflow-hidden" style={{ border: `1px solid ${T.borderSubtle}` }}>
            <button onClick={() => {
              const prev = activeRegionIdx === null ? 0 : Math.max(0, activeRegionIdx - 1);
              jumpToRegion(prev);
            }} className="px-2 py-1 transition-colors hover:bg-white/5" title="Previous conflict (Alt+↑)">
              <ChevronUp size={12} color={T.textMuted} />
            </button>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, padding: "0 6px", borderLeft: `1px solid ${T.borderSubtle}`, borderRight: `1px solid ${T.borderSubtle}` }}>
              {activeRegionIdx !== null ? activeRegionIdx + 1 : "–"}/{file.conflicts.length}
            </span>
            <button onClick={() => {
              const next = activeRegionIdx === null ? 0 : Math.min(file.conflicts.length - 1, activeRegionIdx + 1);
              jumpToRegion(next);
            }} className="px-2 py-1 transition-colors hover:bg-white/5" title="Next conflict (Alt+↓)">
              <ChevronDown size={12} color={T.textMuted} />
            </button>
          </div>

          <div className="w-px h-4" style={{ background: T.border }} />
          <button onClick={() => setShowPanel(p => !p)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all"
            style={{ fontSize: 10, color: showPanel ? T.violet : T.textMuted, background: showPanel ? T.violetDim : "transparent", border: `1px solid ${showPanel ? T.borderViolet : "transparent"}` }}>
            <Layers size={10} /> Issues
          </button>
          {onOpenConflictWizard && (
            <button onClick={onOpenConflictWizard}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all"
              style={{ fontSize: 10, color: T.rose, background: T.roseDim, border: `1px solid rgba(252,129,129,0.2)` }}>
              <Shield size={10} /> Resolve
            </button>
          )}
        </div>
      </div>

      {/* ── File tabs ── */}
      <div className="flex items-center flex-shrink-0 overflow-x-auto" style={{ background: T.bgPanel, borderBottom: `1px solid ${T.border}` }}>
        {conflictFiles.map(cf => {
          const isAct = cf.id === activeFileId;
          const fc = cf.severity === "critical" ? T.rose : cf.severity === "major" ? T.amber : T.violet;
          return (
            <button
              key={cf.id}
              onClick={() => { setActiveFileId(cf.id); setActiveRegionIdx(0); }}
              className="flex items-center gap-2 px-4 py-2 flex-shrink-0 border-b-2 transition-all"
              style={{
                borderBottomColor: isAct ? fc : "transparent",
                background: isAct ? `${fc}08` : "transparent",
                color: isAct ? T.textPrimary : T.textMuted,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: fc, opacity: isAct ? 1 : 0.5 }} />
              <span style={{ fontSize: 11, fontFamily: T.mono, fontWeight: isAct ? 600 : 400 }}>{(cf.filename || "unknown_file").split("_").slice(1).join("_")}</span>
              <span style={{ fontSize: 8, fontFamily: T.mono, color: fc, marginLeft: 2 }}>{cf.conflicts.length}</span>
            </button>
          );
        })}

        {/* File path + copy */}
        <div className="ml-auto flex items-center gap-2 px-3">
          <button onClick={copyPath} className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            {copiedLine ? <CheckCircle2 size={10} color={T.emerald} /> : <Copy size={10} color={T.textMuted} />}
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{file.filename}</span>
          </button>
          <Hash size={9} color={T.textDim} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{file.instance}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">

        {/* Issue panel */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 264, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex-shrink-0 flex flex-col overflow-hidden"
              style={{ borderRight: `1px solid ${T.border}`, background: T.bgPanel }}
            >
              <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
                <Eye size={11} color={T.violet} />
                <span style={{ fontSize: 10, fontWeight: 700, color: T.textSecondary, letterSpacing: "0.06em" }}>CONFLICT REGIONS</span>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim, marginLeft: "auto" }}>{file.conflicts.length} found</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ConflictList file={file} activeIdx={activeRegionIdx} onSelect={jumpToRegion} />
              </div>

              {/* Active region detail */}
              {activeRegionIdx !== null && file.conflicts[activeRegionIdx] && (() => {
                const r = file.conflicts[activeRegionIdx];
                const rc = regionColors[r.type];
                return (
                  <div className="px-3 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: rc.bg }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <RegionIcon type={r.type} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: rc.text, fontFamily: T.mono }}>
                        Lines {r.startLine}–{r.endLine}
                      </span>
                    </div>
                    <p style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.5 }}>{r.description}</p>
                    {onOpenConflictWizard && (
                      <button onClick={onOpenConflictWizard}
                        className="mt-2 flex items-center gap-1.5 w-full justify-center py-1 rounded-md transition-all"
                        style={{ fontSize: 10, color: rc.text, border: `1px solid ${rc.border}`, background: rc.bg }}>
                        <ExternalLink size={9} /> Open Conflict Wizard
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Keyboard shortcut hint */}
              <div className="px-3 py-1.5 flex-shrink-0" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textDim }}>Alt+↑↓ to navigate regions</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Diff panes */}
        {viewMode === "split" ? (
          <div className="flex flex-1 min-w-0 min-h-0">
            <DiffPane
              file={file} side="left"
              activeRegionIdx={activeRegionIdx}
              scrollRef={leftScrollRef}
              onScroll={handleLeftScroll}
              suppressedLines={suppressedLines}
            />
            <DiffPane
              file={file} side="right"
              activeRegionIdx={activeRegionIdx}
              scrollRef={rightScrollRef}
              onScroll={handleRightScroll}
              suppressedLines={suppressedLines}
            />
          </div>
        ) : (
          /* Unified view */
          <UnifiedDiffPane file={file} activeRegionIdx={activeRegionIdx} />
        )}
      </div>

      {/* ── Status bar ── */}
      <div className="flex items-center gap-4 px-4 py-1.5 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: file.leftMod.color }} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{file.leftMod.name} v{file.leftMod.version}</span>
        </div>
        <span style={{ fontSize: 9, color: T.textDim }}>vs</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: file.rightMod.color }} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{file.rightMod.name} v{file.rightMod.version}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <XCircle size={9} color={T.rose} />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{conflictCount} conflicts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={9} color={T.amber} />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{warningCount} warnings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Info size={9} color={T.violet} />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{infoCount} notes</span>
          </div>
          <div className="w-px h-3" style={{ background: T.border }} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{maxLines} lines</span>
        </div>
      </div>
    </div>
  );
}

/* ── Unified Diff pane ─────────────────────────────────────────*/
function UnifiedDiffPane({ file, activeRegionIdx }: { file: ConflictFile; activeRegionIdx: number | null }) {
  // Interleave left/right lines, marking changed hunks
  const maxLen = Math.max(file.leftLines.length, file.rightLines.length);
  const rows: { lineNum: number; leftText: string; rightText: string; changed: boolean; region: ConflictRegion | null }[] = [];
  for (let i = 0; i < maxLen; i++) {
    const l = file.leftLines[i];
    const r = file.rightLines[i];
    const lineNum = (l?.num ?? r?.num) ?? i + 1;
    const lt = l?.text ?? "";
    const rt = r?.text ?? "";
    const region = isLineInRegion(lineNum, file.conflicts);
    rows.push({ lineNum, leftText: lt, rightText: rt, changed: lt !== rt, region });
  }

  return (
    <div className="flex-1 overflow-auto" style={{ fontFamily: T.mono }}>
      <table className="w-full" style={{ borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
            <th style={{ width: 36, fontSize: 9, color: T.textDim, fontWeight: 600, padding: "4px 8px", textAlign: "right" }}>L</th>
            <th style={{ width: "50%", fontSize: 9, color: file.leftMod.color, fontWeight: 600, padding: "4px 12px", textAlign: "left" }}>{file.leftMod.name}</th>
            <th style={{ width: 36, fontSize: 9, color: T.textDim, fontWeight: 600, padding: "4px 8px", textAlign: "right" }}>R</th>
            <th style={{ width: "50%", fontSize: 9, color: file.rightMod.color, fontWeight: 600, padding: "4px 12px", textAlign: "left" }}>{file.rightMod.name}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isAct = row.region && file.conflicts.indexOf(row.region) === activeRegionIdx;
            const rc = row.region ? regionColors[row.region.type] : null;
            const bg = isAct ? rc?.bg : row.changed ? "rgba(255,255,255,0.015)" : "transparent";
            return (
              <tr key={i} style={{ background: bg, borderLeft: row.region ? `2px solid ${rc?.border}` : "2px solid transparent" }}>
                <td style={{ fontSize: 9, color: T.textDim, padding: "0 8px", textAlign: "right", borderRight: `1px solid ${T.borderSubtle}`, lineHeight: "22px" }}>{row.lineNum}</td>
                <td style={{ padding: "0 12px", whiteSpace: "pre", color: row.changed ? file.leftMod.color : T.textSecondary, lineHeight: "22px" }}>{row.leftText || "\u00A0"}</td>
                <td style={{ fontSize: 9, color: T.textDim, padding: "0 8px", textAlign: "right", borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.borderSubtle}`, lineHeight: "22px" }}>{row.lineNum}</td>
                <td style={{ padding: "0 12px", whiteSpace: "pre", color: row.changed ? file.rightMod.color : T.textSecondary, lineHeight: "22px" }}>{row.rightText || "\u00A0"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ height: 80 }} />
    </div>
  );
}

export default DiffViewer;
