import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('High-Fidelity Dashboard Prompts', () => {
  const promptsDir = path.resolve(__dirname, '../prompts');

  it('should have a dashboard-screen.md prompt file', () => {
    const filePath = path.join(promptsDir, 'dashboard-screen.md');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Dashboard Screen');
    expect(content).toContain('Atomic assembly');
    expect(content).toContain('Sidebar');
    expect(content).toContain('Active Projects');
    expect(content).toContain('Recent Activity');
  });
});
