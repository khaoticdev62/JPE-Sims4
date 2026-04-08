/**
 * JpeStatusDot — Status indicator dot with glow and optional pulse
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

const STATUS_COLORS: Record<string, string> = {
  ok: "#48BB78",
  warning: "#F6AD55",
  error: "#FC8181",
  info: "#63B3ED",
  idle: "#4A5568",
  running: "#8B5CF6",
};

export interface JpeStatusDotProps {
  status?: keyof typeof STATUS_COLORS;
  pulse?: boolean;
  size?: number;
  className?: string;
}

export function JpeStatusDot({
  status = "ok",
  pulse = false,
  size = 8,
  className,
}: JpeStatusDotProps) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.ok;

  return (
    <span
      className={cn("inline-block rounded-full", pulse && "animate-pulse-opacity", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 6px ${color}80`,
      }}
      role="status"
      aria-label={`Status: ${status}`}
    />
  );
}
