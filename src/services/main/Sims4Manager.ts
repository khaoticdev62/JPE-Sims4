import { app, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { LinkServer } from './LinkServer';

/**
 * Sims4Manager (Main Process)
 * 
 * Consolidates Sims 4 engine logic, bridge management, and IPC.
 * Part of Story 14.1 Electron Consolidation.
 */
export class Sims4Manager {
  private static instance: Sims4Manager;
  private linkServer: LinkServer | null = null;

  constructor(linkServer?: LinkServer) {
    this.linkServer = linkServer || null;
    this.registerIpcHandlers();
  }

  static initialize(linkServer?: LinkServer) {
    if (!Sims4Manager.instance) {
      Sims4Manager.instance = new Sims4Manager(linkServer);
    }
    return Sims4Manager.instance;
  }

  private registerIpcHandlers() {
    // Mods Folder Discovery
    ipcMain.handle('sims4:getModsPath', async () => {
      try {
        const modsPath = this.getModsPath();
        if (modsPath && fs.existsSync(modsPath)) {
          return { success: true, path: modsPath };
        }
        return { success: false, error: 'The Sims 4 Mods folder could not be located in standard directories.' };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown discovery error' };
      }
    });

    // Bridge Deployment (.ts4script bundle generation)
    ipcMain.handle('sims4:deployBridge', async (_event, pythonSource: string) => {
      try {
        const modsPath = this.getModsPath();
        if (!modsPath || !fs.existsSync(modsPath)) {
          return { success: false, error: 'Target Mods folder unavailable' };
        }

        const targetPath = path.join(modsPath, 'jpe_live_sync.ts4script');
        
        // Dynamic zip generation
        const JSZip = require('jszip');
        const zip = new JSZip();
        zip.file('jpe_live_sync.py', pythonSource);
        
        const content = await zip.generateAsync({ type: 'nodebuffer' });
        await fs.promises.writeFile(targetPath, content);

        console.log(`[Sims4Manager] Industrial Bridge deployed to: ${targetPath}`);
        return { success: true, path: targetPath };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Bridge deployment failed' };
      }
    });

    // Bridge Command Dispatch (TCP Inbound)
    ipcMain.handle('bridge:sendCommand', async (_event, type: string, payload: any) => {
      try {
        if (!this.linkServer) {
          return { success: false, error: 'TCP Link Server not initialized' };
        }
        this.linkServer.sendCommand(type, payload);
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Command dispatch failed' };
      }
    });
  }

  /**
   * Identifies the standard Sims 4 Mods directory.
   * Future-proofed with PathResolver.
   */
  private getModsPath(): string | null {
    try {
      // Standard location: Documents\Electronic Arts\The Sims 4\Mods
      const documentsPath = app.getPath('documents');
      return path.join(documentsPath, 'Electronic Arts', 'The Sims 4', 'Mods');
    } catch {
      return null;
    }
  }
}
