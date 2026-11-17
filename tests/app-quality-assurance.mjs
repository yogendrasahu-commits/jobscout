import assert from 'assert';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:5000';
const CLIENT_PORT = 5173;
const CLIENT_URL = `http://127.0.0.1:${CLIENT_PORT}`;

console.log('================================================================');
console.log('📱 Starting JobScout Full-Platform App & Mobile PWA Testing');
console.log(`📡 Backend Target: ${BASE_URL}`);
console.log(`💻 Client Target:  ${CLIENT_URL}`);
console.log('================================================================\n');

let passed = 0;
let failed = 0;
const failures = [];

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
    failures.push({ name, error: err.message });
  }
}

async function runAllAppTests() {
  const runId = Date.now().toString().slice(-6);

  // ==========================================================================
  // SECTION 1: Backend Health, Security & JSON Content-Type Integrity
  // ==========================================================================
  console.log('--- 1. API Health & JSON Response Integrity ---');

  await test('Server health endpoint returns HTTP 200 with JSON', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type')?.includes('application/json'));
    const body = await res.json();
    assert.strictEqual(body.status, 'ok');
    assert.ok(typeof body.uptime === 'number');
  });

  await test('404 non-existent route returns JSON envelope (Never raw HTML error)', async () => {
    const res = await fetch(`${BASE_URL}/api/nonexistent-route-for-testing-${runId}`);
    assert.strictEqual(res.status, 404);
    assert.ok(res.headers.get('content-type')?.includes('application/json'));
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.error?.message?.includes('not found') || body.error?.code === 'NOT_FOUND');
  });

  await test('Swagger API documentation endpoint /api-docs returns HTTP 200', async () => {
    const res = await fetch(`${BASE_URL}/api-docs/`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-type')?.includes('text/html'));
  });

  await test('App metadata endpoint /api/app-info returns valid APK metadata', async () => {
    const res = await fetch(`${BASE_URL}/api/app-info`);
    assert.strictEqual(res.status, 200);
    const info = await res.json();
    assert.strictEqual(info.appName, 'JobScout');
    assert.ok(info.apkUrl);
  });

  // ==========================================================================
  // SECTION 2: Mobile APK & PWA Asset Integrity
  // ==========================================================================
  console.log('\n--- 2. Mobile APK & PWA Web Assets ---');

  await test('Manifest JSON is valid with standalone display mode', async () => {
    const manifestPath = path.resolve('client/public/manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.strictEqual(manifest.short_name, 'JobScout');
    assert.strictEqual(manifest.display, 'standalone');
    assert.strictEqual(manifest.theme_color, '#4f46e5');
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 3);
  });

  await test('All PWA app icons exist and are accessible', async () => {
    const icon192 = path.resolve('client/public/icons/icon-192x192.png');
    const icon512 = path.resolve('client/public/icons/icon-512x512.png');
    const iconMaskable = path.resolve('client/public/icons/icon-maskable-512x512.png');
    assert.ok(fs.existsSync(icon192), '192x192 icon must exist');
    assert.ok(fs.existsSync(icon512), '512x512 icon must exist');
    assert.ok(fs.existsSync(iconMaskable), 'maskable icon must exist');
    assert.ok(fs.statSync(icon192).size > 10000, 'Icon file size must be valid image');
  });

  await test('Mobile APK binary is present and >= 7 MB', async () => {
    const apkPath = path.resolve('client/public/downloads/jobscout-mobile.apk');
    assert.ok(fs.existsSync(apkPath), 'jobscout-mobile.apk must exist');
    const stat = fs.statSync(apkPath);
    assert.ok(stat.size > 7 * 1024 * 1024, `APK size must be genuine binary compiled (>7MB), got: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  });

  await test('Mobile APK direct download endpoint returns HTTP 200 with attachment header', async () => {
    const res = await fetch(`${BASE_URL}/download/jobscout-mobile.apk`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-disposition')?.includes('attachment'));
    assert.ok(res.headers.get('content-type')?.includes('application/vnd.android.package-archive'));
  });

  await test('Android Studio project ZIP is present and >= 20 MB', async () => {
    const zipPath = path.resolve('client/public/downloads/jobscout-android-project.zip');
    assert.ok(fs.existsSync(zipPath), 'jobscout-android-project.zip must exist');
    const stat = fs.statSync(zipPath);
    assert.ok(stat.size > 20 * 1024 * 1024, `ZIP size must contain full native project (>20MB), got: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  });

  await test('Android Studio ZIP download endpoint returns HTTP 200 with zip content-type', async () => {
    const res = await fetch(`${BASE_URL}/download/jobscout-android-project.zip`);
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get('content-disposition')?.includes('attachment'));
    assert.ok(res.headers.get('content-type')?.includes('application/zip'));
  });

  // ==========================================================================
  // SECTION 3: Frontend PWA UI & Layout Layout Alignment Checks
  // ==========================================================================
  console.log('\n--- 3. PWA Standalone UI & Safe Area Compliance ---');

  await test('client/index.html includes viewport-fit=cover for notch handling', async () => {
    const html = fs.readFileSync('client/index.html', 'utf8');
    assert.ok(html.includes('viewport-fit=cover'), 'HTML meta must have viewport-fit=cover');
    assert.ok(html.includes('apple-mobile-web-app-capable'), 'apple-mobile-web-app-capable must be set');
  });

  await test('client/src/index.css includes display-mode: standalone media queries', async () => {
    const css = fs.readFileSync('client/src/index.css', 'utf8');
    assert.ok(css.includes('@media all and (display-mode: standalone)'), 'standalone media query must be present');
    assert.ok(css.includes('safe-area-inset-top'), 'safe-area-inset-top rule must be defined');
    assert.ok(css.includes('safe-area-inset-bottom'), 'safe-area-inset-bottom rule must be defined');
  });

  await test('MobileBottomNav.jsx uses exact 5-column balanced grid with centered map button', async () => {
    const navCode = fs.readFileSync('client/src/components/MobileBottomNav.jsx', 'utf8');
    assert.ok(navCode.includes('grid grid-cols-5'), 'Bottom nav must use balanced 5-column grid');
    assert.ok(!navCode.includes('grid-cols-6'), 'Must not have skewed 6-column grid');
    assert.ok(navCode.includes('safe-area-inset-bottom'), 'Must account for bottom gesture bar safe area');
  });

  await test('Navbar.jsx header and drawer include safe-area-inset-top padding', async () => {
    const navCode = fs.readFileSync('client/src/components/Navbar.jsx', 'utf8');
    assert.ok(navCode.includes('pt-[env(safe-area-inset-top,0px)]'), 'Header must have top safe area padding');
    assert.ok(navCode.includes('safe-area-inset-top'), 'Drawer panel must have top safe area padding');
  });

  await test('client/src/main.jsx has bulletproof Response.json shield', async () => {
    const mainCode = fs.readFileSync('client/src/main.jsx', 'utf8');
    assert.ok(mainCode.includes('Response.prototype.json'), 'Must have Response.json prototype shield');
    assert.ok(mainCode.includes('isHtmlResponse'), 'Must guard against HTML text responses');
  });

  // ==========================================================================
  // SECTION 4: Full User Lifecycle (Seeker, Employer, Admin)
  // ==========================================================================
  console.log('\n--- 4. Full User Journeys (Seeker, Employer & ATS) ---');

  const seekerPhone = `98${runId}12`;
  const employerPhone = `97${runId}34`;
  let seekerToken = '';
  let seekerId = '';
  let employerToken = '';
  let employerId = '';
  let createdJobId = '';
  let createdAppId = '';

  await test('Seeker registers with mobile OTP and receives valid JWT token', async () => {
    const regRes = await fetch(`${BASE_URL}/api/auth/register-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: seekerPhone,
        otp: '123456',
        password: 'Password@123',
        name: `Test Seeker ${runId}`,
        role: 'seeker'
      })
    });
    assert.strictEqual(regRes.status, 201);
    const data = await regRes.json();
    assert.ok(data.token, 'Must return JWT token');
    assert.strictEqual(data.user.role, 'seeker');
    seekerToken = data.token;
    seekerId = data.user.id;
  });

  await test('Seeker updates profile via PUT /api/auth/profile/:id (verified route alias)', async () => {
    const profRes = await fetch(`${BASE_URL}/api/auth/profile/${seekerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seekerToken}`
      },
      body: JSON.stringify({
        title: 'Fullstack React Native Developer',
        bio: 'Passionate mobile and web architect with 4 years experience.',
        skills: ['React', 'Node.js', 'Capacitor', 'WebRTC', 'TailwindCSS'],
        experience: '4 years',
        expectedSalary: '₹18,00,000/yr',
        address: 'Bandra Kurla Complex, Mumbai, Maharashtra',
        availability: 'Immediate'
      })
    });
    assert.strictEqual(profRes.status, 200);
    const data = await profRes.json();
    assert.strictEqual(data.user.title, 'Fullstack React Native Developer');
    assert.strictEqual(data.user.isProfileComplete, true);
  });

  await test('Employer registers and updates company profile', async () => {
    const regRes = await fetch(`${BASE_URL}/api/auth/register-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: employerPhone,
        otp: '123456',
        password: 'Password@123',
        name: `HR Lead ${runId}`,
        role: 'emp',
        companyName: `FinTech Solutions ${runId}`
      })
    });
    assert.strictEqual(regRes.status, 201);
    const data = await regRes.json();
    employerToken = data.token;
    employerId = data.user.id;
    assert.strictEqual(data.user.role, 'emp');
  });

  await test('Employer posts a new job opportunity with GPS coordinates', async () => {
    const jobRes = await fetch(`${BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employerToken}`
      },
      body: JSON.stringify({
        title: `Senior Mobile Engineer ${runId}`,
        company: `FinTech Solutions ${runId}`,
        location: 'BKC, Mumbai',
        lat: 19.0657,
        lng: 72.8687,
        salary: '₹22 - 30 LPA',
        salaryMin: 2200000,
        salaryMax: 3000000,
        type: 'Full-time',
        category: 'Engineering',
        description: 'Lead mobile development using React, Capacitor and Socket.IO real-time microservices.',
        skills: ['React', 'Node.js', 'WebRTC', 'Capacitor']
      })
    });
    assert.strictEqual(jobRes.status, 201);
    const data = await jobRes.json();
    assert.ok(data.job?.id);
    createdJobId = data.job.id;
  });

  await test('Seeker applies to the job with cover letter and experience', async () => {
    const appRes = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seekerToken}`
      },
      body: JSON.stringify({
        jobId: createdJobId,
        coverLetter: 'I have extensive experience building scalable mobile and PWA platforms.',
        experience: '4 years',
        expectedSalary: '25 LPA'
      })
    });
    assert.strictEqual(appRes.status, 201);
    const data = await appRes.json();
    assert.strictEqual(data.application?.status, 'pending');
    createdAppId = data.application.id;
  });

  await test('Employer views candidate in ATS pipeline and advances status to interview', async () => {
    const listRes = await fetch(`${BASE_URL}/api/applications/employer`, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    const found = listData.applications?.find(a => a.id === createdAppId);
    assert.ok(found, 'Application must be present in employer pipeline');

    const updateRes = await fetch(`${BASE_URL}/api/applications/${createdAppId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employerToken}`
      },
      body: JSON.stringify({ status: 'interview' })
    });
    assert.strictEqual(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.strictEqual(updateData.application?.status, 'interview');
  });

  await test('Employer issues official stamped offer letter', async () => {
    const offerRes = await fetch(`${BASE_URL}/api/applications/${createdAppId}/offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employerToken}`
      },
      body: JSON.stringify({
        offeredSalary: '₹26,00,000 Per Annum',
        joiningDate: '2026-12-01',
        offerLetterNotes: 'Welcome to the core engineering team!'
      })
    });
    assert.strictEqual(offerRes.status, 200);
    const offerData = await offerRes.json();
    assert.strictEqual(offerData.application?.status, 'offered');
    assert.ok(offerData.application?.offerLetter?.refNo || offerData.application?.offerLetter?.letterNumber);
  });

  await test('Seeker accepts the offer letter -> Status transitions to "hired"', async () => {
    const acceptRes = await fetch(`${BASE_URL}/api/applications/${createdAppId}/accept-offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${seekerToken}`
      }
    });
    assert.strictEqual(acceptRes.status, 200);
    const acceptData = await acceptRes.json();
    assert.strictEqual(acceptData.application?.status, 'hired');
  });

  // ==========================================================================
  // SECTION 5: Messaging & Real-Time Communications
  // ==========================================================================
  console.log('\n--- 5. In-App Direct Messaging & Chat History ---');

  await test('Employer sends in-app chat message to Seeker', async () => {
    const msgRes = await fetch(`${BASE_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employerToken}`
      },
      body: JSON.stringify({
        receiverId: seekerId,
        content: `Hi Seeker, thrilled to have you join our team!`
      })
    });
    assert.strictEqual(msgRes.status, 201);
    const msgData = await msgRes.json();
    assert.strictEqual(msgData.message?.receiverId, seekerId);
  });

  await test('Seeker fetches chat threads and sees unread message', async () => {
    const threadsRes = await fetch(`${BASE_URL}/api/messages/threads/all`, {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert.strictEqual(threadsRes.status, 200);
    const threadsData = await threadsRes.json();
    const thread = threadsData.threads?.find(t => (t.user?.id === employerId || t.userId === employerId));
    assert.ok(thread, 'Thread with employer must exist');
    assert.ok(thread.unreadCount >= 1, 'Unread count should be at least 1');
  });

  await test('Seeker marks conversation as read -> unread count resets to 0', async () => {
    const readRes = await fetch(`${BASE_URL}/api/messages/${employerId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert.strictEqual(readRes.status, 200);

    const recheckRes = await fetch(`${BASE_URL}/api/messages/threads/all`, {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    const recheckData = await recheckRes.json();
    const thread = recheckData.threads?.find(t => (t.user?.id === employerId || t.userId === employerId));
    assert.strictEqual(thread.unreadCount, 0, 'Unread count must be 0 after marking read');
  });

  // ==========================================================================
  // SECTION 6: Admin Master Console & Governance
  // ==========================================================================
  console.log('\n--- 6. Master Administrator Console ---');

  let adminToken = '';

  await test('Super Administrator logs in with verified credentials', async () => {
    const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@jobscout.io',
        password: 'admin123'
      })
    });
    assert.strictEqual(adminRes.status, 200);
    const data = await adminRes.json();
    assert.strictEqual(data.user.role, 'admin');
    adminToken = data.token;
  });

  await test('Admin retrieves real-time platform system metrics', async () => {
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(statsRes.status, 200);
    const data = await statsRes.json();
    assert.strictEqual(data.success, true);
    assert.ok(typeof data.stats?.totalUsers === 'number');
    assert.ok(typeof data.stats?.totalJobs === 'number');
    assert.ok(typeof data.stats?.systemHealth?.memoryHeapUsedMb === 'number');
  });

  await test('Admin toggles verification badge on seeker account', async () => {
    const verifyRes = await fetch(`${BASE_URL}/api/admin/users/${seekerId}/toggle-verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(verifyRes.status, 200);
    const data = await verifyRes.json();
    assert.strictEqual(data.isVerified, true);
  });

  // ==========================================================================
  // Summary
  // ==========================================================================
  console.log('\n================================================================');
  console.log(`📊 APP QUALITY ASSURANCE RUN COMPLETE`);
  console.log(`✅ Total Tests Passed: ${passed}`);
  console.log(`❌ Total Tests Failed: ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error('Failure Details:');
    failures.forEach((f, idx) => {
      console.error(`  ${idx + 1}. [${f.name}]: ${f.error}`);
    });
    process.exit(1);
  }
}

runAllAppTests().catch((err) => {
  console.error('Fatal Test Harness Error:', err);
  process.exit(1);
});
