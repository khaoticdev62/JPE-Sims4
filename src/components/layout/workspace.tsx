/**
 * Workspace — Main workspace layout with sidebar and content
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";

export interface WorkspaceProps {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: number;
  className?: string;
}

export function Workspace({ sidebar, children, sidebarWidth = 280, className }: WorkspaceProps) {
  return (
    <div className={cn("flex h-full", className)}>
      {sidebar && (
        <div className="shrink-0 border-r border-border" style={{ width: sidebarWidth, backgroundColor: "var(--bg-panel)" }}>
          {sidebar}
        </div>
      )}
      <main className="flex-1 overflow-auto" style={{ backgroundColor: "var(--bg)" }}>
        {children}
      </main>
    </div>
  );
}
