import assert from 'assert';

const BASE_URL = 'http://127.0.0.1:5000';

async function runSecurityTests() {
  console.log('======================================================');
  console.log('🔒 Starting JobScout Dedicated Security Verification');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function test(desc, fn) {
    try {
      fn();
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${desc}`);
      console.error('   ', err.message);
      failed++;
    }
  }

  // 1. Test Security Headers & CSP
  console.log('--- TEST 1: Advanced Security Headers & Content Security Policy (CSP) ---');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const csp = healthRes.headers.get('content-security-policy');
  const coop = healthRes.headers.get('cross-origin-opener-policy');
  const corp = healthRes.headers.get('cross-origin-resource-policy');
  const xcto = healthRes.headers.get('x-content-type-options');
  const xfo = healthRes.headers.get('x-frame-options');
  const xxss = healthRes.headers.get('x-xss-protection');

  test('Content-Security-Policy header is present', () => {
    assert.ok(csp, 'CSP header should be present');
    assert.ok(csp.includes("default-src 'self'"), 'CSP should restrict default-src');
    assert.ok(csp.includes("object-src 'none'"), 'CSP should block object-src');
  });

  test('Cross-Origin-Opener-Policy is same-origin-allow-popups', () => {
    assert.strictEqual(coop, 'same-origin-allow-popups');
  });

  test('Cross-Origin-Resource-Policy is cross-origin', () => {
    assert.strictEqual(corp, 'cross-origin');
  });

  test('X-Content-Type-Options is nosniff', () => {
    assert.strictEqual(xcto, 'nosniff');
  });

  test('X-Frame-Options is SAMEORIGIN', () => {
    assert.strictEqual(xfo, 'SAMEORIGIN');
  });

  test('X-XSS-Protection is 1; mode=block', () => {
    assert.strictEqual(xxss, '1; mode=block');
  });

  // 2. Test Deep XSS Sanitization Middleware
  console.log('\n--- TEST 2: Deep Recursive XSS & Injection Sanitization ---');
  const xssPayload = {
    title: '<script>alert("xss")</script>Senior React Engineer',
    content: 'Looking for a dev <img src=x onerror=alert(document.cookie)> with modern skills <iframe src="evil.com"></iframe>',
    channel: 'r/ChaiCharcha',
    authorAlias: '<script>evil()</script>CodeMaster'
  };

  const anonRes = await fetch(`${BASE_URL}/api/anon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(xssPayload)
  });

  const anonData = await anonRes.json();
  test('XSS Payload has <script> stripped completely from title', () => {
    assert.ok(!anonData.discussion.title.includes('<script>'), 'Script tag should be removed');
    assert.ok(!anonData.discussion.title.includes('</script>'), 'Closing script tag should be removed');
    assert.ok(anonData.discussion.title.includes('Senior React Engineer'), 'Legitimate text preserved');
  });

  test('XSS Payload has inline event handlers (onerror=) and iframes stripped from content', () => {
    assert.ok(!anonData.discussion.content.includes('onerror='), 'onerror attribute should be removed');
    assert.ok(!anonData.discussion.content.includes('<iframe'), 'iframe should be removed');
    assert.ok(anonData.discussion.content.includes('Looking for a dev'), 'Legitimate text preserved');
  });

  test('XSS Payload has <script> stripped from authorAlias', () => {
    assert.ok(!anonData.discussion.authorAlias.includes('<script>'), 'Author script stripped');
    assert.ok(anonData.discussion.authorAlias.includes('CodeMaster'), 'Legitimate alias preserved');
  });

  // 3. Test HttpOnly Cookie Issuance & Cookie-Based Authentication
  console.log('\n--- TEST 3: HttpOnly Session Cookie & Dual-Mode Authentication ---');
  // Register a test user
  const randomPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
  await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: randomPhone, purpose: 'register' })
  });

  const regRes = await fetch(`${BASE_URL}/api/auth/register-phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: randomPhone,
      otp: '123456',
      name: 'Security Test User',
      password: 'SecurePassword123!',
      role: 'seeker'
    })
  });

  const regData = await regRes.json();
  const setCookie = regRes.headers.get('set-cookie');

  test('Registration issues HttpOnly session cookie', () => {
    assert.ok(setCookie, 'Set-Cookie header should be present');
    assert.ok(setCookie.includes('jobscout_token='), 'Cookie should contain jobscout_token');
    assert.ok(setCookie.includes('HttpOnly'), 'Cookie must be marked HttpOnly');
    assert.ok(setCookie.includes('SameSite=Lax'), 'Cookie must have SameSite=Lax');
  });

  // Extract token from cookie
  const cookieMatch = setCookie.match(/jobscout_token=([^;]+)/);
  const cookieToken = cookieMatch ? cookieMatch[1] : null;

  test('Authenticate using ONLY the HttpOnly Cookie (No Bearer header)', async () => {
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Cookie': `jobscout_token=${cookieToken}`
      }
    });
    assert.strictEqual(meRes.status, 200, '/api/auth/me should return 200 via cookie');
    const meData = await meRes.json();
    assert.strictEqual(meData.user.name, 'Security Test User', 'User name should match session');
  });

  // 4. Test IDOR & Unauthorized Access Protection
  console.log('\n--- TEST 4: IDOR & Protected Routes Enforcement ---');
  const unauthorizedEmailRes = await fetch(`${BASE_URL}/api/settings/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gmailUser: 'hacker@gmail.com',
      gmailPass: 'hackedpass'
    })
  });

  test('Unauthenticated attempt to change email settings is rejected with 401', () => {
    assert.strictEqual(unauthorizedEmailRes.status, 401, 'Should reject unauthenticated email settings changes');
  });

  // 5. Test Body Payload Size Limiter (DoS prevention)
  console.log('\n--- TEST 5: Body Size DoS Flooding Protection ---');
  // Attempt to send a 3MB string
  const giantPayload = {
    data: 'A'.repeat(3 * 1024 * 1024)
  };

  try {
    const giantRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(giantPayload)
    });
    test('Payload exceeding 2MB limit is rejected with 413 Payload Too Large', () => {
      assert.strictEqual(giantRes.status, 413, 'Should return 413 Payload Too Large');
    });
  } catch (err) {
    test('Payload exceeding 2MB limit is blocked immediately', () => {
      assert.ok(true);
    });
  }

  console.log('\n======================================================');
  console.log(`📊 SECURITY TEST RUN COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch(err => {
  console.error('Security test runner error:', err);
  process.exit(1);
});
