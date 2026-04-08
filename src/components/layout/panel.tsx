/**
 * Panel — Generic panel container with glassmorphism
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface PanelProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  variant?: "default" | "glass";
}

export function Panel({ children, header, className, variant = "glass" }: PanelProps) {
  return (
    <div
      className={cn("rounded-xl border border-border overflow-hidden", className)}
      style={
        variant === "glass"
          ? {
              backgroundColor: "rgba(15,17,22,0.88)",
              backdropFilter: "blur(24px)",
            }
          : { backgroundColor: "var(--bg-surface)" }
      }
    >
      {header}
      <div className="p-3">{children}</div>
    </div>
  );
}
