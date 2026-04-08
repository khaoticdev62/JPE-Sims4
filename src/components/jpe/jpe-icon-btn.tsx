/**
 * JpeIconBtn — Icon button with cyberpunk styling
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import type { LucideIcon } from "lucide-react";

export interface JpeIconButtonProps {
  icon: LucideIcon;
  color?: string;
  size?: number;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  className?: string;
}

export function JpeIconButton({
  icon: Icon,
  color = "#718096",
  size = 13,
  onClick,
  title,
  disabled = false,
  className,
}: JpeIconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md p-1 transition-colors duration-fast hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan/30 disabled:opacity-40 disabled:pointer-events-none",
        className
      )}
      onClick={onClick}
      title={title}
      disabled={disabled}
      aria-label={title}
    >
      <Icon style={{ width: size, height: size, color }} />
    </button>
  );
}
