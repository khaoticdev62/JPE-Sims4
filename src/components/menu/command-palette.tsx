"use client";

/**
 * CommandPalette — Command palette (Ctrl+K) component
 */
import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/components/ui/utils";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

export interface CommandPaletteItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  group?: string;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandPaletteItem[];
  placeholder?: string;
  className?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  items,
  placeholder = "Type a command or search...",
  className,
}: CommandPaletteProps) {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  // Group items
  const grouped = items.reduce<Record<string, CommandPaletteItem[]>>((acc, item) => {
    const group = item.group || "General";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className={cn("rounded-xl border border-border bg-bg-glass backdrop-blur-xl", className)}>
        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-text-tertiary" />
          <CommandInput
            placeholder={placeholder}
            className="flex h-10 w-full rounded-md bg-transparent py-3 text-[12px] text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>
        <CommandList>
          <CommandEmpty className="py-4 text-center text-[11px] text-text-muted">No results found.</CommandEmpty>
          {Object.entries(grouped).map(([group, groupItems]) => (
            <React.Fragment key={group}>
              <CommandGroup
                heading={<span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{group}</span>}
              >
                {groupItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={item.onSelect}
                    className="text-[11px] text-text-secondary data-[selected=true]:bg-cyan-dim/50 data-[selected=true]:text-cyan-bright"
                  >
                    {item.icon && <item.icon className="mr-2 h-3.5 w-3.5" />}
                    {item.label}
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </React.Fragment>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
