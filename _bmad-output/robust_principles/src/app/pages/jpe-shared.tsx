import { type LucideIcon } from "lucide-react";
import { T } from "./jpe-theme";

export function Eyebrow({ children, color = T.textTertiary }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="uppercase select-none" style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color }}>
      {children}
    </span>
  );
}

export function GlowDot({ color, pulse = false }: { color: string; pulse?: boolean }) {
  return (
    <div className="relative">
      <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}80` }} />
      {pulse && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: color, opacity: 0.3 }} />}
    </div>
  );
}

export function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span className="px-2 py-0.5 rounded-md" style={{ fontSize: 10, fontFamily: T.mono, fontWeight: 600, color, background: bg, border: `1px solid ${color}20` }}>
      {children}
    </span>
  );
}

export function PanelHeader({ title, icon: Icon, iconColor = T.textTertiary, actions, count }: { title: string; icon?: LucideIcon; iconColor?: string; actions?: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={13} color={iconColor} />}
        <Eyebrow>{title}</Eyebrow>
        {count !== undefined && <span style={{ fontSize: 10, fontFamily: T.mono, color: T.textMuted }}>({count})</span>}
      </div>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}

export function IconBtn({ icon: Icon, color = T.textTertiary, size = 13, onClick, title }: { icon: LucideIcon; color?: string; size?: number; onClick?: () => void; title?: string }) {
  return (
    <button className="p-1 rounded-md transition-colors hover:bg-white/5" onClick={onClick} title={title}>
      <Icon size={size} color={color} />
    </button>
  );
}

export function ProgressBar({ pct, color, height = 3 }: { pct: number; color: string; height?: number }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: "rgba(255,255,255,0.04)" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${T.violet}, ${color})`, boxShadow: `0 0 6px ${color}40` }} />
    </div>
  );
}
