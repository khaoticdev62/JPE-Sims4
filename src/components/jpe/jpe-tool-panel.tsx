"use client";

/**
 * JpeToolPanel — Collapsible glassmorphic panel
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface JpeToolPanelProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
  badge?: string | number;
  headerColor?: string;
  className?: string;
}

export function JpeToolPanel({
  title,
  icon: Icon,
  iconColor = "#718096",
  children,
  collapsible = true,
  defaultOpen = true,
  actions,
  badge,
  headerColor,
  className,
}: JpeToolPanelProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn("rounded-xl border border-border overflow-hidden", className)}
      style={{
        backgroundColor: "rgba(15,17,22,0.88)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-3",
          collapsible ? "cursor-pointer select-none" : "",
          isOpen ? "border-b border-border" : ""
        )}
        style={{ padding: "8px 12px" }}
        onClick={() => collapsible && setIsOpen(!isOpen)}
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={(e) => {
          if (collapsible && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />}
          <span
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: headerColor || "#A0AEC0" }}
          >
            {title}
          </span>
          {badge !== undefined && (
            <span
              className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded-sm"
              style={{
                color: "#63B3ED",
                backgroundColor: "rgba(99,179,237,0.12)",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {actions}
          {collapsible && (
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-text-tertiary transition-transform duration-fast",
                isOpen && "rotate-180"
              )}
            />
          )}
        </div>
      </div>

      {/* Content */}
      {isOpen && <div className="p-3">{children}</div>}
    </div>
  );
}
