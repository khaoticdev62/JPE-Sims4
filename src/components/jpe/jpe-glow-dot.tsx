/**
 * JpeGlowDot — Glowing dot indicator
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface JpeGlowDotProps {
  color?: string;
  pulse?: boolean;
  className?: string;
}

export function JpeGlowDot({
  color = "#63B3ED",
  pulse = false,
  className,
}: JpeGlowDotProps) {
  return (
    <span
      className={cn("inline-block rounded-full", pulse && "animate-pulse-opacity", className)}
      style={{
        width: 8,
        height: 8,
        backgroundColor: color,
        boxShadow: `0 0 6px ${color}80`,
      }}
    />
  );
}
