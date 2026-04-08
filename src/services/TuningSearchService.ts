/* ─────────────────────────────────────────────────────────────
   JPE Studio — Tuning Search Service (Story 2.2.2)
   Provides EA Resource lookup for Editor IntelliSense.
   ───────────────────────────────────────────────────────────── */

export interface TuningDefinition {
  name: string;
  type: string;
  id: string;
  desc?: string;
}

// Mocked EA Definitions for Phase 3 Proof-of-Concept
const EA_TUNING_MOCK: TuningDefinition[] = [
  { name: "loot_Statistic_LifeSkill_Autonomy_Responsible_Positive", type: "Loot", id: "161580", desc: "Adds responsibility points" },
  { name: "loot_Statistic_LifeSkill_Autonomy_Responsible_Negative", type: "Loot", id: "161581", desc: "Subtracts responsibility points" },
  { name: "buff_Role_ServiceNPC_Maid", type: "Buff", id: "16182", desc: "Maid service role buff" },
  { name: "buff_Role_ServiceNPC_Gardener", type: "Buff", id: "16181", desc: "Gardener service role buff" },
  { name: "interaction_Sim_ReadBook", type: "Interaction", id: "13117", desc: "Standard book reading interaction" },
  { name: "trait_OccultVampire", type: "Trait", id: "149527", desc: "Vampire occult trait" },
  { name: "commodity_Fulfillment_Hunger", type: "Statistic", id: "16656", desc: "Core hunger commodity" },
];

class TuningSearchService {
  private static instance: TuningSearchService;
  private definitions: TuningDefinition[] = [...EA_TUNING_MOCK];

  private constructor() {}

  public static getInstance(): TuningSearchService {
    if (!TuningSearchService.instance) {
      TuningSearchService.instance = new TuningSearchService();
    }
    return TuningSearchService.instance;
  }

  /**
   * Search for tuning definitions matching a query.
   */
  public search(query: string): TuningDefinition[] {
    const q = query.toLowerCase();
    return this.definitions.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.id.includes(q) || 
      d.type.toLowerCase().includes(q)
    ).slice(0, 20); // Limit to top 20 for performance
  }

  /**
   * Get all definitions for a specific type.
   */
  public getByType(type: string): TuningDefinition[] {
    return this.definitions.filter(d => d.type === type);
  }

  /**
   * Registers a new set of definitions (e.g. from extracted game files).
   */
  public registerDefinitions(newDefs: TuningDefinition[]) {
    this.definitions = [...this.definitions, ...newDefs];
  }
}

export const tuningSearch = TuningSearchService.getInstance();
