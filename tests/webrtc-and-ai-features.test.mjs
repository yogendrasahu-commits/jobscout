import { io } from 'socket.io-client';

const BASE_URL = 'http://127.0.0.1:5000';
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failCount++;
  }
}

async function runTests() {
  console.log('======================================================');
  console.log('🧪 Starting WebRTC, AI Resume & Incoming Ringing Tests');
  console.log('======================================================\n');

  // TEST 1: AI Resume Parser with Text Body
  console.log('--- TEST 1: AI Resume Parser with Raw Text Body ---');
  try {
    const resumeText = `
      Priya Nair
      Senior WebRTC & Full Stack Engineer with 6 years experience.
      Email: priya.nair@techdev.io | Phone: +91 9988776655
      Core Stack: React, Node.js, WebRTC, TypeScript, Docker, Tailwind CSS, Redis, GraphQL.
      Expected CTC: ₹28,00,000 / year.
      Experienced in scaling P2P signaling clusters and building enterprise collaborative suites.
    `;

    const res = await fetch(`${BASE_URL}/api/ai/parse-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: resumeText })
    });

    assert(res.status === 200, 'AI Parse Resume responds with HTTP 200');
    const data = await res.json();
    assert(data.success === true, 'Response marked success');
    assert(data.data.skills.includes('React'), 'Detects React skill');
    assert(data.data.skills.includes('WebRTC'), 'Detects WebRTC skill');
    assert(data.data.skills.includes('Docker'), 'Detects Docker skill');
    assert(data.data.experience.includes('Mid-Senior') || data.data.experience.includes('Senior'), 'Experience level estimated accurately');
    assert(data.data.score >= 80, `AI profile match score is high (${data.data.score}%)`);
    assert(Array.isArray(data.data.strengths) && data.data.strengths.length > 0, 'Generates candidate strengths');
  } catch (err) {
    console.error('Error in TEST 1:', err);
    failCount++;
  }

  // TEST 2: AI Job Match Advice Endpoint
  console.log('\n--- TEST 2: AI Job Match Advice & Gap Analysis ---');
  try {
    const candidateSkills = ['React', 'JavaScript', 'CSS'];
    const jobSkills = ['React', 'TypeScript', 'Node.js', 'Docker', 'AWS'];

    const res = await fetch(`${BASE_URL}/api/ai/job-match-advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateSkills,
        jobSkills,
        jobTitle: 'Senior Full Stack Cloud Architect'
      })
    });

    assert(res.status === 200, 'AI Match Advice responds with HTTP 200');
    const data = await res.json();
    assert(data.success === true, 'Advice generated successfully');
    assert(data.data.matchedSkills.includes('React'), 'Matched skills identified');
    assert(data.data.missingSkills.includes('Docker'), 'Missing skills identified (Docker)');
    assert(data.data.missingSkills.includes('AWS'), 'Missing skills identified (AWS)');
    assert(Array.isArray(data.data.advice) && data.data.advice.length > 0, 'Actionable prep advice returned');
  } catch (err) {
    console.error('Error in TEST 2:', err);
    failCount++;
  }

  // TEST 3: WebSockets call:code_update bidirectional relay
  console.log('\n--- TEST 3: WebRTC In-Call Collaborative Code Sync Relay ---');
  try {
    const socketA = io(BASE_URL, { transports: ['websocket'] });
    const socketB = io(BASE_URL, { transports: ['websocket'] });

    await new Promise((resolve) => {
      let connected = 0;
      const onConn = () => {
        connected++;
        if (connected === 2) resolve();
      };
      socketA.on('connect', onConn);
      socketB.on('connect', onConn);
    });

    assert(socketA.connected && socketB.connected, 'Both interview peers connected to signaling server');

    const codePayload = {
      to: socketB.id,
      code: 'function twoSum(nums, target) { return [0, 1]; }',
      language: 'javascript',
      activeTab: 'challenge'
    };

    const receivedCodePromise = new Promise((resolve) => {
      socketB.on('call:code_update', (data) => {
        resolve(data);
      });
    });

    socketA.emit('call:code_update', codePayload);
    const received = await Promise.race([
      receivedCodePromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for code update')), 3000))
    ]);

    assert(received.code === codePayload.code, 'Bi-directional live code update received intact');
    assert(received.language === 'javascript', 'Language mode synced across peers');

    socketA.disconnect();
    socketB.disconnect();
    assert(!socketA.connected && !socketB.connected, 'Clean signaling tear-down');
  } catch (err) {
    console.error('Error in TEST 3:', err);
    failCount++;
  }

  console.log('\n======================================================');
  console.log(`📊 TESTS COMPLETE: ${passCount} Passed, ${failCount} Failed`);
  console.log('======================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
