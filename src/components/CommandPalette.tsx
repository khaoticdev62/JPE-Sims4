"use client";

import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from "react";
import {
  Search, Command, Languages, Rocket, Shield, Bug, Sparkles,
  Database, Network, Package, Settings, Code2, BarChart3,
  Library, Puzzle, Play, FileCode, Globe, Braces, FileText,
  Terminal, RefreshCw, Download, Upload, Eye, Folder,
  GitBranch, GitMerge, Copy, Layers, Hash, Wrench, Zap, Filter,
  ArrowRight, Clock, LayoutGrid, BookOpen,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence, easing } from "./jpe-motion";
import { T } from "./robust/jpe-theme";
import type { WorkspaceMode } from "./robust/jpe-theme";
import { useFocusTrap, useReturnFocus } from "./jpe-a11y";
import { useUIStore } from "../stores/useUIStore";

/* ═══ TYPES ═══ */
interface PaletteCommand {
  id: string;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  color: string;
  category: CommandCategory;
  action?: () => void;
  description?: string;
}

type CommandCategory = "translation" | "build" | "navigation" | "search" | "analysis" | "debug" | "editor" | "general" | "creation" | "ai";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchMode?: (mode: WorkspaceMode) => void;
  currentMode?: WorkspaceMode;
}

/* ═══ FILE LIST (for quick-open) ═══ */
const quickOpenFiles = [
  { name: "S4_034AEECB_trait_Evil.xml", path: "src/tuning/", icon: FileCode, color: "#63B3ED", size: "18.2 KB" },
  { name: "S4_03B33DDF_BG_YA_shorts.xml", path: "src/tuning/", icon: FileCode, color: "#63B3ED", size: "24.8 KB" },
  { name: "S4_0904DF10_buff_Energized.xml", path: "src/tuning/", icon: FileCode, color: "#63B3ED", size: "12.4 KB" },
  { name: "S4_16CD1E22_interaction_Cook.xml", path: "src/tuning/", icon: FileCode, color: "#63B3ED", size: "31.6 KB" },
  { name: "S4_E882D22F_recipe_Salad.xml", path: "src/tuning/", icon: FileCode, color: "#63B3ED", size: "9.7 KB" },
  { name: "en_US.stbl", path: "src/translations/", icon: Globe, color: "#A78BFA", size: "156.7 KB" },
  { name: "ja_JP.stbl", path: "src/translations/", icon: Globe, color: "#A78BFA", size: "148.2 KB" },
  { name: "de_DE.stbl", path: "src/translations/", icon: Globe, color: "#A78BFA", size: "152.1 KB" },
  { name: "fr_FR.stbl", path: "src/translations/", icon: Globe, color: "#A78BFA", size: "89.4 KB" },
  { name: "jpe_translator.ts4script", path: "src/scripts/", icon: Code2, color: "#48BB78", size: "8.9 KB" },
  { name: "mod_injector.ts4script", path: "src/scripts/", icon: Code2, color: "#48BB78", size: "14.3 KB" },
  { name: "settings.json", path: "src/configs/", icon: Braces, color: "#F6AD55", size: "2.1 KB" },
  { name: "overrides.json", path: "src/configs/", icon: Braces, color: "#F6AD55", size: "4.8 KB" },
  { name: "manifest.json", path: "", icon: Braces, color: "#F6AD55", size: "1.2 KB" },
  { name: "README.md", path: "", icon: FileText, color: "#718096", size: "3.8 KB" },
  { name: "EvilTraitOverride.package", path: "build/", icon: Package, color: "#FC8181", size: "2.4 MB" },
];

/* ═══ SYMBOL LIST (for @ symbol search) ═══ */
const symbolList = [
  { name: "trait_Evil", kind: "Instance", file: "S4_034AEECB_trait_Evil.xml", line: 3, color: "#63B3ED" },
  { name: "display_name", kind: "Tunable", file: "S4_034AEECB_trait_Evil.xml", line: 5, color: "#A78BFA" },
  { name: "trait_description", kind: "Tunable", file: "S4_034AEECB_trait_Evil.xml", line: 8, color: "#A78BFA" },
  { name: "conflicting_traits", kind: "TunableList", file: "S4_034AEECB_trait_Evil.xml", line: 11, color: "#48BB78" },
  { name: "buffs_on_add", kind: "TunableList", file: "S4_034AEECB_trait_Evil.xml", line: 18, color: "#48BB78" },
  { name: "buff_Evil_Aura", kind: "Value", file: "S4_034AEECB_trait_Evil.xml", line: 20, color: "#F6AD55" },
  { name: "translate_string", kind: "Function", file: "jpe_translator.ts4script", line: 42, color: "#48BB78" },
  { name: "apply_tuning_patch", kind: "Function", file: "mod_injector.ts4script", line: 118, color: "#48BB78" },
  { name: "resolve_conflicts", kind: "Function", file: "conflict_resolver.ts4script", line: 77, color: "#FC8181" },
  { name: "STR_Evil", kind: "StringKey", file: "en_US.stbl", line: 1, color: "#A78BFA" },
  { name: "STR_EvilDesc", kind: "StringKey", file: "en_US.stbl", line: 2, color: "#A78BFA" },
  { name: "interaction_Cook", kind: "Instance", file: "S4_16CD1E22_interaction_Cook.xml", line: 3, color: "#63B3ED" },
  { name: "recipe_Salad", kind: "Instance", file: "S4_E882D22F_recipe_Salad.xml", line: 3, color: "#63B3ED" },
  { name: "buff_Energized", kind: "Instance", file: "S4_0904DF10_buff_Energized.xml", line: 3, color: "#F6AD55" },
];

/* ═══ CATEGORY META ═══ */
const categoryMeta: Record<CommandCategory, { label: string; color: string }> = {
  translation: { label: "Translation", color: T.violet },
  build: { label: "Build", color: T.amber },
  navigation: { label: "Navigation", color: T.cyan },
  search: { label: "Search", color: T.textSecondary },
  analysis: { label: "Analysis", color: T.emerald },
  debug: { label: "Debug", color: T.rose },
  editor: { label: "Editor", color: T.cyanBright },
  general: { label: "General", color: T.textTertiary },
  creation: { label: "Creation", color: T.emerald },
  ai: { label: "AI Tools", color: T.violetBright },
};

/* ═══ FUZZY MATCH ═══ */
function fuzzyMatch(query: string, text: string): { match: boolean; score: number; indices: number[] } {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return { match: true, score: 0, indices: [] };

  const subIdx = t.indexOf(q);
  if (subIdx !== -1) {
    return { match: true, score: 100 - subIdx, indices: Array.from({ length: q.length }, (_, i) => subIdx + i) };
  }

  let qi = 0;
  const indices: number[] = [];
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) { indices.push(ti); qi++; }
  }
  if (qi === q.length) {
    const gap = indices[indices.length - 1] - indices[0];
    return { match: true, score: 50 - gap, indices };
  }
  return { match: false, score: -1, indices: [] };
}

/* ═══ HIGHLIGHTED TEXT ═══ */
function HighlightedText({ text, indices }: { text: string; indices: number[] }) {
  if (!indices.length) return <span>{text}</span>;
  const set = new Set(indices);
  return (
    <span>
      {text.split("").map((ch, i) => (
        <span key={i} style={set.has(i) ? { color: T.cyan, fontWeight: 600 } : undefined}>{ch}</span>
      ))}
    </span>
  );
}

/* ═══ MODE BADGE ═══ */
function ModeBadge({ children, color, bg, border }: { children: ReactNode; color: string; bg: string; border: string }) {
  return (
    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 9, fontFamily: T.mono, color, background: bg, border: `1px solid ${border}` }}>
      {children}
    </span>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export function CommandPalette({ isOpen, onClose, onSwitchMode, currentMode: _currentMode }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [executedAction, setExecutedAction] = useState<string | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const { setBuffWizardOpen, setInteractionWizardOpen, setTraitWizardOpen, setPromptToJPEOpen, setHelpCenterOpen } = useUIStore();

  // Multi-mode detection: ">", "@", ":" prefixes
  const isCommandMode = query.startsWith(">");
  const isLineMode = /^:\d*$/.test(query);          // ":42" → Go to Line
  const isSymbolMode = query.startsWith("@");       // "@trait_Evil" → Symbol search
  const searchTerm = isCommandMode ? query.slice(1).trim()
    : isSymbolMode ? query.slice(1).trim()
    : isLineMode ? query.slice(1)
    : query.trim();
  const lineNumber = isLineMode ? (searchTerm ? parseInt(searchTerm, 10) : null) : null;

  /* ═══ BUILD COMMANDS ═══ */
  const commands = useMemo<PaletteCommand[]>(() => {
    const switchMode = (m: WorkspaceMode) => () => onSwitchMode?.(m);

    return [
      // Translation
      { id: "tr-translate", icon: Languages, label: "JPE: Translate Current File", shortcut: "Ctrl+Shift+T", color: T.violet, category: "translation", action: switchMode("translation"), description: "Run AI translation on the active tuning file" },
      { id: "tr-batch", icon: Layers, label: "JPE: Batch Translate All", shortcut: "Ctrl+Shift+Alt+T", color: T.violet, category: "translation", action: switchMode("translation"), description: "Translate all untranslated strings in project" },
      { id: "tr-suggest", icon: Sparkles, label: "AI: Suggest Translation", shortcut: "Ctrl+Space", color: T.violetBright, category: "translation", description: "Get AI-powered translation suggestion for selected string" },
      { id: "tr-validate", icon: Shield, label: "JPE: Validate Translations", color: T.violet, category: "translation", description: "Check all translations for accuracy and completeness" },
      { id: "tr-export-stbl", icon: Download, label: "JPE: Export STBL", color: T.violet, category: "translation", description: "Export string table to .stbl format" },
      { id: "tr-import-stbl", icon: Upload, label: "JPE: Import STBL", color: T.violet, category: "translation", description: "Import translations from .stbl file" },

      // Build
      { id: "bd-run", icon: Rocket, label: "Build: Run Pipeline", shortcut: "Ctrl+Shift+B", color: T.amber, category: "build", action: switchMode("build"), description: "Execute the full build pipeline" },
      { id: "bd-export", icon: Package, label: "Build: Export .package File", shortcut: "Ctrl+E", color: T.amber, category: "build", description: "Export current project as .package" },
      { id: "bd-clean", icon: RefreshCw, label: "Build: Clean & Rebuild", color: T.amber, category: "build", description: "Clean build cache and rebuild from scratch" },
      { id: "bd-deploy", icon: Play, label: "Build: Deploy to Mods Folder", color: T.amber, category: "build", description: "Copy built .package to Sims 4 Mods directory" },
      { id: "bd-hash", icon: Hash, label: "Build: Regenerate Hashes", color: T.amber, category: "build", description: "Recalculate FNV hashes for all string entries" },

      // Navigation
      { id: "nav-code", icon: Code2, label: "Go to: Code Editor", shortcut: "Ctrl+1", color: T.cyan, category: "navigation", action: switchMode("code") },
      { id: "nav-trans", icon: Languages, label: "Go to: Translation View", shortcut: "Ctrl+2", color: T.violet, category: "navigation", action: switchMode("translation") },
      { id: "nav-jpe", icon: BookOpen, label: "Go to: JPE Language Editor", shortcut: "Ctrl+3", color: T.violetBright, category: "navigation", action: switchMode("jpe") },
      { id: "nav-depgraph", icon: Network, label: "Go to: Dependency Graph", shortcut: "Ctrl+4", color: T.emerald, category: "navigation", action: switchMode("depgraph") },
      { id: "nav-diff", icon: GitMerge, label: "Go to: Diff Viewer", color: T.violet, category: "navigation", action: switchMode("diff"), description: "Side-by-side XML conflict diff viewer" },
      { id: "nav-conflicts", icon: GitMerge, label: "Go to: Conflict Resolver", shortcut: "Ctrl+5", color: T.rose, category: "navigation", action: switchMode("conflicts") },
      { id: "nav-build", icon: Rocket, label: "Go to: Build Pipeline", shortcut: "Ctrl+6", color: T.amber, category: "navigation", action: switchMode("build") },
      { id: "nav-library", icon: Library, label: "Go to: Mod Library", shortcut: "Ctrl+7", color: T.cyanBright, category: "navigation", action: switchMode("library") },
      { id: "nav-plugins", icon: Puzzle, label: "Go to: Plugin Marketplace", shortcut: "Ctrl+8", color: T.cyanDeep, category: "navigation", action: switchMode("plugin") },
      { id: "nav-debug", icon: Bug, label: "Go to: Debug Console", color: T.rose, category: "navigation", action: switchMode("debug") },
      { id: "nav-datavis", icon: BarChart3, label: "Go to: Analysis Lab", color: T.emerald, category: "navigation", action: switchMode("datavis") },
      { id: "nav-dashboard", icon: LayoutGrid, label: "Go to: Dashboard", shortcut: "Ctrl+0", color: T.textSecondary, category: "navigation", action: switchMode("dashboard") },
      { id: "nav-ai", icon: Sparkles, label: "Go to: AI Assistant", color: T.violetBright, category: "navigation", action: switchMode("ai") },
      { id: "nav-settings", icon: Settings, label: "Go to: Settings", color: T.textTertiary, category: "navigation", action: switchMode("settings") },
      { id: "nav-vault", icon: Package, label: "Go to: Rebel's Vault", shortcut: "Ctrl+9", color: T.violet, category: "navigation", action: switchMode("vault") },
      { id: "nav-crystal-forge", icon: Globe, label: "Open Crystal Forge IDE", shortcut: "Ctrl+Shift+F", color: T.violetBright, category: "navigation", action: () => { window.location.href = "/crystal-forge"; }, description: "Launch the Crystal Forge alternate workspace surface" },

      // Search
      { id: "sr-tuning", icon: Search, label: "Search Tuning Files...", shortcut: "Ctrl+P", color: T.textSecondary, category: "search", description: "Search for tuning files by name" },
      { id: "sr-string", icon: Filter, label: "Search: Find in String Tables", color: T.textSecondary, category: "search", description: "Search across all STBL entries" },
      { id: "sr-symbol", icon: Hash, label: "Search: Go to Symbol", shortcut: "Ctrl+Shift+O", color: T.textSecondary, category: "search", description: "Jump to XML element or JPE symbol" },
      { id: "sr-replace", icon: Wrench, label: "Search: Find and Replace", shortcut: "Ctrl+H", color: T.textSecondary, category: "search", description: "Find and replace across project files" },

      // Analysis
      { id: "an-conflicts", icon: Shield, label: "Analysis: Scan for Conflicts", shortcut: "Ctrl+Shift+A", color: T.emerald, category: "analysis", action: switchMode("conflicts"), description: "Scan mods for tuning conflicts" },
      { id: "an-deps", icon: Network, label: "Analysis: Show Dependency Graph", shortcut: "Ctrl+D", color: T.cyanDeep, category: "analysis", action: switchMode("depgraph"), description: "Visualize mod dependency tree" },
      { id: "an-validate-xml", icon: FileCode, label: "Analysis: Validate XML Schema", color: T.emerald, category: "analysis", description: "Validate tuning XML against EA schema" },
      { id: "an-perf", icon: Zap, label: "Analysis: Performance Profile", color: T.emerald, category: "analysis", description: "Profile mod performance impact" },

      // Debug
      { id: "db-breakpoint", icon: Bug, label: "Debug: Toggle Breakpoint", shortcut: "F9", color: T.rose, category: "debug", description: "Set/remove breakpoint on current line" },
      { id: "db-console", icon: Terminal, label: "Debug: Open Console", shortcut: "Ctrl+`", color: T.rose, category: "debug", action: switchMode("debug") },
      { id: "db-reload", icon: RefreshCw, label: "Debug: Hot Reload", shortcut: "Ctrl+Shift+R", color: T.rose, category: "debug", description: "Hot-reload modified tuning in game" },
      { id: "db-inspect", icon: Eye, label: "Debug: Inspect Resource Keys", color: T.rose, category: "debug", description: "Inspect DBPF resource key mappings" },

      // Editor
      { id: "ed-format", icon: Code2, label: "Editor: Format Document", shortcut: "Alt+Shift+F", color: T.cyanBright, category: "editor", description: "Format the current document" },
      { id: "ed-fold-all", icon: Layers, label: "Editor: Fold All Regions", shortcut: "Ctrl+K, Ctrl+0", color: T.cyanBright, category: "editor", description: "Collapse all foldable regions" },
      { id: "ed-copy-path", icon: Copy, label: "Editor: Copy File Path", color: T.cyanBright, category: "editor", description: "Copy the active file's path to clipboard" },
      { id: "ed-diff", icon: GitBranch, label: "Editor: Compare with Previous", color: T.cyanBright, category: "editor", description: "Diff current file against last commit" },
      { id: "ed-goto-line", icon: Hash, label: "Editor: Go to Line...", shortcut: "Ctrl+G", color: T.cyanBright, category: "editor", description: "Jump to a specific line number (type :line)" },

      // General
      { id: "gn-stbl", icon: Database, label: "STBL: Open String Table Editor", shortcut: "Ctrl+Shift+S", color: T.cyan, category: "general", description: "Open the visual STBL editor" },
      { id: "gn-settings", icon: Settings, label: "Preferences: Open Settings", shortcut: "Ctrl+,", color: T.textTertiary, category: "general", description: "Open JPE Studio settings" },
      { id: "gn-git", icon: GitBranch, label: "Git: Open Source Control", color: T.textTertiary, category: "general", description: "Open Git source control panel" },
      { id: "gn-folder", icon: Folder, label: "File: Open Project Folder", color: T.textTertiary, category: "general", description: "Open project in system file explorer" },

      // Creation
      { id: "cr-buff", icon: Zap, label: "Create: New Buff Mod", shortcut: "Alt+B", color: T.emerald, category: "creation", action: () => { setBuffWizardOpen(true); onClose(); }, description: "Launch the AI-assisted Buff Creation Wizard" },
      { id: "cr-interaction", icon: Zap, label: "Create: New Interaction", shortcut: "Alt+I", color: T.emerald, category: "creation", action: () => { setInteractionWizardOpen(true); onClose(); }, description: "Launch the AI-assisted Interaction Wizard" },
      { id: "cr-trait", icon: Zap, label: "Create: New Trait", shortcut: "Alt+T", color: T.emerald, category: "creation", action: () => { setTraitWizardOpen(true); onClose(); }, description: "Launch the AI-assisted Trait Wizard" },

      // AI Tools
      { id: "ai-prompt-to-jpe", icon: Sparkles, label: "AI: Prompt to JPE", shortcut: "Ctrl+Shift+J", color: T.violetBright, category: "ai", action: () => { setPromptToJPEOpen(true); onClose(); }, description: "Generate JPE code from natural language description" },

      // Help
      { id: "help-center", icon: BookOpen, label: "Help: Open Help Center", shortcut: "F1", color: T.cyan, category: "general", action: () => { setHelpCenterOpen(true); onClose(); }, description: "Browse documentation, tutorials, and community resources" },
    ];
  }, [onSwitchMode, setBuffWizardOpen, setInteractionWizardOpen, setTraitWizardOpen, setPromptToJPEOpen, setHelpCenterOpen, onClose]);

  /* ═══ FILTER & SORT ═══ */
  const filteredItems = useMemo(() => {
    // Line-goto mode: no list items, handled specially in render
    if (isLineMode) return [];

    if (isCommandMode) {
      const results = commands
        .map(cmd => ({ cmd, ...fuzzyMatch(searchTerm, cmd.label) }))
        .filter(r => r.match)
        .sort((a, b) => {
          const aRecent = recentIds.indexOf(a.cmd.id);
          const bRecent = recentIds.indexOf(b.cmd.id);
          if (aRecent !== -1 && bRecent === -1) return -1;
          if (aRecent === -1 && bRecent !== -1) return 1;
          if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent;
          return b.score - a.score;
        });
      return results.map(r => ({ type: "command" as const, cmd: r.cmd, indices: r.indices }));
    }

    if (isSymbolMode) {
      const results = symbolList
        .map(s => ({ sym: s, ...fuzzyMatch(searchTerm, s.name) }))
        .filter(r => r.match)
        .sort((a, b) => b.score - a.score);
      return results.map(r => ({ type: "symbol" as const, sym: r.sym, indices: r.indices }));
    }

    // File quick-open mode
    if (!searchTerm) {
      const recentCmds = recentIds.slice(0, 3).map(id => commands.find(c => c.id === id)).filter(Boolean) as PaletteCommand[];
      const items: { type: "command" | "file" | "symbol"; cmd?: PaletteCommand; file?: typeof quickOpenFiles[0]; sym?: typeof symbolList[0]; indices: number[] }[] = [];
      recentCmds.forEach(cmd => items.push({ type: "command", cmd, indices: [] }));
      quickOpenFiles.forEach(f => items.push({ type: "file", file: f, indices: [] }));
      return items;
    }
    const fileResults = quickOpenFiles
      .map(f => ({ file: f, ...fuzzyMatch(searchTerm, f.name) }))
      .filter(r => r.match)
      .sort((a, b) => b.score - a.score);
    return fileResults.map(r => ({ type: "file" as const, file: r.file, indices: r.indices }));
  }, [query, isCommandMode, isLineMode, isSymbolMode, searchTerm, commands, recentIds]);

  /* ═══ RESET ON OPEN ═══ */
  useEffect(() => {
    if (isOpen) {
      setQuery(">");
      setSelectedIdx(0);
      setExecutedAction(null);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(1, 1);
        }
      }, 20);
    }
  }, [isOpen]);

  /* ═══ SCROLL SELECTED INTO VIEW ═══ */
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selectedIdx] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIdx]);

  /* ═══ EXECUTE ═══ */
  const executeItem = useCallback((idx: number) => {
    const item = filteredItems[idx];
    if (!item) return;

    if (item.type === "command" && item.cmd) {
      const cmd = item.cmd;
      setRecentIds(prev => [cmd.id, ...prev.filter(id => id !== cmd.id)].slice(0, 8));
      if (cmd.action) {
        cmd.action();
        setExecutedAction(cmd.label);
        setTimeout(() => onClose(), 150);
      } else {
        setExecutedAction(cmd.label);
        setTimeout(() => onClose(), 150);
      }
    } else if (item.type === "file" && item.file) {
      setExecutedAction(`Opened ${item.file.name}`);
      setTimeout(() => onClose(), 150);
    } else if (item.type === "symbol" && item.sym) {
      setExecutedAction(`Jumped to ${item.sym.name} in ${item.sym.file}:${item.sym.line}`);
      setTimeout(() => onClose(), 150);
    }
  }, [filteredItems, onClose]);

  const executeGotoLine = useCallback(() => {
    if (lineNumber !== null && lineNumber > 0) {
      setExecutedAction(`Jumped to line ${lineNumber}`);
      setTimeout(() => onClose(), 150);
    }
  }, [lineNumber, onClose]);

  /* ═══ KEYBOARD NAV ═══ */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, filteredItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isLineMode) executeGotoLine();
      else executeItem(selectedIdx);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Backspace" && query === ">") {
      e.preventDefault();
      setQuery("");
      setSelectedIdx(0);
    }
  }, [filteredItems.length, selectedIdx, executeItem, executeGotoLine, isLineMode, onClose, query]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  /* ═══ FOCUS MANAGEMENT (Phase 7 Accessibility) ═══ */
  useReturnFocus(isOpen);
  useFocusTrap(panelRef, isOpen, "cmd-palette-input");

  /* ═══ ARIA: active descendant id ═══ */
  const activeDescendantId =
    !isLineMode && filteredItems.length > 0 && selectedIdx >= 0 && selectedIdx < filteredItems.length
      ? `cmd-opt-${selectedIdx}`
      : undefined;

  /* ═══ GROUP ITEMS BY CATEGORY (command mode only) ═══ */
  const groupedItems: { category: string; color: string; startIdx: number; items: typeof filteredItems }[] = [];
  if (isCommandMode) {
    const recent = filteredItems.filter(item => item.type === "command" && item.cmd && recentIds.includes(item.cmd.id));
    const rest = filteredItems.filter(item => !(item.type === "command" && item.cmd && recentIds.includes(item.cmd.id)));
    let idx = 0;
    if (recent.length > 0) {
      groupedItems.push({ category: "Recently Used", color: T.textMuted, startIdx: idx, items: recent });
      idx += recent.length;
    }
    const catMap = new Map<CommandCategory, any[]>();
    rest.forEach(item => {
      if (item.type === "command" && item.cmd) {
        const cat = item.cmd.category;
        if (!catMap.has(cat)) catMap.set(cat, []);
        catMap.get(cat)!.push(item);
      }
    });
    catMap.forEach((items, cat) => {
      groupedItems.push({ category: categoryMeta[cat].label, color: categoryMeta[cat].color, startIdx: idx, items });
      idx += items.length;
    });
  }

  const flatIdx = (groupIdx: number, itemIdx: number) => {
    return groupedItems.slice(0, groupIdx).reduce((acc, g) => acc + g.items.length, 0) + itemIdx;
  };

  /* ═══ MODE LABEL ═══ */
  const modeLabel = isCommandMode
    ? <ModeBadge color={T.violet} bg={T.violetDim} border={T.borderViolet}>COMMANDS</ModeBadge>
    : isLineMode
    ? <ModeBadge color={T.amber} bg={T.amberDim} border={`${T.amber}30`}>GO TO LINE</ModeBadge>
    : isSymbolMode
    ? <ModeBadge color={T.emerald} bg={T.emeraldDim} border={`${T.emerald}30`}>SYMBOLS</ModeBadge>
    : <ModeBadge color={T.cyan} bg={T.cyanDim} border={T.borderActive}>FILES</ModeBadge>;

  const placeholderText = isCommandMode ? "Type a command..."
    : isLineMode ? "Enter line number to jump to..."
    : isSymbolMode ? "Search symbols — instances, functions, string keys..."
    : "Search files (> commands, @ symbols, :line)";

  return (
    <AnimatePresence>
    {isOpen && (
    <div className="absolute inset-0 z-[100] flex items-start justify-center pt-[10vh]" onClick={onClose}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0"
        style={{ background: "rgba(7,8,16,0.78)", backdropFilter: T.glassBlur } as React.CSSProperties}
      />

      {/* Panel — ARIA dialog */}
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.94, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: -12 }}
        transition={{ duration: 0.24, ease: easing.outStandard }}
        className="relative w-full max-w-[620px] rounded-2xl overflow-hidden"
        style={{
          background: T.bgSurface,
          border: `1px solid rgba(255,255,255,0.07)`,
          boxShadow: `0 0 100px rgba(99,179,237,0.08), 0 0 50px rgba(139,92,246,0.06), 0 30px 80px rgba(0,0,0,0.55)`,
        } as React.CSSProperties}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={
          isCommandMode ? "Command palette" :
          isSymbolMode ? "Symbol search" :
          isLineMode ? "Go to line" :
          "Quick open"
        }
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 5%, ${T.cyan}80, ${T.violet}80, transparent 95%)` }} />

        {/* Input area */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
          <Command size={15} style={{ color: isCommandMode ? T.violet : isSymbolMode ? T.emerald : isLineMode ? T.amber : T.cyan, flexShrink: 0 }} />
          <input
            ref={inputRef}
            id="cmd-palette-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="flex-1 bg-transparent outline-none placeholder:opacity-40"
            style={{ fontSize: 14, fontFamily: T.sans, color: T.textPrimary }}
            spellCheck={false}
            aria-label={
              isCommandMode ? "Search commands" :
              isSymbolMode ? "Search symbols" :
              isLineMode ? "Go to line number" :
              "Search files, > for commands, @ for symbols, : for line number"
            }
            aria-expanded={!isLineMode && filteredItems.length > 0}
            aria-controls="cmd-palette-results"
            aria-activedescendant={activeDescendantId}
            aria-autocomplete="list"
            autoComplete="off"
          />
          <div className="flex items-center gap-1.5">
            {modeLabel}
            <kbd className="px-2 py-0.5 rounded-md" style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}` }}>
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="cmd-palette-results"
          role="listbox"
          aria-label={isCommandMode ? "Commands" : isSymbolMode ? "Symbols" : "Files"}
          className="max-h-[400px] overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: `${T.bgHover} transparent` }}
        >
          {/* Executed action feedback */}
          {executedAction && (
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: T.cyanDim }}>
              <Zap size={13} color={T.cyan} />
              <span style={{ fontSize: 12, fontFamily: T.mono, color: T.cyan }}>{executedAction}</span>
            </div>
          )}

          {/* ═══ LINE MODE ═══ */}
          {isLineMode && (
            <div className="px-4 py-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                style={{ background: T.bgElevated, border: `1px solid ${T.borderActive}` }}
                onClick={executeGotoLine}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.amberDim }}>
                  <Hash size={16} color={T.amber} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 14, color: T.textPrimary, fontFamily: T.mono, fontWeight: 700 }}>
                    {lineNumber !== null && lineNumber > 0 ? `Go to Line ${lineNumber}` : "Type a line number…"}
                  </div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                    {lineNumber !== null && lineNumber > 0
                      ? `Jump to line ${lineNumber} in the active editor`
                      : "Current file: S4_034AEECB_trait_Evil.xml (32 lines)"}
                  </div>
                </div>
                {lineNumber !== null && lineNumber > 0 && (
                  <ArrowRight size={14} color={T.amber} />
                )}
              </div>
              {lineNumber !== null && lineNumber > 0 && (
                <div className="mt-2 px-1">
                  <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textDim }}>
                    Press Enter to jump · Esc to cancel
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ═══ SYMBOL MODE ═══ */}
          {isSymbolMode && (
            <>
              {filteredItems.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-6">
                  <Hash size={18} color={T.textMuted} />
                  <span style={{ fontSize: 13, color: T.textMuted }}>
                    {searchTerm ? `No symbols matching "${searchTerm}"` : "Type to search symbols"}
                  </span>
                  <span style={{ fontSize: 11, color: T.textDim }}>Searches instances, tunables, functions, string keys</span>
                </div>
              )}
              {!searchTerm && (
                <div className="px-4 pt-2.5 pb-1 flex items-center gap-2">
                  <span className="uppercase" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", fontFamily: T.sans, color: T.emerald, opacity: 0.7 }}>
                    All Symbols ({symbolList.length})
                  </span>
                  <div className="flex-1 h-px" style={{ background: `${T.emerald}15` }} />
                </div>
              )}
              {filteredItems.map((item, idx) => {
                if (item.type !== "symbol" || !item.sym) return null;
                const s = item.sym;
                const isSelected = idx === selectedIdx;
                return (
                  <button key={`sym-${s.name}`}
                    id={`cmd-opt-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-label={`${s.name} — ${s.kind} in ${s.file} line ${s.line}`}
                    className="w-full flex items-center gap-3 px-4 py-2 transition-colors"
                    style={{
                      background: isSelected ? T.bgHover : "transparent",
                      borderLeft: isSelected ? `2px solid ${s.color}` : "2px solid transparent",
                    }}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    onClick={() => executeItem(idx)}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}12` }}>
                      <Hash size={12} color={s.color} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 13, color: T.textPrimary, fontFamily: T.mono }}>
                          <HighlightedText text={s.name} indices={item.indices} />
                        </span>
                        <span className="px-1.5 py-0 rounded" style={{ fontSize: 8, fontWeight: 700, color: s.color, background: `${s.color}14` }}>{s.kind}</span>
                      </div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
                        {s.file} <span style={{ color: T.textDim }}>Ln {s.line}</span>
                      </div>
                    </div>
                    {isSelected && <ArrowRight size={12} color={T.textMuted} className="flex-shrink-0" />}
                  </button>
                );
              })}
            </>
          )}

          {!isLineMode && !isSymbolMode && filteredItems.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8">
              <Search size={20} color={T.textMuted} />
              <span style={{ fontSize: 13, color: T.textMuted }}>No results found</span>
              <span style={{ fontSize: 11, color: T.textDim }}>Try a different search term</span>
            </div>
          )}

          {/* ═══ COMMAND MODE: grouped by category ═══ */}
          {isCommandMode && groupedItems.map((group, gi) => (
            <div key={group.category}>
              <div className="px-4 pt-2.5 pb-1 flex items-center gap-2">
                <span className="uppercase" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", fontFamily: T.sans, color: group.color, opacity: 0.7 }}>
                  {group.category}
                </span>
                <div className="flex-1 h-px" style={{ background: `${group.color}15` }} />
              </div>
              {group.items.map((item, ii) => {
                if (item.type !== "command" || !item.cmd) return null;
                const cmd = item.cmd;
                const Icon = cmd.icon;
                const globalIdx = flatIdx(gi, ii);
                const isSelected = globalIdx === selectedIdx;
                return (
                  <button
                    key={cmd.id}
                    id={`cmd-opt-${globalIdx}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-label={`${cmd.label}${cmd.shortcut ? ` — shortcut: ${cmd.shortcut}` : ""}${cmd.description ? `. ${cmd.description}` : ""}`}
                    className="w-full flex items-center gap-3 px-4 py-2 transition-colors"
                    style={{
                      background: isSelected ? T.bgHover : "transparent",
                      color: isSelected ? T.textPrimary : T.textSecondary,
                      borderLeft: isSelected ? `2px solid ${cmd.color}` : "2px solid transparent",
                    }}
                    onMouseEnter={() => setSelectedIdx(globalIdx)}
                    onClick={() => executeItem(globalIdx)}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cmd.color}12` }}>
                      <Icon size={14} color={cmd.color} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div style={{ fontSize: 13 }}>
                        <HighlightedText text={cmd.label} indices={item.indices} />
                      </div>
                      {isSelected && cmd.description && (
                        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{cmd.description}</div>
                      )}
                    </div>
                    {cmd.shortcut && (
                      <kbd className="px-2 py-0.5 rounded-md flex-shrink-0" style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <ArrowRight size={12} color={T.textMuted} className="flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* ═══ FILE MODE ═══ */}
          {!isCommandMode && !isLineMode && !isSymbolMode && filteredItems.map((item, idx) => {
            const isSelected = idx === selectedIdx;

            if (item.type === "command" && item.cmd) {
              const cmd = item.cmd;
              const Icon = cmd.icon;
              return (
                <button
                  key={`recent-${cmd.id}`}
                  id={`cmd-opt-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`Recent command: ${cmd.label}`}
                  className="w-full flex items-center gap-3 px-4 py-2 transition-colors"
                  style={{
                    background: isSelected ? T.bgHover : "transparent",
                    color: isSelected ? T.textPrimary : T.textSecondary,
                    borderLeft: isSelected ? `2px solid ${T.violet}` : "2px solid transparent",
                  }}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  onClick={() => executeItem(idx)}
                >
                  <Clock size={12} color={T.textMuted} className="flex-shrink-0" />
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${cmd.color}12` }}>
                    <Icon size={12} color={cmd.color} />
                  </div>
                  <span className="flex-1 text-left truncate" style={{ fontSize: 13 }}>{cmd.label}</span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>recent</span>
                </button>
              );
            }

            if (item.type === "file" && item.file) {
              const f = item.file;
              const FIcon = f.icon;
              return (
                <button
                  key={`file-${f.name}`}
                  id={`cmd-opt-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`Open file: ${f.name} in ${f.path || "/"}, ${f.size}`}
                  className="w-full flex items-center gap-3 px-4 py-2 transition-colors"
                  style={{
                    background: isSelected ? T.bgHover : "transparent",
                    color: isSelected ? T.textPrimary : T.textSecondary,
                    borderLeft: isSelected ? `2px solid ${f.color}` : "2px solid transparent",
                  }}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  onClick={() => executeItem(idx)}
                >
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${f.color}12` }}>
                    <FIcon size={12} color={f.color} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span style={{ fontSize: 13 }}>
                      <HighlightedText text={f.name} indices={item.indices} />
                    </span>
                  </div>
                  <span className="truncate" style={{ fontSize: 11, fontFamily: T.mono, color: T.textMuted, maxWidth: 180 }}>
                    {f.path || "/"}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textDim }}>{f.size}</span>
                </button>
              );
            }
            return null;
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
          <div className="flex items-center gap-3">
            {[
              { key: "↑↓", label: "navigate" },
              { key: "↵", label: "execute" },
              { key: ">", label: "commands" },
              { key: "@", label: "symbols" },
              { key: ":", label: "go to line" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded" style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}` }}>
                  {key}
                </kbd>
                <span style={{ fontSize: 10, color: T.textDim }}>{label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textDim }}>
              {isLineMode ? "line jump" : isSymbolMode ? `${filteredItems.length} symbols` : isCommandMode ? `${filteredItems.length} commands` : `${filteredItems.length} items`}
            </span>
            <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>
              Ctrl+Shift+P
            </span>
          </div>
        </div>
      </motion.div>
    </div>
    )}
    </AnimatePresence>
  );
}
