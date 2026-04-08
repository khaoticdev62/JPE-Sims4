import axios from 'axios';
import { URLSearchParams } from 'url';

/**
 * Scarlet's Realm Live Stress & Integrity Test (Validated Structure)
 */

const TARGET_URL = 'https://scarletsrealm.com/the-mod-list-sfw-only-edition/';
const AJAX_URL = 'https://scarletsrealm.com/wp-admin/admin-ajax.php';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function runTest() {
  console.log('🚀 INITIALIZING SCARLET LIVE VALIDATION TEST...');
  const overallStart = Date.now();

  try {
    // --- PHASE 1: HANDSHAKE ---
    console.log('\n--- PHASE 1: LIVE HANDSHAKE ---');
    const pageRes = await axios.get(TARGET_URL, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    const html = pageRes.data;
    const nonceMatch = html.match(/"nonce":"([a-zA-Z0-9]+)"/);
    if (!nonceMatch) {
      console.error('❌ FAILED: Nonce not found.');
      process.exit(1);
    }
    const nonce = nonceMatch[1];
    console.log(`✅ Handshake Success. Nonce: ${nonce}`);

    // --- PHASE 2: AJAX PROBE ---
    console.log('\n--- PHASE 2: AJAX PROBE ---');
    
    const formData = new URLSearchParams();
    formData.append('action', 'mlc_get_data');
    formData.append('nonce', nonce);
    formData.append('table_id', '3');

    const res = await axios.post(AJAX_URL, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
        'Referer': TARGET_URL,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const data = res.data;
    const rows = data?.data?.rows || [];
    const count = rows.length;
    
    console.log(`📡 Response Status: ${res.status}`);
    console.log(`📊 Mods Encountered: ${count}`);

    if (count > 0) {
      console.log('✅ Success! Live data is streaming.');
      const sample = rows[0];
      console.log('\n--- PHASE 3: SCHEMA AUDIT ---');
      console.log('🔹 Sample Row:', JSON.stringify(sample));
      
      // Mapped data check
      const mapped = {
        name: sample[1],
        creator: sample[2],
        status: sample[4],
        version: sample[5],
        category: sample[11]
      };
      
      console.log('⚖️  Mapped Sample:', JSON.stringify(mapped, null, 2));
      
      if (mapped.name && mapped.creator && mapped.status) {
        console.log('✅ Integrity Check: PASSED');
      } else {
        console.error('❌ Integrity Check: FAILED (Missing required fields)');
      }
    } else {
      console.error('❌ FAILED: Still returning 0 mods. Structural disconnect persists.');
      console.log('Raw JSON keys:', Object.keys(data || {}));
      if (data?.data) console.log('Data object keys:', Object.keys(data.data));
    }

    console.log(`\n✨ TEST COMPLETE in ${Date.now() - overallStart}ms`);
  } catch (error: any) {
    console.error('\n💥 TEST CRASHED:', error.message);
  }
}

runTest();
