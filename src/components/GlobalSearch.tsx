"use client";

/**
 * GlobalSearch — Phase 9
 * Full-featured global search & replace overlay with:
 * regex / case / whole-word toggles, file-type filter,
 * highlighted result previews, Replace/Replace-All, keyboard nav.
 */
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { T } from "./robust/jpe-theme";
import { motion, AnimatePresence, easing } from "./jpe-motion";
import {
  Search, X, ChevronDown, ChevronRight,
  FileCode, Braces, FileText, Code2, Sparkles,
  Replace, RotateCcw,
  AlertTriangle, CheckCircle2, Globe,
  Package, File, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { searchService, SearchResult } from "@/services/SearchService";
import { useProjectStore } from "@/stores/useProjectStore";
import { useEditorStore } from "@/stores/useEditorStore";
import { ModFile } from "@/types";

const EXT_COLORS: Record<string, string> = {
  xml: T.cyan, json: T.amber, stbl: T.violet, ts4script: T.emerald,
  jpe: T.violetBright, package: T.rose, md: T.textSecondary,
};

const FILE_TYPE_OPTIONS = [
  { label: "All files", value: "" },
  { label: "*.xml", value: "xml" },
  { label: "*.stbl", value: "stbl" },
  { label: "*.json", value: "json" },
  { label: "*.ts4script", value: "ts4script" },
  { label: "*.jpe", value: "jpe" },
];

const EXT_ICON: Record<string, any> = {
  xml: Code2,
  stbl: FileText,
  json: Braces,
  ts4script: Sparkles,
  jpe: Globe,
  package: Package,
  default: File,
};

/* ─── Highlight match in text ────────────────────────────────────── */
function HighlightedLine({
  text, query, isRegex, isCase,
}: { text: string; query: string; isRegex: boolean; isCase: boolean }) {
  if (!query) {
    return <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textSecondary, whiteSpace: "pre" }}>{text}</span>;
  }
  try {
    const flags = isCase ? "g" : "gi";
    const pat = isRegex ? new RegExp(query, flags) : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
    const parts: { text: string; match: boolean }[] = [];
    let lastIdx = 0;
    let m: RegExpExecArray | null;
    while ((m = pat.exec(text)) !== null) {
      if (m.index > lastIdx) parts.push({ text: text.slice(lastIdx, m.index), match: false });
      parts.push({ text: m[0], match: true });
      lastIdx = pat.lastIndex;
      if (!pat.global) break;
    }
    if (lastIdx < text.length) parts.push({ text: text.slice(lastIdx), match: false });
    if (parts.length === 0) parts.push({ text, match: false });
    return (
      <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textSecondary, whiteSpace: "pre" }}>
        {parts.map((p, i) =>
          p.match
            ? <mark key={i} style={{ background: `${T.amber}30`, color: T.amber, borderRadius: 2, padding: "0 1px" }}>{p.text}</mark>
            : <span key={i}>{p.text}</span>
        )}
      </span>
    );
  } catch {
    return <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textSecondary, whiteSpace: "pre" }}>{text}</span>;
  }
}

/* ─── Props ──────────────────────────────────────────────────────── */
interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── Component ──────────────────────────────────────────────────── */
export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const { currentProject } = useProjectStore();
  const { openTab } = useEditorStore();
  
  const [query, setQuery] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [isCase, setIsCase] = useState(false);
  const [isWord, setIsWord] = useState(false);
  const [isRegex, setIsRegex] = useState(false);
  const [fileTypeFilter, setFileTypeFilter] = useState("");
  const [collapsedFiles, setCollapsedFiles] = useState<Set<string>>(new Set());
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [replacedCount, setReplacedCount] = useState(0);
  
  /* New State for industrial search */
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDuration, setSearchDuration] = useState("");

  const queryRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* Focus on open */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => queryRef.current?.focus(), 80);
      setSelectedIdx(0);
    }
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(p => p + 1); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(p => Math.max(0, p - 1)); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  /* Search Execution Logic */
  const performSearch = useCallback(async (q: string) => {
    if (!q || !currentProject?.rootPath) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const options = {
      isRegex,
      isCase,
      isWord,
      extension: fileTypeFilter || undefined
    };

    const response = await searchService.search(currentProject.rootPath, q, options);
    
    if (response.success && response.results) {
      setResults(response.results);
      setSearchDuration(response.duration || "");
    } else if (response.error) {
      toast.error(`Search error: ${response.error}`);
    }
    
    setIsSearching(false);
  }, [currentProject?.rootPath, isRegex, isCase, isWord, fileTypeFilter]);

  /* Debounced Search */
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (!query) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, performSearch]);

  const totalMatches = results.reduce((s, r) => s + r.matches.length, 0);
  const totalFiles = results.length;

  /* Flat list of all match items for keyboard nav */
  const flatItems = useMemo(() => {
    const items: { filePath: string; lineNum: number; text: string; ext: string }[] = [];
    for (const r of results) {
      if (!collapsedFiles.has(r.file.path)) {
        for (const m of r.matches) {
          items.push({ filePath: r.file.path, lineNum: m.num, text: m.text, ext: r.file.ext });
        }
      }
    }
    return items;
  }, [results, collapsedFiles]);

  const clampedIdx = Math.max(0, Math.min(selectedIdx, flatItems.length - 1));

  const openMatch = (filePath: string, lineNum: number, ext: string) => {
    if (!currentProject) return;

    const fileName = filePath.split(/[/\\]/).pop() || "unknown";
    
    // Create / find a ModFile object for the tab
    const existingFile = currentProject.files.find(f => f.path === filePath);
    
    if (existingFile) {
      openTab({
        id: existingFile.id,
        fileId: existingFile.id,
        name: existingFile.name,
        type: existingFile.type,
        isDirty: existingFile.isDirty
      });
    } else {
      // Create a transient file object if not found
      const transId = `file-${Date.now()}`;
      openTab({
        id: transId,
        fileId: transId,
        name: fileName,
        type: (ext || 'xml') as any,
        isDirty: false
      });
    }

    onClose();
  };

  const doReplace = async (filePath: string, lineNum: number) => {
    if (!currentProject?.rootPath) return;
    
    toast.promise(
      searchService.replace(currentProject.rootPath, query, replaceText, {
        isRegex, isCase, isWord, extension: fileTypeFilter || undefined
      }),
      {
        loading: 'Replacing...',
        success: (res) => {
          if (res.success) {
            setReplacedCount(p => p + (res.totalReplacements || 1));
            performSearch(query); // Refresh results
            return `Replaced in ${filePath.split(/[/\\]/).pop()}`;
          }
          throw new Error(res.error);
        },
        error: (err) => `Replace failed: ${err.message}`
      }
    );
  };

  const doReplaceAll = async () => {
    if (!currentProject?.rootPath) return;

    toast.promise(
      searchService.replace(currentProject.rootPath, query, replaceText, {
        isRegex, isCase, isWord, extension: fileTypeFilter || undefined
      }),
      {
        loading: `Replacing all occurrences of "${query}"...`,
        success: (res) => {
          if (res.success) {
            setReplacedCount(p => p + (res.totalReplacements || 0));
            performSearch(query); // Refresh results
            return `Replaced ${res.totalReplacements} occurrences across ${res.affectedFiles} files`;
          }
          throw new Error(res.error);
        },
        error: (err) => `Replace all failed: ${err.message}`
      }
    );
  };

  const toggleFileCollapse = (path: string) => {
    setCollapsedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  };

  const RegexStatus = useMemo(() => {
    if (!isRegex || !query) return null;
    try { new RegExp(query); return "valid"; } catch { return "invalid"; }
  }, [isRegex, query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ background: "rgba(5,7,13,0.75)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed z-[201] flex flex-col"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.22, ease: easing.outStandard }}
            style={{
              top: "8vh",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(780px, 92vw)",
              maxHeight: "80vh",
              background: T.bgPanel,
              border: `1px solid ${T.border}`,
              borderRadius: 16,
              boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
              overflow: "hidden",
            }}
            role="dialog"
            aria-label="Global Search"
            aria-modal="true"
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.cyan}50, ${T.violet}50, transparent)` }} />

            {/* ── HEADER ── */}
            <div className="flex-shrink-0 px-4 pt-4 pb-2" style={{ borderBottom: `1px solid ${T.border}` }}>
              {/* Title */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.cyan}30, ${T.violet}30)`, border: `1px solid ${T.border}` }}>
                    <Search size={10} color={T.cyan} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary, fontFamily: T.sans, letterSpacing: "0.04em" }}>
                    GLOBAL SEARCH
                  </span>
                  {totalMatches > 0 && (
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 700, color: T.cyan, background: T.cyanDim, border: `1px solid ${T.cyan}20` }}>
                      {totalMatches} results in {totalFiles} files
                    </span>
                  )}
                  {replacedCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 700, color: T.emerald, background: T.emeraldDim }}>
                      {replacedCount} replaced
                    </span>
                  )}
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" aria-label="Close">
                  <X size={14} color={T.textMuted} />
                </button>
              </div>

              {/* Search input */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setShowReplace(p => !p)}
                  className="p-1 rounded transition-colors flex-shrink-0 hover:bg-white/5"
                  title="Toggle replace"
                >
                  {showReplace
                    ? <ChevronDown size={13} color={T.textTertiary} />
                    : <ChevronRight size={13} color={T.textTertiary} />
                  }
                </button>

                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg relative"
                  style={{ background: T.bgInput, border: `1px solid ${query && totalMatches === 0 ? T.rose : query ? T.borderActive : T.borderSubtle}`, boxShadow: query ? `0 0 10px rgba(99,179,237,0.06)` : "none" }}>
                  <Search size={13} color={query ? T.cyan : T.textMuted} />
                    <input
                      ref={queryRef}
                      value={query}
                      onChange={e => { setQuery(e.target.value); setSelectedIdx(0); setReplacedCount(0); }}
                      placeholder="Search across all project files..."
                      className="flex-1 bg-transparent outline-none"
                      style={{ fontSize: 13, color: T.textPrimary, fontFamily: T.mono }}
                      spellCheck={false}
                    />
                    {(query || isSearching) && (
                      <div className="flex items-center gap-2">
                        {isSearching && <Loader2 size={12} className="animate-spin text-cyan" />}
                        {query && (
                          <button onClick={() => setQuery("")} className="flex-shrink-0 p-0.5 rounded hover:bg-white/10">
                            <X size={11} color={T.textMuted} />
                          </button>
                        )}
                      </div>
                    )}
                  {RegexStatus === "invalid" && (
                    <span className="flex-shrink-0 px-1.5 py-0 rounded" style={{ fontSize: 9, color: T.rose, background: T.roseDim }}>Invalid regex</span>
                  )}
                </div>

                {/* Option toggles */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[
                    { label: "Aa", active: isCase, toggle: () => setIsCase(p => !p), title: "Match case" },
                    { label: "ab", active: isWord, toggle: () => setIsWord(p => !p), title: "Whole word" },
                    { label: ".*", active: isRegex, toggle: () => setIsRegex(p => !p), title: "Use regular expression" },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={opt.toggle}
                      title={opt.title}
                      className="px-2 py-1 rounded-md transition-all"
                      style={{
                        fontSize: 11, fontFamily: T.mono, fontWeight: 700,
                        color: opt.active ? T.cyan : T.textMuted,
                        background: opt.active ? T.cyanDim : "rgba(255,255,255,0.03)",
                        border: `1px solid ${opt.active ? `${T.cyan}30` : T.borderSubtle}`,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* File type filter */}
                <select
                  value={fileTypeFilter}
                  onChange={e => setFileTypeFilter(e.target.value)}
                  className="px-2 py-1 rounded-lg outline-none cursor-pointer flex-shrink-0"
                  style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}
                >
                  {FILE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Replace input */}
              <AnimatePresence initial={false}>
                {showReplace && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: easing.outStandard }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="flex items-center gap-2 ml-7 mt-1.5">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
                        <Replace size={12} color={T.violet} />
                        <input
                          ref={replaceRef}
                          value={replaceText}
                          onChange={e => setReplaceText(e.target.value)}
                          placeholder="Replace with..."
                          className="flex-1 bg-transparent outline-none"
                          style={{ fontSize: 13, color: T.textPrimary, fontFamily: T.mono }}
                          spellCheck={false}
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (flatItems[clampedIdx]) doReplace(flatItems[clampedIdx].filePath, flatItems[clampedIdx].lineNum);
                        }}
                        className="px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                        style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 600, color: T.violet, background: T.violetDim, border: `1px solid ${T.borderViolet}` }}
                        disabled={!replaceText || !totalMatches}
                      >
                        Replace
                      </button>
                      <button
                        onClick={doReplaceAll}
                        className="px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                        style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 600, color: T.textPrimary, background: `linear-gradient(135deg, ${T.violet}, ${T.cyan}90)`, boxShadow: `0 0 12px ${T.violet}25` }}
                        disabled={!replaceText || !totalMatches}
                      >
                        Replace All
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── RESULTS ── */}
            <div ref={listRef} className="flex-1 overflow-y-auto">
              {!query && (
                <div className="flex flex-col items-center justify-center py-16 px-8">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${T.cyan}10, ${T.violet}10)`, border: `1px solid ${T.border}` }}>
                    <Search size={20} color={T.textMuted} />
                  </div>
                  <p style={{ fontSize: 13, color: T.textTertiary, textAlign: "center" }}>Type to search across all project files</p>
                  <p style={{ fontSize: 11, color: T.textDim, textAlign: "center", marginTop: 6 }}>
                    Toggle <kbd style={{ fontSize: 9, fontFamily: T.mono, padding: "1px 4px", borderRadius: 3, background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}` }}>.*</kbd> for regex,&nbsp;
                    <kbd style={{ fontSize: 9, fontFamily: T.mono, padding: "1px 4px", borderRadius: 3, background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}` }}>Aa</kbd> for case-sensitive
                  </p>
                </div>
              )}

              {query && totalMatches === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <AlertTriangle size={24} color={T.textDim} className="mb-3" />
                  <p style={{ fontSize: 13, color: T.textTertiary }}>No results found for &quot;{query}&quot;</p>
                  <p style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>
                    {fileTypeFilter ? `Filtered to *.${fileTypeFilter} files · ` : ""}Try a different query
                  </p>
                </div>
              )}

              {results.map((group, _gIdx) => {
                const isCollapsed = collapsedFiles.has(group.file.path);
                const extColor = EXT_COLORS[group.file.ext] || T.textSecondary;
                const IconComp = EXT_ICON[group.file.ext] || EXT_ICON.default;
                const fileName = group.file.path.split("/").pop()!;
                const dirPath = group.file.path.includes("/") ? group.file.path.slice(0, group.file.path.lastIndexOf("/") + 1) : "";

                return (
                  <div key={group.file.path}>
                    {/* File header */}
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 transition-colors sticky top-0 z-10 text-left"
                      style={{ background: T.bgSurface, borderBottom: `1px solid ${T.borderSubtle}` }}
                      onClick={() => toggleFileCollapse(group.file.path)}
                      onMouseEnter={e => { e.currentTarget.style.background = T.bgElevated; }}
                      onMouseLeave={e => { e.currentTarget.style.background = T.bgSurface; }}
                    >
                      {isCollapsed
                        ? <ChevronRight size={11} color={T.textMuted} />
                        : <ChevronDown size={11} color={T.textMuted} />
                      }
                      <IconComp size={13} color={extColor} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary, fontFamily: T.mono }}>{fileName}</span>
                      <span style={{ fontSize: 10, color: T.textDim, fontFamily: T.mono }}>{dirPath}</span>
                      <span className="ml-auto px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 700, color: extColor, background: `${extColor}12` }}>
                        {group.matches.length} match{group.matches.length !== 1 ? "es" : ""}
                      </span>
                    </button>

                    {/* Match lines */}
                    {!isCollapsed && group.matches.map((match, _mIdx) => {
                      const flatPos = flatItems.findIndex(fi => fi.filePath === group.file.path && fi.lineNum === match.num);
                      const isSelected = flatPos === clampedIdx;
                      return (
                          <div
                            key={`${group.file.path}-${match.num}`}
                            className="flex items-center gap-0 px-4 py-1.5 cursor-pointer group transition-colors"
                            style={{
                              background: isSelected ? `${T.cyan}08` : "transparent",
                              borderLeft: isSelected ? `2px solid ${T.cyan}` : "2px solid transparent",
                            }}
                            onClick={() => { setSelectedIdx(flatPos); openMatch(group.file.path, match.num, group.file.ext); }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.bgHover; }}
                            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                          >
                            {/* Line number */}
                            <span className="flex-shrink-0 text-right pr-3" style={{ fontSize: 10, fontFamily: T.mono, color: T.textDim, width: 36 }}>
                              {match.num}
                            </span>
                            {/* Content */}
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <HighlightedLine
                                text={match.text.slice(0, 120)}
                                query={query}
                                isRegex={isRegex}
                                isCase={isCase}
                              />
                            </div>
                            {/* Actions on hover */}
                            {showReplace && (
                              <button
                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-md ml-2"
                                style={{ fontSize: 9, fontFamily: T.mono, color: T.violet, background: T.violetDim }}
                                onClick={ev => { ev.stopPropagation(); doReplace(group.file.path, match.num); }}
                              >
                                Replace
                              </button>
                            )}
                          </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Bottom padding */}
              <div className="h-4" />
            </div>

            {/* ── FOOTER ── */}
            {query && (
              <div
                className="flex items-center justify-between px-4 py-2 flex-shrink-0"
                style={{ borderTop: `1px solid ${T.border}`, background: T.bgSurface }}
              >
                <div className="flex items-center gap-3">
                  {totalMatches > 0
                    ? <><CheckCircle2 size={10} color={T.emerald} /><span style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary }}>{totalMatches} matches in {totalFiles} file{totalFiles !== 1 ? "s" : ""}{searchDuration ? ` (${searchDuration})` : ""}</span></>
                    : isSearching
                      ? <><Loader2 size={10} className="animate-spin text-cyan" /><span style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary }}>Searching project...</span></>
                      : <><AlertTriangle size={10} color={T.amber} /><span style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary }}>No matches</span></>
                  }
                  {fileTypeFilter && (
                    <><div className="w-px h-3" style={{ background: T.border }} /><span style={{ fontSize: 10, fontFamily: T.mono, color: T.violet }}>*.{fileTypeFilter}</span><button onClick={() => setFileTypeFilter("")} className="ml-1 hover:opacity-70"><X size={9} color={T.violet} /></button></>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>↑↓ Navigate · Enter Open · Esc Close</span>
                  <div className="w-px h-3" style={{ background: T.border }} />
                  <button onClick={() => { setQuery(""); setReplaceText(""); setReplacedCount(0); }} className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <RotateCcw size={9} color={T.textMuted} />
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>Clear</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
