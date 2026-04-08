/**
 * JpeProgressBar — Cyberpunk styled progress bar
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface JpeProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  secondaryColor?: string;
  height?: number;
  animated?: boolean;
  label?: string;
  className?: string;
}

export function JpeProgressBar({
  value,
  max = 100,
  color = "#63B3ED",
  secondaryColor,
  height = 4,
  animated = false,
  label,
  className,
}: JpeProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wide text-text-secondary font-semibold">{label}</span>
          <span className="text-[10px] font-mono text-text-muted">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className="w-full overflow-hidden rounded-full"
        style={{ height, backgroundColor: "rgba(255,255,255,0.04)" }}
      >
        <div
          className={cn("h-full rounded-full transition-all", animated && "duration-slower ease-out")}
          style={{
            width: `${pct}%`,
            background: secondaryColor
              ? `linear-gradient(90deg, #8B5CF6, ${color})`
              : color,
            boxShadow: `0 0 8px ${color}40`,
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
