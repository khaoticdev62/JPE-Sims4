import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Icon System Prompt', () => {
  const promptsDir = path.resolve(__dirname, '../prompts');

  it('should have an icon-system.md prompt file', () => {
    const filePath = path.join(promptsDir, 'icon-system.md');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Lucide');
    expect(content).toContain('Consistency');
    expect(content).toContain('Stroke Width');
    expect(content).toContain('Focused State');
  });
});
