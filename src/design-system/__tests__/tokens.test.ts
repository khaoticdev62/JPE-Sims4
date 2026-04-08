import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { T } from '../../components/robust/jpe-theme';

// Define the schema for the tokens (adapting to the T object structure)
const TokenSchema = z.object({
  bg: z.string(),
  bgDeep: z.string(),
  cyan: z.string(),
  violet: z.string(),
  mono: z.string(),
  sans: z.string(),
  display: z.string(),
});

describe('Design Tokens (T)', () => {
  it('should have correct core branding tokens', () => {
    // Validate core tokens exist and are strings
    expect(typeof T.bg).toBe('string');
    expect(typeof T.cyan).toBe('string');
    expect(typeof T.violet).toBe('string');
    expect(typeof T.mono).toBe('string');
    expect(typeof T.sans).toBe('string');
    expect(typeof T.display).toBe('string');

    // Check specific font values for Phase 3 industrial standard
    expect(T.mono).toContain('JetBrains Mono');
    expect(T.sans).toContain('Inter');
    expect(T.display).toContain('Outfit');
  });

  it('should match the defined schema properties', () => {
    const result = TokenSchema.safeParse(T);
    // Note: We only check a subset of T in this test to ensure core tokens are stable
    expect(result.success).toBe(true);
  });
});
