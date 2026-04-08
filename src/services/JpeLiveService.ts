/**
 * JPE Studio — JpeLiveService (Epic 9)
 * Core real-time synchronization bridge between JPE Studio and the Sims 4 engine.
 */

import { useLiveSyncStore } from "../stores/useLiveSyncStore";
import { sensory } from "./SensoryService";

export interface LiveEngineData {
  type: "HEARTBEAT" | "LOG" | "EXCEPTION" | "TUNING_EXEC";
  timestamp: number;
  payload: any;
  severity: "info" | "warn" | "error" | "critical";
}

class JpeLiveService {
  private static instance: JpeLiveService;
  private isConnected: boolean = false;
  private simulatorInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.setupIpcListeners();
  }

  public static getInstance(): JpeLiveService {
    if (!JpeLiveService.instance) {
      JpeLiveService.instance = new JpeLiveService();
    }
    return JpeLiveService.instance;
  }

  private setupIpcListeners() {
    if (typeof window !== "undefined" && (window as any).ipc) {
      (window as any).ipc.on("jpe-live:data", (data: LiveEngineData) => {
        this.handleIncomingData(data);
      });

      (window as any).ipc.on("jpe-live:status", (status: { connected: boolean }) => {
        this.isConnected = status.connected;
        useLiveSyncStore.getState().setConnectionStatus(status.connected);
      });
    }
  }

  private handleIncomingData(data: LiveEngineData) {
    const store = useLiveSyncStore.getState();
    
    switch (data.type) {
      case "HEARTBEAT":
        store.updateMetrics({
          cpu: data.payload.cpu,
          latency: data.payload.latency,
          memory: data.payload.memory,
        });
        sensory.triggerHeartbeat(0.1);
        break;
      case "EXCEPTION": {
        // Industrial Exception Translation (Story 6.5)
        const { IndustrialExceptionTranslator } = require("../services/IndustrialExceptionTranslator");
        const translatedMessage = IndustrialExceptionTranslator.translate(data.payload.message);
        sensory.triggerScrub();

        store.addLog({
          id: crypto.randomUUID(),
          message: translatedMessage,
          timestamp: data.timestamp,
          severity: data.severity,
          source: data.payload.source || "EngineSync",
        });
        
        if (data.severity === "critical" || data.severity === "error") {
          sensory.triggerAlert(data.severity);
        }
        break;
      }
      case "TUNING_EXEC":
        store.incrementTuningExecCount();
        break;
    }
  }

  /**
   * Start the LiveSimulator for development/testing
   */
  public startSimulator() {
    if (this.simulatorInterval) return;

    this.isConnected = true;
    useLiveSyncStore.getState().setConnectionStatus(true);

    this.simulatorInterval = setInterval(() => {
      const mockData: LiveEngineData = {
        type: Math.random() > 0.8 ? "LOG" : "HEARTBEAT",
        timestamp: Date.now(),
        severity: "info",
        payload: {
          cpu: Math.floor(Math.random() * 5) + 1,
          latency: Math.floor(Math.random() * 15) + 5,
          memory: 450 + Math.random() * 50,
          message: "Sims 4 Engine Heartbeat — Spectral Link Active",
          source: "EngineSync",
        },
      };
      this.handleIncomingData(mockData);
    }, 2000);
  }

  public stopSimulator() {
    if (this.simulatorInterval) {
      clearInterval(this.simulatorInterval);
      this.simulatorInterval = null;
    }
    this.isConnected = false;
    useLiveSyncStore.getState().setConnectionStatus(false);
  }

  public async connect(): Promise<boolean> {
    // In production, this would trigger the actual IPC handshake
    if (typeof window !== "undefined" && (window as any).ipc) {
      (window as any).ipc.send("jpe-live:connect");
      return true;
    }
    
    // Fallback to simulator in dev if no IPC bridge
    this.startSimulator();
    return true;
  }

  public disconnect() {
    this.stopSimulator();
    if (typeof window !== "undefined" && (window as any).ipc) {
      (window as any).ipc.send("jpe-live:disconnect");
    }
  }
}

export const liveService = JpeLiveService.getInstance();
