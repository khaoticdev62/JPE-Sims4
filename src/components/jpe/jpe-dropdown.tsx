"use client";

/**
 * JpeDropdown — Dropdown with icons and cyberpunk styling
 * Custom component with items array API
 */
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, type LucideIcon } from "lucide-react";
import { T } from "@/design-system/tokens";

export interface JpeDropdownItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  color?: string;
  disabled?: boolean;
  divider?: boolean;
}

export interface JpeDropdownProps {
  items: JpeDropdownItem[];
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
  width?: number;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const btnSizes = {
  xs: { h: 24, px: 8, fs: 10, iconSize: 12 },
  sm: { h: 28, px: 10, fs: 11, iconSize: 13 },
  md: { h: 32, px: 14, fs: 12, iconSize: 14 },
  lg: { h: 38, px: 18, fs: 13, iconSize: 16 },
};

// Sub-components for compound API compatibility
export function JpeDropdownTrigger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`jpe-dropdown-trigger ${className}`}>{children}</div>;
}

export function JpeDropdownContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`jpe-dropdown-content ${className}`}>{children}</div>;
}

export function JpeDropdownItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`jpe-dropdown-item ${className}`}>{children}</div>;
}

export function JpeDropdownCheckboxItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`jpe-dropdown-checkbox-item ${className}`}>{children}</div>;
}

export function JpeDropdownRadioItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`jpe-dropdown-radio-item ${className}`}>{children}</div>;
}

export function JpeDropdownLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`jpe-dropdown-label ${className}`}>{children}</div>;
}

export function JpeDropdownSeparator({ className = "" }: { className?: string }) {
  return <div className={`jpe-dropdown-separator h-px ${className}`} style={{ background: T.border }} />;
}

export function JpeDropdownShortcut({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`jpe-dropdown-shortcut ${className}`}>{children}</span>;
}

export function JpeDropdownGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`jpe-dropdown-group ${className}`}>{children}</div>;
}

export function JpeDropdownPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function JpeDropdownSub({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function JpeDropdownSubContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`jpe-dropdown-sub-content ${className}`}>{children}</div>;
}

export function JpeDropdownSubTrigger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`jpe-dropdown-sub-trigger ${className}`}>{children}</div>;
}

export function JpeDropdownRadioGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`jpe-dropdown-radio-group ${className}`}>{children}</div>;
}

export function JpeDropdown({
  items,
  value,
  onChange,
  placeholder = "Select...",
  width = 180,
  size = "md",
  className = "",
}: JpeDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = items.find((i) => i.id === value);
  const s = btnSizes[size];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`} style={{ width }}>
      <button
        className="w-full flex items-center justify-between rounded-lg transition-all"
        style={{
          height: s.h,
          padding: `0 ${s.px}px`,
          fontSize: s.fs,
          fontFamily: T.sans,
          fontWeight: 500,
          color: selected ? T.textPrimary : T.textMuted,
          background: T.bgInput,
          border: `1px solid ${open ? T.borderActive : T.border}`,
          boxShadow: open ? T.glowCyan : "none",
        }}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 truncate">
          {selected?.icon && (
            <selected.icon
              size={s.iconSize - 2}
              color={selected.color || T.textTertiary}
            />
          )}
          <span className="truncate">
            {selected?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          size={12}
          color={T.textMuted}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
          style={{
            background: T.bgGlass,
            backdropFilter: T.glassBlur,
            border: `1px solid ${T.border}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
          }}
        >
          {items.map((item) =>
            item.divider ? (
              <div
                key={item.id}
                className="h-px mx-2"
                style={{ background: T.border }}
              />
            ) : (
              <button
                key={item.id}
                className="w-full flex items-center gap-2 px-3 py-1.5 transition-colors text-left"
                style={{
                  fontSize: s.fs,
                  fontFamily: T.sans,
                  color: item.disabled
                    ? T.textMuted
                    : item.id === value
                    ? T.cyanBright
                    : T.textSecondary,
                  background:
                    item.id === value ? `${T.cyan}08` : "transparent",
                  opacity: item.disabled ? 0.5 : 1,
                }}
                disabled={item.disabled}
                onClick={() => {
                  onChange(item.id);
                  setOpen(false);
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = `${T.cyan}10`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    item.id === value ? `${T.cyan}08` : "transparent")
                }
              >
                {item.icon && (
                  <item.icon
                    size={s.iconSize - 2}
                    color={item.color || T.textTertiary}
                  />
                )}
                <span className="truncate">{item.label}</span>
                {item.id === value && (
                  <Check size={12} color={T.cyan} className="ml-auto" />
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
