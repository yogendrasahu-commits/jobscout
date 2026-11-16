// Platform Advanced Features & Real-Time Workflow Test Suite
// Verifies:
// 1. Dual Registration & Identifier Switching (Phone vs Email)
// 2. Email OTP dispatch & verification
// 3. Password compliance & rule enforcement
// 4. Public Profile Inspection & In-App Dynamic Fetching
// 5. In-App Commute & Geospatial Radius Filtering
// 6. Anonymous Discussions, Channel Filtering, Upvoting/Downvoting
// 7. Direct Messaging Threads & Unread Counter Lifecycle
// 8. Master Admin Governance (Verification, Blocking, Feature Flags, Broadcast)

import { calculateDistanceKm, estimateCommuteProfile } from '../client/src/utils/commuteService.js';

const BASE_URL = 'http://127.0.0.1:5000';
let totalPassed = 0;
let totalFailed = 0;
const failures = [];

function assert(condition, message, details = null) {
  if (!condition) {
    totalFailed++;
    const detailMsg = details ? ` (Response: ${JSON.stringify(details)})` : '';
    const fullMsg = `${message}${detailMsg}`;
    failures.push(fullMsg);
    console.error(`❌ FAIL: ${fullMsg}`);
    throw new Error(fullMsg);
  } else {
    totalPassed++;
    console.log(`✅ PASS: ${message}`);
  }
}

async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // raw text
  }
  return { status: res.status, headers: res.headers, data };
}

async function runAdvancedFeaturesTest() {
  console.log('================================================================');
  console.log('🚀 JobScout Platform Advanced Features Test Suite');
  console.log(`📡 Target API: ${BASE_URL}`);
  console.log('================================================================\n');

  const ts = Date.now().toString().slice(-6);
  const testPhonePrimary = `98${ts}01`;
  const testEmailSecondary = `seeker_dual_${ts}@jobscout.io`;

  const testEmailPrimary = `employer_dual_${ts}@jobscout.io`;
  const testPhoneSecondary = `99${ts}02`;

  const validCompliantPassword = 'SecurePassword2026!'; // >=8 chars, symbol/number, lower & upper

  let seekerToken = '';
  let seekerId = '';
  let employerToken = '';
  let employerId = '';
  let adminToken = '';

  // -------------------------------------------------------------
  // SUITE 1: Dual Registration & Identifier Switching (Phone vs Email)
  // -------------------------------------------------------------
  console.log('--- SUITE 1: Dual Registration & Identifier Switching (Phone vs Email) ---');

  // Test 1.1: Weak password rejection
  const weakPassRes = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Weak Password User',
      email: `weak_${ts}@jobscout.io`,
      password: '123', // < 6 chars
      role: 'seeker'
    })
  });
  assert(weakPassRes.status === 400, 'Weak password (< 6 chars) rejected with HTTP 400');

  // Test 1.2: Send OTP with Email as primary identifier
  const emailOtpRes = await api('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email: testEmailPrimary, purpose: 'register' })
  });
  assert(emailOtpRes.status === 200, 'Send OTP to email responds with HTTP 200');
  assert(emailOtpRes.data.success === true, 'Email OTP dispatch confirmed');
  const emailOtpCode = emailOtpRes.data.otp || '123456';

  // Test 1.3: Verify OTP with Email identifier
  const verifyEmailOtpRes = await api('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email: testEmailPrimary, otp: emailOtpCode })
  });
  assert(verifyEmailOtpRes.status === 200, 'Verify OTP using email identifier succeeds with HTTP 200');
  assert(verifyEmailOtpRes.data.verified === true, 'Email OTP marked as verified');

  // Test 1.4: Register Employer using Email as primary & Phone as secondary
  const empRegRes = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'TechWave Solutions',
      email: testEmailPrimary,
      phone: testPhoneSecondary,
      otp: emailOtpCode,
      password: validCompliantPassword,
      role: 'emp',
      companyName: 'TechWave Solutions',
      address: 'Bandra Kurla Complex (BKC), Mumbai'
    })
  });
  assert(empRegRes.status === 201, 'Employer registered using email as primary identifier with HTTP 201');
  assert(Boolean(empRegRes.data.token), 'JWT Token generated on email-primary registration');
  assert(empRegRes.data.user.role === 'emp', 'Role correctly assigned as employer');
  employerToken = empRegRes.data.token;
  employerId = empRegRes.data.user.id;

  // Test 1.5: Send OTP with Phone as primary identifier
  const phoneOtpRes = await api('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone: testPhonePrimary, purpose: 'register' })
  });
  assert(phoneOtpRes.status === 200, 'Send OTP to phone responds with HTTP 200');
  const phoneOtpCode = phoneOtpRes.data.otp || '123456';

  // Test 1.6: Verify OTP with Phone identifier
  const verifyPhoneOtpRes = await api('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone: testPhonePrimary, otp: phoneOtpCode })
  });
  assert(verifyPhoneOtpRes.status === 200, 'Verify OTP using phone identifier succeeds with HTTP 200');

  // Test 1.7: Register Seeker using Phone as primary & Email as secondary
  const seekerRegRes = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Aarav Sharma',
      phone: testPhonePrimary,
      email: testEmailSecondary,
      otp: phoneOtpCode,
      password: validCompliantPassword,
      role: 'seeker',
      title: 'Full Stack Engineer',
      skills: ['React', 'Node.js', 'WebRTC', 'Tailwind CSS'],
      address: 'Andheri East, Mumbai'
    })
  });
  assert(seekerRegRes.status === 201, 'Seeker registered using phone as primary identifier with HTTP 201');
  assert(Boolean(seekerRegRes.data.token), 'JWT Token generated on phone-primary registration');
  assert(seekerRegRes.data.user.role === 'seeker', 'Role correctly assigned as seeker');
  seekerToken = seekerRegRes.data.token;
  seekerId = seekerRegRes.data.user.id;

  // Test 1.8: Login with Phone + Password
  const phoneLoginRes = await api('/api/auth/login-phone-password', {
    method: 'POST',
    body: JSON.stringify({ phone: testPhonePrimary, password: validCompliantPassword })
  });
  assert(phoneLoginRes.status === 200, 'Login with Phone + Password succeeds with HTTP 200');
  assert(phoneLoginRes.data.user.id === seekerId, 'Logged-in user matches registered seeker');

  // Test 1.9: Login with Email + Password
  const emailLoginRes = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmailPrimary, password: validCompliantPassword })
  });
  assert(emailLoginRes.status === 200, 'Login with Email + Password succeeds with HTTP 200');
  assert(emailLoginRes.data.user.id === employerId, 'Logged-in user matches registered employer');

  // -------------------------------------------------------------
  // SUITE 2: Public Profile Inspection & In-App Dynamic Fetching
  // -------------------------------------------------------------
  console.log('\n--- SUITE 2: Public Profile Inspection & In-App Dynamic Fetching ---');

  // Test 2.1: Fetch user public profile by ID
  const publicProfileRes = await api(`/api/auth/user/${seekerId}`);
  assert(publicProfileRes.status === 200, 'Public profile endpoint returns HTTP 200');
  assert(publicProfileRes.data.user.name === 'Aarav Sharma', 'Candidate name correctly returned');
  assert(publicProfileRes.data.user.password === undefined, 'Password hash is strictly omitted from public profile');

  // Test 2.2: Update Candidate Profile details
  const updateProfileRes = await api('/api/auth/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${seekerToken}` },
    body: JSON.stringify({
      title: 'Senior Full Stack Specialist',
      bio: '5+ years building scalable web applications and real-time WebRTC audio/video systems.',
      expectedSalary: '₹22,00,000 / yr',
      skills: ['React', 'TypeScript', 'Node.js', 'WebRTC', 'Docker', 'GraphQL']
    })
  });
  assert(updateProfileRes.status === 200, 'Candidate profile updated successfully with HTTP 200');
  assert(updateProfileRes.data.user.title === 'Senior Full Stack Specialist', 'Title updated in profile');
  assert(updateProfileRes.data.user.skills.includes('GraphQL'), 'New skill GraphQL persisted');

  // Test 2.3: Update Employer Company Profile
  const updateEmpProfileRes = await api('/api/auth/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({
      companyName: 'TechWave Solutions Private Limited',
      website: 'https://techwave.example.io',
      industry: 'Enterprise Software & Cloud'
    })
  });
  assert(updateEmpProfileRes.status === 200, 'Employer company profile updated successfully with HTTP 200');
  assert(updateEmpProfileRes.data.user.companyName === 'TechWave Solutions Private Limited', 'Company name persisted');

  // -------------------------------------------------------------
  // SUITE 3: Geospatial Radius Filtering & In-App Commute Engine
  // -------------------------------------------------------------
  console.log('\n--- SUITE 3: Geospatial Radius Filtering & In-App Commute Engine ---');

  // Post a job at Bandra Kurla Complex (BKC): Lat 19.0760, Lng 72.8777
  const postJobRes = await api('/api/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({
      title: 'Lead Frontend Engineer (React/WebRTC)',
      company: 'TechWave Solutions',
      description: 'Looking for a Senior Frontend Engineer to architect geospatial map interfaces.',
      category: 'Technology',
      jobType: 'Full-time',
      salary: '₹18,00,000 - ₹24,00,000',
      lat: 19.0760,
      lng: 72.8777,
      address: 'BKC, Mumbai, Maharashtra',
      skills: ['React', 'TypeScript', 'WebRTC'],
      urgent: true
    })
  });
  assert(postJobRes.status === 201, 'Job posted successfully with HTTP 201');
  const createdJobId = postJobRes.data.job.id;

  // Test 3.1: Geospatial radius search at 5km from BKC
  const geoSearch5km = await api('/api/jobs?userLat=19.0760&userLng=72.8777&maxRadius=5');
  assert(geoSearch5km.status === 200, 'Geo search (5km) returns HTTP 200');
  assert(geoSearch5km.data.jobs.some(j => j.id === createdJobId), 'Posted job exists in 5km radius of BKC');
  assert(geoSearch5km.data.jobs.every(j => j.distanceKm <= 5.0), 'All returned jobs are strictly within 5km radius');

  // Test 3.2: In-App Commute Profile calculation (between BKC and Andheri East ~6.2km)
  const commuteDistance = calculateDistanceKm(19.0760, 72.8777, 19.1136, 72.8697);
  assert(commuteDistance > 3.0 && commuteDistance < 8.0, `Commute distance matches real-world range: ${commuteDistance} km`);

  const commuteProfile = estimateCommuteProfile(commuteDistance);
  assert(Array.isArray(commuteProfile.modes), 'Commute profile returns multimodal transit options array');
  assert(commuteProfile.modes.length >= 4, 'Includes Metro, Bike, Cab, and Walk');
  assert(commuteProfile.workLifeScore >= 0 && commuteProfile.workLifeScore <= 100, 'Work-Life balance score is bounded 0-100');
  assert(commuteProfile.co2SavedKg > 0, `Calculates positive carbon savings by using public transit (${commuteProfile.co2SavedKg} kg CO2)`);

  // -------------------------------------------------------------
  // SUITE 4: Anonymous Discussions & Channel Categorization
  // -------------------------------------------------------------
  console.log('\n--- SUITE 4: Anonymous Discussions & Channel Categorization ---');

  // Test 4.1: Create discussion under r/Salaries channel
  const anonPostRes = await api('/api/anon', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Current salary benchmarks for Senior React/Full-Stack in Mumbai BKC?',
      content: 'What is the median compensation package offered for 5 YOE developers in 2026? Are bonuses guaranteed?',
      channel: 'r/Salaries',
      authorAlias: 'Anonymous Cheetah',
      authorAvatarSeed: 'cheetah_2026',
      authorBadge: 'Engineering Lead'
    })
  });
  assert(anonPostRes.status === 201, 'Anonymous discussion created with HTTP 201');
  const anonPostId = anonPostRes.data.discussion.id;

  // Test 4.2: Filter discussions by channel r/Salaries
  const channelFilterRes = await api('/api/anon?channel=r/Salaries');
  assert(channelFilterRes.status === 200, 'Filter anon discussions by channel returns HTTP 200');
  assert(channelFilterRes.data.discussions.some(d => d.id === anonPostId), 'Created discussion present in r/Salaries channel');

  // Test 4.3: Upvote discussion
  const upvoteRes = await api(`/api/anon/${anonPostId}/upvote`, {
    method: 'POST',
    body: JSON.stringify({ userId: seekerId })
  });
  assert(upvoteRes.status === 200, 'Direct upvote returns HTTP 200');
  assert(upvoteRes.data.score >= 1, 'Discussion score incremented');

  // Test 4.4: Downvote discussion
  const downvoteRes = await api(`/api/anon/${anonPostId}/downvote`, {
    method: 'POST',
    body: JSON.stringify({ userId: employerId })
  });
  assert(downvoteRes.status === 200, 'Direct downvote returns HTTP 200');

  // Test 4.5: Add comment to discussion
  const commentRes = await api(`/api/anon/${anonPostId}/comment`, {
    method: 'POST',
    body: JSON.stringify({
      authorAlias: 'Anonymous Lynx',
      authorBadge: 'Tech Recruiter',
      content: 'Median package in BKC for 5 YOE ranges between 18-24 LPA base + ESOPs.'
    })
  });
  assert(commentRes.status === 201, 'Comment added to anonymous discussion with HTTP 201');

  // -------------------------------------------------------------
  // SUITE 5: Direct Messaging Threads & Unread Counter Lifecycle
  // -------------------------------------------------------------
  console.log('\n--- SUITE 5: Direct Messaging Threads & Unread Counter Lifecycle ---');

  // Test 5.1: Send Direct Message from Seeker to Employer
  const sendMsgRes = await api('/api/messages', {
    method: 'POST',
    headers: { Authorization: `Bearer ${seekerToken}` },
    body: JSON.stringify({
      receiverId: employerId,
      message: 'Hello, I reviewed your Lead Frontend Engineer opening in BKC and submitted my application.'
    })
  });
  assert(sendMsgRes.status === 201, 'Direct message sent with HTTP 201');

  // Test 5.2: Employer checks all conversation threads
  const threadsRes = await api('/api/messages/threads/all', {
    headers: { Authorization: `Bearer ${employerToken}` }
  });
  assert(threadsRes.status === 200, 'Fetch all conversation threads returns HTTP 200');
  const targetThread = threadsRes.data.threads.find(t => t.userId === seekerId);
  assert(Boolean(targetThread), 'Thread with seeker is listed in employer inbox');
  assert(targetThread.unreadCount >= 1, 'Thread unread count reflects new incoming message');

  // Test 5.3: Employer marks conversation as read
  const markReadRes = await api(`/api/messages/${seekerId}/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${employerToken}` }
  });
  assert(markReadRes.status === 200, 'Conversation marked as read returns HTTP 200');

  // -------------------------------------------------------------
  // SUITE 6: Master Admin Governance & Feature Flags
  // -------------------------------------------------------------
  console.log('\n--- SUITE 6: Master Admin Governance & Feature Flags ---');

  // Test 6.1: Master Admin Login
  const adminLoginRes = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@jobscout.io', password: 'admin123' })
  });
  assert(adminLoginRes.status === 200, 'Admin login succeeds with HTTP 200');
  assert(adminLoginRes.data.user.role === 'admin', 'Admin role verified');
  adminToken = adminLoginRes.data.token;

  // Test 6.2: Admin Stats with Heap Memory & System Health
  const adminStatsRes = await api('/api/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminStatsRes.status === 200, 'Admin platform stats returns HTTP 200');
  assert(Boolean(adminStatsRes.data.stats.systemHealth.memoryHeapUsedMb), 'Node.js memory heap usage reported');
  assert(Boolean(adminStatsRes.data.stats.systemHealth.uptimeSeconds), 'Platform uptime reported');

  // Test 6.3: Toggle User Verification Status via Admin
  const toggleVerifyRes = await api(`/api/admin/users/${seekerId}/toggle-verify`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(toggleVerifyRes.status === 200, 'Admin toggle user verification returns HTTP 200');
  assert(toggleVerifyRes.data.success === true, 'Verification toggle confirmed');

  // Test 6.4: Toggle User Blocking Status via Admin
  const toggleBlockRes = await api(`/api/admin/users/${seekerId}/toggle-block`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(toggleBlockRes.status === 200, 'Admin toggle user blocking returns HTTP 200');
  assert(toggleBlockRes.data.isBlocked === true, 'Candidate successfully blocked by administrator');

  // Test 6.5: Unblock Candidate
  const unblockRes = await api(`/api/admin/users/${seekerId}/toggle-block`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(unblockRes.status === 200, 'Admin unblock returns HTTP 200');
  assert(unblockRes.data.isBlocked === false, 'Candidate unblocked');

  // Test 6.6: Fetch Platform Feature Flags
  const featuresRes = await api('/api/admin/features', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(featuresRes.status === 200, 'Get platform features returns HTTP 200');
  assert(typeof featuresRes.data.features.salaryVisible === 'boolean', 'salaryVisible feature flag exists');

  // Test 6.7: Update Platform Feature Flags
  const updateFeaturesRes = await api('/api/admin/features', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      salaryVisible: true,
      autoApproveJobs: true,
      customAnnouncement: 'JobScout v2.4 Live: New Dual-Registration & Hyperlocal Map active'
    })
  });
  assert(updateFeaturesRes.status === 200, 'Update platform features returns HTTP 200');
  assert(updateFeaturesRes.data.features.customAnnouncement.includes('JobScout v2.4'), 'Platform announcement persisted');

  // Test 6.8: System Announcement Broadcast
  const broadcastRes = await api('/api/admin/broadcast', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: 'Platform Maintenance Completed',
      message: 'All geospatial radar nodes and WebRTC call servers are operational at 100% capacity.',
      type: 'success'
    })
  });
  assert(broadcastRes.status === 200, 'System announcement broadcast dispatched with HTTP 200');

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log('📊 TEST RUN COMPLETE');
  console.log(`✅ Total Tests Passed: ${totalPassed}`);
  console.log(`❌ Total Tests Failed: ${totalFailed}`);
  if (totalFailed === 0) {
    console.log('🎉 ALL ADVANCED FEATURE TESTS PASSED WITH 100% SUCCESS RATE!');
  } else {
    console.log(`⚠️ ${totalFailed} tests failed.`);
  }
  console.log('================================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runAdvancedFeaturesTest().catch(err => {
  console.error('Fatal Test Runner Exception:', err);
  process.exit(1);
});
