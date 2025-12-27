import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Editor Component Prompts', () => {
  const promptsDir = path.resolve(__dirname, '../prompts');

  it('should have an editor-components.md prompt file', () => {
    const filePath = path.join(promptsDir, 'editor-components.md');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Editor Tab');
    expect(content).toContain('Gutter');
    expect(content).toContain('Status Bar');
    expect(content).toContain('Monospace');
    expect(content).toContain('Dirty State');
  });
});
