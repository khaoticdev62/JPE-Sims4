import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Search, Zap, Activity, Cpu, Wifi, Code2, FileCode, FolderTree,
  ChevronRight, ChevronDown, File, Folder, FolderOpen,
  Settings, Bell, GitBranch, GitCommit, Clock, AlertTriangle,
  CheckCircle2, XCircle, Plus, X, Minus, Maximize2, Minimize2,
  Terminal, Layers, BarChart3, Globe, Book, Package,
  RotateCcw, PanelBottomClose, PanelBottom,
  Sparkles, Database, Languages, Bug, Play, Pause,
  Info, MoreHorizontal, type LucideIcon, Boxes,
  ArrowRight, Copy, ExternalLink, Filter, Eye, EyeOff,
  Rocket, Shield, Network, Puzzle, Library, Wrench,
  Download, Upload, RefreshCw, Hash, Braces, FileText,
  Gauge, HardDrive, MemoryStick, Monitor,
  SplitSquareHorizontal, PanelLeft, PanelRight, LayoutGrid,
  CircleDot, TriangleAlert, Workflow, Blocks,
  Lock, Unlock, Star, Heart, TrendingUp,
  Command, ChevronUp,
  Lightbulb, BookOpen, MousePointer, Wand2, Replace, CornerDownRight, List, Tag, MessageSquare,
  GitMerge, ArrowLeftRight, Ban, Check, ChevronsUpDown,
  ChevronLeft, Keyboard,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, PieChart, Pie, Cell,
} from "recharts";
import { SafeChartContainer } from "../components/SafeChartContainer";
import { T } from "./jpe-theme";
import type { WorkspaceMode } from "./jpe-theme";
import { Eyebrow, GlowDot, Badge, PanelHeader, IconBtn, ProgressBar } from "./jpe-shared";
import { ModAnalysisLab } from "./jpe-analysis-lab";
import { CommandPalette } from "../components/CommandPalette";
import {
  AnimatedPanel, ViewTransition, PopoverMotion, CollapsibleSection,
  ReducedMotionProvider,
  motion, AnimatePresence, easing,
} from "../components/jpe-motion";
import {
  JpeButton, JpeDropdown, JpeSearchBar, JpeStatusBadge,
  JpeProgressBar, JpeToolPanel, JpeStatusDot,
  JpeModCard, JpePluginCard, JpeFileTabs,
  type JpeDropdownItem, type JpeModCardStatus, type JpeFileTab,
} from "../components/jpe-design-system";
import { DashboardView } from "../components/DashboardView";
import { JpeLanguageEditor } from "../components/JpeLanguageEditor";
import { AIAssistantView } from "../components/AIAssistantView";
import { SettingsView } from "../components/SettingsView";
import { DiagnosticNexusView } from "../components/DiagnosticNexusView";
import { JpeSettingsProvider, useJpeSettings } from "../components/jpe-settings-context";
import { JpeWallpaper } from "../components/JpeWallpaper";
import { Toaster, toast } from "sonner";
import { NotificationBell } from "../components/NotificationCenter";
import { KeyboardShortcutsOverlay } from "../components/KeyboardShortcuts";
import { RebelsVaultView } from "../components/RebelsVaultView";
import { InspectorPanel } from "../components/InspectorPanel";
import { LibraryExplorer, PluginExplorer, DebugExplorer, VaultExplorer } from "../components/ModeExplorerPanels";
import { SkipLink, useAnnouncer, useArrowKeyList } from "../components/jpe-a11y";
import { JpeTerminal } from "../components/jpe-terminal";
import { GlobalSearch } from "../components/GlobalSearch";
import { PerformanceHUD, type LiveMetrics } from "../components/PerformanceHUD";
import { SourceControlPanel } from "../components/SourceControlPanel";
import { SnippetManager } from "../components/SnippetManager";
import { ExtensionsPanel } from "../components/ExtensionsPanel";
import { ProjectSwitcher } from "../components/ProjectSwitcher";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useAutoSave, saveDraft, loadDraft } from "../components/jpe-auto-save";
import { withErrorHandling, handleFileOperation, handleBuildOperation, handleTranslation } from "../components/jpe-error-handling";
import { EmptyFileExplorer, EmptyModLibrary, EmptySearchResults, LoadingFileTree, LoadingModCards } from "../components/jpe-empty-states";
import { OnboardingTour, QuickStartChecklist } from "../components/OnboardingTour";
import { NetworkStatusIndicator } from "../components/NetworkStatusIndicator";
import { FileOperationDialog, type FileDialogConfig } from "../components/FileOperationDialog";
import { CodeMinimap } from "../components/CodeMinimap";
import { getThemeCssVars } from "../components/jpe-themes";
import { PackageExportWizard } from "../components/PackageExportWizard";
import { EditHistoryPanel, EditHistoryProvider, useEditHistory } from "../components/EditHistoryPanel";
import { ConflictResolutionWizard } from "../components/ConflictResolutionWizard";
import { LocalizationCoverage } from "../components/LocalizationCoverage";
import { WorkspaceProfiles, type WorkspaceSnapshot } from "../components/WorkspaceProfiles";
import { ChangelogModal } from "../components/ChangelogModal";
import { StringTableManager } from "../components/StringTableManager";
import { ModValidator } from "../components/ModValidator";
import { TranslationMemory } from "../components/TranslationMemory";
// Phase 16
import { ModTemplateWizard } from "../components/ModTemplateWizard";
import { ResourceBrowser } from "../components/ResourceBrowser";
// Phase 17
import { SymbolOutline } from "../components/SymbolOutline";
import { HoverDocPanel } from "../components/HoverDocPanel";
// Phase 18
import { BatchOperations } from "../components/BatchOperations";
import { BuildProfileManager } from "../components/BuildProfileManager";
// Phase 19
import { ModHealthDashboard } from "../components/ModHealthDashboard";
import { UsageAnalytics } from "../components/UsageAnalytics";
// Phase 20
import { SplashScreen } from "../components/SplashScreen";
import { ReleaseManager } from "../components/ReleaseManager";
// Phase 21
import { LivePreview } from "../components/LivePreview";
import { HotReloadWatcher } from "../components/HotReloadWatcher";
// Phase 22
import { DocGenerator } from "../components/DocGenerator";
import { ApiReferenceViewer } from "../components/ApiReferenceViewer";
// Phase 23
import { TeamAnnotations } from "../components/TeamAnnotations";
import { TestRunner } from "../components/TestRunner";
// Toolbar
import { ToolsOverflowMenu } from "../components/ToolsOverflowMenu";
import { DiffViewer } from "../components/DiffViewer";
import { DependencyGraph } from "../components/DependencyGraph";
import {
  fileTree, fileTypeConfig, fileFilterTypes, codeLines, translationRows,
  diagnosticLogs, modDependencies, sparkData, pieData,
  type ModStatus, type ModSource, type LibMod, modLibraryData, modSources, modCategoryList,
  type MarketPlugin, marketPlugins, pluginCategories,
  type JpeSyntaxToken, type JpeEditorLine, type XmlPreviewLine, type JpeDocEntry,
  jpeDocumentation, jpeDocCategories, tokenizeJpeLine, jpeSourceLines, xmlPreviewLines,
  jpeSuggestions, jpeSyntaxColors,
  type GraphNode, type GraphEdge, graphNodes, graphEdges,
  type ConflictRegion, type ConflictFile, conflictFiles,
  type StageStatus, type PipelineStage, stageTemplates,
} from "./jpe-data";

/* T, WorkspaceMode, and shared UI components imported from ./jpe-theme, ./jpe-shared */
/* All data constants imported from ./jpe-data */

type OpenFileDialogFn = (config: FileDialogConfig) => void;

const workspaceModes: { key: WorkspaceMode; label: string; icon: LucideIcon; color: string; shortcut: string }[] = [
  { key: "dashboard", label: "Home", icon: LayoutGrid, color: T.textSecondary, shortcut: "0" },
  { key: "code", label: "Editor", icon: Code2, color: T.cyan, shortcut: "1" },
  { key: "translation", label: "Translate", icon: Languages, color: T.violet, shortcut: "2" },
  { key: "jpe", label: "JPE", icon: BookOpen, color: T.violetBright, shortcut: "3" },
  { key: "depgraph", label: "Graph", icon: Network, color: T.emerald, shortcut: "4" },
  { key: "diff", label: "Diff", icon: SplitSquareHorizontal, color: T.violet, shortcut: "" },
  { key: "conflicts", label: "Conflicts", icon: GitMerge, color: T.rose, shortcut: "5" },
  { key: "build", label: "Build", icon: Rocket, color: T.amber, shortcut: "6" },
  { key: "library", label: "Library", icon: Library, color: T.cyanBright, shortcut: "7" },
  { key: "plugin", label: "Plugins", icon: Puzzle, color: T.cyanDeep, shortcut: "8" },
  { key: "vault", label: "Rebel's Vault", icon: Package, color: T.violet, shortcut: "9" },
  { key: "debug", label: "Debug", icon: Bug, color: T.rose, shortcut: "" },
  { key: "datavis", label: "Analysis", icon: BarChart3, color: T.emerald, shortcut: "" },
  { key: "ai", label: "AI", icon: Sparkles, color: T.violetBright, shortcut: "" },
  { key: "settings", label: "Settings", icon: Settings, color: T.textTertiary, shortcut: "" },
];























/* ── Scaling helper: shrinks fixed-pixel widths at zoom > 1 to preserve screen proportion ── */
function useScaledWidth(basePx: number): number {
  const { settings: { fontScale } } = useJpeSettings();
  return Math.round(basePx / Math.max(fontScale, 1));
}

/* ═══════════════════════════════════════════════════════════════
   CONTEXT MENU COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function ContextMenu({ x, y, items, onClose }: { x: number; y: number; items: { label: string; icon: LucideIcon; color?: string; divider?: boolean; action?: () => void }[]; onClose: () => void }) {
  const { settings: { fontScale } } = useJpeSettings();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const escHandler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", escHandler);
    return () => { window.removeEventListener("mousedown", handler); window.removeEventListener("keydown", escHandler); };
  }, [onClose]);

  // Clamp to viewport so the menu doesn't overflow off-screen
  const menuW = 220;
  const menuH = items.length * 32 + 8;
  const vw = window.innerWidth / fontScale;
  const vh = window.innerHeight / fontScale;
  const clampedX = Math.max(4, Math.min(x / fontScale, vw - menuW - 8));
  const clampedY = Math.max(4, Math.min(y / fontScale, vh - menuH - 8));

  return (
    <motion.div
      ref={ref}
      role="menu"
      aria-label="File context menu"
      className="fixed z-[100] rounded-xl py-1 min-w-[200px]"
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -4 }}
      transition={{ duration: 0.18, ease: easing.outStandard }}
      style={{
        left: clampedX, top: clampedY,
        background: T.bgSurface,
        border: `1px solid ${T.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.05)`,
        backdropFilter: T.glassBlur,
        transformOrigin: "top left",
      }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.cyan}40, ${T.violet}40, transparent)` }} />
      {items.map((item, i) => (
        <div key={i}>
          {item.divider && <div className="my-1 mx-2 h-px" style={{ background: T.border }} />}
          <button
            role="menuitem"
            className="w-full flex items-center gap-2.5 px-3 py-1.5 transition-colors"
            style={{ fontSize: 12, color: item.color || T.textSecondary, fontFamily: T.sans }}
            onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; e.currentTarget.style.color = T.textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = item.color || T.textSecondary; }}
            onClick={() => { item.action?.(); onClose(); }}>
            <item.icon size={13} color={item.color || T.textTertiary} aria-hidden="true" />
            {item.label}
          </button>
        </div>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FILE TREE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function FileTreeNode({ node, depth = 0, searchQuery, activeFilters, onContextMenu, selectedFile, onSelectFile }: {
  node: any; depth?: number; searchQuery: string; activeFilters: Set<string>;
  onContextMenu: (e: React.MouseEvent, node: any) => void; selectedFile: string | null; onSelectFile: (name: string) => void;
}) {
  const [expanded, setExpanded] = useState(node.expanded ?? false);
  const isFolder = node.type === "folder";
  const statusColor: Record<string, string> = { ready: T.emerald, modified: T.cyan, warning: T.amber, error: T.rose, draft: T.violet };
  const statusLabel: Record<string, string> = { ready: "Ready", modified: "Modified", warning: "Warning", error: "Error", draft: "Draft" };

  // Get file type config
  const ftConfig = !isFolder && node.ext ? fileTypeConfig[node.ext] : null;
  const FileIcon = ftConfig ? ftConfig.icon : File;
  const fileColor = ftConfig ? ftConfig.color : T.textTertiary;

  // Filtering logic: check if this node or any descendant matches
  const isVisible = useMemo(() => {
    const check = (n: any): boolean => {
      if (!searchQuery && activeFilters.size === 0) return true;
      if (n.type === "folder") return n.children?.some((c: any) => check(c)) ?? false;
      const matchName = !searchQuery || n.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = activeFilters.size === 0 || (n.ext && activeFilters.has(n.ext));
      return matchName && matchFilter;
    };
    return check(node);
  }, [node, searchQuery, activeFilters]);

  if (!isVisible) return null;

  // Auto-expand folders when searching
  const isSearching = searchQuery.length > 0 || activeFilters.size > 0;
  const shouldExpand = isSearching ? true : expanded;

  const isSelected = !isFolder && selectedFile === node.name;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{ overflow: "hidden" }}
    >
      <div
        className="flex items-center gap-1.5 py-[3px] px-2 cursor-pointer group transition-colors relative"
        style={{
          paddingLeft: 8 + depth * 16,
          background: isSelected ? `${T.cyan}10` : "transparent",
          borderLeft: isSelected ? `2px solid ${T.cyan}` : "2px solid transparent",
          outline: "none",
        }}
        tabIndex={0}
        role="treeitem"
        aria-expanded={isFolder ? shouldExpand : undefined}
        aria-selected={isSelected}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.bgHover; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
        onClick={() => {
          if (isFolder) setExpanded(!expanded);
          else onSelectFile(node.name);
        }}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (isFolder) setExpanded(!expanded);
            else onSelectFile(node.name);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            if (isFolder && !shouldExpand) setExpanded(true);
            else if (isFolder && shouldExpand) {
              // Focus first child
              const next = e.currentTarget.parentElement?.querySelector('[role="treeitem"]~* [role="treeitem"]') as HTMLElement;
              next?.focus();
            }
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (isFolder && shouldExpand) setExpanded(false);
            else {
              // Focus parent treeitem
              const parent = e.currentTarget.parentElement?.parentElement?.closest('[role="treeitem"]')?.parentElement?.querySelector('[role="treeitem"]') as HTMLElement;
              parent?.focus();
            }
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            // Focus next visible treeitem
            const allItems = Array.from(e.currentTarget.closest('[role="tree"], .overflow-y-auto')?.querySelectorAll('[role="treeitem"]') || []) as HTMLElement[];
            const idx = allItems.indexOf(e.currentTarget);
            if (idx >= 0 && idx < allItems.length - 1) allItems[idx + 1].focus();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const allItems = Array.from(e.currentTarget.closest('[role="tree"], .overflow-y-auto')?.querySelectorAll('[role="treeitem"]') || []) as HTMLElement[];
            const idx = allItems.indexOf(e.currentTarget);
            if (idx > 0) allItems[idx - 1].focus();
          } else if (e.key === "Home") {
            e.preventDefault();
            const allItems = Array.from(e.currentTarget.closest('[role="tree"], .overflow-y-auto')?.querySelectorAll('[role="treeitem"]') || []) as HTMLElement[];
            allItems[0]?.focus();
          } else if (e.key === "End") {
            e.preventDefault();
            const allItems = Array.from(e.currentTarget.closest('[role="tree"], .overflow-y-auto')?.querySelectorAll('[role="treeitem"]') || []) as HTMLElement[];
            allItems[allItems.length - 1]?.focus();
          }
        }}
        onFocus={e => { if (!isSelected) e.currentTarget.style.background = T.bgHover; }}
        onBlur={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
        onContextMenu={e => { e.preventDefault(); onContextMenu(e, node); }}
      >
        {isFolder ? (
          <>
            <span className="flex items-center justify-center flex-shrink-0" style={{ width: 14 }}>
              {shouldExpand ? <ChevronDown size={11} color={T.textMuted} /> : <ChevronRight size={11} color={T.textMuted} />}
            </span>
            {shouldExpand ? <FolderOpen size={13} color={T.amber} /> : <Folder size={13} color={T.amber} />}
          </>
        ) : (
          <>
            <span className="flex-shrink-0" style={{ width: 14 }} />
            <FileIcon size={13} color={fileColor} />
          </>
        )}
        <span className="truncate flex-1" style={{
          fontSize: 12, fontFamily: T.sans,
          color: isFolder ? T.textPrimary : isSelected ? T.textPrimary : T.textSecondary,
          fontWeight: isFolder ? 600 : 400,
        }}>
          {node.name}
        </span>
        {/* File type badge on hover */}
        {ftConfig && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity px-1 py-0 rounded flex-shrink-0"
            style={{ fontSize: 8, fontFamily: T.mono, fontWeight: 700, color: fileColor, background: `${fileColor}12`, border: `1px solid ${fileColor}20` }}>
            {ftConfig.label}
          </span>
        )}
        {node.status && (
          <div className="flex items-center gap-1 flex-shrink-0" title={statusLabel[node.status]}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor[node.status], boxShadow: `0 0 4px ${statusColor[node.status]}50` }} />
          </div>
        )}
        {node.size && (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>
            {node.size}
          </span>
        )}
      </div>
      <AnimatePresence initial={false}>
        {isFolder && shouldExpand && node.children?.map((child: any, i: number) => (
          <FileTreeNode key={`${child.name}-${i}`} node={child} depth={depth + 1}
            searchQuery={searchQuery} activeFilters={activeFilters}
            onContextMenu={onContextMenu} selectedFile={selectedFile} onSelectFile={onSelectFile} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LEFT EXPLORER PANEL
   ═══════════════════════════════════════════════════════════════ */
function ExplorerPanel({ mode, onOpenFileDialog }: { mode: WorkspaceMode; onOpenFileDialog?: OpenFileDialogFn }) {
  if (mode === "library") return <LibraryExplorer />;
  if (mode === "plugin") return <PluginExplorer />;
  if (mode === "debug") return <DebugExplorer />;
  if (mode === "vault") return <VaultExplorer />;
  return <FileExplorerPanel mode={mode} onOpenFileDialog={onOpenFileDialog} />;
}

function FileExplorerPanel({ mode, onOpenFileDialog }: { mode: WorkspaceMode; onOpenFileDialog?: OpenFileDialogFn }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: any } | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>("S4_034AEECB_trait_Evil.xml");
  const [showFilters, setShowFilters] = useState(false);
  const [depsCollapsed, setDepsCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    toast.success("File tree refreshed");
    setTimeout(() => setRefreshing(false), 800);
  };

  const toggleFilter = (ext: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(ext)) next.delete(ext); else next.add(ext);
      return next;
    });
  };

  const handleContextMenu = useCallback((e: React.MouseEvent, node: any) => {
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  }, []);

  // Context menu items based on node type — every item now has an action
  const copyPath = (path: string) => { navigator.clipboard.writeText(path).then(() => toast.success("Path copied")).catch(() => {}); };
  const getContextItems = (node: any) => {
    const fullPath = `JPE_Project/src/tuning/${node.name}`;
    const relPath = `src/tuning/${node.name}`;
    if (node.type === "folder") return [
      { label: "New File...", icon: Plus, color: T.cyan, action: () => onOpenFileDialog?.({ mode: "new-file", parentPath: `JPE_Project/${node.name}/` }) },
      { label: "New Folder...", icon: Folder, color: T.amber, action: () => onOpenFileDialog?.({ mode: "new-folder", parentPath: `JPE_Project/${node.name}/` }) },
      { label: "Expand All", icon: ChevronDown, color: T.textSecondary, divider: true, action: () => toast.success("All folders expanded") },
      { label: "Collapse All", icon: ChevronRight, color: T.textSecondary, action: () => toast.success("All folders collapsed") },
      { label: "Copy Path", icon: Copy, color: T.textSecondary, divider: true, action: () => copyPath(`JPE_Project/${node.name}`) },
      { label: "Open in Terminal", icon: Terminal, color: T.textSecondary, action: () => toast.success(`Terminal opened at ${node.name}/`) },
      { label: "Reveal in Finder", icon: ExternalLink, color: T.textSecondary, action: () => toast.success(`Revealed ${node.name}/ in file manager`) },
      { label: "Delete Folder", icon: X, color: T.rose, divider: true, action: () => toast("Folder deletion cancelled", { description: "Protected folder" }) },
    ];
    const items: { label: string; icon: LucideIcon; color?: string; divider?: boolean; action?: () => void }[] = [
      { label: "Open", icon: File, color: T.cyan, action: () => { setSelectedFile(node.name); toast.success(`Opened ${node.name}`); } },
      { label: "Open to Side", icon: SplitSquareHorizontal, color: T.textSecondary, action: () => toast.success(`${node.name} opened in split view`) },
      { label: "Rename...", icon: FileText, color: T.textSecondary, divider: true, action: () => onOpenFileDialog?.({ mode: "rename", currentName: node.name, parentPath: `JPE_Project/src/tuning/` }) },
      { label: "Copy Path", icon: Copy, color: T.textSecondary, action: () => copyPath(fullPath) },
      { label: "Copy Relative Path", icon: Copy, color: T.textSecondary, action: () => copyPath(relPath) },
    ];
    if (node.ext === "xml") {
      items.push({ label: "Convert to JPE", icon: Languages, color: T.violet, divider: true, action: () => toast.success(`Converting ${node.name} to JPE format…`) });
      items.push({ label: "Validate Schema", icon: Shield, color: T.emerald, action: () => toast.success(`Schema validation passed for ${node.name}`) });
      items.push({ label: "View Dependencies", icon: Network, color: T.cyanDeep, action: () => toast.success(`Dependency graph loaded for ${node.name}`) });
    }
    if (node.ext === "stbl") {
      items.push({ label: "Open in STBL Editor", icon: Globe, color: T.violetBright, divider: true, action: () => toast.success(`STBL Editor opened for ${node.name}`) });
      items.push({ label: "Export Strings", icon: Download, color: T.textSecondary, action: () => toast.success(`${node.name} strings exported (8 entries)`) });
    }
    if (node.ext === "package") {
      items.push({ label: "Inspect Package", icon: Package, color: T.rose, divider: true, action: () => toast.success(`Package inspector opened for ${node.name}`) });
      items.push({ label: "Extract Resources", icon: Upload, color: T.textSecondary, action: () => toast.success(`Resources extracted from ${node.name}`) });
    }
    if (node.ext === "ts4script") {
      items.push({ label: "Run Script", icon: Play, color: T.emerald, divider: true, action: () => toast.success(`Script ${node.name} executed successfully`) });
      items.push({ label: "Debug Script", icon: Bug, color: T.rose, action: () => toast.success(`Debugger attached to ${node.name}`) });
    }
    items.push({ label: "Delete File", icon: X, color: T.rose, divider: true, action: () => toast("File deletion cancelled", { description: "Use Ctrl+Del for permanent delete" }) });
    return items;
  };

  // Count files by type (memoized since fileTree is static)
  const fileCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const walk = (n: any) => {
      if (n.type === "file" && n.ext) counts[n.ext] = (counts[n.ext] || 0) + 1;
      n.children?.forEach(walk);
    };
    fileTree.forEach(walk);
    return counts;
  }, []);
  const totalFiles = useMemo(() => Object.values(fileCounts).reduce((a, b) => a + b, 0), [fileCounts]);

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgPanel, fontFamily: T.sans }}>
      <PanelHeader
        title="EXPLORER"
        icon={FolderTree}
        iconColor={T.cyan}
        actions={
          <>
            <IconBtn icon={Plus} title="New File" onClick={() => onOpenFileDialog?.({ mode: "new-file", parentPath: "JPE_Project/src/tuning/" })} />
            <IconBtn icon={Filter} color={activeFilters.size > 0 ? T.cyan : T.textTertiary} onClick={() => setShowFilters(p => !p)} title="Toggle Filters" />
            <button className="p-1 rounded-md transition-colors hover:bg-white/5" onClick={handleRefresh} title="Refresh">
              <RefreshCw size={13} color={refreshing ? T.cyan : T.textTertiary} className={refreshing ? "animate-spin" : ""} />
            </button>
            <IconBtn icon={MoreHorizontal} title="More Actions" onClick={() => toast.info("Explorer options: Sort by name, type, modified date…")} />
          </>
        }
      />

      {/* Search */}
      <div className="px-3 py-2" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all"
          style={{
            background: T.bgInput,
            border: `1px solid ${searchQuery ? T.borderActive : T.borderSubtle}`,
            boxShadow: searchQuery ? `0 0 8px rgba(99,179,237,0.08)` : "none",
          }}>
          <Search size={12} color={searchQuery ? T.cyan : T.textMuted} />
          <input
            className="flex-1 bg-transparent outline-none"
            placeholder="Search files..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ fontSize: 12, color: T.textPrimary, fontFamily: T.sans }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-0.5 rounded hover:bg-white/5">
              <X size={10} color={T.textMuted} />
            </button>
          )}
        </div>
      </div>

      {/* File type filter chips */}
      {showFilters && (
        <div className="px-3 py-2 flex flex-wrap gap-1" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
          {fileFilterTypes.map(ft => {
            const isActive = activeFilters.has(ft.ext);
            const cfg = fileTypeConfig[ft.ext];
            return (
              <button key={ft.ext} onClick={() => toggleFilter(ft.ext)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md transition-all"
                style={{
                  fontSize: 10, fontFamily: T.mono, fontWeight: 600,
                  color: isActive ? cfg.color : T.textMuted,
                  background: isActive ? `${cfg.color}15` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isActive ? `${cfg.color}30` : T.borderSubtle}`,
                }}>
                <cfg.icon size={10} color={isActive ? cfg.color : T.textMuted} />
                {ft.label}
                <span style={{ fontSize: 8, color: isActive ? cfg.color : T.textDim }}>{fileCounts[ft.ext] || 0}</span>
              </button>
            );
          })}
          {activeFilters.size > 0 && (
            <button onClick={() => setActiveFilters(new Set())}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md transition-all"
              style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
              <X size={8} /> Clear
            </button>
          )}
        </div>
      )}

      {/* File tree (standard modes) */}
      <div className="flex-1 overflow-y-auto py-1" role="tree" aria-label="File explorer">
        <AnimatePresence initial={false}>
          {fileTree.map((node, i) => (
            <FileTreeNode key={`root-${node.name}-${i}`} node={node} searchQuery={searchQuery} activeFilters={activeFilters}
              onContextMenu={handleContextMenu} selectedFile={selectedFile} onSelectFile={setSelectedFile} />
          ))}
        </AnimatePresence>
        {searchQuery && (
          <div className="px-4 py-2">
            <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>
              Filtering by: "{searchQuery}"
              {activeFilters.size > 0 && ` + ${activeFilters.size} type filter${activeFilters.size > 1 ? "s" : ""}`}
            </span>
          </div>
        )}
      </div>

      {/* Mod Dependencies Quick View */}
      <div style={{ borderTop: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between px-3 py-2 cursor-pointer" onClick={() => setDepsCollapsed(p => !p)}
          style={{ borderBottom: depsCollapsed ? "none" : `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            {depsCollapsed ? <ChevronRight size={11} color={T.textMuted} /> : <ChevronDown size={11} color={T.textMuted} />}
            <Network size={13} color={T.violet} />
            <Eyebrow>DEPENDENCIES</Eyebrow>
            <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>({modDependencies.length})</span>
          </div>
        </div>
        {!depsCollapsed && (
          <div className="px-3 py-2 space-y-1.5 max-h-[140px] overflow-y-auto">
            {modDependencies.map((dep, i) => {
              const stColor = dep.status === "ok" ? T.emerald : dep.status === "warn" ? T.amber : T.rose;
              return (
                <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-md transition-colors cursor-pointer"
                  onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: stColor, boxShadow: `0 0 4px ${stColor}40` }} />
                  <span className="flex-1 truncate" style={{ fontSize: 11, color: T.textSecondary }}>{dep.name}</span>
                  <Badge color={
                    dep.type === "core" ? T.cyan : dep.type === "expansion" ? T.violet : dep.type === "gamepack" ? T.emerald : T.amber
                  } bg={
                    dep.type === "core" ? T.cyanDim : dep.type === "expansion" ? T.violetDim : dep.type === "gamepack" ? T.emeraldDim : T.amberDim
                  }>{dep.type}</Badge>
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{dep.version}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="px-3 py-1.5 flex items-center justify-between" style={{ borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{totalFiles} files · {fileCounts["package"] || 0} packages</span>
        <div className="flex items-center gap-2">
          {[
            { c: T.emerald, n: Object.entries(fileCounts).reduce((a, [, v]) => a + v, 0) - 3 },
            { c: T.amber, n: 2 },
            { c: T.cyan, n: 3 },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full" style={{ background: s.c }} />
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{s.n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x} y={contextMenu.y}
            items={getContextItems(contextMenu.node)}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CODE MODE — JPE Language Editor with Docs, Hover, Quick Fix
   ═══════════════════════════════════════════════════════════════ */

/* Types and data imported from ./jpe-data */



function CodeWorkspace() {
  const autoSave = useAutoSave();
  const { settings: globalSettings } = useJpeSettings();
  const { pushEntry: pushHistory } = useEditHistory();
  const [activeTabId, setActiveTabId] = useState("hug_friend.jpe");
  const [jpeLines, setJpeLines] = useState(jpeSourceLines);
  const [selectedJpeLine, setSelectedJpeLine] = useState<number | null>(3);
  const [hoveredXmlLine, setHoveredXmlLine] = useState<number | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteIdx, setAutocompleteIdx] = useState(0);
  const [rightPanel, setRightPanel] = useState<"xml" | "docs">("docs");
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [hoverTooltip, setHoverTooltip] = useState<{ keyword: string; x: number; y: number } | null>(null);
  const [docsSearch, setDocsSearch] = useState("");
  const [selectedDocKeyword, setSelectedDocKeyword] = useState<string | null>("interaction");
  const [validationSummary] = useState({ valid: 42, warnings: 2, errors: 1 });
  const [showMinimap, setShowMinimap] = useState(true);
  const editRef = useRef<HTMLInputElement>(null);
  const jpeScrollRef = useRef<HTMLDivElement>(null);
  const xmlScrollRef = useRef<HTMLDivElement>(null);
  const syncingScroll = useRef(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save setup
  useEffect(() => {
    autoSave.registerSaveHandler(async () => {
      saveDraft(`code-${activeTabId}`, { jpeLines, activeTabId });
    });
  }, [jpeLines, activeTabId, autoSave]);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft(`code-${activeTabId}`);
    if (draft?.data?.jpeLines) {
      setJpeLines(draft.data.jpeLines);
    }
  }, []);

  const fileTabs: JpeFileTab[] = [
    { id: "trait_Evil.xml", name: "S4_034AEECB_trait_Evil.xml", icon: FileCode, modified: true, language: "xml" },
    { id: "jpe_translator.ts4script", name: "jpe_translator.ts4script", icon: Code2, modified: false, language: "python" },
    { id: "manifest.json", name: "manifest.json", icon: Braces, modified: false, language: "json" },
    { id: "hug_friend.jpe", name: "hug_friend.jpe", icon: Sparkles, modified: true, language: "jpe" },
  ];

  const syntaxColor: Record<string, string> = { tag: T.cyan, attr: T.violet, value: T.emerald };
  const isJpeTab = activeTabId === "hug_friend.jpe";
  const activeFileTab = fileTabs.find(t => t.id === activeTabId);

  const highlightedXmlLines = useMemo(() => {
    if (selectedJpeLine === null) return new Set<number>();
    return new Set(xmlPreviewLines.filter(l => l.sourceJpeLine === selectedJpeLine).map(l => l.num));
  }, [selectedJpeLine]);

  const highlightedJpeFromXml = useMemo(() => {
    if (hoveredXmlLine === null) return new Set<number>();
    const xmlLine = xmlPreviewLines.find(l => l.num === hoveredXmlLine);
    if (!xmlLine?.sourceJpeLine) return new Set<number>();
    return new Set([xmlLine.sourceJpeLine]);
  }, [hoveredXmlLine]);

  // Detect keyword under cursor for docs panel sync
  const activeKeywordDoc = useMemo(() => {
    if (selectedJpeLine === null) return null;
    const line = jpeLines.find(l => l.num === selectedJpeLine);
    if (!line) return null;
    const kw = line.tokens.find(t => t.type === "keyword");
    if (kw) return jpeDocumentation.find(d => d.keyword === kw.text.toLowerCase()) || null;
    return null;
  }, [selectedJpeLine, jpeLines]);

  // Filtered docs for search
  const filteredDocs = useMemo(() => {
    if (!docsSearch.trim()) return jpeDocumentation;
    const s = docsSearch.toLowerCase();
    return jpeDocumentation.filter(d => d.keyword.includes(s) || d.description.toLowerCase().includes(s) || d.category.includes(s));
  }, [docsSearch]);

  const errorCount = jpeLines.filter(l => l.error).length;
  const warningCount = jpeLines.filter(l => l.warning).length;
  const lineCount = jpeLines.length;

  const startEdit = (line: JpeEditorLine) => {
    setEditingLine(line.num);
    setEditText(line.text);
    setTimeout(() => editRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    if (editingLine === null) return;
    const prevLine = jpeLines.find(l => l.num === editingLine);
    setJpeLines(prev => prev.map(l =>
      l.num === editingLine ? { ...l, text: editText, tokens: tokenizeJpeLine(editText) } : l
    ));
    pushHistory({ action: "Inline edit", detail: `Updated line ${editingLine}: "${editText.slice(0, 40)}${editText.length > 40 ? "…" : ""}"`, file: activeTabId, type: "edit", lineRange: [editingLine, editingLine], size: editText.length - (prevLine?.text.length ?? 0) });
    setEditingLine(null);
    autoSave.markDirty();
  };

  const applyQuickFix = (lineNum: number, replacement: string) => {
    const firstLine = replacement.split("\n")[0];
    setJpeLines(prev => prev.map(l =>
      l.num === lineNum ? { ...l, text: firstLine, tokens: tokenizeJpeLine(firstLine), error: undefined, warning: undefined, quickFix: undefined, validationStatus: "valid" as const } : l
    ));
    pushHistory({ action: "Quick-fix applied", detail: `Fixed line ${lineNum} → "${firstLine.slice(0, 40)}${firstLine.length > 40 ? "…" : ""}"`, file: activeTabId, type: "refactor", lineRange: [lineNum, lineNum], size: firstLine.length });
    autoSave.markDirty();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { commitEdit(); setShowAutocomplete(false); }
    else if (e.key === "Escape") { setEditingLine(null); setShowAutocomplete(false); }
    else if (e.key === "Tab") { e.preventDefault(); setEditText(prev => prev + "  "); }
  };

  const handleJpeScroll = useCallback(() => {
    if (syncingScroll.current || !jpeScrollRef.current || !xmlScrollRef.current) return;
    syncingScroll.current = true;
    const ratio = jpeScrollRef.current.scrollTop / (jpeScrollRef.current.scrollHeight - jpeScrollRef.current.clientHeight || 1);
    xmlScrollRef.current.scrollTop = ratio * (xmlScrollRef.current.scrollHeight - xmlScrollRef.current.clientHeight);
    requestAnimationFrame(() => { syncingScroll.current = false; });
  }, []);

  // Hover tooltip handler for tokens
  const handleTokenHover = (keyword: string, e: React.MouseEvent) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      const doc = jpeDocumentation.find(d => d.keyword === keyword.toLowerCase());
      if (doc) setHoverTooltip({ keyword: doc.keyword, x: e.clientX, y: e.clientY });
    }, 400);
  };

  const clearHoverTooltip = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoverTooltip(null);
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard")).catch(() => {}); };

  const insertSuggestion = (completion: string) => {
    if (selectedJpeLine !== null) {
      setJpeLines(prev => prev.map(l =>
        l.num === selectedJpeLine ? { ...l, text: l.text + completion, tokens: tokenizeJpeLine(l.text + completion) } : l
      ));
    }
    setShowAutocomplete(false);
  };

  const renderXmlEditor = () => (
    <div className="flex-1 overflow-y-auto relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 20%, rgba(99,179,237,0.02) 0%, transparent 70%)` }} />
      <div className="py-2">
        {codeLines.map(line => (
          <div key={line.num} className="flex items-center px-0 py-[1px] group transition-colors"
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
            <span className="w-12 text-right pr-4 flex-shrink-0 select-none" style={{ fontSize: 12, fontFamily: T.mono, color: T.textDim }}>{line.num}</span>
            <span style={{ fontSize: 13, fontFamily: T.mono, color: syntaxColor[line.type] || T.textSecondary, whiteSpace: "pre" }}>{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Documentation Panel ──
  const renderDocsPanel = () => {
    const doc = selectedDocKeyword ? jpeDocumentation.find(d => d.keyword === selectedDocKeyword) : activeKeywordDoc;
    const cat = doc ? jpeDocCategories[doc.category] : null;

    return (
      <div className="flex flex-col min-w-0 h-full" style={{ width: "42%", background: T.bg }}>
        {/* Docs header */}
        <div className="flex items-center justify-between px-3 py-1 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
          <div className="flex items-center gap-2">
            <BookOpen size={12} color={T.violet} />
            <Eyebrow color={T.violetBright}>JPE REFERENCE</Eyebrow>
            <Badge color={T.textMuted} bg="rgba(255,255,255,0.03)">{jpeDocumentation.length} keywords</Badge>
          </div>
          <div className="flex items-center gap-1">
            <IconBtn icon={ExternalLink} size={11} title="Open Full Docs" onClick={() => setRightPanel("docs")} />
          </div>
        </div>

        {/* Docs search */}
        <div className="px-3 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
            <Search size={10} color={T.textMuted} />
            <input value={docsSearch} onChange={e => setDocsSearch(e.target.value)} placeholder="Search keywords..."
              className="bg-transparent flex-1 outline-none min-w-0" style={{ fontSize: 11, color: T.textSecondary }} spellCheck={false} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Active keyword detail */}
          {doc && cat && (
            <div className="px-3 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md" style={{ fontSize: 9, fontWeight: 700, color: cat.color, background: cat.bg, letterSpacing: "0.05em" }}>{cat.label}</span>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>v{doc.sinceVersion}</span>
              </div>

              {/* Signature */}
              <div className="rounded-lg px-3 py-2 mb-2" style={{ background: T.bgDeep, border: `1px solid ${T.borderSubtle}` }}>
                <span style={{ fontSize: 13, fontFamily: T.mono, fontWeight: 600, color: T.cyan }}>{doc.signature}</span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.65, marginBottom: 10 }}>{doc.description}</p>

              {/* XML Mapping */}
              <div className="mb-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <CornerDownRight size={9} color={T.cyan} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em" }}>XML OUTPUT</span>
                </div>
                <div className="rounded-md px-2.5 py-1.5 overflow-x-auto" style={{ background: T.bgDeep, border: `1px solid ${T.borderSubtle}` }}>
                  <code style={{ fontSize: 10, fontFamily: T.mono, color: T.cyan, whiteSpace: "pre" }}>{doc.xmlMapping}</code>
                </div>
              </div>

              {/* Examples */}
              <div className="mb-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Code2 size={9} color={T.emerald} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em" }}>EXAMPLES</span>
                </div>
                {doc.examples.map((ex, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-1 rounded-md mb-0.5" style={{ background: "rgba(72,187,120,0.04)" }}>
                    <span style={{ fontSize: 10, fontFamily: T.mono, color: T.emerald }}>{ex}</span>
                  </div>
                ))}
              </div>

              {/* Related keywords */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Workflow size={9} color={T.violet} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em" }}>RELATED</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {doc.relatedKeywords.map(rk => (
                    <button key={rk} className="px-2 py-0.5 rounded-md transition-colors" onClick={() => setSelectedDocKeyword(rk)}
                      style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: T.violetBright, background: T.violetDim, border: `1px solid ${T.borderViolet}` }}>
                      {rk}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Keyword list */}
          <div className="px-2 py-1">
            <div className="flex items-center gap-1.5 px-1 mb-1">
              <Layers size={9} color={T.textMuted} />
              <span style={{ fontSize: 9, fontWeight: 700, color: T.textDim, letterSpacing: "0.08em" }}>ALL KEYWORDS</span>
            </div>
            {filteredDocs.map(d => {
              const c = jpeDocCategories[d.category];
              const isActive = selectedDocKeyword === d.keyword;
              return (
                <button key={d.keyword} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors mb-px"
                  style={{ background: isActive ? "rgba(139,92,246,0.08)" : "transparent", borderLeft: isActive ? `2px solid ${T.violet}` : "2px solid transparent" }}
                  onClick={() => setSelectedDocKeyword(d.keyword)}>
                  <span style={{ fontSize: 12, fontFamily: T.mono, fontWeight: 600, color: isActive ? T.violetBright : T.cyan, minWidth: 90 }}>{d.keyword}</span>
                  <span className="px-1.5 py-0 rounded" style={{ fontSize: 8, fontWeight: 700, color: c.color, background: c.bg }}>{c.label}</span>
                  <span className="flex-1 text-left truncate" style={{ fontSize: 10, color: T.textMuted }}>{d.description.slice(0, 45)}...</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Docs footer */}
        <div className="flex items-center justify-between px-3 py-1 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
          <div className="flex items-center gap-1.5">
            <MousePointer size={9} color={T.textDim} />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>Click a keyword in code to view docs</span>
          </div>
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>JPE v1.2</span>
        </div>
      </div>
    );
  };

  // ── XML Preview Panel ──
  const renderXmlPreview = () => (
    <div className="flex flex-col min-w-0" style={{ width: "42%", background: T.bg }}>
      <div className="flex items-center justify-between px-3 py-1 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: T.cyan, boxShadow: `0 0 6px ${T.cyan}60` }} />
          <Eyebrow color={T.cyan}>XML OUTPUT</Eyebrow>
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{xmlPreviewLines.length} lines</span>
          <Badge color={T.emerald} bg={T.emeraldDim}>LIVE</Badge>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn icon={Copy} size={11} title="Copy XML" onClick={() => copyToClipboard(xmlPreviewLines.map(l => l.text).join("\n"))} />
          <IconBtn icon={Download} size={11} title="Export" onClick={() => copyToClipboard(xmlPreviewLines.map(l => l.text).join("\n"))} />
        </div>
      </div>
      <div ref={xmlScrollRef} className="flex-1 overflow-y-auto py-1" style={{ background: T.bg }}>
        {xmlPreviewLines.map(line => {
          const isHighlighted = highlightedXmlLines.has(line.num);
          const isHovered = hoveredXmlLine === line.num;
          const isActive = isHighlighted || isHovered;
          const xmlColor: Record<string, string> = { tag: T.cyan, attr: T.violet, value: T.emerald, comment: T.textMuted };
          return (
            <div key={line.num} className="flex items-center pr-3 py-[1px] transition-colors cursor-default relative"
              style={{ background: isActive ? "rgba(99,179,237,0.04)" : "transparent", borderLeft: isActive ? `3px solid ${T.cyan}` : "3px solid transparent" }}
              onMouseEnter={() => setHoveredXmlLine(line.num)}
              onMouseLeave={() => setHoveredXmlLine(null)}>
              <span className="w-8 text-right pr-3 flex-shrink-0 select-none" style={{ fontSize: 11, fontFamily: T.mono, color: isActive ? T.textTertiary : T.textDim }}>{line.num}</span>
              <span style={{ fontSize: 12, fontFamily: T.mono, color: xmlColor[line.type] || T.textSecondary, whiteSpace: "pre", paddingLeft: line.indent * 10, opacity: line.text ? 1 : 0 }}>
                {line.text || " "}
              </span>
              {line.sourceJpeLine && isActive && (
                <span className="ml-auto flex-shrink-0 px-1.5 py-0 rounded" style={{ fontSize: 8, fontFamily: T.mono, color: T.textDim, background: "rgba(255,255,255,0.03)" }}>
                  ← JPE:{line.sourceJpeLine}
                </span>
              )}
            </div>
          );
        })}
        <div className="h-8" />
      </div>
    </div>
  );

  const renderJpeEditor = () => (
    <div className="flex flex-1 min-h-0">
      {/* ── JPE Source Editor ── */}
      <div className="flex flex-col flex-1 min-w-0" style={{ borderRight: `1px solid ${T.border}` }}>
        {/* JPE toolbar */}
        <div className="flex items-center justify-between px-3 py-1 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: T.violet, boxShadow: `0 0 6px ${T.violet}60` }} />
            <Eyebrow color={T.violetBright}>JPE SOURCE</Eyebrow>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{lineCount} lines</span>
            <div className="w-px h-3" style={{ background: T.border }} />
            {/* Grammar validation summary */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
              <CheckCircle2 size={9} color={T.emerald} />
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.emerald }}>{validationSummary.valid}</span>
              <div className="w-px h-2.5 mx-0.5" style={{ background: T.border }} />
              <AlertTriangle size={9} color={T.amber} />
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.amber }}>{warningCount}</span>
              <div className="w-px h-2.5 mx-0.5" style={{ background: T.border }} />
              <XCircle size={9} color={T.rose} />
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.rose }}>{errorCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <JpeButton variant="primary" size="xs" icon={Lightbulb}
              onClick={() => setShowAutocomplete(p => !p)}>Suggest</JpeButton>
            <JpeButton variant="secondary" size="xs" icon={Wand2}
              onClick={() => setShowAutocomplete(p => !p)}>AI Assist</JpeButton>
            <IconBtn icon={Copy} size={11} title="Copy JPE" onClick={() => copyToClipboard(jpeLines.map(l => l.text).join("\n"))} />
            <IconBtn icon={Download} size={11} title="Export" onClick={() => copyToClipboard(jpeLines.map(l => l.text).join("\n"))} />
            <div className="w-px h-4 mx-0.5" style={{ background: T.border }} />
            <button
              onClick={() => setShowMinimap(p => !p)}
              title={showMinimap ? "Hide minimap" : "Show minimap"}
              className="p-1 rounded-md transition-colors hover:bg-white/5"
              style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 600, color: showMinimap ? T.cyan : T.textMuted, background: showMinimap ? T.cyanDim : "transparent", border: `1px solid ${showMinimap ? `${T.cyan}25` : "transparent"}`, padding: "2px 6px" }}>
              MAP
            </button>
          </div>
        </div>

        {/* ── Code area + Minimap ── */}
        <div className="flex flex-1 min-h-0">
        <div ref={jpeScrollRef} className="flex-1 overflow-y-auto py-1 relative" onScroll={rightPanel === "xml" ? handleJpeScroll : undefined} style={{ background: T.bgDeep }}>
          {jpeLines.map(line => {
            const isSelected = selectedJpeLine === line.num;
            const isHighlighted = highlightedJpeFromXml.has(line.num);
            const isActive = isSelected || isHighlighted;
            const isEditing = editingLine === line.num;
            const hasError = !!line.error;
            const hasWarning = !!line.warning;
            const vs = line.validationStatus;

            return (
              <div key={line.num}>
                <div className="flex items-center pr-2 py-[1px] cursor-pointer transition-colors relative group"
                  style={{
                    background: hasError ? T.roseDim : hasWarning && isActive ? T.amberDim : isSelected ? "rgba(139,92,246,0.06)" : isHighlighted ? "rgba(99,179,237,0.04)" : "transparent",
                    borderLeft: hasError ? `3px solid ${T.rose}` : hasWarning ? `3px solid ${T.amber}` : isSelected ? `3px solid ${T.violet}` : "3px solid transparent",
                  }}
                  onClick={() => {
                    setSelectedJpeLine(line.num === selectedJpeLine ? null : line.num);
                    // Auto-sync docs to keyword under cursor
                    const kw = line.tokens.find(t => t.type === "keyword");
                    if (kw) {
                      const doc = jpeDocumentation.find(d => d.keyword === kw.text.toLowerCase());
                      if (doc) setSelectedDocKeyword(doc.keyword);
                    }
                  }}
                  onDoubleClick={() => startEdit(line)}>

                  {/* Validation status dot */}
                  <span className="w-3 flex-shrink-0 flex items-center justify-center">
                    {vs === "error" && <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.rose, boxShadow: `0 0 4px ${T.rose}` }} />}
                    {vs === "warning" && <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.amber, boxShadow: `0 0 4px ${T.amber}` }} />}
                    {vs === "valid" && line.text.trim() && <div className="w-1 h-1 rounded-full opacity-30" style={{ background: T.emerald }} />}
                  </span>

                  {/* Line number */}
                  <span className="w-8 text-right pr-2 flex-shrink-0 select-none" style={{ fontSize: 11, fontFamily: T.mono, color: hasError ? T.rose : isActive ? T.textTertiary : T.textDim }}>{line.num}</span>

                  {/* Gutter icon */}
                  <span className="w-4 flex-shrink-0 flex items-center justify-center">
                    {hasError && <XCircle size={10} color={T.rose} />}
                    {hasWarning && !hasError && <AlertTriangle size={10} color={T.amber} />}
                  </span>

                  {/* Code content with hover-able tokens */}
                  {isEditing ? (
                    <input ref={editRef} value={editText} onChange={e => { setEditText(e.target.value); setShowAutocomplete(true); }} onKeyDown={handleEditKeyDown} onBlur={commitEdit}
                      className="flex-1 bg-transparent outline-none min-w-0" style={{ fontSize: 13, fontFamily: T.mono, color: T.textPrimary, caretColor: T.cyan }} spellCheck={false} />
                  ) : (
                    <span className="flex-1 min-w-0" style={{ whiteSpace: "pre", fontSize: 13, fontFamily: T.mono }}>
                      {line.tokens.map((tok, ti) => (
                        <span key={ti}
                          style={{
                            color: jpeSyntaxColors[tok.type],
                            cursor: tok.type === "keyword" ? "help" : "default",
                            borderBottom: tok.type === "keyword" ? `1px dashed rgba(99,179,237,0.25)` : "none",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => { if (tok.type === "keyword") handleTokenHover(tok.text, e); }}
                          onMouseLeave={clearHoverTooltip}>
                          {tok.text}
                        </span>
                      ))}
                    </span>
                  )}

                  {/* Hint ghost */}
                  {line.hint && !hasError && !hasWarning && (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2 px-1.5 py-0 rounded"
                      style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
                      {line.hint}
                    </span>
                  )}

                  {/* Sync edge glow */}
                  {isActive && <div className="absolute right-0 top-0 bottom-0 w-1" style={{ background: `linear-gradient(to bottom, transparent, ${T.violet}30, transparent)` }} />}
                </div>

                {/* ── Inline error/warning with Quick Fix ── */}
                {(hasError || hasWarning) && isActive && (
                  <div className="flex items-center gap-2 py-1.5 px-3" style={{ marginLeft: 28, background: hasError ? "rgba(252,129,129,0.04)" : "rgba(246,173,85,0.04)", borderLeft: `2px solid ${hasError ? T.rose : T.amber}` }}>
                    <div className="flex-1 flex items-center gap-2">
                      {hasError ? <XCircle size={10} color={T.rose} /> : <AlertTriangle size={10} color={T.amber} />}
                      <span style={{ fontSize: 11, fontFamily: T.mono, color: hasError ? T.rose : T.amber }}>{line.error || line.warning}</span>
                    </div>
                    {line.quickFix && (
                      <button className="flex items-center gap-1 px-2 py-0.5 rounded-md transition-all flex-shrink-0"
                        onClick={() => applyQuickFix(line.num, line.quickFix!.replacement)}
                        style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: hasError ? `linear-gradient(135deg, ${T.rose}, #C53030)` : `linear-gradient(135deg, ${T.amber}, #C05621)`, boxShadow: `0 0 8px ${hasError ? "rgba(252,129,129,0.2)" : "rgba(246,173,85,0.2)"}` }}>
                        <Wand2 size={9} /> {line.quickFix.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div className="h-16" />

          {/* ── Autocomplete dropdown ── */}
          <AnimatePresence>
          {showAutocomplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -6 }}
              transition={{ duration: 0.18, ease: easing.outStandard }}
              className="absolute z-20 rounded-xl py-1 min-w-[320px]" style={{
              left: 80, top: Math.min((selectedJpeLine ?? 3) * 22, 300),
              background: T.bgSurface, border: `1px solid ${T.border}`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.6), ${T.glowViolet}`,
              backdropFilter: "blur(16px)",
              transformOrigin: "top left",
            }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.violet}40, ${T.cyan}40, transparent)` }} />
              <div className="px-3 py-1 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
                <div className="flex items-center gap-1.5">
                  <Lightbulb size={10} color={T.violet} />
                  <Eyebrow color={T.textMuted}>JPE SUGGESTIONS</Eyebrow>
                </div>
                <button onClick={() => setShowAutocomplete(false)} className="p-0.5 rounded hover:bg-white/10">
                  <X size={9} color={T.textDim} />
                </button>
              </div>
              {jpeSuggestions.map((s, i) => {
                const SIcon = s.icon;
                return (
                  <button key={i} className="w-full flex items-center gap-2.5 px-3 py-1.5 transition-colors"
                    style={{ background: i === autocompleteIdx ? T.bgHover : "transparent", color: T.textSecondary }}
                    onMouseEnter={() => setAutocompleteIdx(i)}
                    onClick={() => insertSuggestion(s.completion)}>
                    <SIcon size={12} color={T.violet} />
                    <span style={{ fontSize: 12, fontFamily: T.mono, fontWeight: 600, color: T.violetBright, minWidth: 110 }}>{s.completion}</span>
                    <span className="flex-1 text-left" style={{ fontSize: 10, color: T.textMuted }}>{s.desc}</span>
                    <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textDim, background: "rgba(255,255,255,0.03)", padding: "1px 4px", borderRadius: 3 }}>{s.detail}</span>
                  </button>
                );
              })}
              <div className="px-3 py-1 flex items-center justify-between" style={{ borderTop: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>↑↓ Navigate · Tab Accept · Esc Close</span>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{jpeSuggestions.length} items</span>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          {/* ── Hover Documentation Tooltip ── */}
          {hoverTooltip && (() => {
            const doc = jpeDocumentation.find(d => d.keyword === hoverTooltip.keyword);
            if (!doc) return null;
            const cat = jpeDocCategories[doc.category];
            return (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.15, ease: easing.outStandard }}
                className="fixed z-50 rounded-xl py-2 px-3 max-w-[340px]" style={{
                left: Math.min(hoverTooltip.x + 12, window.innerWidth - 360), top: hoverTooltip.y - 8,
                background: T.bgElevated, border: `1px solid ${T.border}`,
                boxShadow: `0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
                backdropFilter: "blur(20px)",
              }}
                onMouseEnter={() => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); }}
                onMouseLeave={clearHoverTooltip}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.violet}40, ${T.cyan}40, transparent)` }} />
                <div className="flex items-center gap-2 mb-1.5">
                  <span style={{ fontSize: 13, fontFamily: T.mono, fontWeight: 700, color: T.cyan }}>{doc.keyword}</span>
                  <span className="px-1.5 py-0 rounded" style={{ fontSize: 8, fontWeight: 700, color: cat.color, background: cat.bg }}>{cat.label}</span>
                </div>
                <div className="rounded-md px-2 py-1 mb-1.5" style={{ background: T.bgDeep, border: `1px solid ${T.borderSubtle}` }}>
                  <code style={{ fontSize: 10, fontFamily: T.mono, color: T.violetBright }}>{doc.signature}</code>
                </div>
                <p style={{ fontSize: 10.5, color: T.textSecondary, lineHeight: 1.6, marginBottom: 6 }}>{doc.description.slice(0, 150)}{doc.description.length > 150 ? "..." : ""}</p>
                <div className="flex items-center gap-1.5">
                  <CornerDownRight size={8} color={T.textDim} />
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>Click to view full docs →</span>
                </div>
              </motion.div>
            );
          })()}
        </div>
        {/* ── Minimap strip ── */}
        {showMinimap && globalSettings.minimapEnabled && (
          <CodeMinimap
            lines={jpeLines}
            scrollRef={jpeScrollRef}
            width={68}
            lineH={2}
          />
        )}
        </div>{/* closes flex code+minimap wrapper */}
      </div>

      {/* ── Right Side Panel: XML or Docs ── */}
      {rightPanel === "xml" ? renderXmlPreview() : renderDocsPanel()}
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      {/* File tabs */}
      <div className="flex items-center flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <JpeFileTabs
          tabs={fileTabs}
          activeId={activeTabId}
          onSelect={(id) => { setActiveTabId(id); setShowAutocomplete(false); }}
        />
        <div className="flex-1" />
        <div className="flex items-center gap-1 px-2">
          {isJpeTab && (
            <>
              {/* Panel switcher: XML / Docs */}
              <div className="flex items-center rounded-md overflow-hidden mr-1" style={{ border: `1px solid ${T.borderSubtle}` }}>
                <button className="flex items-center gap-1 px-2 py-0.5 transition-colors"
                  onClick={() => setRightPanel("xml")}
                  style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: rightPanel === "xml" ? T.cyan : T.textMuted, background: rightPanel === "xml" ? T.cyanDim : "transparent" }}>
                  <FileCode size={9} /> XML
                </button>
                <div className="w-px h-4" style={{ background: T.borderSubtle }} />
                <button className="flex items-center gap-1 px-2 py-0.5 transition-colors"
                  onClick={() => setRightPanel("docs")}
                  style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: rightPanel === "docs" ? T.violet : T.textMuted, background: rightPanel === "docs" ? T.violetDim : "transparent" }}>
                  <BookOpen size={9} /> Docs
                </button>
              </div>
            </>
          )}
          <IconBtn icon={SplitSquareHorizontal} title="Toggle side panel" onClick={() => setRightPanel(rightPanel === "xml" ? "docs" : "xml")} />
          <IconBtn icon={MoreHorizontal} title="Copy file path" onClick={() => { navigator.clipboard.writeText(isJpeTab ? "src/interactions/hug_friend.jpe" : `src/tuning/${activeTabId}`).then(() => toast.success("Path copied")).catch(() => {}); }} />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
        {(isJpeTab ? ["JPE_Project", "src", "interactions", "hug_friend.jpe"] : ["JPE_Project", "src", "tuning", "S4_034AEECB_trait_Evil.xml"]).map((seg, i, arr) => (
          <span key={i} className="flex items-center gap-1.5">
            <span style={{ fontSize: 11, color: i === arr.length - 1 ? T.textPrimary : T.textTertiary, fontFamily: T.sans, cursor: "pointer" }}>{seg}</span>
            {i < arr.length - 1 && <ChevronRight size={10} color={T.textMuted} />}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-2">
          {isJpeTab && activeKeywordDoc && (
            <>
              <span className="px-1.5 py-0 rounded-md" style={{ fontSize: 9, fontWeight: 600, color: T.violet, background: T.violetDim }}>{activeKeywordDoc.keyword}</span>
              <div className="w-px h-3" style={{ background: T.border }} />
            </>
          )}
          <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>Ln {selectedJpeLine ?? 1}, Col 1</span>
          <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>UTF-8</span>
          <span style={{ fontSize: 10, fontFamily: T.mono, color: isJpeTab ? T.violet : T.textMuted, fontWeight: isJpeTab ? 700 : 400 }}>{isJpeTab ? "JPE" : activeFileTab?.language?.toUpperCase()}</span>
        </span>
      </div>

      {/* Editor content */}
      {isJpeTab ? renderJpeEditor() : renderXmlEditor()}

      {/* Minimap gutter (non-JPE tabs only) */}
      {!isJpeTab && (
        <div className="absolute top-[85px] right-0 w-[60px] h-[calc(100%-120px)] opacity-30 pointer-events-none" style={{ background: T.bgPanel }}>
          {codeLines.map((_, i) => (
            <div key={i} className="mx-2 my-[1px] rounded-sm" style={{ height: 2, background: i === 5 ? T.cyan : i === 8 ? T.violet : "rgba(255,255,255,0.08)", width: `${30 + Math.random() * 20}px` }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRANSLATION MODE — Dual Panel XML ↔ JPE View
   ═══════════════════════════════════════════════════════════════ */
type XmlLineType = "tag" | "attr" | "value" | "comment" | "empty";
type JpeLineType = "heading" | "description" | "property" | "value" | "note" | "warning" | "empty";
type LineMarker = "error" | "warning" | "info" | "success" | null;

const translationData = {
  xmlLines: [
    { num: 1, text: '<?xml version="1.0" encoding="utf-8"?>', type: "tag" as XmlLineType, indent: 0, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 2, text: "<TuningRoot>", type: "tag" as XmlLineType, indent: 0, foldable: true, marker: null as LineMarker, markerMsg: "" },
    { num: 3, text: '  <Instance i="trait" s="Evil" n="trait_Evil">', type: "tag" as XmlLineType, indent: 1, foldable: true, marker: null as LineMarker, markerMsg: "" },
    { num: 4, text: '    <TunableVariant name="trait_type" type="PERSONALITY">', type: "attr" as XmlLineType, indent: 2, foldable: true, marker: null as LineMarker, markerMsg: "" },
    { num: 5, text: '      <Tunable name="display_name">', type: "attr" as XmlLineType, indent: 3, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 6, text: "        0x0A3B4C5D <!-- Evil -->", type: "value" as XmlLineType, indent: 4, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 7, text: "      </Tunable>", type: "tag" as XmlLineType, indent: 3, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 8, text: '      <Tunable name="trait_description">', type: "attr" as XmlLineType, indent: 3, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 9, text: "        0x1F2E3D4C <!-- These Sims enjoy... -->", type: "value" as XmlLineType, indent: 4, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 10, text: "      </Tunable>", type: "tag" as XmlLineType, indent: 3, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 11, text: '      <TunableList name="conflicting_traits">', type: "attr" as XmlLineType, indent: 3, foldable: true, marker: null as LineMarker, markerMsg: "" },
    { num: 12, text: "        <Tunable>trait_Good</Tunable>", type: "value" as XmlLineType, indent: 4, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 13, text: "        <Tunable>trait_Childish</Tunable>", type: "value" as XmlLineType, indent: 4, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 14, text: "      </TunableList>", type: "tag" as XmlLineType, indent: 3, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 15, text: '      <Tunable name="icon" type="ResourceKey">', type: "attr" as XmlLineType, indent: 3, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 16, text: "        S4_2F7D0004_00000001_Evil_Icon", type: "value" as XmlLineType, indent: 4, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 17, text: "      </Tunable>", type: "tag" as XmlLineType, indent: 3, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 18, text: '      <TunableList name="buffs_on_add">', type: "attr" as XmlLineType, indent: 3, foldable: true, marker: null as LineMarker, markerMsg: "" },
    { num: 19, text: "        <TunableTuple>", type: "tag" as XmlLineType, indent: 4, foldable: true, marker: null as LineMarker, markerMsg: "" },
    { num: 20, text: '          <Tunable name="buff_type">buff_Evil_Aura</Tunable>', type: "value" as XmlLineType, indent: 5, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 21, text: '          <Tunable name="buff_reason">0x2A3B4C5D</Tunable>', type: "value" as XmlLineType, indent: 5, foldable: false, marker: "warning" as LineMarker, markerMsg: "Unresolved STBL reference" },
    { num: 22, text: "        </TunableTuple>", type: "tag" as XmlLineType, indent: 4, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 23, text: "      </TunableList>", type: "tag" as XmlLineType, indent: 3, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 24, text: '      <Tunable name="ages" type="TunableSet">', type: "attr" as XmlLineType, indent: 3, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 25, text: "        TEEN, YOUNGADULT, ADULT, ELDER", type: "value" as XmlLineType, indent: 4, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 26, text: "      </Tunable>", type: "tag" as XmlLineType, indent: 3, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 27, text: '      <Tunable name="cas_selected_icon">', type: "attr" as XmlLineType, indent: 3, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 28, text: "        S4_2F7D0004_CAS_trait_Evil", type: "value" as XmlLineType, indent: 4, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 29, text: "      </Tunable>", type: "tag" as XmlLineType, indent: 3, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 30, text: "    </TunableVariant>", type: "tag" as XmlLineType, indent: 2, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 31, text: "  </Instance>", type: "tag" as XmlLineType, indent: 1, foldable: false, marker: null as LineMarker, markerMsg: "" },
    { num: 32, text: "</TuningRoot>", type: "tag" as XmlLineType, indent: 0, foldable: false, marker: null as LineMarker, markerMsg: "" },
  ],
  jpeLines: [
    { num: 1, text: "── TUNING FILE DECLARATION ──", type: "heading" as JpeLineType, confidence: undefined as number | undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 2, text: "File: XML Tuning Root (UTF-8 encoded)", type: "description" as JpeLineType, confidence: 100, marker: null as LineMarker, markerMsg: "" },
    { num: 3, text: "", type: "empty" as JpeLineType, confidence: undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 4, text: "── TRAIT DEFINITION ──", type: "heading" as JpeLineType, confidence: undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 5, text: 'Type: Trait  •  ID: "Evil"  •  Internal: trait_Evil', type: "property" as JpeLineType, confidence: 99, marker: null as LineMarker, markerMsg: "" },
    { num: 6, text: "Variant Type: PERSONALITY trait category", type: "property" as JpeLineType, confidence: 98, marker: null as LineMarker, markerMsg: "" },
    { num: 7, text: "", type: "empty" as JpeLineType, confidence: undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 8, text: "Display Name:", type: "property" as JpeLineType, confidence: 98, marker: null as LineMarker, markerMsg: "" },
    { num: 9, text: '  → "Evil" (STBL Hash: 0x0A3B4C5D)', type: "value" as JpeLineType, confidence: 98, marker: null as LineMarker, markerMsg: "" },
    { num: 10, text: "", type: "empty" as JpeLineType, confidence: undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 11, text: "Trait Description:", type: "property" as JpeLineType, confidence: 95, marker: null as LineMarker, markerMsg: "" },
    { num: 12, text: '  → "These Sims enjoy being mean and causing mayhem"', type: "value" as JpeLineType, confidence: 95, marker: null as LineMarker, markerMsg: "" },
    { num: 13, text: "  (STBL Hash: 0x1F2E3D4C — localized string reference)", type: "note" as JpeLineType, confidence: 95, marker: null as LineMarker, markerMsg: "" },
    { num: 14, text: "", type: "empty" as JpeLineType, confidence: undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 15, text: "Conflicting Traits (cannot coexist):", type: "property" as JpeLineType, confidence: 97, marker: null as LineMarker, markerMsg: "" },
    { num: 16, text: "  1. trait_Good — Prevents Good + Evil combination", type: "value" as JpeLineType, confidence: 97, marker: null as LineMarker, markerMsg: "" },
    { num: 17, text: "  2. trait_Childish — Prevents Childish + Evil combination", type: "value" as JpeLineType, confidence: 97, marker: null as LineMarker, markerMsg: "" },
    { num: 18, text: "", type: "empty" as JpeLineType, confidence: undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 19, text: "Icon Resource:", type: "property" as JpeLineType, confidence: 100, marker: null as LineMarker, markerMsg: "" },
    { num: 20, text: "  ResourceKey → S4_2F7D0004_00000001_Evil_Icon", type: "value" as JpeLineType, confidence: 100, marker: null as LineMarker, markerMsg: "" },
    { num: 21, text: "  (PNG/DDS texture reference for UI display)", type: "note" as JpeLineType, confidence: 100, marker: null as LineMarker, markerMsg: "" },
    { num: 22, text: "", type: "empty" as JpeLineType, confidence: undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 23, text: "── BUFF EFFECTS ON TRAIT ADD ──", type: "heading" as JpeLineType, confidence: undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 24, text: "When trait is added to a Sim:", type: "description" as JpeLineType, confidence: 94, marker: null as LineMarker, markerMsg: "" },
    { num: 25, text: "  Buff Applied: buff_Evil_Aura", type: "value" as JpeLineType, confidence: 94, marker: null as LineMarker, markerMsg: "" },
    { num: 26, text: "  Buff Reason: 0x2A3B4C5D", type: "value" as JpeLineType, confidence: 64, marker: "warning" as LineMarker, markerMsg: "Low confidence — STBL hash unverified" },
    { num: 27, text: "  ⚠ Warning: STBL reference not found in loaded tables", type: "warning" as JpeLineType, confidence: 64, marker: null as LineMarker, markerMsg: "" },
    { num: 28, text: "", type: "empty" as JpeLineType, confidence: undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 29, text: "── AGE RESTRICTIONS ──", type: "heading" as JpeLineType, confidence: undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 30, text: "Valid Ages: TEEN, YOUNGADULT, ADULT, ELDER", type: "property" as JpeLineType, confidence: 100, marker: null as LineMarker, markerMsg: "" },
    { num: 31, text: "  (Excludes: BABY, TODDLER, CHILD)", type: "note" as JpeLineType, confidence: 100, marker: null as LineMarker, markerMsg: "" },
    { num: 32, text: "", type: "empty" as JpeLineType, confidence: undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 33, text: "── CAS INTEGRATION ──", type: "heading" as JpeLineType, confidence: undefined, marker: null as LineMarker, markerMsg: "" },
    { num: 34, text: "CAS Panel Icon:", type: "property" as JpeLineType, confidence: 100, marker: null as LineMarker, markerMsg: "" },
    { num: 35, text: "  ResourceKey → S4_2F7D0004_CAS_trait_Evil", type: "value" as JpeLineType, confidence: 100, marker: null as LineMarker, markerMsg: "" },
    { num: 36, text: "  (Displayed in Create-A-Sim personality trait picker)", type: "note" as JpeLineType, confidence: 100, marker: null as LineMarker, markerMsg: "" },
  ],
  syncMap: [
    [1, 1], [1, 2], [3, 4], [3, 5], [4, 6],
    [5, 8], [6, 9], [8, 11], [9, 12], [9, 13],
    [11, 15], [12, 16], [13, 17],
    [15, 19], [16, 20], [16, 21],
    [18, 23], [19, 24], [20, 25], [21, 26], [21, 27],
    [24, 29], [25, 30], [25, 31],
    [27, 33], [27, 34], [28, 35], [28, 36],
  ] as [number, number][],
};

/* ── Locale tab data ── */
const localeTabs = [
  { id: "en_US", label: "en_US", coverage: 100, color: T.emerald, flag: "🇺🇸" },
  { id: "ja_JP", label: "ja_JP", coverage: 94, color: T.cyan, flag: "🇯🇵" },
  { id: "de_DE", label: "de_DE", coverage: 98, color: T.amber, flag: "🇩🇪" },
  { id: "fr_FR", label: "fr_FR", coverage: 71, color: T.violet, flag: "🇫🇷" },
  { id: "ko_KR", label: "ko_KR", coverage: 45, color: T.rose, flag: "🇰🇷" },
  { id: "zh_CN", label: "zh_CN", coverage: 38, color: T.textTertiary, flag: "🇨🇳" },
];

function TranslationWorkspace() {
  const [hoveredXml, setHoveredXml] = useState<number | null>(null);
  const [hoveredJpe, setHoveredJpe] = useState<number | null>(null);
  const [selectedXml, setSelectedXml] = useState<number | null>(6);
  const [foldedRegions, setFoldedRegions] = useState<Set<number>>(new Set());
  const translationProgress = 87;
  const [validationRunning, setValidationRunning] = useState(false);
  const [showConnectors, setShowConnectors] = useState(true);
  const [activeLocale, setActiveLocale] = useState("en_US");
  const [batchTranslating, setBatchTranslating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [inlineEditLine, setInlineEditLine] = useState<number | null>(null);
  const [inlineEditText, setInlineEditText] = useState("");
  const xmlScrollRef = useRef<HTMLDivElement>(null);
  const jpeScrollRef = useRef<HTMLDivElement>(null);
  const syncingScroll = useRef(false);

  const handleXmlScroll = useCallback(() => {
    if (syncingScroll.current || !xmlScrollRef.current || !jpeScrollRef.current) return;
    syncingScroll.current = true;
    const ratio = xmlScrollRef.current.scrollTop / (xmlScrollRef.current.scrollHeight - xmlScrollRef.current.clientHeight || 1);
    jpeScrollRef.current.scrollTop = ratio * (jpeScrollRef.current.scrollHeight - jpeScrollRef.current.clientHeight);
    requestAnimationFrame(() => { syncingScroll.current = false; });
  }, []);

  const handleJpeScroll = useCallback(() => {
    if (syncingScroll.current || !xmlScrollRef.current || !jpeScrollRef.current) return;
    syncingScroll.current = true;
    const ratio = jpeScrollRef.current.scrollTop / (jpeScrollRef.current.scrollHeight - jpeScrollRef.current.clientHeight || 1);
    xmlScrollRef.current.scrollTop = ratio * (xmlScrollRef.current.scrollHeight - xmlScrollRef.current.clientHeight);
    requestAnimationFrame(() => { syncingScroll.current = false; });
  }, []);

  const highlightedJpeLines = useMemo(() => {
    const active = hoveredXml ?? selectedXml;
    if (active === null) return new Set<number>();
    return new Set(translationData.syncMap.filter(([x]) => x === active).map(([, j]) => j));
  }, [hoveredXml, selectedXml]);

  const highlightedXmlLines = useMemo(() => {
    if (hoveredJpe === null) return new Set<number>();
    return new Set(translationData.syncMap.filter(([, j]) => j === hoveredJpe).map(([x]) => x));
  }, [hoveredJpe]);

  const visibleXmlLines = useMemo(() => {
    const lines = translationData.xmlLines;
    const hidden = new Set<number>();
    foldedRegions.forEach(foldLine => {
      const foldNode = lines.find(l => l.num === foldLine);
      if (!foldNode) return;
      const depth = foldNode.indent;
      for (let i = lines.indexOf(foldNode) + 1; i < lines.length; i++) {
        if (lines[i].indent > depth) hidden.add(lines[i].num);
        else break;
      }
    });
    return lines.filter(l => !hidden.has(l.num));
  }, [foldedRegions]);

  const toggleFold = (lineNum: number) => {
    setFoldedRegions(prev => {
      const next = new Set(prev);
      if (next.has(lineNum)) next.delete(lineNum); else next.add(lineNum);
      return next;
    });
  };

  const [translating, setTranslating] = useState(false);
  const [reversing, setReversing] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [compiled, setCompiled] = useState(false);

  const runValidation = () => { setValidationRunning(true); setTimeout(() => setValidationRunning(false), 2000); };
  const runTranslate = async () => {
    setTranslating(true);
    await handleTranslation(async () => {
      // Simulate translation API call
      await new Promise(resolve => setTimeout(resolve, 2200));
    }, { silent: false, successMessage: "Translation completed" });
    setTranslating(false);
  };
  const runReverse = () => { setReversing(true); setTimeout(() => setReversing(false), 1800); };
  const runCompile = async () => {
    setCompiling(true);
    await handleBuildOperation(async () => {
      // Simulate build process
      await new Promise(resolve => setTimeout(resolve, 2500));
    }, { successMessage: "Build completed successfully" });
    setCompiling(false);
    setCompiled(true);
    setTimeout(() => setCompiled(false), 2000);
  };

  const runBatchTranslate = () => {
    setBatchTranslating(true);
    setBatchProgress(0);
    const steps = [15, 32, 55, 71, 88, 100];
    steps.forEach((pct, i) => {
      setTimeout(() => {
        setBatchProgress(pct);
        if (pct === 100) { setBatchTranslating(false); toast.success(`Batch translation complete — all ${localeTabs.length} locales updated`); }
      }, (i + 1) * 600);
    });
  };

  const exportAs = (format: "csv" | "xliff" | "stbl") => {
    setShowExportMenu(false);
    const labels: Record<string, string> = { csv: "CSV (UTF-8)", xliff: "XLIFF 2.0", stbl: "STBL Binary" };
    toast.success(`Exporting as ${labels[format]}…`, { description: `${translationData.jpeLines.filter(l => l.type !== "empty").length} entries → ${activeLocale}.${format}` });
  };

  const startInlineEdit = (lineNum: number, currentText: string) => {
    setInlineEditLine(lineNum);
    setInlineEditText(currentText);
  };
  const commitInlineEdit = () => {
    if (inlineEditLine !== null) { toast.success(`Line ${inlineEditLine} updated`); }
    setInlineEditLine(null);
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard")).catch(() => {}); };

  const xmlSyntax: Record<XmlLineType, string> = { tag: T.cyan, attr: T.violet, value: T.emerald, comment: T.textMuted, empty: T.textDim };
  const jpeSyntax: Record<JpeLineType, string> = { heading: T.cyanBright, description: T.textSecondary, property: T.violetBright, value: T.emerald, note: T.textTertiary, warning: T.amber, empty: T.textDim };
  const markerIcons: Record<string, { bg: string; border: string; Icon: LucideIcon; color: string }> = {
    error: { bg: T.roseDim, border: T.rose, Icon: XCircle, color: T.rose },
    warning: { bg: T.amberDim, border: T.amber, Icon: AlertTriangle, color: T.amber },
    info: { bg: T.cyanDim, border: T.cyan, Icon: Info, color: T.cyan },
    success: { bg: T.emeraldDim, border: T.emerald, Icon: CheckCircle2, color: T.emerald },
  };

  const totalLines = translationData.jpeLines.filter(l => l.type !== "empty").length;
  const highConf = translationData.jpeLines.filter(l => (l.confidence ?? 0) >= 90).length;
  const warnings = translationData.jpeLines.filter(l => l.marker === "warning").length + translationData.xmlLines.filter(l => l.marker === "warning").length;

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      {/* ═══ LOCALE TABS ═══ */}
      <div className="flex items-center flex-shrink-0 overflow-x-auto" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel, scrollbarWidth: "none" }}>
        {localeTabs.map(loc => {
          const isActive = activeLocale === loc.id;
          return (
            <button key={loc.id} onClick={() => { setActiveLocale(loc.id); if (loc.id !== "en_US") toast.info(`Switched to ${loc.label} — ${loc.coverage}% coverage`); }}
              className="flex items-center gap-1.5 px-3 py-2 flex-shrink-0 transition-colors relative"
              style={{
                background: isActive ? T.bgDeep : "transparent",
                borderBottom: isActive ? `2px solid ${loc.color}` : "2px solid transparent",
                borderRight: `1px solid ${T.borderSubtle}`,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.bgHover; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 11 }}>{loc.flag}</span>
              <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: isActive ? 700 : 500, color: isActive ? T.textPrimary : T.textTertiary }}>{loc.label}</span>
              <span className="px-1 rounded" style={{ fontSize: 8, fontWeight: 700, color: loc.color, background: `${loc.color}14` }}>{loc.coverage}%</span>
            </button>
          );
        })}
        <div className="ml-auto px-3 flex items-center gap-1.5 flex-shrink-0">
          {batchTranslating && (
            <div className="flex items-center gap-1.5">
              <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${T.violet}, ${T.emerald})` }}
                  animate={{ width: `${batchProgress}%` }} transition={{ duration: 0.4 }} />
              </div>
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.violet }}>{batchProgress}%</span>
            </div>
          )}
          <JpeButton variant="ghost" size="xs" icon={Sparkles} loading={batchTranslating} disabled={batchTranslating} onClick={runBatchTranslate}>
            {batchTranslating ? "Translating…" : "Batch All"}
          </JpeButton>
          {/* Export dropdown */}
          <div className="relative">
            <JpeButton variant="ghost" size="xs" icon={Download} onClick={() => setShowExportMenu(p => !p)}>Export</JpeButton>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: -4 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 top-full mt-1 z-50 rounded-xl py-1 min-w-[140px]"
                  style={{ background: T.bgSurface, border: `1px solid ${T.border}`, boxShadow: `0 8px 24px rgba(0,0,0,0.4)` }}>
                  {[
                    { id: "csv" as const, label: "Export as CSV", color: T.emerald },
                    { id: "xliff" as const, label: "Export as XLIFF 2.0", color: T.cyan },
                    { id: "stbl" as const, label: "Export as STBL", color: T.violet },
                  ].map(item => (
                    <button key={item.id} onClick={() => exportAs(item.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors"
                      style={{ fontSize: 11, color: T.textSecondary }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; e.currentTarget.style.color = item.color; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSecondary; }}>
                      <Download size={11} color={item.color} /> {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══ TRANSLATION TOOLBAR ═══ */}
      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-2">
          <Languages size={14} color={T.violet} />
          <Eyebrow color={T.textPrimary}>DUAL TRANSLATION VIEW</Eyebrow>
          <div className="w-px h-4" style={{ background: T.border }} />
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
            <FileCode size={10} color={T.cyan} />
            <span style={{ fontSize: 10, color: T.textTertiary, fontFamily: T.mono }}>trait_Evil.xml</span>
          </div>
          <div className="w-px h-4" style={{ background: T.border }} />
          <div className="flex items-center gap-1">
            <JpeButton variant="primary" size="sm" icon={Sparkles} loading={translating} disabled={translating} onClick={runTranslate}>
              {translating ? "Translating..." : "Translate"}
            </JpeButton>
            <JpeButton variant="secondary" size="sm" icon={RotateCcw} loading={reversing} disabled={reversing} onClick={runReverse}>
              {reversing ? "Reversing..." : "Reverse"}
            </JpeButton>
            <JpeButton variant={validationRunning ? "success" : "ghost"} size="sm" icon={Shield}
              loading={validationRunning} onClick={runValidation}>
              {validationRunning ? "Validating..." : "Validate"}
            </JpeButton>
            <JpeButton variant={compiled ? "success" : compiling ? "primary" : "ghost"} size="sm" icon={compiled ? CheckCircle2 : Rocket}
              loading={compiling} disabled={compiling} onClick={runCompile}>
              {compiled ? "Compiled ✓" : compiling ? "Compiling..." : "Compile"}
            </JpeButton>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={T.emerald} bg={T.emeraldDim}>{highConf} Verified</Badge>
          <Badge color={T.amber} bg={T.amberDim}>{warnings} Warn</Badge>
          <div className="w-px h-3" style={{ background: T.border }} />
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>Conf.</span>
            <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="h-full rounded-full" style={{ width: `${translationProgress}%`, background: `linear-gradient(90deg, ${T.violet}, ${T.emerald})` }} />
            </div>
            <span style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 700, color: T.emerald }}>{translationProgress}%</span>
          </div>
          <IconBtn icon={showConnectors ? Eye : EyeOff} color={showConnectors ? T.cyan : T.textMuted} onClick={() => setShowConnectors(p => !p)} title="Toggle sync" size={12} />
        </div>
      </div>

      {/* ═══ DUAL PANEL SPLIT ═══ */}
      <div className="flex flex-1 min-h-0 relative">
        {/* LEFT PANEL: RAW XML */}
        <motion.div className="flex flex-col flex-1 min-w-0"
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: easing.outStandard }}
          style={{ borderRight: `1px solid ${T.border}` }}>
          <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: T.cyan, boxShadow: `0 0 6px ${T.cyan}60` }} />
              <Eyebrow color={T.cyan}>SOURCE XML</Eyebrow>
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{translationData.xmlLines.length} lines</span>
            </div>
            <div className="flex items-center gap-1">
              <IconBtn icon={Copy} size={11} title="Copy XML" onClick={() => copyToClipboard(translationData.xmlLines.map(l => l.text).join("\n"))} />
              <IconBtn icon={Download} size={11} title="Export" onClick={() => copyToClipboard(translationData.xmlLines.map(l => l.text).join("\n"))} />
            </div>
          </div>
          <div ref={xmlScrollRef} className="flex-1 overflow-y-auto py-1" onScroll={handleXmlScroll} style={{ background: T.bgDeep }}>
            {visibleXmlLines.map(line => {
              const isHlFromJpe = highlightedXmlLines.has(line.num);
              const isHovered = hoveredXml === line.num;
              const isSelected = selectedXml === line.num;
              const isActive = isHlFromJpe || isHovered || isSelected;
              const isFolded = foldedRegions.has(line.num);
              const m = line.marker ? markerIcons[line.marker] : null;
              return (
                <div key={line.num} className="flex items-center pr-3 py-[1px] cursor-pointer transition-colors relative"
                  style={{
                    background: m ? m.bg : isSelected ? "rgba(99,179,237,0.06)" : isActive ? "rgba(99,179,237,0.03)" : "transparent",
                    borderLeft: m ? `3px solid ${m.border}` : isSelected ? `3px solid ${T.cyan}` : "3px solid transparent",
                  }}
                  onMouseEnter={() => setHoveredXml(line.num)}
                  onMouseLeave={() => setHoveredXml(null)}
                  onClick={() => setSelectedXml(line.num === selectedXml ? null : line.num)}>
                  <span className="flex items-center justify-center flex-shrink-0" style={{ width: 18 }}>
                    {line.foldable ? (
                      <button className="p-0 flex items-center justify-center rounded hover:bg-white/10" onClick={e => { e.stopPropagation(); toggleFold(line.num); }}>
                        {isFolded ? <ChevronRight size={10} color={T.textMuted} /> : <ChevronDown size={10} color={T.textMuted} />}
                      </button>
                    ) : null}
                  </span>
                  <span className="w-8 text-right pr-3 flex-shrink-0 select-none" style={{ fontSize: 11, fontFamily: T.mono, color: isActive ? T.textTertiary : T.textDim }}>{line.num}</span>
                  {m && <span className="flex-shrink-0 mr-1" title={line.markerMsg}><m.Icon size={11} color={m.color} /></span>}
                  <span style={{ fontSize: 12.5, fontFamily: T.mono, color: xmlSyntax[line.type], whiteSpace: "pre", paddingLeft: line.indent * 8, opacity: isFolded ? 0.5 : 1 }}>
                    {line.text.trimStart()}
                  </span>
                  {isFolded && <span className="ml-2 px-1.5 py-0 rounded" style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSubtle}` }}>⋯ folded</span>}
                  {showConnectors && isActive && <div className="absolute right-0 top-0 bottom-0 w-1" style={{ background: `linear-gradient(to bottom, transparent, ${T.cyan}30, transparent)` }} />}
                </div>
              );
            })}
            <div className="h-8" />
          </div>
        </motion.div>

        {/* CENTER SYNC GUTTER */}
        {showConnectors && (
          <div className="flex-shrink-0 relative" style={{ width: 32, background: T.bgPanel, borderLeft: `1px solid ${T.borderSubtle}`, borderRight: `1px solid ${T.borderSubtle}` }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-px h-full" style={{ background: `linear-gradient(to bottom, transparent 5%, ${T.borderGlow} 20%, ${T.borderViolet} 50%, ${T.borderGlow} 80%, transparent 95%)` }} />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: T.bgElevated, border: `1px solid ${T.borderActive}`, boxShadow: T.glowCyan }}>
              <ArrowRight size={10} color={T.cyan} />
            </div>
            {(hoveredXml !== null || selectedXml !== null) && (
              <>
                <div className="absolute left-0 w-2 h-2 rounded-full" style={{ top: `${((hoveredXml ?? selectedXml ?? 1) / translationData.xmlLines.length) * 100}%`, background: T.cyan, boxShadow: `0 0 8px ${T.cyan}` }} />
                {Array.from(highlightedJpeLines).map(j => (
                  <div key={`sync-jpe-${j}`} className="absolute right-0 w-2 h-2 rounded-full" style={{ top: `${(j / translationData.jpeLines.length) * 100}%`, background: T.violet, boxShadow: `0 0 8px ${T.violet}` }} />
                ))}
              </>
            )}
          </div>
        )}

        {/* RIGHT PANEL: JPE TRANSLATION */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: T.violet, boxShadow: `0 0 6px ${T.violet}60` }} />
              <Eyebrow color={T.violetBright}>JPE TRANSLATION</Eyebrow>
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{totalLines} entries</span>
            </div>
            <div className="flex items-center gap-1">
              <IconBtn icon={Sparkles} size={11} color={T.violet} title="AI Enhance" onClick={runTranslate} />
              <IconBtn icon={Copy} size={11} title="Copy JPE" onClick={() => copyToClipboard(translationData.jpeLines.map(l => l.text).join("\n"))} />
              <IconBtn icon={Download} size={11} title="Export" onClick={() => copyToClipboard(translationData.jpeLines.map(l => l.text).join("\n"))} />
            </div>
          </div>
          <div ref={jpeScrollRef} className="flex-1 overflow-y-auto py-1" onScroll={handleJpeScroll} style={{ background: T.bg }}>
            {translationData.jpeLines.map(line => {
              const isHlFromXml = highlightedJpeLines.has(line.num);
              const isHovered = hoveredJpe === line.num;
              const isActive = isHlFromXml || isHovered;
              const m = line.marker ? markerIcons[line.marker] : null;
              const confColor = (line.confidence ?? 100) >= 90 ? T.emerald : (line.confidence ?? 100) >= 75 ? T.cyan : (line.confidence ?? 100) >= 60 ? T.amber : T.rose;
              return (
                <div key={line.num} className="flex items-center pr-3 py-[2px] transition-colors relative"
                  style={{
                    background: m ? m.bg : isActive ? "rgba(139,92,246,0.05)" : "transparent",
                    borderLeft: m ? `3px solid ${m.border}` : isActive ? `3px solid ${T.violet}` : "3px solid transparent",
                  }}
                  onMouseEnter={() => setHoveredJpe(line.num)}
                  onMouseLeave={() => setHoveredJpe(null)}>
                  <span className="w-8 text-right pr-3 flex-shrink-0 select-none" style={{ fontSize: 11, fontFamily: T.mono, color: isActive ? T.textTertiary : T.textDim }}>
                    {line.type !== "empty" ? line.num : ""}
                  </span>
                  {m && <span className="flex-shrink-0 mr-1" title={line.markerMsg}><m.Icon size={11} color={m.color} /></span>}
                  {/* Inline edit mode */}
                  {inlineEditLine === line.num && (line.type === "value" || line.type === "property") ? (
                    <input
                      autoFocus
                      className="flex-1 min-w-0 bg-transparent outline-none rounded px-1"
                      style={{
                        fontSize: 12.5, fontFamily: T.mono, color: jpeSyntax[line.type],
                        border: `1px solid ${T.borderActive}`, background: "rgba(99,179,237,0.06)",
                      }}
                      value={inlineEditText}
                      onChange={e => setInlineEditText(e.target.value)}
                      onBlur={commitInlineEdit}
                      onKeyDown={e => {
                        if (e.key === "Enter") { e.preventDefault(); commitInlineEdit(); }
                        if (e.key === "Escape") { setInlineEditLine(null); }
                      }}
                    />
                  ) : (
                    <span
                      className="flex-1 min-w-0 group/line"
                      title={line.type === "value" || line.type === "property" ? "Double-click to edit" : undefined}
                      onDoubleClick={() => {
                        if (line.type === "value" || line.type === "property") startInlineEdit(line.num, line.text);
                      }}
                      style={{
                        fontSize: line.type === "heading" ? 11 : 12.5,
                        fontFamily: line.type === "heading" ? T.sans : T.mono,
                        fontWeight: line.type === "heading" ? 800 : line.type === "property" ? 600 : 400,
                        color: jpeSyntax[line.type],
                        letterSpacing: line.type === "heading" ? "0.12em" : "0",
                        whiteSpace: "pre-wrap", lineHeight: 1.6,
                        cursor: line.type === "value" || line.type === "property" ? "text" : "default",
                      }}>
                      {line.text}
                    </span>
                  )}
                  {line.confidence !== undefined && line.type !== "empty" && (
                    <span className="flex items-center gap-1 flex-shrink-0 ml-2" style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 600, color: confColor, opacity: 0.7 }}>
                      <div className="w-1 h-1 rounded-full" style={{ background: confColor }} />
                      {line.confidence}%
                    </span>
                  )}
                  {showConnectors && isActive && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `linear-gradient(to bottom, transparent, ${T.violet}30, transparent)` }} />}
                </div>
              );
            })}
            <div className="h-8" />
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM STATS BAR ═══ */}
      <div className="flex items-center justify-between px-3 py-1 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Languages size={10} color={T.violet} />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.violet, fontWeight: 700 }}>{activeLocale}</span>
          </div>
          <div className="w-px h-2.5" style={{ background: T.border }} />
          <div className="flex items-center gap-1.5">
            <FileCode size={10} color={T.cyan} />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary }}>XML: {translationData.xmlLines.length} lines</span>
          </div>
          <div className="w-px h-2.5" style={{ background: T.border }} />
          <div className="flex items-center gap-1.5">
            <Sparkles size={10} color={T.violet} />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary }}>JPE: {totalLines} entries</span>
          </div>
          <div className="w-px h-2.5" style={{ background: T.border }} />
          <div className="flex items-center gap-1.5">
            <Network size={10} color={T.textMuted} />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary }}>{translationData.syncMap.length} sync links</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedXml !== null && (
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary }}>
              XML Ln {selectedXml} → JPE {Array.from(highlightedJpeLines).join(", ") || "—"}
            </span>
          )}
          <div className="w-px h-2.5" style={{ background: T.border }} />
          <div className="flex items-center gap-1">
            <GlowDot color={T.emerald} pulse />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.emerald }}>SYNCED</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANALYSIS MODE — Dependency Graph extracted to DependencyGraph.tsx
   DiffViewer extracted to DiffViewer.tsx (Phase 24)
   ═══════════════════════════════════════════════════════════════ */

// Legacy stub kept for type-safety; actual implementation in DependencyGraph.tsx
function DependencyGraphView({ onSwitchView }: { onSwitchView?: () => void }) {
  const inspW = useScaledWidth(310);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrame = useRef(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>("your_mod");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState(graphNodes);
  const [graphFilter, setGraphFilter] = useState<"all" | "deps" | "conflicts">("all");
  const startTimeRef = useRef(Date.now());

  const depChain = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const chain = new Set<string>([selectedNode]);
    const queue = [selectedNode];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const e of graphEdges) {
        if (e.from === current && !chain.has(e.to)) { chain.add(e.to); queue.push(e.to); }
        if (e.to === current && !chain.has(e.from)) { chain.add(e.from); queue.push(e.from); }
      }
    }
    return chain;
  }, [selectedNode]);

  const visibleEdges = useMemo(() => {
    if (graphFilter === "deps") return graphEdges.filter(e => e.type === "dependency");
    if (graphFilter === "conflicts") return graphEdges.filter(e => e.type === "conflict");
    return graphEdges;
  }, [graphFilter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let running = true;

    const render = () => {
      if (!running) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = (Date.now() - startTimeRef.current) / 1000;

      ctx.save();
      ctx.translate(pan.x + w / 2, pan.y + h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.012)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w + 200; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h + 200); ctx.stroke(); }
      for (let gy = 0; gy < h + 200; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w + 200, gy); ctx.stroke(); }

      // Edges
      for (const edge of visibleEdges) {
        const fromN = nodes.find(n => n.id === edge.from);
        const toN = nodes.find(n => n.id === edge.to);
        if (!fromN || !toN) continue;
        const inChain = selectedNode && depChain.has(edge.from) && depChain.has(edge.to);
        const isConflict = edge.type === "conflict";
        const isOptional = edge.type === "optional";
        const baseAlpha = inChain ? 0.7 : selectedNode ? 0.08 : 0.3;
        const edgeColor = isConflict ? `rgba(252,129,129,${baseAlpha})` : isOptional ? `rgba(139,92,246,${baseAlpha * 0.7})` : `rgba(99,179,237,${baseAlpha})`;
        const dx = toN.x - fromN.x, dy = toN.y - fromN.y;
        const cx = (fromN.x + toN.x) / 2 - dy * 0.15;
        const cy = (fromN.y + toN.y) / 2 + dx * 0.15;

        ctx.beginPath(); ctx.moveTo(fromN.x, fromN.y); ctx.quadraticCurveTo(cx, cy, toN.x, toN.y);
        ctx.strokeStyle = edgeColor; ctx.lineWidth = isConflict ? 2.5 : inChain ? 2 : 1;
        if (isOptional) ctx.setLineDash([6, 4]); else if (isConflict) ctx.setLineDash([3, 3]); else ctx.setLineDash([]);
        ctx.stroke(); ctx.setLineDash([]);

        // Pulse particles
        if (inChain || isConflict) {
          const np = isConflict ? 3 : 2;
          for (let p = 0; p < np; p++) {
            const pr = ((t * (isConflict ? 0.6 : 0.35) + p / np) % 1);
            const px = (1-pr)*(1-pr)*fromN.x + 2*(1-pr)*pr*cx + pr*pr*toN.x;
            const py = (1-pr)*(1-pr)*fromN.y + 2*(1-pr)*pr*cy + pr*pr*toN.y;
            const pa = Math.sin(pr * Math.PI) * 0.9;
            const grad = ctx.createRadialGradient(px, py, 0, px, py, 10);
            grad.addColorStop(0, isConflict ? `rgba(252,129,129,${pa * 0.5})` : `rgba(99,179,237,${pa * 0.4})`);
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = isConflict ? `rgba(252,129,129,${pa})` : `rgba(99,179,237,${pa})`;
            ctx.beginPath(); ctx.arc(px, py, isConflict ? 3 : 2.5, 0, Math.PI * 2); ctx.fill();
          }
        }

        // Edge label
        if (edge.label && (inChain || !selectedNode)) {
          ctx.font = `600 8px ${T.sans}`; ctx.textAlign = "center";
          const tm = ctx.measureText(edge.label);
          ctx.fillStyle = "rgba(7,8,16,0.85)"; ctx.fillRect(cx - tm.width / 2 - 4, cy - 9, tm.width + 8, 12);
          ctx.fillStyle = isConflict ? `rgba(252,129,129,${inChain ? 0.9 : 0.5})` : `rgba(160,174,192,${inChain ? 0.75 : 0.3})`;
          ctx.fillText(edge.label, cx, cy);
        }
      }

      // Nodes
      for (const node of nodes) {
        const inC = !selectedNode || depChain.has(node.id);
        const isSel = selectedNode === node.id;
        const isHov = hoveredNode === node.id;
        const alpha = inC ? 1 : 0.15;
        const r = node.r;

        if (isSel || isHov) {
          const gg = ctx.createRadialGradient(node.x, node.y, r, node.x, node.y, r * 3);
          gg.addColorStop(0, node.color + "30"); gg.addColorStop(1, "transparent");
          ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2); ctx.fill();
        }

        if ((node.type === "primary" || node.type === "conflict") && inC) {
          const pR = r + 6 + Math.sin(t * 2) * 3;
          const ra = Math.max(0, Math.min(255, Math.floor((Math.sin(t * 2) * 0.5 + 0.5) * 40)));
          ctx.strokeStyle = node.color + ra.toString(16).padStart(2, "0");
          ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(node.x, node.y, pR, 0, Math.PI * 2); ctx.stroke();
        }

        const sg = ctx.createRadialGradient(node.x, node.y + 2, r * 0.5, node.x, node.y + 2, r * 1.5);
        sg.addColorStop(0, "rgba(0,0,0,0.3)"); sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(node.x, node.y + 2, r * 1.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;

        const bg = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, 0, node.x, node.y, r);
        bg.addColorStop(0, "#1f2330"); bg.addColorStop(1, "#0f1116");
        ctx.fillStyle = bg; ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = node.color; ctx.lineWidth = isSel ? 3 : isHov ? 2.5 : 1.8; ctx.stroke(); ctx.globalAlpha = 1;

        ctx.globalAlpha = alpha;
        ctx.font = `700 ${Math.max(8, r * 0.38)}px ${T.sans}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = T.textPrimary; ctx.fillText(node.shortLabel, node.x, node.y - 2);
        ctx.font = `500 ${Math.max(6, r * 0.26)}px ${T.mono}`; ctx.fillStyle = T.textMuted;
        ctx.fillText(`v${node.version}`, node.x, node.y + r * 0.38);
        ctx.globalAlpha = 1;

        const dotC = node.status === "conflict" ? T.rose : node.status === "warning" ? T.amber : T.emerald;
        const dotX = node.x + r * 0.65, dotY = node.y - r * 0.65;
        ctx.fillStyle = "#0f1116"; ctx.beginPath(); ctx.arc(dotX, dotY, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = dotC; ctx.beginPath(); ctx.arc(dotX, dotY, 3.5, 0, Math.PI * 2); ctx.fill();
        if (node.status === "conflict") {
          const ba = Math.max(0, Math.min(255, Math.floor((Math.sin(t * 4) * 0.5 + 0.5) * 60)));
          ctx.fillStyle = dotC + ba.toString(16).padStart(2, "0");
          ctx.beginPath(); ctx.arc(dotX, dotY, 6, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
      animFrame.current = requestAnimationFrame(render);
    };
    render();
    return () => { running = false; cancelAnimationFrame(animFrame.current); };
  }, [nodes, zoom, pan, selectedNode, hoveredNode, depChain, visibleEdges]);

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const c = containerRef.current; if (!c) return { x: sx, y: sy };
    const rect = c.getBoundingClientRect();
    return { x: (sx - rect.left - pan.x - rect.width / 2) / zoom + rect.width / 2, y: (sy - rect.top - pan.y - rect.height / 2) / zoom + rect.height / 2 };
  }, [zoom, pan]);

  const findNodeAt = useCallback((wx: number, wy: number) => {
    for (let i = nodes.length - 1; i >= 0; i--) { const n = nodes[i]; if ((wx - n.x) ** 2 + (wy - n.y) ** 2 <= n.r ** 2) return n; }
    return null;
  }, [nodes]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const w = screenToWorld(e.clientX, e.clientY); const node = findNodeAt(w.x, w.y);
    if (node) { setDragNode(node.id); setSelectedNode(node.id); } else setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [screenToWorld, findNodeAt]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const w = screenToWorld(e.clientX, e.clientY); setHoveredNode(findNodeAt(w.x, w.y)?.id || null);
    if (dragNode) {
      const dx = (e.clientX - dragStart.x) / zoom, dy = (e.clientY - dragStart.y) / zoom;
      setNodes(prev => prev.map(n => n.id === dragNode ? { ...n, x: n.x + dx, y: n.y + dy } : n));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (dragging) {
      setPan(prev => ({ x: prev.x + (e.clientX - dragStart.x), y: prev.y + (e.clientY - dragStart.y) }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [screenToWorld, findNodeAt, dragNode, dragging, dragStart, zoom]);

  const handleMouseUp = useCallback(() => { setDragNode(null); setDragging(false); }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault(); setZoom(prev => Math.max(0.3, Math.min(3, prev * (e.deltaY > 0 ? 0.92 : 1.08))));
  }, []);

  const sel = selectedNode ? nodes.find(n => n.id === selectedNode) : null;
  const selEdges = selectedNode ? graphEdges.filter(e => e.from === selectedNode || e.to === selectedNode) : [];
  const depCount = selEdges.filter(e => e.type === "dependency").length;
  const optCount = selEdges.filter(e => e.type === "optional").length;
  const conflictCountGraph = selEdges.filter(e => e.type === "conflict").length;

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <Network size={14} color={T.emerald} />
          <Eyebrow color={T.textPrimary}>MOD DEPENDENCY GRAPH</Eyebrow>
          <div className="w-px h-4" style={{ background: T.border }} />
          <Badge color={T.emerald} bg={T.emeraldDim}>{nodes.filter(n => n.status === "ok").length} OK</Badge>
          <Badge color={T.amber} bg={T.amberDim}>{nodes.filter(n => n.status === "warning").length} Warn</Badge>
          <Badge color={T.rose} bg={T.roseDim}>{nodes.filter(n => n.status === "conflict").length} Conflict</Badge>
          <div className="w-px h-4" style={{ background: T.border }} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{nodes.length} nodes · {graphEdges.length} edges</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md overflow-hidden" style={{ border: `1px solid ${T.borderSubtle}` }}>
            {([["all", "All"], ["deps", "Deps"], ["conflicts", "Conflicts"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setGraphFilter(key)} className="px-2.5 py-0.5 transition-colors"
                style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: graphFilter === key ? (key === "conflicts" ? T.rose : T.cyan) : T.textMuted, background: graphFilter === key ? (key === "conflicts" ? T.roseDim : T.cyanDim) : "transparent" }}>
                {label}
              </button>
            ))}
          </div>
          <div className="w-px h-4" style={{ background: T.border }} />
          <JpeButton variant="icon" size="xs" icon={Minus} onClick={() => setZoom(p => Math.max(0.3, p / 1.2))} />
          <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, minWidth: 36, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
          <JpeButton variant="icon" size="xs" icon={Plus} onClick={() => setZoom(p => Math.min(3, p * 1.2))} />
          <JpeButton variant="icon" size="xs" icon={Maximize2} onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} />
          <div className="w-px h-4" style={{ background: T.border }} />
          <JpeButton variant="danger" size="sm" icon={Shield} onClick={onSwitchView}>Conflict Detector</JpeButton>
        </div>
      </div>

      <div className="flex flex-1 min-h-0" style={{ background: T.border }}>
        <div ref={containerRef} className="flex-1 relative overflow-hidden"
          style={{ background: T.bgDeep, cursor: dragging ? "grabbing" : dragNode ? "move" : hoveredNode ? "pointer" : "grab" }}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 45%, rgba(72,187,120,0.03) 0%, transparent 70%)` }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 70% 60%, rgba(252,129,129,0.015) 0%, transparent 50%)` }} />
          <canvas ref={canvasRef} className="absolute inset-0" />

          {hoveredNode && hoveredNode !== selectedNode && (() => {
            const hn = nodes.find(n => n.id === hoveredNode); if (!hn) return null;
            return (
              <div className="absolute z-20 rounded-xl px-3 py-2 pointer-events-none" style={{
                left: (hn.x * zoom + pan.x + (containerRef.current?.clientWidth || 0) / 2 * (1 - zoom)) + hn.r * zoom + 12,
                top: (hn.y * zoom + pan.y + (containerRef.current?.clientHeight || 0) / 2 * (1 - zoom)) - 20,
                background: T.bgElevated, border: `1px solid ${T.border}`, boxShadow: `0 8px 32px rgba(0,0,0,0.6)`, maxWidth: 220,
              }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${hn.color}40, transparent)` }} />
                <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full" style={{ background: hn.color }} /><span style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary }}>{hn.label}</span></div>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{hn.type} · v{hn.version} · {hn.size}</span>
              </div>
            );
          })()}

          <div className="absolute bottom-3 left-3 rounded-xl px-3 py-2 z-10" style={{ background: T.bgGlass, backdropFilter: T.glassBlur, border: `1px solid ${T.border}` }}>
            <Eyebrow color={T.textMuted}>LEGEND</Eyebrow>
            <div className="mt-1.5 space-y-1">
              {[{ color: T.cyan, dash: false, label: "Dependency" }, { color: T.violet, dash: true, label: "Optional" }, { color: T.rose, dash: true, label: "Conflict" }].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <svg width={24} height={6}><line x1={0} y1={3} x2={24} y2={3} stroke={l.color} strokeWidth={2} strokeDasharray={l.dash ? "4 3" : "none"} /></svg>
                  <span style={{ fontSize: 9, color: T.textTertiary }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-3 right-3 rounded-lg px-2 py-1 z-10" style={{ background: T.bgGlass, backdropFilter: T.glassBlur, border: `1px solid ${T.borderSubtle}` }}>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>Scroll to zoom · Drag to pan · Click node to inspect</span>
          </div>
        </div>

        {/* Inspector Panel */}
        <div className="flex flex-col" style={{ width: inspW, background: T.bgDeep, borderLeft: `1px solid ${T.border}` }}>
          <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
            <div className="flex items-center gap-2"><Eye size={12} color={T.violet} /><Eyebrow color={T.violetBright}>NODE INSPECTOR</Eyebrow></div>
            {sel && <div className="w-2 h-2 rounded-full" style={{ background: sel.color, boxShadow: `0 0 6px ${sel.color}60` }} />}
          </div>

          {sel ? (
            <div className="flex-1 overflow-y-auto">
              <div className="px-3 py-3" style={{ borderBottom: `1px solid ${T.border}`, background: `linear-gradient(180deg, ${sel.color}08 0%, transparent 100%)` }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: sel.color, boxShadow: `0 0 8px ${sel.color}40` }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{sel.label}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md" style={{ fontSize: 9, fontWeight: 700, color: sel.color, background: sel.color + "18", letterSpacing: "0.05em" }}>{sel.type.toUpperCase()}</span>
                  <span className="px-2 py-0.5 rounded-md" style={{ fontSize: 9, fontWeight: 700, color: sel.status === "conflict" ? T.rose : sel.status === "warning" ? T.amber : T.emerald, background: sel.status === "conflict" ? T.roseDim : sel.status === "warning" ? T.amberDim : T.emeraldDim }}>{sel.status.toUpperCase()}</span>
                </div>
              </div>

              <div className="px-3 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>
                <p style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.65 }}>{sel.description}</p>
              </div>

              <div className="px-3 py-2 grid grid-cols-2 gap-x-3 gap-y-1.5" style={{ borderBottom: `1px solid ${T.border}` }}>
                {[{ label: "Version", value: `v${sel.version}`, color: T.cyan }, { label: "Files", value: sel.fileCount.toLocaleString(), color: T.textSecondary }, { label: "Size", value: sel.size, color: T.textSecondary }, { label: "Node ID", value: sel.id, color: T.violet }].map(m => (
                  <div key={m.label}><span style={{ fontSize: 9, color: T.textMuted, fontWeight: 600, letterSpacing: "0.05em" }}>{m.label}</span><div style={{ fontSize: 11, fontFamily: T.mono, color: m.color, fontWeight: 600 }}>{m.value}</div></div>
                ))}
              </div>

              <div className="px-3 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>
                <Eyebrow color={T.textMuted}>CONNECTIONS</Eyebrow>
                <div className="mt-2 flex items-center gap-3">
                  {[{ n: depCount, label: "DEPS", color: T.cyan, bg: T.cyanDim, bdr: "rgba(99,179,237,0.15)" }, { n: optCount, label: "OPT", color: T.violet, bg: T.violetDim, bdr: T.borderViolet }, { n: conflictCountGraph, label: "CONFLICT", color: T.rose, bg: T.roseDim, bdr: "rgba(252,129,129,0.15)" }].map(c => (
                    <div key={c.label} className="flex flex-col items-center px-3 py-1.5 rounded-lg flex-1" style={{ background: c.bg, border: `1px solid ${c.bdr}` }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: c.color, fontFamily: T.mono }}>{c.n}</span>
                      <span style={{ fontSize: 8, color: T.textMuted, fontWeight: 600, letterSpacing: "0.08em" }}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-3 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>
                <Eyebrow color={T.textMuted}>LINKED NODES</Eyebrow>
                <div className="mt-1.5 space-y-1">
                  {selEdges.map((edge, i) => {
                    const tid = edge.from === selectedNode ? edge.to : edge.from;
                    const tgt = nodes.find(n => n.id === tid); if (!tgt) return null;
                    const ec = edge.type === "conflict" ? T.rose : edge.type === "optional" ? T.violet : T.cyan;
                    return (
                      <button key={i} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors" onClick={() => setSelectedNode(tid)}
                        style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tgt.color }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, flex: 1, textAlign: "left" }}>{tgt.shortLabel}</span>
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{edge.from === selectedNode ? "→" : "←"}</span>
                        <span className="px-1.5 py-0 rounded" style={{ fontSize: 8, fontWeight: 700, color: ec, background: ec + "15" }}>{edge.type.toUpperCase()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {sel.status === "conflict" && (
                <div className="px-3 py-2">
                  <div className="rounded-xl p-3" style={{ background: T.roseDim, border: `1px solid rgba(252,129,129,0.15)` }}>
                    <div className="flex items-center gap-2 mb-2"><TriangleAlert size={12} color={T.rose} /><span style={{ fontSize: 11, fontWeight: 700, color: T.rose }}>Active Conflict</span></div>
                    <p style={{ fontSize: 10, color: T.textSecondary, lineHeight: 1.5 }}>Tuning ID override collision at Instance 0x034AEECB. Both mods attempt to override the same trait resource.</p>
                    <div className="flex items-center gap-2 mt-2">
                      <JpeButton variant="danger" size="xs" onClick={onSwitchView}>Resolve</JpeButton>
                      <JpeButton variant="ghost" size="xs" onClick={() => setNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, status: "warning" } : n))}>Ignore</JpeButton>
                    </div>
                  </div>
                </div>
              )}

              {sel.status === "warning" && (
                <div className="px-3 py-2">
                  <div className="rounded-xl p-3" style={{ background: T.amberDim, border: `1px solid rgba(246,173,85,0.15)` }}>
                    <div className="flex items-center gap-2 mb-2"><AlertTriangle size={12} color={T.amber} /><span style={{ fontSize: 11, fontWeight: 700, color: T.amber }}>Compatibility Warning</span></div>
                    <p style={{ fontSize: 10, color: T.textSecondary, lineHeight: 1.5 }}>Outdated API calls detected. Update to v8.4+ recommended for full compatibility.</p>
                  </div>
                </div>
              )}

              <div className="px-3 py-2" style={{ borderTop: `1px solid ${T.border}` }}>
                <Eyebrow color={T.textMuted}>MOD HEALTH</Eyebrow>
                <div className="mt-2 space-y-2">
                  {[
                    { label: "Tuning Integrity", pct: sel.status === "conflict" ? 58 : 96, color: sel.status === "conflict" ? T.rose : T.emerald },
                    { label: "STBL Coverage", pct: 87, color: T.cyan },
                    { label: "Conflict Score", pct: sel.status === "conflict" ? 34 : sel.status === "warning" ? 72 : 98, color: sel.status === "conflict" ? T.rose : sel.status === "warning" ? T.amber : T.emerald },
                    { label: "API Compat", pct: sel.status === "warning" ? 68 : 94, color: sel.status === "warning" ? T.amber : T.emerald },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-0.5"><span style={{ fontSize: 10, color: T.textTertiary }}>{m.label}</span><span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: m.color }}>{m.pct}%</span></div>
                      <ProgressBar pct={m.pct} color={m.color} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6">
                <Network size={32} color={T.textDim} className="mx-auto mb-3" />
                <p style={{ fontSize: 12, color: T.textMuted }}>Click a node to inspect</p>
                <p style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>Drag nodes to rearrange · Scroll to zoom</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONFLICT DETECTOR — Git-Merge-Style Resolution UI
   ═══════════════════════════════════════════════════════════════ */


function ConflictDetectorView({ onSwitchView, onOpenWizard }: { onSwitchView?: () => void; onOpenWizard?: () => void }) {
  const gutterW = useScaledWidth(280);
  const [activeFile, setActiveFile] = useState(conflictFiles[0].id);
  const [resolutions, setResolutions] = useState<Record<string, "left" | "right" | "merged" | "disabled">>({});
  const [scrollSync, setScrollSync] = useState(true);
  const [showUnchanged, setShowUnchanged] = useState(true);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  const file = conflictFiles.find(f => f.id === activeFile)!;
  const totalConflicts = conflictFiles.reduce((a, f) => a + f.conflicts.length, 0);
  const resolvedCount = Object.keys(resolutions).length;

  const getLineConflict = (lineNum: number) =>
    file.conflicts.find(c => lineNum >= c.startLine && lineNum <= c.endLine);

  const isResolved = (conflictId: string) => resolutions[conflictId] !== undefined;

  const resolveConflict = (conflictId: string, resolution: "left" | "right" | "merged" | "disabled") => {
    setResolutions(prev => ({ ...prev, [conflictId]: resolution }));
  };

  const unresolve = (conflictId: string) => {
    setResolutions(prev => { const n = { ...prev }; delete n[conflictId]; return n; });
  };

  const handleScroll = (side: "left" | "right") => (e: React.UIEvent<HTMLDivElement>) => {
    if (syncing.current || !scrollSync) return;
    syncing.current = true;
    const target = side === "left" ? rightPanelRef.current : leftPanelRef.current;
    if (target) target.scrollTop = (e.target as HTMLDivElement).scrollTop;
    requestAnimationFrame(() => { syncing.current = false; });
  };

  const severityColor = (s: string) => s === "critical" ? T.rose : s === "major" ? T.amber : T.violet;

  const renderLine = (line: { num: number; text: string; type: string }, side: "left" | "right") => {
    const conflict = getLineConflict(line.num);
    const resolved = conflict ? resolutions[conflict.id] : undefined;
    const isConflictLine = !!conflict;
    const isWinner = resolved === side || resolved === "merged";
    const isLoser = resolved && resolved !== side && resolved !== "merged" && resolved !== "disabled";

    let bg = "transparent";
    let borderColor = "transparent";
    if (isConflictLine && !resolved) {
      bg = side === "left" ? "rgba(99,179,237,0.06)" : "rgba(252,129,129,0.06)";
      borderColor = side === "left" ? `${T.cyan}30` : `${T.rose}30`;
    } else if (isWinner) {
      bg = "rgba(72,187,120,0.08)";
      borderColor = `${T.emerald}30`;
    } else if (isLoser) {
      bg = "rgba(255,255,255,0.01)";
    } else if (resolved === "disabled") {
      bg = "rgba(255,255,255,0.015)";
    }

    const textColor = line.type === "tag" ? T.cyan : line.type === "attr" ? T.violet : line.type === "comment" ? T.textDim : line.type === "value" ? T.emerald : T.textMuted;

    return (
      <div key={`${side}-${line.num}`} className="flex items-stretch group" style={{
        background: bg,
        borderLeft: side === "left" ? `2px solid ${borderColor}` : "none",
        borderRight: side === "right" ? `2px solid ${borderColor}` : "none",
        opacity: isLoser ? 0.3 : resolved === "disabled" ? 0.2 : 1,
        textDecoration: isLoser ? "line-through" : resolved === "disabled" ? "line-through" : "none",
        minHeight: 22,
      }}>
        <span className="w-9 text-right pr-2 flex-shrink-0 select-none py-[1px]" style={{ fontSize: 11, fontFamily: T.mono, color: T.textDim }}>
          {line.num}
        </span>
        {isConflictLine && !resolved && (
          <div className="w-1 flex-shrink-0" style={{ background: conflict!.type === "conflict" ? (side === "left" ? T.cyan : T.rose) : T.amber }} />
        )}
        {isWinner && <div className="w-1 flex-shrink-0" style={{ background: T.emerald }} />}
        <span className="flex-1 py-[1px] px-2" style={{
          fontSize: 12, fontFamily: T.mono, color: textColor,
          whiteSpace: "pre",
        }}>
          {line.text || "\u00A0"}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      {/* ── Master toolbar ── */}
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <Shield size={14} color={T.rose} />
          <Eyebrow color={T.textPrimary}>MOD CONFLICT DETECTOR</Eyebrow>
          <div className="w-px h-4" style={{ background: T.border }} />
          <Badge color={T.rose} bg={T.roseDim}>{totalConflicts - resolvedCount} Unresolved</Badge>
          <Badge color={T.emerald} bg={T.emeraldDim}>{resolvedCount} Resolved</Badge>
          <div className="w-px h-4" style={{ background: T.border }} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{conflictFiles.length} files · {totalConflicts} conflicts</span>
        </div>
        <div className="flex items-center gap-2">
          <JpeButton variant={scrollSync ? "primary" : "ghost"} size="xs" icon={ArrowLeftRight}
            onClick={() => setScrollSync(!scrollSync)}>Sync Scroll</JpeButton>
          <JpeButton variant={showUnchanged ? "primary" : "ghost"} size="xs"
            icon={showUnchanged ? Eye : EyeOff}
            onClick={() => setShowUnchanged(!showUnchanged)}>Unchanged</JpeButton>
          <div className="w-px h-4" style={{ background: T.border }} />
          <JpeButton variant="danger" size="sm" icon={GitMerge} onClick={onOpenWizard}>Resolve Wizard</JpeButton>
          <JpeButton variant="success" size="sm" icon={Network} onClick={onSwitchView}>Dependency Graph</JpeButton>
        </div>
      </div>

      {/* ── File tab bar ── */}
      <div className="flex items-center gap-0 px-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
        {conflictFiles.map(f => {
          const isActive = f.id === activeFile;
          const fileResolved = f.conflicts.every(c => resolutions[c.id]);
          const sc = severityColor(f.severity);
          return (
            <button key={f.id} onClick={() => setActiveFile(f.id)}
              className="flex items-center gap-2 px-3 py-1.5 relative transition-colors"
              style={{
                background: isActive ? T.bgDeep : "transparent",
                borderBottom: isActive ? `2px solid ${sc}` : "2px solid transparent",
                borderRight: `1px solid ${T.border}`,
              }}>
              {fileResolved
                ? <CheckCircle2 size={11} color={T.emerald} />
                : <TriangleAlert size={11} color={sc} />
              }
              <span style={{ fontSize: 11, fontFamily: T.mono, fontWeight: isActive ? 700 : 500, color: isActive ? T.textPrimary : T.textTertiary }}>
                {f.filename}
              </span>
              <span className="px-1.5 py-0 rounded" style={{ fontSize: 8, fontWeight: 700, color: sc, background: sc + "18" }}>
                {f.severity.toUpperCase()}
              </span>
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>
                {f.conflicts.filter(c => resolutions[c.id]).length}/{f.conflicts.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Mod headers ── */}
      <div className="flex flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        {/* Left mod header */}
        <div className="flex-1 flex items-center gap-3 px-4 py-2" style={{ background: `linear-gradient(90deg, ${file.leftMod.color}08, transparent)`, borderRight: `1px solid ${T.border}` }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: file.leftMod.color, boxShadow: `0 0 6px ${file.leftMod.color}40` }} />
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{file.leftMod.name}</span>
              <Badge color={file.leftMod.color} bg={file.leftMod.color + "18"}>YOUR MOD</Badge>
            </div>
            <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>v{file.leftMod.version} by {file.leftMod.author}</span>
          </div>
        </div>
        {/* Center divider */}
        <div className="flex items-center justify-center px-3" style={{ background: T.bgPanel }}>
          <GitMerge size={16} color={T.textMuted} />
        </div>
        {/* Right mod header */}
        <div className="flex-1 flex items-center justify-end gap-3 px-4 py-2" style={{ background: `linear-gradient(270deg, ${file.rightMod.color}08, transparent)`, borderLeft: `1px solid ${T.border}` }}>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Badge color={file.rightMod.color} bg={file.rightMod.color + "18"}>CONFLICTING</Badge>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{file.rightMod.name}</span>
            </div>
            <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>v{file.rightMod.version} by {file.rightMod.author}</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: file.rightMod.color, boxShadow: `0 0 6px ${file.rightMod.color}40` }} />
        </div>
      </div>

      {/* ── Three-column merge view ── */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT CODE PANEL */}
        <div className="flex-1 flex flex-col" style={{ borderRight: `1px solid ${T.border}` }}>
          <div className="px-3 py-1 flex-shrink-0 flex items-center justify-between" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, letterSpacing: "0.08em" }}>LOCAL — {file.leftMod.name}</span>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{file.leftLines.length} lines</span>
          </div>
          <div ref={leftPanelRef} className="flex-1 overflow-y-auto" onScroll={handleScroll("left")} style={{ background: T.bgDeep }}>
            {file.leftLines.map(line => {
              if (!showUnchanged && !getLineConflict(line.num)) return null;
              return renderLine(line, "left");
            })}
          </div>
        </div>

        {/* CENTER CONFLICT GUTTER */}
        <div className="flex flex-col" style={{ width: gutterW, background: T.bgPanel, borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}` }}>
          <div className="px-3 py-1 flex-shrink-0 flex items-center justify-center" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, letterSpacing: "0.08em" }}>CONFLICT RESOLUTION</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {file.conflicts.map((conflict) => {
              const resolved = resolutions[conflict.id];
              const cColor = conflict.type === "conflict" ? T.rose : conflict.type === "warning" ? T.amber : T.violet;
              return (
                <div key={conflict.id} className="rounded-xl overflow-hidden" style={{
                  border: `1px solid ${resolved ? `${T.emerald}30` : `${cColor}25`}`,
                  background: resolved ? T.emeraldDim : T.bgDeep,
                }}>
                  {/* Conflict header */}
                  <div className="flex items-center justify-between px-2.5 py-1.5" style={{ borderBottom: `1px solid ${resolved ? `${T.emerald}15` : `${cColor}15`}` }}>
                    <div className="flex items-center gap-1.5">
                      {resolved
                        ? <CheckCircle2 size={11} color={T.emerald} />
                        : <TriangleAlert size={11} color={cColor} />
                      }
                      <span style={{ fontSize: 10, fontWeight: 700, color: resolved ? T.emerald : cColor }}>
                        {resolved ? "Resolved" : conflict.type === "conflict" ? "CONFLICT" : conflict.type === "warning" ? "WARNING" : "INFO"}
                      </span>
                    </div>
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>L{conflict.startLine}{conflict.endLine !== conflict.startLine ? `-${conflict.endLine}` : ""}</span>
                  </div>

                  {/* Description */}
                  <div className="px-2.5 py-1.5">
                    <p style={{ fontSize: 10, color: T.textSecondary, lineHeight: 1.5 }}>{conflict.description}</p>
                  </div>

                  {/* Resolution buttons or resolved state */}
                  <div className="px-2.5 py-2" style={{ borderTop: `1px solid ${resolved ? `${T.emerald}10` : "rgba(255,255,255,0.03)"}` }}>
                    {resolved ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Check size={10} color={T.emerald} />
                          <span style={{ fontSize: 10, fontWeight: 600, color: T.emerald }}>
                            {resolved === "left" ? `Keep ${file.leftMod.name}` : resolved === "right" ? `Keep ${file.rightMod.name}` : resolved === "merged" ? "Smart Merged" : "Both Disabled"}
                          </span>
                        </div>
                        <button onClick={() => unresolve(conflict.id)} className="px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.borderSubtle}` }}>
                          <RotateCcw size={9} color={T.textMuted} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <JpeButton variant="primary" size="xs" icon={ChevronRight} className="flex-1"
                            onClick={() => resolveConflict(conflict.id, "left")}>Keep Left</JpeButton>
                          <JpeButton variant="danger" size="xs" className="flex-1"
                            onClick={() => resolveConflict(conflict.id, "right")}>Keep Right</JpeButton>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <JpeButton variant="secondary" size="xs" icon={GitMerge} className="flex-1"
                            onClick={() => resolveConflict(conflict.id, "merged")}>Smart Merge</JpeButton>
                          <JpeButton variant="ghost" size="xs" icon={Ban}
                            onClick={() => resolveConflict(conflict.id, "disabled")}>Disable</JpeButton>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Summary card */}
            <div className="rounded-xl p-3 mt-2" style={{ background: T.bgSurface, border: `1px solid ${T.border}` }}>
              <Eyebrow color={T.textMuted}>FILE RESOLUTION STATUS</Eyebrow>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 10, color: T.textTertiary }}>Resource Type</span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: T.violet }}>{file.resource}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 10, color: T.textTertiary }}>Instance ID</span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: T.cyan }}>{file.instance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 10, color: T.textTertiary }}>Progress</span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: file.conflicts.every(c => resolutions[c.id]) ? T.emerald : T.amber }}>
                    {file.conflicts.filter(c => resolutions[c.id]).length}/{file.conflicts.length}
                  </span>
                </div>
                <ProgressBar pct={file.conflicts.length ? (file.conflicts.filter(c => resolutions[c.id]).length / file.conflicts.length) * 100 : 0} color={file.conflicts.every(c => resolutions[c.id]) ? T.emerald : T.amber} />
              </div>
              {file.conflicts.every(c => resolutions[c.id]) && (
                <JpeButton variant="success" size="sm" icon={CheckCircle2} className="w-full mt-3"
                  onClick={onSwitchView}>
                  Apply Resolutions & Compile
                </JpeButton>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT CODE PANEL */}
        <div className="flex-1 flex flex-col">
          <div className="px-3 py-1 flex-shrink-0 flex items-center justify-between" style={{ background: T.bgSurface, borderBottom: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, letterSpacing: "0.08em" }}>INCOMING — {file.rightMod.name}</span>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{file.rightLines.length} lines</span>
          </div>
          <div ref={rightPanelRef} className="flex-1 overflow-y-auto" onScroll={handleScroll("right")} style={{ background: T.bgDeep }}>
            {file.rightLines.map(line => {
              if (!showUnchanged && !getLineConflict(line.num)) return null;
              return renderLine(line, "right");
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom status bar ── */}
      <div className="flex items-center justify-between px-4 py-1 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-4">
          {conflictFiles.map(f => {
            const allDone = f.conflicts.every(c => resolutions[c.id]);
            return (
              <div key={f.id} className="flex items-center gap-1.5">
                {allDone ? <CheckCircle2 size={9} color={T.emerald} /> : <XCircle size={9} color={severityColor(f.severity)} />}
                <span style={{ fontSize: 9, fontFamily: T.mono, color: allDone ? T.emerald : T.textMuted }}>{f.filename.split("_").pop()}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>
            {resolvedCount}/{totalConflicts} resolved · {totalConflicts - resolvedCount} remaining
          </span>
          <div className="w-24">
            <ProgressBar pct={totalConflicts ? (resolvedCount / totalConflicts) * 100 : 0} color={resolvedCount === totalConflicts ? T.emerald : T.cyan} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BUILD MODE — Pipeline Dashboard
   ═══════════════════════════════════════════════════════════════ */


function BuildWorkspace() {
  const buildSideW = useScaledWidth(260);
  const [stages, setStages] = useState<PipelineStage[]>(() =>
    stageTemplates.map(t => ({
      ...t, status: "idle" as StageStatus, progress: 0, duration: 0,
    }))
  );
  const [buildState, setBuildState] = useState<"idle" | "running" | "done" | "failed">("idle");
  const [selectedStage, setSelectedStage] = useState("parse");
  const [buildNumber, setBuildNumber] = useState(4218);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const activeStageIdx = stages.findIndex(s => s.status === "running");
  const completedCount = stages.filter(s => s.status === "success").length;
  const totalProgress = stages.reduce((acc, s) => acc + s.progress, 0) / stages.length;

  const startBuild = useCallback(() => {
    const newBuild = buildNumber + 1;
    setBuildNumber(newBuild);
    setBuildState("running");
    setElapsedMs(0);
    setStages(stageTemplates.map(t => ({
      ...t, status: "idle" as StageStatus, progress: 0, duration: 0,
    })));
    setSelectedStage("parse");
    setTimeout(() => {
      setStages(prev => prev.map((s, i) => i === 0 ? { ...s, status: "running" as StageStatus } : s));
    }, 200);
  }, [buildNumber]);

  useEffect(() => {
    if (buildState === "running") {
      timerRef.current = setInterval(() => setElapsedMs(p => p + 100), 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [buildState]);

  useEffect(() => {
    if (buildState !== "running") return;
    stageTimerRef.current = setInterval(() => {
      setStages(prev => {
        const runningIdx = prev.findIndex(s => s.status === "running");
        if (runningIdx === -1) return prev;
        const next = [...prev];
        const stage = { ...next[runningIdx] };
        stage.duration += 50;
        stage.progress = Math.min(100, (stage.duration / stage.targetDuration) * 100);
        if (stage.progress >= 100) {
          stage.status = "success";
          stage.progress = 100;
          stage.duration = stage.targetDuration;
          next[runningIdx] = stage;
          if (runningIdx + 1 < next.length) {
            next[runningIdx + 1] = { ...next[runningIdx + 1], status: "running" };
            setSelectedStage(next[runningIdx + 1].id);
          } else {
            setBuildState("done");
          }
        } else {
          next[runningIdx] = stage;
        }
        return next;
      });
    }, 50);
    return () => { if (stageTimerRef.current) clearInterval(stageTimerRef.current); };
  }, [buildState]);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); });

  const resetBuild = () => {
    setBuildState("idle");
    setElapsedMs(0);
    setStages(stageTemplates.map(t => ({
      ...t, status: "idle" as StageStatus, progress: 0, duration: 0,
    })));
    if (timerRef.current) clearInterval(timerRef.current);
    if (stageTimerRef.current) clearInterval(stageTimerRef.current);
  };

  const sel = stages.find(s => s.id === selectedStage)!;
  const visibleLogs = sel.status === "idle" ? []
    : sel.logs.filter((_, i) => ((i + 1) / sel.logs.length) * 100 <= sel.progress + 10);

  const scColor = (s: StageStatus) =>
    s === "success" ? T.emerald : s === "running" ? T.violet : s === "failed" ? T.rose : T.textMuted;

  const fmtMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    const cs = Math.floor((ms % 1000) / 100);
    return m > 0 ? `${m}:${String(rem).padStart(2, "0")}.${cs}` : `${rem}.${cs}s`;
  };

  const sColor = (idx: number) => [T.cyan, T.violet, T.amber, T.rose, T.emerald][idx % 5];

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <Rocket size={14} color={T.amber} />
          <Eyebrow color={T.textPrimary}>BUILD PIPELINE</Eyebrow>
          <div className="w-px h-4" style={{ background: T.border }} />
          {buildState === "idle" && <Badge color={T.textMuted} bg="rgba(255,255,255,0.04)">Ready</Badge>}
          {buildState === "running" && activeStageIdx >= 0 && (
            <>
              <Badge color={T.violet} bg={T.violetDim}>Stage {activeStageIdx + 1}/{stages.length} — {stages[activeStageIdx].shortName}</Badge>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.violet, boxShadow: `0 0 6px ${T.violet}` }} />
            </>
          )}
          {buildState === "done" && <Badge color={T.emerald} bg={T.emeraldDim}>Build #{buildNumber} Complete</Badge>}
          {buildState === "failed" && <Badge color={T.rose} bg={T.roseDim}>Build Failed</Badge>}
          <div className="w-px h-4" style={{ background: T.border }} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>Build #{buildNumber} · {fmtMs(elapsedMs)}</span>
        </div>
        <div className="flex items-center gap-2">
          {buildState === "idle" ? (
            <JpeButton variant="success" size="sm" icon={Play} onClick={startBuild}>Run Build</JpeButton>
          ) : buildState === "running" ? (
            <JpeButton variant="danger" size="sm" icon={XCircle} onClick={resetBuild}>Abort</JpeButton>
          ) : (
            <>
              <JpeButton variant="ghost" size="sm" icon={RotateCcw} onClick={resetBuild}>Reset</JpeButton>
              <JpeButton variant="success" size="sm" icon={Download} onClick={() => { navigator.clipboard.writeText("Evil_Trait_Override_v1.0.package — Build #" + buildNumber + " exported successfully").then(() => toast.success("Package exported")).catch(() => {}); }}>Export .package</JpeButton>
            </>
          )}
        </div>
      </div>

      {/* Global progress */}
      {buildState === "running" && (
        <div className="relative flex-shrink-0" style={{ height: 3 }}>
          <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.03)" }} />
          <div className="absolute top-0 left-0 h-full transition-all" style={{ width: `${totalProgress}%`, background: `linear-gradient(90deg, ${T.cyan}, ${T.violet}, ${T.emerald})`, boxShadow: `0 0 10px ${T.violet}40` }} />
        </div>
      )}

      {/* Pipeline stage nodes */}
      <div className="flex items-center justify-center px-6 py-4 flex-shrink-0 relative" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
        {activeStageIdx >= 0 && (
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at ${((activeStageIdx + 0.5) / stages.length) * 100}% 50%, ${T.violet}08 0%, transparent 50%)` }} />
        )}
        <div className="flex items-center gap-0">
          {stages.map((stage, i) => {
            const isSel = stage.id === selectedStage;
            const nc = sColor(i);
            const isRun = stage.status === "running";
            const isDone = stage.status === "success";
            return (
              <div key={stage.id} className="flex items-center">
                <button onClick={() => setSelectedStage(stage.id)}
                  className="relative flex flex-col items-center gap-1 rounded-xl px-4 py-2.5 transition-all cursor-pointer"
                  style={{
                    background: isSel ? (isRun ? `${T.violet}12` : isDone ? `${T.emerald}10` : `${nc}08`) : "rgba(255,255,255,0.015)",
                    border: `1px solid ${isSel ? (isRun ? T.borderViolet : isDone ? `${T.emerald}30` : `${nc}25`) : T.borderSubtle}`,
                    boxShadow: isRun && isSel ? T.glowViolet : isSel ? `0 0 12px ${nc}10` : "none",
                    minWidth: 120,
                  }}>
                  {isRun && <div className="absolute top-0 left-3 right-3 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.violet}, transparent)` }} />}
                  {isRun && (
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full flex items-center justify-center" style={{ background: T.violet, boxShadow: `0 0 10px ${T.violet}` }}>
                      <div className="absolute inset-0 rounded-full animate-ping" style={{ background: T.violet, opacity: 0.4 }} />
                    </div>
                  )}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0 rounded" style={{
                    background: isDone ? T.emeraldDim : isRun ? T.violetDim : T.bgPanel,
                    border: `1px solid ${isDone ? `${T.emerald}25` : isRun ? T.borderViolet : T.borderSubtle}`,
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 800, fontFamily: T.mono, color: isDone ? T.emerald : isRun ? T.violet : T.textDim }}>{i + 1}</span>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg mb-0.5" style={{
                    background: isDone ? T.emeraldDim : isRun ? T.violetDim : "rgba(255,255,255,0.03)",
                  }}>
                    {isDone ? <CheckCircle2 size={16} color={T.emerald} /> :
                     isRun ? <div className="animate-spin"><RefreshCw size={16} color={T.violet} /></div> :
                     <stage.icon size={16} color={stage.status === "idle" ? T.textMuted : scColor(stage.status)} />}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isDone ? T.emerald : isRun ? T.violet : T.textMuted, fontFamily: T.display }}>{stage.shortName}</span>
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>
                    {stage.status === "idle" ? "\u2014" : isRun ? fmtMs(stage.duration) : fmtMs(stage.targetDuration)}
                  </span>
                  {isRun && (
                    <div className="w-full mt-1 rounded-full overflow-hidden" style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${stage.progress}%`, background: `linear-gradient(90deg, ${T.violet}, ${T.cyan})`, boxShadow: `0 0 4px ${T.violet}60` }} />
                    </div>
                  )}
                </button>
                {i < stages.length - 1 && (
                  <div className="flex items-center mx-0.5 relative" style={{ width: 32 }}>
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2" style={{ height: 2, background: isDone ? `${T.emerald}30` : T.borderSubtle, borderRadius: 1 }} />
                    {isDone && (
                      <div className="absolute top-1/2 left-0 -translate-y-1/2" style={{ height: 2, borderRadius: 1, width: "100%", background: `linear-gradient(90deg, ${T.emerald}60, ${sColor(i + 1)}40)`, boxShadow: `0 0 4px ${T.emerald}20` }} />
                    )}
                    {isRun && (
                      <div className="absolute top-1/2 left-0 -translate-y-1/2" style={{ height: 2, borderRadius: 1, width: `${stage.progress}%`, background: `linear-gradient(90deg, ${T.violet}60, ${T.cyan}40)`, transition: "width 0.1s" }} />
                    )}
                    <ChevronRight size={10} color={isDone ? T.emerald : T.textMuted} className="relative z-10 mx-auto" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content: sidebar + logs */}
      <div className="flex flex-1 min-h-0">
        {/* Stage list sidebar */}
        <div className="flex flex-col" style={{ width: buildSideW, borderRight: `1px solid ${T.border}`, background: T.bgPanel }}>
          <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
            <Eyebrow color={T.textMuted}>STAGE DETAILS</Eyebrow>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {stages.map((stage, i) => {
              const isSel = stage.id === selectedStage;
              const nc = sColor(i);
              return (
                <button key={stage.id} onClick={() => setSelectedStage(stage.id)} className="w-full text-left rounded-xl p-3 transition-all"
                  style={{ background: isSel ? `${nc}08` : "rgba(255,255,255,0.015)", border: `1px solid ${isSel ? `${nc}25` : T.borderSubtle}` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded flex items-center justify-center" style={{
                        background: stage.status === "success" ? T.emeraldDim : stage.status === "running" ? T.violetDim : "rgba(255,255,255,0.04)",
                      }}>
                        {stage.status === "success" ? <Check size={10} color={T.emerald} /> :
                         stage.status === "running" ? <div className="animate-spin"><RefreshCw size={9} color={T.violet} /></div> :
                         <span style={{ fontSize: 8, fontWeight: 800, color: T.textDim, fontFamily: T.mono }}>{i + 1}</span>}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isSel ? T.textPrimary : T.textTertiary }}>{stage.shortName}</span>
                    </div>
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: scColor(stage.status) }}>{stage.status === "idle" ? "PENDING" : stage.status.toUpperCase()}</span>
                  </div>
                  <div className="rounded-full overflow-hidden mb-1.5" style={{ height: 2, background: "rgba(255,255,255,0.04)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${stage.progress}%`, background: stage.status === "success" ? T.emerald : stage.status === "running" ? T.violet : "transparent" }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{stage.status === "idle" ? "\u2014" : fmtMs(stage.status === "running" ? stage.duration : stage.targetDuration)}</span>
                    {stage.artifacts > 0 && <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{stage.artifacts} artifacts</span>}
                  </div>
                </button>
              );
            })}

            {/* Build summary */}
            <div className="rounded-xl p-3" style={{ background: T.bgSurface, border: `1px solid ${T.border}` }}>
              <Eyebrow color={T.textMuted}>BUILD SUMMARY</Eyebrow>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 10, color: T.textTertiary }}>Build</span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: T.cyan }}>#{buildNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 10, color: T.textTertiary }}>Branch</span>
                  <div className="flex items-center gap-1"><GitBranch size={9} color={T.violet} /><span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: T.violet }}>main</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 10, color: T.textTertiary }}>Elapsed</span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: T.textPrimary }}>{fmtMs(elapsedMs)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 10, color: T.textTertiary }}>Progress</span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: buildState === "done" ? T.emerald : T.violet }}>{completedCount}/{stages.length}</span>
                </div>
                <ProgressBar pct={totalProgress} color={buildState === "done" ? T.emerald : T.violet} />
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 10, color: T.textTertiary }}>Artifacts</span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: T.amber }}>
                    {stages.filter(s => s.status === "success").reduce((a, s) => a + s.artifacts, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Log output */}
        <div className="flex-1 flex flex-col" style={{ background: T.bgDeep }}>
          <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
            <div className="flex items-center gap-3">
              <Terminal size={12} color={sColor(stages.findIndex(s => s.id === selectedStage))} />
              <span style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, fontFamily: T.display }}>{sel.name}</span>
              <div className="w-px h-4" style={{ background: T.border }} />
              <span className="px-1.5 py-0 rounded" style={{ fontSize: 9, fontWeight: 700, color: scColor(sel.status), background: `${scColor(sel.status)}15` }}>
                {sel.status === "idle" ? "PENDING" : sel.status.toUpperCase()}
              </span>
              {sel.status === "running" && <span style={{ fontSize: 10, fontFamily: T.mono, color: T.violet }}>{Math.round(sel.progress)}%</span>}
            </div>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{visibleLogs.length}/{sel.logs.length} entries</span>
          </div>

          {sel.status === "running" && (
            <div className="flex-shrink-0 px-4 py-2" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>Stage progress</span>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.violet }}>{Math.round(sel.progress)}% · {fmtMs(sel.duration)}</span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 4, background: "rgba(255,255,255,0.04)" }}>
                <div className="h-full rounded-full relative overflow-hidden" style={{ width: `${sel.progress}%`, background: `linear-gradient(90deg, ${T.violet}, ${T.cyan})`, boxShadow: `0 0 8px ${T.violet}40`, transition: "width 0.1s" }} />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto" style={{ background: T.bgDeep }}>
            {sel.status === "idle" ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center px-6">
                  <sel.icon size={28} color={T.textDim} className="mx-auto mb-3" />
                  <p style={{ fontSize: 12, color: T.textMuted }}>Stage pending</p>
                  <p style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>
                    {buildState === "idle" ? "Click \"Run Build\" to start the pipeline" : "Waiting for previous stages to complete"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3">
                {visibleLogs.map((log, i) => {
                  const tagColor = log.type === "success" ? T.emerald : log.type === "warn" ? T.amber : log.type === "error" ? T.rose : log.type === "debug" ? T.textMuted : T.cyan;
                  return (
                    <div key={i} className="flex items-start gap-0 py-[2px]" style={{ fontFamily: T.mono }}>
                      <span className="flex-shrink-0 select-none" style={{ fontSize: 11, color: T.textDim, width: 70 }}>[{log.time}]</span>
                      <span className="flex-shrink-0 select-none px-1 rounded mr-1" style={{ fontSize: 9, fontWeight: 700, color: tagColor, background: `${tagColor}12`, lineHeight: "18px", minWidth: 38, textAlign: "center" }}>
                        {log.type.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 11, color: log.type === "debug" ? T.textDim : T.textSecondary }}>{log.text}</span>
                    </div>
                  );
                })}
                {sel.status === "running" && (
                  <div className="flex items-center gap-1 py-1 mt-1">
                    <div className="w-1.5 h-4 rounded-sm animate-pulse" style={{ background: T.violet, opacity: 0.7 }} />
                    <span className="animate-pulse" style={{ fontSize: 10, fontFamily: T.mono, color: T.textDim }}>Processing…</span>
                  </div>
                )}
                {sel.status === "success" && (
                  <div className="flex items-center gap-2 mt-2 py-2 px-3 rounded-lg" style={{ background: T.emeraldDim, border: `1px solid ${T.emerald}20` }}>
                    <CheckCircle2 size={13} color={T.emerald} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.emerald }}>Stage completed in {fmtMs(sel.targetDuration)}</span>
                    {sel.artifacts > 0 && (
                      <>
                        <div className="w-px h-3.5" style={{ background: `${T.emerald}30` }} />
                        <span style={{ fontSize: 10, fontFamily: T.mono, color: T.emerald }}>{sel.artifacts.toLocaleString()} artifacts generated</span>
                      </>
                    )}
                  </div>
                )}
                <div ref={logEndRef} />
              </div>
            )}
          </div>

          {buildState !== "idle" && (
            <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
              <div className="flex items-center gap-4">
                {stages.map(stage => (
                  <button key={stage.id} onClick={() => setSelectedStage(stage.id)} className="flex items-center gap-1.5">
                    {stage.status === "success" ? <CheckCircle2 size={9} color={T.emerald} /> :
                     stage.status === "running" ? <div className="animate-spin"><RefreshCw size={9} color={T.violet} /></div> :
                     <CircleDot size={9} color={T.textDim} />}
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: stage.id === selectedStage ? T.textPrimary : T.textMuted, fontWeight: stage.id === selectedStage ? 700 : 500 }}>{stage.shortName}</span>
                    {stage.status !== "idle" && <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textDim }}>{stage.status === "running" ? fmtMs(stage.duration) : fmtMs(stage.targetDuration)}</span>}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{buildState === "done" ? "Build successful" : `${completedCount}/${stages.length} stages`}</span>
                <div className="w-20"><ProgressBar pct={totalProgress} color={buildState === "done" ? T.emerald : T.violet} /></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LIBRARY MODE
   ═══════════════════════════════════════════════════════════════ */
function LibraryWorkspace({ onNavigate }: { onNavigate?: (m: WorkspaceMode) => void }) {
  const libSideW = useScaledWidth(210);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<ModSource | "all">("all");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<ModStatus | "all">("all");
  const [mods, setMods] = useState<LibMod[]>(modLibraryData);
  const [selectedMod, setSelectedMod] = useState<LibMod | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "rating" | "updated" | "downloads">("name");
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = mods;
    if (sourceFilter !== "all") list = list.filter(m => m.source === sourceFilter);
    if (catFilter !== "All") list = list.filter(m => m.category === catFilter);
    if (statusFilter !== "all") list = list.filter(m => m.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.author.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "downloads") return parseFloat(b.downloads) - parseFloat(a.downloads);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [mods, search, sourceFilter, catFilter, statusFilter, sortBy]);

  const updateCount = mods.filter(m => m.status === "update").length;
  const outdatedCount = mods.filter(m => m.status === "outdated").length;
  const installedCount = mods.filter(m => m.status === "installed" || m.status === "update" || m.status === "outdated").length;
  const enabledCount = mods.filter(m => m.enabled).length;
  const totalConflicts = mods.reduce((s, m) => s + m.conflicts, 0);

  const toggleEnabled = (id: string) => {
    setMods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
    if (selectedMod?.id === id) setSelectedMod(p => p ? { ...p, enabled: !p.enabled } : null);
  };

  const simulateUpdate = (id: string) => {
    setUpdating(prev => new Set(prev).add(id));
    setTimeout(() => {
      setMods(prev => prev.map(m => m.id === id ? { ...m, status: "installed" as ModStatus, version: m.latestVersion } : m));
      setUpdating(prev => { const n = new Set(prev); n.delete(id); return n; });
      if (selectedMod?.id === id) setSelectedMod(p => p ? { ...p, status: "installed", version: p.latestVersion } : null);
    }, 1800);
  };

  const updateAll = () => {
    mods.filter(m => m.status === "update").forEach((m, i) => {
      setTimeout(() => simulateUpdate(m.id), i * 600);
    });
  };

  const installMod = (id: string) => {
    setMods(prev => prev.map(m => m.id === id ? { ...m, status: "installed" as ModStatus, enabled: true, installed: "Just now" } : m));
    if (selectedMod?.id === id) setSelectedMod(p => p ? { ...p, status: "installed", enabled: true, installed: "Just now" } : null);
  };

  const stColors: Record<string, string> = { installed: T.emerald, update: T.amber, available: T.cyan, outdated: T.rose };
  const srcColor = (s: ModSource) => modSources.find(ms => ms.id === s)?.color ?? T.textDim;

  const renderStars = (r: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => <Star key={i} size={9} color={i < Math.floor(r) ? T.amber : T.textDim} fill={i < Math.floor(r) ? T.amber : "none"} strokeWidth={1.5} />)}
      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.amber, marginLeft: 2 }}>{r.toFixed(1)}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <Library size={14} color={T.cyanBright} />
          <Eyebrow color={T.textPrimary}>MOD LIBRARY</Eyebrow>
          <div className="w-px h-4" style={{ background: T.border }} />
          <Badge color={T.emerald} bg={T.emeraldDim}>{installedCount} installed</Badge>
          <Badge color={T.cyan} bg={T.cyanDim}>{enabledCount} active</Badge>
          {updateCount > 0 && <Badge color={T.amber} bg={T.amberDim}>{updateCount} update{updateCount > 1 ? "s" : ""}</Badge>}
          {outdatedCount > 0 && <Badge color={T.rose} bg={T.roseDim}>{outdatedCount} outdated</Badge>}
          {totalConflicts > 0 && <Badge color={T.rose} bg={T.roseDim}>{totalConflicts} conflict{totalConflicts > 1 ? "s" : ""}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-2 py-1 rounded-lg outline-none cursor-pointer"
            style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
            <option value="name">Sort: Name</option>
            <option value="rating">Sort: Rating</option>
            <option value="downloads">Sort: Downloads</option>
            <option value="updated">Sort: Updated</option>
          </select>
          {updateCount > 0 && (
            <JpeButton variant="danger" size="sm" icon={Download} onClick={updateAll}>
              Update All ({updateCount})
            </JpeButton>
          )}
          <JpeButton variant="primary" size="sm" icon={Upload} onClick={() => setSearch("")}>Import</JpeButton>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="flex flex-col flex-shrink-0" style={{ width: libSideW, borderRight: `1px solid ${T.border}`, background: T.bgPanel }}>
          {/* Search */}
          <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="relative">
              <Search size={12} color={T.textDim} className="absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search mods..."
                className="w-full pl-7 pr-7 py-1.5 rounded-lg outline-none"
                style={{ fontSize: 11, fontFamily: T.mono, color: T.textPrimary, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSubtle}` }} />
              {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2"><X size={10} color={T.textDim} /></button>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {/* Sources */}
            <div className="px-3 pt-2 pb-1"><Eyebrow color={T.textDim}>SOURCES</Eyebrow></div>
            {modSources.map(s => {
              const isAct = sourceFilter === s.id;
              const SIcon = s.icon;
              const cnt = s.id === "all" ? mods.length : mods.filter(m => m.source === s.id).length;
              return (
                <button key={s.id} onClick={() => setSourceFilter(s.id)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
                  style={{ background: isAct ? `${s.color}10` : "transparent", borderLeft: `2px solid ${isAct ? s.color : "transparent"}` }}>
                  <SIcon size={11} color={isAct ? s.color : T.textDim} />
                  <span className="flex-1" style={{ fontSize: 11, color: isAct ? T.textPrimary : T.textTertiary, fontWeight: isAct ? 700 : 500 }}>{s.label}</span>
                  <span className="px-1.5 rounded" style={{ fontSize: 9, fontFamily: T.mono, color: isAct ? s.color : T.textDim, background: isAct ? `${s.color}12` : "rgba(255,255,255,0.03)" }}>{cnt}</span>
                </button>
              );
            })}
            {/* Status */}
            <div className="px-3 pt-3 pb-1"><Eyebrow color={T.textDim}>STATUS</Eyebrow></div>
            {([["all", "All", T.textTertiary], ["installed", "Installed", T.emerald], ["update", "Updates Available", T.amber], ["outdated", "Outdated", T.rose], ["available", "Not Installed", T.cyan]] as [ModStatus | "all", string, string][]).map(([id, label, color]) => {
              const isAct = statusFilter === id;
              const cnt = id === "all" ? mods.length : mods.filter(m => m.status === id).length;
              return (
                <button key={id} onClick={() => setStatusFilter(id)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
                  style={{ background: isAct ? `${color}10` : "transparent", borderLeft: `2px solid ${isAct ? color : "transparent"}` }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: isAct ? color : T.textDim }} />
                  <span className="flex-1" style={{ fontSize: 11, color: isAct ? T.textPrimary : T.textTertiary, fontWeight: isAct ? 700 : 500 }}>{label}</span>
                  <span className="px-1.5 rounded" style={{ fontSize: 9, fontFamily: T.mono, color: isAct ? color : T.textDim, background: isAct ? `${color}12` : "rgba(255,255,255,0.03)" }}>{cnt}</span>
                </button>
              );
            })}
            {/* Categories */}
            <div className="px-3 pt-3 pb-1"><Eyebrow color={T.textDim}>CATEGORIES</Eyebrow></div>
            {modCategoryList.map(cat => {
              const isAct = catFilter === cat;
              const cnt = cat === "All" ? mods.length : mods.filter(m => m.category === cat).length;
              if (cat !== "All" && cnt === 0) return null;
              return (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className="w-full flex items-center justify-between px-3 py-1.5 transition-colors text-left"
                  style={{ background: isAct ? `${T.cyan}10` : "transparent", borderLeft: `2px solid ${isAct ? T.cyan : "transparent"}` }}>
                  <span style={{ fontSize: 11, color: isAct ? T.textPrimary : T.textTertiary, fontWeight: isAct ? 700 : 500 }}>{cat}</span>
                  <span className="px-1.5 rounded" style={{ fontSize: 9, fontFamily: T.mono, color: isAct ? T.cyan : T.textDim, background: isAct ? T.cyanDim : "rgba(255,255,255,0.03)" }}>{cnt}</span>
                </button>
              );
            })}
          </div>
          {/* Sidebar summary */}
          <div className="px-3 py-2 flex-shrink-0 space-y-1.5" style={{ borderTop: `1px solid ${T.border}` }}>
            <Eyebrow color={T.textDim}>LIBRARY HEALTH</Eyebrow>
            <div className="rounded-lg p-2.5 space-y-1.5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
              {[
                { label: "Total Mods", value: `${mods.length}`, color: T.textPrimary },
                { label: "Total Size", value: `${(mods.reduce((s, m) => s + parseFloat(m.size), 0)).toFixed(1)} MB`, color: T.cyan },
                { label: "Total Tunings", value: `${mods.reduce((s, m) => s + m.tunings, 0)}`, color: T.violet },
                { label: "Conflicts", value: `${totalConflicts}`, color: totalConflicts > 0 ? T.rose : T.emerald },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span style={{ fontSize: 9, fontWeight: 700, color: T.textDim, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{row.label}</span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Results bar */}
          <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
            <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textDim }}>
              {filtered.length} mod{filtered.length !== 1 ? "s" : ""}
              {sourceFilter !== "all" && <> from <span style={{ color: srcColor(sourceFilter as ModSource) }}>{modSources.find(s => s.id === sourceFilter)?.label}</span></>}
              {search && <> matching &quot;<span style={{ color: T.cyan }}>{search}</span>&quot;</>}
            </span>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>Game Version: <span style={{ color: T.emerald }}>1.108</span></span>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Cards */}
            <div className={`overflow-y-auto p-3 ${selectedMod ? "w-3/5" : "w-full"}`}>
              <div className="grid gap-2.5" style={{ gridTemplateColumns: selectedMod ? "repeat(2, 1fr)" : "repeat(3, 1fr)" }}>
                {filtered.map(mod => {
                  const isSel = selectedMod?.id === mod.id;
                  const stC = stColors[mod.status] || T.textDim;
                  const isUpdating = updating.has(mod.id);
                  return (
                    <div key={mod.id} className="relative" style={{
                      borderRadius: 12,
                      boxShadow: isSel ? `0 0 14px ${stC}08` : "none",
                      outline: isSel ? `1px solid ${stC}30` : "none",
                      transition: "box-shadow 0.2s, outline 0.2s",
                    }}>
                      {/* Selection accent */}
                      {isSel && <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl z-10" style={{ background: `linear-gradient(90deg, ${stC}00, ${stC}40, ${stC}00)` }} />}
                      <JpeModCard
                        name={mod.name}
                        author={mod.author}
                        version={mod.version}
                        status={mod.status as JpeModCardStatus}
                        description={mod.desc}
                        downloads={mod.downloads}
                        rating={mod.rating}
                        category={mod.category}
                        onClick={() => setSelectedMod(mod)}
                        compact={!!selectedMod}
                      />
                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 px-3 pb-2.5 -mt-1" style={{ background: T.bgGlass }}>
                        {mod.status === "available" ? (
                          <JpeButton variant="primary" size="xs" icon={Download}
                            onClick={() => { installMod(mod.id); }}>Install</JpeButton>
                        ) : mod.status === "update" ? (
                          <JpeButton variant="danger" size="xs" icon={isUpdating ? RefreshCw : Download}
                            loading={isUpdating} disabled={isUpdating}
                            onClick={() => { simulateUpdate(mod.id); }}>
                            {isUpdating ? "Updating..." : "Update"}
                          </JpeButton>
                        ) : mod.status === "outdated" ? (
                          <JpeButton variant="danger" size="xs" icon={isUpdating ? RefreshCw : AlertTriangle}
                            loading={isUpdating} disabled={isUpdating}
                            onClick={() => { simulateUpdate(mod.id); }}>
                            {isUpdating ? "Updating..." : "Force Update"}
                          </JpeButton>
                        ) : null}
                        {(mod.status !== "available") && (
                          <JpeButton variant={mod.enabled ? "success" : "ghost"} size="xs"
                            icon={mod.enabled ? Eye : EyeOff}
                            onClick={() => { toggleEnabled(mod.id); }}>
                            {mod.enabled ? "On" : "Off"}
                          </JpeButton>
                        )}
                        <JpeButton variant="ghost" size="xs" icon={Activity}
                          onClick={() => { setSelectedMod(mod); }}>Analyze</JpeButton>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Search size={28} color={T.textDim} className="mb-3" />
                  <p style={{ fontSize: 12, color: T.textMuted }}>No mods found</p>
                  <p style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>Adjust your filters or search</p>
                </div>
              )}
            </div>

            {/* Detail inspector */}
            {selectedMod && (() => {
              const m = selectedMod;
              const stC = stColors[m.status] || T.textDim;
              const compatOk = m.gameCompat.includes("1.108");
              const isUpdating = updating.has(m.id);
              return (
                <div className="flex flex-col w-2/5" style={{ borderLeft: `1px solid ${T.border}`, background: T.bgPanel }}>
                  {/* Header */}
                  <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, fontFamily: T.display }}>{m.name}</span>
                          <Badge color={stC} bg={`${stC}15`}>{m.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span style={{ fontSize: 10, color: srcColor(m.source) }}>{m.author}</span>
                          <span style={{ fontSize: 10, color: T.textDim }}>|</span>
                          <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>v{m.version}</span>
                          {m.status === "update" && <span style={{ fontSize: 10, fontFamily: T.mono, color: T.amber }}>\u2192 v{m.latestVersion}</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          {renderStars(m.rating)}
                          <div className="w-px h-3" style={{ background: T.border }} />
                          <div className="flex items-center gap-1"><Download size={9} color={T.textDim} /><span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{m.downloads}</span></div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedMod(null)} className="p-1 rounded hover:bg-white/5 flex-shrink-0"><X size={14} color={T.textMuted} /></button>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {m.status === "update" && (
                        <JpeButton variant="danger" size="sm" icon={isUpdating ? RefreshCw : Download}
                          loading={isUpdating} disabled={isUpdating}
                          onClick={() => simulateUpdate(m.id)}>
                          {isUpdating ? "Updating..." : `Update to v${m.latestVersion}`}
                        </JpeButton>
                      )}
                      {m.status === "available" && (
                        <JpeButton variant="success" size="sm" icon={Download}
                          onClick={() => installMod(m.id)}>Install</JpeButton>
                      )}
                      {m.status === "outdated" && (
                        <JpeButton variant="danger" size="sm" icon={isUpdating ? RefreshCw : AlertTriangle}
                          loading={isUpdating} disabled={isUpdating}
                          onClick={() => simulateUpdate(m.id)}>
                          {isUpdating ? "Updating..." : "Force Update"}
                        </JpeButton>
                      )}
                      {m.status !== "available" && (
                        <>
                          <JpeButton variant={m.enabled ? "success" : "ghost"} size="sm"
                            icon={m.enabled ? Eye : EyeOff}
                            onClick={() => toggleEnabled(m.id)}>
                            {m.enabled ? "Enabled" : "Disabled"}
                          </JpeButton>
                          <JpeButton variant="ghost" size="sm" icon={Activity} onClick={() => onNavigate?.("datavis")}>Analyze</JpeButton>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Details body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Description */}
                    <div>
                      <Eyebrow color={T.textMuted}>DESCRIPTION</Eyebrow>
                      <p className="mt-2" style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>{m.desc}</p>
                    </div>

                    {/* Game Compatibility */}
                    <div>
                      <Eyebrow color={T.textMuted}>GAME COMPATIBILITY</Eyebrow>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {["1.108", "1.107", "1.106", "1.105"].map(v => {
                          const ok = m.gameCompat.includes(v);
                          return (
                            <div key={v} className="flex items-center gap-1 px-2 py-1 rounded-md" style={{
                              background: ok ? T.emeraldDim : "rgba(255,255,255,0.02)",
                              border: `1px solid ${ok ? `${T.emerald}20` : T.borderSubtle}`,
                            }}>
                              {ok ? <CheckCircle2 size={9} color={T.emerald} /> : <XCircle size={9} color={T.textDim} />}
                              <span style={{ fontSize: 10, fontFamily: T.mono, color: ok ? T.emerald : T.textDim }}>Patch {v}</span>
                            </div>
                          );
                        })}
                      </div>
                      {!compatOk && (
                        <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg" style={{ background: T.roseDim, border: `1px solid ${T.rose}20` }}>
                          <AlertTriangle size={12} color={T.rose} />
                          <span style={{ fontSize: 11, color: T.rose }}>Not verified for current game version (1.108)</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata grid */}
                    <div>
                      <Eyebrow color={T.textMuted}>DETAILS</Eyebrow>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          { label: "Version", value: m.version, color: T.cyan },
                          { label: "Category", value: m.category, color: T.violet },
                          { label: "Size", value: m.size, color: T.textSecondary },
                          { label: "Source", value: modSources.find(s => s.id === m.source)?.label ?? m.source, color: srcColor(m.source) },
                          { label: "Updated", value: m.updated, color: T.amber },
                          { label: "Installed", value: m.installed || "N/A", color: T.textMuted },
                          { label: "Tunings", value: `${m.tunings}`, color: T.violet },
                          { label: "Strings", value: `${m.strings}`, color: T.cyan },
                        ].map((row, i) => (
                          <div key={i} className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{row.label}</span>
                            <div style={{ fontSize: 11, fontFamily: T.mono, color: row.color, marginTop: 2 }}>{row.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dependencies */}
                    <div>
                      <Eyebrow color={T.textMuted}>DEPENDENCIES ({m.deps.length})</Eyebrow>
                      <div className="mt-2 space-y-1.5">
                        {m.deps.map((dep, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
                            <Package size={11} color={T.emerald} />
                            <span className="flex-1" style={{ fontSize: 11, color: T.textPrimary }}>{dep}</span>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 size={9} color={T.emerald} />
                              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.emerald }}>OK</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Conflicts */}
                    {m.conflicts > 0 && (
                      <div>
                        <Eyebrow color={T.rose}>CONFLICTS ({m.conflicts})</Eyebrow>
                        <div className="mt-2 px-3 py-2.5 rounded-lg" style={{ background: T.roseDim, border: `1px solid ${T.rose}20` }}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <Shield size={12} color={T.rose} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: T.rose }}>{m.conflicts} resource conflict{m.conflicts > 1 ? "s" : ""} detected</span>
                          </div>
                          <p style={{ fontSize: 10, color: `${T.rose}B0`, lineHeight: 1.5 }}>
                            This mod has overlapping resource keys with other installed mods. Use the Conflict Detector in the Analysis workspace to resolve.
                          </p>
                          <JpeButton variant="danger" size="xs" icon={ArrowRight} className="mt-2"
                            onClick={() => onNavigate?.("conflicts")}>
                            Open Conflict Detector
                          </JpeButton>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════���════
   DATA VIS / DEBUG / PLUGIN — Simplified workspace shells
   ═══════════════════════════════════════════════════════════════ */
function DataVisWorkspace() {
  return <ModAnalysisLab />;
}

function DebugWorkspace() {
  return <DiagnosticNexusView />;
}

function PluginWorkspace() {
  const plugSideW = useScaledWidth(200);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPlugin, setSelectedPlugin] = useState<MarketPlugin | null>(null);
  const [installedState, setInstalledState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(marketPlugins.map(p => [p.id, p.installed]))
  );
  const [sortBy, setSortBy] = useState<"rating" | "downloads" | "updated" | "name">("rating");
  const [detailTab, setDetailTab] = useState<"details" | "changelog" | "deps">("details");
  const [quickFilter, setQuickFilter] = useState<"installed" | "verified" | "trending" | null>(null);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [disabledPlugins, setDisabledPlugins] = useState<Set<string>>(new Set());

  const toggleDisable = (id: string) => setDisabledPlugins(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const filtered = useMemo(() => {
    let list = marketPlugins as MarketPlugin[];
    if (activeCategory !== "all") list = list.filter(p => p.category === activeCategory);
    if (quickFilter === "installed") list = list.filter(p => installedState[p.id]);
    if (quickFilter === "verified") list = list.filter(p => p.verified);
    if (quickFilter === "trending") list = [...list].sort((a, b) => parseFloat(b.downloads) - parseFloat(a.downloads)).slice(0, 6);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) || p.tags.some(t => t.includes(q))
      );
    }
    list = [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "downloads") return parseFloat(b.downloads) - parseFloat(a.downloads);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }, [search, activeCategory, sortBy]);

  const toggleInstall = (id: string) => setInstalledState(prev => ({ ...prev, [id]: !prev[id] }));
  const installedCount = Object.values(installedState).filter(Boolean).length;

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={10} color={i < full || (i === full && rating - full >= 0.5) ? T.amber : T.textDim}
            fill={i < full ? T.amber : "none"} strokeWidth={1.5} />
        ))}
        <span style={{ fontSize: 10, fontFamily: T.mono, color: T.amber, marginLeft: 3 }}>{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <Puzzle size={14} color={T.violetBright} />
          <Eyebrow color={T.textPrimary}>PLUGIN MARKETPLACE</Eyebrow>
          <div className="w-px h-4" style={{ background: T.border }} />
          <Badge color={T.emerald} bg={T.emeraldDim}>{installedCount} installed</Badge>
          <Badge color={T.textMuted} bg="rgba(255,255,255,0.04)">{marketPlugins.length} available</Badge>
        </div>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-2 py-1 rounded-lg outline-none cursor-pointer"
            style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}` }}>
            <option value="rating">Sort: Rating</option>
            <option value="downloads">Sort: Downloads</option>
            <option value="name">Sort: Name</option>
            <option value="updated">Sort: Updated</option>
          </select>
          <JpeButton variant="secondary" size="sm" icon={RefreshCw} loading={checkingUpdates} disabled={checkingUpdates}
            onClick={() => { setCheckingUpdates(true); setTimeout(() => setCheckingUpdates(false), 1500); }}>
            {checkingUpdates ? "Checking..." : "Check Updates"}
          </JpeButton>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Category sidebar */}
        <div className="flex flex-col flex-shrink-0" style={{ width: plugSideW, borderRight: `1px solid ${T.border}`, background: T.bgPanel }}>
          <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
            <div className="relative">
              <Search size={12} color={T.textDim} className="absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plugins..."
                className="w-full pl-7 pr-2 py-1.5 rounded-lg outline-none"
                style={{ fontSize: 11, fontFamily: T.mono, color: T.textPrimary, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSubtle}` }} />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X size={10} color={T.textDim} />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            <div className="px-3 pt-2 pb-1"><Eyebrow color={T.textDim}>CATEGORIES</Eyebrow></div>
            {pluginCategories.map(cat => {
              const isAct = cat.id === activeCategory;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 transition-colors text-left"
                  style={{ background: isAct ? `${T.violet}10` : "transparent", borderLeft: `2px solid ${isAct ? T.violet : "transparent"}` }}>
                  <span style={{ fontSize: 11, color: isAct ? T.textPrimary : T.textTertiary, fontWeight: isAct ? 700 : 500 }}>{cat.label}</span>
                  <span className="px-1.5 py-0 rounded" style={{ fontSize: 9, fontFamily: T.mono, color: isAct ? T.violet : T.textDim, background: isAct ? T.violetDim : "rgba(255,255,255,0.03)" }}>{cat.count}</span>
                </button>
              );
            })}
            <div className="px-3 pt-4 pb-1"><Eyebrow color={T.textDim}>QUICK FILTERS</Eyebrow></div>
            {([
              { label: "Installed", icon: CheckCircle2, color: T.emerald, key: "installed" as const },
              { label: "Verified", icon: Shield, color: T.cyan, key: "verified" as const },
              { label: "Trending", icon: TrendingUp, color: T.amber, key: "trending" as const },
            ] as const).map((f) => {
              const isActive = quickFilter === f.key;
              return (
                <button key={f.key} className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
                  style={{ background: isActive ? `${f.color}10` : "transparent", borderLeft: `2px solid ${isActive ? f.color : "transparent"}` }}
                  onClick={() => setQuickFilter(isActive ? null : f.key)}>
                  <f.icon size={11} color={isActive ? f.color : T.textDim} />
                  <span style={{ fontSize: 11, color: isActive ? T.textPrimary : T.textTertiary, fontWeight: isActive ? 700 : 500 }}>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Plugin list + detail split */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
            <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textDim }}>
              {filtered.length} plugin{filtered.length !== 1 ? "s" : ""} found
              {search && <> matching &quot;<span style={{ color: T.cyan }}>{search}</span>&quot;</>}
            </span>
          </div>
          <div className="flex flex-1 min-h-0">
            {/* Card list */}
            <div className={`overflow-y-auto p-3 space-y-2 ${selectedPlugin ? "w-1/2" : "w-full"}`}>
              {filtered.map(plugin => {
                const isInst = installedState[plugin.id];
                const isSel = selectedPlugin?.id === plugin.id;
                return (
                  <div key={plugin.id} className="relative" style={{
                    borderRadius: 12,
                    boxShadow: isSel ? `0 0 12px ${plugin.iconColor}08` : "none",
                    outline: isSel ? `1px solid ${plugin.iconColor}30` : "none",
                    transition: "box-shadow 0.2s, outline 0.2s",
                  }}>
                    <JpePluginCard
                      name={plugin.name}
                      author={plugin.author}
                      version={plugin.version}
                      description={plugin.desc}
                      icon={plugin.icon}
                      iconColor={plugin.iconColor}
                      rating={plugin.rating}
                      reviews={plugin.reviews}
                      downloads={plugin.downloads}
                      installed={isInst}
                      verified={plugin.verified}
                      tags={plugin.tags}
                      onInstall={() => toggleInstall(plugin.id)}
                      onDetails={() => { setSelectedPlugin(plugin); setDetailTab("details"); }}
                      compact={!!selectedPlugin}
                    />
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Search size={28} color={T.textDim} className="mb-3" />
                  <p style={{ fontSize: 12, color: T.textMuted }}>No plugins found</p>
                  <p style={{ fontSize: 10, color: T.textDim, marginTop: 4 }}>Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* Detail pane */}
            {selectedPlugin && (() => {
              const p = selectedPlugin;
              const isInst = installedState[p.id];
              const PIcon = p.icon;
              return (
                <div className="flex flex-col w-1/2" style={{ borderLeft: `1px solid ${T.border}`, background: T.bgPanel }}>
                  {/* Detail header */}
                  <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative" style={{
                        background: `${p.iconColor}12`, border: `1px solid ${p.iconColor}25`,
                      }}>
                        <PIcon size={22} color={p.iconColor} />
                        {p.verified && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: T.bgPanel, border: `1px solid ${T.emerald}30` }}>
                            <CheckCircle2 size={10} color={T.emerald} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, fontFamily: T.display }}>{p.name}</span>
                          {p.verified && <Badge color={T.emerald} bg={T.emeraldDim}>Verified</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span style={{ fontSize: 10, color: T.cyan }}>{p.author}</span>
                          <span style={{ fontSize: 10, color: T.textDim }}>|</span>
                          <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>v{p.version}</span>
                          <span style={{ fontSize: 10, color: T.textDim }}>|</span>
                          <span style={{ fontSize: 10, color: T.textMuted }}>{p.license}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          {renderStars(p.rating)}
                          <span style={{ fontSize: 9, color: T.textDim }}>({p.reviews.toLocaleString()} reviews)</span>
                          <div className="w-px h-3" style={{ background: T.border }} />
                          <div className="flex items-center gap-1">
                            <Download size={9} color={T.textDim} />
                            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{p.downloads}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedPlugin(null)} className="p-1 rounded hover:bg-white/5 flex-shrink-0">
                        <X size={14} color={T.textMuted} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <JpeButton
                        variant={isInst ? "danger" : "success"}
                        size="sm"
                        icon={isInst ? X : Download}
                        onClick={() => toggleInstall(p.id)}
                      >
                        {isInst ? "Uninstall" : "Install"}
                      </JpeButton>
                      {isInst && (
                        <JpeButton variant="ghost" size="sm" icon={Settings} onClick={() => setDetailTab("details")}>Settings</JpeButton>
                      )}
                      {isInst && (
                        <JpeButton variant={disabledPlugins.has(p.id) ? "success" : "ghost"} size="sm" icon={disabledPlugins.has(p.id) ? Eye : EyeOff}
                          onClick={() => toggleDisable(p.id)}>
                          {disabledPlugins.has(p.id) ? "Enable" : "Disable"}
                        </JpeButton>
                      )}
                    </div>
                  </div>

                  {/* Detail tabs */}
                  <div className="flex items-center gap-0 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
                    {(["details", "changelog", "deps"] as const).map(tab => {
                      const isAct = detailTab === tab;
                      const labels: Record<string, string> = { details: "Details", changelog: "Changelog", deps: "Dependencies" };
                      return (
                        <button key={tab} onClick={() => setDetailTab(tab)}
                          className="px-4 py-2 transition-colors relative"
                          style={{ fontSize: 11, fontWeight: isAct ? 700 : 500, color: isAct ? T.textPrimary : T.textTertiary }}>
                          {labels[tab]}
                          {isAct && <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: T.violet }} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {detailTab === "details" && (
                      <>
                        <div>
                          <Eyebrow color={T.textMuted}>DESCRIPTION</Eyebrow>
                          <p className="mt-2" style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.6 }}>{p.longDesc}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Version", value: p.version, color: T.cyan },
                            { label: "Compatibility", value: p.compat, color: T.violet },
                            { label: "Size", value: p.size, color: T.textSecondary },
                            { label: "Updated", value: p.updated, color: T.amber },
                            { label: "License", value: p.license, color: T.textSecondary },
                            { label: "Category", value: p.category, color: T.emerald },
                          ].map((m, i) => (
                            <div key={i} className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
                              <span style={{ fontSize: 9, fontWeight: 700, color: T.textDim, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{m.label}</span>
                              <div style={{ fontSize: 11, fontFamily: T.mono, color: m.color, marginTop: 2 }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                        <div>
                          <Eyebrow color={T.textMuted}>SCREENSHOTS</Eyebrow>
                          <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
                                style={{ width: 180, height: 100, background: `linear-gradient(135deg, ${p.iconColor}08, ${p.iconColor}15)`, border: `1px solid ${p.iconColor}15` }}>
                                <div className="text-center">
                                  <Eye size={16} color={p.iconColor} className="mx-auto mb-1" style={{ opacity: 0.5 }} />
                                  <span style={{ fontSize: 9, color: T.textDim }}>Screenshot {i}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Eyebrow color={T.textMuted}>TAGS</Eyebrow>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {p.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-md" style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.borderSubtle}` }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {detailTab === "changelog" && (
                      <div>
                        <Eyebrow color={T.textMuted}>RELEASE HISTORY</Eyebrow>
                        <div className="mt-3 space-y-3">
                          {p.changelog.map((entry, i) => {
                            const isLatest = i === 0;
                            return (
                              <div key={i} className="flex items-start gap-3">
                                <div className="flex flex-col items-center flex-shrink-0">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{
                                    background: isLatest ? T.emerald : T.textDim,
                                    boxShadow: isLatest ? `0 0 6px ${T.emerald}40` : "none",
                                  }} />
                                  {i < p.changelog.length - 1 && <div className="w-px flex-1 mt-1" style={{ background: T.borderSubtle, minHeight: 20 }} />}
                                </div>
                                <div className="flex-1 pb-1">
                                  <p style={{ fontSize: 11, color: isLatest ? T.textPrimary : T.textTertiary, lineHeight: 1.5 }}>{entry}</p>
                                  {isLatest && <Badge color={T.emerald} bg={T.emeraldDim}>Latest</Badge>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {detailTab === "deps" && (
                      <div>
                        <Eyebrow color={T.textMuted}>DEPENDENCIES ({p.deps.length})</Eyebrow>
                        {p.deps.length === 0 ? (
                          <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-lg" style={{ background: T.emeraldDim, border: `1px solid ${T.emerald}20` }}>
                            <CheckCircle2 size={12} color={T.emerald} />
                            <span style={{ fontSize: 11, color: T.emerald }}>No dependencies required</span>
                          </div>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {p.deps.map((dep, i) => (
                              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}>
                                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: T.emeraldDim }}>
                                  <Package size={12} color={T.emerald} />
                                </div>
                                <span className="flex-1" style={{ fontSize: 11, color: T.textPrimary }}>{dep}</span>
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 size={10} color={T.emerald} />
                                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.emerald }}>OK</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-4">
                          <Eyebrow color={T.textMuted}>RELATED PLUGINS</Eyebrow>
                          <div className="mt-2 space-y-1.5">
                            {marketPlugins.filter(mp => mp.id !== p.id && mp.category === p.category).slice(0, 3).map(mp => (
                              <button key={mp.id} onClick={() => { setSelectedPlugin(mp); setDetailTab("details"); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors hover:bg-white/5"
                                style={{ background: "rgba(255,255,255,0.015)", border: `1px solid ${T.borderSubtle}` }}>
                                <mp.icon size={12} color={mp.iconColor} />
                                <span className="flex-1" style={{ fontSize: 11, color: T.textSecondary }}>{mp.name}</span>
                                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{mp.version}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

/* InspectorPanel is now imported from ../components/InspectorPanel — mode-aware */

/* ═══════════════════════════════════════════════════════════════
   BOTTOM DIAGNOSTICS CONSOLE
   ═══════════════════════════════════════════════════════════════ */
type ConsoleTab = "console" | "problems" | "output" | "jpelog" | "terminal";

function DiagnosticsConsole({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { settings: { fontScale } } = useJpeSettings();
  const [activeTab, setActiveTab] = useState<ConsoleTab>("console");
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [clearedTabs, setClearedTabs] = useState<Set<ConsoleTab>>(new Set());
  const [copied, setCopied] = useState(false);
  const levelColors: Record<string, string> = { INFO: T.cyanBright, SYS: T.textMuted, DEPS: T.violetBright, WARN: T.amber, JPE: T.violet, BUILD: T.emerald, DEBUG: T.textTertiary, ERROR: T.rose };

  const problemsLog = diagnosticLogs.filter(l => l.level === "WARN" || l.level === "ERROR");
  const jpeLog = diagnosticLogs.filter(l => l.level === "JPE" || l.level === "BUILD");
  const outputLog = diagnosticLogs.filter(l => l.level === "SYS" || l.level === "INFO" || l.level === "DEBUG");

  const rawTabLogs = activeTab === "console" ? diagnosticLogs
    : activeTab === "problems" ? problemsLog
    : activeTab === "jpelog" ? jpeLog
    : outputLog;
  const tabLogs = clearedTabs.has(activeTab) ? [] : filterLevel ? rawTabLogs.filter(l => l.level === filterLevel) : rawTabLogs;

  const handleCopyLogs = () => {
    const text = tabLogs.map(l => `[${l.time}] ${l.level}: ${l.text}`).join("\n");
    navigator.clipboard.writeText(text).then(() => toast.success("Logs copied")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClearTab = () => {
    setClearedTabs(prev => new Set(prev).add(activeTab));
  };

  const cycleFilter = () => {
    const levels = ["WARN", "ERROR", "INFO", "JPE", "BUILD", null];
    const idx = levels.indexOf(filterLevel);
    setFilterLevel(levels[(idx + 1) % levels.length]);
  };

  if (collapsed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between px-4 py-1 flex-shrink-0 cursor-pointer"
        style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}
        onClick={onToggle}>
        <div className="flex items-center gap-3">
          <Terminal size={12} color={T.cyanBright} />
          <Eyebrow>DIAGNOSTICS</Eyebrow>
          <div className="flex items-center gap-2">
            <Badge color={T.emerald} bg={T.emeraldDim}>0 Errors</Badge>
            <Badge color={T.amber} bg={T.amberDim}>2 Warnings</Badge>
          </div>
        </div>
        <motion.div animate={{ rotate: 0 }} transition={{ duration: 0.18 }}>
          <ChevronUp size={14} color={T.textMuted} />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: Math.round((activeTab === "terminal" ? 260 : 180) / Math.max(fontScale, 1)), opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col flex-shrink-0"
      style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel, overflow: "hidden" }}>
      {/* Console tabs */}
      <div className="flex items-center justify-between px-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center">
          {([
            { id: "console" as ConsoleTab, label: "Console", icon: Terminal },
            { id: "problems" as ConsoleTab, label: "Problems", icon: AlertTriangle },
            { id: "output" as ConsoleTab, label: "Output", icon: FileText },
            { id: "jpelog" as ConsoleTab, label: "JPE Log", icon: Languages },
            { id: "terminal" as ConsoleTab, label: "Terminal", icon: Terminal },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.id === "problems" ? problemsLog.length : tab.id === "jpelog" ? jpeLog.length : undefined;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 transition-colors relative"
                style={{ fontSize: 11, color: isActive ? T.textPrimary : T.textTertiary, background: isActive ? T.bgDeep : "transparent" }}>
                {isActive && <motion.div layoutId="consoletab" className="absolute top-0 left-1 right-1 h-[2px]" style={{ background: `linear-gradient(90deg, var(--jpe-primary, ${T.cyan}), var(--jpe-secondary, ${T.violet}))` }} transition={{ type: "spring", stiffness: 520, damping: 35 }} />}
                <Icon size={12} color={isActive ? T.cyan : T.textMuted} />
                {tab.label}
                {count !== undefined && count > 0 && (
                  <span className="px-1 rounded" style={{ fontSize: 8, fontFamily: T.mono, fontWeight: 700, color: tab.id === "problems" ? T.amber : T.violet, background: tab.id === "problems" ? T.amberDim : T.violetDim }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1">
          {activeTab !== "terminal" && (
            <>
              <IconBtn icon={Filter} size={12} onClick={cycleFilter} color={filterLevel ? T.cyan : T.textTertiary} title={filterLevel ? `Filter: ${filterLevel}` : "Cycle filter"} />
              <IconBtn icon={copied ? CheckCircle2 : Copy} size={12} onClick={handleCopyLogs} color={copied ? T.emerald : T.textTertiary} title="Copy logs" />
              <IconBtn icon={XCircle} size={12} onClick={handleClearTab} title="Clear" />
            </>
          )}
          <button className="p-1 rounded hover:bg-white/5" onClick={onToggle}><ChevronDown size={14} color={T.textMuted} /></button>
        </div>
      </div>

      {/* Log content or Terminal */}
      {activeTab === "terminal" ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <JpeTerminal />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-1">
          {tabLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span style={{ fontSize: 11, color: T.textDim }}>No entries for this filter</span>
            </div>
          ) : null}
          {tabLogs.map((entry, i) => (
            <div key={i} className="flex items-start gap-0 px-4 py-[2px] transition-colors" style={{ fontFamily: T.mono, borderLeft: entry.level === "WARN" ? `2px solid ${T.amber}` : entry.level === "ERROR" ? `2px solid ${T.rose}` : "2px solid transparent" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <span className="flex-shrink-0" style={{ fontSize: 11, color: T.textMuted, width: 80 }}>[{entry.time}]</span>
              <span className="flex-shrink-0" style={{ fontSize: 11, fontWeight: 700, width: 50, color: levelColors[entry.level] }}>{entry.level}:</span>
              <span style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.5 }}>{entry.text}</span>
              <span className="ml-auto flex-shrink-0 pl-4" style={{ fontSize: 9, color: T.textDim }}>{entry.hash}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* CommandPalette is now imported from ../components/CommandPalette */

/* ═══════════════════════════════════════════════════════════════
   MAIN JPE STUDIO APPLICATION
   ═══════════════════════════════════════════════════════════════ */
export function JPEStudio() {
  return (
    <JpeSettingsProvider>
      <EditHistoryProvider>
        <JPEStudioInner />
      </EditHistoryProvider>
    </JpeSettingsProvider>
  );
}

function JPEStudioInner() {
  const { settings: globalSettings } = useJpeSettings();
  const navigate = useNavigate();
  const [mode, setMode] = useState<WorkspaceMode>("dashboard");
  const [commandOpen, setCommandOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [time, setTime] = useState("");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  // Panel resize state (base widths in unscaled px)
  const [leftPanelWidth, setLeftPanelWidth] = useState(260);
  const [rightPanelWidth, setRightPanelWidth] = useState(280);
  const [isDragging, setIsDragging] = useState<"left" | "right" | null>(null);
  // Phase 9 state
  const [leftPanelView, setLeftPanelView] = useState<"explorer" | "git" | "extensions">("explorer");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [perfHudOpen, setPerfHudOpen] = useState(false);
  // Phase 10 state
  const [snippetManagerOpen, setSnippetManagerOpen] = useState(false);
  // Phase 11 state
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  // Phase 12 state
  const [fileDialogConfig, setFileDialogConfig] = useState<FileDialogConfig | null>(null);
  // Phase 13 state
  const [exportWizardOpen, setExportWizardOpen] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [conflictWizardOpen, setConflictWizardOpen] = useState(false);
  const [localizationOpen, setLocalizationOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [stblManagerOpen, setStblManagerOpen] = useState(false);
  const [modValidatorOpen, setModValidatorOpen] = useState(false);
  const [translationMemoryOpen, setTranslationMemoryOpen] = useState(false);
  // Phase 16
  const [modTemplateOpen, setModTemplateOpen] = useState(false);
  const [resourceBrowserOpen, setResourceBrowserOpen] = useState(false);
  // Phase 17
  const [symbolOutlineOpen, setSymbolOutlineOpen] = useState(false);
  const [hoverDocOpen, setHoverDocOpen] = useState(false);
  // Phase 18
  const [batchOpsOpen, setBatchOpsOpen] = useState(false);
  const [buildProfileOpen, setBuildProfileOpen] = useState(false);
  // Phase 19
  const [modHealthOpen, setModHealthOpen] = useState(false);
  const [usageAnalyticsOpen, setUsageAnalyticsOpen] = useState(false);
  // Phase 20
  const [splashOpen, setSplashOpen] = useState(true);
  const [releaseManagerOpen, setReleaseManagerOpen] = useState(false);
  // Phase 21
  const [livePreviewOpen, setLivePreviewOpen] = useState(false);
  const [hotReloadOpen, setHotReloadOpen] = useState(false);
  // Phase 22
  const [docGenOpen, setDocGenOpen] = useState(false);
  const [apiRefOpen, setApiRefOpen] = useState(false);
  // Phase 23
  const [teamAnnotsOpen, setTeamAnnotsOpen] = useState(false);
  const [testRunnerOpen, setTestRunnerOpen] = useState(false);
  // Live metrics (Phase 6)
  const [liveMetrics, setLiveMetrics] = useState({ cpu: 4, mem: 412, lat: 4, gc: 8 });
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [tabsCanScroll, setTabsCanScroll] = useState({ left: false, right: false });

  // First-run onboarding detection
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("jpe-onboarding-completed");
    if (!hasCompletedOnboarding) {
      setTimeout(() => setOnboardingOpen(true), 1000);
    }
  }, []);

  const checkTabsScroll = useCallback(() => {
    const el = tabsScrollRef.current;
    if (!el) return;
    setTabsCanScroll({
      left: el.scrollLeft > 2,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 2,
    });
  }, []);

  useEffect(() => {
    const el = tabsScrollRef.current;
    if (!el) return;
    checkTabsScroll();
    el.addEventListener("scroll", checkTabsScroll, { passive: true });
    const ro = new ResizeObserver(checkTabsScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkTabsScroll); ro.disconnect(); };
  }, [checkTabsScroll]);

  const scrollTabs = useCallback((dir: "left" | "right") => {
    const el = tabsScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "p") { e.preventDefault(); setCommandOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCommandOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") { e.preventDefault(); setShortcutsOpen(p => !p); }
      if (e.key === "Escape") { setCommandOpen(false); setShortcutsOpen(false); setGlobalSearchOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") { e.preventDefault(); setShowLeftPanel(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.key === "`") { e.preventDefault(); setConsoleCollapsed(p => !p); }
      // Phase 9 shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "f") { e.preventDefault(); setGlobalSearchOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "g") { e.preventDefault(); setLeftPanelView(v => v === "git" ? "explorer" : "git"); setShowLeftPanel(true); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "m") { e.preventDefault(); setPerfHudOpen(p => !p); }
      // Phase 10 shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "s") { e.preventDefault(); setSnippetManagerOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "x") { e.preventDefault(); setLeftPanelView(v => v === "extensions" ? "explorer" : "extensions"); setShowLeftPanel(true); }
      // Phase 13 shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "e") { e.preventDefault(); setExportWizardOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "h") { e.preventDefault(); setHistoryPanelOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "r") { e.preventDefault(); setConflictWizardOpen(p => !p); }
      // Phase 14 shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "l") { e.preventDefault(); setLocalizationOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "c") { e.preventDefault(); setChangelogOpen(p => !p); }
      // Phase 15 shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "t") { e.preventDefault(); setStblManagerOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "v") { e.preventDefault(); setModValidatorOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "n") { e.preventDefault(); setTranslationMemoryOpen(p => !p); }
      // Phase 16 shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "w") { e.preventDefault(); setModTemplateOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "b") { e.preventDefault(); setResourceBrowserOpen(p => !p); }
      // Phase 17 shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o") { e.preventDefault(); setSymbolOutlineOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "d") { e.preventDefault(); setHoverDocOpen(p => !p); }
      // Phase 18 shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "a") { e.preventDefault(); setBatchOpsOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "u") { e.preventDefault(); setBuildProfileOpen(p => !p); }
      // Phase 19 shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "y") { e.preventDefault(); setModHealthOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "i") { e.preventDefault(); setUsageAnalyticsOpen(p => !p); }
      // Phase 20 shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "z") { e.preventDefault(); setReleaseManagerOpen(p => !p); }
      // Phase 21 shortcuts (P=Preview, Q=hot-reload — avoids Ctrl+Shift+H conflict with Phase 13)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "p") { e.preventDefault(); setLivePreviewOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "q") { e.preventDefault(); setHotReloadOpen(p => !p); }
      // Phase 22 shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "g") { e.preventDefault(); setDocGenOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "k") { e.preventDefault(); setApiRefOpen(p => !p); }
      // Phase 23 shortcuts (Ctrl+Shift+; for Annotations, J for Test Runner — M is reserved for Perf HUD)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === ";") { e.preventDefault(); setTeamAnnotsOpen(p => !p); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "j") { e.preventDefault(); setTestRunnerOpen(p => !p); }
      // Crystal Forge: Ctrl+Alt+F
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === "f") { e.preventDefault(); navigate("/crystal-forge"); }
      // Diff Viewer: Alt+D
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "d") { e.preventDefault(); setMode("diff"); }
      // Layout presets
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "1") { e.preventDefault(); applyLayout("focus"); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "2") { e.preventDefault(); applyLayout("code"); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "3") { e.preventDefault(); applyLayout("full"); }
      // Mode shortcuts (Ctrl+0 through Ctrl+8)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)) {
        e.preventDefault();
        const modeIdx = workspaceModes.findIndex(m => m.shortcut === e.key);
        if (modeIdx >= 0) setMode(workspaceModes[modeIdx].key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Live metrics simulation
  useEffect(() => {
    const id = setInterval(() => {
      setLiveMetrics(prev => ({
        cpu: Math.max(1, Math.min(98, prev.cpu + (Math.random() - 0.48) * 6)),
        mem: Math.max(380, Math.min(620, prev.mem + (Math.random() - 0.5) * 12)),
        lat: Math.max(1, Math.min(24, prev.lat + (Math.random() - 0.5) * 2)),
        gc: Math.max(2, Math.min(28, prev.gc + (Math.random() - 0.5) * 3)),
      }));
    }, 2800);
    return () => clearInterval(id);
  }, []);

  /* ── Session persistence (localStorage) ── */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("jpe-session-v2") ?? "{}");
      if (saved.mode && workspaceModes.find(m => m.key === saved.mode)) setMode(saved.mode);
      if (typeof saved.leftPanelWidth === "number") setLeftPanelWidth(saved.leftPanelWidth);
      if (typeof saved.rightPanelWidth === "number") setRightPanelWidth(saved.rightPanelWidth);
      if (typeof saved.showLeftPanel === "boolean") setShowLeftPanel(saved.showLeftPanel);
      if (typeof saved.showRightPanel === "boolean") setShowRightPanel(saved.showRightPanel);
      if (typeof saved.consoleCollapsed === "boolean") setConsoleCollapsed(saved.consoleCollapsed);
      if (saved.leftPanelView === "git" || saved.leftPanelView === "explorer" || saved.leftPanelView === "extensions") setLeftPanelView(saved.leftPanelView);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("jpe-session-v2", JSON.stringify({
        mode, leftPanelWidth, rightPanelWidth, showLeftPanel, showRightPanel, consoleCollapsed, leftPanelView,
      }));
    } catch { /* ignore */ }
  }, [mode, leftPanelWidth, rightPanelWidth, showLeftPanel, showRightPanel, consoleCollapsed, leftPanelView]);

  /* ── Panel drag-resize handlers ── */
  const startDragLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = leftPanelWidth;
    const fs = globalSettings.fontScale;
    setIsDragging("left");
    const onMove = (me: MouseEvent) => {
      const delta = (me.clientX - startX) / fs;
      setLeftPanelWidth(Math.max(140, Math.min(520, Math.round(startW + delta))));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setIsDragging(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [leftPanelWidth, globalSettings.fontScale]);

  const startDragRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = rightPanelWidth;
    const fs = globalSettings.fontScale;
    setIsDragging("right");
    const onMove = (me: MouseEvent) => {
      const delta = (startX - me.clientX) / fs;
      setRightPanelWidth(Math.max(140, Math.min(520, Math.round(startW + delta))));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setIsDragging(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [rightPanelWidth, globalSettings.fontScale]);

  /* ── Layout presets ── */
  const applyLayout = useCallback((preset: "focus" | "code" | "full" | "reading") => {
    if (preset === "focus")   { setShowLeftPanel(false); setShowRightPanel(false); setConsoleCollapsed(true); }
    if (preset === "code")    { setShowLeftPanel(true);  setShowRightPanel(false); setConsoleCollapsed(false); }
    if (preset === "full")    { setShowLeftPanel(true);  setShowRightPanel(true);  setConsoleCollapsed(false); }
    if (preset === "reading") { setShowLeftPanel(false); setShowRightPanel(true);  setConsoleCollapsed(true); }
    toast.success(`Layout: ${preset.charAt(0).toUpperCase() + preset.slice(1)}`, { duration: 1200 });
  }, []);

  /* ── Apply workspace profile ── */
  const handleApplyProfile = useCallback((snapshot: WorkspaceSnapshot) => {
    setMode(snapshot.mode);
    setLeftPanelWidth(snapshot.leftPanelWidth);
    setRightPanelWidth(snapshot.rightPanelWidth);
    setShowLeftPanel(snapshot.showLeftPanel);
    setShowRightPanel(snapshot.showRightPanel);
    setLeftPanelView(snapshot.leftPanelView);
    setConsoleCollapsed(snapshot.consoleCollapsed);
  }, []);

  const renderWorkspaceContent = () => {
    const content = (() => {
      switch (mode) {
        case "dashboard": return <DashboardView onNavigate={setMode} />;
        case "code": return <CodeWorkspace />;
        case "translation": return <TranslationWorkspace />;
        case "jpe": return <JpeLanguageEditor />;
        case "depgraph": return <DependencyGraph onSwitchToConflicts={() => setMode("conflicts")} onSwitchToDiff={() => setMode("diff")} />;
        case "diff": return <DiffViewer onOpenConflictWizard={() => setConflictWizardOpen(true)} />;
        case "conflicts": return <ConflictDetectorView onSwitchView={() => setMode("depgraph")} onOpenWizard={() => setConflictWizardOpen(true)} />;
        case "build": return <BuildWorkspace />;
        case "library": return <LibraryWorkspace onNavigate={setMode} />;
        case "plugin": return <PluginWorkspace />;
        case "vault": return <RebelsVaultView />;
        case "debug": return <DebugWorkspace />;
        case "datavis": return <DataVisWorkspace />;
        case "ai": return <AIAssistantView />;
        case "settings": return <SettingsView onRestartTutorial={() => { setOnboardingOpen(true); setMode("dashboard"); }} />;
      }
    })();

    return (
      <ErrorBoundary level="feature" featureName={currentMode.label}>
        {content}
      </ErrorBoundary>
    );
  };

  const currentMode = workspaceModes.find(m => m.key === mode)!;

  const themeVars = getThemeCssVars(globalSettings.colorTheme ?? "obsidian-crystal");

  return (
    <ReducedMotionProvider>
    <div
      className="flex flex-col overflow-hidden select-none relative"
      style={{
        ...themeVars as React.CSSProperties,
        background: T.bg,
        fontFamily: T.sans,
        color: T.textPrimary,
        width: `${100 / globalSettings.fontScale}vw`,
        height: `${100 / globalSettings.fontScale}vh`,
        zoom: globalSettings.fontScale,
        cursor: isDragging ? "col-resize" : undefined,
      }}
    >
      {/* Live wallpaper layer */}
      <JpeWallpaper />
      <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: T.bgPanel, border: `1px solid ${T.border}`, color: T.textPrimary, fontFamily: T.sans, fontSize: 12 } }} />

      {/* ═══ TITLE BAR ═══ */}
      <div className="flex items-center justify-between px-3 min-h-[38px] py-1 flex-shrink-0 relative z-[1]" style={{ background: T.bgPanel, borderBottom: `1px solid ${T.border}` }}>
        {/* Left: Logo + App name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, var(--jpe-logo-start, ${T.cyan}), var(--jpe-logo-end, ${T.violet}))`, boxShadow: `0 0 12px var(--jpe-primary-dim, rgba(99,179,237,0.25))` }}>
              <Braces size={13} color="#fff" strokeWidth={2.5} />
            </div>
            {globalSettings.fontScale <= 1.25 && (
              <>
                <span style={{ fontSize: 14, fontWeight: 800, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.02em" }}>JPE Studio</span>
                <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, marginLeft: 2 }}>v4.2.0</span>
              </>
            )}
          </div>
          <div className="w-px h-4 flex-shrink-0" style={{ background: T.border }} />

          {/* Project Switcher */}
          <ProjectSwitcher compact={globalSettings.fontScale > 1.2} />

          <div className="w-px h-4 flex-shrink-0" style={{ background: T.border }} />

          {/* Workspace Profiles (Phase 14) */}
          <WorkspaceProfiles
            currentMode={mode}
            leftPanelWidth={leftPanelWidth}
            rightPanelWidth={rightPanelWidth}
            showLeftPanel={showLeftPanel}
            showRightPanel={showRightPanel}
            leftPanelView={leftPanelView}
            consoleCollapsed={consoleCollapsed}
            onApplyProfile={handleApplyProfile}
          />

          <div className="w-px h-4 flex-shrink-0" style={{ background: T.border }} />

          {/* Mode tabs — icon-only at high zoom, scroll arrows when overflow */}
          <div className="flex items-center min-w-0 relative">
            {/* Left scroll arrow */}
            {tabsCanScroll.left && (
              <button
                onClick={() => scrollTabs("left")}
                className="flex items-center justify-center flex-shrink-0 z-10 rounded-md transition-all"
                style={{
                  width: 20, height: 24,
                  background: `linear-gradient(90deg, ${T.bgPanel} 60%, transparent)`,
                  color: T.textSecondary,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = T.textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.color = T.textSecondary; }}
              >
                <ChevronLeft size={12} />
              </button>
            )}
            <div
              ref={tabsScrollRef}
              className="flex items-center gap-0.5 overflow-x-auto min-w-0 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {workspaceModes.map(m => {
                const Icon = m.icon;
                const isActive = mode === m.key;
                const compact = globalSettings.fontScale > 1.2;
                return (
                  <button key={m.key} onClick={() => setMode(m.key)} title={`${m.label}${m.shortcut ? ` (Ctrl+${m.shortcut})` : ""}`}
                    className="flex items-center gap-1 rounded-md transition-all relative flex-shrink-0"
                    style={{
                      fontSize: 10, fontWeight: isActive ? 600 : 400,
                      color: isActive ? T.textPrimary : T.textTertiary,
                      background: isActive ? `${m.color}10` : "transparent",
                      border: isActive ? `1px solid ${m.color}25` : "1px solid transparent",
                      padding: compact ? "4px 6px" : "4px 6px",
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = T.textSecondary; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = T.textTertiary; e.currentTarget.style.background = "transparent"; } }}>
                    {isActive && <motion.div layoutId="modeTabIndicator" className="absolute bottom-0 left-1.5 right-1.5 h-[2px] rounded-t-full" style={{ background: m.color === T.cyan ? `var(--jpe-primary, ${m.color})` : m.color === T.violet ? `var(--jpe-secondary, ${m.color})` : m.color, boxShadow: `0 0 6px ${m.color}50` }} transition={{ type: "spring", stiffness: 520, damping: 35 }} />}
                    <Icon size={12} color={isActive ? m.color : T.textMuted} />
                    {!compact && m.label}
                  </button>
                );
              })}
            </div>
            {/* Right scroll arrow */}
            {tabsCanScroll.right && (
              <button
                onClick={() => scrollTabs("right")}
                className="flex items-center justify-center flex-shrink-0 z-10 rounded-md transition-all"
                style={{
                  width: 20, height: 24,
                  background: `linear-gradient(270deg, ${T.bgPanel} 60%, transparent)`,
                  color: T.textSecondary,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = T.textPrimary; }}
                onMouseLeave={e => { e.currentTarget.style.color = T.textSecondary; }}
              >
                <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Center: Command palette + Global Search triggers */}
        <div className="flex items-center gap-1.5 flex-shrink">
          <button onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg transition-all"
            style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}`, minWidth: globalSettings.fontScale > 1.2 ? 100 : 170 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderActive; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderSubtle; }}>
            <Search size={12} color={T.textMuted} />
            <span className="truncate" style={{ fontSize: 12, color: T.textMuted }}>{globalSettings.fontScale > 1.3 ? "Cmd..." : "Command..."}</span>
            {globalSettings.fontScale <= 1.3 && <kbd className="ml-auto px-1.5 py-0.5 rounded flex-shrink-0" style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}` }}>⇧P</kbd>}
          </button>
          {globalSettings.fontScale <= 1.4 && (
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all flex-shrink-0"
              title="Global Search (Ctrl+Shift+F)"
              style={{ background: globalSearchOpen ? T.cyanDim : "rgba(255,255,255,0.02)", border: `1px solid ${globalSearchOpen ? `${T.cyan}30` : T.borderSubtle}` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${T.cyan}30`; e.currentTarget.style.background = T.cyanDim; }}
              onMouseLeave={e => { if (!globalSearchOpen) { e.currentTarget.style.borderColor = T.borderSubtle; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; } }}
            >
              <Filter size={11} color={globalSearchOpen ? T.cyan : T.textMuted} />
              {globalSettings.fontScale <= 1.2 && <span style={{ fontSize: 11, color: globalSearchOpen ? T.cyan : T.textMuted }}>Search Files</span>}
              {globalSettings.fontScale <= 1.3 && <kbd className="px-1.5 py-0.5 rounded flex-shrink-0" style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}` }}>⇧F</kbd>}
            </button>
          )}
          {globalSettings.fontScale <= 1.35 && (
            <button
              onClick={() => setSnippetManagerOpen(p => !p)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all flex-shrink-0"
              title="Snippet Manager (Ctrl+Shift+S)"
              style={{ background: snippetManagerOpen ? T.violetDim : "rgba(255,255,255,0.02)", border: `1px solid ${snippetManagerOpen ? `${T.violet}30` : T.borderSubtle}` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${T.violet}30`; e.currentTarget.style.background = T.violetDim; }}
              onMouseLeave={e => { if (!snippetManagerOpen) { e.currentTarget.style.borderColor = T.borderSubtle; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; } }}
            >
              <Layers size={11} color={snippetManagerOpen ? T.violetBright : T.textMuted} />
              {globalSettings.fontScale <= 1.2 && <span style={{ fontSize: 11, color: snippetManagerOpen ? T.violetBright : T.textMuted }}>Snippets</span>}
            </button>
          )}
        </div>

        {/* Right: Status + Notifications + Time */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {globalSettings.fontScale <= 1.3 && <><div className="flex items-center gap-1.5"><GlowDot color={T.emerald} /><span style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary }}>SDK OK</span></div>
          <div className="w-px h-3" style={{ background: T.border }} /></>}
          {globalSettings.fontScale <= 1.4 && <><div className="flex items-center gap-1.5"><Cpu size={11} color={T.textMuted} /><span style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary }}>4ms</span></div>
          <div className="w-px h-3" style={{ background: T.border }} />
          <div className="flex items-center gap-1.5"><GitBranch size={11} color={T.textTertiary} /><span style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary }}>main</span></div>
          <div className="w-px h-3" style={{ background: T.border }} /></>}
          {/* Notification bell */}
          <NotificationBell />
          <div className="w-px h-3" style={{ background: T.border }} />
          <span style={{ fontSize: 14, fontFamily: T.mono, fontWeight: 700, color: T.textPrimary, letterSpacing: "0.02em" }}>{time}</span>
          <div className="w-px h-3" style={{ background: T.border }} />
          {/* Layout presets */}
          {globalSettings.fontScale <= 1.35 && (
            <>
              <div className="w-px h-3" style={{ background: T.border }} />
              {([
                { id: "focus",   label: "Focus",   title: "Focus layout (no panels)" },
                { id: "code",    label: "Code",    title: "Code layout (explorer + console)" },
                { id: "full",    label: "Full",    title: "Full layout (all panels)" },
              ] as const).map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyLayout(preset.id)}
                  title={preset.title}
                  className="px-1.5 py-0.5 rounded transition-all"
                  style={{
                    fontSize: 9, fontFamily: T.mono, fontWeight: 600,
                    color: T.textMuted,
                    border: `1px solid ${T.borderSubtle}`,
                    letterSpacing: "0.04em",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = T.textPrimary; e.currentTarget.style.borderColor = T.borderActive; }}
                  onMouseLeave={e => { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.borderColor = T.borderSubtle; }}
                >
                  {preset.label}
                </button>
              ))}
              <div className="w-px h-3" style={{ background: T.border }} />
            </>
          )}
          {/* ── Tools Palette (Phases 13–23) ── */}
          <div className="w-px h-3" style={{ background: T.border }} />
          <ToolsOverflowMenu
            exportWizardOpen={exportWizardOpen}         onToggleExport={() => setExportWizardOpen(p => !p)}
            historyPanelOpen={historyPanelOpen}         onToggleHistory={() => setHistoryPanelOpen(p => !p)}
            conflictWizardOpen={conflictWizardOpen}     onToggleConflict={() => setConflictWizardOpen(p => !p)}
            localizationOpen={localizationOpen}         onToggleLocalization={() => setLocalizationOpen(p => !p)}
            changelogOpen={changelogOpen}               onToggleChangelog={() => setChangelogOpen(p => !p)}
            stblManagerOpen={stblManagerOpen}           onToggleStbl={() => setStblManagerOpen(p => !p)}
            modValidatorOpen={modValidatorOpen}         onToggleValidator={() => setModValidatorOpen(p => !p)}
            translationMemoryOpen={translationMemoryOpen} onToggleTranslationMemory={() => setTranslationMemoryOpen(p => !p)}
            modTemplateOpen={modTemplateOpen}           onToggleTemplate={() => setModTemplateOpen(p => !p)}
            resourceBrowserOpen={resourceBrowserOpen}   onToggleResources={() => setResourceBrowserOpen(p => !p)}
            symbolOutlineOpen={symbolOutlineOpen}       onToggleSymbol={() => setSymbolOutlineOpen(p => !p)}
            hoverDocOpen={hoverDocOpen}                 onToggleHoverDoc={() => setHoverDocOpen(p => !p)}
            batchOpsOpen={batchOpsOpen}                 onToggleBatch={() => setBatchOpsOpen(p => !p)}
            buildProfileOpen={buildProfileOpen}         onToggleBuildProfile={() => setBuildProfileOpen(p => !p)}
            modHealthOpen={modHealthOpen}               onToggleHealth={() => setModHealthOpen(p => !p)}
            usageAnalyticsOpen={usageAnalyticsOpen}     onToggleAnalytics={() => setUsageAnalyticsOpen(p => !p)}
            releaseManagerOpen={releaseManagerOpen}     onToggleRelease={() => setReleaseManagerOpen(p => !p)}
            livePreviewOpen={livePreviewOpen}           onToggleLivePreview={() => setLivePreviewOpen(p => !p)}
            hotReloadOpen={hotReloadOpen}               onToggleHotReload={() => setHotReloadOpen(p => !p)}
            docGenOpen={docGenOpen}                     onToggleDocGen={() => setDocGenOpen(p => !p)}
            apiRefOpen={apiRefOpen}                     onToggleApiRef={() => setApiRefOpen(p => !p)}
            teamAnnotsOpen={teamAnnotsOpen}             onToggleAnnots={() => setTeamAnnotsOpen(p => !p)}
            testRunnerOpen={testRunnerOpen}             onToggleTests={() => setTestRunnerOpen(p => !p)}
          />
          {/* Panel toggles */}
          <IconBtn icon={PanelLeft} color={showLeftPanel ? T.cyan : T.textMuted} onClick={() => setShowLeftPanel(p => !p)} title="Toggle Explorer (Ctrl+B)" />
          <IconBtn icon={PanelRight} color={showRightPanel ? T.cyan : T.textMuted} onClick={() => setShowRightPanel(p => !p)} title="Toggle Inspector" />
          <IconBtn icon={consoleCollapsed ? PanelBottom : PanelBottomClose} color={T.textMuted} onClick={() => setConsoleCollapsed(p => !p)} title="Toggle Console" />
        </div>
      </div>

      {/* ═══ WORKSPACE BODY ═══ */}
      <div className="flex flex-1 min-h-0 relative z-[1]" style={{ userSelect: isDragging ? "none" : undefined }}>
        {/* Left Explorer + Activity Bar */}
        <AnimatePresence>
          {showLeftPanel && (
            <AnimatedPanel
              direction="left"
              width={Math.round(leftPanelWidth / Math.max(globalSettings.fontScale, 1))}
              className="flex-shrink-0 h-full"
              style={{ display: "flex" }}
            >
              {/* Activity bar */}
              <div className="flex flex-col items-center gap-1 py-2 flex-shrink-0" style={{ width: 28, borderRight: `1px solid ${T.border}`, background: T.bgDeep }}>
                {/* Explorer */}
                {([
                  { id: "explorer" as const, Icon: FolderTree, color: T.cyan, title: "Explorer (Ctrl+B)" },
                  { id: "git" as const, Icon: GitBranch, color: T.emerald, title: "Source Control" },
                  { id: "extensions" as const, Icon: Puzzle, color: T.violet, title: "Extensions (Ctrl+Shift+X)" },
                ] as const).map(({ id, Icon, color, title }) => (
                  <button
                    key={id}
                    onClick={() => setLeftPanelView(id)}
                    title={title}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: leftPanelView === id ? `${color}15` : "transparent", border: `1px solid ${leftPanelView === id ? `${color}30` : "transparent"}` }}
                    onMouseEnter={e => { if (leftPanelView !== id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { if (leftPanelView !== id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <Icon size={12} color={leftPanelView === id ? color : T.textMuted} />
                  </button>
                ))}
                {/* Divider */}
                <div className="w-4 my-1" style={{ height: 1, background: T.border }} />
                {/* Search */}
                <button
                  onClick={() => setGlobalSearchOpen(true)}
                  title="Global Search (Ctrl+Shift+F)"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "transparent", border: "1px solid transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <Search size={12} color={T.textMuted} />
                </button>
                {/* Snippets */}
                <button
                  onClick={() => setSnippetManagerOpen(true)}
                  title="Snippet Manager (Ctrl+Shift+S)"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "transparent", border: "1px solid transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <Layers size={12} color={T.textMuted} />
                </button>
              </div>

              {/* Panel content */}
              <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
                {leftPanelView === "git"
                  ? <SourceControlPanel />
                  : leftPanelView === "extensions"
                  ? <ExtensionsPanel />
                  : <ExplorerPanel mode={mode} onOpenFileDialog={config => setFileDialogConfig(config)} />
                }
              </div>
            </AnimatedPanel>
          )}
        </AnimatePresence>

        {/* Left drag handle */}
        {showLeftPanel && (
          <div
            className="flex-shrink-0 relative group"
            style={{ width: 5, cursor: "col-resize", zIndex: 10 }}
            onMouseDown={startDragLeft}
            title="Drag to resize explorer"
          >
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 transition-all"
              style={{
                width: isDragging === "left" ? 2 : 1,
                background: isDragging === "left" ? `var(--jpe-primary, ${T.cyan})` : T.border,
                boxShadow: isDragging === "left" ? `0 0 8px var(--jpe-primary-glow, rgba(99,179,237,0.55))` : "none",
                transition: "background 0.15s, box-shadow 0.15s",
              }}
            />
            {/* Hover glow */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ width: 1, background: `var(--jpe-primary-bright, ${T.cyanBright})`, boxShadow: `0 0 6px var(--jpe-primary, ${T.cyan})` }} />
          </div>
        )}

        {/* Center Workspace — cinematic cross-dissolve */}
        <div id="jpe-main-content" tabIndex={-1} className="flex-1 flex flex-col min-w-0 relative" style={{ outline: "none" }}>
          <ViewTransition viewKey={mode}>
            {renderWorkspaceContent()}
          </ViewTransition>
        </div>

        {/* Right drag handle */}
        {showRightPanel && (
          <div
            className="flex-shrink-0 relative group"
            style={{ width: 5, cursor: "col-resize", zIndex: 10 }}
            onMouseDown={startDragRight}
            title="Drag to resize inspector"
          >
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 transition-all"
              style={{
                width: isDragging === "right" ? 2 : 1,
                background: isDragging === "right" ? `var(--jpe-secondary, ${T.violet})` : T.border,
                boxShadow: isDragging === "right" ? `0 0 8px var(--jpe-secondary-glow, rgba(139,92,246,0.55))` : "none",
                transition: "background 0.15s, box-shadow 0.15s",
              }}
            />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ width: 1, background: `var(--jpe-secondary-bright, ${T.violetBright})`, boxShadow: `0 0 6px var(--jpe-secondary, ${T.violet})` }} />
          </div>
        )}

        {/* Right Inspector */}
        <AnimatePresence>
          {showRightPanel && (
            <AnimatedPanel direction="right" width={Math.round(rightPanelWidth / Math.max(globalSettings.fontScale, 1))} className="flex flex-col flex-shrink-0 h-full" style={{}}>
              <InspectorPanel mode={mode} onNavigate={setMode} />
            </AnimatedPanel>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ BOTTOM DIAGNOSTICS ═══ */}
      <div className="relative z-[1]"><DiagnosticsConsole collapsed={consoleCollapsed} onToggle={() => setConsoleCollapsed(p => !p)} /></div>

      {/* ═══ STATUS BAR (Interactive) ═══ */}
      <div className="flex items-center justify-between px-3 min-h-[22px] py-0.5 flex-shrink-0 relative z-[1]" style={{ background: T.bgPanel, borderTop: `1px solid ${T.border}`, fontSize: 10, fontFamily: T.mono }}>
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <GlowDot color={T.emerald} />
            <span style={{ color: T.textTertiary }}>READY</span>
          </div>
          <span style={{ color: T.textDim }}>|</span>
          <button className="flex-shrink-0 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
            style={{ color: T.textTertiary }} title="Click to switch mode"
            onClick={() => setCommandOpen(true)}>
            {currentMode.label} Mode
          </button>
          {globalSettings.fontScale <= 1.3 && <>
            <span style={{ color: T.textDim }}>|</span>
            <span className="flex-shrink-0" style={{ color: T.textTertiary }}>14 files</span>
            <span style={{ color: T.textDim }}>|</span>
            <span className="flex-shrink-0" style={{ color: T.textTertiary }}>4,218 strings</span>
          </>}
          {globalSettings.fontScale <= 1.15 && <>
            <span style={{ color: T.textDim }}>|</span>
            <span className="flex-shrink-0" style={{ color: T.textTertiary }}>Sims 4 SDK 1.108</span>
          </>}
          {isDragging && <>
            <span style={{ color: T.textDim }}>|</span>
            <span className="flex-shrink-0" style={{ color: isDragging === "left" ? T.cyan : T.violet }}>
              {isDragging === "left" ? leftPanelWidth : rightPanelWidth}px
            </span>
          </>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
            style={{ color: T.textTertiary }} title="Click to go to line"
            onClick={() => toast.info("Go to Line: Ln 6, Col 14")}>
            Ln 6, Col 14
          </button>
          <span style={{ color: T.textDim }}>|</span>
          <button className="rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
            style={{ color: T.textTertiary }} title="Change encoding"
            onClick={() => toast.info("Encoding: UTF-8 (click to change)")}>
            UTF-8
          </button>
          <span style={{ color: T.textDim }}>|</span>
          <button className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
            title="Click to show warnings"
            onClick={() => setConsoleCollapsed(false)}>
            <AlertTriangle size={9} color={T.amber} /><span style={{ color: T.amber }}>2</span>
          </button>
          <button className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
            title="Click to show errors"
            onClick={() => setConsoleCollapsed(false)}>
            <XCircle size={9} color={T.rose} /><span style={{ color: T.rose }}>0</span>
          </button>
          <span style={{ color: T.textDim }}>|</span>
          <button className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
            style={{ color: T.textTertiary }} title="Keyboard Shortcuts (Ctrl+/)"
            onClick={() => setShortcutsOpen(true)}>
            <Keyboard size={9} color={T.textMuted} />
            {globalSettings.fontScale <= 1.2 && <span>Shortcuts</span>}
          </button>
          <span style={{ color: T.textDim }}>|</span>
          <button
            className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
            style={{ color: snippetManagerOpen ? T.violet : T.textTertiary }}
            title="Snippet Manager (Ctrl+Shift+S)"
            onClick={() => setSnippetManagerOpen(p => !p)}
          >
            <Layers size={9} color={snippetManagerOpen ? T.violet : T.textMuted} />
            {globalSettings.fontScale <= 1.15 && <span style={{ color: snippetManagerOpen ? T.violet : T.textTertiary }}>Snippets</span>}
          </button>
          <span style={{ color: T.textDim }}>|</span>
          <button
            className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
            style={{ color: perfHudOpen ? T.emerald : T.textTertiary }}
            title="Performance HUD (Ctrl+Shift+M)"
            onClick={() => setPerfHudOpen(p => !p)}
          >
            <Activity size={9} color={perfHudOpen ? T.emerald : T.textMuted} />
            {globalSettings.fontScale <= 1.15 && <span style={{ color: perfHudOpen ? T.emerald : T.textTertiary }}>Perf</span>}
          </button>
          <span style={{ color: T.textDim }}>|</span>
          <button
            className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
            style={{ color: globalSearchOpen ? T.cyan : T.textTertiary }}
            title="Global Search (Ctrl+Shift+F)"
            onClick={() => setGlobalSearchOpen(p => !p)}
          >
            <Search size={9} color={globalSearchOpen ? T.cyan : T.textMuted} />
            {globalSettings.fontScale <= 1.15 && <span style={{ color: globalSearchOpen ? T.cyan : T.textTertiary }}>Search</span>}
          </button>
          {globalSettings.fontScale <= 1.2 && <>
            <span style={{ color: T.textDim }}>|</span>
            <button
              className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
              style={{ color: exportWizardOpen ? T.amber : T.textTertiary }}
              title="Package Export Wizard (Ctrl+Shift+E)"
              onClick={() => setExportWizardOpen(p => !p)}
            >
              <Download size={9} color={exportWizardOpen ? T.amber : T.textMuted} />
              {globalSettings.fontScale <= 1.1 && <span>Export</span>}
            </button>
            <span style={{ color: T.textDim }}>|</span>
            <button
              className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
              style={{ color: historyPanelOpen ? T.violet : T.textTertiary }}
              title="Edit History (Ctrl+Shift+H)"
              onClick={() => setHistoryPanelOpen(p => !p)}
            >
              <Clock size={9} color={historyPanelOpen ? T.violet : T.textMuted} />
              {globalSettings.fontScale <= 1.1 && <span>History</span>}
            </button>
            <span style={{ color: T.textDim }}>|</span>
            <button
              className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
              style={{ color: localizationOpen ? T.violet : T.textTertiary }}
              title="Localization Coverage (Ctrl+Shift+L)"
              onClick={() => setLocalizationOpen(p => !p)}
            >
              <Globe size={9} color={localizationOpen ? T.violet : T.textMuted} />
              {globalSettings.fontScale <= 1.1 && <span>L10n</span>}
            </button>
            <span style={{ color: T.textDim }}>|</span>
            <button
              className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
              style={{ color: changelogOpen ? T.cyan : T.textTertiary }}
              title="What's New (Ctrl+Shift+C)"
              onClick={() => setChangelogOpen(p => !p)}
            >
              <Sparkles size={9} color={changelogOpen ? T.cyan : T.textMuted} />
              {globalSettings.fontScale <= 1.1 && <span>Changelog</span>}
            </button>
            <span style={{ color: T.textDim }}>|</span>
            <button
              className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
              style={{ color: stblManagerOpen ? T.emerald : T.textTertiary }}
              title="String Table Manager (Ctrl+Shift+T)"
              onClick={() => setStblManagerOpen(p => !p)}
            >
              <FileText size={9} color={stblManagerOpen ? T.emerald : T.textMuted} />
              {globalSettings.fontScale <= 1.1 && <span>STBL</span>}
            </button>
            <span style={{ color: T.textDim }}>|</span>
            <button
              className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
              style={{ color: modValidatorOpen ? T.rose : T.textTertiary }}
              title="Mod Validator (Ctrl+Shift+V)"
              onClick={() => setModValidatorOpen(p => !p)}
            >
              <Shield size={9} color={modValidatorOpen ? T.rose : T.textMuted} />
              {globalSettings.fontScale <= 1.1 && <span>Validate</span>}
            </button>
            <span style={{ color: T.textDim }}>|</span>
            <button
              className="flex items-center gap-1 rounded px-1 py-0 transition-colors hover:bg-white/5 cursor-pointer"
              style={{ color: translationMemoryOpen ? T.violet : T.textTertiary }}
              title="Translation Memory (Ctrl+Shift+N)"
              onClick={() => setTranslationMemoryOpen(p => !p)}
            >
              <Languages size={9} color={translationMemoryOpen ? T.violet : T.textMuted} />
              {globalSettings.fontScale <= 1.1 && <span>TM</span>}
            </button>
            <span style={{ color: T.textDim }}>|</span>
            <span style={{ color: T.textTertiary }}>JPE Studio v4.2.0</span>
            <span style={{ color: T.textDim }}>|</span>
            <button
              className="rounded px-1.5 py-0 transition-colors hover:bg-white/5 cursor-pointer flex items-center gap-1"
              style={{ color: T.violet }}
              title="Open Crystal Forge IDE (Ctrl+Alt+F)"
              onClick={() => navigate("/crystal-forge")}
            >
              <Braces size={9} color={T.violet} />
              <span>Crystal Forge</span>
            </button>
          </>}
        </div>
      </div>

      {/* ═══ SNIPPET MANAGER ═══ */}
      <SnippetManager isOpen={snippetManagerOpen} onClose={() => setSnippetManagerOpen(false)} />

      {/* ═══ GLOBAL SEARCH ═══ */}
      <GlobalSearch isOpen={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} />

      {/* ═══ PERFORMANCE HUD ═══ */}
      <AnimatePresence>
        {perfHudOpen && (
          <PerformanceHUD metrics={liveMetrics as LiveMetrics} onClose={() => setPerfHudOpen(false)} />
        )}
      </AnimatePresence>

      {/* ═══ COMMAND PALETTE ═══ */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} onSwitchMode={setMode} currentMode={mode} />

      {/* ═══ KEYBOARD SHORTCUTS OVERLAY ═══ */}
      <KeyboardShortcutsOverlay isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* ═══ ONBOARDING TOUR ═══ */}
      <OnboardingTour isOpen={onboardingOpen} onClose={() => setOnboardingOpen(false)} />

      {/* ═══ QUICK START CHECKLIST (Phase 11) ═══ */}
      {!onboardingOpen && !localStorage.getItem("jpe-onboarding-completed") && (
        <QuickStartChecklist />
      )}

      {/* ═══ NETWORK STATUS ═══ */}
      <NetworkStatusIndicator />

      {/* ═══ FILE OPERATION DIALOG (Phase 12) ═══ */}
      <FileOperationDialog
        isOpen={!!fileDialogConfig}
        mode={fileDialogConfig?.mode ?? "new-file"}
        currentName={fileDialogConfig?.currentName}
        parentPath={fileDialogConfig?.parentPath}
        onClose={() => setFileDialogConfig(null)}
        onConfirm={(name, template) => {
          const actionLabel = fileDialogConfig?.mode === "rename" ? "Renamed" : fileDialogConfig?.mode === "new-folder" ? "Folder created" : "File created";
          toast.success(`${actionLabel}: ${name}`, {
            description: template ? `Template: ${template}` : undefined,
          });
          setFileDialogConfig(null);
        }}
      />

      {/* ═══ PACKAGE EXPORT WIZARD (Phase 13) ═══ */}
      <PackageExportWizard
        isOpen={exportWizardOpen}
        onClose={() => setExportWizardOpen(false)}
      />

      {/* ═══ EDIT HISTORY PANEL (Phase 13) ═══ */}
      <EditHistoryPanel
        isOpen={historyPanelOpen}
        onClose={() => setHistoryPanelOpen(false)}
      />

      {/* ═══ CONFLICT RESOLUTION WIZARD (Phase 13) ═══ */}
      <ConflictResolutionWizard
        isOpen={conflictWizardOpen}
        onClose={() => setConflictWizardOpen(false)}
      />

      {/* ═══ LOCALIZATION COVERAGE (Phase 14) ═══ */}
      <LocalizationCoverage
        isOpen={localizationOpen}
        onClose={() => setLocalizationOpen(false)}
      />

      {/* ═══ CHANGELOG MODAL (Phase 14) ═══ */}
      <ChangelogModal
        isOpen={changelogOpen}
        onClose={() => setChangelogOpen(false)}
      />

      {/* ═══ STRING TABLE MANAGER (Phase 15) ═══ */}
      <StringTableManager
        isOpen={stblManagerOpen}
        onClose={() => setStblManagerOpen(false)}
      />

      {/* ═══ MOD VALIDATOR (Phase 15) ═══ */}
      <ModValidator
        isOpen={modValidatorOpen}
        onClose={() => setModValidatorOpen(false)}
      />

      {/* ═══ TRANSLATION MEMORY (Phase 15) ═══ */}
      <TranslationMemory
        isOpen={translationMemoryOpen}
        onClose={() => setTranslationMemoryOpen(false)}
      />

      {/* ═══ PHASE 16 ═══ */}
      <ModTemplateWizard
        isOpen={modTemplateOpen}
        onClose={() => setModTemplateOpen(false)}
      />
      <ResourceBrowser
        isOpen={resourceBrowserOpen}
        onClose={() => setResourceBrowserOpen(false)}
      />

      {/* ═══ PHASE 17 ═══ */}
      <SymbolOutline
        isOpen={symbolOutlineOpen}
        onClose={() => setSymbolOutlineOpen(false)}
      />
      <HoverDocPanel
        isOpen={hoverDocOpen}
        onClose={() => setHoverDocOpen(false)}
      />

      {/* ═══ PHASE 18 ═══ */}
      <BatchOperations
        isOpen={batchOpsOpen}
        onClose={() => setBatchOpsOpen(false)}
      />
      <BuildProfileManager
        isOpen={buildProfileOpen}
        onClose={() => setBuildProfileOpen(false)}
      />

      {/* ═══ PHASE 19 ═══ */}
      <ModHealthDashboard
        isOpen={modHealthOpen}
        onClose={() => setModHealthOpen(false)}
      />
      <UsageAnalytics
        isOpen={usageAnalyticsOpen}
        onClose={() => setUsageAnalyticsOpen(false)}
      />

      {/* ═══ PHASE 20 ═══ */}
      <ReleaseManager
        isOpen={releaseManagerOpen}
        onClose={() => setReleaseManagerOpen(false)}
      />
      {splashOpen && (
        <SplashScreen onDismiss={() => setSplashOpen(false)} />
      )}

      {/* ═══ PHASE 21 ═══ */}
      <LivePreview
        isOpen={livePreviewOpen}
        onClose={() => setLivePreviewOpen(false)}
      />
      <HotReloadWatcher
        isOpen={hotReloadOpen}
        onClose={() => setHotReloadOpen(false)}
      />

      {/* ═══ PHASE 22 ═══ */}
      <DocGenerator
        isOpen={docGenOpen}
        onClose={() => setDocGenOpen(false)}
      />
      <ApiReferenceViewer
        isOpen={apiRefOpen}
        onClose={() => setApiRefOpen(false)}
      />

      {/* ═══ PHASE 23 ═══ */}
      <TeamAnnotations
        isOpen={teamAnnotsOpen}
        onClose={() => setTeamAnnotsOpen(false)}
      />
      <TestRunner
        isOpen={testRunnerOpen}
        onClose={() => setTestRunnerOpen(false)}
      />
    </div>
    </ReducedMotionProvider>
  );
}

export default JPEStudio;
