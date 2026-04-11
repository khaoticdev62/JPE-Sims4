import { usePlaygroundStore } from "@/stores/usePlaygroundStore";
import { tokenize, parse, ASTNode } from "@/engine/jpe";
import { sensory } from "@/services/SensoryService";

export type SimulatorEvent = {
  type: string;
  payload?: Record<string, unknown>;
};

class JpeSimulator {
  private static instance: JpeSimulator;
  private activeAst: ASTNode | null = null;

  private constructor() {}

  public static getInstance(): JpeSimulator {
    if (!JpeSimulator.instance) {
      JpeSimulator.instance = new JpeSimulator();
    }
    return JpeSimulator.instance;
  }

  /**
   * Load and parse JPE code into the simulator
   */
  public loadCode(code: string): { success: boolean; error?: string } {
    try {
      const tokens = tokenize(code);
      this.activeAst = parse(tokens);
      usePlaygroundStore.getState().addLog("Code loaded into simulator", "info");
      sensory.triggerScrub();
      return { success: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : "Parsing failed";
      usePlaygroundStore.getState().addLog(`Failed to load code: ${error}`, "error");
      return { success: false, error };
    }
  }

  /**
   * Fire a simulated game event
   */
  public fireEvent(event: SimulatorEvent) {
    const store = usePlaygroundStore.getState();
    store.addLog(`Event triggered: ${event.type}`, "event", JSON.stringify(event.payload));

    if (!this.activeAst) {
      store.addLog("No code loaded to handle event", "warn");
      return;
    }

    // Advanced JPE Simulator: Scan AST for sections matching the event
    // In JPE, a section like [WHEN sim.travel] maps to a game event.
    const sections = this.activeAst.children?.filter(c => c.type === 'Section') || [];
    
    let matched = false;
    for (const section of sections) {
      if (this.matchesTrigger(section.name || "", event)) {
        matched = true;
        store.addLog(`Match found: ${section.name}`, "match");
        sensory.triggerSuccess();
        this.executeSection(section);
      }
    }

    if (!matched) {
      store.addLog("No JPE triggers matched this event", "info");
    }
  }

  private matchesTrigger(triggerName: string, event: SimulatorEvent): boolean {
    const normalized = triggerName.toLowerCase().replace(/\s+/g, '');
    const eventType = event.type.toLowerCase().replace(/\s+/g, '');
    
    // Support "WHEN" prefix or direct matching
    return normalized === eventType || normalized === `when${eventType}`;
  }

  private executeSection(section: ASTNode) {
    const store = usePlaygroundStore.getState();
    
    // Simulation: Process children of the matched section (Assignments/Comments)
    section.children?.forEach(child => {
      if (child.type === 'Assignment') {
        store.addLog(`Action: ${child.key} = ${JSON.stringify(child.value)}`, "action");
        sensory.triggerHeartbeat(0.05);
        
        // Mock state updates if applicable
        if (child.key?.startsWith('sim.')) {
          const stat = child.key.split('.')[1];
          store.updateSimState({ [stat]: child.value });
        }
      }
    });

    store.addLog(`Executed block: ${section.name}`, "info");
  }
}

export const simulator = JpeSimulator.getInstance();
