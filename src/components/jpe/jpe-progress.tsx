/**
 * JpeProgress — Simple progress bar component
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface JpeProgressProps {
  pct: number;
  color?: string;
  height?: number;
  className?: string;
}

export function JpeProgress({
  pct,
  color = "#63B3ED",
  height = 3,
  className,
}: JpeProgressProps) {
  const clampedPct = Math.min(100, Math.max(0, pct));

  return (
    <div className={cn("w-full overflow-hidden rounded-full", className)} style={{ height, backgroundColor: "rgba(255,255,255,0.04)" }}>
      <div
        className="h-full rounded-full transition-all duration-slower"
        style={{
          width: `${clampedPct}%`,
          background: `linear-gradient(90deg, #8B5CF6, ${color})`,
          boxShadow: `0 0 6px ${color}40`,
        }}
        role="progressbar"
        aria-valuenow={clampedPct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
