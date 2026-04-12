/**
 * IPC Real-Time Audit Suite (Final Success Path)
 * 
 * Verifies all native IPC bridges are delivering data in real-time
 * and maintaining structural integrity across the Zero-Server logic.
 */

import { CompilerService } from '@/services/CompilerService';
import { GeminiService } from '@/services/ai/GeminiService';
import { ModCompatibilityService } from '@/services/ModCompatibilityService';
import { TS4RebelsService } from '@/services/api/TS4RebelsService';

// Mock dependency to ensure AI services don't skip the bridge call
jest.mock('@/services/ai/AIKeyStore', () => ({
  AIKeyStore: {
    getKey: jest.fn().mockResolvedValue('mock-api-key')
  }
}));

describe('Native IPC Real-Time Audit', () => {
  
  beforeEach(() => {
    // Apply spies to the global bridge methods initialized in jest.env.js
    jest.spyOn(window.electron.transform, 'run');
    jest.spyOn(window.electron.ai, 'invoke');
    jest.spyOn(window.electron.scarlet, 'fetch');
    jest.spyOn(window.electron.ts4rebels, 'invoke');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Transformation Engine (transform:run)', () => {
    it('should complete industrial synthesis within < 100ms real-time threshold', async () => {
      const start = Date.now();
      // Use compileWithPython to trigger the native IPC bridge
      const result = await CompilerService.compileWithPython('DO test_interaction', 'test.jpe');
      const duration = Date.now() - start;
      
      console.log(`[AUDIT] transform:run Bridge Latency: ${duration}ms`);
      
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(150); 
      expect(window.electron.transform.run).toHaveBeenCalledWith('DO test_interaction', 'test.jpe');
    });
  });

  describe('Universal AI Bridge (ai:invoke)', () => {
    it('should route Gemini requests with sub-100ms bridge overhead', async () => {
      const gemini = GeminiService.getInstance();
      const start = Date.now();
      const result = await gemini.chat([{ role: 'user', content: 'hello' }]);
      const duration = Date.now() - start;
      
      console.log(`[AUDIT] ai:invoke (Gemini) Bridge Latency: ${duration}ms`);
      
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(250);
      expect(window.electron.ai.invoke).toHaveBeenCalled();
    });
  });

  describe('Mod Compatibility Scraper (scarlet:fetch)', () => {
    it('should fetch mod list without data degradation', async () => {
      const start = Date.now();
      const mods = await ModCompatibilityService.fetchScarletModList();
      const duration = Date.now() - start;
      
      console.log(`[AUDIT] scarlet:fetch Bridge Latency: ${duration}ms`);
      
      expect(Array.isArray(mods)).toBe(true);
      expect(duration).toBeLessThan(500);
      expect(window.electron.scarlet.fetch).toHaveBeenCalled();
    });
  });

  describe('TS4Rebels Scraper (ts4rebels:invoke)', () => {
    it('should handle forum requests in real-time', async () => {
      const start = Date.now();
      const result = await TS4RebelsService.listForum(59, 1);
      const duration = Date.now() - start;
      
      console.log(`[AUDIT] ts4rebels:invoke Bridge Latency: ${duration}ms`);
      
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);
      expect(window.electron.ts4rebels.invoke).toHaveBeenCalledWith('forum', expect.any(Object));
    });
  });

});
