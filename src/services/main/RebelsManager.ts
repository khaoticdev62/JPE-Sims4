import { ipcMain } from 'electron';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PathResolver } from './PathResolver';

/**
 * RebelsManager (Main Process)
 * 
 * Manages the TS4Rebels community integration.
 * Part of Story 14.1 Electron Consolidation.
 */
export class RebelsManager {
  constructor() {
    this.registerIpcHandlers();
  }

  static initialize() {
    return new RebelsManager();
  }

  private registerIpcHandlers() {
    ipcMain.handle('ts4rebels:invoke', async (_event, action: string, params: Record<string, string>) => {
      return this.invokeRebelsCli(action, params);
    });
  }

  private invokeRebelsCli(action: string, params: Record<string, string>): Promise<any> {
    return new Promise((resolve) => {
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      // Use standalone TS4Rebels CLI (no jpe_sims4 dependency)
      const cliPath = PathResolver.getScriptPath('scripts/ts4rebels_cli.py');

      const sanitize = (s: unknown, maxLen = 256): string => {
        if (typeof s !== 'string') throw new Error('Invalid parameter type');
        if (s.length === 0) throw new Error('Parameter cannot be empty');
        if (s.length > maxLen) throw new Error(`Parameter exceeds max length (${maxLen})`);
        if (s.startsWith('--') || s.startsWith('-')) throw new Error('Invalid parameter format');
        return s;
      };

      if (!['login', 'forum', 'topic', 'publish'].includes(action)) {
        return resolve({ success: false, error: 'Invalid TS4Rebels action' });
      }

      // Build command args for standalone ts4rebels_cli.py
      const args = [cliPath, '--enable-network'];
      let publishTempPath: string | null = null;
      const childEnv: NodeJS.ProcessEnv = {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
      };

      try {
        // Pass cookies as CLI argument if provided
        if (params.cookies) {
           args.push('--cookies', params.cookies);
        }

        if (action === 'login') {
          args.push('login', '--username', sanitize(params.username, 256), '--password', sanitize(params.password, 512));
        } else if (action === 'forum') {
          args.push('forum', sanitize(params.forum, 64), '--page', sanitize(params.page || '1', 10));
        } else if (action === 'topic') {
          args.push('topic', sanitize(params.topic, 64), '--page', sanitize(params.page || '1', 10));
        } else if (action === 'publish') {
          const title = sanitize(params.title, 512);
          const desc = sanitize(params.description, 4096);
          const tags = params.tags ? sanitize(params.tags, 512) : '';
          const packageName = sanitize(params.packageName, 256);
          
          if (!params.packageBase64) throw new Error('Package data is missing');
          
          const tempDir = path.join(os.tmpdir(), 'jpe-studio-publish');
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
          
          const tempPath = path.join(tempDir, packageName);
          const buffer = Buffer.from(params.packageBase64, 'base64');
          fs.writeFileSync(tempPath, buffer);
          
          args.push('publish', '--title', title, '--description', desc, '--package', tempPath);
          if (tags) args.push('--tags', tags);
          publishTempPath = tempPath;
        }
      } catch (err) {
        return resolve({ success: false, error: err instanceof Error ? err.message : 'Validation failed' });
      }

      const child = spawn(pythonCmd, args, { env: childEnv });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });

      const timeout = setTimeout(() => {
        if (!child.killed) child.kill('SIGKILL');
      }, 600000);

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (publishTempPath && fs.existsSync(publishTempPath)) fs.unlinkSync(publishTempPath);
        
        try {
          if (code === 0) {
            resolve({ success: true, data: JSON.parse(stdout) });
          } else {
            resolve({ success: false, error: stderr || `Process exit code ${code}` });
          }
        } catch (err) {
          resolve({ success: false, error: `Parse error: ${String(err)}`, raw: stdout });
        }
      });

      child.on('error', (err) => {
        clearTimeout(timeout);
        resolve({ success: false, error: err.message });
      });
    });
  }
}
