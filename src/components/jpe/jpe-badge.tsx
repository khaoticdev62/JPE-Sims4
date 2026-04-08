/**
 * JpeBadge — Badge component with cyberpunk styling
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface JpeBadgeProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  className?: string;
  "data-testid"?: string;
}

export function JpeBadge({
  children,
  color = "#63B3ED",
  bg = "rgba(99,179,237,0.12)",
  className,
  "data-testid": testId,
}: JpeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md border",
        className
      )}
      style={{
        backgroundColor: bg,
        borderColor: `${color}20`,
        color,
      }}
      data-testid={testId}
    >
      {children}
    </span>
  );
}
