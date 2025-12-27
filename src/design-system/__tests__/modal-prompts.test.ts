import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Modal Component Prompts', () => {
  const promptsDir = path.resolve(__dirname, '../prompts');

  it('should have a management-modals.md prompt file', () => {
    const filePath = path.join(promptsDir, 'management-modals.md');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('New Project Wizard');
    expect(content).toContain('Settings Dialog');
    expect(content).toContain('Stepper');
    expect(content).toContain('Glassmorphism');
    expect(content).toContain('Transition');
  });
});
