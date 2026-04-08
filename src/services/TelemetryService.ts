import { useTelemetryStore } from "@/stores/useTelemetryStore";
import { sims4 } from "./Sims4Service";

class TelemetryService {
  private static instance: TelemetryService;
  private intervalId: any | null = null;
  private isSimulated = true;

  private constructor() {}

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  /**
   * Starts the high-fidelity telemetry polling engine (250ms).
   */
  public async startPolling() {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      await this.poll();
    }, 250);
  }

  public stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    useTelemetryStore.getState().setConnection(false);
  }

  private async poll() {
    if (this.isSimulated) {
      this.generateSimulatedSnapshot();
      return;
    }

    // High-Fidelity Path Detection via Sims4Service
    try {
      const modsPath = await sims4.getModsPath();
      const telemetryPath = `${modsPath}\\JPE_Studio\\telemetry\\snapshot.json`;
      
      // Simulation of reading file — in production this would be a fetch or IPC call
      console.log(`[TelemetryService] Polling engine at: ${telemetryPath}`);
      
      // If we failed to find the file, we continue to look
    } catch (err) {
      console.error("[TelemetryService] Core Polling Error:", err);
      useTelemetryStore.getState().setConnection(false);
    }
  }

  private generateSimulatedSnapshot() {
    const store = useTelemetryStore.getState();
    const _lastSnap = store.snap;

    const snapshot = {
      timestamp: Date.now(),
      fps: 58 + Math.random() * 5, // Simulated engine jitter
      scriptExecutionTime: 0.12 + Math.random() * 0.05,
      loadedTuningCount: 12450 + Math.floor(Math.random() * 10),
      activeLot: "Vieux-Désert-Spectral-Lab",
      simCount: 8,
      engineState: 'running' as const
    };

    store.updateSnapshot(snapshot);
  }
}

export const telemetry = TelemetryService.getInstance();
