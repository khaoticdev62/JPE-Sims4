import { create } from "zustand";

export interface SimulationLog {
  id: string;
  timestamp: number;
  type: "event" | "match" | "action" | "error" | "info" | "warn";
  message: string;
  details?: string;
}

export interface SimState {
  firstName: string;
  lastName: string;
  energy: number;
  hunger: number;
  fun: number;
  social: number;
  hygiene: number;
  bladder: number;
  mood: string;
  buffs: string[];
}

export interface WorldState {
  isRaining: boolean;
  isDaytime: boolean;
  lotType: string;
  activeSim: SimState;
}

interface PlaygroundState {
  worldState: WorldState;
  logs: SimulationLog[];
  isSimulating: boolean;
  playgroundCode: string;

  // Actions
  updateWorldState: (updates: Partial<WorldState>) => void;
  updateSimState: (updates: Partial<SimState>) => void;
  addLog: (message: string, type: SimulationLog["type"], details?: string) => void;
  clearLogs: () => void;
  setSimulating: (isSimulating: boolean) => void;
  setPlaygroundCode: (code: string) => void;
  resetWorldState: () => void;
}

const DEFAULT_WORLD_STATE: WorldState = {
  isRaining: false,
  isDaytime: true,
  lotType: "Residential",
  activeSim: {
    firstName: "Spectral",
    lastName: "Tester",
    energy: 100,
    hunger: 100,
    fun: 100,
    social: 100,
    hygiene: 100,
    bladder: 100,
    mood: "Fine",
    buffs: []
  }
};

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  worldState: { ...DEFAULT_WORLD_STATE },
  logs: [],
  isSimulating: false,
  playgroundCode: "# Welcome to JPE Playground!\n# Define your interactive logic here.",

  updateWorldState: (updates) =>
    set((state) => ({
      worldState: { ...state.worldState, ...updates }
    })),

  updateSimState: (updates) =>
    set((state) => ({
      worldState: {
        ...state.worldState,
        activeSim: { ...state.worldState.activeSim, ...updates }
      }
    })),

  addLog: (message, type, details) =>
    set((state) => ({
      logs: [
        {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          type,
          message,
          details
        },
        ...state.logs
      ].slice(0, 100)
    })),

  clearLogs: () => set({ logs: [] }),

  setSimulating: (isSimulating) => set({ isSimulating }),
  setPlaygroundCode: (code) => set({ playgroundCode: code }),

  resetWorldState: () => set({ worldState: { ...DEFAULT_WORLD_STATE } })
}));
