"use client";

/* ─────────────────────────────────────────────────────────────
   JPE Studio — Edit History Panel (Phase 13)
   Global undo/redo timeline with visual branch indicator
   ───────────────────────────────────────────────────────────── */
import {
  useState, useEffect, useCallback, useRef,
  createContext, useContext, type ReactNode,
} from "react";
import {
  RotateCcw, RotateCw, Clock, X, Trash2, FileCode,
  Sparkles, Languages, Shield, Wand2, Code2, Hash,
  CornerDownRight, Bookmark, Download,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════
   EDIT HISTORY CONTEXT
   ═══════════════════════════════════════════════════════════════ */
export interface HistoryEntry {
  id: string;
  action: string;
  detail: string;
  file: string;
  type: "edit" | "format" | "translate" | "build" | "refactor" | "validate" | "delete" | "create";
  timestamp: Date;
  size?: number;       // bytes changed
  lineRange?: [number, number];
}

interface EditHistoryContextType {
  history: HistoryEntry[];
  cursor: number;       // current position (0 = latest)
  canUndo: boolean;
  canRedo: boolean;
  pushEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  jumpTo: (index: number) => void;
}

const EditHistoryCtx = createContext<EditHistoryContextType | null>(null);

export function useEditHistory() {
  const ctx = useContext(EditHistoryCtx);
  if (!ctx) throw new Error("useEditHistory must be used inside EditHistoryProvider");
  return ctx;
}

/* Demo entries seeded on mount */
function makeDemo(): HistoryEntry[] {
  const now = Date.now();
  const entries: Omit<HistoryEntry, "id" | "timestamp">[] = [
    { action: "Quick-fix applied",         detail: "Fixed missing closing tag on line 14",           file: "hug_friend.jpe",             type: "refactor",  lineRange: [14, 14], size: 38  },
    { action: "Inline edit",               detail: "Updated 'display_name' STBL hash reference",    file: "hug_friend.jpe",             type: "edit",      lineRange: [9, 9],   size: 22  },
    { action: "Batch translate",           detail: "Auto-translated 32 strings → ja_JP",            file: "ja_JP.stbl",                  type: "translate",                      size: 1840 },
    { action: "Schema validated",          detail: "trait_Evil.xml — 42 nodes verified",            file: "S4_034AEECB_trait_Evil.xml",  type: "validate",                       size: 0   },
    { action: "Format on save",            detail: "Re-indented 18 XML blocks",                     file: "S4_034AEECB_trait_Evil.xml",  type: "format",    lineRange: [1, 32],  size: 164 },
    { action: "AI auto-complete",          detail: "Inserted 'EmotionOutcome' block from suggestion",file: "hug_friend.jpe",            type: "edit",      lineRange: [22, 27], size: 112 },
    { action: "Rename",                    detail: "trait_Neutral → trait_Balanced",                file: "S4_034AEECB_trait_Evil.xml",  type: "refactor",                       size: 54  },
    { action: "STBL export",               detail: "Exported 48 strings to en_US.stbl",             file: "en_US.stbl",                  type: "build",                          size: 2048 },
    { action: "Dependency resolved",       detail: "Core Mod Framework v2.4 linked",               file: "manifest.json",              type: "create",                         size: 0   },
    { action: "XML attribute added",       detail: "Added 'conflicting_traits' list — 2 entries",   file: "S4_034AEECB_trait_Evil.xml",  type: "edit",      lineRange: [11, 14], size: 88  },
    { action: "Inline edit",               detail: "Changed 'buff_Evil_Aura' effect intensity",     file: "hug_friend.jpe",             type: "edit",      lineRange: [20, 20], size: 14  },
    { action: "Build started",             detail: "JPE → XML compilation triggered",               file: "hug_friend.jpe",             type: "build",                          size: 0   },
    { action: "Quick-fix applied",         detail: "Replaced deprecated 'ClassName' with 'Type'",  file: "S4_034AEECB_trait_Evil.xml",  type: "refactor",  lineRange: [3, 3],   size: 20  },
    { action: "Session restored",          detail: "Draft restored from auto-save checkpoint",      file: "hug_friend.jpe",             type: "create",                         size: 0   },
    { action: "Delete line",               detail: "Removed orphan closing tag on line 7",          file: "hug_friend.jpe",             type: "delete",    lineRange: [7, 7],   size: -12 },
    { action: "Format on save",            detail: "Normalised 6 STBL hash formats",                file: "en_US.stbl",                  type: "format",                         size: 48  },
    { action: "AI refactor",               detail: "Extracted nested block to named component",     file: "hug_friend.jpe",             type: "refactor",  lineRange: [15, 24], size: 220 },
    { action: "Inline translate",          detail: "Translated line 26 to de_DE",                   file: "de_DE.stbl",                  type: "translate",                      size: 61  },
    { action: "Resource key updated",      detail: "S4_2F7D0004_00000001 → S4_2F7D0004_00000003",  file: "S4_034AEECB_trait_Evil.xml",  type: "edit",      lineRange: [15, 16], size: 8   },
    { action: "Build complete",            detail: "Build #42 — all 5 stages passed (12.3s)",       file: "Evil_Trait.package",          type: "build",                          size: 152640 },
  ];
  return entries.map((e, i) => ({
    ...e,
    id: `h-${i}-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date(now - (entries.length - i) * 47000 - Math.random() * 30000),
  }));
}

export function EditHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>(() => makeDemo());
  const [cursor, setCursor] = useState(0); // 0 = tip

  const canUndo = cursor < history.length - 1;
  const canRedo = cursor > 0;

  const pushEntry = useCallback((entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    const e: HistoryEntry = {
      ...entry,
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
    };
    setHistory(prev => [e, ...prev.slice(cursor)]); // truncate redo branch
    setCursor(0);
  }, [cursor]);

  const undo = useCallback(() => {
    if (!canUndo) return;
    setCursor(c => c + 1);
    toast.info("Undo", { description: history[cursor]?.action });
  }, [canUndo, cursor, history]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    setCursor(c => c - 1);
    toast.info("Redo", { description: history[cursor - 1]?.action });
  }, [canRedo, cursor, history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCursor(0);
    toast.info("History cleared");
  }, []);

  const jumpTo = useCallback((index: number) => {
    setCursor(index);
    toast.info(`Jumped to: ${history[index]?.action}`);
  }, [history]);

  /* Keyboard undo/redo */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.shiftKey && e.key === "z" || e.key === "y")) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  return (
    <EditHistoryCtx.Provider value={{ history, cursor, canUndo, canRedo, pushEntry, undo, redo, clearHistory, jumpTo }}>
      {children}
    </EditHistoryCtx.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HISTORY PANEL UI
   ═══════════════════════════════════════════════════════════════ */
const TYPE_STYLES: Record<HistoryEntry["type"], { color: string; icon: typeof Clock; label: string }> = {
  edit:      { color: T.cyan,        icon: Code2,       label: "Edit"     },
  format:    { color: T.textMuted,   icon: Hash,        label: "Format"   },
  translate: { color: T.violet,      icon: Languages,   label: "Translate"},
  build:     { color: T.amber,       icon: Shield,      label: "Build"    },
  refactor:  { color: T.emerald,     icon: Wand2,       label: "Refactor" },
  validate:  { color: T.cyanBright,  icon: Shield,      label: "Validate" },
  delete:    { color: T.rose,        icon: Trash2,      label: "Delete"   },
  create:    { color: T.violetBright,icon: Sparkles,    label: "Create"   },
};

function fmtTime(d: Date): string {
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtBytes(b: number | undefined): string {
  if (b === undefined || b === 0) return "";
  const sign = b < 0 ? "-" : "+";
  const abs = Math.abs(b);
  if (abs < 1024) return `${sign}${abs}B`;
  return `${sign}${(abs / 1024).toFixed(1)}KB`;
}

export function EditHistoryPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { history, cursor, canUndo, canRedo, undo, redo, clearHistory, jumpTo } = useEditHistory();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<HistoryEntry["type"] | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = history.filter(e => {
    if (typeFilter && e.type !== typeFilter) return false;
    if (search.trim() && !e.action.toLowerCase().includes(search.toLowerCase()) && !e.detail.toLowerCase().includes(search.toLowerCase()) && !e.file.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleBookmark = (id: string) => setBookmarks(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const exportHistory = () => {
    const text = history.map(e =>
      `[${fmtTime(e.timestamp)}] ${e.type.toUpperCase()}: ${e.action} — ${e.file}\n  ${e.detail}`
    ).join("\n");
    navigator.clipboard.writeText(text).then(() => toast.success("History exported to clipboard"));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed z-[150] flex flex-col rounded-2xl overflow-hidden"
          initial={{ opacity: 0, x: 20, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            right: 12,
            top: 48,
            bottom: 52,
            width: 340,
            background: T.bgElevated,
            border: `1px solid ${T.border}`,
            boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)`,
          }}
        >
          {/* Top glow */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 10%, ${T.violet}80, ${T.cyan}80, transparent 90%)` }} />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <Clock size={14} color={T.violet} />
              <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, fontFamily: T.display }}>Edit History</span>
              <span className="px-1.5 py-0 rounded" style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 700, color: T.violet, background: T.violetDim }}>{history.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={exportHistory} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Export history">
                <Download size={12} color={T.textMuted} />
              </button>
              <button onClick={clearHistory} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Clear history">
                <Trash2 size={12} color={T.textMuted} />
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <X size={13} color={T.textMuted} />
              </button>
            </div>
          </div>

          {/* Undo/Redo controls */}
          <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: "rgba(0,0,0,0.1)" }}>
            <button
              onClick={undo}
              disabled={!canUndo}
              className="flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-lg transition-all disabled:opacity-30"
              style={{ background: canUndo ? T.violetDim : "rgba(255,255,255,0.02)", border: `1px solid ${canUndo ? T.borderViolet : T.borderSubtle}`, fontSize: 11, fontWeight: 700, color: canUndo ? T.violetBright : T.textMuted }}
            >
              <RotateCcw size={12} /> Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="flex items-center gap-1.5 flex-1 justify-center py-1.5 rounded-lg transition-all disabled:opacity-30"
              style={{ background: canRedo ? T.cyanDim : "rgba(255,255,255,0.02)", border: `1px solid ${canRedo ? `${T.cyan}30` : T.borderSubtle}`, fontSize: 11, fontWeight: 700, color: canRedo ? T.cyan : T.textMuted }}
            >
              <RotateCw size={12} /> Redo
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>Pos</span>
              <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: T.textSecondary }}>{cursor}</span>
            </div>
          </div>

          {/* Search + filter */}
          <div className="px-3 py-2 space-y-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
              <Search size={11} color={T.textMuted} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search history…"
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: 11, color: T.textPrimary, fontFamily: T.sans }}
              />
              {search && <button onClick={() => setSearch("")}><X size={9} color={T.textMuted} /></button>}
            </div>
            {/* Type filter chips */}
            <div className="flex flex-wrap gap-1">
              {(["edit", "translate", "build", "refactor"] as HistoryEntry["type"][]).map(t => {
                const s = TYPE_STYLES[t];
                const isActive = typeFilter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(isActive ? null : t)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md transition-all"
                    style={{
                      fontSize: 9, fontFamily: T.mono, fontWeight: 600,
                      color: isActive ? s.color : T.textMuted,
                      background: isActive ? `${s.color}12` : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isActive ? `${s.color}30` : T.borderSubtle}`,
                    }}
                  >
                    <s.icon size={9} color={isActive ? s.color : T.textMuted} />
                    {s.label}
                  </button>
                );
              })}
              {typeFilter && (
                <button onClick={() => setTypeFilter(null)} className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ fontSize: 9, color: T.textMuted, border: `1px solid ${T.borderSubtle}` }}>
                  <X size={8} /> All
                </button>
              )}
            </div>
          </div>

          {/* History timeline */}
          <div ref={listRef} className="flex-1 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <Clock size={20} color={T.textDim} />
                <span style={{ fontSize: 11, color: T.textDim }}>No history entries</span>
              </div>
            ) : filtered.map((entry, idx) => {
              const s = TYPE_STYLES[entry.type];
              const Icon = s.icon;
              const realIdx = history.indexOf(entry);
              const isCurrent = realIdx === cursor;
              const isUndo = realIdx > cursor;
              const isBookmarked = bookmarks.has(entry.id);
              const delta = fmtBytes(entry.size);

              return (
                <div key={entry.id} className="relative">
                  {/* Timeline spine */}
                  {idx < filtered.length - 1 && (
                    <div className="absolute left-[28px] top-[28px] bottom-0 w-[1px]" style={{ background: T.borderSubtle }} />
                  )}

                  <div
                    className="flex items-start gap-2 px-3 py-2 mx-1 rounded-xl cursor-pointer transition-all group relative"
                    style={{
                      background: isCurrent ? `${T.violet}08` : isUndo ? "rgba(255,255,255,0.01)" : "transparent",
                      border: isCurrent ? `1px solid ${T.borderViolet}` : "1px solid transparent",
                      opacity: isUndo ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = T.bgHover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isCurrent ? `${T.violet}08` : isUndo ? "rgba(255,255,255,0.01)" : "transparent"; }}
                    onClick={() => jumpTo(realIdx)}
                  >
                    {/* Icon node */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center relative" style={{
                      background: isCurrent ? `${s.color}15` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isCurrent ? `${s.color}40` : T.borderSubtle}`,
                      boxShadow: isCurrent ? `0 0 8px ${s.color}20` : "none",
                    }}>
                      <Icon size={12} color={isCurrent ? s.color : T.textMuted} />
                      {isCurrent && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center" style={{ background: T.violet, borderColor: T.bgElevated }}>
                          <div className="w-1 h-1 rounded-full bg-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span style={{ fontSize: 11, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? T.textPrimary : T.textSecondary }} className="truncate">{entry.action}</span>
                        <span className="flex-shrink-0 px-1 rounded" style={{ fontSize: 7, fontWeight: 700, color: s.color, background: `${s.color}10`, letterSpacing: "0.04em" }}>{s.label.toUpperCase()}</span>
                      </div>
                      <div className="truncate" style={{ fontSize: 10, color: T.textMuted }}>{entry.detail}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1">
                          <FileCode size={9} color={T.textDim} />
                          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }} className="truncate max-w-[120px]">{entry.file}</span>
                        </div>
                        {entry.lineRange && (
                          <div className="flex items-center gap-0.5">
                            <CornerDownRight size={8} color={T.textDim} />
                            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>L{entry.lineRange[0]}{entry.lineRange[0] !== entry.lineRange[1] ? `–${entry.lineRange[1]}` : ""}</span>
                          </div>
                        )}
                        {delta && (
                          <span style={{ fontSize: 9, fontFamily: T.mono, color: delta.startsWith("+") ? T.emerald : T.rose }}>{delta}</span>
                        )}
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim, whiteSpace: "nowrap" }}>{fmtTime(entry.timestamp)}</span>
                      <button
                        onClick={e => { e.stopPropagation(); toggleBookmark(entry.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                        title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                      >
                        <Bookmark size={10} color={isBookmarked ? T.amber : T.textMuted} fill={isBookmarked ? T.amber : "none"} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: "rgba(0,0,0,0.1)" }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{canUndo ? `${history.length - cursor - 1} ahead` : "At tip"}</span>
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>·</span>
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{bookmarks.size} bookmarks</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd style={{ fontSize: 8, fontFamily: T.mono, color: T.textDim, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSubtle}`, borderRadius: 3, padding: "1px 4px" }}>Ctrl+Z</kbd>
              <span style={{ fontSize: 9, color: T.textDim }}>/ redo</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EditHistoryPanel;
