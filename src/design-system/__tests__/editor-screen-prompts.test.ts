import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Editor Screen Prompts', () => {
  const promptsDir = path.resolve(__dirname, '../prompts');

  it('should have an editor-screen.md prompt file', () => {
    const filePath = path.join(promptsDir, 'editor-screen.md');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Editor Workspace Assembly');
    expect(content).toContain('Code Area');
    expect(content).toContain('Sidebar');
    expect(content).toContain('Diagnostics');
    expect(content).toContain('Apple TV UX');
  });
});
