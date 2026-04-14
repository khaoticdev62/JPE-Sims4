import { ipcMain } from 'electron';
import axios from 'axios';

/**
 * AiManager (Main Process)
 * 
 * Routes AI requests from the renderer through the native layer.
 * Part of Story 14.1 Electron Consolidation.
 */
export class AiManager {
  constructor() {
    this.registerIpcHandlers();
  }

  static initialize() {
    return new AiManager();
  }

  private registerIpcHandlers() {
    ipcMain.handle('ai:invoke', async (_event, provider: string, method: string, params: any) => {
      const { url, headers, data } = params;
      try {
        const response = await axios({
          method: method.toUpperCase() || 'POST',
          url,
          headers,
          data,
          timeout: 45000,
        });

        return { success: true, data: response.data, status: response.status };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.response?.data || error.message,
          status: error.response?.status 
        };
      }
    });
  }
}
