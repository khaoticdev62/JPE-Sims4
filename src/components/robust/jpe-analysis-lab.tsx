"use client";
import { useState, useRef, useEffect, useCallback, useMemo, Fragment } from "react";
import {
  BarChart3, Activity, Network, Zap, GitBranch,
  Heart, Star, TrendingUp, Database,
  RefreshCw, Hash, Cpu, AlertTriangle, CheckCircle2,
  Sparkles,
  type LucideIcon} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  AreaChart, Area, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, CartesianGrid} from "recharts";
import { SafeChartContainer } from "../SafeChartContainer";
import { T } from "./jpe-theme";
import { Eyebrow, GlowDot, Badge, IconBtn } from "./jpe-shared";

/* ═══ ANALYSIS LAB DATA ═══ */

const attributeFrequencyData = [
  { attr: "display_name", count: 847, category: "meta", pct: 100 },
  { attr: "description", count: 823, category: "meta", pct: 97 },
  { attr: "icon", count: 791, category: "meta", pct: 93 },
  { attr: "trait_type", count: 412, category: "declaration", pct: 49 },
  { attr: "buff_type", count: 387, category: "declaration", pct: 46 },
  { attr: "duration", count: 364, category: "modifier", pct: 43 },
  { attr: "autonomy_weight", count: 298, category: "modifier", pct: 35 },
  { attr: "test_globals", count: 276, category: "condition", pct: 33 },
  { attr: "outcome_actions", count: 254, category: "effect", pct: 30 },
  { attr: "conflicting_traits", count: 198, category: "modifier", pct: 23 },
  { attr: "ages", count: 187, category: "modifier", pct: 22 },
  { attr: "category", count: 176, category: "meta", pct: 21 },
  { attr: "loot_action", count: 165, category: "effect", pct: 19 },
  { attr: "buff_reason", count: 143, category: "declaration", pct: 17 },
  { attr: "target_tests", count: 132, category: "condition", pct: 16 },
  { attr: "skill_gain_mult", count: 98, category: "modifier", pct: 12 },
];

const categoryColors: Record<string, string> = {
  meta: T.textSecondary,
  declaration: T.cyan,
  modifier: T.violet,
  condition: T.amber,
  effect: T.emerald};

const interactionNodes = [
  { id: "hug_friend", label: "Friendly Hug", x: 320, y: 220, r: 28, type: "social" as const, connections: 6 },
  { id: "comfort_talk", label: "Comfort Talk", x: 180, y: 140, r: 22, type: "social" as const, connections: 4 },
  { id: "mean_prank", label: "Mean Prank", x: 520, y: 160, r: 20, type: "mean" as const, connections: 3 },
  { id: "cook_meal", label: "Cook Meal", x: 440, y: 340, r: 26, type: "object" as const, connections: 5 },
  { id: "repair_sink", label: "Repair Sink", x: 160, y: 320, r: 18, type: "object" as const, connections: 2 },
  { id: "play_chess", label: "Play Chess", x: 580, y: 280, r: 20, type: "fun" as const, connections: 3 },
  { id: "flirty_joke", label: "Flirty Joke", x: 280, y: 380, r: 22, type: "romantic" as const, connections: 4 },
  { id: "evil_laugh", label: "Evil Laugh", x: 500, y: 100, r: 16, type: "mischief" as const, connections: 2 },
  { id: "study_book", label: "Study Book", x: 100, y: 240, r: 18, type: "skill" as const, connections: 3 },
  { id: "group_meal", label: "Group Meal", x: 400, y: 200, r: 24, type: "social" as const, connections: 5 },
  { id: "garden_tend", label: "Garden Tend", x: 620, y: 180, r: 16, type: "object" as const, connections: 2 },
  { id: "meditate", label: "Meditate", x: 80, y: 380, r: 14, type: "skill" as const, connections: 1 },
];

const interactionEdges = [
  { from: "hug_friend", to: "comfort_talk", weight: 0.9 },
  { from: "hug_friend", to: "group_meal", weight: 0.7 },
  { from: "hug_friend", to: "flirty_joke", weight: 0.5 },
  { from: "comfort_talk", to: "study_book", weight: 0.4 },
  { from: "comfort_talk", to: "group_meal", weight: 0.6 },
  { from: "mean_prank", to: "evil_laugh", weight: 0.8 },
  { from: "cook_meal", to: "group_meal", weight: 0.9 },
  { from: "cook_meal", to: "repair_sink", weight: 0.3 },
  { from: "cook_meal", to: "garden_tend", weight: 0.5 },
  { from: "play_chess", to: "study_book", weight: 0.6 },
  { from: "play_chess", to: "group_meal", weight: 0.4 },
  { from: "flirty_joke", to: "group_meal", weight: 0.5 },
  { from: "flirty_joke", to: "comfort_talk", weight: 0.6 },
  { from: "study_book", to: "meditate", weight: 0.7 },
  { from: "hug_friend", to: "cook_meal", weight: 0.4 },
  { from: "mean_prank", to: "group_meal", weight: 0.2 },
];

const interactionTypeColors: Record<string, string> = {
  social: T.cyan,
  mean: T.rose,
  object: T.amber,
  fun: T.emerald,
  romantic: "#F687B3",
  mischief: T.violet,
  skill: T.cyanBright};

const buffTraitRelationships = [
  { trait: "Evil", buffs: ["Sinister Aura", "Evil Laugh", "Devious Plot"], sentiment: "negative", strength: 0.92 },
  { trait: "Hugger", buffs: ["Warm Presence", "Hug High", "Social Boost"], sentiment: "positive", strength: 0.88 },
  { trait: "Bookworm", buffs: ["Focused Read", "Literary Bliss", "Speed Reader"], sentiment: "positive", strength: 0.85 },
  { trait: "Mean", buffs: ["Bitter Glee", "Cruel Delight"], sentiment: "negative", strength: 0.78 },
  { trait: "Creative", buffs: ["Inspired Spark", "Muse Visit", "Flow State", "Creative Block"], sentiment: "mixed", strength: 0.91 },
  { trait: "Romantic", buffs: ["Flirty Vibes", "Love Struck", "Heartbroken"], sentiment: "mixed", strength: 0.86 },
  { trait: "Active", buffs: ["Runner's High", "Energized Boost"], sentiment: "positive", strength: 0.74 },
  { trait: "Loner", buffs: ["Solitude Peace", "Social Drain", "Alone Time"], sentiment: "mixed", strength: 0.82 },
];

const traitConflictMatrix = [
  { a: "Evil", b: "Good", type: "conflict" as const },
  { a: "Evil", b: "Childish", type: "conflict" as const },
  { a: "Hugger", b: "Distant", type: "conflict" as const },
  { a: "Hugger", b: "Mean", type: "conflict" as const },
  { a: "Bookworm", b: "Active", type: "synergy" as const },
  { a: "Creative", b: "Bookworm", type: "synergy" as const },
  { a: "Romantic", b: "Hugger", type: "synergy" as const },
  { a: "Mean", b: "Evil", type: "synergy" as const },
  { a: "Loner", b: "Hugger", type: "conflict" as const },
  { a: "Active", b: "Loner", type: "conflict" as const },
];

const tuningParamStats = [
  { name: "Traits", tunings: 412, strings: 1648, avgSize: "18.4 KB", coverage: 97, conflicts: 3, icon: Star, color: T.cyan },
  { name: "Buffs", tunings: 387, strings: 1161, avgSize: "8.2 KB", coverage: 94, conflicts: 1, icon: Heart, color: T.violet },
  { name: "Interactions", tunings: 298, strings: 1192, avgSize: "24.6 KB", coverage: 91, conflicts: 5, icon: Zap, color: T.emerald },
  { name: "Objects", tunings: 176, strings: 528, avgSize: "32.1 KB", coverage: 88, conflicts: 2, icon: Database, color: T.amber },
  { name: "Careers", tunings: 86, strings: 688, avgSize: "45.8 KB", coverage: 92, conflicts: 0, icon: TrendingUp, color: T.cyanBright },
  { name: "Skills", tunings: 42, strings: 168, avgSize: "12.7 KB", coverage: 100, conflicts: 0, icon: Activity, color: T.violetBright },
];

const radarData = [
  { axis: "Traits", value: 92, fullMark: 100 },
  { axis: "Buffs", value: 87, fullMark: 100 },
  { axis: "Interactions", value: 78, fullMark: 100 },
  { axis: "Objects", value: 65, fullMark: 100 },
  { axis: "Careers", value: 94, fullMark: 100 },
  { axis: "Skills", value: 100, fullMark: 100 },
  { axis: "Recipes", value: 71, fullMark: 100 },
  { axis: "Situations", value: 56, fullMark: 100 },
];

const timelineData = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  traits: 380 + Math.floor(Math.sin(i * 0.3) * 15 + i * 1.1),
  buffs: 350 + Math.floor(Math.cos(i * 0.25) * 12 + i * 1.3),
  interactions: 260 + Math.floor(Math.sin(i * 0.35 + 1) * 18 + i * 1.5),
  conflicts: Math.max(0, Math.floor(8 - i * 0.2 + Math.sin(i * 0.5) * 3))}));

const heatmapData = [
  ["Traits", "Buffs", "Interactions", "Objects", "Careers", "Skills"],
  [1.0, 0.87, 0.62, 0.31, 0.45, 0.28],
  [0.87, 1.0, 0.74, 0.19, 0.33, 0.41],
  [0.62, 0.74, 1.0, 0.56, 0.68, 0.52],
  [0.31, 0.19, 0.56, 1.0, 0.22, 0.15],
  [0.45, 0.33, 0.68, 0.22, 1.0, 0.71],
  [0.28, 0.41, 0.52, 0.15, 0.71, 1.0],
];

/* ═══ SUB-COMPONENTS ═══ */

function LabPanelHeader({ title, icon: Icon, iconColor, subtitle, actions }: {
  title: string; icon: LucideIcon; iconColor: string; subtitle?: string; actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}12`, border: `1px solid ${iconColor}20` }}>
          <Icon size={13} color={iconColor} />
        </div>
        <div>
          <Eyebrow color={T.textPrimary}>{title}</Eyebrow>
          {subtitle && <div style={{ fontSize: 10, color: T.textMuted, fontFamily: T.mono, marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}

function _MiniStatCard({ label, value, color, icon: Icon, sub }: {
  label: string; value: string; color: string; icon: LucideIcon; sub?: string;
}) {
  return (
    <div className="rounded-xl p-3 relative overflow-hidden group" style={{ background: T.bgGlass, border: `1px solid ${T.border}` }}>
      <div className="absolute top-0 left-3 right-3 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}18, transparent)` }} />
      <div className="flex items-center justify-between mb-1.5">
        <Eyebrow>{label}</Eyebrow>
        <Icon size={11} color={color} style={{ opacity: 0.6 }} />
      </div>
      <div style={{ fontSize: 20, fontFamily: T.mono, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: T.textMuted, fontFamily: T.mono, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/* ═══ ATTRIBUTE FREQUENCY PANEL ═══ */

function AttributeFrequencyPanel() {
  const [sortBy, setSortBy] = useState<"count" | "alpha">("count");
  const [filterCat, setFilterCat] = useState("all");
  const cats = ["all", "meta", "declaration", "modifier", "condition", "effect"];

  const sorted = useMemo(() => {
    let d = [...attributeFrequencyData];
    if (filterCat !== "all") d = d.filter(a => a.category === filterCat);
    if (sortBy === "alpha") d.sort((a, b) => a.attr.localeCompare(b.attr));
    return d;
  }, [sortBy, filterCat]);

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      <LabPanelHeader
        title="ATTRIBUTE FREQUENCY"
        icon={BarChart3}
        iconColor={T.cyan}
        subtitle={`${attributeFrequencyData.length} attributes across 847 tuning nodes`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${T.border}` }}>
              {cats.map(c => (
                <button key={c} onClick={() => setFilterCat(c)}
                  className="px-2 py-0.5 rounded-md transition-all"
                  style={{
                    fontSize: 9, fontFamily: T.mono, fontWeight: 600,
                    color: filterCat === c ? (c === "all" ? T.textPrimary : categoryColors[c]) : T.textMuted,
                    background: filterCat === c ? `${c === "all" ? T.cyan : categoryColors[c]}12` : "transparent"}}
                >{c.toUpperCase()}</button>
              ))}
            </div>
            <IconBtn icon={sortBy === "count" ? TrendingUp : Hash} color={T.textTertiary} title="Toggle sort"
              onClick={() => setSortBy(s => s === "count" ? "alpha" : "count")} />
          </div>
        }
      />
      <div className="flex-1 flex min-h-0">
        {/* Bar chart */}
        <div className="flex-1 p-3">
          <SafeChartContainer>
            <BarChart data={sorted} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
               <defs key="attrfreq-defs" />
               <XAxis key="attrfreq-x" type="number" hide domain={[0, 900]} />
               <YAxis key="attrfreq-y" type="category" dataKey="attr" width={110}
                 tick={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fill: T.textSecondary }}
                 axisLine={false} tickLine={false} />
               <Tooltip key="attrfreq-tooltip"
                 contentStyle={{ background: T.bgPanel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: T.textPrimary }}
                 cursor={{ fill: "rgba(255,255,255,0.02)" }}
                 formatter={(v: any, _n: any, p: any) => [`${v} occurrences (${p.payload.pct}%)`, "Count"]}
               />
               <Bar key="attrfreq-bar" dataKey="count" radius={[0, 6, 6, 0]} barSize={14} isAnimationActive={false} minPointSize={0}>
                 {sorted.map((entry, i) => (
                   <Cell key={i} fill={categoryColors[entry.category] || T.cyan} fillOpacity={0.7} />
                 ))}
               </Bar>
            </BarChart>
          </SafeChartContainer>
        </div>
        {/* Right sidebar stats */}
        <div className="w-48 flex-shrink-0 overflow-y-auto p-3 space-y-2" style={{ borderLeft: `1px solid ${T.border}` }}>
          <Eyebrow color={T.textMuted}>DISTRIBUTION</Eyebrow>
          {Object.entries(categoryColors).map(([cat, color]) => {
            const count = attributeFrequencyData.filter(a => a.category === cat).length;
            const total = attributeFrequencyData.reduce((s, a) => s + (a.category === cat ? a.count : 0), 0);
            return (
              <div key={cat} className="rounded-lg p-2" style={{ background: `${color}08`, border: `1px solid ${color}12` }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color, textTransform: "uppercase" }}>{cat}</span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>{count} attrs</span>
                </div>
                <div style={{ fontSize: 14, fontFamily: T.mono, fontWeight: 700, color, marginTop: 2 }}>{total.toLocaleString()}</div>
                <div className="w-full h-1 rounded-full mt-1.5" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(total / 847) * 100}%`, background: color, boxShadow: `0 0 4px ${color}40` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══ INTERACTION NETWORK MAP ═══ */

function InteractionNetworkPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>("hug_friend");
  const animRef = useRef(0);

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const scaleX = w / 700;
    const scaleY = h / 440;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.015)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // Edges
    interactionEdges.forEach(edge => {
      const fromNode = interactionNodes.find(n => n.id === edge.from);
      const toNode = interactionNodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return;

      const isHl = hoveredNode === edge.from || hoveredNode === edge.to ||
                   selectedNode === edge.from || selectedNode === edge.to;

      const x1 = fromNode.x * scaleX;
      const y1 = fromNode.y * scaleY;
      const x2 = toNode.x * scaleX;
      const y2 = toNode.y * scaleY;

      ctx.beginPath();
      const cpx = (x1 + x2) / 2 + (y2 - y1) * 0.15;
      const cpy = (y1 + y2) / 2 - (x2 - x1) * 0.15;
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cpx, cpy, x2, y2);
      ctx.strokeStyle = isHl ? `rgba(99,179,237,${0.4 + Math.sin(time * 0.003) * 0.1})` : `rgba(255,255,255,${0.04 + edge.weight * 0.04})`;
      ctx.lineWidth = isHl ? 2 : 1;
      ctx.stroke();

      // Flow particle
      if (isHl) {
        const t = ((time * 0.0008 * edge.weight) % 1);
        const px = x1 * (1 - t) * (1 - t) + 2 * cpx * t * (1 - t) + x2 * t * t;
        const py = y1 * (1 - t) * (1 - t) + 2 * cpy * t * (1 - t) + y2 * t * t;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = T.cyan;
        ctx.shadowColor = T.cyan;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Nodes
    interactionNodes.forEach(node => {
      const nx = node.x * scaleX;
      const ny = node.y * scaleY;
      const nr = node.r * Math.min(scaleX, scaleY) * 0.85;
      const color = interactionTypeColors[node.type] || T.cyan;
      const isHl = hoveredNode === node.id || selectedNode === node.id;
      const pulse = isHl ? 1 + Math.sin(time * 0.004) * 0.08 : 1;

      // Glow
      if (isHl) {
        const grad = ctx.createRadialGradient(nx, ny, nr * 0.5, nx, ny, nr * 3);
        grad.addColorStop(0, `${color}25`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(nx, ny, nr * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Body
      ctx.beginPath();
      ctx.arc(nx, ny, nr * pulse, 0, Math.PI * 2);
      ctx.fillStyle = isHl ? `${color}30` : `${color}15`;
      ctx.fill();
      ctx.strokeStyle = isHl ? `${color}90` : `${color}40`;
      ctx.lineWidth = isHl ? 2 : 1;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(nx, ny, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.font = `${isHl ? 600 : 400} ${isHl ? 11 : 10}px 'JetBrains Mono', monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = isHl ? T.textPrimary : T.textSecondary;
      ctx.fillText(node.label, nx, ny + nr + 14);
    });

    animRef.current = requestAnimationFrame(draw);
  }, [hoveredNode, selectedNode]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const handleCanvasMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const scaleX = container.clientWidth / 700;
    const scaleY = container.clientHeight / 440;

    let found: string | null = null;
    for (const node of interactionNodes) {
      const nx = node.x * scaleX;
      const ny = node.y * scaleY;
      const dist = Math.sqrt((mx - nx) ** 2 + (my - ny) ** 2);
      if (dist < node.r * Math.min(scaleX, scaleY)) {
        found = node.id;
        break;
      }
    }
    setHoveredNode(found);
  }, []);

  const handleCanvasClick = useCallback((_e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode) setSelectedNode(hoveredNode);
  }, [hoveredNode]);

  const selNode = interactionNodes.find(n => n.id === selectedNode);
  const selEdges = interactionEdges.filter(e => e.from === selectedNode || e.to === selectedNode);

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      <LabPanelHeader
        title="INTERACTION NETWORK MAP"
        icon={Network}
        iconColor={T.emerald}
        subtitle={`${interactionNodes.length} nodes, ${interactionEdges.length} edges`}
        actions={
          <div className="flex items-center gap-2">
            {Object.entries(interactionTypeColors).slice(0, 5).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, textTransform: "uppercase" }}>{type}</span>
              </div>
            ))}
          </div>
        }
      />
      <div className="flex-1 flex min-h-0">
        <div ref={containerRef} className="flex-1 relative" style={{ cursor: hoveredNode ? "pointer" : "crosshair" }}>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            onMouseMove={handleCanvasMove}
            onClick={handleCanvasClick}
            onMouseLeave={() => setHoveredNode(null)}
          />
        </div>
        {/* Detail sidebar */}
        <div className="w-52 flex-shrink-0 overflow-y-auto p-3 space-y-3" style={{ borderLeft: `1px solid ${T.border}` }}>
          {selNode ? (
            <>
              <div>
                <Eyebrow color={interactionTypeColors[selNode.type]}>{selNode.type.toUpperCase()}</Eyebrow>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, marginTop: 4 }}>{selNode.label}</div>
                <div style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, marginTop: 2 }}>ID: {selNode.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2" style={{ background: T.bgGlass, border: `1px solid ${T.border}` }}>
                  <Eyebrow>CONNECTIONS</Eyebrow>
                  <div style={{ fontSize: 16, fontFamily: T.mono, fontWeight: 700, color: T.cyan }}>{selNode.connections}</div>
                </div>
                <div className="rounded-lg p-2" style={{ background: T.bgGlass, border: `1px solid ${T.border}` }}>
                  <Eyebrow>EDGES</Eyebrow>
                  <div style={{ fontSize: 16, fontFamily: T.mono, fontWeight: 700, color: T.violet }}>{selEdges.length}</div>
                </div>
              </div>
              <div>
                <Eyebrow color={T.textMuted}>CONNECTED TO</Eyebrow>
                <div className="mt-1.5 space-y-1">
                  {selEdges.map((e, i) => {
                    const other = e.from === selectedNode ? e.to : e.from;
                    const otherNode = interactionNodes.find(n => n.id === other);
                    return (
                      <button key={i} onClick={() => setSelectedNode(other)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/5"
                        style={{ border: `1px solid ${T.border}` }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: interactionTypeColors[otherNode?.type || "social"] }} />
                        <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary, flex: 1, textAlign: "left" }}>{otherNode?.label}</span>
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{(e.weight * 100).toFixed(0)}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <Network size={24} color={T.textMuted} />
              <span style={{ fontSize: 10, color: T.textMuted, marginTop: 8 }}>Click a node</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ BUFF/TRAIT RELATIONSHIPS ═══ */

function BuffTraitRelPanel() {
  const [selectedTrait, setSelectedTrait] = useState("Evil");
  const _sel = buffTraitRelationships.find(r => r.trait === selectedTrait);

  const sentimentColor = (s: string) => s === "positive" ? T.emerald : s === "negative" ? T.rose : T.amber;

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      <LabPanelHeader
        title="BUFF / TRAIT RELATIONSHIPS"
        icon={GitBranch}
        iconColor={T.violet}
        subtitle={`${buffTraitRelationships.length} traits, ${buffTraitRelationships.reduce((s, r) => s + r.buffs.length, 0)} buff connections`}
      />
      <div className="flex-1 flex min-h-0">
        {/* Left: Relationship view */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {buffTraitRelationships.map(rel => {
              const isActive = rel.trait === selectedTrait;
              const sColor = sentimentColor(rel.sentiment);
              return (
                <button key={rel.trait} onClick={() => setSelectedTrait(rel.trait)}
                  className="w-full rounded-xl p-3 transition-all text-left"
                  style={{
                    background: isActive ? `${sColor}08` : T.bgGlass,
                    border: `1px solid ${isActive ? `${sColor}30` : T.border}`,
                    boxShadow: isActive ? `0 0 12px ${sColor}10` : "none"}}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star size={12} color={T.cyan} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{rel.trait}</span>
                      <Badge color={sColor} bg={`${sColor}15`}>{rel.sentiment.toUpperCase()}</Badge>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: T.mono, color: sColor, fontWeight: 700 }}>
                      {(rel.strength * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rel.buffs.map(buff => (
                      <span key={buff} className="px-2 py-0.5 rounded-md" style={{
                        fontSize: 10, fontFamily: T.mono, color: T.violet, background: T.violetDim,
                        border: `1px solid rgba(139,92,246,0.15)`}}>{buff}</span>
                    ))}
                  </div>
                  {/* Strength bar */}
                  <div className="w-full h-1 rounded-full mt-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${rel.strength * 100}%`,
                      background: `linear-gradient(90deg, ${T.violet}, ${sColor})`,
                      boxShadow: `0 0 4px ${sColor}30`}} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {/* Right: Conflict matrix & radar */}
        <div className="w-64 flex-shrink-0 flex flex-col" style={{ borderLeft: `1px solid ${T.border}` }}>
          <div className="p-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
            <Eyebrow color={T.textMuted}>CONFLICT / SYNERGY MATRIX</Eyebrow>
            <div className="mt-2 space-y-1">
              {traitConflictMatrix.map((pair, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{ background: pair.type === "conflict" ? T.roseDim : T.emeraldDim }}>
                  <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary, width: 60 }}>{pair.a}</span>
                  <span style={{ fontSize: 10, color: pair.type === "conflict" ? T.rose : T.emerald }}>
                    {pair.type === "conflict" ? "✕" : "✓"}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary }}>{pair.b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-3 flex items-center justify-center">
            <SafeChartContainer style={{ height: 200 }}>
              <RadarChart data={radarData}>
                <defs key="radar-defs" />
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: T.textMuted }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke={T.cyan} fill={T.cyan} fillOpacity={0.12} strokeWidth={1.5} isAnimationActive={false} />
              </RadarChart>
            </SafeChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ TUNING PARAMETER STATISTICS ═══ */

function TuningStatsPanel() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); };
  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      <LabPanelHeader
        title="TUNING PARAMETER STATISTICS"
        icon={Cpu}
        iconColor={T.cyanBright}
        subtitle="1,401 tuning resources | 4,265 string entries | 11 conflicts"
        actions={<IconBtn icon={RefreshCw} color={refreshing ? T.cyan : T.textTertiary} title="Refresh stats" onClick={handleRefresh} />}
      />
      <div className="flex-1 flex min-h-0">
        {/* Left: Stats cards & timeline */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Stat cards grid */}
          <div className="grid grid-cols-3 gap-2">
            {tuningParamStats.map(s => (
              <div key={s.name} className="rounded-xl p-3 relative overflow-hidden" style={{ background: T.bgGlass, border: `1px solid ${T.border}` }}>
                <div className="absolute top-0 left-3 right-3 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}15, transparent)` }} />
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={12} color={s.color} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: s.color }}>{s.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  <div>
                    <span style={{ fontSize: 9, color: T.textMuted }}>Tunings</span>
                    <div style={{ fontSize: 14, fontFamily: T.mono, fontWeight: 700, color: T.textPrimary }}>{s.tunings}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 9, color: T.textMuted }}>Strings</span>
                    <div style={{ fontSize: 14, fontFamily: T.mono, fontWeight: 700, color: T.textPrimary }}>{s.strings.toLocaleString()}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 9, color: T.textMuted }}>Avg Size</span>
                    <div style={{ fontSize: 11, fontFamily: T.mono, color: T.textSecondary }}>{s.avgSize}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 9, color: T.textMuted }}>Coverage</span>
                    <div style={{ fontSize: 11, fontFamily: T.mono, color: s.coverage >= 95 ? T.emerald : s.coverage >= 85 ? T.amber : T.rose }}>{s.coverage}%</div>
                  </div>
                </div>
                {s.conflicts > 0 && (
                  <div className="flex items-center gap-1 mt-2 px-1.5 py-0.5 rounded" style={{ background: T.roseDim }}>
                    <AlertTriangle size={9} color={T.rose} />
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.rose }}>{s.conflicts} conflicts</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Timeline chart */}
          <div className="rounded-xl p-3" style={{ background: T.bgGlass, border: `1px solid ${T.border}` }}>
            <div className="flex items-center justify-between mb-2">
              <Eyebrow>TUNING GROWTH TIMELINE</Eyebrow>
              <div className="flex items-center gap-3">
                {[{ label: "Traits", color: T.cyan }, { label: "Buffs", color: T.violet }, { label: "Interactions", color: T.emerald }].map(l => (
                  <div key={l.label} className="flex items-center gap-1">
                    <div className="w-2 h-1 rounded-full" style={{ background: l.color }} />
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <SafeChartContainer style={{ height: 140 }}>
              <AreaChart data={timelineData}>
                <defs key="timeline-defs" />
                <CartesianGrid key="tl-grid" stroke="rgba(255,255,255,0.03)" strokeDasharray="2 4" />
                <XAxis key="tl-xaxis" dataKey="day" tick={{ fontSize: 9, fill: T.textMuted }} axisLine={false} tickLine={false} interval={4} />
                <YAxis key="tl-yaxis" hide domain={["auto", "auto"]} />
                <Tooltip key="tl-tooltip"
                  contentStyle={{ background: T.bgPanel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: T.textPrimary }}
                />
                <Area key="tl-traits" type="monotone" dataKey="traits" stroke={T.cyan} fill={T.cyan} fillOpacity={0.08} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Area key="tl-buffs" type="monotone" dataKey="buffs" stroke={T.violet} fill={T.violet} fillOpacity={0.06} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Area key="tl-interactions" type="monotone" dataKey="interactions" stroke={T.emerald} fill={T.emerald} fillOpacity={0.06} strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </AreaChart>
            </SafeChartContainer>
          </div>
        </div>

        {/* Right: Correlation heatmap */}
        <div className="w-56 flex-shrink-0 p-3 flex flex-col" style={{ borderLeft: `1px solid ${T.border}` }}>
          <Eyebrow color={T.textMuted}>CORRELATION HEATMAP</Eyebrow>
          <div className="mt-2 flex-1 flex flex-col justify-center">
            <div className="grid gap-px" style={{ gridTemplateColumns: `28px repeat(6, 1fr)` }}>
              {/* Header row */}
              <div />
              {(heatmapData[0] as string[]).map((h, i) => (
                <div key={i} className="flex items-end justify-center pb-1" style={{ height: 28 }}>
                  <span style={{ fontSize: 7, color: T.textMuted, fontFamily: T.mono, transform: "rotate(-45deg)", transformOrigin: "center", whiteSpace: "nowrap" }}>{h}</span>
                </div>
              ))}
              {/* Data rows */}
              {(heatmapData[0] as string[]).map((rowLabel, ri) => (
                <Fragment key={`row-${ri}`}>
                  <div className="flex items-center justify-end pr-1" style={{ height: 24 }}>
                    <span style={{ fontSize: 7, color: T.textMuted, fontFamily: T.mono }}>{rowLabel}</span>
                  </div>
                  {(heatmapData[ri + 1] as number[]).map((val, ci) => {
                    const intensity = val;
                    const color = ri === ci ? T.cyan : intensity > 0.6 ? T.violet : intensity > 0.3 ? T.amber : T.textMuted;
                    return (
                      <div key={`${ri}-${ci}`} className="rounded-sm flex items-center justify-center" style={{
                        height: 24,
                        background: `${color}${Math.floor(intensity * 25).toString(16).padStart(2, "0")}`,
                        border: `1px solid ${color}${Math.floor(intensity * 15).toString(16).padStart(2, "0")}`}}>
                        <span style={{ fontSize: 7, fontFamily: T.mono, color: `${color}cc` }}>{val.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="mt-3 flex items-center gap-1">
            <span style={{ fontSize: 8, color: T.textMuted }}>Low</span>
            <div className="flex-1 h-2 rounded-full" style={{ background: `linear-gradient(90deg, rgba(255,255,255,0.02), ${T.violet}40, ${T.cyan}60)` }} />
            <span style={{ fontSize: 8, color: T.textMuted }}>High</span>
          </div>
          {/* Conflict timeline mini */}
          <div className="mt-4">
            <Eyebrow color={T.textMuted}>CONFLICT TREND</Eyebrow>
            <SafeChartContainer style={{ height: 60 }}>
              <LineChart data={timelineData}>
                <defs key="conflicts-defs" />
                <Line key="conflicts-line" type="monotone" dataKey="conflicts" stroke={T.rose} strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </SafeChartContainer>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.emerald }}>-62% over 30d</span>
              <CheckCircle2 size={10} color={T.emerald} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ MAIN LAB COMPONENT ═══ */

type LabTab = "frequency" | "network" | "relationships" | "statistics";

const labTabs: { key: LabTab; label: string; icon: LucideIcon; color: string }[] = [
  { key: "frequency", label: "Attribute Frequency", icon: BarChart3, color: T.cyan },
  { key: "network", label: "Interaction Network", icon: Network, color: T.emerald },
  { key: "relationships", label: "Buff / Trait Map", icon: GitBranch, color: T.violet },
  { key: "statistics", label: "Tuning Statistics", icon: Cpu, color: T.cyanBright },
];

export function ModAnalysisLab() {
  const [activeTab, setActiveTab] = useState<LabTab>("frequency");
  const _current = labTabs.find(t => t.key === activeTab)!;

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${T.cyan}20, ${T.violet}20)`, border: `1px solid ${T.borderGlow}` }}>
            <Sparkles size={14} color={T.cyanBright} />
          </div>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.02em" }}>MOD ANALYSIS LAB</span>
            <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, marginLeft: 8 }}>v2.1.0</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 p-0.5 rounded-xl" style={{ background: T.bgInput, border: `1px solid ${T.border}` }}>
          {labTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative"
                style={{
                  fontSize: 11, fontWeight: isActive ? 600 : 400,
                  color: isActive ? T.textPrimary : T.textTertiary,
                  background: isActive ? `${tab.color}10` : "transparent",
                  border: isActive ? `1px solid ${tab.color}20` : "1px solid transparent"}}>
                {isActive && <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-full" style={{ background: `linear-gradient(90deg, ${tab.color}, ${tab.color}60)`, boxShadow: `0 0 6px ${tab.color}40` }} />}
                <Icon size={12} color={isActive ? tab.color : T.textMuted} />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          {/* Summary stats */}
          {[
            { label: "NODES", value: "1,401", color: T.cyan },
            { label: "EDGES", value: "3,214", color: T.violet },
            { label: "CONFLICTS", value: "11", color: T.rose },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <GlowDot color={s.color} />
              <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{s.label}</span>
              <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 min-h-0">
        {activeTab === "frequency" && <AttributeFrequencyPanel />}
        {activeTab === "network" && <InteractionNetworkPanel />}
        {activeTab === "relationships" && <BuffTraitRelPanel />}
        {activeTab === "statistics" && <TuningStatsPanel />}
      </div>
    </div>
  );
}
