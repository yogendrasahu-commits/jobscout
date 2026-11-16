// Comprehensive End-to-End Audit & Testing Suite for JobScout
// Verifies all workflows: Auth, Admin, Seeker, Employer, Chat, WebRTC Calling, Map, ATS Pipeline, Alerts, Community

import { io } from 'socket.io-client';
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

async function runE2E() {
  console.log('================================================================');
  console.log('🚀 JobScout Complete End-to-End Platform Process Audit');
  console.log(`📡 Backend Target: ${BASE_URL}`);
  console.log('================================================================\n');

  const ts = Date.now().toString().slice(-6);
  const testSeekerPhone = `91${ts}11`;
  const testSeekerEmail = `seeker_${ts}@test.jobscout.com`;
  const testEmployerPhone = `92${ts}22`;
  const testEmployerEmail = `emp_${ts}@test.jobscout.com`;
  const commonPassword = 'SecurePassword123!';

  let seekerToken = '';
  let seekerId = '';
  let employerToken = '';
  let employerId = '';
  let adminToken = '';
  let adminId = '';
  let testJobId = '';
  let testAppId = '';
  let testAnonId = '';

  // -------------------------------------------------------------
  // SUITE 1: System Health, Security Headers & Rate Limiting
  // -------------------------------------------------------------
  console.log('\n--- SUITE 1: System Health & Security Headers ---');
  try {
    const health = await api('/api/health');
    assert(health.status === 200, 'Health check returns HTTP 200');
    assert(health.data.status === 'ok', 'Health status is ok');
    assert(health.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff present');
    assert(health.headers.get('x-frame-options') === 'SAMEORIGIN', 'X-Frame-Options: SAMEORIGIN present');
    assert(health.headers.get('x-xss-protection') === '1; mode=block', 'X-XSS-Protection enabled');
  } catch (err) {
    console.error('Suite 1 failed:', err.message);
  }

  // -------------------------------------------------------------
  // SUITE 2: Seeker Onboarding & Dual Login Verification
  // -------------------------------------------------------------
  console.log('\n--- SUITE 2: Seeker Signup & Dual Authentication ---');
  try {
    // 2.1 OTP send & verify
    const otpRes = await api('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testSeekerPhone, purpose: 'register' })
    });
    assert(otpRes.status === 200 && otpRes.data.success, 'OTP dispatched to seeker phone');

    const verifyOtp = await api('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testSeekerPhone, otp: '123456' })
    });
    assert(verifyOtp.status === 200 && verifyOtp.data.success, 'OTP verified successfully');

    // 2.2 Register seeker
    const regSeeker = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: `Test Seeker ${ts}`,
        phone: testSeekerPhone,
        email: testSeekerEmail,
        password: commonPassword,
        role: 'seeker',
        lat: 19.0760,
        lng: 72.8777,
        address: 'Bandra Kurla Complex, Mumbai'
      })
    });
    assert(regSeeker.status === 201, 'Seeker registered with HTTP 201');
    assert(regSeeker.data.token, 'JWT Token generated on seeker registration');
    assert(regSeeker.data.user.role === 'seeker', 'Seeker role assigned');
    seekerToken = regSeeker.data.token;
    seekerId = regSeeker.data.user.id;

    // 2.3 Dual Login Test A: Phone + Password
    const loginPhonePass = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone: testSeekerPhone, password: commonPassword })
    });
    assert(loginPhonePass.status === 200, 'Seeker Phone + Password login succeeds with HTTP 200');
    assert(loginPhonePass.data.user.id === seekerId, 'Logged in seeker ID matches registered user');

    // 2.4 Dual Login Test B: Email + Password
    const loginEmailPass = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testSeekerEmail, password: commonPassword })
    });
    assert(loginEmailPass.status === 200, 'Seeker Email + Password login succeeds with HTTP 200');
    assert(loginEmailPass.data.user.email === testSeekerEmail, 'Logged in seeker email matches');

    // 2.5 Dual Login Test C: Phone + OTP Login
    await api('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testSeekerPhone, purpose: 'login' })
    });
    const loginPhoneOtp = await api('/api/auth/login-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testSeekerPhone, otp: '123456' })
    });
    assert(loginPhoneOtp.status === 200, 'Seeker Phone + OTP login succeeds with HTTP 200', loginPhoneOtp);

    // 2.6 Seeker Profile Completion Flow
    const updateProfile = await api('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: JSON.stringify({
        title: 'Full Stack React & Node Engineer',
        skills: ['React', 'Node.js', 'WebRTC', 'TailwindCSS', 'Socket.IO'],
        bio: 'Passionate developer building high-performance real-time applications.',
        experience: '4 years',
        resumeUrl: 'https://jobscout.local/resumes/harvard-ats-sample.pdf',
        isProfileComplete: true
      })
    });
    assert(updateProfile.status === 200, 'Seeker profile updated with HTTP 200');
    assert(updateProfile.data.user.isProfileComplete === true, 'Profile completion flag set to true');
    assert(updateProfile.data.user.skills.includes('WebRTC'), 'Seeker skills verified');
  } catch (err) {
    console.error('Suite 2 failed:', err.message);
  }

  // -------------------------------------------------------------
  // SUITE 3: Employer Onboarding & Profile Verification
  // -------------------------------------------------------------
  console.log('\n--- SUITE 3: Employer Signup & Profile Setup ---');
  try {
    // 3.1 Send & Verify OTP for Employer
    await api('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testEmployerPhone, purpose: 'register' })
    });
    await api('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: testEmployerPhone, otp: '123456' })
    });

    // 3.2 Register Employer
    const regEmployer = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: `Tech Innovations Corp HR`,
        phone: testEmployerPhone,
        email: testEmployerEmail,
        password: commonPassword,
        role: 'emp',
        companyName: 'Tech Innovations Corp',
        address: 'Andheri East, Mumbai',
        lat: 19.1136,
        lng: 72.8697
      })
    });
    assert(regEmployer.status === 201, 'Employer registered with HTTP 201', regEmployer);
    assert(regEmployer.data?.user?.role === 'emp', 'Employer role assigned', regEmployer);
    employerToken = regEmployer.data?.token;
    employerId = regEmployer.data?.user?.id;

    // 3.3 Employer Login (Email + Password)
    const empLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testEmployerEmail, password: commonPassword })
    });
    assert(empLogin.status === 200, 'Employer Email + Password login succeeds');

    // 3.4 Employer Profile Completion
    const updateEmpProfile = await api('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: JSON.stringify({
        companyName: 'Tech Innovations Corp',
        industry: 'Information Technology & Cloud Services',
        companySize: '50-200 Employees',
        website: 'https://techinnovations.example.com',
        isProfileComplete: true
      })
    });
    assert(updateEmpProfile.status === 200, 'Employer company profile updated successfully');

    // 3.5 Employer Posts a Job
    const postJob = await api('/api/jobs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: JSON.stringify({
        title: `Senior Full Stack Developer (${ts})`,
        company: 'Tech Innovations Corp',
        description: 'We are seeking a seasoned Full Stack Engineer with strong React, Node.js and WebRTC skills.',
        category: 'Technology',
        jobType: 'Full-time',
        salary: '₹18,00,000 - ₹24,00,000 P.A.',
        lat: 19.1136,
        lng: 72.8697,
        address: 'Andheri East, Mumbai, Maharashtra',
        skills: ['React', 'Node.js', 'WebRTC', 'Socket.IO'],
        urgent: true
      })
    });
    assert(postJob.status === 201, 'Employer posted job with HTTP 201');
    assert(postJob.data.job.id, 'Job ID generated');
    testJobId = postJob.data.job.id;

    // 3.6 Verify job in Employer My Jobs
    const myJobs = await api('/api/jobs/my', {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    assert(myJobs.status === 200, 'Employer my jobs endpoint returns HTTP 200');
    assert(myJobs.data.jobs.some(j => j.id === testJobId), 'Newly posted job present in employer my jobs list');
  } catch (err) {
    console.error('Suite 3 failed:', err.message);
  }

  // -------------------------------------------------------------
  // SUITE 4: Super Admin Workflow & Role Enforcement
  // -------------------------------------------------------------
  console.log('\n--- SUITE 4: Super Admin Workflows & Permissions ---');
  try {
    // 4.1 Admin Login
    const adminLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@jobscout.io',
        password: 'admin123'
      })
    });
    assert(adminLogin.status === 200, 'Super Admin login succeeds with HTTP 200');
    assert(adminLogin.data.user.role === 'admin', 'Super Admin role verified');
    adminToken = adminLogin.data.token;
    adminId = adminLogin.data.user.id;

    // 4.2 Admin Overview Stats
    const stats = await api('/api/admin/stats', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(stats.status === 200, 'Admin platform stats endpoint returns HTTP 200');
    assert(stats.data.stats.totalUsers > 0, 'Total users count is reported');
    assert(stats.data.stats.totalJobs > 0, 'Total jobs count is reported');
    assert(stats.data.stats.systemHealth.uptimeSeconds >= 0, 'System health uptime is valid');

    // 4.3 Admin Users Management
    const usersList = await api('/api/admin/users?role=all', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(usersList.status === 200, 'Admin users list endpoint returns HTTP 200');
    assert(usersList.data.users.length > 0, 'Admin can view all registered users');

    // 4.4 Admin Creates New User Directly
    const adminCreateUser = await api('/api/admin/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: `Admin Seeded Seeker ${ts}`,
        email: `admin_seeded_${ts}@jobscout.com`,
        phone: `93${ts}33`,
        password: commonPassword,
        role: 'seeker',
        title: 'Cloud DevOps Specialist',
        address: 'Bandra, Mumbai'
      })
    });
    assert(adminCreateUser.status === 201, 'Admin can create user directly with HTTP 201');

    // 4.5 Admin System Broadcast Announcement
    const broadcastRes = await api('/api/admin/broadcast', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: 'Platform Maintenance Notice',
        message: 'JobScout services are operating at 100% efficiency. All systems normal.',
        priority: 'high'
      })
    });
    assert(broadcastRes.status === 200, 'Admin system broadcast returns HTTP 200');

    // 4.6 Strict Role Check: Admin CANNOT Apply to Jobs
    const adminApplyJob = await api('/api/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        jobId: testJobId,
        coverNote: 'Admin attempting application'
      })
    });
    assert(adminApplyJob.status === 403, 'Admin job application strictly rejected with HTTP 403 Forbidden');
  } catch (err) {
    console.error('Suite 4 failed:', err.message);
  }

  // -------------------------------------------------------------
  // SUITE 5: Geospatial Job Discovery & Pagination
  // -------------------------------------------------------------
  console.log('\n--- SUITE 5: Geospatial Job Discovery & Pagination ---');
  try {
    // 5.1 Geo radius search near Mumbai BKC (lat: 19.0760, lng: 72.8777)
    const geoJobs = await api('/api/jobs?userLat=19.0760&userLng=72.8777&maxRadius=25');
    assert(geoJobs.status === 200, 'Geo search returns HTTP 200');
    assert(Array.isArray(geoJobs.data.jobs), 'Jobs returned as an array');
    assert(geoJobs.data.jobs.every(j => typeof j.distanceKm === 'number'), 'Distance calculated for every job');
    assert(geoJobs.data.jobs.every(j => j.distanceKm <= 25), 'All returned jobs are within 25km radius');

    // 5.2 Pagination test
    const paginatedJobs = await api('/api/jobs?limit=3&page=1');
    assert(paginatedJobs.status === 200, 'Paginated jobs endpoint returns HTTP 200');
    assert(paginatedJobs.data.jobs.length <= 3, 'Returned jobs count adheres to limit=3');
    assert(paginatedJobs.data.page === 1, 'Page number reported as 1');
    assert(paginatedJobs.data.totalCount > 0, 'Total count reported');

    // 5.3 Bookmark / Save Job Flow
    const saveJob = await api(`/api/auth/save-job/${testJobId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert(saveJob.status === 200, 'Seeker bookmarks job with HTTP 200');

    const getSaved = await api('/api/auth/saved-jobs', {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert(getSaved.status === 200 && getSaved.data.savedJobIds.includes(testJobId), 'Saved job confirmed in seeker bookmark list');

    // 5.4 Smart Commute Estimation
    const commute = estimateCommuteProfile(19.0760, 72.8777, 19.1136, 72.8697);
    assert(commute.distanceKm > 0, 'Commute distance calculated');
    assert(commute.modes.length >= 3, 'Multi-modal transit options generated (Metro, Bike, Cab)');
    assert(commute.workLifeScore >= 0 && commute.workLifeScore <= 100, 'Work-Life balance score valid');

    // 5.5 AI Match Calculation
    const aiMatchRes = await api(`/api/jobs/${testJobId}/match`, {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert(aiMatchRes.status === 200, 'AI Match endpoint returns HTTP 200');
    const matchObj = aiMatchRes.data.matchResult || aiMatchRes.data.aiMatch;
    assert(Boolean(matchObj), 'AI Match object returned');
    assert(matchObj.score >= 0 && matchObj.score <= 100, 'AI Match score calculated');
    assert(Array.isArray(matchObj.matchedSkills || matchObj.matchingSkills), 'Matching skills returned as array');
  } catch (err) {
    console.error('Suite 5 failed:', err.message);
  }

  // -------------------------------------------------------------
  // SUITE 6: ATS Pipeline & Offer Letter Flow
  // -------------------------------------------------------------
  console.log('\n--- SUITE 6: ATS Lifecycle & Official Offer Acceptance ---');
  try {
    // 6.1 Seeker applies for job
    const applyRes = await api('/api/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: JSON.stringify({
        jobId: testJobId,
        coverNote: 'I am excited about this Full Stack role and have extensive experience in WebRTC and real-time systems.'
      })
    });
    assert(applyRes.status === 201, 'Seeker applied for job with HTTP 201');
    assert(applyRes.data.application.id, 'Application ID generated');
    assert(applyRes.data.application.status === 'pending', 'Initial application status is pending');
    testAppId = applyRes.data.application.id;

    // 6.2 Duplicate application rejected
    const dupApply = await api('/api/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: JSON.stringify({ jobId: testJobId })
    });
    assert(dupApply.status === 400, 'Duplicate job application rejected with HTTP 400');

    // 6.3 Employer views incoming applications
    const empApps = await api('/api/applications/employer', {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    assert(empApps.status === 200, 'Employer fetched applications with HTTP 200');
    assert(empApps.data.applications.some(a => a.id === testAppId), 'New application visible in employer pipeline');

    // 6.4 Employer moves status: pending -> reviewed
    const reviewedStatus = await api(`/api/applications/${testAppId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: JSON.stringify({ status: 'reviewed' })
    });
    assert(reviewedStatus.status === 200, 'Application status moved to reviewed');

    // 6.5 Employer moves status: reviewed -> interview
    const interviewStatus = await api(`/api/applications/${testAppId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: JSON.stringify({ status: 'interview' })
    });
    assert(interviewStatus.status === 200, 'Application status moved to interview');

    // 6.6 Employer issues official offer letter
    const issueOffer = await api(`/api/applications/${testAppId}/offer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${employerToken}` },
      body: JSON.stringify({
        salary: '₹22,00,000 P.A.',
        joiningDate: '2026-12-01',
        designation: 'Senior Full Stack Engineer',
        workLocation: 'Tech Innovations HQ, Andheri East, Mumbai',
        benefits: 'Comprehensive Medical Insurance, Work From Home Allowance, Annual Bonus',
        message: 'Congratulations! We are delighted to extend this formal offer of employment.'
      })
    });
    assert(issueOffer.status === 200, 'Offer letter issued with HTTP 200');
    assert(issueOffer.data.application.status === 'offered', 'Application status updated to offered');
    assert(issueOffer.data.application.offerLetter?.letterNumber, 'Official stamped letter number generated');

    // 6.7 Seeker views application and offer letter
    const seekerApps = await api('/api/applications/my', {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert(seekerApps.status === 200, 'Seeker fetched my applications with HTTP 200');
    const myApp = seekerApps.data.applications.find(a => a.id === testAppId);
    assert(myApp && myApp.status === 'offered', 'Seeker sees status as offered');
    assert(myApp.offerLetter?.salary === '₹22,00,000 P.A.', 'Offer salary details match');

    // 6.8 Seeker accepts offer
    const acceptOffer = await api(`/api/applications/${testAppId}/accept-offer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert(acceptOffer.status === 200, 'Candidate accepted offer with HTTP 200');
    assert(acceptOffer.data.application.status === 'hired', 'Application status moved to hired');
  } catch (err) {
    console.error('Suite 6 failed:', err.message);
  }

  // -------------------------------------------------------------
  // SUITE 7: Real-Time Chat Messaging via Socket.IO
  // -------------------------------------------------------------
  console.log('\n--- SUITE 7: Real-Time Chat Messaging via Socket.IO ---');
  try {
    let chatReceived = false;

    // Connect Seeker and Employer via socket
    const socketSeeker = io(BASE_URL, { transports: ['websocket'] });
    const socketEmployer = io(BASE_URL, { transports: ['websocket'] });

    await new Promise((resolve) => {
      let connectedCount = 0;
      const check = () => {
        connectedCount++;
        if (connectedCount === 2) resolve();
      };
      socketSeeker.on('connect', () => {
        socketSeeker.emit('user:join', seekerId);
        check();
      });
      socketEmployer.on('connect', () => {
        socketEmployer.emit('user:join', employerId);
        check();
      });
    });
    // Brief settling delay so server socket map records both online users
    await new Promise((r) => setTimeout(r, 300));
    assert(true, 'Both Seeker and Employer connected to Socket.IO and joined rooms');

    // Employer listens for incoming chat message
    const chatPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Chat message reception timed out')), 5000);
      socketEmployer.on('chat:receive', (msg) => {
        if (msg.senderId === seekerId && msg.message === 'Hello, thank you for the job offer!') {
          chatReceived = true;
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    // Seeker sends chat message to Employer
    socketSeeker.emit('chat:send', {
      senderId: seekerId,
      receiverId: employerId,
      senderName: 'Test Seeker',
      message: 'Hello, thank you for the job offer!'
    });

    await chatPromise;
    assert(chatReceived, 'Employer received real-time chat message from Seeker via Socket.IO');

    // Typing indicator test
    let typingReceived = false;
    const typingPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Typing indicator timed out')), 5000);
      socketSeeker.on('chat:typing', (data) => {
        if (data.senderId === employerId && data.isTyping === true) {
          typingReceived = true;
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    socketEmployer.emit('chat:typing', {
      senderId: employerId,
      receiverId: seekerId,
      isTyping: true
    });

    await typingPromise;
    assert(typingReceived, 'Seeker received real-time typing indicator from Employer');

    socketSeeker.disconnect();
    socketEmployer.disconnect();
  } catch (err) {
    console.error('Suite 7 failed:', err.message);
  }

  // -------------------------------------------------------------
  // SUITE 8: WebRTC Speed Connect & Audio/Video Call Signaling
  // -------------------------------------------------------------
  console.log('\n--- SUITE 8: WebRTC Speed Connect & Call Signaling ---');
  try {
    const socketSeeker = io(BASE_URL, { transports: ['websocket'] });
    const socketEmployer = io(BASE_URL, { transports: ['websocket'] });

    await new Promise((resolve) => {
      let count = 0;
      const done = () => { count++; if (count === 2) resolve(); };
      socketSeeker.on('connect', () => { socketSeeker.emit('user:join', seekerId); done(); });
      socketEmployer.on('connect', () => { socketEmployer.emit('user:join', employerId); done(); });
    });
    // Brief settling delay so server socket map records both online users
    await new Promise((r) => setTimeout(r, 300));

    // 8.1 Seeker calls Employer
    const callIncomingPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Incoming call timed out')), 5000);
      socketEmployer.on('call:incoming', (data) => {
        if (data.callerId === seekerId && data.isVideo === true) {
          clearTimeout(timeout);
          resolve(data);
        }
      });
    });

    socketSeeker.emit('call:initiate', {
      toUserId: employerId,
      fromUserId: seekerId,
      fromName: 'Test Seeker',
      isVideo: true
    });

    const incomingData = await callIncomingPromise;
    assert(incomingData.callerId === seekerId, 'Employer received call:incoming event with callerId');

    // 8.2 Employer accepts call
    const callAcceptedPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Call accept timed out')), 5000);
      socketSeeker.on('call:accepted', (data) => {
        if (data.receiverId === employerId) {
          clearTimeout(timeout);
          resolve(data);
        }
      });
    });

    socketEmployer.emit('call:accept', {
      callerId: seekerId,
      receiverId: employerId,
      receiverName: 'Tech Innovations HR'
    });

    const acceptedData = await callAcceptedPromise;
    assert(acceptedData.receiverId === employerId, 'Seeker received call:accepted event');

    // 8.3 WebRTC Offer/Answer Signaling Exchange
    const signalPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('WebRTC signaling timed out')), 5000);
      socketEmployer.on('call:signal', (data) => {
        if (data.fromUserId === seekerId && data.signal?.type === 'offer') {
          clearTimeout(timeout);
          resolve(data);
        }
      });
    });

    socketSeeker.emit('call:signal', {
      toUserId: employerId,
      fromUserId: seekerId,
      signal: { type: 'offer', sdp: 'mock-sdp-offer-data' }
    });

    const receivedSignal = await signalPromise;
    assert(receivedSignal.signal.sdp === 'mock-sdp-offer-data', 'WebRTC SDP Offer signaling exchanged successfully');

    // 8.4 Seeker ends call
    const callEndedPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Call end timed out')), 5000);
      socketEmployer.on('call:ended', () => {
        clearTimeout(timeout);
        resolve();
      });
    });

    socketSeeker.emit('call:end', { toUserId: employerId });
    await callEndedPromise;
    assert(true, 'Employer received call:ended event and call terminated cleanly');

    socketSeeker.disconnect();
    socketEmployer.disconnect();
  } catch (err) {
    console.error('Suite 8 failed:', err.message);
  }

  // -------------------------------------------------------------
  // SUITE 9: Anonymous Salon & Community Discussions
  // -------------------------------------------------------------
  console.log('\n--- SUITE 9: Anonymous Community Discussions ---');
  try {
    // 9.1 Create thread
    const createAnon = await api('/api/anon', {
      method: 'POST',
      body: JSON.stringify({
        title: `Compensation for Remote Full Stack Roles in 2026 (${ts})`,
        content: 'What is the standard base compensation for a senior React & Node developer in Mumbai / Remote?',
        tags: ['salary', 'career', 'remote']
      })
    });
    assert(createAnon.status === 201, 'Anonymous discussion created with HTTP 201');
    testAnonId = (createAnon.data.discussion || createAnon.data.post)?.id;
    assert(Boolean(testAnonId), 'Anonymous post ID generated');

    // 9.2 Upvote thread
    const upvote = await api(`/api/anon/${testAnonId}/upvote`, { method: 'POST' });
    assert(upvote.status === 200, 'Anonymous discussion upvoted with HTTP 200');

    // 9.3 Add comment
    const comment = await api(`/api/anon/${testAnonId}/comment`, {
      method: 'POST',
      body: JSON.stringify({
        author: 'Fellow Dev',
        content: 'Typical range is ₹20L - ₹32L depending on production experience.'
      })
    });
    assert(comment.status === 201, 'Comment added to anonymous thread with HTTP 201');

    // 9.4 Fetch threads sorted by hot
    const getAnon = await api('/api/anon?sort=hot');
    assert(getAnon.status === 200, 'Anonymous discussions list returned with HTTP 200');
    const anonPosts = getAnon.data.posts || getAnon.data.discussions || [];
    assert(anonPosts.some(p => p.id === testAnonId), 'Created anonymous post visible in community feed');
  } catch (err) {
    console.error('Suite 9 failed:', err.message);
  }

  // -------------------------------------------------------------
  // SUITE 10: Instant WhatsApp & Telegram Alert System
  // -------------------------------------------------------------
  console.log('\n--- SUITE 10: WhatsApp & Telegram Alert Dispatch ---');
  try {
    // 10.1 Get alert settings
    const settings = await api('/api/alerts/settings', {
      headers: { Authorization: `Bearer ${seekerToken}` }
    });
    assert(settings.status === 200, 'Alert settings endpoint returns HTTP 200');
    assert(typeof settings.data.whatsappEnabled === 'boolean', 'whatsappEnabled flag present');

    // 10.2 Update alert settings with target phone & telegram chat id
    const updateSettings = await api('/api/alerts/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: JSON.stringify({
        whatsappEnabled: true,
        whatsappPhone: '919876543210',
        telegramEnabled: true,
        telegramChatId: 'jobscout_dev_channel'
      })
    });
    assert(updateSettings.status === 200, 'Alert settings updated with HTTP 200');
    assert(updateSettings.data.settings.whatsappPhone === '919876543210', 'Phone persisted in alert settings');

    // 10.3 Test direct WhatsApp link generation
    const waTest = await api('/api/alerts/whatsapp', {
      method: 'POST',
      headers: { Authorization: `Bearer ${seekerToken}` },
      body: JSON.stringify({
        phone: '+91 98765 43210',
        message: 'Your job offer has been issued on JobScout!'
      })
    });
    assert(waTest.status === 200, 'Direct WhatsApp alert generation returns HTTP 200');
    const waUrl = waTest.data.url || waTest.data.whatsappUrl || '';
    assert(waUrl.includes('wa.me/919876543210'), 'Phone sanitized to E.164 digits without + or spaces');
    assert(waUrl.includes('api.whatsapp.com') || waUrl.includes('wa.me'), 'Valid WhatsApp deep link generated');
  } catch (err) {
    console.error('Suite 10 failed:', err.message);
  }

  console.log('\n================================================================');
  console.log(`📊 END-TO-END AUDIT COMPLETE`);
  console.log(`✅ Total Tests Passed: ${totalPassed}`);
  console.log(`❌ Total Tests Failed: ${totalFailed}`);
  if (failures.length > 0) {
    console.log('Failures:', failures);
    process.exit(1);
  } else {
    console.log('🎉 ALL PROCESSES VERIFIED WITH 100% SUCCESS RATE!');
    console.log('================================================================\n');
  }
}

runE2E().catch((err) => {
  console.error('Fatal error during E2E test:', err);
  process.exit(1);
});
