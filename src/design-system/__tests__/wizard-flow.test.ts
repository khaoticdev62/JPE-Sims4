import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('New Project Wizard UX Flow', () => {
  const docsDir = path.resolve(__dirname, '../../../docs/design');

  it('should have a new-project-wizard-ux.md documentation file', () => {
    const filePath = path.join(docsDir, 'new-project-wizard-ux.md');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('User Flow');
    expect(content).toContain('Stepper');
    expect(content).toContain('Wizard Steps');
    expect(content).toContain('Validation');
  });
});
