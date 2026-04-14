import { ipcMain } from 'electron';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PathResolver } from './PathResolver';

/**
 * TransformManager (Main Process)
 * 
 * Manages the JPE-to-XML synthesis engine.
 * Part of Story 14.1 Electron Consolidation.
 */
export class TransformManager {
  constructor() {
    this.registerIpcHandlers();
  }

  static initialize() {
    return new TransformManager();
  }

  private registerIpcHandlers() {
    // Health Check
    ipcMain.handle('transform:health', async () => {
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      return new Promise((resolve) => {
        const proc = spawn(pythonCmd, ['--version']);
        let stdout = '';
        proc.stdout.on('data', (d) => stdout += d.toString());
        proc.on('close', (code) => {
          if (code === 0) {
            resolve({ available: true, version: stdout.match(/Python\s+([\d.]+)/)?.[1] || 'Unknown', path: pythonCmd });
          } else {
            resolve({ available: false });
          }
        });
        proc.on('error', () => resolve({ available: false }));
      });
    });

    // Run Transformation
    ipcMain.handle('transform:run', async (_event, source: string, fileName: string) => {
      const start = Date.now();
      const tempDir = path.join(os.tmpdir(), `jpe-native-transform-${Date.now()}`);
      const inputFile = path.join(tempDir, fileName || 'input.jpe');
      const outputFile = path.join(tempDir, 'output.xml');

      try {
        await fs.promises.mkdir(tempDir, { recursive: true });
        await fs.promises.writeFile(inputFile, source, 'utf-8');

        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const engineScript = PathResolver.getPythonScriptPath('scripts/transform_jpe.py');

        return new Promise((resolve) => {
          const proc = spawn(pythonCmd, [engineScript, inputFile, '-o', outputFile]);
          let stderr = '';
          proc.stderr.on('data', (d) => stderr += d.toString());

          const timeout = setTimeout(() => {
            if (!proc.killed) proc.kill('SIGKILL');
          }, 30000);

          proc.on('close', async (code) => {
            clearTimeout(timeout);
            try {
              if (code === 0) {
                const xml = await fs.promises.readFile(outputFile, 'utf-8');
                resolve({ success: true, xml, duration: (Date.now() - start).toFixed(2) });
              } else {
                resolve({ success: false, error: stderr || `Exit code ${code}` });
              }
            } catch (err) {
              resolve({ success: false, error: String(err) });
            } finally {
              await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});
            }
          });

          proc.on('error', (err) => {
            clearTimeout(timeout);
            resolve({ success: false, error: err.message });
          });
        });
      } catch (err) {
        return { success: false, error: String(err) };
      }
    });
  }
}
