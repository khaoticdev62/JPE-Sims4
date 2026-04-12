import { TS4RebelsService } from '../TS4RebelsService';

// Mock the electron bridge
const mockInvoke = jest.fn();
(window as any).electron = {
  ts4rebels: {
    invoke: mockInvoke
  }
};

describe('TS4RebelsService', () => {
  beforeEach(() => {
    mockInvoke.mockClear();
  });

  it('should call electron bridge with correctly formatted publish data', async () => {
    const title = 'Test Mod';
    const description = 'Cool Desc';
    const buffer = new ArrayBuffer(8);
    const name = 'test.package';
    const tags = 'tag1,tag2';

    mockInvoke.mockResolvedValue({ success: true, data: { topic_id: 123 } });

    const result = await TS4RebelsService.publishMod(title, description, buffer, name, tags);

    expect(mockInvoke).toHaveBeenCalledWith('publish', expect.objectContaining({
      title,
      description,
      packageName: name,
      tags
    }));
    expect(result.success).toBe(true);
    expect(result.data.topic_id).toBe(123);
  });

  it('should handle login bridge calls correctly', async () => {
    mockInvoke.mockResolvedValue({ 
      success: true, 
      data: { ok: true, cookies: { 'sid': '123' }, diagnostics: [] } 
    });

    const result = await TS4RebelsService.login('user', 'pass');

    expect(mockInvoke).toHaveBeenCalledWith('login', { username: 'user', password: 'pass' });
    expect(result.success).toBe(true);
    expect(result.data.ok).toBe(true);
  });

  it('should handle bridge errors gracefully', async () => {
    mockInvoke.mockRejectedValue(new Error('IPC_FAIL'));

    const result = await TS4RebelsService.publishMod('t', 'd', new ArrayBuffer(0), 'n');

    expect(result.success).toBe(false);
    expect(result.error).toBe('IPC_FAIL');
  });
});
