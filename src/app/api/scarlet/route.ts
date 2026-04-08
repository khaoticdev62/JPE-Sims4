import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  console.log('[Scarlet Proxy] Target: https://scarletsrealm.com/the-mod-list-sfw-only-edition/');

  try {
    // 1. Fetch the page to get the dynamic nonce
    const pageResponse = await fetch('https://scarletsrealm.com/the-mod-list-sfw-only-edition/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!pageResponse.ok) {
      throw new Error(`External site returned ${pageResponse.status}: ${pageResponse.statusText}`);
    }

    const html = await pageResponse.text();
    
    // Extract nonce
    const nonceMatch = html.match(/"nonce":"([a-zA-Z0-9]+)"/);
    if (!nonceMatch) {
      throw new Error('STRUCTURAL BREAK: Could not find nonce on Scarlet Realm. The site structure may have changed.');
    }
    const nonce = nonceMatch[1];
    const handshakeTime = Date.now() - startTime;

    // 2. Fetch data via AJAX
    const formData = new URLSearchParams();
    formData.append('action', 'mlc_get_data');
    formData.append('nonce', nonce);
    formData.append('table_id', '3'); // SFW Only Table ID

    const apiResponse = await fetch('https://scarletsrealm.com/wp-admin/admin-ajax.php', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!apiResponse.ok) {
      throw new Error(`Scarlets AJAX returned ${apiResponse.status}: ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    
    if (!data || !data.data) {
      return NextResponse.json({ success: false, error: 'Malformed response from Scarlet' }, { status: 500 });
    }

    // 3. Transform data to our internal format
    // New Structure: { success: true, data: { headers: [...], rows: [[...]] } }
    const rows = data.data.rows || [];
    const mods = rows.map((row: any[], index: number) => {
      // Mapping based on live audit:
      // [1] Name, [2] Creator, [4] Patch Status, [5] Last Known Update, [6] Last Status Change, [7] Notes, [11] Category
      return {
        id: `scarlet-${index}`,
        name: row[1] || 'Unknown Mod',
        creator: row[2] || 'Unknown Creator',
        status: mapStatus(row[4]),
        version: row[5] || 'Unknown',
        notes: row[7] || '',
        category: row[11] || ''
      };
    });

    const totalTime = Date.now() - startTime;
    console.log(`[Scarlet Proxy] Success. Mods: ${mods.length}, Total Time: ${totalTime}ms (Handshake: ${handshakeTime}ms)`);

    return NextResponse.json({ 
      success: true, 
      count: mods.length, 
      performance: { totalTime, handshakeTime },
      mods 
    });

  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[Scarlet Proxy Error] after ${totalTime}ms:`, error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      performance: { totalTime } 
    }, { status: 500 });
  }
}

function mapStatus(rawStatus: string): string {
  const s = rawStatus?.toLowerCase() || '';
  if (s.includes('fine') || s.includes('working') || s.includes('clear')) return 'Fine';
  if (s.includes('updated')) return 'Updated';
  if (s.includes('broken')) return 'Broken';
  if (s.includes('n/a')) return 'N/A';
  return 'Unknown';
}
