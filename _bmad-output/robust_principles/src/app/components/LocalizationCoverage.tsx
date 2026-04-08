/* ─────────────────────────────────────────────────────────────
   JPE Studio — Localization Coverage Dashboard (Phase 14)
   Full-screen overlay: per-locale analytics, string table,
   heatmap, batch AI fill, XLIFF/CSV export.
   ───────────────────────────────────────────────────────────── */
import { useState, useMemo, useCallback } from "react";
import {
  X, Globe, Search, Download, Sparkles, CheckCircle2,
  AlertTriangle, Clock, Filter, ChevronRight, BarChart3,
  RefreshCw, Copy, FileText, Zap, Languages, TrendingUp,
  ArrowUpDown, Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { toast } from "sonner";

/* ── Types ── */
type StringStatus = "translated" | "missing" | "fuzzy" | "reviewed" | "machine";
type SortField = "key" | "source" | "status";
type SortDir = "asc" | "desc";

interface LocaleInfo {
  code: string;
  name: string;
  flag: string;
  total: number;
  translated: number;
  fuzzy: number;
  reviewed: number;
  machine: number;
  missing: number;
  lastUpdated: string;
}

interface StringEntry {
  id: string;
  key: string;
  source: string;
  translations: Record<string, { text: string; status: StringStatus }>;
}

/* ── Mock data ── */
const LOCALES: LocaleInfo[] = [
  { code: "en-US", name: "English (US)",       flag: "🇺🇸", total: 248, translated: 248, fuzzy: 0,  reviewed: 248, machine: 0,  missing: 0,  lastUpdated: "2026-03-11" },
  { code: "es-ES", name: "Spanish (Spain)",     flag: "🇪🇸", total: 248, translated: 231, fuzzy: 6,  reviewed: 195, machine: 28, missing: 17, lastUpdated: "2026-03-10" },
  { code: "fr-FR", name: "French (France)",     flag: "🇫🇷", total: 248, translated: 218, fuzzy: 14, reviewed: 180, machine: 35, missing: 30, lastUpdated: "2026-03-09" },
  { code: "de-DE", name: "German",              flag: "🇩🇪", total: 248, translated: 244, fuzzy: 2,  reviewed: 230, machine: 12, missing: 4,  lastUpdated: "2026-03-11" },
  { code: "pt-BR", name: "Portuguese (Brazil)", flag: "🇧🇷", total: 248, translated: 196, fuzzy: 18, reviewed: 140, machine: 52, missing: 52, lastUpdated: "2026-03-07" },
  { code: "zh-CN", name: "Chinese (Simplified)",flag: "🇨🇳", total: 248, translated: 172, fuzzy: 8,  reviewed: 120, machine: 44, missing: 76, lastUpdated: "2026-03-05" },
  { code: "ko-KR", name: "Korean",              flag: "🇰🇷", total: 248, translated: 185, fuzzy: 12, reviewed: 148, machine: 37, missing: 63, lastUpdated: "2026-03-08" },
  { code: "ja-JP", name: "Japanese",            flag: "🇯🇵", total: 248, translated: 160, fuzzy: 5,  reviewed: 110, machine: 45, missing: 88, lastUpdated: "2026-03-04" },
  { code: "ru-RU", name: "Russian",             flag: "🇷🇺", total: 248, translated: 210, fuzzy: 10, reviewed: 185, machine: 25, missing: 38, lastUpdated: "2026-03-09" },
  { code: "pl-PL", name: "Polish",              flag: "🇵🇱", total: 248, translated: 138, fuzzy: 4,  reviewed: 95,  machine: 43, missing: 110, lastUpdated: "2026-03-03" },
];

const SAMPLE_KEYS = [
  "trait_evil_name", "trait_evil_description", "trait_evil_buff_title",
  "trait_evil_buff_desc", "interaction_hug_friend", "interaction_hug_stranger",
  "interaction_tell_joke", "interaction_argue", "buff_feeling_evil",
  "buff_feeling_mischievous", "notification_evil_action_success",
  "notification_evil_action_fail", "moodlet_devilish_grin", "skill_mischief_name",
  "skill_mischief_desc", "career_villain_name", "career_villain_branch_a",
  "aspiration_chief_of_mischief", "lot_trait_haunted", "cas_trait_evil_unlock",
];

const STATUS_COLORS: Record<StringStatus, string> = {
  translated: T.emerald,
  missing: T.rose,
  fuzzy: T.amber,
  reviewed: T.cyan,
  machine: T.violet,
};
const STATUS_LABELS: Record<StringStatus, string> = {
  translated: "Translated",
  missing: "Missing",
  fuzzy: "Fuzzy",
  reviewed: "Reviewed",
  machine: "Machine",
};

/* ── Generate mock string table ── */
function buildStringTable(): StringEntry[] {
  return SAMPLE_KEYS.map((key, i) => {
    const sourceText = key.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
    const translations: Record<string, { text: string; status: StringStatus }> = {};
    LOCALES.forEach(loc => {
      if (loc.code === "en-US") {
        translations[loc.code] = { text: sourceText, status: "reviewed" };
      } else {
        const roll = (i * 7 + loc.code.charCodeAt(0)) % 100;
        const pct = (loc.translated / loc.total) * 100;
        let status: StringStatus;
        let text: string;
        if (roll < pct - 10) {
          status = roll % 7 === 0 ? "machine" : roll % 5 === 0 ? "fuzzy" : "reviewed";
          text = `[${loc.code}] ${sourceText}`;
        } else if (roll < pct + 5) {
          status = "translated";
          text = `[${loc.code}] ${sourceText}`;
        } else {
          status = "missing";
          text = "";
        }
        translations[loc.code] = { text, status };
      }
    });
    return { id: `key-${i}`, key, source: sourceText, translations };
  });
}

const STRING_TABLE = buildStringTable();

/* ── Stat card ── */
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${T.borderSubtle}` }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 800, color: color ?? T.textPrimary, fontFamily: T.display, lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: 9, color: T.textMuted }}>{sub}</span>}
    </div>
  );
}

/* ── Coverage bar ── */
function CoverageBar({ locale, isSelected, onClick }: { locale: LocaleInfo; isSelected: boolean; onClick: () => void }) {
  const pct = Math.round((locale.translated / locale.total) * 100);
  const reviewedPct = Math.round((locale.reviewed / locale.total) * 100);
  const machinePct = Math.round((locale.machine / locale.total) * 100);

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all"
      style={{
        background: isSelected ? `${T.cyan}10` : "transparent",
        border: `1px solid ${isSelected ? `${T.cyan}30` : "transparent"}`,
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.bgHover; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
      onClick={onClick}
    >
      <span style={{ fontSize: 15 }}>{locale.flag}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="truncate" style={{ fontSize: 11, color: isSelected ? T.textPrimary : T.textSecondary, fontWeight: isSelected ? 700 : 400 }}>{locale.code}</span>
          <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: pct >= 90 ? T.emerald : pct >= 70 ? T.amber : T.rose }}>{pct}%</span>
        </div>
        <div className="relative rounded-full overflow-hidden" style={{ height: 4, background: "rgba(255,255,255,0.05)" }}>
          {/* reviewed (solid) */}
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${reviewedPct}%`, background: T.cyan }} />
          {/* translated (dimmer) */}
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: `${T.emerald}70` }} />
          {/* machine (overlay) */}
          <div className="absolute inset-y-0 rounded-full" style={{ left: `${reviewedPct}%`, width: `${machinePct}%`, background: `${T.violet}80` }} />
        </div>
      </div>
      {locale.missing > 0 && (
        <span className="px-1.5 py-0.5 rounded-md flex-shrink-0" style={{ fontSize: 8, fontWeight: 700, color: T.rose, background: `${T.rose}15`, fontFamily: T.mono }}>
          -{locale.missing}
        </span>
      )}
    </div>
  );
}

/* ── Main Component ── */
export function LocalizationCoverage({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedLocale, setSelectedLocale] = useState<string | null>("es-ES");
  const [statusFilter, setStatusFilter] = useState<StringStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("key");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [batchFilling, setBatchFilling] = useState(false);
  const [filledKeys, setFilledKeys] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState<"table" | "heatmap">("table");

  /* Overall totals */
  const overallTotal = LOCALES[0].total;
  const overallTranslated = Math.round(LOCALES.reduce((a, l) => a + l.translated, 0) / LOCALES.length);
  const overallReviewed = Math.round(LOCALES.reduce((a, l) => a + l.reviewed, 0) / LOCALES.length);
  const overallMissing = LOCALES.reduce((a, l) => a + l.missing, 0);

  /* Filtered & sorted string table */
  const currentLocale = LOCALES.find(l => l.code === selectedLocale) ?? LOCALES[1];
  const filteredStrings = useMemo(() => {
    let rows = STRING_TABLE;
    if (selectedLocale && selectedLocale !== "en-US") {
      if (statusFilter !== "all") {
        rows = rows.filter(r => r.translations[selectedLocale]?.status === statusFilter);
      }
    }
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r => r.key.toLowerCase().includes(q) || r.source.toLowerCase().includes(q));
    }
    rows = [...rows].sort((a, b) => {
      let va: string, vb: string;
      if (sortField === "key") { va = a.key; vb = b.key; }
      else if (sortField === "source") { va = a.source; vb = b.source; }
      else {
        va = selectedLocale ? (a.translations[selectedLocale]?.status ?? "missing") : "missing";
        vb = selectedLocale ? (b.translations[selectedLocale]?.status ?? "missing") : "missing";
      }
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return rows;
  }, [selectedLocale, statusFilter, search, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  /* Batch AI fill */
  const runBatchFill = useCallback(async () => {
    if (!selectedLocale || batchFilling) return;
    const missingKeys = STRING_TABLE
      .filter(r => r.translations[selectedLocale]?.status === "missing")
      .map(r => r.key);
    if (missingKeys.length === 0) { toast.info("No missing strings to fill."); return; }
    setBatchFilling(true);
    toast.loading(`AI translating ${missingKeys.length} strings for ${selectedLocale}…`, { id: "batch-fill" });
    await new Promise(r => setTimeout(r, 1800 + missingKeys.length * 60));
    setFilledKeys(new Set(missingKeys));
    toast.success(`${missingKeys.length} strings machine-translated for ${selectedLocale}`, {
      id: "batch-fill",
      description: "Review and approve each translation before publishing.",
    });
    setBatchFilling(false);
  }, [selectedLocale, batchFilling]);

  /* Export handlers */
  const exportXLIFF = () => toast.success(`XLIFF exported: ${selectedLocale ?? "all"}.xliff`, { description: `${filteredStrings.length} translation units` });
  const exportCSV = () => toast.success(`CSV exported: strings_${selectedLocale ?? "all"}.csv`, { description: `${filteredStrings.length} rows` });
  const copyKey = (key: string) => { navigator.clipboard.writeText(key).then(() => toast.success("Key copied")).catch(() => {}); };

  const STATUS_TABS: { id: StringStatus | "all"; label: string; color?: string }[] = [
    { id: "all", label: "All" },
    { id: "reviewed", label: "Reviewed", color: T.cyan },
    { id: "translated", label: "Translated", color: T.emerald },
    { id: "machine", label: "Machine", color: T.violet },
    { id: "fuzzy", label: "Fuzzy", color: T.amber },
    { id: "missing", label: "Missing", color: T.rose },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col m-auto rounded-2xl overflow-hidden"
            style={{
              width: "min(1160px, 97vw)",
              height: "min(780px, 92vh)",
              background: T.bgElevated,
              border: `1px solid ${T.border}`,
              boxShadow: `0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 5%, ${T.violet}80, ${T.cyan}80, transparent 95%)` }} />

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.violet}20, ${T.cyan}20)`, border: `1px solid ${T.borderSubtle}` }}>
                  <Globe size={16} color={T.violet} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: T.display }}>Localization Coverage</div>
                  <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono }}>{LOCALES.length} locales · {overallTotal} string keys</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={exportXLIFF} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all" style={{ fontSize: 11, color: T.textSecondary, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                  <Download size={12} color={T.textMuted} /> XLIFF
                </button>
                <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all" style={{ fontSize: 11, color: T.textSecondary, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                  <FileText size={12} color={T.textMuted} /> CSV
                </button>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10" style={{ border: `1px solid ${T.borderSubtle}` }}>
                  <X size={14} color={T.textMuted} />
                </button>
              </div>
            </div>

            {/* ── Summary stat bar ── */}
            <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: "rgba(0,0,0,0.12)" }}>
              <StatCard label="Avg Coverage" value={`${Math.round((overallTranslated / overallTotal) * 100)}%`} sub={`${overallTranslated} / ${overallTotal} strings`} color={T.emerald} />
              <StatCard label="Avg Reviewed" value={`${Math.round((overallReviewed / overallTotal) * 100)}%`} sub="Human approved" color={T.cyan} />
              <StatCard label="Total Missing" value={overallMissing} sub="Across all locales" color={T.rose} />
              <StatCard label="Locales" value={LOCALES.length} sub={`${LOCALES.filter(l => l.translated / l.total >= 0.9).length} ≥ 90%`} color={T.violet} />
              <div className="flex-1" />
              {/* View toggle */}
              <div className="flex items-center rounded-lg overflow-hidden" style={{ border: `1px solid ${T.borderSubtle}` }}>
                {(["table", "heatmap"] as const).map(v => (
                  <button key={v} onClick={() => setActiveView(v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
                    style={{ fontSize: 11, background: activeView === v ? T.bgHover : "transparent", color: activeView === v ? T.textPrimary : T.textMuted }}>
                    {v === "table" ? <Languages size={11} /> : <BarChart3 size={11} />}
                    {v[0].toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-1 min-h-0">

              {/* Left: locale list */}
              <div className="flex flex-col flex-shrink-0 overflow-y-auto" style={{ width: 220, borderRight: `1px solid ${T.border}`, background: "rgba(0,0,0,0.1)" }}>
                <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.07em" }}>LOCALES</span>
                </div>
                <div className="flex-1 overflow-y-auto py-1 px-1 space-y-0.5">
                  {LOCALES.map(locale => (
                    <CoverageBar
                      key={locale.code}
                      locale={locale}
                      isSelected={selectedLocale === locale.code}
                      onClick={() => { setSelectedLocale(locale.code); setStatusFilter("all"); }}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="px-3 py-2 space-y-1 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
                  {[
                    { color: T.cyan, label: "Reviewed" },
                    { color: T.emerald, label: "Translated" },
                    { color: T.violet, label: "Machine" },
                    { color: T.rose, label: "Missing" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span style={{ fontSize: 9, color: T.textMuted }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: main content */}
              <div className="flex flex-col flex-1 min-w-0">
                {/* Locale header */}
                <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(0,0,0,0.08)" }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 18 }}>{currentLocale.flag}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{currentLocale.name}</div>
                      <div style={{ fontSize: 9, color: T.textMuted, fontFamily: T.mono }}>Last updated {currentLocale.lastUpdated}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {[
                        { val: currentLocale.reviewed, color: T.cyan, label: "reviewed" },
                        { val: currentLocale.translated, color: T.emerald, label: "translated" },
                        { val: currentLocale.machine, color: T.violet, label: "machine" },
                        { val: currentLocale.fuzzy, color: T.amber, label: "fuzzy" },
                        { val: currentLocale.missing, color: T.rose, label: "missing" },
                      ].map(s => (
                        <span key={s.label} className="px-2 py-0.5 rounded-md" style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: s.color, background: `${s.color}12` }}>
                          {s.val} {s.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedLocale && selectedLocale !== "en-US" && currentLocale.missing > 0 && (
                    <button
                      onClick={runBatchFill}
                      disabled={batchFilling}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                      style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${T.violet}CC, ${T.cyan}CC)`, boxShadow: `0 0 16px ${T.violet}20` }}
                    >
                      {batchFilling ? <><RefreshCw size={12} className="animate-spin" /> Filling…</> : <><Sparkles size={12} /> AI Fill {currentLocale.missing} missing</>}
                    </button>
                  )}
                </div>

                {/* Status filter tabs + search */}
                <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                  <div className="flex items-center">
                    {STATUS_TABS.map(tab => {
                      const isActive = statusFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setStatusFilter(tab.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md transition-all"
                          style={{
                            fontSize: 10, fontWeight: isActive ? 700 : 400,
                            color: isActive ? (tab.color ?? T.textPrimary) : T.textMuted,
                            background: isActive ? `${tab.color ?? T.textPrimary}12` : "transparent",
                          }}
                        >
                          {tab.label}
                          {tab.id !== "all" && selectedLocale && (
                            <span style={{ fontSize: 8, fontFamily: T.mono, color: tab.color ?? T.textMuted }}>
                              {STRING_TABLE.filter(r => r.translations[selectedLocale]?.status === tab.id).length}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
                    <Search size={11} color={T.textMuted} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keys…" className="bg-transparent outline-none w-36" style={{ fontSize: 11, color: T.textSecondary }} />
                    {search && <button onClick={() => setSearch("")}><X size={9} color={T.textMuted} /></button>}
                  </div>
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{filteredStrings.length} results</span>
                </div>

                {/* TABLE VIEW */}
                {activeView === "table" && (
                  <div className="flex-1 overflow-y-auto">
                    {/* Table header */}
                    <div className="grid sticky top-0 px-4 py-1.5" style={{ gridTemplateColumns: "1fr 1fr 90px 90px", gap: 8, background: T.bgSurface, borderBottom: `1px solid ${T.border}`, zIndex: 1 }}>
                      {[
                        { label: "Key", field: "key" as SortField },
                        { label: "Source (en-US)", field: "source" as SortField },
                        { label: "Status", field: "status" as SortField },
                        { label: "Translation", field: null },
                      ].map(col => (
                        <button
                          key={col.label}
                          className="flex items-center gap-1 text-left"
                          onClick={() => col.field && toggleSort(col.field)}
                          disabled={!col.field}
                          style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", cursor: col.field ? "pointer" : "default" }}
                        >
                          {col.label}
                          {col.field && sortField === col.field && <ArrowUpDown size={8} color={T.cyan} />}
                        </button>
                      ))}
                    </div>

                    {/* Rows */}
                    <AnimatePresence initial={false}>
                      {filteredStrings.map((row) => {
                        const t = selectedLocale ? row.translations[selectedLocale] : null;
                        const status = t?.status ?? "missing";
                        const color = STATUS_COLORS[status];
                        const isFilled = filledKeys.has(row.key) && status === "missing";

                        return (
                          <motion.div
                            key={row.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="grid items-center px-4 py-2 group transition-colors"
                            style={{
                              gridTemplateColumns: "1fr 1fr 90px 90px",
                              gap: 8,
                              borderBottom: `1px solid ${T.borderSubtle}`,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          >
                            {/* Key */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="truncate" style={{ fontSize: 11, fontFamily: T.mono, color: T.cyan }}>{row.key}</span>
                              <button onClick={() => copyKey(row.key)} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <Copy size={9} color={T.textMuted} />
                              </button>
                            </div>
                            {/* Source */}
                            <span className="truncate" style={{ fontSize: 11, color: T.textSecondary }}>{row.source}</span>
                            {/* Status */}
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isFilled ? T.violet : color, boxShadow: `0 0 4px ${isFilled ? T.violet : color}40` }} />
                              <span style={{ fontSize: 9, fontWeight: 700, color: isFilled ? T.violet : color }}>
                                {isFilled ? "MACHINE" : STATUS_LABELS[status].toUpperCase()}
                              </span>
                            </div>
                            {/* Translation preview */}
                            <span className="truncate" style={{ fontSize: 10, color: t?.text ? T.textSecondary : T.textDim, fontStyle: !t?.text ? "italic" : "normal" }}>
                              {isFilled ? `[AI] ${row.source}` : t?.text || "—"}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {filteredStrings.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <CheckCircle2 size={28} color={T.emerald} strokeWidth={1.5} />
                        <span style={{ fontSize: 13, color: T.textMuted }}>No strings match this filter</span>
                      </div>
                    )}
                  </div>
                )}

                {/* HEATMAP VIEW */}
                {activeView === "heatmap" && (
                  <div className="flex-1 overflow-auto p-5">
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 16 }}>
                      Translation coverage heatmap — each cell represents one string key across all locales.
                    </div>
                    <div className="overflow-x-auto">
                      <table style={{ borderCollapse: "separate", borderSpacing: 2 }}>
                        <thead>
                          <tr>
                            <th style={{ fontSize: 9, color: T.textMuted, padding: "2px 4px", textAlign: "left", width: 140 }}>KEY</th>
                            {LOCALES.filter(l => l.code !== "en-US").map(loc => (
                              <th key={loc.code} style={{ fontSize: 9, color: T.textMuted, padding: "2px 4px", textAlign: "center", minWidth: 28 }}>
                                {loc.flag}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {STRING_TABLE.slice(0, 20).map(row => (
                            <tr key={row.id}>
                              <td style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary, padding: "2px 4px", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.key}</td>
                              {LOCALES.filter(l => l.code !== "en-US").map(loc => {
                                const t = row.translations[loc.code];
                                const s = t?.status ?? "missing";
                                const bg = s === "reviewed" ? T.cyan : s === "translated" ? T.emerald : s === "machine" ? T.violet : s === "fuzzy" ? T.amber : T.rose;
                                return (
                                  <td key={loc.code} title={`${loc.code}: ${STATUS_LABELS[s]}`} style={{ padding: 2 }}>
                                    <div style={{ width: 20, height: 20, borderRadius: 4, background: `${bg}${s === "missing" ? "30" : "70"}`, border: `1px solid ${bg}30` }} />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Heatmap legend */}
                    <div className="flex items-center gap-4 mt-4">
                      {Object.entries(STATUS_COLORS).map(([s, c]) => (
                        <div key={s} className="flex items-center gap-1.5">
                          <div style={{ width: 12, height: 12, borderRadius: 3, background: `${c}70`, border: `1px solid ${c}30` }} />
                          <span style={{ fontSize: 9, color: T.textMuted }}>{STATUS_LABELS[s as StringStatus]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LocalizationCoverage;
