# Synthesis: Binary Resource Patterns

Lessons learned from the initial Logic Engine phase (Story 2.3) regarding Sims 4 binary resources.

## STBL (String Table) Handling

### 🧩 Pattern 1: Memory-Efficient Buffer Slicing
- **Discovery**: `stbl.ts` (Story 2.3)
- **Pattern**: Use `Buffer.from()` and `readUIntLE()` for non-standard binary offsets instead of a full parser sweep. This preserves memory for enormous mod packages.
- **Guidance**: Always validate the MAGIC bytes (`STBL` / `0x5354424C`) before parsing to prevent Corrupted Resource errors.

### 🧩 Pattern 2: FNV64 Hashing (0x025BE6F6)
- **Discovery**: Hashing Logic Spike
- **Pattern**: String Table Resource IDs must follow the `0x02` (High Byte) + FNV64 (lower bits) format for Sims 4 compatibility.
- **Guidance**: Use the `JPETranslator.hash` utility to ensure consistent Instance ID generation between JPE and XML.

---
*Created: 2026-04-02*
