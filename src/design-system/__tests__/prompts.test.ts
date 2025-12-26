import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Atomic Prompts', () => {
  const promptsDir = path.resolve(__dirname, '../prompts');

  it('should have a core-components.md prompt file', () => {
    const filePath = path.join(promptsDir, 'core-components.md');
    expect(fs.existsSync(filePath)).toBe(true);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Button');
    expect(content).toContain('Input');
    expect(content).toContain('Apple TV UX');
    expect(content).toContain('Dark Mode');
  });
});
