/**
 * StatusIndicator — Combined status indicator with dot, label and badge
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { JpeStatusDot, JpeStatusBadge } from "@/components/jpe";

type StatusType = "ok" | "warning" | "error" | "info" | "idle" | "running";

export interface StatusIndicatorProps {
  status?: StatusType;
  label?: string;
  showBadge?: boolean;
  compact?: boolean;
  pulse?: boolean;
  className?: string;
}

export function StatusIndicator({
  status = "ok",
  label,
  showBadge = false,
  compact = false,
  pulse = false,
  className,
}: StatusIndicatorProps) {
  if (showBadge && label) {
    return <JpeStatusBadge status={status} label={label} compact={compact} className={className} />;
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <JpeStatusDot status={status} pulse={pulse} size={compact ? 6 : 8} />
      {label && (
        <span className={cn("text-[10px] font-mono", compact ? "text-[9px]" : "text-[10px]", "text-text-secondary")}>
          {label}
        </span>
      )}
    </div>
  );
}
