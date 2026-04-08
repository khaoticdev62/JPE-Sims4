import { create } from 'zustand';
import { ModCompatibilityService, type CompatibilityReport } from '@/services/ModCompatibilityService';
import { toast } from 'sonner';

interface SentinelState {
  isWatcherActive: boolean;
  lastScanTimestamp: number | null;
  report: CompatibilityReport | null;
  isPolling: boolean;
  error: string | null;
  
  // Actions
  startWatcher: () => void;
  stopWatcher: () => void;
  performScan: () => Promise<void>;
  setReport: (report: CompatibilityReport) => void;
}

export const useSentinelStore = create<SentinelState>((set, get) => ({
  isWatcherActive: false,
  lastScanTimestamp: null,
  report: null,
  isPolling: false,
  error: null,

  startWatcher: () => {
    set({ isWatcherActive: true });
    // In a real Electron app, this would trigger a main-process watcher.
    // For this web-based IDE, we simulate with a polling interval.
    get().performScan();
  },

  stopWatcher: () => {
    set({ isWatcherActive: false });
  },

  performScan: async () => {
    if (get().isPolling) return;
    
    set({ isPolling: true, error: null });
    try {
      const report = await ModCompatibilityService.getCompatibilityReport();
      const prevReport = get().report;
      
      set({ 
        report, 
        lastScanTimestamp: Date.now(),
        isPolling: false 
      });

      // Notify if new broken mods are detected
      if (prevReport && report.summary.broken > prevReport.summary.broken) {
        const newBrokenCount = report.summary.broken - prevReport.summary.broken;
        toast.error(`Sentinel Alert: ${newBrokenCount} new broken mods detected in your collection!`, {
          description: 'Check the Compatibility Dashboard for details.',
          duration: 10000,
        });
      } else if (!prevReport && report.summary.broken > 0) {
        toast.warning(`Sentinel Notice: ${report.summary.broken} broken mods active in workspace.`, {
          description: 'Industrial stability may be compromised.',
        });
      }
    } catch (err: any) {
      set({ 
        error: err.message || 'Sentinel scan failed', 
        isPolling: false 
      });
      console.error('[Sentinel Engine] Scan Error:', err);
    }
  },

  setReport: (report: CompatibilityReport) => set({ report }),
}));
