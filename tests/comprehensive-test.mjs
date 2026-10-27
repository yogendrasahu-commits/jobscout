// Automated Comprehensive Testing Suite for JobScout Platform
// Tests all API endpoints, auth flows, ATS pipeline, WebSocket events, and edge cases.

import { io } from 'socket.io-client';

const BASE_URL = 'http://127.0.0.1:5000';
let totalPassed = 0;
let totalFailed = 0;
const failures = [];

function assert(condition, message) {
  if (!condition) {
    totalFailed++;
    failures.push(message);
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
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
    // text response
  }
  return { status: res.status, headers: res.headers, data };
}

async function runTestSuite() {
  console.log('======================================================');
  console.log('🚀 Starting JobScout Automated Full-Platform Testing');
  console.log(`📡 Target Backend: ${BASE_URL}`);
  console.log('======================================================\n');

  const timestamp = Date.now().toString().slice(-6);
  const testSeekerPhone = `98${timestamp}11`;
  const testEmployerPhone = `99${timestamp}22`;
  let seekerToken = '';
  let seekerUser = null;
  let employerToken = '';
  let employerUser = null;
  let createdJobId = null;
  let createdApplicationId = null;
  let createdPostId = null;
  let createdAnonId = null;

  // ----------------------------------------------------
  // SUITE 1: System Health & Security Headers
  // ----------------------------------------------------
  console.log('\n--- SUITE 1: System Health & Security Headers ---');
  try {
    const health = await api('/api/health');
    assert(health.status === 200, 'Health endpoint responds with HTTP 200');
    assert(health.data.status === 'ok', 'Health status is "ok"');
    assert(health.headers.get('x-content-type-options') === 'nosniff', 'Security header: X-Content-Type-Options is nosniff');
    assert(health.headers.get('x-frame-options') === 'SAMEORIGIN', 'Security header: X-Frame-Options is SAMEORIGIN');
    assert(health.headers.get('x-xss-protection') === '1; mode=block', 'Security header: X-XSS-Protection enabled');
    assert(health.headers.get('permissions-policy')?.includes('camera=*'), 'Permissions-Policy permits WebRTC camera');
    assert(health.headers.get('ratelimit-limit') !== null, 'Sliding Window Rate Limiter headers present');
  } catch (err) {
    console.error('Suite 1 halted:', err.message);
  }

  // ----------------------------------------------------
  // SUITE 2: Phone Check & OTP Registration
  // ----------------------------------------------------
  console.log('\n--- SUITE 2: Phone Check & OTP Registration ---');
  try {
    // 2.1 Check unregistered phone
    const check1 = await api(`/api/auth/check-phone/${testSeekerPhone}`);
    assert(check1.status === 200, 'Check unregistered phone returns 200');
    assert(check1.data.exists === false, 'Phone correctly reported as not registered');

    // 2.2 Send OTP
    const otpRes = await api('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testSeekerPhone, purpose: 'register' })
    });
    assert(otpRes.status === 200, 'Send OTP responds with 200');
    assert(otpRes.data.success === true, 'OTP send marked successful');

    // 2.3 Verify OTP with invalid OTP
    const invalidOtp = await api('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testSeekerPhone, otp: '999999' })
    });
    assert(invalidOtp.status === 400, 'Invalid OTP rejected with HTTP 400');

    // 2.4 Verify OTP with valid test master OTP (123456)
    const validOtp = await api('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testSeekerPhone, otp: '123456' })
    });
    assert(validOtp.status === 200, 'Valid test OTP (123456) verified with HTTP 200');

    // 2.5 Register Seeker Account
    const regSeeker = await api('/api/auth/register-phone', {
      method: 'POST',
      body: JSON.stringify({
        phone: testSeekerPhone,
        otp: '123456',
        password: 'Password@123',
        name: 'Automated Test Seeker',
        role: 'seeker',
        title: 'Full-Stack QA Engineer',
        skills: ['React', 'Node.js', 'Jest', 'Automation'],
        address: 'BKC, Mumbai, Maharashtra',
        lat: 19.0760,
        lng: 72.8777
      })
    });
    assert(regSeeker.status === 201, 'Seeker registered successfully with HTTP 201');
    assert(Boolean(regSeeker.data.token), 'JWT Token returned on seeker registration');
    assert(regSeeker.data.user.role === 'seeker', 'User role correctly assigned as "seeker"');
    seekerToken = regSeeker.data.token;
    seekerUser = regSeeker.data.user;

    // 2.6 Reject Duplicate Registration
    const dupReg = await api('/api/auth/register-phone', {
      method: 'POST',
      body: JSON.stringify({
        phone: testSeekerPhone,
        otp: '123456',
        password: 'Password@123',
        name: 'Duplicate Seeker',
        role: 'seeker'
      })
    });
    assert(dupReg.status === 400, 'Duplicate phone number registration rejected with HTTP 400');

    // 2.7 Register Employer Account
    const regEmp = await api('/api/auth/register-phone', {
      method: 'POST',
      body: JSON.stringify({
        phone: testEmployerPhone,
        otp: '123456',
        password: 'Password@123',
        name: 'Automated Test Employer',
        role: 'emp',
        companyName: 'Apex HyperTech Labs',
        industry: 'Software & Cloud Solutions',
        address: 'Andheri East, Mumbai',
        lat: 19.1136,
        lng: 72.8697
      })
    });
    assert(regEmp.status === 201, 'Employer registered successfully with HTTP 201');
    assert(regEmp.data.user.role === 'emp', 'User role correctly assigned as "emp"');
    employerToken = regEmp.data.token;
    employerUser = regEmp.data.user;
  } catch (err) {
    console.error('Suite 2 halted:', err.message);
  }

  // ----------------------------------------------------
  // SUITE 3: Authentication & Login Methods
  // ----------------------------------------------------
  console.log('\n--- SUITE 3: Authentication & Login Methods ---');
  try {
    // 3.1 Login via Phone + OTP
    const loginOtp = await api('/api/auth/login-phone-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testSeekerPhone, otp: '123456' })
    });
    assert(loginOtp.status === 200, 'Phone + OTP login succeeds with HTTP 200');
    assert(Boolean(loginOtp.data.token), 'Valid session token received via OTP login');

    // 3.2 Login via Phone + Password
    const loginPwd = await api('/api/auth/login-phone-password', {
      method: 'POST',
      body: JSON.stringify({ phone: testEmployerPhone, password: 'Password@123' })
    });
    assert(loginPwd.status === 200, 'Phone + Password login succeeds with HTTP 200');
    assert(loginPwd.data.user.id === employerUser.id, 'Logged in user ID matches employer ID');

    // 3.3 Verify Token on Protected Route /api/auth/me
    const meRes = await api('/api/auth/me', {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert(meRes.status === 200, '/api/auth/me returns 200 with valid JWT');
    assert(meRes.data.user.name === 'Automated Test Seeker', 'User profile matches authenticated token');

    // 3.4 Update Profile
    const updateRes = await api('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: JSON.stringify({
        title: 'Senior Lead QA Architect',
        bio: 'Passionate about bulletproof reliable software and WebRTC.'
      })
    });
    assert(updateRes.status === 200, 'Profile updated successfully with HTTP 200');
    assert(updateRes.data.user.title === 'Senior Lead QA Architect', 'Updated title persisted in database');
  } catch (err) {
    console.error('Suite 3 halted:', err.message);
  }

  // ----------------------------------------------------
  // SUITE 4: Job Management & Discovery
  // ----------------------------------------------------
  console.log('\n--- SUITE 4: Job Management & Discovery ---');
  try {
    // 4.1 Post a New Job (Employer)
    const newJob = await api('/api/jobs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: JSON.stringify({
        title: 'Principal Cloud Platform Engineer',
        category: 'Technology',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        salary: '₹28,00,000 - ₹36,00,000 / yr',
        skills: ['Node.js', 'React', 'AWS', 'Docker'],
        description: 'Lead our next-generation cloud architecture and real-time streaming services.',
        address: 'Andheri East, Mumbai',
        lat: 19.1136,
        lng: 72.8697,
        urgent: true
      })
    });
    assert(newJob.status === 201, 'Job created successfully with HTTP 201');
    assert(Boolean(newJob.data.job.id), 'Job ID returned');
    createdJobId = newJob.data.job.id;

    // 4.2 Fetch All Jobs
    const allJobs = await api('/api/jobs');
    assert(allJobs.status === 200, 'Get all jobs returns HTTP 200');
    assert(Array.isArray(allJobs.data.jobs), 'Jobs returned as an array');
    const foundCreated = allJobs.data.jobs.some(j => j.id === createdJobId);
    assert(foundCreated, 'Newly created job exists in public jobs list');

    // 4.3 Search Jobs with Query Filter
    const searchJobs = await api('/api/jobs?search=Principal');
    assert(searchJobs.status === 200, 'Search jobs returns HTTP 200');
    assert(searchJobs.data.jobs.some(j => j.id === createdJobId), 'Search filter correctly matches title');

    // 4.4 Fetch Single Job by ID
    const singleJob = await api(`/api/jobs/${createdJobId}`);
    assert(singleJob.status === 200, 'Get job by ID returns HTTP 200');
    assert(singleJob.data.job.title === 'Principal Cloud Platform Engineer', 'Job title matches created entity');
  } catch (err) {
    console.error('Suite 4 halted:', err.message);
  }

  // ----------------------------------------------------
  // SUITE 5: Saved Jobs / Bookmarks Cloud Sync
  // ----------------------------------------------------
  console.log('\n--- SUITE 5: Saved Jobs / Bookmarks Cloud Sync ---');
  try {
    // 5.1 Toggle Save Job (Add)
    const saveToggle = await api('/api/auth/saved-jobs/toggle', {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: JSON.stringify({ jobId: createdJobId })
    });
    assert(saveToggle.status === 200, 'Toggle save job returns HTTP 200');
    assert(saveToggle.data.savedJobs.includes(createdJobId), 'Job ID added to user savedJobs array');

    // 5.2 Fetch Saved Jobs
    const getSaved = await api('/api/auth/saved-jobs', {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert(getSaved.status === 200, 'Get saved jobs returns HTTP 200');
    assert(getSaved.data.savedJobs.includes(createdJobId), 'Saved job confirmed in database');

    // 5.3 Toggle Save Job Again (Remove)
    const removeToggle = await api('/api/auth/saved-jobs/toggle', {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: JSON.stringify({ jobId: createdJobId })
    });
    assert(removeToggle.status === 200, 'Untoggle save job returns HTTP 200');
    assert(!removeToggle.data.savedJobs.includes(createdJobId), 'Job ID removed from user savedJobs array');
  } catch (err) {
    console.error('Suite 5 halted:', err.message);
  }

  // ----------------------------------------------------
  // SUITE 6: Applications & ATS Lifecycle
  // ----------------------------------------------------
  console.log('\n--- SUITE 6: Applications & ATS Lifecycle ---');
  try {
    // 6.1 Seeker Applies to Job
    const applyRes = await api('/api/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: JSON.stringify({
        jobId: createdJobId,
        coverNote: 'Excited about the Principal Cloud Platform position at Apex Labs!'
      })
    });
    assert(applyRes.status === 201, 'Job application submitted with HTTP 201');
    assert(Boolean(applyRes.data.application.id), 'Application ID generated');
    assert(applyRes.data.application.status === 'pending', 'Initial status set to "pending"');
    createdApplicationId = applyRes.data.application.id;

    // 6.2 Seeker Views Their Applications
    const myApps = await api('/api/applications/my', {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert(myApps.status === 200, 'Get seeker applications returns HTTP 200');
    assert(myApps.data.applications.some(a => a.id === createdApplicationId), 'Application found in seeker view');

    // 6.3 Employer Views Applications for Their Jobs
    const empApps = await api('/api/applications/employer', {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    assert(empApps.status === 200, 'Get employer applications returns HTTP 200');
    assert(empApps.data.applications.some(a => a.id === createdApplicationId), 'Application found in ATS pipeline');

    // 6.4 Transition ATS Status: pending -> reviewed
    const status1 = await api(`/api/applications/${createdApplicationId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: JSON.stringify({ status: 'reviewed' })
    });
    assert(status1.status === 200, 'Status updated to "reviewed" with HTTP 200');
    assert(status1.data.application.status === 'reviewed', 'Application status updated in DB');

    // 6.5 Transition ATS Status: reviewed -> interview
    const status2 = await api(`/api/applications/${createdApplicationId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: JSON.stringify({ status: 'interview' })
    });
    assert(status2.status === 200, 'Status updated to "interview" with HTTP 200');

    // 6.6 Issue Official Offer Letter
    const issueOffer = await api('/api/applications/issue-offer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: JSON.stringify({
        applicationId: createdApplicationId,
        salaryOffered: '₹32,00,000 / annum CTC',
        designation: 'Principal Cloud Platform Engineer',
        joiningDate: '2026-11-15',
        terms: 'Standard probation 3 months with health insurance.'
      })
    });
    assert(issueOffer.status === 200, 'Offer letter issued with HTTP 200');
    assert(issueOffer.data.application.status === 'offered', 'Application status moved to "offered"');
    assert(Boolean(issueOffer.data.application.offerLetter?.letterNumber), 'Official stamped letter number generated');

    // 6.7 Seeker Accepts Offer Letter
    const acceptOffer = await api('/api/applications/accept-offer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: JSON.stringify({ applicationId: createdApplicationId })
    });
    assert(acceptOffer.status === 200, 'Offer accepted with HTTP 200');
    assert(acceptOffer.data.application.status === 'hired', 'Final status updated to "hired"');
  } catch (err) {
    console.error('Suite 6 halted:', err.message);
  }

  // ----------------------------------------------------
  // SUITE 7: Social Feed & Community Posts
  // ----------------------------------------------------
  console.log('\n--- SUITE 7: Social Feed & Community Posts ---');
  try {
    // 7.1 Create Post
    const newPost = await api('/api/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: JSON.stringify({
        content: '🎉 Apex Labs is officially expanding Mumbai engineering! Hiring cloud engineers.',
        tags: ['#Hiring', '#MumbaiTech', '#CloudEngineering']
      })
    });
    assert(newPost.status === 201, 'Social post created with HTTP 201');
    assert(Boolean(newPost.data.post.id), 'Post ID returned');
    createdPostId = newPost.data.post.id;

    // 7.2 Like Post
    const likeRes = await api(`/api/posts/${createdPostId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert(likeRes.status === 200, 'Post liked with HTTP 200');
    assert(likeRes.data.likes >= 1, 'Likes count incremented');

    // 7.3 Comment on Post
    const commentRes = await api(`/api/posts/${createdPostId}/comment`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: JSON.stringify({ content: 'Exciting news! Great team to join.' })
    });
    assert(commentRes.status === 201, 'Comment added with HTTP 201');
    assert(commentRes.data.comments.length >= 1, 'Comments array includes new comment');

    // 7.4 Fetch Posts
    const getPosts = await api('/api/posts');
    assert(getPosts.status === 200, 'Get posts returns HTTP 200');
    assert(getPosts.data.posts.some(p => p.id === createdPostId), 'Created post verified in feed');
  } catch (err) {
    console.error('Suite 7 halted:', err.message);
  }

  // ----------------------------------------------------
  // SUITE 8: Direct Messaging & In-App Chat
  // ----------------------------------------------------
  console.log('\n--- SUITE 8: Direct Messaging & In-App Chat ---');
  try {
    // 8.1 Send Message from Employer to Seeker
    const sendMsg = await api('/api/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: JSON.stringify({
        receiverId: seekerUser.id,
        message: 'Hello! We reviewed your profile and wanted to connect.'
      })
    });
    assert(sendMsg.status === 201, 'Direct message sent with HTTP 201');
    assert(sendMsg.data.message.senderId === employerUser.id, 'Sender ID verified');

    // 8.2 Get Conversation History
    const conv = await api(`/api/messages/${employerUser.id}`, {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert(conv.status === 200, 'Conversation history fetched with HTTP 200');
    assert(Array.isArray(conv.data.messages), 'Messages returned as an array');
    assert(conv.data.messages.some(m => m.message.includes('reviewed your profile')), 'Sent message verified in history');

    // 8.3 Mark Messages as Read
    const markRead = await api(`/api/messages/${employerUser.id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert(markRead.status === 200, 'Messages marked read with HTTP 200');
  } catch (err) {
    console.error('Suite 8 halted:', err.message);
  }

  // ----------------------------------------------------
  // SUITE 9: Anonymous Salon & Discussions
  // ----------------------------------------------------
  console.log('\n--- SUITE 9: Anonymous Salon & Discussions ---');
  try {
    // 9.1 Fetch Anon Discussions
    const anonList = await api('/api/anon');
    assert(anonList.status === 200, 'Get anon discussions returns HTTP 200');
    assert(Array.isArray(anonList.data.discussions), 'Discussions returned as array');

    // 9.2 Create New Anon Discussion
    const newAnon = await api('/api/anon', {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: JSON.stringify({
        title: 'Mumbai Tech Salary Benchmarking 2026: BKC vs CyberCity Gurgaon',
        content: 'Comparing fixed CTC and in-hand deductions between Mumbai and Gurgaon tech hubs.',
        channel: 'r/SalaryTalk'
      })
    });
    assert(newAnon.status === 201, 'Anon discussion created with HTTP 201');
    assert(Boolean(newAnon.data.discussion.id), 'Anon discussion ID generated');
    createdAnonId = newAnon.data.discussion.id;

    // 9.3 Upvote Anon Discussion
    const upvoteRes = await api(`/api/anon/${createdAnonId}/vote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: JSON.stringify({ type: 'up' })
    });
    assert(upvoteRes.status === 200, 'Anon thread upvoted with HTTP 200');
    assert(upvoteRes.data.score >= 1, 'Score incremented');
  } catch (err) {
    console.error('Suite 9 halted:', err.message);
  }

  // ----------------------------------------------------
  // SUITE 10: WebSockets & WebRTC Signaling
  // ----------------------------------------------------
  console.log('\n--- SUITE 10: WebSockets & WebRTC Signaling ---');
  await new Promise((resolve) => {
    try {
      const clientSocket = io(BASE_URL, { transports: ['websocket'] });
      
      clientSocket.on('connect', () => {
        assert(clientSocket.connected === true, 'Socket.IO connected to backend server');
        
        // Join User Room
        clientSocket.emit('user:join', seekerUser.id);
        
        // Test Ping / Location broadcast
        clientSocket.emit('location:update', {
          userId: seekerUser.id,
          lat: 19.0760,
          lng: 72.8777,
          address: 'BKC, Mumbai'
        });

        setTimeout(() => {
          assert(clientSocket.connected === true, 'Socket connection remains stable under live traffic');
          clientSocket.disconnect();
          resolve();
        }, 500);
      });

      clientSocket.on('connect_error', (err) => {
        console.error('Socket connect error:', err);
        assert(false, `Socket connection failed: ${err.message}`);
        resolve();
      });
    } catch (e) {
      console.error('Socket test error:', e);
      resolve();
    }
  });

  // ----------------------------------------------------
  // SUITE 11: Security & Edge Case Hardening
  // ----------------------------------------------------
  console.log('\n--- SUITE 11: Security & Edge Case Hardening ---');
  try {
    // 11.1 Route Not Found (404)
    const notFound = await api('/api/non-existent-endpoint-xyz');
    assert(notFound.status === 404, 'Unknown endpoint responds with HTTP 404');

    // 11.2 Unauthorized access without Token
    const noAuth = await api('/api/applications/my');
    assert(noAuth.status === 401, 'Protected route without token returns HTTP 401');

    // 11.3 Invalid/Malformed Token
    const badAuth = await api('/api/applications/my', {
      headers: { Authorization: 'Bearer this_is_an_invalid_token_xyz' }
    });
    assert(badAuth.status === 403, 'Malformed token returns HTTP 403 Forbidden');
  } catch (err) {
    console.error('Suite 11 halted:', err.message);
  }

  // ----------------------------------------------------
  // FINAL SUMMARY
  // ----------------------------------------------------
  console.log('\n======================================================');
  console.log('📊 TEST RUN COMPLETE');
  console.log(`✅ Total Passed: ${totalPassed}`);
  console.log(`❌ Total Failed: ${totalFailed}`);
  if (totalFailed > 0) {
    console.log('Failed Tests:');
    failures.forEach(f => console.log(` - ${f}`));
  } else {
    console.log('🎉 ALL TEST SUITES PASSED WITH 100% SUCCESS RATE!');
  }
  console.log('======================================================');

  process.exit(totalFailed > 0 ? 1 : 0);
}

runTestSuite().catch((e) => {
  console.error('Fatal Test Runner Exception:', e);
  process.exit(1);
});
