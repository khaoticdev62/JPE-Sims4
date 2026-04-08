"use client";
import * as React from "react";
import { cn } from "./ui/utils";
import { Home, Sparkles, Settings, FolderOpen, GraduationCap, Gamepad2 } from "lucide-react";
import { T } from "./robust/jpe-theme";
import { motion } from "./jpe-motion";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  testId?: string;
}

function NavItem({ icon, label, active = false, onClick, testId }: NavItemProps) {
  const iconElement = React.isValidElement(icon) ? icon : null;

  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={cn(
        "group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 outline-none",
        "text-text-secondary hover:text-text-primary",
        !active && "hover:bg-white/5"
      )}
      style={{
        fontFamily: T.sans,
        color: active ? T.textPrimary : T.textSecondary
      }}
    >
      {active && (
        <motion.div
           layoutId="nav-pill"
           className="absolute inset-0 rounded-xl z-0"
           style={{
             background: `linear-gradient(135deg, ${T.cyan}25, ${T.violet}15)`,
             border: `1px solid ${T.cyan}40`,
             boxShadow: `0 0 20px ${T.cyan}15`
           }}
           transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      <span className="shrink-0 w-5 h-5 relative z-10 transition-transform group-hover:scale-110">
        {iconElement && React.cloneElement(iconElement as React.ReactElement<any>, {
          color: active ? T.cyanBright : "currentColor",
          strokeWidth: active ? 2.5 : 2,
          style: active ? { filter: `drop-shadow(0 0 8px ${T.cyan}80)` } : {}
        })}
      </span>

      <span 
        className="font-bold relative z-10 text-[13px] tracking-tight"
        style={{
          fontFamily: T.display,
          color: active ? T.textPrimary : T.textSecondary,
          textShadow: active ? `0 0 10px ${T.cyan}40` : "none"
        }}
      >
        {label}
      </span>
      
      {!active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 group-hover:h-1/2 bg-cyan-400 transition-all rounded-r-full" />
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
    { id: "dashboard", label: "HOME DASHBOARD", icon: <Home className="w-5 h-5" /> },
    { id: "projects", label: "PROJECTS EXPLORER", icon: <FolderOpen className="w-5 h-5" /> },
    { id: "code", label: "STUDIO WORKSPACE", icon: <Sparkles className="w-5 h-5" /> },
    { id: "rebels", label: "TS4REBELS PORTAL", icon: <Sparkles className="w-5 h-5" /> },
    { id: "manual", label: "JPE MANUAL", icon: <GraduationCap className="w-5 h-5" /> },
    { id: "playground", label: "JPE PLAYGROUND", icon: <Gamepad2 className="w-5 h-5" /> },
    { id: "settings", label: "APP SETTINGS", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav
      data-testid="app-navigation"
      className={cn(
        "w-64 h-full border-r flex flex-col gap-2 relative overflow-hidden",
        className
      )}
      style={{
        background: T.bgPanel,
        borderColor: T.border
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ background: `radial-gradient(circle at 100% 0%, ${T.violet}30, transparent 70%)` }}
      />

      <div className="px-6 py-8 mb-2 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
            background: `linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
            boxShadow: `0 0 20px rgba(99,179,237,0.3)`
          }}>
            <Sparkles size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ 
              fontSize: 16, 
              fontWeight: 900, 
              fontFamily: T.display, 
              color: T.textPrimary,
              letterSpacing: "0.02em",
              lineHeight: 1.1
            }}>
              JPE STUDIO
            </h2>
            <p style={{ 
              fontSize: 10, 
              fontFamily: T.mono, 
              color: T.textMuted,
              marginTop: 2,
              letterSpacing: "0.05em"
            }}>
              SPECTRAL OVERHAUL
            </p>
          </div>
        </div>
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${T.border}, transparent)` }} />
      </div>

      <div className="flex flex-col gap-1 px-3 relative z-10">
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

      <div className="flex-1" />

      <div className="px-6 py-6 border-t relative z-10" style={{ borderColor: T.border, background: "rgba(0,0,0,0.2)" }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 9, fontFamily: T.mono, color: T.textMuted }}>SYS_STATUS:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.emerald, boxShadow: `0 0 8px ${T.emerald}` }} />
            <span style={{ fontSize: 9, fontFamily: T.mono, color: T.emerald, fontWeight: 700 }}>NOMINAL</span>
          </div>
        </div>
        <p style={{ fontSize: 9, color: T.textMuted, fontFamily: T.sans, opacity: 0.6 }}>
          Build v4.2.0 • Build ID: 56884
        </p>
      </div>
    </nav>
  );
}
