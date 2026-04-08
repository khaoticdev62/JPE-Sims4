import { create } from 'zustand'

export interface TelemetrySnapshot {
  timestamp: number
  fps: number
  scriptExecutionTime: number // ms
  loadedTuningCount: number
  activeLot: string
  simCount: number
  engineState: 'idle' | 'running' | 'paused' | 'loading'
}

export interface TelemetryState {
  snap: TelemetrySnapshot | null
  history: TelemetrySnapshot[]
  isConnected: boolean
  lastSeen: number | null
  isConsentGiven: boolean | null
  stats: Record<string, any>

  // Actions
  updateSnapshot: (newSnap: TelemetrySnapshot) => void
  setConnection: (status: boolean) => void
  clearHistory: () => void
  enableTelemetry: () => void
  disableTelemetry: () => void
}

const MAX_HISTORY = 60; // 1 minute of 1s snapshots or similar

export const useTelemetryStore = create<TelemetryState>((set) => ({
  snap: null,
  history: [],
  isConnected: false,
  lastSeen: null,
  isConsentGiven: null,
  stats: {},

  updateSnapshot: (newSnap) => {
    set((state) => {
      const newHistory = [...state.history, newSnap].slice(-MAX_HISTORY);
      return {
        snap: newSnap,
        history: newHistory,
        lastSeen: Date.now(),
        isConnected: true
      };
    });
  },

  setConnection: (status) => {
    set({ isConnected: status });
  },

  clearHistory: () => {
    set({ history: [], snap: null });
  },

  enableTelemetry: () => {
    set({ isConsentGiven: true });
  },

  disableTelemetry: () => {
    set({ isConsentGiven: false });
  }
}));
