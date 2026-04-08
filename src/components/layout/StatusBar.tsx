import { HelpCircle, Sun, Moon, Contrast, ShieldCheck, RefreshCw } from 'lucide-react';
import { useTutorialStore } from '@/stores/useTutorialStore';
import { useUIStore } from '@/stores/useUIStore';
import { useDiagnosticStore } from '@/stores/useDiagnosticStore';
import { useSentinelStore } from '@/stores/useSentinelStore';
import { cn } from '@/utils/cn';
import type { Diagnostic } from '@/types/index';
import { PythonEngineStatusIndicator } from '@/components/PythonEngineStatusIndicator';

export const StatusBar: React.FC = () => {
  const { startTutorial } = useTutorialStore()
  const { theme, setTheme } = useUIStore()
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
    <div
      id="status-bar"
      role="contentinfo"
      className="h-7 bg-jpe-surface text-jpe-text border-t border-jpe-border flex items-center px-4 justify-between text-[11px] select-none font-medium transition-all"
    >
      <div
        className="flex items-center gap-4"
        role="status"
        aria-live="polite"
        aria-label={`System Status: Ready. ${errorCount} Errors, ${warningCount} Warnings. Sentinel: ${sentinelBroken} Broken.`}
      >
        <div className="flex items-center gap-1.5 uppercase tracking-wider">
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"
            aria-hidden="true"
          ></span>
          <span>System Active</span>
        </div>

        {/* Story 9.1: Background Sentinel Status Badge */}
        <div 
          className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all cursor-pointer hover:bg-white/5",
            sentinelBroken > 0 ? "border-red-500/30 text-red-400 bg-red-500/5" :
            sentinelOutdated > 0 ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/5" :
            "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
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
            Sentinel: {sentinelBroken > 0 ? 'Broken Detected' : sentinelOutdated > 0 ? 'Updates' : 'Healthy'}
          </span>
        </div>

        <span className="flex items-center gap-1 opacity-80" aria-label={`${errorCount} Errors`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" aria-hidden="true"></span> {errorCount} Errors
        </span>
        <span className="flex items-center gap-1 opacity-80" aria-label={`${warningCount} Warnings`}>
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" aria-hidden="true"></span> {warningCount} Warnings
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Python Engine Status (Story 1.2) */}
        <PythonEngineStatusIndicator />

        <button
          onClick={cycleTheme}
          aria-label={`Current Theme: ${theme}. Click to change.`}
          className="flex items-center gap-1.5 hover:text-white/80 transition-colors uppercase tracking-widest text-[9px] font-bold border-r border-white/20 pr-4"
        >
          {theme === 'dark' && <Moon className="w-3 h-3" />}
          {theme === 'light' && <Sun className="w-3 h-3" />}
          {theme === 'high-contrast' && <Contrast className="w-3 h-3" />}
          Theme
        </button>
        <button
          onClick={startTutorial}
          aria-label="Start Interactive Tutorial"
          className="flex items-center gap-1.5 hover:text-white/80 transition-colors uppercase tracking-widest text-[9px] font-bold"
        >
          <HelpCircle className="w-3 h-3" aria-hidden="true" />
          Onboarding
        </button>
        <div className="opacity-60 italic" aria-label="Software Version 2.0">
          v2.0
        </div>
      </div>
    </div>
  );
};
