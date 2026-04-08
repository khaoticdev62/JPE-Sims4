/**
 * API Route Tests for /api/transform
 * 
 * Tests the Next.js API endpoint for JPE to XML transformation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/transform/route';

// Mock child_process
vi.mock('child_process', () => ({
  spawn: vi.fn(() => ({
    stdout: {
      on: vi.fn((event, cb) => {
        if (event === 'data') {
          cb(Buffer.from(''));
        }
      }),
    },
    stderr: {
      on: vi.fn(),
    },
    on: vi.fn((event, cb) => {
      if (event === 'close') {
        cb(0);
      }
    }),
    onerror: vi.fn(),
  })),
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue('<root><I c="test"/></root>'),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

describe('POST /api/transform', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject requests without source', async () => {
    const request = new Request('http://localhost/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('source');
  });

  it('should reject requests with non-string source', async () => {
    const request = new Request('http://localhost/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 123 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('string');
  });

  it('should accept valid transformation request', async () => {
    const request = new Request('http://localhost/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        source: '[Metadata]\ntype = "test"',
        fileName: 'test.jpe'
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.xml).toBeDefined();
  });

  it('should use default filename when not provided', async () => {
    const request = new Request('http://localhost/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'test' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });
});
