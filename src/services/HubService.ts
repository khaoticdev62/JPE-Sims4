import { useUIStore } from "@/stores/useUIStore";
import { sensory } from "@/services/SensoryService";
import type { WorkspaceMode } from "@/components/robust/jpe-theme";

/**
 * JPE Studio — HubService
 * 
 * Orchestrates global navigation transitions and cross-module synchronization.
 * This is the industrial-grade "Control Plane" for the JPE Studio shell.
 */
class HubService {
  private static instance: HubService;

  private constructor() {}

  public static getInstance(): HubService {
    if (!HubService.instance) {
      HubService.instance = new HubService();
    }
    return HubService.instance;
  }

  /**
   * Navigate to a workspace mode with full sensory and state coordination.
   */
  public async navigate(mode: WorkspaceMode) {
    const { workspaceMode, setWorkspaceMode } = useUIStore.getState();
    
    if (workspaceMode === mode) return;

    // 1. Sensory Trigger (Aria-style transition bloom)
    sensory.triggerScrub();

    // 2. Pre-transition logic
    if (mode === "dashboard") {
      // Auto-save any active work before returning to home
      // useEditorStore.getState().saveAll(); 
    }

    // 3. Perform Transition
    setWorkspaceMode(mode);

    // 4. Post-transition cleanup/setup
    if (mode === "code" || mode === "visual" || mode === "jpe") {
      useUIStore.getState().setSidebarTab("explorer");
    }

    // 5. Final Sensory Bloom
    setTimeout(() => {
        sensory.triggerNotification();
    }, 150);
  }

  /**
   * Story 2.1: The Ignition Sequence
   * Direct handheld-to-game injection flow.
   */
  public async ignite() {
    sensory.triggerHeartbeat(0.8);
    
    // Dispatches a global event for listeners (like BuildPipeline or HandheldStatus)
    window.dispatchEvent(new CustomEvent('jpe:ignite', { 
      detail: { timestamp: Date.now(), source: 'HubService' } 
    }));

    // Logic for actual ignition would go here (e.g., calling JpeCli)
    console.log("[HubService] Ignition Sequence Initiated...");
  }
}

export const hub = HubService.getInstance();
