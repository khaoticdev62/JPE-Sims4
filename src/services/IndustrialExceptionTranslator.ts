/* ─────────────────────────────────────────────────────────────
   JPE Studio — Industrial Exception Translator (FR22)
   Converts cryptic engine logs into human-readable JPE alerts.
   ───────────────────────────────────────────────────────────── */

export class IndustrialExceptionTranslator {
  /**
   * Translates a raw Sims 4 exception line into an industrial JPE alert.
   */
  public static translate(raw: string): string {
    // 1. Identification of industrial error patterns
    if (raw.includes("KeyError")) {
      const match = raw.match(/KeyError: ['"](.*)['"]/);
      const key = match ? match[1] : "UNKNOWN_RESOURCE";
      return `[JPE-ALERT] Missing Industrial Dependency: Resource ID '${key}' could not be resolved in the current tuning pool.`;
    }

    if (raw.includes("AttributeError")) {
      const match = raw.match(/AttributeError: (.*)/);
      const attr = match ? match[1] : "MOD_LOGIC";
      return `[JPE-ALERT] Logic Protocol Breach: Attempted to access non-existent industrial property ${attr}. Check your JPE logic schema.`;
    }

    if (raw.includes("ModuleNotFoundError")) {
      const match = raw.match(/ModuleNotFoundError: No module named ['"](.*)['"]/);
      const mod = match ? match[1] : "PYTHON_MODULE";
      return `[JPE-ALERT] Integrity Failure: Required industrial module '${mod}' is missing from the script environment. Re-run Technical Ignition.`;
    }

    if (raw.includes("ZeroDivisionError")) {
      return `[JPE-ALERT] Mathematical Singularity: Mod logic attempted division by zero. Correct your numerical JPE constraints.`;
    }

    // 2. Generic Industrial Fallback
    if (raw.includes("EXCEPTION")) {
      return `[JPE-ALERT] Critical Engine Collision: An unhandled industrial exception occurred in the mod logic. See raw log for stack trace.`;
    }

    return raw; // No translation found, return raw for fidelity
  }
}
