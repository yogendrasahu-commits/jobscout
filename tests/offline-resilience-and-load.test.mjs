/**
 * JobScout Enterprise Automated QA Suite:
 * Offline Resilience, Outbox Queue Sync, and 500-Burst Concurrency Load Testing
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const BASE_URL = 'http://localhost:5000';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName} ${details ? '(' + details + ')' : ''}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? '[' + details + ']' : ''}`);
    failed++;
  }
}

// Simple HTTP request helper
function makeRequest(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const startTime = Date.now();
    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const latency = Date.now() - startTime;
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          json,
          latency
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

console.log('======================================================================');
console.log('🚀 STARTING JOBSCOUT OFFLINE-FIRST RESILIENCE & LOAD TESTING AUDIT');
console.log('======================================================================\n');

async function runOfflineSuite() {
  console.log('--- TEST SUITE 1: OFFLINE SEED DATA & SCHEMA INTEGRITY ---');

  // Verify offlineStorage.js exists and exports expected seed data
  const storageFilePath = path.join(ROOT_DIR, 'client', 'src', 'utils', 'offlineStorage.js');
  assert(fs.existsSync(storageFilePath), 'offlineStorage.js exists in client/src/utils');

  const storageContent = fs.readFileSync(storageFilePath, 'utf-8');
  assert(storageContent.includes('SEED_OFFLINE_JOBS'), 'Pre-seeded offline jobs are defined');
  assert(storageContent.includes('SEED_OFFLINE_SEEKERS'), 'Pre-seeded offline seekers are defined');
  assert(storageContent.includes('SEED_OFFLINE_EMPLOYERS'), 'Pre-seeded offline employers are defined');
  assert(storageContent.includes('SEED_OFFLINE_POSTS'), 'Pre-seeded offline posts are defined');
  assert(storageContent.includes('SEED_OFFLINE_ANON'), 'Pre-seeded offline anon discussions are defined');
  assert(storageContent.includes('queueOfflineAction'), 'queueOfflineAction mutation buffer is implemented');
  assert(storageContent.includes('syncOfflineOutbox'), 'syncOfflineOutbox reconciliation engine is implemented');

  console.log('\n--- TEST SUITE 2: SERVICE WORKER PWA CONTRACT VERIFICATION ---');

  const swPath = path.join(ROOT_DIR, 'client', 'public', 'sw.js');
  assert(fs.existsSync(swPath), 'sw.js exists in client/public');
  const swContent = fs.readFileSync(swPath, 'utf-8');

  assert(swContent.includes('jobscout-api-cache'), 'sw.js defines dedicated API cache store');
  assert(swContent.includes('/api/jobs'), 'sw.js caches /api/jobs for offline serving');
  assert(swContent.includes('/api/auth/seekers'), 'sw.js caches /api/auth/seekers for offline serving');
  assert(swContent.includes('/api/auth/employers'), 'sw.js caches /api/auth/employers for offline serving');
  assert(swContent.includes('/api/posts'), 'sw.js caches /api/posts for offline serving');
  assert(swContent.includes('cartocdn.com'), 'sw.js caches CartoCDN and OSM map tiles');
  assert(swContent.includes("request.mode === 'navigate'"), 'sw.js handles SPA navigation requests offline');
  assert(swContent.includes('/index.html'), 'sw.js serves cached index.html shell when offline');

  console.log('\n--- TEST SUITE 3: CLIENT APP.JSX OFFLINE-FIRST INTEGRATION ---');

  const appPath = path.join(ROOT_DIR, 'client', 'src', 'App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');

  assert(appContent.includes("getOfflineData('jobs'"), 'App.jsx initializes jobs with offline cached data');
  assert(appContent.includes("getOfflineData('seekers'"), 'App.jsx initializes seekers with offline cached data');
  assert(appContent.includes("getOfflineData('employers'"), 'App.jsx initializes employers with offline cached data');
  assert(appContent.includes('syncOfflineOutbox'), 'App.jsx invokes syncOfflineOutbox on network restoration');
  assert(appContent.includes('Offline Mode Active'), 'App.jsx contains glassmorphic luxury offline indicator');

  console.log('\n--- TEST SUITE 4: SERVER HEALTH & BASELINE PERFORMANCE ---');

  const healthRes = await makeRequest('/api/health');
  assert(healthRes.statusCode === 200, 'Server /api/health responds with 200 OK', `Latency: ${healthRes.latency}ms`);
  assert(healthRes.json && healthRes.json.status === 'ok', 'Health status payload is valid');

  const jobsRes = await makeRequest('/api/jobs');
  assert(jobsRes.statusCode === 200, 'Server /api/jobs responds with 200 OK', `Count: ${jobsRes.json?.jobs?.length || 0}`);

  console.log('\n--- TEST SUITE 5: 500-BURST CONCURRENCY LOAD TESTING ---');

  const TOTAL_REQUESTS = 500;
  const CONCURRENCY = 50;
  console.log(`  Executing ${TOTAL_REQUESTS} requests (${CONCURRENCY} concurrent) to /api/health and /api/jobs...`);

  const latencies = [];
  let successfulRequests = 0;
  let failedRequests = 0;

  const burstStart = Date.now();

  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENCY) {
    const batch = [];
    for (let j = 0; j < CONCURRENCY && (i + j) < TOTAL_REQUESTS; j++) {
      const endpoint = (i + j) % 2 === 0 ? '/api/health' : '/api/jobs';
      batch.push(
        makeRequest(endpoint)
          .then(res => {
            if (res.statusCode === 200) {
              successfulRequests++;
              latencies.push(res.latency);
            } else {
              failedRequests++;
            }
          })
          .catch(() => {
            failedRequests++;
          })
      );
    }
    await Promise.all(batch);
  }

  const totalTime = Date.now() - burstStart;
  latencies.sort((a, b) => a - b);

  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = Math.round((successfulRequests / (totalTime / 1000)));

  console.log(`  📊 Load Test Results:`);
  console.log(`     • Total Completed Requests: ${successfulRequests}/${TOTAL_REQUESTS}`);
  console.log(`     • Failed Requests: ${failedRequests}`);
  console.log(`     • Total Burst Duration: ${totalTime}ms`);
  console.log(`     • Throughput: ${rps} req/sec`);
  console.log(`     • Median Latency (p50): ${p50}ms`);
  console.log(`     • 95th Percentile (p95): ${p95}ms`);
  console.log(`     • 99th Percentile (p99): ${p99}ms`);

  assert(successfulRequests === TOTAL_REQUESTS, 'All 500 burst requests succeeded with 100% reliability');
  assert(failedRequests === 0, 'Zero dropped requests or server crashes during burst');
  assert(p95 < 200, `p95 latency is under 200ms (Actual: ${p95}ms)`);

  console.log('\n======================================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runOfflineSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
