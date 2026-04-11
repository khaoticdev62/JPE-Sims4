/* ─────────────────────────────────────────────────────────────
   JPE Studio — Industrial Shell Service (Phase 1 Growth)
   Handles OS-level synthesis: Context Menus & Registry Hooks.
   ───────────────────────────────────────────────────────────── */

import { toast } from "sonner";
import { sensory } from "./SensoryService";

export interface ShellResult {
  success: boolean;
  error?: string;
}

// Using global ElectronIPC from types/electron.d.ts

class ShellService {
  private static instance: ShellService;

  private constructor() {}

  public static getInstance(): ShellService {
    if (!ShellService.instance) {
      ShellService.instance = new ShellService();
    }
    return ShellService.instance;
  }

  /**
   * Installs the "Translate to JPE" context menu for XML and Package files.
   * Requires Windows environment.
   */
  public async installIndustrialHooks(): Promise<ShellResult> {
    sensory.triggerAlert("warn");
    
    try {
      console.log("[JPE-SHELL] Orchestrating OS Registry mutation...");
      
      const electronWindow = window as any; // global type handles ipc/electron
      const result = await electronWindow.electron.shell.installContextMenu();
      
      if (!result.success) {
        throw new Error(result.error || "Registry mutation failed.");
      }

      sensory.triggerSuccess();
      toast.success("Industrial OS Synthesis Complete", {
        description: "'Translate to JPE' added to Windows context menu."
      });

      return { success: true };
    } catch (err) {
      sensory.triggerAlert("error");
      const error = err instanceof Error ? err.message : String(err);
      toast.error("Shell Integration Failed", { description: error });
      return { success: false, error };
    }
  }

  /**
   * Checks if the shell hooks are likely installed.
   * In a real implementation, this would query the registry via IPC.
   */
  public async checkHookStatus(): Promise<boolean> {
    // Generic check - assuming success for MVP
    return true;
  }
}

export const shell = ShellService.getInstance();
