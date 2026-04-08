/* JPE STUDIO — Keyboard Shortcuts Cheatsheet
   Full-screen cinematic overlay showing all shortcuts organized by category.
   Accessible via Ctrl+/ or from Settings > Keybindings. */
import { useState, useMemo, useEffect, useRef } from "react";
import { useFocusTrap, useReturnFocus } from "./jpe-a11y";
import {
  X, Search, Keyboard, Command, Code2, Languages, Rocket, Shield,
  Network, Bug, BarChart3, Sparkles, Settings, Library, Puzzle,
  LayoutGrid, Terminal, PanelLeft, PanelRight, PanelBottom,
  FileCode, Globe, Package, BookOpen, Eye, Zap,
  type LucideIcon,
} from "lucide-react";
import { T } from "../pages/jpe-theme";
import { Eyebrow, Badge } from "../pages/jpe-shared";
import { motion, AnimatePresence, easing } from "./jpe-motion";

/* ═══ SHORTCUT DATA ═══ */
export interface KeyboardShortcut {
  id: string;
  keys: string[];          // e.g. ["Ctrl", "Shift", "P"]
  label: string;
  description: string;
  category: ShortcutCategory;
  mode?: string;           // which workspace mode this applies to
}

type ShortcutCategory =
  | "general"
  | "navigation"
  | "editor"
  | "panels"
  | "translation"
  | "build"
  | "debug"
  | "ai";

const categoryMeta: Record<ShortcutCategory, { label: string; icon: LucideIcon; color: string }> = {
  general:     { label: "General",      icon: Command,    color: T.textSecondary },
  navigation:  { label: "Navigation",   icon: LayoutGrid, color: T.cyan },
  editor:      { label: "Editor",       icon: Code2,      color: T.cyanBright },
  panels:      { label: "Panels",       icon: PanelLeft,  color: T.violet },
  translation: { label: "Translation",  icon: Languages,  color: T.violetBright },
  build:       { label: "Build & Run",  icon: Rocket,     color: T.amber },
  debug:       { label: "Debug",        icon: Bug,        color: T.rose },
  ai:          { label: "AI Assistant",  icon: Sparkles,   color: T.violetBright },
};

export const allShortcuts: KeyboardShortcut[] = [
  // ── General ─────────────────────────────────────────────────
  { id: "keyboard-help",   keys: ["Ctrl", "/"],           label: "Keyboard Shortcuts",    description: "Show this reference overlay",                          category: "general" },
  { id: "save-all",        keys: ["Ctrl", "S"],           label: "Save / Auto-save",      description: "Save all open files; auto-save marks dirty",           category: "general" },
  { id: "undo",            keys: ["Ctrl", "Z"],           label: "Undo",                  description: "Undo last action",                                     category: "general" },
  { id: "redo",            keys: ["Ctrl", "Shift", "Z"], label: "Redo",                  description: "Redo last undone action — also Release Manager",       category: "general" },
  { id: "close-overlay",  keys: ["Esc"],                 label: "Close Overlay",         description: "Close any open panel, modal, or dropdown",             category: "general" },
  { id: "crystal-forge",  keys: ["Ctrl", "Alt", "F"],   label: "Crystal Forge IDE",     description: "Open Crystal Forge alternate workspace",               category: "general" },

  // ── Navigation (mode switching) ──────────────────────────────
  { id: "nav-home",       keys: ["Ctrl", "0"],           label: "Home Dashboard",        description: "Switch to Dashboard workspace",                        category: "navigation" },
  { id: "nav-editor",     keys: ["Ctrl", "1"],           label: "Code Editor",           description: "Switch to Code Editor workspace",                      category: "navigation" },
  { id: "nav-translate",  keys: ["Ctrl", "2"],           label: "Translation",           description: "Switch to dual Translation workspace",                 category: "navigation" },
  { id: "nav-jpe",        keys: ["Ctrl", "3"],           label: "JPE Language",          description: "Switch to JPE Language Editor",                        category: "navigation" },
  { id: "nav-graph",      keys: ["Ctrl", "4"],           label: "Dependency Graph",      description: "Switch to Dependency Graph view",                      category: "navigation" },
  { id: "nav-diff",       keys: ["Alt", "D"],            label: "Diff Viewer",           description: "Open XML side-by-side diff viewer (Phase 24)",          category: "navigation" },
  { id: "nav-conflicts",  keys: ["Ctrl", "5"],           label: "Conflict Detector",     description: "Switch to Conflict Detector workspace",                category: "navigation" },
  { id: "nav-build",      keys: ["Ctrl", "6"],           label: "Build Pipeline",        description: "Switch to Build Pipeline workspace",                   category: "navigation" },
  { id: "nav-library",    keys: ["Ctrl", "7"],           label: "Mod Library",           description: "Switch to Mod Library browser",                        category: "navigation" },
  { id: "nav-plugins",    keys: ["Ctrl", "8"],           label: "Plugin Market",         description: "Switch to Plugin Marketplace",                         category: "navigation" },
  { id: "nav-vault",      keys: ["Ctrl", "9"],           label: "Rebel's Vault",         description: "Switch to Rebel's Vault CRM workspace",               category: "navigation" },

  // ── Editor ───────────────────────────────────────────────────
  { id: "find",           keys: ["Ctrl", "F"],           label: "Find in File",          description: "Open find bar in current file",                        category: "editor" },
  { id: "replace",        keys: ["Ctrl", "H"],           label: "Find & Replace",        description: "Open inline find and replace bar",                     category: "editor" },
  { id: "goto-line",      keys: ["Ctrl", "G"],           label: "Go to Line",            description: "Jump to a specific line number",                       category: "editor" },
  { id: "select-all",     keys: ["Ctrl", "A"],           label: "Select All",            description: "Select all text in active editor",                     category: "editor" },
  { id: "toggle-comment", keys: ["Ctrl", "/"],           label: "Toggle Comment",        description: "Comment or uncomment selected lines",                  category: "editor" },
  { id: "multicursor",    keys: ["Ctrl", "D"],           label: "Add to Selection",      description: "Add next occurrence to multi-cursor selection",         category: "editor" },
  { id: "fold-all",       keys: ["Ctrl", "Shift", "["], label: "Fold All",              description: "Collapse all code regions",                            category: "editor" },
  { id: "unfold-all",     keys: ["Ctrl", "Shift", "]"], label: "Unfold All",            description: "Expand all code regions",                              category: "editor" },
  { id: "snippet-mgr",   keys: ["Ctrl", "Shift", "S"], label: "Snippet Manager",       description: "Open the JPE code snippet library overlay",            category: "editor" },
  { id: "global-search",  keys: ["Ctrl", "Shift", "F"], label: "Global Search",         description: "Open full-screen global search & replace overlay",     category: "editor" },

  // ── Panels ───────────────────────────────────────────────────
  { id: "toggle-explorer", keys: ["Ctrl", "B"],          label: "Toggle Explorer",       description: "Show or hide the left Explorer / activity panel",      category: "panels" },
  { id: "toggle-console",  keys: ["Ctrl", "`"],          label: "Toggle Console",        description: "Show or hide the bottom Diagnostics console",          category: "panels" },
  { id: "close-tab",       keys: ["Ctrl", "W"],          label: "Close Active Tab",      description: "Close the currently active file tab",                  category: "panels" },
  { id: "cycle-tabs",      keys: ["Ctrl", "Tab"],        label: "Cycle Tabs",            description: "Switch between open file tabs",                        category: "panels" },
  { id: "perf-hud",        keys: ["Ctrl", "Shift", "M"],label: "Performance HUD",       description: "Toggle real-time CPU / memory metrics overlay",        category: "panels" },
  { id: "extensions",      keys: ["Ctrl", "Shift", "X"],label: "Extensions Panel",      description: "Open Extensions Marketplace in sidebar",               category: "panels" },
  { id: "cmd-palette",     keys: ["Ctrl", "Shift", "P"],label: "Live Preview",          description: "Open in-game UI simulator (Phase 21)",                 category: "panels" },

  // ── Translation ──────────────────────────────────────────────
  { id: "stbl-mgr",        keys: ["Ctrl", "Shift", "T"],label: "String Table Manager",  description: "Open STBL editor with FNV-32a hash generator",         category: "translation" },
  { id: "validate-schema", keys: ["Ctrl", "Shift", "V"],label: "Mod Validator",         description: "Validate mod against Sims 4 schema rules",             category: "translation" },
  { id: "trans-memory",    keys: ["Ctrl", "Shift", "N"],label: "Translation Memory",    description: "Open fuzzy-match translation memory + TMX support",    category: "translation" },
  { id: "localization",    keys: ["Ctrl", "Shift", "L"],label: "Localization Coverage", description: "Open locale analytics and coverage dashboard",          category: "translation" },
  { id: "sync-scroll",     keys: ["Alt", "S"],           label: "Toggle Sync Scroll",   description: "Sync scrolling between XML and JPE panels",            category: "translation" },
  { id: "next-warning",    keys: ["F8"],                 label: "Next Warning",          description: "Jump to next translation warning",                     category: "translation" },
  { id: "prev-warning",    keys: ["Shift", "F8"],        label: "Previous Warning",      description: "Jump to previous translation warning",                 category: "translation" },

  // ── Build & Run ──────────────────────────────────────────────
  { id: "build-run",       keys: ["F5"],                 label: "Build & Run",           description: "Execute the full build pipeline",                      category: "build" },
  { id: "quick-build",     keys: ["Ctrl", "F5"],         label: "Quick Build",           description: "Build with cached stages (faster)",                    category: "build" },
  { id: "stop-build",      keys: ["Shift", "F5"],        label: "Stop Build",            description: "Cancel the current build process",                     category: "build" },
  { id: "pkg-export",      keys: ["Ctrl", "Shift", "E"],label: "Package Export Wizard", description: "Open wizard to export .package file (Phase 13)",       category: "build" },
  { id: "build-profiles",  keys: ["Ctrl", "Shift", "U"],label: "Build Profiles",        description: "Manage build configurations and flags",                category: "build" },
  { id: "release-mgr",     keys: ["Ctrl", "Shift", "Z"],label: "Release Manager",       description: "Version bump, tag, and publish workflow (Phase 20)",   category: "build" },
  { id: "mod-templates",   keys: ["Ctrl", "Shift", "W"],label: "Mod Template Wizard",   description: "Scaffold new mod from project template (Phase 16)",    category: "build" },
  { id: "resources-brw",   keys: ["Ctrl", "Shift", "B"],label: "Resource Browser",      description: "Browse and import Sims 4 resources (Phase 16)",        category: "build" },

  // ── Debug ────────────────────────────────────────────────────
  { id: "start-debug",     keys: ["F9"],                 label: "Start Debugging",       description: "Launch debugger with current configuration",           category: "debug" },
  { id: "step-over",       keys: ["F10"],                label: "Step Over",             description: "Execute current line and move to next",                category: "debug" },
  { id: "step-into",       keys: ["F11"],                label: "Step Into",             description: "Step into function call on current line",              category: "debug" },
  { id: "clear-console",   keys: ["Ctrl", "L"],          label: "Clear Console",         description: "Clear all entries in the diagnostics console",         category: "debug" },
  { id: "mod-health",      keys: ["Ctrl", "Shift", "Y"],label: "Mod Health Dashboard",  description: "Open quality score and issue breakdown (Phase 19)",    category: "debug" },
  { id: "test-runner",     keys: ["Ctrl", "Shift", "J"],label: "Test Runner",           description: "Run 20-test suite against mod validator rules",        category: "debug" },
  { id: "conflict-res",    keys: ["Ctrl", "Shift", "R"],label: "Conflict Resolver",     description: "Open conflict resolution wizard (Phase 13)",           category: "debug" },

  // ── AI & Docs ────────────────────────────────────────────────
  { id: "ai-suggest",      keys: ["Ctrl", "Space"],      label: "AI Suggest",            description: "Request Gemini suggestion at cursor position",         category: "ai" },
  { id: "ai-explain",      keys: ["Ctrl", "Shift", "I"],label: "Usage Analytics",       description: "Open usage analytics dashboard (Phase 19)",           category: "ai" },
  { id: "ai-fix",          keys: ["Ctrl", "."],          label: "AI Quick Fix",          description: "Apply AI-suggested quick fix for current error",       category: "ai" },
  { id: "doc-gen",         keys: ["Ctrl", "Shift", "G"],label: "Doc Generator",         description: "Auto-generate mod documentation (Phase 22)",          category: "ai" },
  { id: "api-ref",         keys: ["Ctrl", "Shift", "K"],label: "API Reference",         description: "Browse Sims 4 SDK class reference (Phase 22)",        category: "ai" },
  { id: "symbol-outline",  keys: ["Ctrl", "Shift", "O"],label: "Symbol Outline",        description: "Open symbol tree for active file (Phase 17)",         category: "ai" },
  { id: "hover-docs",      keys: ["Ctrl", "Shift", "D"],label: "Tuning Hover Docs",     description: "Show hover documentation panel (Phase 17)",           category: "ai" },
  { id: "hot-reload",      keys: ["Ctrl", "Shift", "Q"],label: "Hot Reload Watcher",    description: "Toggle file watcher + auto-reload panel (Phase 21)",  category: "ai" },
  { id: "team-annots",     keys: ["Ctrl", "Shift", ";"],label: "Team Annotations",      description: "Open threaded inline code comments (Phase 23)",       category: "ai" },
  { id: "batch-ops",       keys: ["Ctrl", "Shift", "A"],label: "Batch Operations",      description: "Bulk rename, convert, or validate files (Phase 18)", category: "ai" },
  { id: "edit-history",    keys: ["Ctrl", "Shift", "H"],label: "Edit History",          description: "Open undo/redo history panel (Phase 13)",             category: "ai" },
  { id: "changelog",       keys: ["Ctrl", "Shift", "C"],label: "What's New",            description: "View JPE Studio changelog modal (Phase 14)",          category: "ai" },
];

/* ═══ KBD Key Renderer ═══ */
function Kbd({ children }: { children: string }) {
  const isModifier = ["Ctrl", "Shift", "Alt", "Cmd", "Meta", "Tab"].includes(children);
  const isSpecial = ["Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "Enter", "Space", "Backspace", "Delete"].includes(children);
  return (
    <span
      className="inline-flex items-center justify-center rounded-md"
      style={{
        fontSize: 10,
        fontFamily: T.mono,
        fontWeight: 700,
        color: isModifier ? T.cyan : isSpecial ? T.violet : T.textPrimary,
        background: isModifier ? `${T.cyan}12` : isSpecial ? `${T.violet}12` : "rgba(255,255,255,0.06)",
        border: `1px solid ${isModifier ? `${T.cyan}25` : isSpecial ? `${T.violet}25` : "rgba(255,255,255,0.1)"}`,
        padding: "2px 6px",
        minWidth: 22,
        letterSpacing: "0.02em",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {children === "Ctrl" ? (navigator.platform.includes("Mac") ? "\u2318" : "Ctrl") :
       children === "Shift" ? "\u21E7" :
       children === "Alt" ? (navigator.platform.includes("Mac") ? "\u2325" : "Alt") :
       children === "Esc" ? "Esc" :
       children === "Space" ? "\u2423" :
       children === "Tab" ? "\u21B9" :
       children}
    </span>
  );
}

function KeyCombo({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((k, i) => (
        <span key={i} className="flex items-center gap-1">
          <Kbd>{k}</Kbd>
          {i < keys.length - 1 && (
            <span style={{ fontSize: 9, color: T.textDim, fontWeight: 700 }}>+</span>
          )}
        </span>
      ))}
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsOverlay({ isOpen, onClose }: KeyboardShortcutsProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ShortcutCategory | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  /* ── Phase 7: Focus management ── */
  useReturnFocus(isOpen);
  useFocusTrap(modalRef, isOpen, "shortcuts-search-input");

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setActiveCategory("all");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    let items = allShortcuts;
    if (activeCategory !== "all") {
      items = items.filter(s => s.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(s =>
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.keys.join(" ").toLowerCase().includes(q) ||
        s.category.includes(q)
      );
    }
    return items;
  }, [search, activeCategory]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {};
    for (const s of filtered) {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    }
    return groups;
  }, [filtered]);

  const categories = Object.keys(categoryMeta) as ShortcutCategory[];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: "min(900px, 90vw)",
              maxHeight: "min(680px, 85vh)",
              background: T.bgPanel,
              border: `1px solid ${T.border}`,
              boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.05), ${T.glowCyan}, ${T.glowViolet}`,
            }}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: easing.outStandard }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            aria-describedby="shortcuts-desc"
          >
            {/* Top glow accent */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.cyan}50, ${T.violet}50, transparent)` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.cyan}20, ${T.violet}20)`, border: `1px solid ${T.borderActive}` }}>
                  <Keyboard size={16} color={T.cyan} />
                </div>
                <div>
                  <h2 id="shortcuts-title" style={{ fontSize: 16, fontWeight: 800, fontFamily: T.display, color: T.textPrimary }}>Keyboard Shortcuts</h2>
                  <p id="shortcuts-desc" style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono }}>{allShortcuts.length} shortcuts available</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Kbd>Ctrl</Kbd>
                  <span style={{ fontSize: 9, color: T.textDim, fontWeight: 700 }}>+</span>
                  <Kbd>/</Kbd>
                  <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 4 }}>to toggle</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                  aria-label="Close keyboard shortcuts reference"
                >
                  <X size={16} color={T.textMuted} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Search bar */}
            <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                style={{
                  background: T.bgInput,
                  border: `1px solid ${search ? T.borderActive : T.borderSubtle}`,
                  boxShadow: search ? `0 0 12px rgba(99,179,237,0.08)` : "none",
                }}>
                <Search size={14} color={search ? T.cyan : T.textMuted} />
                <input
                  ref={inputRef}
                  id="shortcuts-search-input"
                  className="flex-1 bg-transparent outline-none"
                  placeholder="Search shortcuts... (e.g. 'build', 'ctrl+s', 'translate')"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ fontSize: 13, color: T.textPrimary, fontFamily: T.sans }}
                  spellCheck={false}
                  aria-label="Search keyboard shortcuts"
                  aria-controls="shortcuts-list"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="p-0.5 rounded hover:bg-white/5">
                    <X size={12} color={T.textMuted} />
                  </button>
                )}
                <Badge color={T.textMuted} bg="rgba(255,255,255,0.04)">{filtered.length} results</Badge>
              </div>
            </div>

            {/* Category chips */}
            <div
              className="px-5 py-2.5 flex items-center gap-1.5 flex-shrink-0 overflow-x-auto"
              style={{ borderBottom: `1px solid ${T.borderSubtle}` }}
              role="toolbar"
              aria-label="Filter shortcuts by category"
            >
              <button
                onClick={() => setActiveCategory("all")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all flex-shrink-0"
                style={{
                  fontSize: 11, fontWeight: activeCategory === "all" ? 700 : 500,
                  color: activeCategory === "all" ? T.textPrimary : T.textTertiary,
                  background: activeCategory === "all" ? "rgba(255,255,255,0.06)" : "transparent",
                  border: `1px solid ${activeCategory === "all" ? "rgba(255,255,255,0.1)" : "transparent"}`,
                }}
                aria-pressed={activeCategory === "all"}
                aria-label={`All categories — ${allShortcuts.length} shortcuts`}
              >
                <Zap size={11} color={activeCategory === "all" ? T.cyan : T.textMuted} aria-hidden="true" />
                All
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }} aria-hidden="true">{allShortcuts.length}</span>
              </button>
              {categories.map(cat => {
                const meta = categoryMeta[cat];
                const Icon = meta.icon;
                const isActive = activeCategory === cat;
                const count = allShortcuts.filter(s => s.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all flex-shrink-0"
                    style={{
                      fontSize: 11, fontWeight: isActive ? 700 : 500,
                      color: isActive ? T.textPrimary : T.textTertiary,
                      background: isActive ? `${meta.color}12` : "transparent",
                      border: `1px solid ${isActive ? `${meta.color}25` : "transparent"}`,
                    }}
                    aria-pressed={isActive}
                    aria-label={`${meta.label} category — ${count} shortcuts`}
                  >
                    <Icon size={11} color={isActive ? meta.color : T.textMuted} aria-hidden="true" />
                    {meta.label}
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: isActive ? meta.color : T.textDim }} aria-hidden="true">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Shortcuts list */}
            <div id="shortcuts-list" className="flex-1 overflow-y-auto px-5 py-3" role="list" aria-label="Keyboard shortcuts">
              {Object.keys(grouped).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search size={32} color={T.textDim} className="mb-3" />
                  <p style={{ fontSize: 13, color: T.textMuted }}>No shortcuts match your search</p>
                  <p style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>Try different keywords</p>
                </div>
              ) : (
                Object.entries(grouped).map(([cat, items]) => {
                  const meta = categoryMeta[cat as ShortcutCategory];
                  const Icon = meta.icon;
                  return (
                    <div key={cat} className="mb-5" role="group" aria-label={`${meta.label} shortcuts`}>
                      {/* Category header */}
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={13} color={meta.color} aria-hidden="true" />
                        <span style={{ fontSize: 11, fontWeight: 800, color: meta.color, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{meta.label}</span>
                        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${meta.color}30, transparent)` }} />
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{items.length} shortcuts</span>
                      </div>
                      {/* Shortcut rows */}
                      <div className="space-y-0.5">
                        {items.map(shortcut => (
                          <div
                            key={shortcut.id}
                            role="listitem"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group"
                            style={{ background: "transparent" }}
                            aria-label={`${shortcut.label}: ${shortcut.keys.join(" + ")}. ${shortcut.description}`}
                            onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          >
                            {/* Key combo */}
                            <div className="flex-shrink-0" style={{ minWidth: 160 }}>
                              <KeyCombo keys={shortcut.keys} />
                            </div>
                            {/* Label & description */}
                            <div className="flex-1 min-w-0">
                              <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{shortcut.label}</span>
                              <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: 10, color: T.textMuted }}>
                                {shortcut.description}
                              </span>
                            </div>
                            {/* Category badge */}
                            <span className="flex-shrink-0 px-2 py-0.5 rounded-md opacity-40 group-hover:opacity-100 transition-opacity"
                              style={{ fontSize: 8, fontWeight: 700, color: meta.color, background: `${meta.color}12`, border: `1px solid ${meta.color}20`, letterSpacing: "0.06em" }}>
                              {meta.label.toUpperCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-2.5 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: T.bgSurface }}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Kbd>Esc</Kbd>
                  <span style={{ fontSize: 10, color: T.textMuted }}>close</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Kbd>Tab</Kbd>
                  <span style={{ fontSize: 10, color: T.textMuted }}>cycle categories</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>JPE Studio v4.2.0</span>
                <div className="w-px h-3" style={{ background: T.border }} />
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>Customize in Settings &gt; Keybindings</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══ SETTINGS KEYBINDINGS SECTION ═══ */
export function KeybindingsSection() {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [listeningKeys, setListeningKeys] = useState<string[]>([]);

  const categories = Object.keys(categoryMeta) as ShortcutCategory[];

  const filtered = useMemo(() => {
    if (!search.trim()) return allShortcuts;
    const q = search.toLowerCase();
    return allShortcuts.filter(s =>
      s.label.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.keys.join("+").toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {};
    for (const s of filtered) {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    }
    return groups;
  }, [filtered]);

  // Key listener for editing
  useEffect(() => {
    if (!editingId) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      const keys: string[] = [];
      if (e.ctrlKey || e.metaKey) keys.push("Ctrl");
      if (e.shiftKey) keys.push("Shift");
      if (e.altKey) keys.push("Alt");
      if (e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt" && e.key !== "Meta") {
        keys.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
      }
      if (keys.length > 0) {
        setListeningKeys(keys);
        if (e.key !== "Control" && e.key !== "Shift" && e.key !== "Alt" && e.key !== "Meta") {
          // Complete the binding
          setTimeout(() => {
            setEditingId(null);
            setListeningKeys([]);
          }, 300);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editingId]);

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
          <Search size={12} color={T.textMuted} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search keybindings..."
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 12, color: T.textSecondary, fontFamily: T.sans }} spellCheck={false} />
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl p-3 mb-5" style={{ background: `${T.cyan}08`, border: `1px solid ${T.cyan}20` }}>
        <div className="flex items-start gap-2">
          <Keyboard size={14} color={T.cyan} className="flex-shrink-0 mt-0.5" />
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary }}>Customizable Keybindings</p>
            <p style={{ fontSize: 10, color: T.textMuted, marginTop: 2, lineHeight: 1.5 }}>
              Click on any shortcut key combo to re-assign it. Press <span style={{ color: T.cyan, fontFamily: T.mono, fontWeight: 600 }}>Ctrl+/</span> to open the keyboard shortcuts cheatsheet overlay.
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-4">
        {categories.map(cat => {
          const meta = categoryMeta[cat];
          const count = allShortcuts.filter(s => s.category === cat).length;
          return (
            <div key={cat} className="flex items-center gap-1.5 px-2 py-1 rounded-md"
              style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
              <meta.icon size={10} color={meta.color} />
              <span style={{ fontSize: 9, fontWeight: 700, color: meta.color }}>{count}</span>
            </div>
          );
        })}
        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{allShortcuts.length} total</span>
      </div>

      {/* Shortcut groups */}
      {Object.entries(grouped).map(([cat, items]) => {
        const meta = categoryMeta[cat as ShortcutCategory];
        const Icon = meta.icon;
        return (
          <div key={cat} className="mb-5">
            <div className="flex items-center gap-2 mb-2 pb-1" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
              <Icon size={12} color={meta.color} />
              <Eyebrow color={meta.color}>{meta.label.toUpperCase()}</Eyebrow>
              <Badge color={meta.color} bg={`${meta.color}12`}>{items.length}</Badge>
            </div>
            <div className="space-y-0.5">
              {items.map(s => {
                const isEditing = editingId === s.id;
                return (
                  <div key={s.id} className="flex items-center justify-between py-2 px-2 rounded-lg transition-colors"
                    style={{ background: isEditing ? `${T.cyan}08` : "transparent" }}
                    onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = T.bgHover; }}
                    onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{s.label}</span>
                      <span className="block" style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>{s.description}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setEditingId(null);
                          setListeningKeys([]);
                        } else {
                          setEditingId(s.id);
                          setListeningKeys([]);
                        }
                      }}
                      className="flex-shrink-0 rounded-lg px-2 py-1 transition-all"
                      style={{
                        background: isEditing ? `${T.cyan}15` : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isEditing ? T.borderActive : T.borderSubtle}`,
                        boxShadow: isEditing ? `0 0 8px ${T.cyan}20` : "none",
                      }}
                      title={isEditing ? "Press a key combination" : "Click to edit"}
                    >
                      {isEditing ? (
                        listeningKeys.length > 0 ? (
                          <KeyCombo keys={listeningKeys} />
                        ) : (
                          <span className="flex items-center gap-1.5" style={{ fontSize: 10, color: T.cyan, fontFamily: T.mono }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.cyan }} />
                            Listening...
                          </span>
                        )
                      ) : (
                        <KeyCombo keys={s.keys} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}