/**
 * ModeExplorerPanels.tsx
 * Mode-specific left panel content for Library, Plugin, Debug, and Vault workspace modes.
 * Replaces the generic file tree in the ExplorerPanel for these four modes.
 */
import { useState, useMemo, useCallback } from "react";
import {
  Library, Puzzle, Bug, Package, Search, X,
  CheckCircle2, AlertTriangle, Download, RefreshCw,
  RotateCcw, Play, Pause, Hash, Plus, Minus,
  ChevronDown, ChevronRight, Eye, EyeOff, Shield,
  Star, Circle, Layers, Activity, Zap, Database,
  ArrowRight, MoreHorizontal, Filter, CornerDownRight,
  Braces, Lock, Network, TrendingUp, Boxes,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence, easing } from "./jpe-motion";
import { T } from "../pages/jpe-theme";
import { toast } from "sonner";
import { modLibraryData, marketPlugins, type LibMod, type MarketPlugin } from "../pages/jpe-data";

/* ── Shared mini-atoms ──────────────────────────────────────────── */
function SectionHeader({ title, count, color = T.textMuted, onAdd }: { title: string; count?: number; color?: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between px-3 pt-3 pb-1">
      <span className="uppercase tracking-widest" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color, fontFamily: T.sans }}>{title}</span>
      <div className="flex items-center gap-1">
        {count !== undefined && (
          <span className="px-1.5 rounded" style={{ fontSize: 8, fontFamily: T.mono, color, background: `${color}12` }}>{count}</span>
        )}
        {onAdd && (
          <button onClick={onAdd} className="p-0.5 rounded hover:bg-white/5 transition-colors">
            <Plus size={10} color={T.textMuted} />
          </button>
        )}
      </div>
    </div>
  );
}

function SidebarRow({
  icon: Icon, label, sub, color, isActive, badge, badgeColor, onClick,
}: {
  icon: LucideIcon; label: string; sub?: string; color?: string;
  isActive?: boolean; badge?: string; badgeColor?: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left group"
      style={{
        background: isActive ? `${color || T.cyan}0F` : "transparent",
        borderLeft: `2px solid ${isActive ? (color || T.cyan) : "transparent"}`,
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = T.bgHover; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      <Icon size={11} color={isActive ? (color || T.cyan) : T.textDim} />
      <span className="flex-1 truncate" style={{ fontSize: 11, color: isActive ? T.textPrimary : T.textTertiary, fontWeight: isActive ? 700 : 500 }}>{label}</span>
      {sub && <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{sub}</span>}
      {badge && <span className="px-1.5 rounded" style={{ fontSize: 8, fontWeight: 700, color: badgeColor || T.cyan, background: `${badgeColor || T.cyan}14` }}>{badge}</span>}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LIBRARY EXPLORER — compact mod list with status, size, conflicts
   ══════════════════════════════════════════════════════════════════ */
export function LibraryExplorer() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>("evil-trait");

  const cats = useMemo(() => {
    const all = Array.from(new Set(modLibraryData.map(m => m.category)));
    return ["All", ...all];
  }, []);

  const filtered = useMemo(() => {
    let list = modLibraryData;
    if (catFilter !== "All") list = list.filter(m => m.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.author.toLowerCase().includes(q));
    }
    return list;
  }, [search, catFilter]);

  const stColor: Record<string, string> = {
    installed: T.emerald, update: T.amber, available: T.cyan, outdated: T.rose,
  };
  const stLabel: Record<string, string> = {
    installed: "OK", update: "UPD", available: "GET", outdated: "OLD",
  };

  const installed = modLibraryData.filter(m => m.status === "installed" || m.status === "update" || m.status === "outdated");
  const updates = modLibraryData.filter(m => m.status === "update");
  const conflicts = modLibraryData.reduce((s, m) => s + m.conflicts, 0);

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: T.sans }}>
      {/* Stats pills */}
      <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, color: T.emerald, background: T.emeraldDim }}>{installed.length} installed</span>
        {updates.length > 0 && <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, color: T.amber, background: T.amberDim }}>{updates.length} updates</span>}
        {conflicts > 0 && <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, color: T.rose, background: T.roseDim }}>{conflicts} conflicts</span>}
      </div>

      {/* Search */}
      <div className="px-2 py-1.5" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
          <Search size={10} color={T.textDim} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter mods..."
            className="flex-1 bg-transparent outline-none" style={{ fontSize: 11, color: T.textPrimary, fontFamily: T.sans }} />
          {search && <button onClick={() => setSearch("")}><X size={9} color={T.textDim} /></button>}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-1 px-2 py-1.5 flex-wrap" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
        {cats.slice(0, 6).map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)}
            className="px-1.5 py-0.5 rounded transition-all"
            style={{ fontSize: 9, fontWeight: catFilter === cat ? 700 : 500, color: catFilter === cat ? T.cyanBright : T.textDim, background: catFilter === cat ? T.cyanDim : "transparent", border: `1px solid ${catFilter === cat ? T.borderActive : "transparent"}` }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Mod list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-6">
            <span style={{ fontSize: 11, color: T.textDim }}>No mods match filter</span>
          </div>
        )}
        {filtered.map(mod => {
          const isSel = selectedId === mod.id;
          const sc = stColor[mod.status];
          return (
            <motion.div
              key={mod.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2 px-3 py-2 cursor-pointer transition-colors group relative"
              style={{
                background: isSel ? `${T.cyan}08` : "transparent",
                borderLeft: `2px solid ${isSel ? T.cyan : "transparent"}`,
              }}
              onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = T.bgHover; }}
              onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
              onClick={() => { setSelectedId(mod.id); toast.success(`${mod.name} — ${mod.desc.slice(0, 60)}…`); }}
            >
              {/* Status dot */}
              <div className="flex-shrink-0 mt-[3px]">
                <div className="w-2 h-2 rounded-full" style={{ background: sc, boxShadow: `0 0 4px ${sc}50` }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="truncate" style={{ fontSize: 11, color: isSel ? T.textPrimary : T.textSecondary, fontWeight: isSel ? 700 : 500 }}>{mod.name}</span>
                  {!mod.enabled && <EyeOff size={8} color={T.textDim} className="flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>v{mod.version}</span>
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{mod.size}</span>
                  {mod.conflicts > 0 && <AlertTriangle size={8} color={T.rose} />}
                </div>
              </div>
              <span className="flex-shrink-0 px-1.5 py-0.5 rounded" style={{ fontSize: 8, fontWeight: 700, color: sc, background: `${sc}14` }}>{stLabel[mod.status]}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="px-3 py-2 flex items-center justify-between flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{filtered.length} of {modLibraryData.length} mods</span>
        <button className="flex items-center gap-1" onClick={() => toast.success("Refreshing mod library…")}
          style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary }}>
          <RefreshCw size={9} /> Refresh
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PLUGIN EXPLORER — registry with install toggle and categories
   ══════════════════════════════════════════════════════════════════ */
const pluginCategoryItems: { id: string; label: string; icon: LucideIcon; color: string }[] = [
  { id: "all", label: "All Plugins", icon: Boxes, color: T.textTertiary },
  { id: "translator", label: "Translators", icon: Layers, color: T.violet },
  { id: "tool", label: "Dev Tools", icon: Zap, color: T.cyan },
  { id: "analysis", label: "Analysis", icon: Activity, color: T.emerald },
  { id: "language", label: "Language Packs", icon: Database, color: T.amber },
  { id: "theme", label: "Themes", icon: Star, color: T.rose },
];

export function PluginExplorer() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [installedState, setInstalledState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(marketPlugins.map(p => [p.id, p.installed]))
  );
  const [showInstalled, setShowInstalled] = useState(false);

  const filtered = useMemo(() => {
    let list = marketPlugins as MarketPlugin[];
    if (activeCat !== "all") list = list.filter(p => p.category === activeCat);
    if (showInstalled) list = list.filter(p => installedState[p.id]);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.author.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)));
    }
    return list;
  }, [search, activeCat, installedState, showInstalled]);

  const installedCount = Object.values(installedState).filter(Boolean).length;

  const toggleInstall = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const wasInstalled = installedState[id];
    setInstalledState(prev => ({ ...prev, [id]: !prev[id] }));
    toast.success(wasInstalled ? `Plugin uninstalled` : `Plugin installed — restart to activate`);
  }, [installedState]);

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: T.sans }}>
      {/* Stats */}
      <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, color: T.violet, background: T.violetDim }}>{installedCount} active</span>
        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, color: T.textDim, background: "rgba(255,255,255,0.04)" }}>{marketPlugins.length} total</span>
        <button onClick={() => setShowInstalled(p => !p)}
          className="ml-auto px-2 py-0.5 rounded-full transition-all"
          style={{ fontSize: 9, fontWeight: 700, color: showInstalled ? T.cyan : T.textDim, background: showInstalled ? T.cyanDim : "rgba(255,255,255,0.03)", border: `1px solid ${showInstalled ? T.borderActive : "transparent"}` }}>
          {showInstalled ? "All" : "Installed"}
        </button>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: T.bgInput, border: `1px solid ${T.borderSubtle}` }}>
          <Search size={10} color={T.textDim} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plugins..."
            className="flex-1 bg-transparent outline-none" style={{ fontSize: 11, color: T.textPrimary, fontFamily: T.sans }} />
          {search && <button onClick={() => setSearch("")}><X size={9} color={T.textDim} /></button>}
        </div>
      </div>

      {/* Category nav */}
      <div className="py-1 overflow-y-auto" style={{ maxHeight: 160, borderBottom: `1px solid ${T.borderSubtle}` }}>
        <SectionHeader title="CATEGORIES" />
        {pluginCategoryItems.map(cat => {
          const cnt = cat.id === "all" ? marketPlugins.length : marketPlugins.filter(p => p.category === cat.id).length;
          return (
            <SidebarRow key={cat.id} icon={cat.icon} label={cat.label} sub={`${cnt}`}
              color={cat.color} isActive={activeCat === cat.id}
              onClick={() => setActiveCat(cat.id)} />
          );
        })}
      </div>

      {/* Plugin list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-6">
            <span style={{ fontSize: 11, color: T.textDim }}>No plugins found</span>
          </div>
        )}
        {filtered.map(plugin => {
          const isInst = installedState[plugin.id];
          const Icon = plugin.icon;
          return (
            <motion.div key={plugin.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-start gap-2 px-3 py-2 cursor-pointer transition-colors group"
              style={{ borderBottom: `1px solid ${T.borderSubtle}` }}
              onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              onClick={() => toast.info(`${plugin.name} v${plugin.version} — ${plugin.desc}`)}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${plugin.iconColor}12`, border: `1px solid ${plugin.iconColor}20` }}>
                <Icon size={13} color={plugin.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="truncate" style={{ fontSize: 11, color: T.textSecondary, fontWeight: 600 }}>{plugin.name}</span>
                  {plugin.verified && <Shield size={8} color={T.cyan} />}
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>v{plugin.version}</span>
                  <div className="flex items-center gap-0.5">
                    <Star size={8} color={T.amber} fill={T.amber} />
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.amber }}>{plugin.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={e => toggleInstall(plugin.id, e)}
                className="flex-shrink-0 px-1.5 py-0.5 rounded transition-all"
                style={{
                  fontSize: 8, fontWeight: 700,
                  color: isInst ? T.emerald : T.textDim,
                  background: isInst ? T.emeraldDim : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isInst ? T.emerald + "30" : "rgba(255,255,255,0.05)"}`,
                }}
              >
                {isInst ? "ON" : "GET"}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{filtered.length} of {marketPlugins.length} plugins</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DEBUG EXPLORER — breakpoints, call stack, watch variables
   ══════════════════════════════════════════════════════════════════ */
interface Breakpoint {
  id: string; file: string; line: number; condition?: string;
  enabled: boolean; hits: number; color: string;
}

interface WatchVar {
  id: string; expr: string; value: string; type: string; changed: boolean;
}

interface StackFrame {
  id: string; fn: string; file: string; line: number; active: boolean;
}

const initialBreakpoints: Breakpoint[] = [
  { id: "bp1", file: "jpe_translator.ts4script", line: 42, enabled: true, hits: 3, color: T.rose },
  { id: "bp2", file: "trait_Evil.xml", line: 6, condition: "hash == 0x0A3B", enabled: true, hits: 0, color: T.amber },
  { id: "bp3", file: "mod_injector.ts4script", line: 118, enabled: false, hits: 12, color: T.rose },
  { id: "bp4", file: "conflict_resolver.ts4script", line: 77, enabled: true, hits: 1, color: T.rose },
];

const callStackFrames: StackFrame[] = [
  { id: "f0", fn: "resolve_conflicts()", file: "conflict_resolver.ts4script", line: 77, active: true },
  { id: "f1", fn: "apply_tuning_patch()", file: "mod_injector.ts4script", line: 118, active: false },
  { id: "f2", fn: "translate_string()", file: "jpe_translator.ts4script", line: 42, active: false },
  { id: "f3", fn: "main()", file: "jpe_translator.ts4script", line: 12, active: false },
];

const watchVars: WatchVar[] = [
  { id: "w1", expr: "tuning_hash", value: "0x0A3B4C5D", type: "u32", changed: true },
  { id: "w2", expr: "conflict_count", value: "2", type: "int", changed: false },
  { id: "w3", expr: "current_locale", value: '"en_US"', type: "str", changed: false },
  { id: "w4", expr: "stbl_entries", value: "[8 items]", type: "list", changed: false },
  { id: "w5", expr: "translation_conf", value: "0.94", type: "float", changed: true },
];

export function DebugExplorer() {
  const [bps, setBps] = useState<Breakpoint[]>(initialBreakpoints);
  const [activeFrame, setActiveFrame] = useState("f0");
  const [bpOpen, setBpOpen] = useState(true);
  const [stackOpen, setStackOpen] = useState(true);
  const [watchOpen, setWatchOpen] = useState(true);
  const [isPaused, setIsPaused] = useState(true);

  const toggleBp = (id: string) => {
    setBps(prev => prev.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
  };
  const removeBp = (id: string) => {
    setBps(prev => prev.filter(b => b.id !== id));
    toast.success("Breakpoint removed");
  };

  const activeBps = bps.filter(b => b.enabled).length;

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: T.sans }}>
      {/* Debug controls */}
      <div className="flex items-center gap-1 px-3 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <button
          onClick={() => { setIsPaused(p => !p); toast.info(isPaused ? "Debugger resumed" : "Debugger paused"); }}
          className="flex items-center gap-1 px-2 py-1 rounded-md transition-all"
          style={{ fontSize: 10, fontWeight: 700, color: isPaused ? T.emerald : T.amber, background: isPaused ? T.emeraldDim : T.amberDim, border: `1px solid ${isPaused ? T.emerald + "30" : T.amber + "30"}` }}>
          {isPaused ? <Play size={10} /> : <Pause size={10} />}
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button onClick={() => toast.success("Step over →")} className="p-1.5 rounded-md hover:bg-white/5 transition-colors" title="Step Over">
          <ArrowRight size={12} color={T.textTertiary} />
        </button>
        <button onClick={() => toast.success("Step into ↓")} className="p-1.5 rounded-md hover:bg-white/5 transition-colors" title="Step Into">
          <CornerDownRight size={12} color={T.textTertiary} />
        </button>
        <button onClick={() => toast.success("Stop ■")} className="p-1.5 rounded-md hover:bg-white/5 transition-colors" title="Stop">
          <Circle size={12} color={T.rose} fill={T.rose} />
        </button>
        <div className="ml-auto">
          <span style={{ fontSize: 9, fontFamily: T.mono, color: isPaused ? T.rose : T.emerald }}>
            {isPaused ? "⏸ PAUSED" : "▶ RUNNING"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* BREAKPOINTS */}
        <div style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
          <button className="w-full flex items-center gap-2 px-3 py-2 transition-colors hover:bg-white/3"
            onClick={() => setBpOpen(p => !p)}>
            {bpOpen ? <ChevronDown size={10} color={T.textMuted} /> : <ChevronRight size={10} color={T.textMuted} />}
            <span className="uppercase tracking-widest" style={{ fontSize: 9, fontWeight: 700, color: T.textMuted }}>Breakpoints</span>
            <span className="ml-auto px-1.5 rounded" style={{ fontSize: 8, fontFamily: T.mono, color: T.rose, background: T.roseDim }}>{activeBps}/{bps.length}</span>
          </button>
          <AnimatePresence initial={false}>
            {bpOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
                {bps.length === 0 && (
                  <div className="px-3 py-2 text-center">
                    <span style={{ fontSize: 10, color: T.textDim }}>No breakpoints set</span>
                  </div>
                )}
                {bps.map(bp => (
                  <div key={bp.id} className="flex items-center gap-2 px-3 py-1.5 group"
                    onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    <button onClick={() => toggleBp(bp.id)} className="flex-shrink-0">
                      <Circle size={10} color={bp.enabled ? bp.color : T.textMuted} fill={bp.enabled ? bp.color : "none"} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="truncate" style={{ fontSize: 10, fontFamily: T.mono, color: bp.enabled ? T.textSecondary : T.textDim }}>{bp.file}</div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>Ln {bp.line}</span>
                        {bp.condition && <span style={{ fontSize: 9, fontFamily: T.mono, color: T.violet }}>if {bp.condition}</span>}
                        {bp.hits > 0 && <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{bp.hits}×</span>}
                      </div>
                    </div>
                    <button onClick={() => removeBp(bp.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10">
                      <X size={10} color={T.textDim} />
                    </button>
                  </div>
                ))}
                <div className="px-3 py-1.5">
                  <button onClick={() => { setBps(prev => [...prev, { id: `bp${Date.now()}`, file: "jpe_translator.ts4script", line: Math.floor(Math.random() * 200 + 1), enabled: true, hits: 0, color: T.rose }]); toast.success("Breakpoint added at current cursor"); }}
                    className="flex items-center gap-1 text-left transition-colors hover:text-cyan-300"
                    style={{ fontSize: 10, color: T.textDim }}>
                    <Plus size={10} /> Add breakpoint
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CALL STACK */}
        <div style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
          <button className="w-full flex items-center gap-2 px-3 py-2 transition-colors hover:bg-white/3"
            onClick={() => setStackOpen(p => !p)}>
            {stackOpen ? <ChevronDown size={10} color={T.textMuted} /> : <ChevronRight size={10} color={T.textMuted} />}
            <span className="uppercase tracking-widest" style={{ fontSize: 9, fontWeight: 700, color: T.textMuted }}>Call Stack</span>
            <span className="ml-auto px-1.5 rounded" style={{ fontSize: 8, fontFamily: T.mono, color: T.cyan, background: T.cyanDim }}>{callStackFrames.length}</span>
          </button>
          <AnimatePresence initial={false}>
            {stackOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
                {callStackFrames.map((frame, i) => (
                  <button key={frame.id} onClick={() => { setActiveFrame(frame.id); toast.info(`Jumped to ${frame.fn} at Ln ${frame.line}`); }}
                    className="w-full flex items-start gap-2 px-3 py-1.5 text-left transition-colors"
                    style={{ background: activeFrame === frame.id ? `${T.cyan}08` : "transparent", borderLeft: `2px solid ${activeFrame === frame.id ? T.cyan : "transparent"}` }}
                    onMouseEnter={e => { if (activeFrame !== frame.id) e.currentTarget.style.background = T.bgHover; }}
                    onMouseLeave={e => { if (activeFrame !== frame.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim, width: 12, flexShrink: 0 }}>{i}</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate" style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: activeFrame === frame.id ? T.cyan : T.textSecondary }}>{frame.fn}</div>
                      <div style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{frame.file}:{frame.line}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* WATCH EXPRESSIONS */}
        <div>
          <button className="w-full flex items-center gap-2 px-3 py-2 transition-colors hover:bg-white/3"
            onClick={() => setWatchOpen(p => !p)}>
            {watchOpen ? <ChevronDown size={10} color={T.textMuted} /> : <ChevronRight size={10} color={T.textMuted} />}
            <span className="uppercase tracking-widest" style={{ fontSize: 9, fontWeight: 700, color: T.textMuted }}>Watch</span>
            <span className="ml-auto px-1.5 rounded" style={{ fontSize: 8, fontFamily: T.mono, color: T.violet, background: T.violetDim }}>{watchVars.length}</span>
          </button>
          <AnimatePresence initial={false}>
            {watchOpen && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
                {watchVars.map(v => (
                  <div key={v.id} className="flex items-center gap-2 px-3 py-1.5"
                    onMouseEnter={e => { e.currentTarget.style.background = T.bgHover; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                    {v.changed && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: T.amber }} />}
                    {!v.changed && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "transparent" }} />}
                    <span className="flex-1 truncate" style={{ fontSize: 10, fontFamily: T.mono, color: T.textTertiary }}>{v.expr}</span>
                    <span style={{ fontSize: 10, fontFamily: T.mono, color: v.changed ? T.amber : T.emerald }}>{v.value}</span>
                    <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textDim }}>{v.type}</span>
                  </div>
                ))}
                <div className="px-3 py-1.5">
                  <button onClick={() => toast.info("Add watch expression: type variable name")}
                    className="flex items-center gap-1 transition-colors hover:text-cyan-300"
                    style={{ fontSize: 10, color: T.textDim }}>
                    <Plus size={10} /> Add expression
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   VAULT EXPLORER — Rebel's Vault node browser and resource metrics
   ══════════════════════════════════════════════════════════════════ */
interface VaultNode {
  id: string; label: string; type: "lore" | "resource" | "trade" | "faction" | "secret";
  status: "active" | "locked" | "pending" | "available";
  tier: number; strength: number; description: string;
}

const vaultNodes: VaultNode[] = [
  { id: "v1", label: "Rebel Archives", type: "lore", status: "active", tier: 1, strength: 94, description: "Core lore repository — 847 encrypted fragments" },
  { id: "v2", label: "STBL Black Market", type: "trade", status: "active", tier: 2, strength: 78, description: "Verified string key exchanges between modders" },
  { id: "v3", label: "Faction: ScarletRealm", type: "faction", status: "active", tier: 1, strength: 92, description: "Primary mod distribution faction" },
  { id: "v4", label: "Resource Caches", type: "resource", status: "available", tier: 2, strength: 61, description: "Unclaimed tuning bundles — 12 packages" },
  { id: "v5", label: "Shadow Builds", type: "secret", status: "locked", tier: 3, strength: 0, description: "Encrypted development builds — requires clearance" },
  { id: "v6", label: "CurseForge Relay", type: "trade", status: "pending", tier: 2, strength: 45, description: "Pending sync with CurseForge upstream" },
  { id: "v7", label: "NexusMods Bridge", type: "faction", status: "available", tier: 2, strength: 70, description: "NexusMods integration bridge — 156 mods indexed" },
  { id: "v8", label: "Cipher Keys", type: "secret", status: "locked", tier: 3, strength: 0, description: "FNV hash cipher key vault — Tier 3 clearance required" },
];

const vaultTypeColors: Record<VaultNode["type"], string> = {
  lore: T.violet, resource: T.cyan, trade: T.amber, faction: T.emerald, secret: T.rose,
};
const vaultTypeIcons: Record<VaultNode["type"], LucideIcon> = {
  lore: Database, resource: Boxes, trade: TrendingUp, faction: Network, secret: Lock,
};
const vaultStatusColors: Record<VaultNode["status"], string> = {
  active: T.emerald, locked: T.rose, pending: T.amber, available: T.cyan,
};

export function VaultExplorer() {
  const [selectedType, setSelectedType] = useState<VaultNode["type"] | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>("v1");
  const [metricsOpen, setMetricsOpen] = useState(true);

  const filtered = useMemo(() =>
    selectedType === "all" ? vaultNodes : vaultNodes.filter(v => v.type === selectedType),
    [selectedType]
  );

  const activeNodes = vaultNodes.filter(v => v.status === "active").length;
  const lockedNodes = vaultNodes.filter(v => v.status === "locked").length;
  const avgStrength = Math.round(vaultNodes.filter(v => v.strength > 0).reduce((s, v) => s + v.strength, 0) / vaultNodes.filter(v => v.strength > 0).length);

  const types: { id: VaultNode["type"] | "all"; label: string }[] = [
    { id: "all", label: "All" }, { id: "lore", label: "Lore" }, { id: "trade", label: "Trade" },
    { id: "faction", label: "Faction" }, { id: "resource", label: "Resource" }, { id: "secret", label: "Secret" },
  ];

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: T.sans }}>
      {/* Stats row */}
      <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, color: T.emerald, background: T.emeraldDim }}>{activeNodes} active</span>
        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, color: T.rose, background: T.roseDim }}>{lockedNodes} locked</span>
        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, color: T.violet, background: T.violetDim }}>⚡ {avgStrength}%</span>
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-1 px-2 py-1.5 flex-wrap" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
        {types.map(t => {
          const col = t.id === "all" ? T.textTertiary : vaultTypeColors[t.id as VaultNode["type"]];
          return (
            <button key={t.id} onClick={() => setSelectedType(t.id as typeof selectedType)}
              className="px-1.5 py-0.5 rounded transition-all"
              style={{ fontSize: 9, fontWeight: selectedType === t.id ? 700 : 500, color: selectedType === t.id ? col : T.textDim, background: selectedType === t.id ? `${col}14` : "transparent", border: `1px solid ${selectedType === t.id ? `${col}30` : "transparent"}` }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(node => {
          const isSel = selectedId === node.id;
          const tc = vaultTypeColors[node.type];
          const sc = vaultStatusColors[node.status];
          const NodeIcon = vaultTypeIcons[node.type];
          return (
            <motion.div key={node.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-start gap-2 px-3 py-2 cursor-pointer transition-colors"
              style={{
                background: isSel ? `${tc}09` : "transparent",
                borderLeft: `2px solid ${isSel ? tc : "transparent"}`,
                opacity: node.status === "locked" ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = T.bgHover; }}
              onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
              onClick={() => {
                setSelectedId(node.id);
                if (node.status === "locked") toast.error("Node locked — requires higher clearance tier");
                else toast.success(`${node.label} — ${node.description}`);
              }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${tc}12`, border: `1px solid ${tc}20` }}>
                {node.status === "locked" ? <Lock size={11} color={T.rose} /> : <NodeIcon size={11} color={tc} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="truncate" style={{ fontSize: 11, color: isSel ? T.textPrimary : T.textSecondary, fontWeight: isSel ? 700 : 500 }}>{node.label}</span>
                  <span style={{ fontSize: 8, fontFamily: T.mono, color: tc }}>T{node.tier}</span>
                </div>
                {node.strength > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 max-w-[60px] h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="h-full rounded-full" style={{ width: `${node.strength}%`, background: `linear-gradient(90deg, ${tc}, ${tc}80)` }} />
                    </div>
                    <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textDim }}>{node.strength}%</span>
                  </div>
                )}
              </div>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: sc, boxShadow: `0 0 4px ${sc}50` }} />
            </motion.div>
          );
        })}
      </div>

      {/* Vault metrics */}
      <div style={{ borderTop: `1px solid ${T.border}` }}>
        <button className="w-full flex items-center gap-2 px-3 py-2 transition-colors hover:bg-white/3"
          onClick={() => setMetricsOpen(p => !p)}>
          {metricsOpen ? <ChevronDown size={10} color={T.textMuted} /> : <ChevronRight size={10} color={T.textMuted} />}
          <span className="uppercase tracking-widest" style={{ fontSize: 9, fontWeight: 700, color: T.textMuted }}>VAULT METRICS</span>
        </button>
        <AnimatePresence initial={false}>
          {metricsOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
              <div className="px-3 pb-3 space-y-1.5">
                {[
                  { label: "Total Nodes", value: `${vaultNodes.length}`, color: T.textPrimary },
                  { label: "Active Trades", value: "3", color: T.amber },
                  { label: "Encrypted Fragments", value: "847", color: T.violet },
                  { label: "Avg Signal Strength", value: `${avgStrength}%`, color: T.emerald },
                  { label: "Clearance Tier", value: "Tier 2", color: T.cyan },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span style={{ fontSize: 9, fontWeight: 700, color: T.textDim, letterSpacing: "0.06em", textTransform: "uppercase" }}>{row.label}</span>
                    <span style={{ fontSize: 10, fontFamily: T.mono, color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
