import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Studio Home UX Flow', () => {
  const docsDir = path.resolve(__dirname, '../../../docs/design');

  it('should have a studio-home-ux.md documentation file', () => {
    const filePath = path.join(docsDir, 'studio-home-ux.md');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('User Flow');
    expect(content).toContain('Wireframe');
    expect(content).toContain('Project Overview');
    expect(content).toContain('Recent Activity');
  });
});
