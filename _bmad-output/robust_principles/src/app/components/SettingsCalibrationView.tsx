import { useState, useRef, useCallback, useEffect } from "react";
import {
  Key, Eye, EyeOff, Copy, CheckCircle2, AlertTriangle,
  FolderOpen, ExternalLink, LayoutDashboard, Plug, FolderCog,
  SlidersHorizontal, Brain, Cpu, ChevronRight,
  type LucideIcon, Loader2, Check, Shield, Sparkles,
  RefreshCw, Lock, HardDrive, Settings2,
  Bell, Palette, Globe, Database,
  Gauge, Activity, Fingerprint, Zap,
  History, Layers,
  Server, Wifi, MemoryStick, ThermometerSun,
} from "lucide-react";
import { useScaledPx } from "./jpe-settings-context";

/* ═══════════════════════════════════════════════════════════════
   OBSIDIAN CRYSTAL DESIGN SYSTEM — TOKENS (Full HD calibrated)
   ═══════════════════════════════════════════════════════════════ */
const T = {
  bg: "#020204",
  bgPanel: "#0A0A0C",
  bgSurface: "#0c0c12",
  bgElevated: "#101018",
  bgHover: "#14141e",
  bgInput: "#08080E",
  bgInputFocus: "#0A0A14",
  bgGlass: "rgba(6,6,10,0.85)",
  bgGlassHover: "rgba(10,10,18,0.92)",
  border: "rgba(255,255,255,0.04)",
  borderSubtle: "rgba(255,255,255,0.02)",
  borderActive: "rgba(139,92,246,0.4)",
  borderFocus: "rgba(139,92,246,0.6)",
  borderCyan: "rgba(6,182,212,0.3)",
  violet: "#8B5CF6",
  violetBright: "#A78BFA",
  violetDim: "rgba(139,92,246,0.12)",
  violetGlow: "rgba(139,92,246,0.2)",
  violetDeep: "#7C3AED",
  cyan: "#06B6D4",
  cyanBright: "#22D3EE",
  cyanDim: "rgba(6,182,212,0.12)",
  emerald: "#10B981",
  emeraldDim: "rgba(16,185,129,0.12)",
  rose: "#F43F5E",
  roseDim: "rgba(244,63,94,0.10)",
  amber: "#F59E0B",
  amberDim: "rgba(245,158,11,0.10)",
  blue: "#3B82F6",
  textPrimary: "#E8E8ED",
  textSecondary: "#8B8B9E",
  textTertiary: "#55556A",
  textMuted: "#3D3D52",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  sans: "'Inter', system-ui, sans-serif",
  display: "'Outfit', 'Inter', system-ui, sans-serif",
  glassBlur: "blur(32px)",
};

/* ═══ SIDEBAR NAV ═══ */
type NavKey = "api" | "project" | "calibration" | "models" | "system" | "notifications" | "appearance" | "security";

interface NavItem {
  key: NavKey;
  label: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "CONFIGURATION",
    items: [
      { key: "api", label: "API & Integrations", icon: Plug, badge: "4", badgeColor: T.violet },
      { key: "project", label: "Project Paths", icon: FolderCog },
      { key: "calibration", label: "AI Calibration", icon: SlidersHorizontal, badge: "!", badgeColor: T.amber },
      { key: "models", label: "Model Registry", icon: Brain },
    ],
  },
  {
    label: "ENVIRONMENT",
    items: [
      { key: "system", label: "System & Runtime", icon: Cpu },
      { key: "notifications", label: "Notifications", icon: Bell, badge: "3", badgeColor: T.cyanBright },
      { key: "appearance", label: "Appearance", icon: Palette },
      { key: "security", label: "Security & Auth", icon: Shield },
    ],
  },
];

/* ═══ TOGGLE SWITCH ═══ */
function Toggle({ enabled, onChange, size = "md" }: { enabled: boolean; onChange: () => void; size?: "sm" | "md" }) {
  const w = size === "sm" ? 28 : 36;
  const h = size === "sm" ? 16 : 20;
  const dot = size === "sm" ? 12 : 16;
  const travel = w - dot - 4;
  return (
    <button
      onClick={onChange}
      className="relative rounded-full transition-all flex-shrink-0"
      style={{
        width: w, height: h,
        background: enabled ? `linear-gradient(135deg, ${T.violet}, ${T.violetDeep})` : "rgba(255,255,255,0.06)",
        border: `1px solid ${enabled ? T.violet + "60" : T.border}`,
        boxShadow: enabled ? `0 0 10px ${T.violetGlow}, inset 0 0 6px rgba(139,92,246,0.15)` : "inset 0 1px 2px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full transition-all"
        style={{
          width: dot, height: dot,
          left: enabled ? travel + 2 : 2,
          background: enabled ? "#fff" : T.textMuted,
          boxShadow: enabled ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
        }}
      />
    </button>
  );
}

/* ═══ API KEY FIELD — Full HD refined ═══ */
function ApiKeyField({
  label,
  provider,
  maskedValue,
  status,
  environment,
  statusColor,
  statusIcon,
  lastUsed,
  rateLimit,
  quota,
}: {
  label: string;
  provider: string;
  maskedValue: string;
  status: string;
  environment: string;
  statusColor: string;
  statusIcon: "check" | "warning" | "error";
  lastUsed: string;
  rateLimit: string;
  quota: string;
}) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const StatusIconEl = statusIcon === "check" ? CheckCircle2 : statusIcon === "warning" ? AlertTriangle : AlertTriangle;
  const statusBg = statusIcon === "check" ? T.emeraldDim : statusIcon === "warning" ? T.amberDim : T.roseDim;
  const statusBorder = statusIcon === "check" ? "rgba(16,185,129,0.25)" : statusIcon === "warning" ? "rgba(245,158,11,0.25)" : "rgba(244,63,94,0.25)";

  return (
    <div className="mb-6">
      {/* Label row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <label style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{label}</label>
          <span
            className="px-2 py-0.5 rounded-full"
            style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 600, color: T.violetBright, background: T.violetDim, border: `1px solid rgba(139,92,246,0.15)` }}
          >
            {provider}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 9, color: T.textMuted }}>Last used: <span style={{ color: T.textTertiary }}>{lastUsed}</span></span>
        </div>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
          style={{
            background: focused ? T.bgInputFocus : T.bgInput,
            border: `1px solid ${focused ? T.borderFocus : T.border}`,
            boxShadow: focused
              ? `0 0 0 3px rgba(139,92,246,0.08), inset 0 1px 3px rgba(0,0,0,0.4)`
              : "inset 0 1px 3px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={(e) => { if (!focused) e.currentTarget.style.borderColor = T.borderActive; }}
          onMouseLeave={(e) => { if (!focused) e.currentTarget.style.borderColor = T.border; }}
          onClick={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          tabIndex={0}
        >
          <Lock size={14} color={focused ? T.violet : T.textMuted} />
          <span style={{
            fontSize: 15, fontFamily: T.mono, color: visible ? T.textSecondary : T.textTertiary,
            letterSpacing: visible ? "0.02em" : "0.18em", flex: 1, userSelect: "none",
          }}>
            {visible ? "sk-proj-Hx7Qm9R4a...wZ8kBnP" : maskedValue}
          </span>
          {/* Inline status dot */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md" style={{ background: statusBg }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor, boxShadow: `0 0 4px ${statusColor}80` }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: statusColor, letterSpacing: "0.04em" }}>{status}</span>
          </div>
        </div>

        {/* Action buttons */}
        {[
          { icon: visible ? EyeOff : Eye, onClick: () => setVisible(!visible), tip: visible ? "Hide" : "Reveal" },
          { icon: copied ? Check : Copy, onClick: handleCopy, tip: "Copy", highlight: copied },
          { icon: RefreshCw, onClick: () => {}, tip: "Rotate Key" },
        ].map((btn, i) => {
          const BtnIcon = btn.icon;
          return (
            <button
              key={`apibtn-${i}`}
              onClick={btn.onClick}
              className="p-2.5 rounded-xl transition-all"
              title={btn.tip}
              style={{
                background: btn.highlight ? T.emeraldDim : "rgba(255,255,255,0.03)",
                border: `1px solid ${btn.highlight ? "rgba(16,185,129,0.3)" : T.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = T.borderActive;
                e.currentTarget.style.boxShadow = `0 0 8px ${T.violetGlow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = btn.highlight ? T.emeraldDim : "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = btn.highlight ? "rgba(16,185,129,0.3)" : T.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <BtnIcon size={14} color={btn.highlight ? T.emerald : T.textSecondary} />
            </button>
          );
        })}

        {/* Status badge */}
        <div className="p-2.5 rounded-xl" style={{ background: statusBg, border: `1px solid ${statusBorder}` }}>
          <StatusIconEl size={14} color={statusColor} />
        </div>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-5 mt-2.5 px-1">
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 10, color: T.textTertiary }}>Environment:</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: T.textPrimary }}>{environment}</span>
        </div>
        <div className="w-px h-3" style={{ background: T.border }} />
        <div className="flex items-center gap-1.5">
          <Gauge size={9} color={T.textMuted} />
          <span style={{ fontSize: 10, color: T.textTertiary }}>Rate Limit:</span>
          <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary }}>{rateLimit}</span>
        </div>
        <div className="w-px h-3" style={{ background: T.border }} />
        <div className="flex items-center gap-1.5">
          <Activity size={9} color={T.textMuted} />
          <span style={{ fontSize: 10, color: T.textTertiary }}>Quota:</span>
          <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textSecondary }}>{quota}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══ PATH FIELD — Full HD refined ═══ */
function PathField({
  label,
  value,
  verifyState,
  onVerify,
  description,
  pathMeta,
}: {
  label: string;
  value: string;
  verifyState: "idle" | "verifying" | "verified" | "warning";
  onVerify: () => void;
  description: string;
  pathMeta?: { writable: string; free: string; inode: string };
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1.5">
        <label style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{label}</label>
      </div>
      <p style={{ fontSize: 11, color: T.textTertiary, marginBottom: 10 }}>{description}</p>

      <div className="flex items-center gap-2.5">
        <div
          className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
          style={{
            background: T.bgInput,
            border: `1px solid ${verifyState === "verified" ? "rgba(16,185,129,0.25)" : T.border}`,
            boxShadow: verifyState === "verified"
              ? "inset 0 1px 3px rgba(0,0,0,0.3), 0 0 0 2px rgba(16,185,129,0.05)"
              : "inset 0 1px 3px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={(e) => { if (verifyState !== "verified") e.currentTarget.style.borderColor = T.borderActive; }}
          onMouseLeave={(e) => { if (verifyState !== "verified") e.currentTarget.style.borderColor = T.border; }}
        >
          <FolderOpen size={14} color={verifyState === "verified" ? T.emerald : T.textMuted} />
          <span style={{ fontSize: 13, fontFamily: T.mono, color: T.textSecondary, flex: 1 }}>{value}</span>
          {verifyState === "verified" && (
            <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 8, fontFamily: T.mono, fontWeight: 700, color: T.emerald, background: T.emeraldDim }}>
              RESOLVED
            </span>
          )}
        </div>

        <button
          onClick={onVerify}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all flex-shrink-0"
          style={{
            background: verifyState === "verified"
              ? T.emeraldDim
              : `linear-gradient(135deg, ${T.violet}, ${T.violetDeep})`,
            border: `1px solid ${verifyState === "verified" ? "rgba(16,185,129,0.3)" : T.violet}`,
            boxShadow: verifyState === "verified"
              ? "none"
              : `0 0 16px ${T.violetGlow}, 0 2px 8px rgba(0,0,0,0.3)`,
            cursor: verifyState === "verifying" ? "wait" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (verifyState !== "verifying") {
              e.currentTarget.style.boxShadow = verifyState === "verified"
                ? "0 0 10px rgba(16,185,129,0.15)"
                : `0 0 24px ${T.violetGlow}, 0 4px 16px rgba(0,0,0,0.4)`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = verifyState === "verified"
              ? "none"
              : `0 0 16px ${T.violetGlow}, 0 2px 8px rgba(0,0,0,0.3)`;
          }}
        >
          {verifyState === "verifying" && <Loader2 size={13} color="#fff" className="animate-spin" />}
          {verifyState === "verified" && <CheckCircle2 size={13} color={T.emerald} />}
          {(verifyState === "idle" || verifyState === "warning") && <ExternalLink size={13} color="#fff" />}
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: verifyState === "verified" ? T.emerald : "#fff",
            letterSpacing: "0.05em",
          }}>
            {verifyState === "verifying" ? "Verifying..." : verifyState === "verified" ? "Verified" : "Verify Path"}
          </span>
        </button>
      </div>

      {/* Verification result metadata */}
      {verifyState === "verified" && pathMeta && (
        <div className="flex items-center gap-4 mt-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={10} color={T.emerald} />
            <span style={{ fontSize: 10, color: T.emerald }}>Path validated successfully</span>
          </div>
          <div className="w-px h-3" style={{ background: T.border }} />
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>Writable: {pathMeta.writable}</span>
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>Free: {pathMeta.free}</span>
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>Inode: {pathMeta.inode}</span>
        </div>
      )}
      {verifyState === "verifying" && (
        <div className="flex items-center gap-2 mt-2.5 px-1">
          <Loader2 size={10} color={T.amber} className="animate-spin" />
          <span style={{ fontSize: 10, color: T.amber }}>Resolving symlinks and checking permissions...</span>
        </div>
      )}
      {verifyState === "warning" && (
        <div className="flex items-center gap-2 mt-2.5 px-1">
          <AlertTriangle size={10} color={T.amber} />
          <span style={{ fontSize: 10, color: T.amber }}>Path accessible but low disk space (&lt; 50 GB remaining)</span>
        </div>
      )}
    </div>
  );
}

/* ═══ SLIDER FIELD — Full HD refined with tick marks ═══ */
function SliderField({
  label,
  description,
  min,
  max,
  step,
  value,
  onChange,
  formatValue,
  ticks,
  color = T.violet,
  colorBright = T.violetBright,
  colorDim = T.violetDim,
}: {
  label: string;
  description: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  formatValue: (v: number) => string;
  ticks: { value: number; label: string }[];
  color?: string;
  colorBright?: string;
  colorDim?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const pct = ((value - min) / (max - min)) * 100;
  const displayValue = formatValue(value);

  const updateFromMouse = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    const raw = min + ratio * (max - min);
    const snapped = Math.round(raw / step) * step;
    onChange(Math.max(min, Math.min(max, snapped)));
  }, [min, max, step, onChange]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => { e.preventDefault(); updateFromMouse(e.clientX); };
    const handleUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [dragging, updateFromMouse]);

  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{label}</span>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
          style={{
            background: colorDim,
            border: `1px solid ${color}25`,
            boxShadow: (dragging || hovered) ? `0 0 8px ${color}15` : "none",
          }}
        >
          <span style={{ fontSize: 13, fontFamily: T.mono, fontWeight: 700, color: colorBright, letterSpacing: "-0.02em" }}>
            {displayValue}
          </span>
        </div>
      </div>
      <p style={{ fontSize: 11, color: T.textTertiary, marginBottom: 14, lineHeight: 1.5 }}>{description}</p>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative w-full cursor-pointer"
        style={{ height: 32 }}
        onMouseDown={(e) => { setDragging(true); updateFromMouse(e.clientX); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Track bg */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 right-0 rounded-full"
          style={{ height: 6, background: "rgba(255,255,255,0.05)" }}
        />
        {/* Filled */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-0 rounded-full transition-shadow"
          style={{
            height: 6,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}60, ${color})`,
            boxShadow: (dragging || hovered)
              ? `0 0 12px ${color}40, 0 0 24px ${color}15`
              : `0 0 8px ${color}20`,
          }}
        />

        {/* Tick marks */}
        {ticks.map((tick) => {
          const tickPct = ((tick.value - min) / (max - min)) * 100;
          return (
            <div
              key={`tick-${tick.value}`}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${tickPct}%`, transform: "translate(-50%, -50%)" }}
            >
              <div
                className="w-px rounded-full"
                style={{
                  height: 14,
                  background: tickPct <= pct ? `${color}60` : "rgba(255,255,255,0.08)",
                }}
              />
            </div>
          );
        })}

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full transition-all"
          style={{
            width: dragging ? 22 : 18,
            height: dragging ? 22 : 18,
            left: `calc(${pct}% - ${dragging ? 11 : 9}px)`,
            background: `radial-gradient(circle at 40% 35%, ${colorBright}, ${color})`,
            border: `2px solid rgba(255,255,255,${dragging ? "0.35" : "0.2"})`,
            boxShadow: dragging
              ? `0 0 20px ${color}50, 0 0 40px ${color}20, 0 2px 8px rgba(0,0,0,0.5)`
              : hovered
              ? `0 0 14px ${color}35, 0 2px 8px rgba(0,0,0,0.4)`
              : `0 0 8px ${color}20, 0 2px 6px rgba(0,0,0,0.3)`,
            cursor: dragging ? "grabbing" : "grab",
          }}
        />
      </div>

      {/* Tick labels */}
      <div className="relative mt-1.5" style={{ height: 16 }}>
        {ticks.map((tick) => {
          const tickPct = ((tick.value - min) / (max - min)) * 100;
          return (
            <span
              key={`ticklabel-${tick.value}`}
              className="absolute"
              style={{
                left: `${tickPct}%`,
                transform: "translateX(-50%)",
                fontSize: 9,
                fontFamily: T.mono,
                color: Math.abs(value - tick.value) < step * 0.6 ? colorBright : T.textMuted,
                fontWeight: Math.abs(value - tick.value) < step * 0.6 ? 700 : 400,
                transition: "color 0.15s",
              }}
            >
              {tick.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ GLASS SECTION — Full HD refined ═══ */
function GlassSection({
  id,
  number,
  title,
  subtitle,
  icon: Icon,
  children,
  headerRight,
}: {
  id?: string;
  number: number;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="rounded-2xl overflow-hidden mb-6 relative scroll-mt-6"
      style={{
        background: T.bgGlass,
        backdropFilter: T.glassBlur,
        WebkitBackdropFilter: T.glassBlur,
        border: `1px solid ${T.border}`,
        boxShadow: "0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Top glow hairline */}
      <div className="absolute top-0 left-8 right-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${T.violet}18, transparent)` }} />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-3.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${T.violetDim}, rgba(139,92,246,0.06))`,
              border: `1px solid rgba(139,92,246,0.2)`,
              boxShadow: `0 0 8px ${T.violetGlow}`,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, fontFamily: T.mono, color: T.violet }}>{String(number).padStart(2, "0")}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.04em" }}>
                {title}
              </span>
              <Icon size={15} color={T.violet} />
            </div>
            {subtitle && (
              <span style={{ fontSize: 10, color: T.textTertiary, marginTop: 1, display: "block" }}>{subtitle}</span>
            )}
          </div>
        </div>
        {headerRight}
      </div>

      {/* Content */}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ═══ SETTING ROW — for toggle / info rows ═══ */
function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between py-3.5 px-4 rounded-xl mb-2 transition-all"
      style={{ background: "rgba(255,255,255,0.015)", border: `1px solid ${T.borderSubtle}` }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = T.border; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; e.currentTarget.style.borderColor = T.borderSubtle; }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: T.textPrimary }}>{label}</div>
        {description && <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 2 }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

/* ═══ MINI RING GAUGE ═══ */
function MiniRingGauge({ pct, color, size = 44, label }: { pct: number; color: string; size?: number; label: string }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={3} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${color}60)` }}
        />
      </svg>
      <span style={{ fontSize: 11, fontFamily: T.mono, fontWeight: 700, color, marginTop: -size / 2 - 6, position: "relative", zIndex: 1 }}>
        {pct}%
      </span>
      <span style={{ fontSize: 8, color: T.textMuted, fontWeight: 600, letterSpacing: "0.06em", marginTop: size / 2 - 12 }}>{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SETTINGS & CALIBRATION VIEW — Full HD 1920×1080
   Single continuous scroll · Sidebar anchors to sections
   ═══════════════════════════════════════════════════════════════ */
export function SettingsCalibrationView() {
  const sideW = useScaledPx(240);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<NavKey>("api");

  /* Path states */
  const [rootPathState, setRootPathState] = useState<"idle" | "verifying" | "verified" | "warning">("verified");
  const [checkpointPathState, setCheckpointPathState] = useState<"idle" | "verifying" | "verified" | "warning">("idle");
  const [cachePathState, setCachePathState] = useState<"idle" | "verifying" | "verified" | "warning">("verified");

  /* Sliders */
  const [temperature, setTemperature] = useState(0.7);
  const [contextWindow, setContextWindow] = useState(8192);
  const [responseFiltering, setResponseFiltering] = useState(0.85);
  const [topP, setTopP] = useState(0.95);
  const [frequencyPenalty, setFrequencyPenalty] = useState(0.1);

  /* Toggles */
  const [autoSave, setAutoSave] = useState(true);
  const [telemetry, setTelemetry] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [streamResponse, setStreamResponse] = useState(true);
  const [fallbackModel, setFallbackModel] = useState(true);
  const [rateLimitToggle, setRateLimitToggle] = useState(true);

  /* Notification & Appearance & Security toggles */
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    buildAlerts: true, apiQuota: true, securityDigest: false, modelDrift: true, thermalAlerts: true,
    neonGlow: true, glassBlur: true, animatedTransitions: true,
    twoFactor: true, auditLog: true, ipAllowlist: false, soc2: true,
  });
  const tog = (key: string) => setToggles(p => ({ ...p, [key]: !p[key] }));

  const handleVerifyRoot = () => { setRootPathState("verifying"); setTimeout(() => setRootPathState("verified"), 2200); };
  const handleVerifyCheckpoint = () => { setCheckpointPathState("verifying"); setTimeout(() => setCheckpointPathState("verified"), 1800); };
  const handleVerifyCache = () => { setCachePathState("verifying"); setTimeout(() => setCachePathState("verified"), 1400); };

  /* Section IDs mapped to nav keys */
  const sectionIds: NavKey[] = ["api", "project", "calibration", "models", "system", "notifications", "appearance", "security"];

  /* IntersectionObserver — track which section is in view */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
            const id = entry.target.id as NavKey;
            if (sectionIds.includes(id)) {
              setActiveSection(id);
            }
          }
        }
      },
      { root: container, rootMargin: "-10% 0px -60% 0px", threshold: [0.15, 0.5] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  /* Scroll to section */
  const scrollToSection = (key: NavKey) => {
    const el = document.getElementById(key);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex h-full w-full" style={{ background: T.bg, fontFamily: T.sans, color: T.textPrimary }}>

      {/* ═══ LEFT SIDEBAR NAV ═══ */}
      <div className="flex flex-col flex-shrink-0" style={{ width: sideW, borderRight: `1px solid ${T.border}`, background: T.bgPanel }}>

        {/* Sidebar header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${T.violet}25, ${T.cyan}15)`,
              border: `1px solid ${T.violet}30`,
              boxShadow: `0 0 14px ${T.violetGlow}`,
            }}
          >
            <Settings2 size={16} color={T.violetBright} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.02em", lineHeight: 1.2 }}>
              Settings
            </div>
            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: "0.1em", fontWeight: 600 }}>WORKSPACE-01</div>
          </div>
        </div>

        {/* Dashboard link */}
        <div className="px-3 pt-3 pb-1">
          <button
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all"
            style={{ color: T.textTertiary }}
            onMouseEnter={(e) => { e.currentTarget.style.background = T.bgHover; e.currentTarget.style.color = T.textSecondary; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textTertiary; }}
          >
            <LayoutDashboard size={15} />
            <span style={{ fontSize: 13 }}>Dashboard</span>
          </button>
        </div>

        {/* Nav groups — scroll-to anchors */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <div className="px-3.5 mb-2">
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: T.textMuted }}>{group.label}</span>
              </div>
              {group.items.map((item) => {
                const isActive = activeSection === item.key;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => scrollToSection(item.key)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl mb-1 transition-all relative"
                    style={{
                      background: isActive ? `linear-gradient(90deg, ${T.violet}18, ${T.violet}06)` : "transparent",
                      color: isActive ? T.textPrimary : T.textTertiary,
                      border: isActive ? `1px solid ${T.violet}20` : "1px solid transparent",
                      boxShadow: isActive ? `0 0 14px ${T.violetGlow}, inset 0 0 12px rgba(139,92,246,0.03)` : "none",
                    }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = T.bgHover; e.currentTarget.style.color = T.textSecondary; } }}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textTertiary; } }}
                  >
                    {isActive && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                        style={{ height: 20, background: T.violet, boxShadow: `0 0 10px ${T.violet}70` }}
                      />
                    )}
                    <Icon size={15} color={isActive ? T.violet : undefined} />
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1, textAlign: "left" }}>{item.label}</span>
                    {item.badge && (
                      <span
                        className="px-1.5 py-0.5 rounded-md"
                        style={{
                          fontSize: 9, fontWeight: 700, fontFamily: T.mono,
                          color: item.badgeColor,
                          background: `${item.badgeColor}15`,
                          border: `1px solid ${item.badgeColor}25`,
                          minWidth: 18, textAlign: "center",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight size={11} color={T.violet} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="px-4 py-3" style={{ borderTop: `1px solid ${T.border}` }}>
          <div className="space-y-2">
            {[
              { label: "Session", value: "Active", color: T.emerald },
              { label: "Config Rev", value: "v3.2.0-rc4", color: T.textTertiary },
              { label: "Last Saved", value: "2m ago", color: T.textTertiary },
              { label: "Changes", value: "3 unsaved", color: T.amber },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span style={{ fontSize: 9, color: T.textMuted, fontWeight: 600 }}>{item.label}:</span>
                <span style={{ fontSize: 9, fontFamily: T.mono, color: item.color, fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT CONTENT PANEL — Full HD single scroll ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Page header */}
        <div className="flex items-center justify-between px-8 py-3.5 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}`, background: T.bgPanel }}>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: T.display, color: T.textPrimary, letterSpacing: "0.04em" }}>
              SETTINGS & CALIBRATION
            </span>
            <span
              className="px-2.5 py-1 rounded-full"
              style={{ fontSize: 9, fontFamily: T.mono, color: T.textTertiary, background: "rgba(255,255,255,0.04)", border: `1px solid ${T.border}` }}
            >
              Workspace-01
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`, fontSize: 11, color: T.textTertiary }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.borderActive; e.currentTarget.style.color = T.textSecondary; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textTertiary; }}
            >
              <RefreshCw size={11} />
              <span>Reset Defaults</span>
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2 rounded-xl transition-all"
              style={{
                background: `linear-gradient(135deg, ${T.violet}, ${T.violetDeep})`,
                border: `1px solid ${T.violet}`,
                boxShadow: `0 0 14px ${T.violetGlow}, 0 2px 8px rgba(0,0,0,0.3)`,
                fontSize: 11, fontWeight: 700, color: "#fff",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 28px ${T.violetGlow}, 0 4px 16px rgba(0,0,0,0.4)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 14px ${T.violetGlow}, 0 2px 8px rgba(0,0,0,0.3)`; }}
            >
              <Check size={11} />
              <span>Save All Changes</span>
            </button>
          </div>
        </div>

        {/* ═══ SCROLLABLE CONTENT — All sections rendered ═══ */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6">
          <div className="relative">
            {/* Cinematic ambient glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(ellipse 60% 25% at 50% 0%, rgba(139,92,246,0.035) 0%, transparent 55%), radial-gradient(ellipse 40% 20% at 80% 100%, rgba(6,182,212,0.02) 0%, transparent 50%)`,
            }} />

            <div className="max-w-5xl relative">

              {/* ═══ SECTION 01: API KEYS ═══ */}
              <GlassSection
                id="api"
                number={1}
                title="API KEYS & AUTHENTICATION"
                subtitle="Manage external service credentials and integration tokens"
                icon={Key}
                headerRight={
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: T.emeraldDim, border: `1px solid rgba(16,185,129,0.2)` }}>
                      <Shield size={10} color={T.emerald} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: T.emerald }}>AES-256</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
                      <Fingerprint size={10} color={T.textMuted} />
                      <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>Vault: HashiCorp</span>
                    </div>
                  </div>
                }
              >
                <ApiKeyField
                  label="Vertex AI Key" provider="Google Cloud"
                  maskedValue="••••  ••••  ••••  ••••  ••••  ••••"
                  status="Active" environment="Production" statusColor={T.emerald} statusIcon="check"
                  lastUsed="12s ago" rateLimit="10K rpm" quota="82% remaining"
                />
                <ApiKeyField
                  label="OpenAI API Key" provider="OpenAI"
                  maskedValue="••••  ••••  ••••  ••••  ••••  ••••"
                  status="Expiring Soon" environment="Production" statusColor={T.amber} statusIcon="warning"
                  lastUsed="3m ago" rateLimit="500 rpm" quota="94% remaining"
                />
                <ApiKeyField
                  label="Anthropic API Key" provider="Anthropic"
                  maskedValue="••••  ••••  ••••  ••••  ••••  ••••"
                  status="Active" environment="Staging" statusColor={T.emerald} statusIcon="check"
                  lastUsed="1h ago" rateLimit="1K rpm" quota="71% remaining"
                />
                <ApiKeyField
                  label="HuggingFace Token" provider="HuggingFace"
                  maskedValue="••••  ••••  ••••  ••••  ••••  ••••"
                  status="Active" environment="Production" statusColor={T.emerald} statusIcon="check"
                  lastUsed="8m ago" rateLimit="Unlimited" quota="N/A"
                />
                <div className="flex items-center gap-5 pt-3 mt-2" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                  {[
                    { icon: Shield, text: "All keys encrypted at rest", color: T.emerald },
                    { icon: Lock, text: "mTLS in transit", color: T.textMuted },
                    { icon: RefreshCw, text: "Auto-rotation: 30d cycle", color: T.textMuted },
                    { icon: History, text: "Last audit: 2h ago", color: T.textMuted },
                    { icon: Fingerprint, text: "HMAC-SHA256 signed", color: T.textMuted },
                  ].map((item, i) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={`enc-${i}`} className="flex items-center gap-1.5">
                        <ItemIcon size={9} color={item.color} />
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: item.color }}>{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassSection>

              {/* ═══ SECTION 02: PROJECT PATHS ═══ */}
              <GlassSection
                id="project"
                number={2}
                title="DATA PATHS & STORAGE"
                subtitle="Configure file system paths and verify access permissions"
                icon={HardDrive}
                headerRight={
                  <div className="flex items-center gap-3">
                    {[
                      { label: "MODELS", value: "1.2 TB", color: T.violet },
                      { label: "CHKPT", value: "420 GB", color: T.cyan },
                      { label: "CACHE", value: "180 GB", color: T.emerald },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
                        <span style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted, fontWeight: 700 }}>{s.label}</span>
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                }
              >
                <PathField
                  label="Project Root Path"
                  description="Primary workspace directory for all project assets and output files"
                  value="/volumes/nas/projects/workspace_01/data"
                  verifyState={rootPathState} onVerify={handleVerifyRoot}
                  pathMeta={{ writable: "Yes", free: "812 GB", inode: "4.2M / 8M" }}
                />
                <PathField
                  label="Model Checkpoints"
                  description="Directory for storing trained model weights and optimizer states"
                  value="/models/huggingface/weights_v4"
                  verifyState={checkpointPathState} onVerify={handleVerifyCheckpoint}
                  pathMeta={{ writable: "Yes", free: "1.4 TB", inode: "890K / 4M" }}
                />
                <PathField
                  label="Build Cache"
                  description="Temporary cache for compilation artifacts and intermediate representations"
                  value="/tmp/crystal-forge/cache/build_v3"
                  verifyState={cachePathState} onVerify={handleVerifyCache}
                  pathMeta={{ writable: "Yes", free: "245 GB", inode: "1.1M / 2M" }}
                />
                <div className="pt-4 mt-2" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>Storage Utilization</span>
                    <span style={{ fontSize: 11, fontFamily: T.mono, color: T.textSecondary }}>1.8 TB / 4.0 TB <span style={{ color: T.textMuted }}>(45%)</span></span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div style={{ width: "30%", background: `linear-gradient(90deg, ${T.violet}90, ${T.violet})`, boxShadow: `0 0 6px ${T.violetGlow}` }} />
                    <div style={{ width: "10.5%", background: `linear-gradient(90deg, ${T.cyan}90, ${T.cyan})`, marginLeft: 1 }} />
                    <div style={{ width: "4.5%", background: `linear-gradient(90deg, ${T.emerald}90, ${T.emerald})`, marginLeft: 1 }} />
                  </div>
                  <div className="flex items-center gap-6 mt-2.5">
                    {[
                      { label: "Models", value: "1.2 TB", color: T.violet, pct: "30%" },
                      { label: "Checkpoints", value: "420 GB", color: T.cyan, pct: "10.5%" },
                      { label: "Cache", value: "180 GB", color: T.emerald, pct: "4.5%" },
                      { label: "Free", value: "2.2 TB", color: T.textMuted, pct: "55%" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded" style={{ background: s.color }} />
                        <span style={{ fontSize: 10, color: T.textTertiary }}>{s.label}:</span>
                        <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: T.textSecondary }}>{s.value}</span>
                        <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>({s.pct})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassSection>

              {/* ═══ SECTION 03: AI CALIBRATION ═══ */}
              <GlassSection
                id="calibration"
                number={3}
                title="AI MODEL CALIBRATION"
                subtitle="Fine-tune inference parameters for optimal output quality"
                icon={Sparkles}
                headerRight={
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg" style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: T.cyanBright, background: T.cyanDim, border: `1px solid ${T.borderCyan}` }}>
                      GPT-4o Active
                    </span>
                  </div>
                }
              >
                <div className="grid grid-cols-2 gap-x-10 gap-y-0">
                  <SliderField
                    label="Model Temperature"
                    description="Controls randomness and creativity in generated outputs. Lower values produce more focused, deterministic responses."
                    min={0} max={1} step={0.05} value={temperature} onChange={setTemperature}
                    formatValue={(v) => v.toFixed(2)}
                    ticks={[{ value: 0, label: "0.0" }, { value: 0.25, label: "0.25" }, { value: 0.5, label: "0.50" }, { value: 0.7, label: "0.70" }, { value: 1.0, label: "1.0" }]}
                  />
                  <SliderField
                    label="Top-P (Nucleus Sampling)"
                    description="Limits token selection to the smallest set whose cumulative probability exceeds P. Controls diversity."
                    min={0} max={1} step={0.05} value={topP} onChange={setTopP}
                    formatValue={(v) => v.toFixed(2)}
                    ticks={[{ value: 0, label: "0.0" }, { value: 0.25, label: "0.25" }, { value: 0.5, label: "0.50" }, { value: 0.75, label: "0.75" }, { value: 1.0, label: "1.0" }]}
                    color={T.cyan} colorBright={T.cyanBright} colorDim={T.cyanDim}
                  />
                  <SliderField
                    label="Context Window"
                    description="Maximum number of tokens the model can consider at once. Higher values increase memory usage and latency."
                    min={4096} max={32768} step={1024} value={contextWindow} onChange={setContextWindow}
                    formatValue={(v) => `${Math.round(v / 1024)}K tokens`}
                    ticks={[{ value: 4096, label: "4K" }, { value: 8192, label: "8K" }, { value: 16384, label: "16K" }, { value: 32768, label: "32K" }]}
                    color={T.emerald} colorBright="#34D399" colorDim={T.emeraldDim}
                  />
                  <SliderField
                    label="Frequency Penalty"
                    description="Penalizes tokens based on their frequency in the text so far. Reduces repetition in outputs."
                    min={0} max={2} step={0.1} value={frequencyPenalty} onChange={setFrequencyPenalty}
                    formatValue={(v) => v.toFixed(1)}
                    ticks={[{ value: 0, label: "0.0" }, { value: 0.5, label: "0.5" }, { value: 1.0, label: "1.0" }, { value: 1.5, label: "1.5" }, { value: 2.0, label: "2.0" }]}
                    color={T.amber} colorBright="#FCD34D" colorDim={T.amberDim}
                  />
                </div>
                <SliderField
                  label="Response Filtering Sensitivity"
                  description="Threshold for the content filtering pipeline. Higher values apply stricter moderation rules and reject borderline outputs."
                  min={0} max={1} step={0.05} value={responseFiltering} onChange={setResponseFiltering}
                  formatValue={(v) => `${(v * 100).toFixed(0)}% — ${v >= 0.75 ? "High" : v >= 0.4 ? "Medium" : "Low"}`}
                  ticks={[{ value: 0, label: "Off" }, { value: 0.25, label: "Low" }, { value: 0.5, label: "Med" }, { value: 0.75, label: "High" }, { value: 1.0, label: "Strict" }]}
                  color={T.rose} colorBright="#FB7185" colorDim={T.roseDim}
                />
                <div className="pt-4 mt-2" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Brain size={12} color={T.violet} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary, letterSpacing: "0.06em" }}>ACTIVE MODEL PROFILE</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "MODEL", value: "GPT-4o", color: T.violetBright, sub: "gpt-4o-2025-01-06" },
                      { label: "CONTEXT", value: `${Math.round(contextWindow / 1024)}K`, color: T.cyanBright, sub: `${contextWindow.toLocaleString()} tokens` },
                      { label: "TEMPERATURE", value: temperature.toFixed(2), color: T.amber, sub: temperature > 0.7 ? "Creative" : "Precise" },
                      { label: "TOP-P", value: topP.toFixed(2), color: T.emerald, sub: topP > 0.9 ? "Diverse" : "Focused" },
                      { label: "FREQ PENALTY", value: frequencyPenalty.toFixed(1), color: T.textSecondary, sub: "Token-level" },
                      { label: "PRES PENALTY", value: "0.0", color: T.textSecondary, sub: "Topic-level" },
                      { label: "MAX OUTPUT", value: "4,096", color: T.textSecondary, sub: "Completion cap" },
                      { label: "LATENCY", value: "~340ms", color: T.cyanBright, sub: "p50 TTFT" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="px-3 py-2.5 rounded-xl transition-all"
                        style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.borderSubtle; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                      >
                        <div style={{ fontSize: 8, color: T.textMuted, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 14, fontFamily: T.mono, fontWeight: 700, color: item.color }}>{item.value}</div>
                        <div style={{ fontSize: 9, color: T.textTertiary, marginTop: 2 }}>{item.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassSection>

              {/* ═══ SECTION 04: INTEGRATION SETTINGS ═══ */}
              <GlassSection id="models" number={4} title="INTEGRATION SETTINGS" subtitle="Fine-tune how API connections and model routing behave" icon={Plug}>
                <SettingRow label="Auto-save credentials" description="Persist encrypted keys across sessions">
                  <Toggle enabled={autoSave} onChange={() => setAutoSave(!autoSave)} />
                </SettingRow>
                <SettingRow label="Enable rate limiting" description="Throttle requests to stay within provider limits">
                  <Toggle enabled={rateLimitToggle} onChange={() => setRateLimitToggle(!rateLimitToggle)} />
                </SettingRow>
                <SettingRow label="Stream responses" description="Use SSE streaming for real-time output">
                  <Toggle enabled={streamResponse} onChange={() => setStreamResponse(!streamResponse)} />
                </SettingRow>
                <SettingRow label="Fallback model routing" description="Automatically switch to backup model on failure">
                  <Toggle enabled={fallbackModel} onChange={() => setFallbackModel(!fallbackModel)} />
                </SettingRow>
                <SettingRow label="Debug mode" description="Log all API request/response payloads">
                  <Toggle enabled={debugMode} onChange={() => setDebugMode(!debugMode)} />
                </SettingRow>
                <SettingRow label="Send telemetry" description="Anonymous usage analytics for model performance">
                  <Toggle enabled={telemetry} onChange={() => setTelemetry(!telemetry)} />
                </SettingRow>
              </GlassSection>

              {/* ═══ SECTION 05: SYSTEM DIAGNOSTICS ═══ */}
              <GlassSection
                id="system"
                number={5}
                title="SYSTEM DIAGNOSTICS"
                subtitle="Runtime environment, hardware telemetry, and container status"
                icon={Cpu}
                headerRight={
                  <div className="flex items-center gap-3">
                    <MiniRingGauge pct={78} color={T.violet} label="CPU" />
                    <MiniRingGauge pct={92} color={T.amber} label="MEM" />
                    <MiniRingGauge pct={45} color={T.emerald} label="DISK" />
                    <MiniRingGauge pct={12} color={T.cyanBright} label="NET" />
                  </div>
                }
              >
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Server, label: "Runtime", value: "Node.js 20.11.0", status: "OK", statusColor: T.emerald, sub: "V8 12.4.254.20" },
                    { icon: Zap, label: "CUDA Toolkit", value: "12.3 / Driver 545.29", status: "OK", statusColor: T.emerald, sub: "cuDNN 8.9.7" },
                    { icon: Cpu, label: "GPU Compute", value: "A100 80GB SXM4 x4", status: "Active", statusColor: T.cyanBright, sub: "PCIe Gen4 x16" },
                    { icon: MemoryStick, label: "System Memory", value: "256 GB DDR5-4800", status: "92% used", statusColor: T.amber, sub: "236 GB / 256 GB" },
                    { icon: Wifi, label: "Network", value: "10 GbE / 12ms latency", status: "Stable", statusColor: T.emerald, sub: "InfiniBand HDR" },
                    { icon: Layers, label: "Container", value: "k8s v1.28 / pod-alpha-02", status: "Running", statusColor: T.cyanBright, sub: "Limits: 64C / 192G" },
                    { icon: ThermometerSun, label: "Thermal", value: "GPU: 67C / CPU: 54C", status: "Normal", statusColor: T.emerald, sub: "Fan: 2400 RPM" },
                    { icon: Database, label: "Storage I/O", value: "NVMe: 3.2 GB/s seq", status: "Healthy", statusColor: T.emerald, sub: "SMART: PASS" },
                    { icon: Globe, label: "DNS / CDN", value: "Cloudflare / 1.1.1.1", status: "Active", statusColor: T.emerald, sub: "TTL: 300s" },
                  ].map((d) => {
                    const DIcon = d.icon;
                    return (
                      <div
                        key={d.label}
                        className="px-4 py-3.5 rounded-xl transition-all"
                        style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${T.borderSubtle}` }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.borderSubtle; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <DIcon size={12} color={T.textTertiary} />
                            <span style={{ fontSize: 9, color: T.textMuted, fontWeight: 700, letterSpacing: "0.1em" }}>{d.label.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.statusColor, boxShadow: `0 0 5px ${d.statusColor}70` }} />
                            <span style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 600, color: d.statusColor }}>{d.status}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, fontFamily: T.mono, color: T.textSecondary, lineHeight: 1.4 }}>{d.value}</div>
                        <div style={{ fontSize: 9, color: T.textMuted, marginTop: 3 }}>{d.sub}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-4 pt-3" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                  {["SYS_HASH: 0xAF29E41D", "UPTIME: 14d 06:42:18", "PID: 4096", "KERNEL: 6.1.0-rc8", "ARCH: x86_64", "GLIBC: 2.38", "OPENSSL: 3.2.0", "NCCL: 2.19.3"].map((s) => (
                    <span key={s} style={{ fontSize: 8, fontFamily: T.mono, color: T.textMuted }}>{s}</span>
                  ))}
                </div>
              </GlassSection>

              {/* ═══ SECTION 06: NOTIFICATIONS ═══ */}
              <GlassSection id="notifications" number={6} title="NOTIFICATIONS & ALERTS" subtitle="Configure alert thresholds, channels, and escalation policies" icon={Bell}>
                <SettingRow label="Build failure alerts" description="Push notification on pipeline failure">
                  <Toggle enabled={toggles.buildAlerts} onChange={() => tog("buildAlerts")} />
                </SettingRow>
                <SettingRow label="API quota warnings" description="Alert when usage exceeds 80% of quota">
                  <Toggle enabled={toggles.apiQuota} onChange={() => tog("apiQuota")} />
                </SettingRow>
                <SettingRow label="Security audit digest" description="Weekly summary of access logs and key rotations">
                  <Toggle enabled={toggles.securityDigest} onChange={() => tog("securityDigest")} />
                </SettingRow>
                <SettingRow label="Model drift detection" description="Alert when inference quality drops below threshold">
                  <Toggle enabled={toggles.modelDrift} onChange={() => tog("modelDrift")} />
                </SettingRow>
                <SettingRow label="Thermal throttling alerts" description="Notify when GPU temperature exceeds 85°C">
                  <Toggle enabled={toggles.thermalAlerts} onChange={() => tog("thermalAlerts")} />
                </SettingRow>
                <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                  {[
                    { label: "Slack", status: "Connected", color: T.emerald },
                    { label: "Email", status: "Verified", color: T.emerald },
                    { label: "PagerDuty", status: "Not configured", color: T.textMuted },
                  ].map((ch) => (
                    <div key={ch.label} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: ch.color, boxShadow: ch.color !== T.textMuted ? `0 0 4px ${ch.color}60` : "none" }} />
                      <span style={{ fontSize: 9, color: T.textTertiary }}>{ch.label}:</span>
                      <span style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 600, color: ch.color }}>{ch.status}</span>
                    </div>
                  ))}
                </div>
              </GlassSection>

              {/* ═══ SECTION 07: APPEARANCE ═══ */}
              <GlassSection id="appearance" number={7} title="APPEARANCE & DISPLAY" subtitle="Theme, layout density, and visual preferences" icon={Palette}>
                <SettingRow label="Theme" description="Obsidian Crystal is the only theme worthy of this workstation">
                  <span className="px-3 py-1 rounded-lg" style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: T.violetBright, background: T.violetDim, border: `1px solid rgba(139,92,246,0.2)` }}>
                    Obsidian Crystal
                  </span>
                </SettingRow>
                <SettingRow label="UI density" description="Controls spacing and information density across panels">
                  <span className="px-3 py-1 rounded-lg" style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 700, color: T.cyanBright, background: T.cyanDim, border: `1px solid ${T.borderCyan}` }}>
                    Technical Saturation
                  </span>
                </SettingRow>
                <SettingRow label="Neon glow effects" description="Violet and cyan glow on interactive elements">
                  <Toggle enabled={toggles.neonGlow} onChange={() => tog("neonGlow")} />
                </SettingRow>
                <SettingRow label="Glassmorphism blur" description="32px backdrop-filter blur on elevated surfaces">
                  <Toggle enabled={toggles.glassBlur} onChange={() => tog("glassBlur")} />
                </SettingRow>
                <SettingRow label="Animated transitions" description="Smooth state transitions and micro-interactions">
                  <Toggle enabled={toggles.animatedTransitions} onChange={() => tog("animatedTransitions")} />
                </SettingRow>
              </GlassSection>

              {/* ═══ SECTION 08: SECURITY ═══ */}
              <GlassSection id="security" number={8} title="SECURITY & AUTHENTICATION" subtitle="Access control, session management, and compliance settings" icon={Shield}>
                <SettingRow label="Two-factor authentication" description="Require TOTP or hardware key for session access">
                  <Toggle enabled={toggles.twoFactor} onChange={() => tog("twoFactor")} />
                </SettingRow>
                <SettingRow label="Session timeout" description="Auto-lock workstation after inactivity">
                  <span className="px-3 py-1 rounded-lg" style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: T.textSecondary, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}` }}>
                    30 minutes
                  </span>
                </SettingRow>
                <SettingRow label="Audit logging" description="Record all configuration changes with user attribution">
                  <Toggle enabled={toggles.auditLog} onChange={() => tog("auditLog")} />
                </SettingRow>
                <SettingRow label="IP allowlist" description="Restrict access to approved network ranges">
                  <Toggle enabled={toggles.ipAllowlist} onChange={() => tog("ipAllowlist")} />
                </SettingRow>
                <SettingRow label="SOC 2 compliance mode" description="Enforce data handling policies for compliance">
                  <Toggle enabled={toggles.soc2} onChange={() => tog("soc2")} />
                </SettingRow>
                <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: `1px solid ${T.borderSubtle}` }}>
                  {[
                    { label: "2FA", color: T.emerald },
                    { label: "SSO", color: T.emerald },
                    { label: "mTLS", color: T.emerald },
                    { label: "RBAC", color: T.emerald },
                    { label: "SOC 2", color: T.emerald },
                  ].map((badge) => (
                    <div key={badge.label} className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ background: T.emeraldDim, border: `1px solid rgba(16,185,129,0.2)` }}>
                      <CheckCircle2 size={8} color={badge.color} />
                      <span style={{ fontSize: 8, fontWeight: 700, color: badge.color }}>{badge.label}</span>
                    </div>
                  ))}
                </div>
              </GlassSection>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsCalibrationView;
