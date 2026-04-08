/**
 * JPE STUDIO — DESIGN SYSTEM COMPONENT LIBRARY
 * Cyberpunk-themed reusable UI components for the JPE IDE
 * Charcoal/Slate + Electric Cyan + Neon Violet + Glassmorphism
 */
import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import {
  Search, X, ChevronDown, ChevronRight, ChevronUp,
  Check, AlertTriangle, Info, CheckCircle2, XCircle,
  Loader2, Command, CornerDownLeft,
  File, FileCode, FolderOpen,
  Star, Download, Shield, ExternalLink,
  Copy, MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { T } from "../pages/jpe-theme";

/* ═══════════════════════════════════════════════════════════════
   1. BUTTONS
   Variants: primary, secondary, ghost, danger, success, icon
   ═══════════════════════════════════════════════════════════════ */

export type JpeButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "icon";
export type JpeButtonSize = "xs" | "sm" | "md" | "lg";

const btnSizes: Record<JpeButtonSize, { h: number; px: number; fs: number; iconSize: number }> = {
  xs: { h: 24, px: 8, fs: 10, iconSize: 12 },
  sm: { h: 28, px: 10, fs: 11, iconSize: 13 },
  md: { h: 32, px: 14, fs: 12, iconSize: 14 },
  lg: { h: 38, px: 18, fs: 13, iconSize: 16 },
};

const btnVariantStyles: Record<JpeButtonVariant, { bg: string; border: string; color: string; hoverBg: string; glow: string }> = {
  primary: {
    bg: `linear-gradient(135deg, ${T.cyan}20, ${T.violet}15)`,
    border: `1px solid ${T.borderActive}`,
    color: T.cyanBright,
    hoverBg: `linear-gradient(135deg, ${T.cyan}30, ${T.violet}25)`,
    glow: T.glowCyan,
  },
  secondary: {
    bg: T.bgElevated,
    border: `1px solid ${T.border}`,
    color: T.textSecondary,
    hoverBg: T.bgHover,
    glow: "none",
  },
  ghost: {
    bg: "transparent",
    border: "1px solid transparent",
    color: T.textTertiary,
    hoverBg: "rgba(255,255,255,0.05)",
    glow: "none",
  },
  danger: {
    bg: `${T.rose}12`,
    border: `1px solid ${T.rose}30`,
    color: T.rose,
    hoverBg: `${T.rose}20`,
    glow: `0 0 12px ${T.rose}20`,
  },
  success: {
    bg: `${T.emerald}12`,
    border: `1px solid ${T.emerald}30`,
    color: T.emerald,
    hoverBg: `${T.emerald}20`,
    glow: `0 0 12px ${T.emerald}20`,
  },
  icon: {
    bg: "transparent",
    border: "1px solid transparent",
    color: T.textTertiary,
    hoverBg: "rgba(255,255,255,0.06)",
    glow: "none",
  },
};

export function JpeButton({
  children, variant = "primary", size = "md", icon: Icon, iconRight: IconRight,
  disabled, loading, onClick, title, className = "",
}: {
  children?: ReactNode; variant?: JpeButtonVariant; size?: JpeButtonSize;
  icon?: LucideIcon; iconRight?: LucideIcon; disabled?: boolean; loading?: boolean;
  onClick?: () => void; title?: string; className?: string;
}) {
  const s = btnSizes[size];
  const v = btnVariantStyles[variant];
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg transition-all select-none ${className}`}
      style={{
        height: s.h,
        padding: variant === "icon" ? `0 ${s.h / 2 - s.iconSize / 2}px` : `0 ${s.px}px`,
        minWidth: variant === "icon" ? s.h : undefined,
        fontSize: s.fs,
        fontFamily: T.sans,
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: disabled ? T.textMuted : v.color,
        background: hovered && !disabled ? v.hoverBg : v.bg,
        border: v.border,
        boxShadow: hovered && !disabled ? v.glow : "none",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled || loading ? "not-allowed" : "pointer",
      }}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading ? <Loader2 size={s.iconSize} className="animate-spin" /> : Icon && <Icon size={s.iconSize} />}
      {children}
      {IconRight && <IconRight size={s.iconSize} />}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. DROPDOWN
   ═══════════════════════════════════════════════════════════════ */

export interface JpeDropdownItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  color?: string;
  disabled?: boolean;
  divider?: boolean;
}

export function JpeDropdown({
  items, value, onChange, placeholder = "Select...", width = 180, size = "md",
}: {
  items: JpeDropdownItem[];
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
  width?: number;
  size?: JpeButtonSize;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = items.find(i => i.id === value);
  const s = btnSizes[size];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" style={{ width }}>
      <button
        className="w-full flex items-center justify-between rounded-lg transition-all"
        style={{
          height: s.h, padding: `0 ${s.px}px`,
          fontSize: s.fs, fontFamily: T.sans, fontWeight: 500,
          color: selected ? T.textPrimary : T.textMuted,
          background: T.bgInput, border: `1px solid ${open ? T.borderActive : T.border}`,
          boxShadow: open ? T.glowCyan : "none",
        }}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 truncate">
          {selected?.icon && <selected.icon size={s.iconSize - 2} color={selected.color || T.textTertiary} />}
          <span className="truncate">{selected?.label || placeholder}</span>
        </div>
        <ChevronDown size={12} color={T.textMuted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
          style={{
            background: T.bgGlass, backdropFilter: T.glassBlur,
            border: `1px solid ${T.border}`, boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
          }}
        >
          {items.map((item) => (
            item.divider ? (
              <div key={item.id} className="h-px mx-2" style={{ background: T.border }} />
            ) : (
              <button
                key={item.id}
                className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
                style={{
                  fontSize: s.fs, fontFamily: T.sans,
                  color: item.disabled ? T.textMuted : item.id === value ? T.cyanBright : T.textSecondary,
                  background: item.id === value ? `${T.cyan}08` : "transparent",
                  opacity: item.disabled ? 0.5 : 1,
                }}
                disabled={item.disabled}
                onClick={() => { onChange(item.id); setOpen(false); }}
                onMouseEnter={e => (e.currentTarget.style.background = `${T.cyan}10`)}
                onMouseLeave={e => (e.currentTarget.style.background = item.id === value ? `${T.cyan}08` : "transparent")}
              >
                {item.icon && <item.icon size={s.iconSize - 2} color={item.color || T.textTertiary} />}
                <span className="truncate">{item.label}</span>
                {item.id === value && <Check size={12} color={T.cyan} className="ml-auto" />}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. FILE TABS
   ═══════════════════════════════════════════════════════════════ */

export interface JpeFileTab {
  id: string;
  name: string;
  icon?: LucideIcon;
  iconColor?: string;
  modified?: boolean;
  pinned?: boolean;
}

export function JpeFileTabs({
  tabs, activeId, onSelect, onClose, onAdd,
}: {
  tabs: JpeFileTab[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose?: (id: string) => void;
  onAdd?: () => void;
}) {
  return (
    <div className="flex items-center h-[34px] overflow-x-auto flex-shrink-0" style={{ background: T.bgPanel, borderBottom: `1px solid ${T.border}` }}>
      {tabs.map(tab => {
        const isActive = tab.id === activeId;
        const Icon = tab.icon || FileCode;
        return (
          <button
            key={tab.id}
            className="flex items-center gap-1.5 px-3 h-full relative group transition-colors flex-shrink-0"
            style={{
              fontSize: 11, fontFamily: T.sans, fontWeight: isActive ? 600 : 400,
              color: isActive ? T.textPrimary : T.textTertiary,
              background: isActive ? T.bgDeep : "transparent",
              borderRight: `1px solid ${T.borderSubtle}`,
            }}
            onClick={() => onSelect(tab.id)}
          >
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${T.cyan}, ${T.violet})` }} />
            )}
            <Icon size={13} color={tab.iconColor || (isActive ? T.cyan : T.textMuted)} />
            <span>{tab.name}</span>
            {tab.modified && (
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: T.amber }} />
            )}
            {tab.pinned && <Star size={9} color={T.amber} fill={T.amber} />}
            {onClose && !tab.pinned && (
              <button
                className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: T.textMuted }}
                onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <X size={10} />
              </button>
            )}
          </button>
        );
      })}
      {onAdd && (
        <button
          className="flex items-center justify-center w-7 h-full transition-colors"
          style={{ color: T.textMuted }}
          onClick={onAdd}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. CODE EDITOR
   A mini syntax-highlighted code display with line numbers
   ═══════════════════════════════════════════════════════════════ */

export interface JpeCodeLine {
  num: number;
  text: string;
  type: "tag" | "attr" | "value" | "comment" | "keyword" | "string" | "plain";
}

const codeTypeColors: Record<string, string> = {
  tag: T.cyan,
  attr: T.violetBright,
  value: T.emerald,
  comment: T.textMuted,
  keyword: T.rose,
  string: T.amber,
  plain: T.textSecondary,
};

export function JpeCodeEditor({
  lines, activeLine, breakpoints = [], highlights = [], height = 300, title,
  onLineClick,
}: {
  lines: JpeCodeLine[];
  activeLine?: number;
  breakpoints?: number[];
  highlights?: number[];
  height?: number | string;
  title?: string;
  onLineClick?: (lineNum: number) => void;
}) {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden" style={{ height, background: T.bgDeep, border: `1px solid ${T.border}` }}>
      {title && (
        <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0" style={{ background: T.bgPanel, borderBottom: `1px solid ${T.border}` }}>
          <FileCode size={12} color={T.cyan} />
          <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color: T.textSecondary, textTransform: "uppercase", letterSpacing: "0.1em" }}>{title}</span>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {lines.map(line => {
          const isActive = line.num === activeLine;
          const isBp = breakpoints.includes(line.num);
          const isHighlight = highlights.includes(line.num);
          return (
            <div
              key={line.num}
              className="flex items-center group cursor-pointer"
              style={{
                minHeight: 22,
                background: isActive ? `${T.cyan}0A` : isHighlight ? `${T.violet}08` : "transparent",
                borderLeft: isBp ? `3px solid ${T.rose}` : "3px solid transparent",
              }}
              onClick={() => onLineClick?.(line.num)}
            >
              <span
                className="w-10 text-right pr-3 flex-shrink-0 select-none"
                style={{ fontSize: 11, fontFamily: T.mono, color: isActive ? T.cyan : T.textDim }}
              >
                {line.num}
              </span>
              <span
                className="flex-1 pr-4"
                style={{ fontSize: 12, fontFamily: T.mono, color: codeTypeColors[line.type] || T.textSecondary, whiteSpace: "pre" }}
              >
                {line.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. TOOL PANEL
   A collapsible, glassmorphic side panel container
   ═══════════════════════════════════════════════════════════════ */

export function JpeToolPanel({
  title, icon: Icon, iconColor = T.textTertiary, children, collapsible = true,
  defaultOpen = true, actions, badge, headerColor,
}: {
  title: string; icon?: LucideIcon; iconColor?: string;
  children: ReactNode; collapsible?: boolean; defaultOpen?: boolean;
  actions?: ReactNode; badge?: string | number; headerColor?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: T.bgGlass, border: `1px solid ${T.border}`, backdropFilter: T.glassBlur }}>
      <button
        className="w-full flex items-center justify-between px-3 py-2 transition-colors"
        style={{ background: headerColor || "transparent", borderBottom: open ? `1px solid ${T.border}` : "none" }}
        onClick={() => collapsible && setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {collapsible && (open ? <ChevronDown size={11} color={T.textMuted} /> : <ChevronRight size={11} color={T.textMuted} />)}
          {Icon && <Icon size={13} color={iconColor} />}
          <span style={{ fontSize: 10, fontWeight: 700, fontFamily: T.sans, letterSpacing: "0.14em", textTransform: "uppercase", color: T.textSecondary }}>
            {title}
          </span>
          {badge !== undefined && (
            <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 9, fontFamily: T.mono, fontWeight: 600, color: T.cyan, background: T.cyanDim }}>
              {badge}
            </span>
          )}
        </div>
        {actions && <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>{actions}</div>}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. GRAPH VIEWER
   A mini node-edge graph visualization (CSS-based)
   ═══════════════════════════════════════════════════════════════ */

export interface JpeGraphNode {
  id: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  color: string;
  size?: number;
  type?: string;
}

export interface JpeGraphEdge {
  from: string;
  to: string;
  color?: string;
  dashed?: boolean;
}

export function JpeGraphViewer({
  nodes, edges, height = 280, onNodeClick, selectedNode,
}: {
  nodes: JpeGraphNode[];
  edges: JpeGraphEdge[];
  height?: number;
  onNodeClick?: (id: string) => void;
  selectedNode?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden"
      style={{ height, background: T.bgDeep, border: `1px solid ${T.border}` }}
    >
      {/* Grid background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(${T.border} 1px, transparent 1px),
          linear-gradient(90deg, ${T.border} 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        opacity: 0.5,
      }} />

      {/* Edges (lines rendered as positioned pseudo-divs) */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        {edges.map((edge, i) => {
          const from = nodes.find(n => n.id === edge.from);
          const to = nodes.find(n => n.id === edge.to);
          if (!from || !to) return null;
          return (
            <line
              key={`edge-${i}`}
              x1={`${from.x}%`} y1={`${from.y}%`}
              x2={`${to.x}%`} y2={`${to.y}%`}
              stroke={edge.color || T.borderGlow}
              strokeWidth={1.5}
              strokeDasharray={edge.dashed ? "4 4" : undefined}
              opacity={0.6}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map(node => {
        const size = node.size || 28;
        const isSelected = node.id === selectedNode;
        return (
          <button
            key={node.id}
            className="absolute flex items-center justify-center rounded-full transition-all"
            style={{
              left: `${node.x}%`, top: `${node.y}%`,
              width: size, height: size,
              transform: "translate(-50%, -50%)",
              background: `${node.color}25`,
              border: `2px solid ${isSelected ? node.color : `${node.color}60`}`,
              boxShadow: isSelected ? `0 0 16px ${node.color}40` : `0 0 8px ${node.color}15`,
              zIndex: isSelected ? 10 : 1,
            }}
            onClick={() => onNodeClick?.(node.id)}
          >
            <span style={{ fontSize: 8, fontFamily: T.mono, fontWeight: 700, color: node.color }}>{node.label.slice(0, 3).toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. NOTIFICATION POPUP
   Toast-style notifications with severity levels
   ═══════════════════════════════════════════════════════════════ */

export type JpeNotifType = "info" | "success" | "warning" | "error";

const notifConfig: Record<JpeNotifType, { icon: LucideIcon; color: string; bg: string; borderColor: string }> = {
  info: { icon: Info, color: T.cyan, bg: `${T.cyan}08`, borderColor: `${T.cyan}25` },
  success: { icon: CheckCircle2, color: T.emerald, bg: `${T.emerald}08`, borderColor: `${T.emerald}25` },
  warning: { icon: AlertTriangle, color: T.amber, bg: `${T.amber}08`, borderColor: `${T.amber}25` },
  error: { icon: XCircle, color: T.rose, bg: `${T.rose}08`, borderColor: `${T.rose}25` },
};

export function JpeNotification({
  type = "info", title, message, onDismiss, action, timestamp,
}: {
  type?: JpeNotifType; title: string; message?: string;
  onDismiss?: () => void; action?: { label: string; onClick: () => void };
  timestamp?: string;
}) {
  const cfg = notifConfig[type];
  const Icon = cfg.icon;

  return (
    <div
      className="flex gap-3 p-3 rounded-xl relative overflow-hidden"
      style={{
        background: T.bgGlass, backdropFilter: T.glassBlur,
        border: `1px solid ${cfg.borderColor}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 12px ${cfg.color}10`,
        maxWidth: 360,
      }}
    >
      {/* Accent line */}
      <div className="absolute top-0 left-0 w-[3px] h-full" style={{ background: cfg.color }} />

      <Icon size={16} color={cfg.color} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>{title}</span>
          {timestamp && <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>{timestamp}</span>}
        </div>
        {message && <p style={{ fontSize: 11, color: T.textSecondary, marginTop: 2, lineHeight: 1.5 }}>{message}</p>}
        {action && (
          <button
            className="mt-2 px-2 py-0.5 rounded-md transition-colors"
            style={{ fontSize: 10, fontWeight: 600, color: cfg.color, background: `${cfg.color}12`, border: `1px solid ${cfg.color}20` }}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button className="flex-shrink-0 p-0.5 rounded transition-colors" onClick={onDismiss} style={{ color: T.textMuted }}>
          <X size={12} />
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. STATUS INDICATORS
   Dot, badge, and bar-style status indicators
   ═══════════════════════════════════════════════════════════════ */

export type JpeStatusLevel = "ok" | "warning" | "error" | "info" | "idle" | "running";

const statusColors: Record<JpeStatusLevel, string> = {
  ok: T.emerald,
  warning: T.amber,
  error: T.rose,
  info: T.cyan,
  idle: T.textMuted,
  running: T.violet,
};

export function JpeStatusDot({ status, pulse = false, size = 8 }: { status: JpeStatusLevel; pulse?: boolean; size?: number }) {
  const color = statusColors[status];
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="rounded-full" style={{ width: size, height: size, background: color, boxShadow: `0 0 6px ${color}80` }} />
      {pulse && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: color, opacity: 0.3 }} />}
    </div>
  );
}

export function JpeStatusBadge({ status, label, compact }: { status: JpeStatusLevel; label?: string; compact?: boolean }) {
  const color = statusColors[status];
  const defaultLabels: Record<JpeStatusLevel, string> = { ok: "Ready", warning: "Warning", error: "Error", info: "Info", idle: "Idle", running: "Running" };
  const text = label || defaultLabels[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md"
      style={{
        padding: compact ? "1px 6px" : "2px 8px",
        fontSize: compact ? 9 : 10,
        fontFamily: T.mono,
        fontWeight: 600,
        color,
        background: `${color}12`,
        border: `1px solid ${color}20`,
      }}
    >
      <JpeStatusDot status={status} size={compact ? 5 : 6} />
      {text}
    </span>
  );
}

export function JpeProgressBar({
  value, max = 100, color = T.cyan, secondaryColor, height = 4, animated, label,
}: {
  value: number; max?: number; color?: string; secondaryColor?: string;
  height?: number; animated?: boolean; label?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span style={{ fontSize: 10, color: T.textTertiary }}>{label}</span>
          <span style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="w-full rounded-full overflow-hidden" style={{ height, background: "rgba(255,255,255,0.04)" }}>
        <div
          className={`h-full rounded-full ${animated ? "transition-all duration-700" : ""}`}
          style={{
            width: `${pct}%`,
            background: secondaryColor ? `linear-gradient(90deg, ${secondaryColor}, ${color})` : color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. LOADING ANIMATIONS
   Spinners, skeleton loaders, progress rings
   ═══════════════════════════════════════════════════════════════ */

export function JpeSpinner({ size = 20, color = T.cyan }: { size?: number; color?: string }) {
  return (
    <div className="animate-spin" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke={`${color}20`} strokeWidth="3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function JpeSkeleton({ width, height = 16, rounded = true }: { width?: number | string; height?: number; rounded?: boolean }) {
  return (
    <div
      className="animate-pulse"
      style={{
        width: width || "100%",
        height,
        borderRadius: rounded ? 6 : 0,
        background: `linear-gradient(90deg, ${T.bgElevated} 25%, ${T.bgHover} 50%, ${T.bgElevated} 75%)`,
        backgroundSize: "200% 100%",
      }}
    />
  );
}

export function JpeProgressRing({ value, size = 48, strokeWidth = 4, color = T.cyan, label }: { value: number; size?: number; strokeWidth?: number; color?: string; label?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`${color}15`} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease", filter: `drop-shadow(0 0 4px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: size * 0.22, fontFamily: T.mono, fontWeight: 700, color }}>{label || `${Math.round(value)}%`}</span>
      </div>
    </div>
  );
}

export function JpePulseLoader({ color = T.cyan, count = 3, size = 6 }: { color?: string; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-full animate-pulse"
          style={{
            width: size, height: size, background: color,
            animationDelay: `${i * 0.15}s`,
            boxShadow: `0 0 6px ${color}60`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. COMMAND PALETTE
   VS Code-style fuzzy command picker
   ═══════════════════════════════════════════════════════════════ */

export interface JpeCommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  shortcut?: string;
  category?: string;
}

export function JpeCommandPalette({
  items, open, onClose, onSelect, placeholder = "Type a command...",
}: {
  items: JpeCommandItem[];
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter(i =>
    i.label.toLowerCase().includes(query.toLowerCase()) ||
    (i.description || "").toLowerCase().includes(query.toLowerCase()) ||
    (i.category || "").toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && filtered[selectedIdx]) { onSelect(filtered[selectedIdx].id); onClose(); }
  }, [filtered, selectedIdx, onClose, onSelect]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div
        className="relative w-[520px] rounded-2xl overflow-hidden"
        style={{
          background: T.bgGlass, backdropFilter: T.glassBlur,
          border: `1px solid ${T.border}`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), ${T.glowCyan}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
          <Command size={14} color={T.textMuted} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 13, fontFamily: T.sans, color: T.textPrimary }}
          />
          <kbd className="px-1.5 py-0.5 rounded" style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, background: T.bgActive, border: `1px solid ${T.border}` }}>ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[340px] overflow-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center" style={{ fontSize: 12, color: T.textMuted }}>No matching commands</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIdx;
              return (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-4 py-2 transition-colors text-left"
                  style={{
                    background: isSelected ? `${T.cyan}0A` : "transparent",
                    borderLeft: isSelected ? `2px solid ${T.cyan}` : "2px solid transparent",
                  }}
                  onClick={() => { onSelect(item.id); onClose(); }}
                  onMouseEnter={() => setSelectedIdx(idx)}
                >
                  {Icon && <Icon size={14} color={item.iconColor || T.textTertiary} />}
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 12, fontWeight: 500, color: isSelected ? T.textPrimary : T.textSecondary }}>{item.label}</div>
                    {item.description && (
                      <div style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>{item.description}</div>
                    )}
                  </div>
                  {item.category && (
                    <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, textTransform: "uppercase" }}>{item.category}</span>
                  )}
                  {item.shortcut && (
                    <kbd className="px-1.5 py-0.5 rounded ml-2" style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted, background: T.bgActive, border: `1px solid ${T.border}` }}>
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2" style={{ borderTop: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" style={{ fontSize: 10, color: T.textMuted }}>
              <ChevronUp size={10} /><ChevronDown size={10} /> navigate
            </span>
            <span className="flex items-center gap-1" style={{ fontSize: 10, color: T.textMuted }}>
              <CornerDownLeft size={10} /> select
            </span>
          </div>
          <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   11. SEARCH BAR
   IDE-style search with filter chips
   ═══════════════════════════════════════════════════════════════ */

export function JpeSearchBar({
  value, onChange, placeholder = "Search...", icon: Icon = Search,
  filters, activeFilter, onFilterChange, compact, width,
}: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; icon?: LucideIcon;
  filters?: { id: string; label: string }[];
  activeFilter?: string; onFilterChange?: (id: string) => void;
  compact?: boolean; width?: number | string;
}) {
  return (
    <div className="flex items-center gap-2" style={{ width }}>
      <div
        className="flex items-center gap-2 flex-1 rounded-lg px-3 transition-all"
        style={{
          height: compact ? 28 : 32,
          background: T.bgInput,
          border: `1px solid ${T.border}`,
        }}
      >
        <Icon size={compact ? 12 : 14} color={T.textMuted} />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none min-w-0"
          style={{ fontSize: compact ? 11 : 12, fontFamily: T.sans, color: T.textPrimary }}
        />
        {value && (
          <button onClick={() => onChange("")} className="p-0.5 rounded transition-colors" style={{ color: T.textMuted }}>
            <X size={12} />
          </button>
        )}
      </div>
      {filters && (
        <div className="flex items-center gap-1">
          {filters.map(f => (
            <button
              key={f.id}
              className="px-2 py-1 rounded-md transition-colors"
              style={{
                fontSize: 10, fontWeight: 600, fontFamily: T.sans,
                color: f.id === activeFilter ? T.cyanBright : T.textMuted,
                background: f.id === activeFilter ? T.cyanDim : "transparent",
                border: f.id === activeFilter ? `1px solid ${T.cyan}25` : "1px solid transparent",
              }}
              onClick={() => onFilterChange?.(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   12. MOD CARD
   Compact card for displaying mod information
   ═══════════════════════════════════════════════════════════════ */

export type JpeModCardStatus = "installed" | "update" | "available" | "outdated" | "conflict";

const modStatusConfig: Record<JpeModCardStatus, { label: string; color: string; bg: string }> = {
  installed: { label: "Installed", color: T.emerald, bg: T.emeraldDim },
  update: { label: "Update", color: T.amber, bg: T.amberDim },
  available: { label: "Available", color: T.cyan, bg: T.cyanDim },
  outdated: { label: "Outdated", color: T.rose, bg: T.roseDim },
  conflict: { label: "Conflict", color: T.rose, bg: T.roseDim },
};

export function JpeModCard({
  name, author, version, status, description, downloads, rating, category,
  icon: Icon, iconColor, onClick, compact,
}: {
  name: string; author: string; version: string; status: JpeModCardStatus;
  description?: string; downloads?: string; rating?: number; category?: string;
  icon?: LucideIcon; iconColor?: string; onClick?: () => void; compact?: boolean;
}) {
  const st = modStatusConfig[status];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`rounded-xl transition-all cursor-pointer ${compact ? "p-2.5" : "p-3"}`}
      style={{
        background: hovered ? T.bgGlassHover : T.bgGlass,
        border: `1px solid ${hovered ? T.borderGlow : T.border}`,
        backdropFilter: T.glassBlur,
        boxShadow: hovered ? T.glowCyan : "none",
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-2.5">
        {Icon && (
          <div
            className="flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ width: compact ? 28 : 34, height: compact ? 28 : 34, background: `${iconColor || T.cyan}12`, border: `1px solid ${iconColor || T.cyan}20` }}
          >
            <Icon size={compact ? 14 : 16} color={iconColor || T.cyan} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: compact ? 11 : 12, fontWeight: 600, color: T.textPrimary }} className="truncate">{name}</span>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>v{version}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span style={{ fontSize: 10, color: T.textTertiary }}>{author}</span>
            {category && (
              <>
                <span style={{ fontSize: 10, color: T.textDim }}>|</span>
                <span style={{ fontSize: 10, color: T.textMuted }}>{category}</span>
              </>
            )}
          </div>
          {description && !compact && (
            <p style={{ fontSize: 10, color: T.textTertiary, marginTop: 4, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <JpeStatusBadge status={status === "installed" ? "ok" : status === "update" ? "warning" : status === "conflict" ? "error" : "info"} label={st.label} compact />
            {downloads && (
              <span className="flex items-center gap-1" style={{ fontSize: 9, color: T.textMuted }}>
                <Download size={9} /> {downloads}
              </span>
            )}
            {rating !== undefined && (
              <span className="flex items-center gap-1" style={{ fontSize: 9, color: T.amber }}>
                <Star size={9} fill={T.amber} /> {rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   13. PLUGIN CARD
   Marketplace-style plugin card with install actions
   ═══════════════════════════════════════════════════════════════ */

export function JpePluginCard({
  name, author, version, description, icon: Icon, iconColor = T.violet,
  rating, reviews, downloads, installed, verified, tags = [],
  onInstall, onDetails, compact,
}: {
  name: string; author: string; version: string; description: string;
  icon?: LucideIcon; iconColor?: string;
  rating?: number; reviews?: number; downloads?: string;
  installed?: boolean; verified?: boolean; tags?: string[];
  onInstall?: () => void; onDetails?: () => void; compact?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`rounded-xl transition-all ${compact ? "p-3" : "p-4"}`}
      style={{
        background: hovered ? T.bgGlassHover : T.bgGlass,
        border: `1px solid ${hovered ? T.borderViolet : T.border}`,
        backdropFilter: T.glassBlur,
        boxShadow: hovered ? T.glowViolet : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0"
            style={{
              width: compact ? 36 : 44, height: compact ? 36 : 44,
              background: `linear-gradient(135deg, ${iconColor}15, ${iconColor}08)`,
              border: `1px solid ${iconColor}25`,
            }}
          >
            <Icon size={compact ? 18 : 22} color={iconColor} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: T.textPrimary }}>{name}</span>
            {verified && <Shield size={11} color={T.emerald} fill={`${T.emerald}30`} />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span style={{ fontSize: 10, color: T.textTertiary }}>{author}</span>
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>v{version}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onDetails && (
            <JpeButton variant="ghost" size="xs" icon={ExternalLink} onClick={onDetails} title="Details" />
          )}
          {onInstall && (
            <JpeButton
              variant={installed ? "secondary" : "primary"}
              size="xs"
              icon={installed ? Check : Download}
              onClick={onInstall}
              disabled={installed}
            >
              {installed ? "Installed" : "Install"}
            </JpeButton>
          )}
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 11, color: T.textTertiary, marginTop: 8, lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: compact ? 2 : 3, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {description}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {tags.slice(0, compact ? 3 : 5).map(tag => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded"
              style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted, background: T.bgActive, border: `1px solid ${T.borderSubtle}` }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center gap-4 mt-3" style={{ borderTop: `1px solid ${T.borderSubtle}`, paddingTop: 8 }}>
        {rating !== undefined && (
          <span className="flex items-center gap-1" style={{ fontSize: 10, color: T.amber }}>
            <Star size={10} fill={T.amber} /> {rating.toFixed(1)}
            {reviews !== undefined && <span style={{ color: T.textMuted }}> ({reviews})</span>}
          </span>
        )}
        {downloads && (
          <span className="flex items-center gap-1" style={{ fontSize: 10, color: T.textMuted }}>
            <Download size={10} /> {downloads}
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHOWCASE / DEMO COMPONENT
   Displays all design system components in a gallery view
   ═══════════════════════════════════════════════════════════════ */

const demoCodeLines: JpeCodeLine[] = [
  { num: 1, text: '<?xml version="1.0" encoding="utf-8"?>', type: "tag" },
  { num: 2, text: "<TuningRoot>", type: "tag" },
  { num: 3, text: '  <Instance i="trait" s="Creative">', type: "tag" },
  { num: 4, text: '    <Tunable name="display_name">', type: "attr" },
  { num: 5, text: "      0xA1B2C3D4 <!-- Creative -->", type: "value" },
  { num: 6, text: "    </Tunable>", type: "tag" },
  { num: 7, text: "    <!-- Trait description -->", type: "comment" },
  { num: 8, text: "  </Instance>", type: "tag" },
  { num: 9, text: "</TuningRoot>", type: "tag" },
];

const demoGraphNodes: JpeGraphNode[] = [
  { id: "mod", label: "Your Mod", x: 50, y: 50, color: T.cyan, size: 36 },
  { id: "base", label: "BaseGame", x: 20, y: 25, color: T.emerald, size: 30 },
  { id: "ep1", label: "EP01", x: 80, y: 25, color: T.emerald, size: 24 },
  { id: "dep", label: "MCCC", x: 25, y: 75, color: T.amber, size: 22 },
  { id: "conflict", label: "WW", x: 75, y: 75, color: T.rose, size: 26 },
];

const demoGraphEdges: JpeGraphEdge[] = [
  { from: "mod", to: "base", color: T.cyan },
  { from: "mod", to: "ep1", color: T.emerald, dashed: true },
  { from: "mod", to: "dep" },
  { from: "mod", to: "conflict", color: T.rose },
  { from: "dep", to: "base" },
];

const demoCommands: JpeCommandItem[] = [
  { id: "open", label: "Open File", description: "Open a file from workspace", icon: FolderOpen, shortcut: "Ctrl+O", category: "File" },
  { id: "search", label: "Search in Files", description: "Find text across all files", icon: Search, shortcut: "Ctrl+Shift+F", category: "Search" },
  { id: "build", label: "Run Build", description: "Start the build pipeline", icon: File, shortcut: "Ctrl+B", category: "Build" },
  { id: "copy", label: "Copy Selection", icon: Copy, shortcut: "Ctrl+C", category: "Edit" },
  { id: "more", label: "More Actions", icon: MoreHorizontal, category: "Misc" },
];

export function JpeDesignSystemShowcase() {
  const [activeTab, setActiveTab] = useState("tab1");
  const [dropdownVal, setDropdownVal] = useState("opt1");
  const [searchVal, setSearchVal] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState("mod");

  const demoTabs: JpeFileTab[] = [
    { id: "tab1", name: "trait_Evil.xml", icon: FileCode, iconColor: T.cyan, modified: true },
    { id: "tab2", name: "en_US.stbl", iconColor: T.violet },
    { id: "tab3", name: "settings.json", iconColor: T.amber, pinned: true },
  ];

  return (
    <div className="h-full overflow-auto" style={{ background: T.bgDeep }}>
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="mb-2" style={{ fontFamily: T.display, color: T.textPrimary, letterSpacing: "-0.02em" }}>
            JPE Design System
          </h1>
          <p style={{ fontSize: 13, color: T.textTertiary, lineHeight: 1.6 }}>
            Reusable component library for JPE Studio. Cyberpunk-themed, dark IDE aesthetic.
          </p>
        </div>

        {/* 1. Buttons */}
        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <JpeButton variant="primary" icon={Download}>Primary</JpeButton>
            <JpeButton variant="secondary">Secondary</JpeButton>
            <JpeButton variant="ghost">Ghost</JpeButton>
            <JpeButton variant="danger" icon={AlertTriangle}>Danger</JpeButton>
            <JpeButton variant="success" icon={CheckCircle2}>Success</JpeButton>
            <JpeButton variant="icon" icon={MoreHorizontal} title="More" />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <JpeButton variant="primary" size="xs">XS</JpeButton>
            <JpeButton variant="primary" size="sm">SM</JpeButton>
            <JpeButton variant="primary" size="md">MD</JpeButton>
            <JpeButton variant="primary" size="lg">LG</JpeButton>
            <JpeButton variant="primary" loading>Loading</JpeButton>
            <JpeButton variant="primary" disabled>Disabled</JpeButton>
          </div>
        </Section>

        {/* 2. Dropdown */}
        <Section title="Dropdown">
          <JpeDropdown
            items={[
              { id: "opt1", label: "XML Tuning", icon: FileCode, color: T.cyan },
              { id: "opt2", label: "STBL Locale", icon: File, color: T.violet },
              { id: "div", label: "", divider: true },
              { id: "opt3", label: "JSON Config", icon: File, color: T.amber },
              { id: "opt4", label: "Disabled Option", disabled: true },
            ]}
            value={dropdownVal}
            onChange={setDropdownVal}
          />
        </Section>

        {/* 3. File Tabs */}
        <Section title="File Tabs">
          <JpeFileTabs
            tabs={demoTabs}
            activeId={activeTab}
            onSelect={setActiveTab}
            onClose={(id) => console.log("close", id)}
            onAdd={() => console.log("add")}
          />
        </Section>

        {/* 4. Code Editor */}
        <Section title="Code Editor">
          <JpeCodeEditor
            lines={demoCodeLines}
            activeLine={5}
            breakpoints={[3]}
            highlights={[4, 5]}
            height={220}
            title="trait_Creative.xml"
          />
        </Section>

        {/* 5. Tool Panel */}
        <Section title="Tool Panel">
          <div className="grid grid-cols-2 gap-3">
            <JpeToolPanel title="File Explorer" icon={FolderOpen} iconColor={T.cyan} badge={14}>
              <div className="p-3 space-y-1.5">
                {["tuning/", "scripts/", "translations/", "configs/"].map(f => (
                  <div key={f} className="flex items-center gap-2 px-2 py-1 rounded-md" style={{ fontSize: 11, color: T.textSecondary }}>
                    <FolderOpen size={12} color={T.amber} /> {f}
                  </div>
                ))}
              </div>
            </JpeToolPanel>
            <JpeToolPanel title="Dependencies" icon={Shield} iconColor={T.emerald} badge={6} defaultOpen={false}>
              <div className="p-3" style={{ fontSize: 11, color: T.textMuted }}>Collapsed panel content</div>
            </JpeToolPanel>
          </div>
        </Section>

        {/* 6. Graph Viewer */}
        <Section title="Graph Viewer">
          <JpeGraphViewer
            nodes={demoGraphNodes}
            edges={demoGraphEdges}
            height={240}
            selectedNode={selectedNode}
            onNodeClick={setSelectedNode}
          />
        </Section>

        {/* 7. Notifications */}
        <Section title="Notifications">
          <div className="space-y-3">
            <JpeNotification type="info" title="Build Queued" message="Build #4219 has been queued and will start shortly." timestamp="15:42" />
            <JpeNotification type="success" title="Build Complete" message="Package compiled successfully. 14 resources, 0 errors." action={{ label: "View Output", onClick: () => {} }} />
            <JpeNotification type="warning" title="Dependency Warning" message="MCCC v8.3.1 has outdated API calls. Consider updating." onDismiss={() => {}} />
            <JpeNotification type="error" title="Conflict Detected" message="Resource key collision at 0x034AEECB between 2 mods." onDismiss={() => {}} />
          </div>
        </Section>

        {/* 8. Status Indicators */}
        <Section title="Status Indicators">
          <div className="flex flex-wrap items-center gap-4">
            <JpeStatusDot status="ok" pulse />
            <JpeStatusDot status="warning" />
            <JpeStatusDot status="error" pulse />
            <JpeStatusDot status="running" pulse />
            <JpeStatusDot status="idle" />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <JpeStatusBadge status="ok" />
            <JpeStatusBadge status="warning" />
            <JpeStatusBadge status="error" />
            <JpeStatusBadge status="info" />
            <JpeStatusBadge status="running" />
            <JpeStatusBadge status="idle" />
          </div>
          <div className="mt-3 space-y-3">
            <JpeProgressBar value={72} color={T.cyan} secondaryColor={T.violet} label="Build Progress" animated />
            <JpeProgressBar value={45} color={T.emerald} label="Translation Coverage" animated />
            <JpeProgressBar value={91} color={T.amber} label="AI Confidence" animated />
          </div>
        </Section>

        {/* 9. Loading Animations */}
        <Section title="Loading Animations">
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <JpeSpinner size={24} color={T.cyan} />
              <span style={{ fontSize: 10, color: T.textMuted }}>Spinner</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <JpePulseLoader color={T.violet} />
              <span style={{ fontSize: 10, color: T.textMuted }}>Pulse</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <JpeProgressRing value={67} size={40} color={T.cyan} />
              <span style={{ fontSize: 10, color: T.textMuted }}>Ring</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <JpeProgressRing value={91} size={40} color={T.emerald} label="91%" />
              <span style={{ fontSize: 10, color: T.textMuted }}>Ring (label)</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-32">
              <JpeSkeleton height={12} />
              <JpeSkeleton height={12} width="80%" />
              <JpeSkeleton height={12} width="60%" />
              <span style={{ fontSize: 10, color: T.textMuted }}>Skeleton</span>
            </div>
          </div>
        </Section>

        {/* 10. Command Palette */}
        <Section title="Command Palette">
          <JpeButton variant="primary" icon={Command} onClick={() => setCmdOpen(true)}>Open Command Palette</JpeButton>
          <JpeCommandPalette
            items={demoCommands}
            open={cmdOpen}
            onClose={() => setCmdOpen(false)}
            onSelect={(id) => console.log("selected:", id)}
          />
        </Section>

        {/* 11. Search Bar */}
        <Section title="Search Bar">
          <div className="space-y-3">
            <JpeSearchBar
              value={searchVal}
              onChange={setSearchVal}
              placeholder="Search files, strings, resources..."
              filters={[
                { id: "all", label: "All" },
                { id: "xml", label: ".xml" },
                { id: "stbl", label: ".stbl" },
                { id: "json", label: ".json" },
              ]}
              activeFilter={searchFilter}
              onFilterChange={setSearchFilter}
            />
            <JpeSearchBar
              value={searchVal}
              onChange={setSearchVal}
              placeholder="Quick search..."
              compact
              width={240}
            />
          </div>
        </Section>

        {/* 12. Mod Cards */}
        <Section title="Mod Cards">
          <div className="grid grid-cols-2 gap-3">
            <JpeModCard
              name="Evil Trait Override"
              author="JPE_Dev"
              version="2.1.0"
              status="installed"
              description="Overhauls the Evil trait with new interactions, autonomous behaviors, and unique mood buffs."
              downloads="12.4K"
              rating={4.8}
              category="Traits"
              icon={Star}
              iconColor={T.cyan}
            />
            <JpeModCard
              name="Career Mega Pack"
              author="SimsModder"
              version="5.0.2"
              status="update"
              description="Adds 8 fully-branching careers with custom chance cards."
              downloads="84.2K"
              rating={4.9}
              category="Careers"
              icon={File}
              iconColor={T.violet}
            />
            <JpeModCard
              name="Lot Traits Extended"
              author="LotMaster"
              version="1.6.0"
              status="outdated"
              downloads="38.9K"
              rating={4.5}
              icon={AlertTriangle}
              iconColor={T.rose}
              compact
            />
            <JpeModCard
              name="Lighting Overhaul"
              author="LuxStudio"
              version="2.8.0"
              status="available"
              downloads="31.2K"
              rating={4.4}
              icon={Download}
              iconColor={T.emerald}
              compact
            />
          </div>
        </Section>

        {/* 13. Plugin Cards */}
        <Section title="Plugin Cards">
          <div className="grid grid-cols-2 gap-3">
            <JpePluginCard
              name="JPE Auto-Translate"
              author="JPE Core Team"
              version="1.4.0"
              description="AI-powered tuning XML to JPE translation with GPT-4o backend. Supports batch processing and confidence scoring."
              icon={Star}
              iconColor={T.violet}
              rating={4.9}
              reviews={1247}
              downloads="89.3K"
              installed
              verified
              tags={["ai", "translation", "gpt", "stbl"]}
              onInstall={() => {}}
              onDetails={() => {}}
            />
            <JpePluginCard
              name="Dependency Graph Visualizer"
              author="GraphWorks"
              version="1.6.0"
              description="Interactive force-directed dependency graph with cluster analysis and real-time physics."
              icon={Shield}
              iconColor={T.amber}
              rating={4.4}
              reviews={276}
              downloads="18.9K"
              verified
              tags={["graph", "dependency", "visualization"]}
              onInstall={() => {}}
              onDetails={() => {}}
            />
          </div>
        </Section>

        <div className="h-8" />
      </div>
    </div>
  );
}

/* Section wrapper for the showcase */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1" style={{ background: T.border }} />
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: T.sans, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textTertiary }}>
          {title}
        </span>
        <div className="h-px flex-1" style={{ background: T.border }} />
      </div>
      {children}
    </div>
  );
}
