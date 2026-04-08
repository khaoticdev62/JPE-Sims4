/**
 * JpeStatusBadge — Status badge with colored background and border
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

const STATUS_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  ok: { color: "#48BB78", bg: "rgba(72,187,120,0.12)", border: "rgba(72,187,120,0.20)" },
  warning: { color: "#F6AD55", bg: "rgba(246,173,85,0.12)", border: "rgba(246,173,85,0.20)" },
  error: { color: "#FC8181", bg: "rgba(252,129,129,0.12)", border: "rgba(252,129,129,0.20)" },
  info: { color: "#63B3ED", bg: "rgba(99,179,237,0.12)", border: "rgba(99,179,237,0.20)" },
  idle: { color: "#4A5568", bg: "rgba(74,85,104,0.12)", border: "rgba(74,85,104,0.20)" },
  running: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.20)" },
};

export interface JpeStatusBadgeProps {
  status?: keyof typeof STATUS_COLORS;
  label: string;
  compact?: boolean;
  className?: string;
}

export function JpeStatusBadge({
  status = "ok",
  label,
  compact = false,
  className,
}: JpeStatusBadgeProps) {
  const config = STATUS_COLORS[status] || STATUS_COLORS.ok;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono font-semibold rounded-md border",
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
        className
      )}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.color,
      }}
      role="status"
    >
      <span
        className="inline-block rounded-full"
        style={{
          width: compact ? 5 : 6,
          height: compact ? 5 : 6,
          backgroundColor: config.color,
        }}
      />
      {label}
    </span>
  );
}
