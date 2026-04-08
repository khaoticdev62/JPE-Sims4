/* ─────────────────────────────────────────────────────────────
   JPE Studio — Tools Overflow Menu
   Replaces the 30+ flat icon buttons in the title bar with a
   single compact "Tools" button opening a categorized popover.
   ───────────────────────────────────────────────────────────── */
import { useState, useRef, useEffect } from "react";
import {
  Wrench, Download, Clock, GitMerge, Globe, Sparkles,
  FileText, Shield, Languages, Wand2, Database, List,
  BookOpen, Replace, Rocket, BarChart3, TrendingUp, Tag,
  Monitor, Activity, Layers, MessageSquare, Play, ChevronDown,
  X, Search, type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "./jpe-motion";
import { T } from "../pages/jpe-theme";

/* ── Tool entry ─────────────────────────────────────────────── */
interface ToolEntry {
  id: string;
  label: string;
  shortcut: string;
  icon: LucideIcon;
  color: string;
  group: string;
  open: boolean;
  onToggle: () => void;
}

/* ── Group config ───────────────────────────────────────────── */
const GROUP_ORDER = ["Preview", "Build", "Localization", "Validation", "Documentation", "Collaboration", "Analysis"];

const GROUP_CFG: Record<string, { color: string; icon: LucideIcon }> = {
  Preview:       { color: T.violet,  icon: Monitor      },
  Build:         { color: T.amber,   icon: Rocket       },
  Localization:  { color: T.cyan,    icon: Globe        },
  Validation:    { color: T.emerald, icon: Shield       },
  Documentation: { color: T.violet,  icon: BookOpen     },
  Collaboration: { color: T.rose,    icon: MessageSquare },
  Analysis:      { color: T.emerald, icon: BarChart3    },
};

/* ── Chip: single tool button inside popover ─────────────────── */
function ToolChip({ tool }: { tool: ToolEntry }) {
  const Icon = tool.icon;
  return (
    <button
      onClick={tool.onToggle}
      title={`${tool.label} (${tool.shortcut})`}
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg w-full text-left transition-all"
      style={{
        background: tool.open ? `${tool.color}12` : "transparent",
        border: `1px solid ${tool.open ? `${tool.color}30` : "transparent"}`,
      }}
      onMouseEnter={e => {
        if (!tool.open) {
          e.currentTarget.style.background = T.bgHover;
          e.currentTarget.style.borderColor = T.borderSubtle;
        }
      }}
      onMouseLeave={e => {
        if (!tool.open) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "transparent";
        }
      }}
    >
      <Icon size={12} color={tool.open ? tool.color : T.textMuted} className="flex-shrink-0" />
      <span style={{
        fontSize: 11,
        color: tool.open ? tool.color : T.textSecondary,
        fontWeight: tool.open ? 600 : 400,
        flex: 1,
        whiteSpace: "nowrap",
      }}>
        {tool.label}
      </span>
      <kbd style={{
        fontSize: 8,
        fontFamily: T.mono,
        color: T.textDim,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${T.borderSubtle}`,
        padding: "1px 4px",
        borderRadius: 3,
        flexShrink: 0,
      }}>
        {tool.shortcut.replace("Ctrl+Shift+", "⌃⇧")}
      </kbd>
    </button>
  );
}

/* ── Main component ─────────────────────────────────────────── */
interface ToolsOverflowMenuProps {
  // Phase 13
  exportWizardOpen: boolean;           onToggleExport: () => void;
  historyPanelOpen: boolean;           onToggleHistory: () => void;
  conflictWizardOpen: boolean;         onToggleConflict: () => void;
  // Phase 14
  localizationOpen: boolean;           onToggleLocalization: () => void;
  changelogOpen: boolean;              onToggleChangelog: () => void;
  // Phase 15
  stblManagerOpen: boolean;            onToggleStbl: () => void;
  modValidatorOpen: boolean;           onToggleValidator: () => void;
  translationMemoryOpen: boolean;      onToggleTranslationMemory: () => void;
  // Phase 16
  modTemplateOpen: boolean;            onToggleTemplate: () => void;
  resourceBrowserOpen: boolean;        onToggleResources: () => void;
  // Phase 17
  symbolOutlineOpen: boolean;          onToggleSymbol: () => void;
  hoverDocOpen: boolean;               onToggleHoverDoc: () => void;
  // Phase 18
  batchOpsOpen: boolean;               onToggleBatch: () => void;
  buildProfileOpen: boolean;           onToggleBuildProfile: () => void;
  // Phase 19
  modHealthOpen: boolean;              onToggleHealth: () => void;
  usageAnalyticsOpen: boolean;         onToggleAnalytics: () => void;
  // Phase 20
  releaseManagerOpen: boolean;         onToggleRelease: () => void;
  // Phase 21
  livePreviewOpen: boolean;            onToggleLivePreview: () => void;
  hotReloadOpen: boolean;              onToggleHotReload: () => void;
  // Phase 22
  docGenOpen: boolean;                 onToggleDocGen: () => void;
  apiRefOpen: boolean;                 onToggleApiRef: () => void;
  // Phase 23
  teamAnnotsOpen: boolean;             onToggleAnnots: () => void;
  testRunnerOpen: boolean;             onToggleTests: () => void;
}

export function ToolsOverflowMenu(props: ToolsOverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setSearch(""); return; }
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const openCount = [
    props.exportWizardOpen, props.historyPanelOpen, props.conflictWizardOpen,
    props.localizationOpen, props.changelogOpen, props.stblManagerOpen,
    props.modValidatorOpen, props.translationMemoryOpen, props.modTemplateOpen,
    props.resourceBrowserOpen, props.symbolOutlineOpen, props.hoverDocOpen,
    props.batchOpsOpen, props.buildProfileOpen, props.modHealthOpen,
    props.usageAnalyticsOpen, props.releaseManagerOpen, props.livePreviewOpen,
    props.hotReloadOpen, props.docGenOpen, props.apiRefOpen,
    props.teamAnnotsOpen, props.testRunnerOpen,
  ].filter(Boolean).length;

  /* ── Shortcut map — no conflicts with core shortcuts ─────── */
  const tools: ToolEntry[] = [
    // Preview
    { id:"live-preview",  label:"Live Preview",         shortcut:"Ctrl+Shift+P", icon:Monitor,       color:T.violet,  group:"Preview",       open:props.livePreviewOpen,       onToggle:()=>{props.onToggleLivePreview();setOpen(false);}    },
    { id:"hot-reload",    label:"Hot Reload Watcher",   shortcut:"Ctrl+Shift+Q", icon:Activity,      color:T.emerald, group:"Preview",       open:props.hotReloadOpen,         onToggle:()=>{props.onToggleHotReload();setOpen(false);}      },
    // Build
    { id:"export",        label:"Package Export",       shortcut:"Ctrl+Shift+E", icon:Download,      color:T.amber,   group:"Build",         open:props.exportWizardOpen,      onToggle:()=>{props.onToggleExport();setOpen(false);}         },
    { id:"build-profile", label:"Build Profiles",       shortcut:"Ctrl+Shift+U", icon:Rocket,        color:T.amber,   group:"Build",         open:props.buildProfileOpen,      onToggle:()=>{props.onToggleBuildProfile();setOpen(false);}   },
    { id:"release",       label:"Release Manager",      shortcut:"Ctrl+Shift+Z", icon:Tag,           color:T.violet,  group:"Build",         open:props.releaseManagerOpen,    onToggle:()=>{props.onToggleRelease();setOpen(false);}        },
    // Localization
    { id:"localization",  label:"Localization Coverage",shortcut:"Ctrl+Shift+L", icon:Globe,         color:T.cyan,    group:"Localization",  open:props.localizationOpen,      onToggle:()=>{props.onToggleLocalization();setOpen(false);}   },
    { id:"stbl",          label:"String Table Manager", shortcut:"Ctrl+Shift+T", icon:FileText,      color:T.cyan,    group:"Localization",  open:props.stblManagerOpen,       onToggle:()=>{props.onToggleStbl();setOpen(false);}           },
    { id:"trans-mem",     label:"Translation Memory",   shortcut:"Ctrl+Shift+N", icon:Languages,     color:T.violet,  group:"Localization",  open:props.translationMemoryOpen, onToggle:()=>{props.onToggleTranslationMemory();setOpen(false);}},
    // Validation
    { id:"validator",     label:"Mod Validator",        shortcut:"Ctrl+Shift+V", icon:Shield,        color:T.emerald, group:"Validation",    open:props.modValidatorOpen,      onToggle:()=>{props.onToggleValidator();setOpen(false);}      },
    { id:"tests",         label:"Test Runner",          shortcut:"Ctrl+Shift+J", icon:Play,          color:T.emerald, group:"Validation",    open:props.testRunnerOpen,        onToggle:()=>{props.onToggleTests();setOpen(false);}          },
    { id:"batch",         label:"Batch Operations",     shortcut:"Ctrl+Shift+A", icon:Replace,       color:T.emerald, group:"Validation",    open:props.batchOpsOpen,          onToggle:()=>{props.onToggleBatch();setOpen(false);}          },
    { id:"conflict",      label:"Conflict Resolver",    shortcut:"Ctrl+Shift+R", icon:GitMerge,      color:T.rose,    group:"Validation",    open:props.conflictWizardOpen,    onToggle:()=>{props.onToggleConflict();setOpen(false);}       },
    // Documentation
    { id:"doc-gen",       label:"Doc Generator",        shortcut:"Ctrl+Shift+G", icon:Sparkles,      color:T.cyan,    group:"Documentation", open:props.docGenOpen,            onToggle:()=>{props.onToggleDocGen();setOpen(false);}         },
    { id:"api-ref",       label:"API Reference",        shortcut:"Ctrl+Shift+K", icon:Layers,        color:T.violet,  group:"Documentation", open:props.apiRefOpen,            onToggle:()=>{props.onToggleApiRef();setOpen(false);}         },
    { id:"symbol",        label:"Symbol Outline",       shortcut:"Ctrl+Shift+O", icon:List,          color:T.violet,  group:"Documentation", open:props.symbolOutlineOpen,     onToggle:()=>{props.onToggleSymbol();setOpen(false);}         },
    { id:"hover-doc",     label:"Tuning Hover Docs",    shortcut:"Ctrl+Shift+D", icon:BookOpen,      color:T.cyan,    group:"Documentation", open:props.hoverDocOpen,          onToggle:()=>{props.onToggleHoverDoc();setOpen(false);}       },
    // Collaboration
    { id:"annotations",   label:"Team Annotations",     shortcut:"Ctrl+Shift+;", icon:MessageSquare, color:T.rose,    group:"Collaboration", open:props.teamAnnotsOpen,        onToggle:()=>{props.onToggleAnnots();setOpen(false);}         },
    { id:"history",       label:"Edit History",         shortcut:"Ctrl+Shift+H", icon:Clock,         color:T.violet,  group:"Collaboration", open:props.historyPanelOpen,      onToggle:()=>{props.onToggleHistory();setOpen(false);}        },
    { id:"resources",     label:"Resource Browser",     shortcut:"Ctrl+Shift+B", icon:Database,      color:T.cyan,    group:"Collaboration", open:props.resourceBrowserOpen,   onToggle:()=>{props.onToggleResources();setOpen(false);}      },
    { id:"template",      label:"Mod Templates",        shortcut:"Ctrl+Shift+W", icon:Wand2,         color:T.amber,   group:"Collaboration", open:props.modTemplateOpen,       onToggle:()=>{props.onToggleTemplate();setOpen(false);}       },
    { id:"changelog",     label:"What's New",           shortcut:"Ctrl+Shift+C", icon:Sparkles,      color:T.cyan,    group:"Collaboration", open:props.changelogOpen,         onToggle:()=>{props.onToggleChangelog();setOpen(false);}      },
    // Analysis
    { id:"mod-health",    label:"Mod Health",           shortcut:"Ctrl+Shift+Y", icon:BarChart3,     color:T.emerald, group:"Analysis",      open:props.modHealthOpen,         onToggle:()=>{props.onToggleHealth();setOpen(false);}         },
    { id:"analytics",     label:"Usage Analytics",      shortcut:"Ctrl+Shift+I", icon:TrendingUp,    color:T.violet,  group:"Analysis",      open:props.usageAnalyticsOpen,    onToggle:()=>{props.onToggleAnalytics();setOpen(false);}      },
  ];

  const filtered = search
    ? tools.filter(t =>
        t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.shortcut.toLowerCase().includes(search.toLowerCase()) ||
        t.group.toLowerCase().includes(search.toLowerCase())
      )
    : tools;

  const grouped = GROUP_ORDER.map(g => ({
    group: g,
    cfg: GROUP_CFG[g],
    items: filtered.filter(t => t.group === g),
  })).filter(g => g.items.length > 0);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen(p => !p)}
        title="Tools Palette — all Phase 13–23 panels"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all"
        style={{
          fontSize: 11, fontWeight: 600,
          color: open || openCount > 0 ? T.textPrimary : T.textSecondary,
          background: open ? `${T.violet}15` : openCount > 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${open ? `${T.violet}35` : T.borderSubtle}`,
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = T.border; } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = openCount > 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = T.borderSubtle; } }}
      >
        <Wrench size={12} color={open ? T.violet : T.textMuted} />
        <span>Tools</span>
        {openCount > 0 && (
          <span className="px-1.5 py-0 rounded-full" style={{
            fontSize: 8, fontWeight: 800, fontFamily: T.mono,
            color: T.violet, background: T.violetDim,
          }}>
            {openCount}
          </span>
        )}
        <ChevronDown
          size={10} color={T.textMuted}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
        />
      </button>

      {/* ── Popover ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-1.5 rounded-xl overflow-hidden z-[300]"
            style={{
              width: 340,
              background: T.bgElevated,
              border: `1px solid ${T.border}`,
              boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)`,
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Accent strip */}
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${T.violet}, ${T.cyan}, ${T.emerald})` }} />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-2">
                <Wrench size={13} color={T.violet} />
                <span style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary }}>Tools Palette</span>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{tools.length} tools</span>
              </div>
              <button onClick={() => setOpen(false)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/5">
                <X size={12} color={T.textMuted} />
              </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
                <Search size={10} color={T.textMuted} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter tools or shortcuts…"
                  className="bg-transparent outline-none flex-1"
                  style={{ fontSize: 11, color: T.textSecondary }}
                  autoFocus
                />
                {search && (
                  <button onClick={() => setSearch("")}>
                    <X size={9} color={T.textMuted} />
                  </button>
                )}
              </div>
            </div>

            {/* Groups */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
              {grouped.map(({ group, cfg, items }) => {
                const GroupIcon = cfg.icon;
                const openInGroup = items.filter(t => t.open).length;
                return (
                  <div key={group} className="px-3 py-2" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
                    <div className="flex items-center gap-2 px-1 py-1">
                      <GroupIcon size={10} color={cfg.color} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.07em" }}>
                        {group.toUpperCase()}
                      </span>
                      {openInGroup > 0 && (
                        <span style={{ fontSize: 8, fontFamily: T.mono, color: cfg.color, marginLeft: "auto" }}>
                          {openInGroup} open
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {items.map(tool => (
                        <ToolChip key={tool.id} tool={tool} />
                      ))}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Search size={18} color={T.textDim} />
                  <span style={{ fontSize: 11, color: T.textMuted }}>No tools match "{search}"</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 flex items-center justify-between" style={{ borderTop: `1px solid ${T.border}`, background: "rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: 9, color: T.textDim, fontFamily: T.mono }}>
                {openCount > 0 ? `${openCount} panel${openCount > 1 ? "s" : ""} open` : "All panels closed"}
              </span>
              {openCount > 0 && (
                <button
                  style={{ fontSize: 9, color: T.rose, fontFamily: T.mono }}
                  className="hover:opacity-80 transition-opacity"
                  onClick={() => {
                    tools.filter(t => t.open).forEach(t => t.onToggle());
                  }}
                >
                  Close all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ToolsOverflowMenu;
