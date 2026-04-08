/**
 * GlobalSearch — Phase 9
 * Full-featured global search & replace overlay with:
 * regex / case / whole-word toggles, file-type filter,
 * highlighted result previews, Replace/Replace-All, keyboard nav.
 */
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { T } from "../pages/jpe-theme";
import { motion, AnimatePresence, easing } from "./jpe-motion";
import {
  Search, X, ChevronDown, ChevronRight,
  FileCode, Braces, FileText, Code2, Sparkles,
  Languages, Shield, Replace, RotateCcw,
  AlertTriangle, CheckCircle2, Globe, Hash,
  Package, File, Filter,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Mock search index ──────────────────────────────────────────── */
interface IndexLine { num: number; text: string; }
interface IndexFile { path: string; ext: string; lines: IndexLine[]; }

const EXT_ICON: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  xml: FileCode, json: Braces, stbl: Globe, ts4script: Code2,
  jpe: Sparkles, package: Package, md: FileText, default: File,
};

const SEARCH_INDEX: IndexFile[] = [
  {
    path: "src/tuning/S4_034AEECB_trait_Evil.xml", ext: "xml",
    lines: [
      { num: 1, text: '<?xml version="1.0" encoding="utf-8"?>' },
      { num: 2, text: "<TuningRoot>" },
      { num: 3, text: '  <Instance i="trait" s="Evil" n="trait_Evil">' },
      { num: 4, text: '    <TunableVariant name="trait_type" type="PERSONALITY">' },
      { num: 5, text: '      <Tunable name="display_name">0x0A3B4C5D <!-- Evil --></Tunable>' },
      { num: 6, text: '      <Tunable name="trait_description">0x1F2E3D4C</Tunable>' },
      { num: 7, text: '      <TunableList name="conflicting_traits">' },
      { num: 8, text: "        <Tunable>trait_Good</Tunable>" },
      { num: 9, text: "        <Tunable>trait_Childish</Tunable>" },
      { num: 10, text: '      <Tunable name="icon" type="ResourceKey">' },
      { num: 11, text: "        S4_2F7D0004_00000001_Evil_Icon" },
      { num: 12, text: '      <TunableList name="buffs_on_add">' },
      { num: 13, text: '          <Tunable name="buff_type">buff_Evil_Aura</Tunable>' },
      { num: 14, text: '          <Tunable name="buff_reason">0x2A3B4C5D</Tunable>' },
      { num: 15, text: '      <Tunable name="ages" type="TunableSet">TEEN, YOUNGADULT, ADULT</Tunable>' },
    ],
  },
  {
    path: "src/tuning/S4_0904DF10_buff_Energized.xml", ext: "xml",
    lines: [
      { num: 1, text: '<?xml version="1.0" encoding="utf-8"?>' },
      { num: 2, text: '  <Instance i="buff" s="Energized" n="buff_Energized">' },
      { num: 3, text: '    <Tunable name="display_name">0xBEEF4321</Tunable>' },
      { num: 4, text: '    <Tunable name="buff_description">0xCAFE8765</Tunable>' },
      { num: 5, text: '    <Tunable name="moodlet_type">ENERGIZED</Tunable>' },
      { num: 6, text: '    <Tunable name="duration">240</Tunable>' },
      { num: 7, text: '    <Tunable name="mood_type">ENERGY</Tunable>' },
      { num: 8, text: '    <TunableList name="buffs_on_add"><Tunable>buff_Energized_Aura</Tunable></TunableList>' },
    ],
  },
  {
    path: "src/tuning/S4_16CD1E22_interaction_Cook.xml", ext: "xml",
    lines: [
      { num: 1, text: '  <Instance i="interaction" s="Cook" n="interaction_Cook">' },
      { num: 2, text: '    <Tunable name="display_name">0xA1B2C3D4</Tunable>' },
      { num: 3, text: '    <Tunable name="trait_requirement">trait_Evil</Tunable>' },
      { num: 4, text: '    <Tunable name="skill_level">5</Tunable>' },
      { num: 5, text: '    <Tunable name="interaction_category">COOKFOOD</Tunable>' },
    ],
  },
  {
    path: "src/tuning/S4_E882D22F_recipe_Salad.xml", ext: "xml",
    lines: [
      { num: 1, text: '  <Instance i="recipe" s="Salad" n="recipe_Salad">' },
      { num: 2, text: '    <Tunable name="display_name">0xF00BA5</Tunable>' },
      { num: 3, text: '    <Tunable name="trait_restriction">trait_Good</Tunable>' },
      { num: 4, text: '    <Tunable name="ingredients">lettuce, tomato, dressing</Tunable>' },
    ],
  },
  {
    path: "src/translations/en_US.stbl", ext: "stbl",
    lines: [
      { num: 1, text: "0x0A3B4C5D = Evil" },
      { num: 2, text: "0x1F2E3D4C = These Sims enjoy being mean and causing mayhem." },
      { num: 3, text: "0xBEEF4321 = Energized" },
      { num: 4, text: "0xCAFE8765 = This Sim is feeling a surge of energy and drive." },
      { num: 5, text: "0xA1B2C3D4 = Cook Meal (Evil)" },
      { num: 6, text: "0xDEAD0000 = Evil Moodlet: Thriving in Chaos" },
      { num: 7, text: "0x2A3B4C5D = Revelling in causing havoc." },
      { num: 8, text: "0xF00BA5   = Healthy Garden Salad" },
    ],
  },
  {
    path: "src/translations/ja_JP.stbl", ext: "stbl",
    lines: [
      { num: 1, text: "0x0A3B4C5D = 邪悪" },
      { num: 2, text: "0x1F2E3D4C = このシムは意地悪で混乱を引き起こすのが好き。" },
      { num: 3, text: "0xBEEF4321 = 活力" },
      { num: 4, text: "0xCAFE8765 = エネルギーが溢れている。" },
    ],
  },
  {
    path: "src/translations/de_DE.stbl", ext: "stbl",
    lines: [
      { num: 1, text: "0x0A3B4C5D = Böse" },
      { num: 2, text: "0x1F2E3D4C = Diese Sims genießen es, gemein zu sein." },
      { num: 3, text: "0xBEEF4321 = Voller Energie" },
      { num: 4, text: "0x2A3B4C5D = Schwelgt im Chaos." },
    ],
  },
  {
    path: "src/scripts/jpe_translator.ts4script", ext: "ts4script",
    lines: [
      { num: 1, text: "import sims4.commands as cmds" },
      { num: 2, text: "import sims4.tuning.tunable as tunable" },
      { num: 3, text: "TRAIT_EVIL = 'trait_Evil'" },
      { num: 4, text: "TRAIT_GOOD = 'trait_Good'" },
      { num: 5, text: "def apply_evil_trait(sim_info):" },
      { num: 6, text: "    trait_tracker = sim_info.trait_tracker" },
      { num: 7, text: "    if trait_tracker.has_trait(TRAIT_EVIL):" },
      { num: 8, text: "        buff_tracker.add_buff('buff_Evil_Aura')" },
      { num: 9, text: "    return sim_info.get_all_traits()" },
    ],
  },
  {
    path: "src/scripts/conflict_resolver.ts4script", ext: "ts4script",
    lines: [
      { num: 1, text: "def check_trait_conflicts(sim_info):" },
      { num: 2, text: "    conflicting = ['trait_Good', 'trait_Childish']" },
      { num: 3, text: "    for trait in sim_info.trait_tracker.get_traits():" },
      { num: 4, text: "        if trait.trait_name in conflicting:" },
      { num: 5, text: "            raise TraitConflictError(f'Cannot assign trait_Evil with {trait.trait_name}')" },
      { num: 6, text: "    return True" },
    ],
  },
  {
    path: "src/configs/settings.json", ext: "json",
    lines: [
      { num: 1, text: '{' },
      { num: 2, text: '  "sdk_path": "/Applications/Sims4Studio",' },
      { num: 3, text: '  "game_version": "1.108.365",' },
      { num: 4, text: '  "locale_default": "en_US",' },
      { num: 5, text: '  "trait_prefix": "trait_",' },
      { num: 6, text: '  "buff_prefix": "buff_",' },
      { num: 7, text: '  "log_level": "INFO"' },
      { num: 8, text: '}' },
    ],
  },
  {
    path: "manifest.json", ext: "json",
    lines: [
      { num: 1, text: '{' },
      { num: 2, text: '  "name": "Evil Trait Override",' },
      { num: 3, text: '  "version": "2.4.1",' },
      { num: 4, text: '  "author": "JPEStudio User",' },
      { num: 5, text: '  "game_version": "1.108.365",' },
      { num: 6, text: '  "tunings": 12,' },
      { num: 7, text: '  "strings": 48,' },
      { num: 8, text: '  "dependencies": ["BaseGame", "GetToWork"]' },
      { num: 9, text: '}' },
    ],
  },
  {
    path: "src/interactions/hug_friend.jpe", ext: "jpe",
    lines: [
      { num: 1, text: "interaction hug_friend {" },
      { num: 2, text: "  display_name: 0xA1B2C3D4" },
      { num: 3, text: "  trait_requirement: trait_Evil" },
      { num: 4, text: "  target_filter: friends_only" },
      { num: 5, text: "  animation_id: 0xDEADBEEF" },
      { num: 6, text: "  outcome { buff: buff_Evil_Aura, duration: 60 }" },
      { num: 7, text: "}" },
    ],
  },
];

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
  const queryRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  /* Build regex from current options */
  const buildRegex = useCallback((q: string): RegExp | null => {
    if (!q) return null;
    try {
      const flags = isCase ? "g" : "gi";
      const pattern = isRegex
        ? q
        : isWord
          ? `\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`
          : q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(pattern, flags);
    } catch { return null; }
  }, [isCase, isWord, isRegex]);

  /* Search results */
  const results = useMemo(() => {
    const re = buildRegex(query);
    if (!re) return [];
    return SEARCH_INDEX
      .filter(f => !fileTypeFilter || f.ext === fileTypeFilter)
      .map(f => {
        const matches = f.lines
          .filter(l => re.test(l.text))
          .map(l => ({ ...l }));
        re.lastIndex = 0;
        return { file: f, matches };
      })
      .filter(r => r.matches.length > 0);
  }, [query, buildRegex, fileTypeFilter]);

  const totalMatches = results.reduce((s, r) => s + r.matches.length, 0);
  const totalFiles = results.length;

  /* Flat list of all match items for keyboard nav */
  const flatItems = useMemo(() => {
    const items: { filePath: string; lineNum: number; text: string }[] = [];
    for (const r of results) {
      if (!collapsedFiles.has(r.file.path)) {
        for (const m of r.matches) {
          items.push({ filePath: r.file.path, lineNum: m.num, text: m.text });
        }
      }
    }
    return items;
  }, [results, collapsedFiles]);

  const clampedIdx = Math.max(0, Math.min(selectedIdx, flatItems.length - 1));

  const openMatch = (filePath: string, lineNum: number) => {
    toast.success(`Opened ${filePath.split("/").pop()} at line ${lineNum}`);
  };

  const doReplace = (filePath: string, lineNum: number) => {
    setReplacedCount(p => p + 1);
    toast.success(`Replaced match in ${filePath.split("/").pop()}:${lineNum}`);
  };

  const doReplaceAll = () => {
    setReplacedCount(totalMatches);
    toast.success(`Replaced ${totalMatches} occurrence${totalMatches !== 1 ? "s" : ""} across ${totalFiles} file${totalFiles !== 1 ? "s" : ""}`);
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
            style={{ background: "rgba(5,7,13,0.75)", backdropFilter: "blur(6px)" }}
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
                  {query && (
                    <button onClick={() => setQuery("")} className="flex-shrink-0 p-0.5 rounded hover:bg-white/10">
                      <X size={11} color={T.textMuted} />
                    </button>
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

              {results.map((group, gIdx) => {
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
                    {!isCollapsed && group.matches.map((match, mIdx) => {
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
                          onClick={() => { setSelectedIdx(flatPos); openMatch(group.file.path, match.num); }}
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
                    ? <><CheckCircle2 size={10} color={T.emerald} /><span style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary }}>{totalMatches} matches in {totalFiles} file{totalFiles !== 1 ? "s" : ""}</span></>
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
