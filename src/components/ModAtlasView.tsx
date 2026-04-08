"use client";
import { useState, useMemo } from "react";
import {
  Search, Filter, ChevronDown, MoreHorizontal,
  Map, GitCommit, Clock, Activity, X,
  Layers, Package,
  type LucideIcon,
} from "lucide-react";
import { T } from "./robust/jpe-theme";
import { AreaChart, Area } from "recharts";
import { SafeChartContainer } from "./SafeChartContainer";
import {
  motion, StaggerList, StaggerItem,
} from "./jpe-motion";
import { toast } from "sonner";
import { useProjectStore } from "../stores/useProjectStore";


/* ═══ SPARKLINE GENERATOR ═══ */
function generateSparkline(seed: number, points = 24) {
  const data = [];
  let val = 50 + seed * 10;
  for (let i = 0; i < points; i++) {
    val += Math.sin(i * 0.5 + seed) * 8 + (Math.random() - 0.5) * 6;
    val = Math.max(10, Math.min(100, val));
    data.push({ t: i, v: val });
  }
  return data;
}

/* ═══ MOD DATA — Enhanced ═══ */
interface ModProject {
  id: string;
  name: string;
  version: string;
  build: string;
  icon: LucideIcon;
  iconColor: string;
  health: number;
  healthStatus: "GREEN" | "YELLOW" | "RED";
  totalChars: string;
  activeChars: string;
  commits: string;
  updated: string;
  sparkSeed: number;
  tags: string[];
  affectedFiles: number;
  category: string;
  latency: string;
}

/* ═══ HEALTH SPARKLINE ═══ */
function HealthSparkline({ seed, color }: { seed: number; color: string }) {
  const data = useMemo(() => generateSparkline(seed), [seed]);
  const gId = `spark-${seed}`;
  return (
    <div style={{ width: "100%", height: 30 }}>
      <SafeChartContainer>
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }} id={`ma-spark-${seed}`}>
          <defs key={`defs-${seed}`}>
            <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area key={`area-${seed}`} type="monotone" dataKey="v" stroke={color} fill={`url(#${gId})`} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </AreaChart>
      </SafeChartContainer>
    </div>
  );
}

/* ═══ HEALTH RING ═══ */
function HealthRing({ pct, color }: { pct: number; color: string }) {
  const size = 38; const r = 14;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={2.5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 4px ${color}50)` }} />
      </svg>
      <span style={{ fontSize: 8, fontFamily: T.mono, fontWeight: 700, color, position: "relative", zIndex: 1 }}>{pct}%</span>
    </div>
  );
}

/* ═══ MOD CARD — AAAA Production ═══ */
function ModCard({ mod, onClick }: { mod: ModProject; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const Icon = mod.icon;
  const healthColor = mod.health >= 95 ? T.emerald : mod.health >= 85 ? T.cyan : mod.health >= 70 ? T.amber : T.rose;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
      whileTap={{ scale: 0.985 }}
      className="relative rounded-[32px] overflow-hidden cursor-pointer group"
      style={{
        background: T.bgGlass,
        backdropFilter: T.glassBlur,
        WebkitBackdropFilter: T.glassBlur,
        border: `1px solid ${hovered ? T.borderActive : T.border}`,
        boxShadow: hovered
          ? `0 0 30px rgba(139,92,246,0.12), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`
          : `0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)`,
        transition: "border-color 0.3s, box-shadow 0.3s",
      } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: hovered ? `linear-gradient(90deg, transparent, ${T.violet}, ${T.cyan}, transparent)` : `linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)`, transition: "all 0.3s" }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ background: `${mod.iconColor}10`, border: `1px solid ${mod.iconColor}20`, boxShadow: hovered ? `0 0 12px ${mod.iconColor}20` : "none" }}>
              <Icon size={16} color={mod.iconColor} strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.04em" }}>{mod.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.cyan, fontWeight: 600 }}>{mod.version}</span>
                <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted, background: "rgba(255,255,255,0.03)", padding: "0 3px", borderRadius: 2 }}>{mod.category}</span>
              </div>
            </div>
          </div>
          <button className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5"
            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${mod.name} ${mod.version} — ${mod.category}`).then(() => toast.success("Mod info copied")).catch(() => {}); }}
            title="Copy mod info">
            <MoreHorizontal size={12} color={T.textTertiary} />
          </button>
        </div>

        {/* Build + Sync */}
        <div className="flex items-center justify-between mb-2.5">
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary }}>{mod.build}</span>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 8, color: T.textMuted, fontWeight: 600, letterSpacing: "0.06em" }}>LAST SYNC:</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.emerald, boxShadow: `0 0 4px ${T.emerald}60` }} />
              <span style={{ fontSize: 8, fontFamily: T.mono, color: T.emerald, fontWeight: 600 }}>GREEN</span>
            </div>
          </div>
        </div>

        {/* Health Monitor */}
        <div className="mb-2.5">
          <span style={{ fontSize: 8, fontWeight: 600, color: T.textTertiary, letterSpacing: "0.05em" }}>Dynamic Health Monitor: Graph</span>
          <div className="flex items-center gap-2.5 mt-1">
            <div className="flex-1"><HealthSparkline seed={mod.sparkSeed} color={healthColor} /></div>
            <div className="flex items-center gap-1.5">
              <HealthRing pct={mod.health} color={healthColor} />
              <span style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 700, color: healthColor }}>HEALTH</span>
            </div>
          </div>
        </div>

        <div className="h-px mb-2.5" style={{ background: T.border }} />

        {/* Stats */}
        <div className="mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span style={{ fontSize: 8, color: T.textTertiary }}>Total:</span>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.emerald, fontWeight: 600 }}>{mod.totalChars}</span>
            <span style={{ fontSize: 7, color: T.textMuted }}>NODE(S)</span>
            <span style={{ fontSize: 8, color: T.textMuted }}>/</span>
            <span style={{ fontSize: 8, color: T.textTertiary }}>Active:</span>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.cyanBright, fontWeight: 600 }}>{mod.activeChars}</span>
            <span style={{ fontSize: 7, color: T.textMuted }}>FILES</span>
          </div>
        </div>

        {/* Commit + Updated + Latency + Files */}
        <div className="flex items-center gap-3 mb-2.5 flex-wrap">
          <div className="flex items-center gap-1">
            <GitCommit size={8} color={T.textMuted} />
            <span style={{ fontSize: 8, color: T.textTertiary }}>Commit:</span>
            <span style={{ fontSize: 8, fontFamily: T.mono, color: T.violetBright }}>{mod.commits}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={8} color={T.textMuted} />
            <span style={{ fontSize: 8, color: T.textTertiary }}>Updated:</span>
            <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textSecondary }}>{mod.updated}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2.5">
          <div className="flex items-center gap-1">
            <Activity size={8} color={T.textMuted} />
            <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>{mod.latency} latency</span>
          </div>
          <div className="flex items-center gap-1">
            <Layers size={8} color={T.textMuted} />
            <span style={{ fontSize: 7, fontFamily: T.mono, color: T.textMuted }}>{mod.affectedFiles} files</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5">
          {mod.tags.map((tag) => {
            const isCancel = tag === "cancel";
            const isStart = tag === "start";
            return (
              <button key={tag} className="px-2 py-0.5 rounded transition-all"
                style={{
                  fontSize: 8, fontWeight: 600,
                  color: isCancel ? T.rose : isStart ? T.emerald : T.textSecondary,
                  background: isCancel ? "rgba(244,63,94,0.06)" : isStart ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isCancel ? "rgba(244,63,94,0.12)" : isStart ? "rgba(16,185,129,0.12)" : T.borderSubtle}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isCancel ? "rgba(244,63,94,0.12)" : isStart ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isCancel ? "rgba(244,63,94,0.06)" : isStart ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)"; }}>
                {isStart ? "▶ start" : isCancel ? "▶ cancel" : tag}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ FILTER PILL ═══ */
function FilterPill({ label, hasX = false, onClick }: { label: string; hasX?: boolean; onClick?: () => void }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
      style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}`, fontSize: 9, color: T.textSecondary }}
      onClick={onClick}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = T.borderActive; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = T.borderSubtle; }}>
      <span>{label}</span>
      {hasX && <X size={8} color={T.textMuted} />}
      <ChevronDown size={8} color={T.textMuted} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN MOD ATLAS VIEW — AAAA PRODUCTION
   ═══════════════════════════════════════════════════════════════ */
export function ModAtlasView() {
  const [searchQuery, setSearchQuery] = useState("");
  const { recentProjects, setCurrentProject } = useProjectStore();

  const mods: ModProject[] = useMemo(() => {
    return recentProjects.map((p, i) => ({
      id: p.id,
      name: p.name.toUpperCase(),
      version: p.metadata.version || "v1.0.0",
      build: `Build ${p.metadata.version || "1.0.0"}`,
      icon: Package,
      iconColor: i % 2 === 0 ? T.cyan : T.violet,
      health: 92 + (i % 8),
      healthStatus: "GREEN",
      totalChars: (p.files.length * 10).toString(),
      activeChars: p.files.length.toString(),
      commits: p.id.slice(0, 6),
      updated: new Date(p.metadata.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sparkSeed: i + 1,
      tags: ["Local", "Live"],
      affectedFiles: p.files.length,
      category: "Package",
      latency: "12ms",
    }));
  }, [recentProjects]);

  const filteredMods = useMemo(() => {
    if (!searchQuery) return mods;
    return mods.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, mods]);

  const totalActive = mods.reduce((acc, m) => acc + (m.health >= 85 ? 1 : 0), 0);

  return (
    <div className="flex flex-col h-full w-full" style={{ background: T.bg, fontFamily: T.sans, color: T.textPrimary }}>

      {/* ═══ HEADER BAR ═══ */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0 relative overflow-hidden" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: (T as any).noiseSvg }} />
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              `radial-gradient(ellipse at 20% 50%, ${T.cyan}06 0%, transparent 50%)`,
              `radial-gradient(ellipse at 80% 50%, ${T.violet}06 0%, transparent 50%)`,
              `radial-gradient(ellipse at 20% 50%, ${T.cyan}06 0%, transparent 50%)`,
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${T.violet}20, ${T.cyan}20)`, border: `1px solid ${T.violet}30` }}>
              <Map size={13} color={T.violet} />
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.02em" }}>MOD ATLAS</span>
              <span style={{ fontSize: 9, color: T.textTertiary, marginLeft: 8, letterSpacing: "0.04em" }}>/ PROJECT REGISTRY</span>
            </div>
          </div>
          <div className="w-px h-5" style={{ background: T.border }} />
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}`, minWidth: 180 }}>
            <Search size={11} color={T.textMuted} />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search"
              className="bg-transparent outline-none flex-1" style={{ fontSize: 10, color: T.textPrimary, fontFamily: T.sans }} />
          </div>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.borderSubtle}`, fontSize: 9, color: T.textSecondary }}
            onClick={() => setSearchQuery("")}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = T.borderActive; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = T.borderSubtle; }}>
            <Filter size={9} /> Filters
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: "rgba(16,185,129,0.06)", border: `1px solid rgba(16,185,129,0.12)` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.emerald, boxShadow: `0 0 4px ${T.emerald}` }} />
            <span style={{ fontSize: 8, fontFamily: T.mono, color: T.emerald, fontWeight: 600 }}>Status L2D</span>
          </div>
          <div className="w-px h-4" style={{ background: T.border }} />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.violet}, ${T.cyan})` }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: "#fff" }}>DEV</span>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, color: T.textPrimary }}>Mod Developer</div>
              <div style={{ fontSize: 7, color: T.textTertiary }}>Core Contributor</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FILTER + STATS ═══ */}
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2">
          <FilterPill label="All by..." hasX />
          <FilterPill label="Filters" hasX />
        </div>
        <div className="flex items-center gap-2">
          <FilterPill label="Holographic" />
          <FilterPill label="Status Status" />
        </div>
      </div>

      <div className="flex items-center gap-5 px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
        {[
          { label: "REGISTRY", value: `${mods.length} mods`, color: T.violet },
          { label: "HEALTHY", value: `${totalActive}/${mods.length}`, color: T.emerald },
          { label: "TOTAL NODES", value: mods.reduce((acc, m) => acc + parseInt(m.totalChars), 0).toString(), color: T.cyan },
          { label: "SYNCED", value: "100%", color: T.emerald },
          { label: "BUILDS", value: "Verified", color: T.amber },
          { label: "LATENCY", value: "12ms", color: T.cyanBright },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full" style={{ background: s.color }} />
            <span style={{ fontSize: 8, fontWeight: 800, color: T.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{s.label}</span>
            <span style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 600, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ═══ GRID ═══ */}
      <div className="flex-1 overflow-y-auto p-4 relative min-h-0">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: (T as any).noiseSvg }} />
        {/* Animated holographic background */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          animate={{
            background: [
              `radial-gradient(ellipse at 30% 20%, ${T.cyan}08 0%, transparent 50%)`,
              `radial-gradient(ellipse at 70% 80%, ${T.violet}08 0%, transparent 50%)`,
              `radial-gradient(ellipse at 30% 20%, ${T.cyan}08 0%, transparent 50%)`,
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <div className="relative z-10">
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMods.map((mod) => (
              <StaggerItem key={mod.id}>
                <ModCard mod={mod} onClick={() => {
                  const project = recentProjects.find(p => p.id === mod.id);
                  if (project) setCurrentProject(project);
                  toast.success(`Loaded Unit: ${mod.name}`);
                }} />
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className="flex items-center justify-between px-4 py-1 flex-shrink-0" style={{ borderTop: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.emerald, boxShadow: `0 0 4px ${T.emerald}` }} />
            <span style={{ fontSize: 8, fontFamily: T.mono, color: T.emerald }}>REGISTRY ONLINE</span>
          </div>
          <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>│</span>
          <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>{mods.length} projects loaded</span>
          <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>│</span>
          <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>Dashboard / Grid View</span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>Mod Atlas v1.4.0</span>
          <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>│</span>
          <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textTertiary }}>CF-REGISTRY</span>
        </div>
      </div>
    </div>
  );
}

export default ModAtlasView;
