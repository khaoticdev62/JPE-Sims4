import { ipcMain } from 'electron';
import axios from 'axios';

/**
 * ScarletManager (Main Process)
 * 
 * Manages scraping and synchronization with Scarlet Realm.
 * Part of Story 14.1 Electron Consolidation.
 */
export class ScarletManager {
  private readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  constructor() {
    this.registerIpcHandlers();
  }

  static initialize() {
    return new ScarletManager();
  }

  private registerIpcHandlers() {
    ipcMain.handle('scarlet:fetch', async () => {
      const start = Date.now();
      try {
        // 1. Handshake (get nonce)
        const page = await axios.get('https://scarletsrealm.com/the-mod-list-sfw-only-edition/', {
          headers: { 'User-Agent': this.USER_AGENT }
        });
        const nonce = page.data.match(/"nonce":"([a-zA-Z0-9]+)"/)?.[1];
        if (!nonce) throw new Error('Security Nonce Negotiator failed: Nonce not found');

        // 2. Fetch Data
        const params = new URLSearchParams();
        params.append('action', 'mlc_get_data');
        params.append('nonce', nonce);
        params.append('table_id', '3');

        const apiResponse = await axios.post('https://scarletsrealm.com/wp-admin/admin-ajax.php', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.USER_AGENT
          }
        });

        const rows = apiResponse.data?.data?.rows || [];
        const mods = rows.map((row: any[], i: number) => ({
          id: `scarlet-${i}`,
          name: row[1] || 'Unknown',
          creator: row[2] || 'Unknown',
          status: this.mapStatus(row[4]),
          version: row[5] || 'Unknown',
          notes: row[7] || '',
          category: row[11] || ''
        }));

        return { success: true, count: mods.length, mods, duration: (Date.now() - start).toFixed(2) };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    });
  }

  private mapStatus(raw: string): string {
    const s = raw?.toLowerCase() || '';
    if (s.includes('fine') || s.includes('working')) return 'Fine';
    if (s.includes('updated')) return 'Updated';
    if (s.includes('broken')) return 'Broken';
    return 'Unknown';
  }
}
