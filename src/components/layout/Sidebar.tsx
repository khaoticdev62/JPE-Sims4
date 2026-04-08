/**
 * Sidebar — Main sidebar navigation
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface SidebarProps {
  children?: React.ReactNode;
  width?: number;
  className?: string;
}

export function Sidebar({ children, width = 280, className }: SidebarProps) {
  return (
    <aside
      className={cn("h-full border-r border-border overflow-y-auto scrollbar-hide", className)}
      style={{ width, backgroundColor: "var(--bg-panel)" }}
    >
      {children}
    </aside>
  );
}
