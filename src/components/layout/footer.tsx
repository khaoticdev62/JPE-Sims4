/**
 * Footer — Status bar footer
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface FooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Footer({ children, className }: FooterProps) {
  return (
    <footer
      className={cn("flex items-center justify-between h-7 px-4 border-t border-border text-[10px] text-text-muted", className)}
      style={{ backgroundColor: "var(--bg-panel)" }}
    >
      {children}
    </footer>
  );
}
