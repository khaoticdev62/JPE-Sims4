/**
 * JPE Studio — useLiveSyncStore
 * State management for real-time engine telemetry and JPE-Live Link status.
 */

import { create } from "zustand";

export interface LiveLog {
  id: string;
  message: string;
  timestamp: number;
  severity: "info" | "warn" | "error" | "critical";
  source?: string;
  traceback?: string;
  exceptionType?: string;
}

export interface EngineMetrics {
  cpu: number;
  latency: number;
  memory: number;
}

interface LiveSyncState {
  isConnected: boolean;
  metrics: EngineMetrics;
  logs: LiveLog[];
  tuningExecCount: number;

  // Actions
  setConnectionStatus: (status: boolean) => void;
  updateMetrics: (metrics: Partial<EngineMetrics>) => void;
  addLog: (log: LiveLog) => void;
  incrementTuningExecCount: () => void;
  clearLogs: () => void;
}

export const useLiveSyncStore = create<LiveSyncState>((set) => ({
  isConnected: false,
  metrics: {
    cpu: 0,
    latency: 0,
    memory: 0,
  },
  logs: [],
  tuningExecCount: 0,

  setConnectionStatus: (isConnected) => set({ isConnected }),
  
  updateMetrics: (newMetrics) =>
    set((state) => ({
      metrics: { ...state.metrics, ...newMetrics },
    })),

  addLog: (log) =>
    set((state) => ({
      // Keep last 100 logs for performance
      logs: [log, ...state.logs].slice(0, 100),
    })),

  incrementTuningExecCount: () =>
    set((state) => ({
      tuningExecCount: state.tuningExecCount + 1,
    })),

  clearLogs: () => set({ logs: [] }),
}));
