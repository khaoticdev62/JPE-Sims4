/**
 * Header — Application header
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface HeaderProps {
  children?: React.ReactNode;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function Header({ children, left, center, right, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between h-12 px-4 border-b border-border",
        className
      )}
      style={{ backgroundColor: "var(--bg-panel)" }}
    >
      <div className="flex items-center gap-2">{left || children}</div>
      {center && <div className="flex items-center">{center}</div>}
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}
