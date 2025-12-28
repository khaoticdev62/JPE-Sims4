import * as React from "react";
import { cn } from "./ui/utils";
import { Home, Sparkles, Settings, FolderOpen } from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  testId?: string;
}

function NavItem({ icon, label, active = false, onClick, testId }: NavItemProps) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={cn(
        "group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 outline-none",
        "text-text-secondary hover:text-text-primary",
        // Inactive state
        !active && [
          "hover:bg-background-tertiary/50",
          "focus-visible:bg-background-tertiary/70 focus-visible:text-text-primary",
          "focus-visible:scale-[1.02] focus-visible:shadow-[0_4px_16px_rgba(10,132,255,0.2)]",
        ],
        // Active state - "floaty pill"
        active && [
          "bg-gradient-to-r from-accent-primary to-accent-focus text-text-primary shadow-lg shadow-accent-primary/30",
          "hover:shadow-accent-primary/40 hover:brightness-110",
          "focus-visible:scale-[1.02] focus-visible:shadow-[0_6px_20px_rgba(10,132,255,0.4)]",
        ],
      )}
    >
      <span className="shrink-0 w-5 h-5">{icon}</span>
      <span className="font-medium">{label}</span>
      
      {/* Subtle glow effect on hover */}
      {!active && (
        <span className="absolute inset-0 rounded-xl bg-accent-primary/0 group-hover:bg-accent-primary/5 transition-colors duration-200" />
      )}
    </button>
  );
}

interface AppNavigationProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
  className?: string;
}

export function AppNavigation({ activeItem = "home", onNavigate, className }: AppNavigationProps) {
  const navItems = [
    { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "projects", label: "Projects", icon: <FolderOpen className="w-5 h-5" /> },
    { id: "studio", label: "Studio", icon: <Sparkles className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav
      className={cn(
        "w-64 h-full bg-background-secondary border-r border-border-subtle p-4 flex flex-col gap-2",
        className
      )}
    >
      {/* App Title */}
      <div className="px-4 py-6 mb-2">
        <h2 className="text-text-primary mb-1">JPE Mod Translator</h2>
        <p className="text-text-secondary text-sm">Version 2.0</p>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.id}
            onClick={() => onNavigate?.(item.id)}
            testId={`nav-${item.id}`}
          />
        ))}
      </div>

      {/* Bottom spacer */}
      <div className="flex-1" />

      {/* Footer info */}
      <div className="px-4 py-4 text-text-secondary text-xs border-t border-border-subtle">
        <p>Keyboard navigation enabled</p>
        <p className="mt-1 opacity-60">Use Tab to navigate</p>
      </div>
    </nav>
  );
}
