import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// Define the schema for the tokens
const ColorSchema = z.record(z.string(), z.string().regex(/^#[0-9A-Fa-f]{6}$|^rgba?\(.*\)$/, "Invalid color format"));
const TypographySchema = z.object({
  fontFamily: z.record(z.string(), z.string()),
  fontSize: z.record(z.string(), z.string()),
  fontWeight: z.record(z.string(), z.number()),
});
const SpacingSchema = z.record(z.string(), z.string());

const TokenSchema = z.object({
  colors: ColorSchema,
  typography: TypographySchema,
  spacing: SpacingSchema,
});

describe('Design Tokens', () => {
  it('should exist and match the defined schema', () => {
    const tokensPath = path.resolve(__dirname, '../tokens.json');
    
    // Check if file exists
    expect(fs.existsSync(tokensPath)).toBe(true);

    // Read and parse file
    const fileContent = fs.readFileSync(tokensPath, 'utf-8');
    const tokens = JSON.parse(fileContent);

    // Validate against schema
    const result = TokenSchema.safeParse(tokens);
    if (!result.success) {
      console.error(JSON.stringify(result.error.format(), null, 2));
    }
    expect(result.success).toBe(true);
  });
});
