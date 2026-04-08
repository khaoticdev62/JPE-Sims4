/**
 * PerformanceHUD — Phase 9
 * Floating, draggable performance monitor with:
 * CPU arc gauge, memory bar, latency indicator,
 * GC pressure, mini sparkline chart, compact/expanded toggle.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { T } from "../pages/jpe-theme";
import { motion, AnimatePresence } from "./jpe-motion";
import { SafeChartContainer } from "./SafeChartContainer";
import {
  AreaChart, Area, XAxis, YAxis,
} from "recharts";
import { Activity, X, ChevronDown, ChevronUp, Cpu, MemoryStick, Wifi, Zap, GripVertical } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
export interface LiveMetrics { cpu: number; mem: number; lat: number; gc: number; }

interface PerformanceHUDProps {
  metrics: LiveMetrics;
  onClose: () => void;
}

/* ─── SVG Arc Gauge ──────────────────────────────────────────────── */
function ArcGauge({
  pct, color, size = 70, label,
}: { pct: number; color: string; size?: number; label: string }) {
  const r = (size - 10) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = -210;
  const totalArc = 240;
  const circ = (totalArc / 360) * 2 * Math.PI * r;
  const filled = circ * (pct / 100);
  const gap = circ - filled;

  const polarToCart = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (start: number, sweep: number) => {
    const s = polarToCart(start);
    const e = polarToCart(start + sweep);
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        {/* Track */}
        <path
          d={describeArc(startAngle, totalArc)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={5}
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={describeArc(startAngle, totalArc * (pct / 100))}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 4px ${color}60)`,
            transition: "stroke-dasharray 0.6s ease",
          }}
        />
        {/* Center text */}
        <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 13, fontFamily: T.mono, fontWeight: 700, fill: color }}>
          {Math.round(pct)}
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 8, fontFamily: T.mono, fill: T.textDim }}>
          %
        </text>
      </svg>
      <span style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
}

/* ─── Mini sparkline ──────────────────────────────────────────────── */
function MiniSparkline({ data, color, dataKey }: { data: { t: number; v: number }[]; color: string; dataKey: string }) {
  const gradId = `spark-grad-${dataKey}`;
  const clipId = `clip-phud-${dataKey}`;
  return (
    <SafeChartContainer style={{ height: 36 }}>
      <AreaChart
        data={data}
        margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
        accessibilityLayer={false}
        clipPathId={clipId}
      >
        <defs key={`${dataKey}-defs`}>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <XAxis key={`${dataKey}-x`} dataKey="t" hide />
        <YAxis key={`${dataKey}-y`} hide domain={[0, 100]} />
        <Area
          key={`${dataKey}-area`}
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradId})`}
          isAnimationActive={false}
          dot={false}
        />
      </AreaChart>
    </SafeChartContainer>
  );
}

/* ─── Metric row ──────────────────────────────────────────────────── */
function MetricRow({
  icon: Icon, label, value, color, bar, barPct,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string; value: string; color: string;
  bar?: boolean; barPct?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={10} color={color} />
      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, minWidth: 32 }}>{label}</span>
      <div className="flex-1">
        {bar && barPct !== undefined ? (
          <div className="relative rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.05)" }}>
            <div className="absolute top-0 left-0 h-full rounded-full transition-all"
              style={{ width: `${barPct}%`, background: color, boxShadow: `0 0 4px ${color}60`, transition: "width 0.6s ease" }} />
          </div>
        ) : null}
      </div>
      <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */
export function PerformanceHUD({ metrics, onClose }: PerformanceHUDProps) {
  const [compact, setCompact] = useState(false);
  const [pos, setPos] = useState({ x: 20, y: 80 });
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const hudRef = useRef<HTMLDivElement>(null);

  /* Keep 30 samples of CPU history */
  const [cpuHistory, setCpuHistory] = useState<{ t: number; v: number }[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({ t: i, v: Math.random() * 30 + 5 }))
  );

  useEffect(() => {
    setCpuHistory(prev => {
      const next = [...prev.slice(-29), { t: Date.now(), v: metrics.cpu }];
      return next;
    });
  }, [metrics.cpu]);

  /* Drag handlers */
  const onDragStart = useCallback((e: React.MouseEvent) => {
    if (!hudRef.current) return;
    draggingRef.current = true;
    const rect = hudRef.current.getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const onMove = (me: MouseEvent) => {
      if (!draggingRef.current) return;
      const newX = me.clientX - dragOffsetRef.current.x;
      const newY = me.clientY - dragOffsetRef.current.y;
      setPos({
        x: Math.max(8, Math.min(window.innerWidth - 200, newX)),
        y: Math.max(8, Math.min(window.innerHeight - 100, newY)),
      });
    };
    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  /* Health color */
  const cpuColor = metrics.cpu > 75 ? T.rose : metrics.cpu > 50 ? T.amber : T.emerald;
  const memColor = metrics.mem > 512 ? T.rose : metrics.mem > 400 ? T.amber : T.cyan;
  const latColor = metrics.lat > 16 ? T.rose : metrics.lat > 8 ? T.amber : T.emerald;
  const gcColor = metrics.gc > 20 ? T.rose : metrics.gc > 12 ? T.amber : T.violet;
  const memPct = Math.min(100, (metrics.mem / 640) * 100);

  return (
    <motion.div
      ref={hudRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        zIndex: 150,
        width: compact ? 180 : 230,
        background: T.bgPanel,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.04)`,
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.emerald}50, ${T.cyan}50, transparent)` }} />

      {/* ── Header / Drag handle ── */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing"
        style={{ borderBottom: `1px solid ${T.border}`, background: T.bgSurface }}
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-2">
          <GripVertical size={10} color={T.textDim} />
          <Activity size={11} color={T.emerald} />
          <span style={{ fontSize: 10, fontWeight: 700, fontFamily: T.mono, color: T.textSecondary, letterSpacing: "0.06em" }}>
            PERF MONITOR
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCompact(p => !p)}
            className="p-0.5 rounded hover:bg-white/5 transition-colors"
            title={compact ? "Expand" : "Compact"}
            onMouseDown={e => e.stopPropagation()}
          >
            {compact ? <ChevronDown size={11} color={T.textMuted} /> : <ChevronUp size={11} color={T.textMuted} />}
          </button>
          <button
            onClick={onClose}
            className="p-0.5 rounded hover:bg-white/5 transition-colors"
            title="Close"
            onMouseDown={e => e.stopPropagation()}
          >
            <X size={11} color={T.textMuted} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <AnimatePresence initial={false}>
        {!compact && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-3 py-3 space-y-3">
              {/* Gauges row */}
              <div className="flex items-center justify-around">
                <ArcGauge pct={metrics.cpu} color={cpuColor} size={66} label="CPU" />
                <ArcGauge pct={memPct} color={memColor} size={66} label="MEM" />
              </div>

              {/* Sparkline */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textDim, letterSpacing: "0.06em" }}>CPU HISTORY</span>
                  <span style={{ fontSize: 9, fontFamily: T.mono, color: cpuColor }}>{Math.round(metrics.cpu)}%</span>
                </div>
                <div style={{ height: 36 }}>
                  <MiniSparkline data={cpuHistory} color={cpuColor} dataKey="cpu" />
                </div>
              </div>

              {/* Metric rows */}
              <div className="space-y-1.5">
                <MetricRow icon={MemoryStick} label="RAM" value={`${Math.round(metrics.mem)} MB`} color={memColor} bar barPct={memPct} />
                <MetricRow icon={Wifi} label="Lat" value={`${Math.round(metrics.lat)}ms`} color={latColor} />
                <MetricRow icon={Zap} label="GC" value={`${Math.round(metrics.gc)} cyc`} color={gcColor} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact view */}
      {compact && (
        <div className="flex items-center justify-between px-3 py-2 gap-2">
          <div className="flex items-center gap-1">
            <Cpu size={10} color={cpuColor} />
            <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: cpuColor }}>{Math.round(metrics.cpu)}%</span>
          </div>
          <div className="w-px h-3" style={{ background: T.border }} />
          <div className="flex items-center gap-1">
            <MemoryStick size={10} color={memColor} />
            <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: memColor }}>{Math.round(metrics.mem)}M</span>
          </div>
          <div className="w-px h-3" style={{ background: T.border }} />
          <div className="flex items-center gap-1">
            <Wifi size={10} color={latColor} />
            <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: latColor }}>{Math.round(metrics.lat)}ms</span>
          </div>
        </div>
      )}

      {/* Bottom glow bar */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${cpuColor}40, ${memColor}40, ${latColor}40)` }} />
    </motion.div>
  );
}
