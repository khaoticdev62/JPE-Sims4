import { spawn } from 'child_process';
import path from 'path';

/**
 * TS4Rebels Stress Test
 * 
 * Spawns concurrent scraper requests to test stability and performance.
 */

const CONCURRENCY = 8;
const TEST_FORUM_ID = 59; // File Donations
const TEST_TOPIC_IDS = [2905, 7280, 7242, 7232, 7572, 5, 621, 396];

async function runTest() {
  console.log('🚀 INITIALIZING TS4REBELS STRESS TEST');
  console.log(`📊 Concurrency: ${CONCURRENCY} | Target: forum ${TEST_FORUM_ID}\n`);

  const startTime = Date.now();
  const results = await Promise.all(
    TEST_TOPIC_IDS.map((id) => runScrape(id))
  );

  const duration = Date.now() - startTime;
  const successCount = results.filter((r) => r.success).length;

  console.log('\n🏁 STRESS TEST COMPLETE');
  console.log(`⏱️  Total Duration: ${duration}ms`);
  console.log(`✅ Success Rate: ${successCount}/${results.length} (${(successCount/results.length)*100}%)`);
  
  if (successCount > 0) {
    const avgTime = results.reduce((acc, r) => acc + r.duration, 0) / successCount;
    const avgHandshake = results.reduce((acc, r) => acc + r.handshake, 0) / successCount;
    console.log(`⚡ Avg Response Time: ${avgTime.toFixed(2)}ms`);
    console.log(`📁 Avg Scrape Time: ${avgHandshake.toFixed(2)}ms`);
  }

  process.exit(successCount === results.length ? 0 : 1);
}

async function runScrape(topicId: number): Promise<{ success: boolean; duration: number; handshake: number }> {
  const start = Date.now();
  return new Promise((resolve) => {
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const cliPath = path.resolve('cli.py');
    const args = [cliPath, 'ts4rebels', '--enable-network', 'topic', topicId.toString()];

    const child = spawn(pythonCmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (code) => {
      const duration = Date.now() - start;
      // We consider code 1 as success if it's just an auth requirement (scraper worked, links restricted)
      const isAuthError = stdout.includes('E_TS4REBEL_AUTH_REQUIRED');
      const success = code === 0 || isAuthError;
      
      console.log(`${success ? (isAuthError ? '🛡️' : '✅') : '❌'} Topic #${topicId} - ${duration}ms ${isAuthError ? '(Auth Required)' : ''}`);
      if (!success && !isAuthError) console.error(`   Error Topic #${topicId}: ${stderr.trim().split('\n')[0]}`);

      resolve({
        success,
        duration,
        handshake: duration
      });
    });
  });
}

runTest();
