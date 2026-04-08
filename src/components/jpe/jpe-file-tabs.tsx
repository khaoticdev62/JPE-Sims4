/**
 * JpeFileTabs — File tab bar for code editor
 */
import * as React from "react";
import { cn } from "@/components/ui/utils";
import { X, Pin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface JpeFileTab {
  id: string;
  name: string;
  icon?: LucideIcon;
  iconColor?: string;
  modified?: boolean;
  pinned?: boolean;
}

export interface JpeFileTabsProps {
  tabs: JpeFileTab[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose?: (id: string) => void;
  onAdd?: () => void;
  className?: string;
}

export function JpeFileTabs({
  tabs,
  activeId,
  onSelect,
  onClose,
  onAdd,
  className,
}: JpeFileTabsProps) {
  return (
    <div
      className={cn("flex items-center h-[34px] overflow-x-auto scrollbar-hide border-b border-border", className)}
      style={{ backgroundColor: "#0f1116" }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            className={cn(
              "group relative flex items-center gap-1.5 px-3 text-[11px] font-medium border-r transition-colors duration-fast cursor-pointer",
              isActive ? "font-semibold" : "text-text-tertiary hover:text-text-secondary hover:bg-bg-hover/50"
            )}
            style={{
              backgroundColor: isActive ? "#070810" : undefined,
              color: isActive ? "#E2E8F0" : undefined,
              borderRightColor: "rgba(255,255,255,0.03)",
            }}
            onClick={() => onSelect(tab.id)}
            role="tab"
            aria-selected={isActive}
          >
            {/* Active indicator */}
            {isActive && (
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: "linear-gradient(90deg, #63B3ED, #8B5CF6)",
                }}
              />
            )}

            {Icon && (
              <Icon
                className="h-3 w-3 shrink-0"
                style={{ color: tab.iconColor || "#718096" }}
              />
            )}

            {tab.pinned && <Pin className="h-2.5 w-2.5 text-amber shrink-0" />}

            <span className="truncate max-w-[120px]">{tab.name}</span>

            {tab.modified && !tab.pinned && (
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: "#F6AD55" }}
              />
            )}

            {onClose && (
              <X
                className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-text-primary transition-all duration-fast"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
              />
            )}
          </button>
        );
      })}

      {onAdd && (
        <button
          className="flex items-center justify-center h-full px-2 text-text-tertiary hover:text-text-primary transition-colors duration-fast"
          onClick={onAdd}
          aria-label="Add tab"
        >
          <span className="text-lg leading-none">+</span>
        </button>
      )}
    </div>
  );
}
