import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Right Panel Prompts', () => {
  const promptsDir = path.resolve(__dirname, '../prompts');

  it('should have a right-panel-components.md prompt file', () => {
    const filePath = path.join(promptsDir, 'right-panel-components.md');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Diagnostics Panel');
    expect(content).toContain('Properties Panel');
    expect(content).toContain('Warning');
    expect(content).toContain('Error');
    expect(content).toContain('Info');
    expect(content).toContain('Accordion');
  });
});
