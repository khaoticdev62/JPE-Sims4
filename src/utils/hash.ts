/**
 * Hashing Utilities for The Sims 4
 * 
 * Implements FNV-1a algorithms for deterministic Resource Instance ID generation.
 * This is the industrial standard used by Maxis for The Sims 4.
 */

const FNV_OFFSET_64 = BigInt("0xcbf29ce484222325");
const FNV_PRIME_64 = BigInt("0x100000001b3");

/**
 * Generates a 64-bit FNV-1a hash of a string.
 * This is used for Instance IDs of XML tuning resources.
 * 
 * @param input The string to hash (usually the tuning name, e.g., "author:tuning_name")
 * @returns A BigInt representing the 64-bit hash.
 */
export function fnv64(input: string): bigint {
  const bytes = new TextEncoder().encode(input.toLowerCase());
  let hash = FNV_OFFSET_64;

  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * FNV_PRIME_64) & BigInt("0xffffffffffffffff");
  }

  // Sims 4 instance IDs often have the high bit set to ensure positive 64-bit IDs in some loaders
  return hash | BigInt("0x8000000000000000");
}

/**
 * Generates a 32-bit FNV-1a hash of a string.
 * Primarily used for string table keys (STBL).
 */
export function fnv32(input: string): number {
  const FNV_OFFSET_32 = 0x811c9dc5;
  const FNV_PRIME_32 = 0x01000193;

  const bytes = new TextEncoder().encode(input.toLowerCase());
  let hash = FNV_OFFSET_32;

  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, FNV_PRIME_32);
  }

  return hash >>> 0;
}

/**
 * Formats a BigInt hash as a high-fidelity hexadecimal string.
 */
export function formatHashHex(hash: bigint): string {
  return hash.toString(16).toUpperCase().padStart(16, '0');
}
