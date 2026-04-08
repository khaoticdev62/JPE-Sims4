/* ─────────────────────────────────────────────────────────────
   JPE Studio — Phase 24 — DependencyGraph (standalone)
   Canvas-based interactive mod dependency graph with:
   • Pan + zoom + node drag
   • Animated pulse particles on edges
   • Node search + highlight
   • Filter: all / deps / conflicts / optional
   • Layout presets: organic / radial / hierarchy
   • Minimap overlay
   • Node detail inspector panel
   ───────────────────────────────────────────────────────────── */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Network, Search, X, Minus, Plus, Maximize2, Shield,
  GitMerge, AlertTriangle, CheckCircle2, Info, Layers,
  Package, Database, Map as MapIcon,
} from "lucide-react";
import { T } from "../pages/jpe-theme";
import { graphNodes, graphEdges, type GraphNode, type GraphEdge } from "../pages/jpe-data";
import { Eyebrow, Badge } from "../pages/jpe-shared";

/* ── Layout presets ─────────────────────────────────────────── */
type LayoutPreset = "organic" | "radial" | "hierarchy";

function applyLayout(nodes: GraphNode[], preset: LayoutPreset): GraphNode[] {
  const cx = 480, cy = 260;
  if (preset === "radial") {
    const sorted = [...nodes].sort((a, b) => {
      if (a.type === "primary") return -1;
      if (b.type === "primary") return 1;
      return 0;
    });
    return sorted.map((n, i) => {
      if (n.type === "primary") return { ...n, x: cx, y: cy };
      const typeGroup = { pack: 0, mod: 1, library: 2, conflict: 3 };
      const group = typeGroup[n.type as keyof typeof typeGroup] ?? 1;
      const radii = [150, 260, 340, 200];
      const r = radii[group];
      const sameType = sorted.filter(s => s.type === n.type);
      const tIdx = sameType.indexOf(n);
      const angleStep = (Math.PI * 2) / sameType.length;
      const baseAngle = group * (Math.PI / 2);
      const angle = baseAngle + tIdx * angleStep;
      return { ...n, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    });
  }
  if (preset === "hierarchy") {
    const tiers: Record<string, number> = { pack: 0, primary: 1, mod: 2, library: 2, conflict: 3 };
    const byTier: Record<number, GraphNode[]> = {};
    nodes.forEach(n => {
      const t = tiers[n.type] ?? 2;
      byTier[t] = byTier[t] ?? [];
      byTier[t].push(n);
    });
    const result: GraphNode[] = [];
    const tierYs = [80, 200, 320, 440];
    Object.entries(byTier).forEach(([tier, tierNodes]) => {
      const y = tierYs[parseInt(tier)] ?? 300;
      const totalW = 900;
      const spacing = totalW / (tierNodes.length + 1);
      tierNodes.forEach((n, i) => {
        result.push({ ...n, x: spacing * (i + 1), y });
      });
    });
    return result;
  }
  // organic = original positions
  return nodes.map(n => ({ ...n }));
}

/* ── Node status config ─────────────────────────────────────── */
const statusCfg = {
  ok:       { color: T.emerald, icon: CheckCircle2, label: "Compatible" },
  warning:  { color: T.amber,   icon: AlertTriangle, label: "Warning" },
  conflict: { color: T.rose,    icon: GitMerge,      label: "Conflict" },
  outdated: { color: T.violet,  icon: Info,          label: "Outdated" },
};

const typeCfg: Record<GraphNode["type"], { label: string; shortLabel: string }> = {
  primary:  { label: "Your Mod",  shortLabel: "Primary" },
  pack:     { label: "EA Pack",   shortLabel: "Pack"    },
  mod:      { label: "Third-party Mod", shortLabel: "Mod" },
  library:  { label: "Library",   shortLabel: "Lib"     },
  conflict: { label: "Conflicting Mod", shortLabel: "Conflict" },
};

/* ══ DependencyGraph ════════════════════════════════════════════ */
interface DependencyGraphProps {
  onSwitchToConflicts?: () => void;
  onSwitchToDiff?: () => void;
}

export function DependencyGraph({ onSwitchToConflicts, onSwitchToDiff }: DependencyGraphProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const minimapRef    = useRef<HTMLCanvasElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const animFrame     = useRef(0);
  const startTimeRef  = useRef(Date.now());

  const [zoom, setZoom]             = useState(1);
  const [pan, setPan]               = useState({ x: 0, y: 0 });
  const [dragging, setDragging]     = useState(false);
  const [dragStart, setDragStart]   = useState({ x: 0, y: 0 });
  const [dragNode, setDragNode]     = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>("your_mod");
  const [hoveredNode, setHoveredNode]   = useState<string | null>(null);
  const [nodes, setNodes]           = useState<GraphNode[]>(() => graphNodes.map(n => ({ ...n })));
  const [graphFilter, setGraphFilter]   = useState<"all" | "deps" | "conflicts" | "optional">("all");
  const [layout, setLayout]         = useState<LayoutPreset>("organic");
  const [search, setSearch]         = useState("");
  const [showMinimap, setShowMinimap]   = useState(true);
  const [showInspector, setShowInspector] = useState(true);

  /* Search highlights */
  const searchMatches = useMemo(() => {
    if (!search.trim()) return new Set<string>();
    const q = search.toLowerCase();
    return new Set(nodes.filter(n => n.label.toLowerCase().includes(q) || n.id.includes(q)).map(n => n.id));
  }, [search, nodes]);

  /* Apply layout preset */
  useEffect(() => {
    setNodes(applyLayout(graphNodes.map(n => ({ ...n })), layout));
  }, [layout]);

  /* Dep chain BFS */
  const depChain = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const chain = new Set([selectedNode]);
    const queue = [selectedNode];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const e of graphEdges) {
        if (e.from === cur && !chain.has(e.to))  { chain.add(e.to);   queue.push(e.to);   }
        if (e.to   === cur && !chain.has(e.from)) { chain.add(e.from); queue.push(e.from); }
      }
    }
    return chain;
  }, [selectedNode]);

  /* Visible edges */
  const visibleEdges = useMemo(() => {
    if (graphFilter === "deps")      return graphEdges.filter(e => e.type === "dependency");
    if (graphFilter === "conflicts") return graphEdges.filter(e => e.type === "conflict");
    if (graphFilter === "optional")  return graphEdges.filter(e => e.type === "optional");
    return graphEdges;
  }, [graphFilter]);

  /* ── Main canvas render ── */
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
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = (Date.now() - startTimeRef.current) / 1000;

      ctx.save();
      ctx.translate(pan.x + w / 2, pan.y + h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      /* Grid */
      ctx.strokeStyle = "rgba(255,255,255,0.012)";
      ctx.lineWidth = 1;
      for (let gx = -200; gx < w + 400; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, -200); ctx.lineTo(gx, h + 400); ctx.stroke(); }
      for (let gy = -200; gy < h + 400; gy += 40) { ctx.beginPath(); ctx.moveTo(-200, gy); ctx.lineTo(w + 400, gy); ctx.stroke(); }

      /* Edges */
      for (const edge of visibleEdges) {
        const fn = nodes.find(n => n.id === edge.from);
        const tn = nodes.find(n => n.id === edge.to);
        if (!fn || !tn) continue;

        const inChain   = selectedNode ? depChain.has(edge.from) && depChain.has(edge.to) : true;
        const hasSearch = searchMatches.size > 0;
        const inSearch  = hasSearch ? searchMatches.has(edge.from) || searchMatches.has(edge.to) : true;
        const alpha = (inChain && inSearch) ? (edge.type === "conflict" ? 0.8 : 0.6) : 0.05;

        const edgeColor =
          edge.type === "conflict" ? `rgba(252,129,129,${alpha})` :
          edge.type === "optional" ? `rgba(139,92,246,${alpha * 0.8})` :
                                     `rgba(99,179,237,${alpha})`;

        const dx = tn.x - fn.x, dy = tn.y - fn.y;
        const cx2 = (fn.x + tn.x) / 2 - dy * 0.15;
        const cy2 = (fn.y + tn.y) / 2 + dx * 0.15;

        ctx.beginPath();
        ctx.moveTo(fn.x, fn.y);
        ctx.quadraticCurveTo(cx2, cy2, tn.x, tn.y);
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = edge.type === "conflict" ? 2.5 : inChain ? 2 : 1;
        if (edge.type === "optional")  ctx.setLineDash([6, 4]);
        else if (edge.type === "conflict") ctx.setLineDash([3, 3]);
        else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);

        /* Pulse particles */
        if ((inChain || edge.type === "conflict") && alpha > 0.1) {
          const np = edge.type === "conflict" ? 3 : 2;
          for (let p = 0; p < np; p++) {
            const pr  = ((t * (edge.type === "conflict" ? 0.6 : 0.35) + p / np) % 1);
            const px2 = (1-pr)*(1-pr)*fn.x + 2*(1-pr)*pr*cx2 + pr*pr*tn.x;
            const py2 = (1-pr)*(1-pr)*fn.y + 2*(1-pr)*pr*cy2 + pr*pr*tn.y;
            const pa  = Math.sin(pr * Math.PI) * 0.9;
            const gr  = ctx.createRadialGradient(px2, py2, 0, px2, py2, 10);
            gr.addColorStop(0, edge.type === "conflict" ? `rgba(252,129,129,${pa*0.5})` : `rgba(99,179,237,${pa*0.4})`);
            gr.addColorStop(1, "transparent");
            ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(px2, py2, 10, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = edge.type === "conflict" ? `rgba(252,129,129,${pa})` : `rgba(99,179,237,${pa})`;
            ctx.beginPath(); ctx.arc(px2, py2, edge.type === "conflict" ? 3 : 2.5, 0, Math.PI*2); ctx.fill();
          }
        }

        /* Edge label */
        if (edge.label && (inChain || !selectedNode)) {
          ctx.font = `600 8px ${T.sans}`;
          ctx.textAlign = "center";
          const tm = ctx.measureText(edge.label);
          ctx.fillStyle = "rgba(7,8,16,0.85)";
          ctx.fillRect(cx2 - tm.width/2 - 4, cy2 - 9, tm.width + 8, 12);
          ctx.fillStyle = edge.type === "conflict" ? `rgba(252,129,129,${inChain ? 0.9 : 0.5})` : `rgba(160,174,192,${inChain ? 0.75 : 0.3})`;
          ctx.fillText(edge.label, cx2, cy2);
        }
      }

      /* Nodes */
      for (const node of nodes) {
        const inSearch  = searchMatches.size === 0 || searchMatches.has(node.id);
        const inChain   = !selectedNode || depChain.has(node.id);
        const isSel     = selectedNode === node.id;
        const isHov     = hoveredNode  === node.id;
        const isMatch   = searchMatches.has(node.id);
        const alpha     = (inChain && inSearch) ? 1 : 0.12;
        const r         = node.r;

        /* Glow for selected / hovered */
        if ((isSel || isHov || isMatch) && alpha > 0.5) {
          const gg = ctx.createRadialGradient(node.x, node.y, r, node.x, node.y, r * 3);
          gg.addColorStop(0, node.color + "30");
          gg.addColorStop(1, "transparent");
          ctx.fillStyle = gg;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        /* Pulse ring for primary / conflict */
        if ((node.type === "primary" || node.type === "conflict") && inChain && inSearch) {
          const pR = r + 6 + Math.sin(t * 2) * 3;
          const ra = Math.max(0, Math.min(255, Math.floor((Math.sin(t * 2) * 0.5 + 0.5) * 40)));
          ctx.strokeStyle = node.color + ra.toString(16).padStart(2, "0");
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, pR, 0, Math.PI * 2);
          ctx.stroke();
        }

        /* Search match ring */
        if (isMatch) {
          ctx.strokeStyle = `${node.color}90`;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        /* Shadow */
        const sg = ctx.createRadialGradient(node.x, node.y + 2, r * 0.5, node.x, node.y + 2, r * 1.5);
        sg.addColorStop(0, "rgba(0,0,0,0.3)");
        sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(node.x, node.y + 2, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        /* Body */
        const bg = ctx.createRadialGradient(node.x - r*0.3, node.y - r*0.3, 0, node.x, node.y, r);
        bg.addColorStop(0, "#1f2330");
        bg.addColorStop(1, "#0f1116");
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = isSel ? 3 : isHov ? 2.5 : 1.8;
        ctx.stroke();
        ctx.globalAlpha = 1;

        /* Label */
        ctx.globalAlpha = alpha;
        ctx.font = `700 ${Math.max(8, r * 0.38)}px ${T.sans}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = T.textPrimary;
        ctx.fillText(node.shortLabel, node.x, node.y - 2);
        ctx.font = `500 ${Math.max(6, r * 0.26)}px ${T.mono}`;
        ctx.fillStyle = T.textMuted;
        ctx.fillText(`v${node.version}`, node.x, node.y + r * 0.38);
        ctx.globalAlpha = 1;

        /* Status dot */
        const dotC = statusCfg[node.status].color;
        const dotX = node.x + r * 0.65, dotY = node.y - r * 0.65;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#0f1116";
        ctx.beginPath(); ctx.arc(dotX, dotY, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = dotC;
        ctx.beginPath(); ctx.arc(dotX, dotY, 3.5, 0, Math.PI * 2); ctx.fill();
        if (node.status === "conflict") {
          const ba = Math.max(0, Math.min(255, Math.floor((Math.sin(t * 4) * 0.5 + 0.5) * 60)));
          ctx.fillStyle = dotC + ba.toString(16).padStart(2, "0");
          ctx.beginPath(); ctx.arc(dotX, dotY, 6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      /* ── Minimap ── */
      const mm = minimapRef.current;
      if (mm && showMinimap) {
        const mmW = 160, mmH = 100, mmDpr = window.devicePixelRatio || 1;
        mm.width = mmW * mmDpr; mm.height = mmH * mmDpr;
        mm.style.width = `${mmW}px`; mm.style.height = `${mmH}px`;
        const mc = mm.getContext("2d");
        if (mc) {
          mc.setTransform(mmDpr, 0, 0, mmDpr, 0, 0);
          mc.clearRect(0, 0, mmW, mmH);
          mc.fillStyle = "rgba(7,8,16,0.9)";
          mc.fillRect(0, 0, mmW, mmH);
          mc.strokeStyle = "rgba(255,255,255,0.06)";
          mc.lineWidth = 1;
          mc.strokeRect(0, 0, mmW, mmH);

          const scaleX = mmW / 1000, scaleY = mmH / 520;
          for (const n of nodes) {
            const inChain = !selectedNode || depChain.has(n.id);
            mc.globalAlpha = inChain ? 0.9 : 0.2;
            mc.fillStyle = n.color;
            mc.beginPath();
            mc.arc(n.x * scaleX, n.y * scaleY, Math.max(3, n.r * scaleX * 1.2), 0, Math.PI * 2);
            mc.fill();
          }
          mc.globalAlpha = 1;

          /* Viewport rect */
          const vx = (-pan.x / zoom + w/2 - w/(2*zoom)) * scaleX;
          const vy = (-pan.y / zoom + h/2 - h/(2*zoom)) * scaleY;
          const vw = (w / zoom) * scaleX;
          const vh = (h / zoom) * scaleY;
          mc.strokeStyle = "rgba(99,179,237,0.5)";
          mc.lineWidth = 1;
          mc.strokeRect(vx, vy, vw, vh);
          mc.fillStyle = "rgba(99,179,237,0.05)";
          mc.fillRect(vx, vy, vw, vh);
        }
      }

      animFrame.current = requestAnimationFrame(render);
    };

    render();
    return () => { running = false; cancelAnimationFrame(animFrame.current); };
  }, [nodes, zoom, pan, selectedNode, hoveredNode, depChain, visibleEdges, searchMatches, showMinimap]);

  /* ── Interaction helpers ── */
  const screenToWorld = useCallback((sx: number, sy: number) => {
    const c = containerRef.current; if (!c) return { x: sx, y: sy };
    const rect = c.getBoundingClientRect();
    return {
      x: (sx - rect.left - pan.x - rect.width  / 2) / zoom + rect.width  / 2,
      y: (sy - rect.top  - pan.y - rect.height / 2) / zoom + rect.height / 2,
    };
  }, [zoom, pan]);

  const findNodeAt = useCallback((wx: number, wy: number) => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if ((wx - n.x) ** 2 + (wy - n.y) ** 2 <= n.r ** 2) return n;
    }
    return null;
  }, [nodes]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const w = screenToWorld(e.clientX, e.clientY);
    const node = findNodeAt(w.x, w.y);
    if (node) { setDragNode(node.id); setSelectedNode(node.id); }
    else setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [screenToWorld, findNodeAt]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const w = screenToWorld(e.clientX, e.clientY);
    setHoveredNode(findNodeAt(w.x, w.y)?.id ?? null);
    if (dragNode) {
      const dx = (e.clientX - dragStart.x) / zoom, dy = (e.clientY - dragStart.y) / zoom;
      setNodes(prev => prev.map(n => n.id === dragNode ? { ...n, x: n.x + dx, y: n.y + dy } : n));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (dragging) {
      setPan(prev => ({ x: prev.x + e.clientX - dragStart.x, y: prev.y + e.clientY - dragStart.y }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [screenToWorld, findNodeAt, dragNode, dragging, dragStart, zoom]);

  const handleMouseUp = useCallback(() => { setDragNode(null); setDragging(false); }, []);
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(p => Math.max(0.25, Math.min(3.5, p * (e.deltaY > 0 ? 0.92 : 1.08))));
  }, []);

  const sel = selectedNode ? nodes.find(n => n.id === selectedNode) : null;
  const selEdges = selectedNode ? graphEdges.filter(e => e.from === selectedNode || e.to === selectedNode) : [];

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div className="flex flex-col h-full" style={{ background: T.bgDeep }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
        <div className="flex items-center gap-3">
          <Network size={14} color={T.emerald} />
          <Eyebrow color={T.textPrimary}>MOD DEPENDENCY GRAPH</Eyebrow>
          <div className="w-px h-4" style={{ background: T.border }} />
          <Badge color={T.emerald} bg={T.emeraldDim}>{nodes.filter(n => n.status === "ok").length} OK</Badge>
          <Badge color={T.amber}   bg={T.amberDim}>{nodes.filter(n => n.status === "warning").length} Warn</Badge>
          <Badge color={T.rose}    bg={T.roseDim}>{nodes.filter(n => n.status === "conflict").length} Conflict</Badge>
          <div className="w-px h-4" style={{ background: T.border }} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{nodes.length} nodes · {graphEdges.length} edges</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Search */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg" style={{ background: T.bgInput, border: `1px solid ${search ? T.borderActive : T.borderSubtle}`, width: 180 }}>
            <Search size={10} color={search ? T.cyan : T.textMuted} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search nodes…"
              className="bg-transparent outline-none flex-1"
              style={{ fontSize: 10, color: T.textSecondary }}
            />
            {search && <button onClick={() => setSearch("")}><X size={9} color={T.textMuted} /></button>}
          </div>

          {/* Filter */}
          <div className="flex rounded-md overflow-hidden" style={{ border: `1px solid ${T.borderSubtle}` }}>
            {(["all", "deps", "conflicts", "optional"] as const).map(key => (
              <button key={key} onClick={() => setGraphFilter(key)}
                className="px-2.5 py-0.5 transition-colors"
                style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600,
                  color:      graphFilter === key ? (key === "conflicts" ? T.rose : key === "optional" ? T.violet : T.cyan) : T.textMuted,
                  background: graphFilter === key ? (key === "conflicts" ? T.roseDim : key === "optional" ? T.violetDim : T.cyanDim) : "transparent",
                }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          {/* Layout */}
          <div className="flex rounded-md overflow-hidden" style={{ border: `1px solid ${T.borderSubtle}` }}>
            {(["organic", "radial", "hierarchy"] as const).map(key => (
              <button key={key} onClick={() => setLayout(key)}
                className="px-2 py-0.5 transition-colors"
                style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 600,
                  color:      layout === key ? T.amber : T.textMuted,
                  background: layout === key ? T.amberDim : "transparent",
                }}>
                {key.slice(0, 4).toUpperCase()}
              </button>
            ))}
          </div>

          <div className="w-px h-4" style={{ background: T.border }} />

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/5 transition-colors" onClick={() => setZoom(p => Math.max(0.25, p / 1.2))}><Minus size={10} color={T.textMuted} /></button>
            <button onClick={resetView} className="px-1.5 rounded hover:bg-white/5 transition-colors" style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, minWidth: 40, textAlign: "center" }}>{Math.round(zoom * 100)}%</button>
            <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/5 transition-colors" onClick={() => setZoom(p => Math.min(3.5, p * 1.2))}><Plus size={10} color={T.textMuted} /></button>
            <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/5 transition-colors" title="Reset view" onClick={resetView}><Maximize2 size={10} color={T.textMuted} /></button>
          </div>

          {/* Minimap toggle */}
          <button onClick={() => setShowMinimap(p => !p)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all"
            style={{ fontSize: 10, color: showMinimap ? T.violet : T.textMuted, background: showMinimap ? T.violetDim : "transparent", border: `1px solid ${showMinimap ? T.borderViolet : "transparent"}` }}>
            <MapIcon size={10} /> Map
          </button>

          <div className="w-px h-4" style={{ background: T.border }} />

          {/* Diff / Conflicts shortcuts */}
          {onSwitchToDiff && (
            <button onClick={onSwitchToDiff}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all"
              style={{ fontSize: 10, color: T.violet, background: T.violetDim, border: `1px solid ${T.borderViolet}` }}>
              <GitMerge size={10} /> Diff Viewer
            </button>
          )}
          {onSwitchToConflicts && (
            <button onClick={onSwitchToConflicts}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all"
              style={{ fontSize: 10, color: T.rose, background: T.roseDim, border: `1px solid rgba(252,129,129,0.2)` }}>
              <Shield size={10} /> Conflict Detector
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden"
          style={{ cursor: hoveredNode ? "pointer" : dragging ? "grabbing" : "grab" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <canvas ref={canvasRef} style={{ display: "block" }} />

          {/* Minimap overlay */}
          {showMinimap && (
            <div className="absolute bottom-4 right-4 rounded-lg overflow-hidden" style={{ border: `1px solid ${T.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
              <canvas ref={minimapRef} style={{ display: "block" }} />
            </div>
          )}

          {/* Legend */}
          <div className="absolute top-3 left-3 rounded-xl px-3 py-2 flex flex-col gap-1.5" style={{ background: "rgba(10,12,16,0.85)", border: `1px solid ${T.border}`, backdropFilter: "blur(12px)" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em" }}>LEGEND</span>
            {[
              { color: T.cyan,    dash: false, label: "Dependency" },
              { color: T.violet,  dash: true,  label: "Optional" },
              { color: T.rose,    dash: true,  label: "Conflict" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <svg width={20} height={8}>
                  <line x1={0} y1={4} x2={20} y2={4} stroke={l.color} strokeWidth={1.5}
                    strokeDasharray={l.dash ? "4,3" : undefined} />
                </svg>
                <span style={{ fontSize: 9, color: T.textMuted }}>{l.label}</span>
              </div>
            ))}
            <div className="mt-0.5 h-px" style={{ background: T.borderSubtle }} />
            {Object.entries(typeCfg).map(([type, cfg]) => {
              const n = nodes.find(nd => nd.type === type as GraphNode["type"]);
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: n?.color ?? T.textDim, opacity: 0.7 }} />
                  <span style={{ fontSize: 9, color: T.textMuted }}>{cfg.shortLabel}</span>
                </div>
              );
            })}
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-3 left-3">
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>scroll to zoom · drag to pan · click node to inspect</span>
          </div>
        </div>

        {/* Inspector panel */}
        {showInspector && sel && (
          <div className="flex-shrink-0 flex flex-col overflow-y-auto" style={{ width: 264, borderLeft: `1px solid ${T.border}`, background: T.bgPanel }}>
            {/* Header */}
            <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: `${sel.color}06` }}>
              <div className="flex items-center justify-between mb-1">
                <Badge color={sel.color} bg={`${sel.color}14`}>{typeCfg[sel.type].shortLabel.toUpperCase()}</Badge>
                <button onClick={() => setShowInspector(false)}><X size={12} color={T.textMuted} /></button>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, lineHeight: 1.3 }}>{sel.label}</p>
              <p style={{ fontSize: 9, fontFamily: T.mono, color: sel.color, marginTop: 2 }}>v{sel.version}</p>
            </div>

            {/* Status */}
            <div className="px-4 py-2 flex items-center gap-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
              {(() => { const sc = statusCfg[sel.status]; const Icon = sc.icon; return (
                <><Icon size={12} color={sc.color} /><span style={{ fontSize: 11, color: sc.color, fontWeight: 600 }}>{sc.label}</span></>
              );})()}
              {sel.status === "conflict" && onSwitchToConflicts && (
                <button onClick={onSwitchToConflicts}
                  className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md transition-all"
                  style={{ fontSize: 9, color: T.rose, background: T.roseDim, border: `1px solid rgba(252,129,129,0.25)` }}>
                  View Conflicts
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-px p-0.5 flex-shrink-0" style={{ background: T.borderSubtle }}>
              {[
                { label: "Files", value: sel.fileCount.toLocaleString(), icon: Database },
                { label: "Size",  value: sel.size,   icon: Package },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="px-3 py-2" style={{ background: T.bgPanel }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={9} color={T.textDim} />
                    <span style={{ fontSize: 9, color: T.textDim }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, fontFamily: T.mono }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${T.borderSubtle}` }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em" }}>DESCRIPTION</span>
              <p style={{ fontSize: 10, color: T.textSecondary, lineHeight: 1.6, marginTop: 4 }}>{sel.description}</p>
            </div>

            {/* Edges */}
            <div className="px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em" }}>CONNECTIONS</span>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim }}>{selEdges.length}</span>
              </div>
              <div className="flex flex-col gap-1">
                {selEdges.map((e, i) => {
                  const other = e.from === sel.id ? e.to : e.from;
                  const otherNode = nodes.find(n => n.id === other);
                  const dir = e.from === sel.id ? "→" : "←";
                  const ec =
                    e.type === "conflict"  ? T.rose :
                    e.type === "optional"  ? T.violet :
                    T.cyan;
                  return (
                    <button key={i} onClick={() => setSelectedNode(other)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg w-full text-left transition-all hover:bg-white/5">
                      <span style={{ fontSize: 9, fontFamily: T.mono, color: ec }}>{dir}</span>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: otherNode?.color ?? T.textDim }} />
                      <span style={{ fontSize: 10, color: T.textSecondary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{otherNode?.shortLabel ?? other}</span>
                      {e.label && <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textDim }}>{e.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dep chain */}
            <div className="px-4 py-3" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em" }}>DEP CHAIN</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {Array.from(depChain).filter(id => id !== sel.id).map(id => {
                  const n = nodes.find(nd => nd.id === id);
                  return (
                    <button key={id} onClick={() => setSelectedNode(id)}
                      className="px-1.5 py-0.5 rounded transition-all hover:opacity-80"
                      style={{ fontSize: 8, fontFamily: T.mono, color: n?.color ?? T.textDim, background: `${n?.color ?? T.textDim}12`, border: `1px solid ${n?.color ?? T.textDim}20` }}>
                      {n?.shortLabel ?? id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Show inspector toggle */}
          </div>
        )}

        {/* Show inspector button when collapsed */}
        {!showInspector && selectedNode && (
          <button onClick={() => setShowInspector(true)}
            className="flex-shrink-0 flex flex-col items-center justify-center gap-2 transition-all hover:bg-white/5"
            style={{ width: 28, borderLeft: `1px solid ${T.border}`, background: T.bgPanel }}>
            <Layers size={11} color={T.textMuted} style={{ transform: "rotate(90deg)" }} />
          </button>
        )}
      </div>
    </div>
  );
}

export default DependencyGraph;
