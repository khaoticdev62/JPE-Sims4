"use client";

import { useEffect } from "react";
import { useActivityStore } from "@/stores/useActivityStore";
import { toast } from "sonner";

/**
 * BridgeListener - Invisible component that hooks into the Electron IPC 
 * to receive live events from the Sims 4 Industrial Bridge.
 */
export function BridgeListener() {
  const addActivity = useActivityStore(state => state.addActivity);

  useEffect(() => {
    if (typeof window === "undefined" || !window.electron?.sync) return;

    console.log("[JPE-BRIDGE] Initializing Live-Link Inbound Listener...");

    // Listen for EXCEPTION and other SYNC events
    const unsubscribe = window.electron.sync.onEvent((data: any) => {
      console.log("[JPE-BRIDGE] Inbound Event:", data);

      if (data.type === "EXCEPTION") {
        addActivity({
          type: "exception",
          fileName: data.module || "Unknown Module",
          projectName: "Live Engine Link",
          projectId: "live-sync",
          description: data.message,
          severity: "error",
          payload: {
             traceback: data.traceback,
             module: data.module
          }
        } as any);

        toast.error("Engine Exception Intercepted", {
          description: `Module: ${data.module || 'Unknown'} - Check Diagnostic Nexus.`,
          duration: 5000,
        });
      }

      if (data.type === "SYNC") {
        addActivity({
          type: "bridge_event",
          fileName: "Bridge Status",
          projectName: "Live Engine Link",
          projectId: "live-sync",
          description: data.message,
          severity: "info"
        });
        
        toast.info("Bridge Sync Established", {
          description: data.message
        });
      }

      if (data.type === "STATUS") {
         toast.success("Bridge Command Executed", {
           description: data.message
         });
      }
    });

    return () => {
      console.log("[JPE-BRIDGE] Tearing down Live-Link Listener...");
      unsubscribe();
    };
  }, [addActivity]);

  return null; // Invisible service component
}
