import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Layout Prompts', () => {
  const promptsDir = path.resolve(__dirname, '../prompts');

  it('should have a layout-components.md prompt file', () => {
    const filePath = path.join(promptsDir, 'layout-components.md');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Card');
    expect(content).toContain('Modal');
    expect(content).toContain('Sidebar');
    expect(content).toContain('Glassmorphism');
  });
});
