import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Tooltips and Status Bar Prompt', () => {
  const promptsDir = path.resolve(__dirname, '../prompts');

  it('should have a feedback-components.md prompt file', () => {
    const filePath = path.join(promptsDir, 'feedback-components.md');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Tooltip');
    expect(content).toContain('Status Bar');
    expect(content).toContain('Delay');
    expect(content).toContain('Z-index');
    expect(content).toContain('Information');
  });
});
