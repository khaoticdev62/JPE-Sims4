import { ipcMain } from 'electron';
import { SecureStore } from './SecureStore';

/**
 * SecurityManager (Main Process)
 * 
 * Manages the AES-256 Security Vault and Industrial Shielding status.
 * Part of Story 14.1 Electron Consolidation.
 */
export class SecurityManager {
  constructor() {
    this.registerIpcHandlers();
  }

  static initialize() {
    return new SecurityManager();
  }

  private registerIpcHandlers() {
    ipcMain.handle('security:vault:get', async (_event, key: string) => {
      try {
        const value = SecureStore.getInstance().get(key);
        return { success: true, value };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    });

    ipcMain.handle('security:vault:set', async (_event, key: string, value: any) => {
      try {
        SecureStore.getInstance().set(key, value);
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    });

    ipcMain.handle('security:vault:status', async () => {
      try {
        return { 
          success: true, 
          isShielded: SecureStore.getInstance().isShielded(),
          algorithm: 'AES-256-GCM',
          provider: 'Native Security Engine'
        };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    });
  }
}
