/* ─────────────────────────────────────────────────────────────
   JPE Studio — Changelog / "What's New" Modal (Phase 14)
   In-app version history with feature highlights and quick links.
   ───────────────────────────────────────────────────────────── */
import { useState } from "react";
import {
  X, Sparkles, Zap, Shield, Bug, Package, Globe,
  Settings, Terminal, GitBranch, Keyboard, Search,
  BarChart3, Puzzle, Code2, BookOpen, Rocket,
  ArrowRight, Star, Heart, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";

/* ── Types ── */
type ChangeKind = "feature" | "improvement" | "fix" | "breaking";

interface ChangeEntry {
  kind: ChangeKind;
  text: string;
}

interface VersionEntry {
  version: string;
  date: string;
  codename: string;
  tagline: string;
  badge?: string;
  badgeColor?: string;
  highlights: { icon: typeof Sparkles; color: string; title: string; desc: string }[];
  changes: ChangeEntry[];
}

/* ── Changelog data ── */
const KIND_COLORS: Record<ChangeKind, string> = {
  feature:     T.cyan,
  improvement: T.emerald,
  fix:         T.amber,
  breaking:    T.rose,
};
const KIND_LABELS: Record<ChangeKind, string> = {
  feature:     "NEW",
  improvement: "IMP",
  fix:         "FIX",
  breaking:    "BRK",
};

const VERSIONS: VersionEntry[] = [
  {
    version: "1.14.0",
    date: "March 11, 2026",
    codename: "Obsidian Apex",
    tagline: "Localization intelligence, workspace profiles & live changelog — 100% production-ready.",
    badge: "LATEST",
    badgeColor: T.cyan,
    highlights: [
      { icon: Globe,      color: T.violet,  title: "Localization Coverage",  desc: "Per-locale analytics heatmap with AI batch-fill and XLIFF/CSV export." },
      { icon: BarChart3,  color: T.emerald, title: "Workspace Profiles",     desc: "Save & restore named layout configurations with built-in presets." },
      { icon: Star,       color: T.amber,   title: "In-App Changelog",       desc: "Full version history with feature highlights — you're reading it now." },
    ],
    changes: [
      { kind: "feature",     text: "Localization Coverage overlay (Ctrl+Shift+L) with per-locale progress bars, heatmap grid, status filters, and batch AI translate." },
      { kind: "feature",     text: "Workspace Profiles dropdown — save up to 8 named layouts, restore with one click; 4 built-in presets included." },
      { kind: "feature",     text: "Changelog modal (Ctrl+Shift+C) showing full version history with highlights, change log, and quick links." },
      { kind: "improvement", text: "Session persistence extended to workspace profile ID and localization overlay state." },
      { kind: "improvement", text: "Title bar now shows Profiles dropdown and Changelog button alongside Project Switcher." },
      { kind: "fix",         text: "PackageExportWizard: ReferenceError — missing Folder icon import resolved." },
    ],
  },
  {
    version: "1.13.0",
    date: "March 10, 2026",
    codename: "Phantom Export",
    tagline: "Package export wizard, edit history timeline & conflict resolution — Phase 13.",
    badge: "STABLE",
    badgeColor: T.emerald,
    highlights: [
      { icon: Package,    color: T.amber,  title: "Package Export Wizard",     desc: "5-step wizard for bundling and exporting .package files with checksums." },
      { icon: Clock,      color: T.cyan,   title: "Edit History & Undo/Redo",  desc: "Full edit timeline with restore points, Ctrl+Z / Ctrl+Y support." },
      { icon: GitBranch,  color: T.rose,   title: "Conflict Resolution",       desc: "3-step merge conflict wizard with side-by-side diff and strategies." },
    ],
    changes: [
      { kind: "feature",     text: "PackageExportWizard: 5-step export with file selection, metadata, compatibility flags, preview, and build log." },
      { kind: "feature",     text: "EditHistoryProvider: global undo/redo via Ctrl+Z / Ctrl+Y, timeline panel via Ctrl+H." },
      { kind: "feature",     text: "ConflictResolutionWizard: 3-step conflict resolver with side-by-side diffs accessible via Ctrl+Shift+R." },
      { kind: "improvement", text: "JPEStudio wrapped in EditHistoryProvider for cross-workspace undo support." },
      { kind: "improvement", text: "pushHistory() integrated in CodeWorkspace commitEdit and applyQuickFix." },
    ],
  },
  {
    version: "1.12.0",
    date: "March 9, 2026",
    codename: "Crystal Palette",
    tagline: "Color themes, file operations & code minimap — Phase 12.",
    highlights: [
      { icon: Settings,  color: T.violet, title: "5 Color Themes",         desc: "Obsidian Crystal, Neon Rebellion, Emerald Matrix, Crimson Dusk, Arctic Frost." },
      { icon: Code2,     color: T.cyan,   title: "Code Minimap",           desc: "Scrollable code overview with syntax highlighting and click-to-navigate." },
      { icon: Package,   color: T.amber,  title: "File Operations Dialog", desc: "Unified modal for new file/folder, rename, and delete with 6 templates." },
    ],
    changes: [
      { kind: "feature",     text: "5 full color themes with CSS variable injection on root container." },
      { kind: "feature",     text: "CodeMinimap component with ResizeObserver-based sizing and viewport indicator." },
      { kind: "feature",     text: "FileOperationDialog with live validation, 6 file templates, keyboard shortcuts." },
      { kind: "improvement", text: "Theme CSS vars applied to all hardcoded gradients (logo, drag handles, tabs)." },
    ],
  },
  {
    version: "1.11.0",
    date: "March 8, 2026",
    codename: "Production Shield",
    tagline: "Error boundaries, onboarding, auto-save & network status — Phase 11.",
    highlights: [
      { icon: Shield,    color: T.emerald, title: "Error Boundaries",        desc: "Three-level crash recovery with contextual error messages." },
      { icon: Heart,     color: T.rose,    title: "Onboarding Tour",         desc: "8-step first-run tutorial with help tooltips and quick-start checklist." },
      { icon: Zap,       color: T.amber,   title: "Auto-Save",               desc: "30-second auto-save with unsaved changes warning and draft recovery." },
    ],
    changes: [
      { kind: "feature",     text: "ErrorBoundary with 3 recovery levels, crash dumps, and retry logic." },
      { kind: "feature",     text: "OnboardingTour: 8-step first-run tutorial, per-step help tooltips." },
      { kind: "feature",     text: "jpe-auto-save: 30s auto-save, unsaved indicators, draft recovery on reload." },
      { kind: "feature",     text: "NetworkStatusIndicator: online/offline banner with reconnection countdown." },
      { kind: "feature",     text: "BrowserCompatibility: version checker with upgrade prompts for unsupported browsers." },
      { kind: "improvement", text: "14 empty-state presets and 4 loading skeletons for all major panels." },
    ],
  },
  {
    version: "1.10.0",
    date: "March 7, 2026",
    codename: "Snippet Bazaar",
    tagline: "Snippet manager, project switcher & extensions marketplace — Phase 10.",
    highlights: [
      { icon: Code2,   color: T.violet, title: "Snippet Manager",          desc: "Categorized code snippets with preview, copy/insert, fuzzy search." },
      { icon: Puzzle,  color: T.cyan,   title: "Extensions Marketplace",   desc: "Install/uninstall/configure marketplace plugins from within JPE Studio." },
      { icon: Rocket,  color: T.amber,  title: "Project Switcher",         desc: "Recent projects dropdown in title bar with starred and pinned projects." },
    ],
    changes: [
      { kind: "feature",     text: "SnippetManager (Ctrl+Shift+S): categorized snippets, create-new workflow, copy/insert." },
      { kind: "feature",     text: "ExtensionsPanel: marketplace with install/uninstall/configure, integrated in activity bar." },
      { kind: "feature",     text: "ProjectSwitcher: recent projects dropdown with git branch info and star/pin." },
    ],
  },
  {
    version: "1.9.0",
    date: "March 6, 2026",
    codename: "Nexus Search",
    tagline: "Global search/replace, performance HUD & activity bar — Phase 9.",
    highlights: [
      { icon: Search,    color: T.cyan,    title: "Global Search & Replace", desc: "Regex-powered search across all files with match preview and bulk replace." },
      { icon: BarChart3, color: T.emerald, title: "Performance HUD",         desc: "Real-time FPS/memory/render metrics with sparkline mini-charts." },
      { icon: GitBranch, color: T.violet,  title: "Source Control Panel",    desc: "Git integration UI with staged/unstaged changes and diff preview." },
    ],
    changes: [
      { kind: "feature",     text: "GlobalSearch (Ctrl+Shift+F): regex mode, file scope filter, replace-all." },
      { kind: "feature",     text: "PerformanceHUD (Ctrl+Shift+P): FPS, memory, latency sparklines." },
      { kind: "feature",     text: "SourceControlPanel: staged/unstaged diff with commit message." },
      { kind: "feature",     text: "Activity bar on left edge with Explorer/Search/Git/Extensions views." },
    ],
  },
];

/* ── Change item ── */
function ChangeItem({ entry }: { entry: ChangeEntry }) {
  const color = KIND_COLORS[entry.kind];
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <span className="px-1.5 py-0 rounded flex-shrink-0 mt-0.5" style={{ fontSize: 7, fontWeight: 800, fontFamily: T.mono, letterSpacing: "0.08em", color, background: `${color}15`, border: `1px solid ${color}30` }}>
        {KIND_LABELS[entry.kind]}
      </span>
      <span style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.55 }}>{entry.text}</span>
    </div>
  );
}

/* ── Version block ── */
function VersionBlock({ entry, isLatest }: { entry: VersionEntry; isLatest: boolean }) {
  const [expanded, setExpanded] = useState(isLatest);

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${isLatest ? `${T.cyan}30` : T.borderSubtle}`, background: isLatest ? `rgba(99,179,237,0.02)` : "rgba(255,255,255,0.01)" }}>
      {/* Version header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
        onClick={() => setExpanded(p => !p)}
        onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: 15, fontWeight: 800, color: isLatest ? T.cyan : T.textPrimary, fontFamily: T.display }}>v{entry.version}</span>
            <span style={{ fontSize: 11, color: T.textMuted, fontFamily: T.mono }}>"{entry.codename}"</span>
            {entry.badge && (
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 8, fontWeight: 800, color: entry.badgeColor, background: `${entry.badgeColor}15`, border: `1px solid ${entry.badgeColor}30`, letterSpacing: "0.07em" }}>
                {entry.badge}
              </span>
            )}
          </div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>{entry.date} — {entry.tagline}</div>
        </div>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.18 }}>
          <ArrowRight size={14} color={T.textMuted} />
        </motion.div>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
              {/* Highlight cards */}
              {entry.highlights.length > 0 && (
                <div className="grid grid-cols-3 gap-2 p-4" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                  {entry.highlights.map((h, i) => {
                    const Icon = h.icon;
                    return (
                      <div key={i} className="flex flex-col gap-2 p-3 rounded-lg" style={{ background: `${h.color}08`, border: `1px solid ${h.color}20` }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${h.color}15` }}>
                          <Icon size={14} color={h.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary }}>{h.title}</div>
                          <div style={{ fontSize: 10, color: T.textMuted, lineHeight: 1.5, marginTop: 2 }}>{h.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Change list */}
              <div className="px-4 py-3 space-y-0 divide-y" style={{ borderColor: T.borderSubtle }}>
                {entry.changes.map((c, i) => (
                  <ChangeItem key={i} entry={c} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Component ── */
export function ChangelogModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [search, setSearch] = useState("");

  const filteredVersions = VERSIONS.filter(v =>
    !search ||
    v.version.includes(search) ||
    v.codename.toLowerCase().includes(search.toLowerCase()) ||
    v.tagline.toLowerCase().includes(search.toLowerCase()) ||
    v.changes.some(c => c.text.toLowerCase().includes(search.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(12px)" }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: "min(820px, 95vw)",
              maxHeight: "88vh",
              background: T.bgElevated,
              border: `1px solid ${T.border}`,
              boxShadow: `0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 5%, ${T.cyan}80, ${T.emerald}80, transparent 95%)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.cyan}20, ${T.emerald}20)`, border: `1px solid ${T.borderSubtle}` }}>
                  <Sparkles size={17} color={T.cyan} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.textPrimary, fontFamily: T.display }}>What's New in JPE Studio</div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>Latest: v{VERSIONS[0].version} "{VERSIONS[0].codename}" · {VERSIONS[0].date}</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                style={{ border: `1px solid ${T.borderSubtle}` }}
              >
                <X size={14} color={T.textMuted} />
              </button>
            </div>

            {/* Search */}
            <div className="px-6 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}`, background: "rgba(0,0,0,0.1)" }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
                <Search size={12} color={T.textMuted} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search changelog…"
                  className="flex-1 bg-transparent outline-none"
                  style={{ fontSize: 12, color: T.textSecondary }}
                />
                {search && (
                  <button onClick={() => setSearch("")}><X size={10} color={T.textMuted} /></button>
                )}
              </div>
            </div>

            {/* Version list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {filteredVersions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Sparkles size={24} color={T.textDim} strokeWidth={1.5} />
                  <span style={{ fontSize: 13, color: T.textMuted }}>No versions match "{search}"</span>
                </div>
              ) : (
                filteredVersions.map((entry, i) => (
                  <VersionBlock key={entry.version} entry={entry} isLatest={i === 0 && !search} />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: "rgba(0,0,0,0.15)" }}>
              <div className="flex items-center gap-1.5">
                <Heart size={11} color={T.rose} />
                <span style={{ fontSize: 10, color: T.textMuted }}>Built for Sims 4 modders. JPE Studio v{VERSIONS[0].version} · Obsidian Crystal edition.</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>Ctrl+Shift+C to toggle</span>
                <button onClick={onClose} className="px-3 py-1.5 rounded-lg transition-all" style={{ fontSize: 11, color: T.textMuted, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ChangelogModal;