import React from 'react'
import { HelpCircle, Sun, Moon, Contrast, ShieldCheck, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';
import { useTutorialStore } from '@/stores/useTutorialStore';
import { useUIStore } from '@/stores/useUIStore';
import { useDiagnosticStore } from '@/stores/useDiagnosticStore';
import { useSentinelStore } from '@/stores/useSentinelStore';
import { cn } from '@/utils/cn';
import type { Diagnostic } from '@/types/index';
import { PythonEngineStatusIndicator } from '@/components/PythonEngineStatusIndicator';
import { T } from '@/components/robust/jpe-theme'

export const StatusBar: React.FC = () => {
  const { startTutorial } = useTutorialStore()
  const { theme, setTheme, showDiagnostics, toggleDiagnostics } = useUIStore()
  const { diagnostics } = useDiagnosticStore()
  const { report, isPolling, performScan } = useSentinelStore()

  const errorCount = diagnostics.filter((d: Diagnostic) => d.severity === 'error').length
  const warningCount = diagnostics.filter((d: Diagnostic) => d.severity === 'warning').length
  
  const sentinelBroken = report?.summary.broken || 0
  const sentinelOutdated = report?.summary.outdated || 0

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light')
    else if (theme === 'light') setTheme('high-contrast')
    else setTheme('dark')
  }

  return (
    <footer
      id="status-bar"
      role="contentinfo"
      className="h-7 bg-black/80 backdrop-blur-md border-t border-white/5 flex items-center px-4 justify-between text-[11px] select-none font-sans transition-all"
      style={{ color: T.textSecondary }}
    >
      <div
        className="flex items-center gap-4"
        role="status"
        aria-live="polite"
        aria-label={`System Status: Ready. ${errorCount} Errors, ${warningCount} Warnings. Sentinel: ${sentinelBroken} Broken.`}
      >
        <div className="flex items-center gap-1.5 uppercase tracking-wider font-black text-[9px] text-emerald-500/80">
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse"
            aria-hidden="true"
          ></span>
          <span>Studio Ready</span>
        </div>

        <div className="w-px h-3 bg-white/10" />

        {/* Story 9.1: Background Sentinel Status Badge */}
        <button 
          className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded transition-all hover:bg-white/5",
            sentinelBroken > 0 ? "text-red-400" :
            sentinelOutdated > 0 ? "text-yellow-400" :
            "text-emerald-400/60"
          )}
          onClick={() => performScan()}
          title="Mod Sentinel: Community Health Watch"
        >
          {isPolling ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <ShieldCheck className="w-3 h-3" />
          )}
          <span className="text-[9px] font-black uppercase tracking-widest leading-none">
            {sentinelBroken > 0 ? 'Sentinel: Alerts' : 'Sentinel'}
          </span>
        </button>

        {/* ── DIAGNOSTIC TOGGLES ── */}
        <button 
          onClick={toggleDiagnostics}
          className={cn(
            "flex items-center gap-3 px-2 py-0.5 rounded hover:bg-white/5 transition-all group",
            showDiagnostics && "bg-white/5"
          )}
        >
          <div className="flex items-center gap-1.5">
            <AlertCircle size={12} className={cn("transition-colors", errorCount > 0 ? "text-state-error" : "text-text-muted opacity-40")} />
            <span className={cn("text-[10px] font-bold font-mono", errorCount > 0 ? "text-state-error" : "text-text-muted opacity-40")}>
              {errorCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={12} className={cn("transition-colors", warningCount > 0 ? "text-state-warning" : "text-text-muted opacity-40")} />
            <span className={cn("text-[10px] font-bold font-mono", warningCount > 0 ? "text-state-warning" : "text-text-muted opacity-40")}>
              {warningCount}
            </span>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Python Engine Status (Story 1.2) */}
        <PythonEngineStatusIndicator />

        <div className="w-px h-3 bg-white/10" />

        <button
          onClick={cycleTheme}
          aria-label={`Current Theme: ${theme}. Click to change.`}
          className="flex items-center gap-1.5 hover:text-white transition-colors uppercase tracking-widest text-[9px] font-black"
        >
          {theme === 'dark' && <Moon className="w-3.5 h-3.5" />}
          {theme === 'light' && <Sun className="w-3.5 h-3.5" />}
          {theme === 'high-contrast' && <Contrast className="w-3.5 h-3.5" />}
          Theme
        </button>

        <button
          onClick={startTutorial}
          aria-label="Start Interactive Tutorial"
          className="flex items-center gap-1.5 hover:text-white transition-colors uppercase tracking-widest text-[9px] font-black"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan" aria-hidden="true" />
          Onboarding
        </button>

        <div className="text-[10px] font-mono opacity-40" aria-label="Software Version 2.1 Industrial">
          v2.1
        </div>
      </div>
    </footer>
  );
};
