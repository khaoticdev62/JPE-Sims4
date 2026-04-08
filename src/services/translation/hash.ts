/**
 * FNV-64 Hashing Utility (Sims 4 Standard)
 * 
 * Used to generate unique 64-bit decimal IDs for mod tuning elements.
 * Returns a decimal string to avoid JavaScript Number precision loss.
 */

const FNV_PRIME = BigInt('0x100000001B3')
const FNV_OFFSET_BASIS = BigInt('0xCBF29CE484222325')
const UINT64_MAX = BigInt('0xFFFFFFFFFFFFFFFF')

const FNV32_PRIME = 0x01000193
const FNV32_OFFSET_BASIS = 0x811c9dc5

/**
 * Standard FNV-1 64-bit hash (Common for Sims 4 tuning instances)
 */
export function fnv64(input: string, namespace?: string): string {
  // Sims 4 requires lowercase for hashing
  const normalized = input.toLowerCase()
  const saltValue = namespace ? `${namespace.toLowerCase()}:${normalized}` : normalized
  
  // Use Buffer for byte-level accuracy
  const _Buffer = typeof Buffer !== 'undefined' ? Buffer : require('buffer').Buffer
  const bytes = _Buffer.from(saltValue, 'utf-8')

  let hash = FNV_OFFSET_BASIS

  for (const byte of bytes) {
    hash = (hash * FNV_PRIME) & UINT64_MAX
    hash = hash ^ BigInt(byte)
  }

  return hash.toString()
}

/**
 * FNV-1a 64-bit hash (Used in some STBL and specialized contexts)
 */
export function fnv64ia(input: string): string {
  const normalized = input.toLowerCase()
  const _Buffer = typeof Buffer !== 'undefined' ? Buffer : require('buffer').Buffer
  const bytes = _Buffer.from(normalized, 'utf-8')

  let hash = FNV_OFFSET_BASIS

  for (const byte of bytes) {
    hash = hash ^ BigInt(byte)
    hash = (hash * FNV_PRIME) & UINT64_MAX
  }

  return hash.toString()
}

/**
 * Standard FNV-1 32-bit hash (Used for STBL keys in some contexts)
 */
export function fnv32(input: string): number {
  const normalized = input.toLowerCase()
  const _Buffer = typeof Buffer !== 'undefined' ? Buffer : require('buffer').Buffer
  const bytes = _Buffer.from(normalized, 'utf-8')

  let hash = FNV32_OFFSET_BASIS

  for (const byte of bytes) {
    hash = Math.imul(hash, FNV32_PRIME)
    hash = (hash ^ byte) >>> 0
  }

  return hash
}

/**
 * FNV-1a 32-bit hash (Standard for STBL string keys)
 */
export function fnv32ia(input: string): number {
  const normalized = input.toLowerCase()
  const _Buffer = typeof Buffer !== 'undefined' ? Buffer : require('buffer').Buffer
  const bytes = _Buffer.from(normalized, 'utf-8')

  let hash = FNV32_OFFSET_BASIS

  for (const byte of bytes) {
    hash = (hash ^ byte) >>> 0
    hash = Math.imul(hash, FNV32_PRIME)
    hash = hash >>> 0 // Final unsigned mask
  }

  return hash
}

