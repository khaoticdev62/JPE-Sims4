/**
 * JpePanelHeader — Panel header with icon, title, actions and optional count
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import type { LucideIcon } from "lucide-react";

export interface JpePanelHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  actions?: React.ReactNode;
  count?: number;
  className?: string;
}

export function JpePanelHeader({
  title,
  icon: Icon,
  iconColor = "#718096",
  actions,
  count,
  className,
}: JpePanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2 border-b border-border",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />}
        <span className="text-[10px] font-bold uppercase tracking-wide text-text-secondary">
          {title}
        </span>
        {count !== undefined && (
          <span
            className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded-sm"
            style={{
              color: "#63B3ED",
              backgroundColor: "rgba(99,179,237,0.12)",
            }}
          >
            {count}
          </span>
        )}
      </div>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}
