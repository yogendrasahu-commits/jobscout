/**
 * Comprehensive Unit, Validation & Functional Testing Suite for JobScout
 * Tests:
 * 1. Server-side validation engine (server/utils/validator.js)
 * 2. Commute & Transit calculations and Net In-Hand algorithm (client/src/utils/commuteService.js)
 * 3. AI Match Engine scoring (server/utils/aiMatchEngine.js)
 * 4. Client-side form validators (client/src/utils/validators.js)
 * 5. Functional live API validation contracts (Auth, Jobs, Profile, Messaging, Anon, Offers)
 */

import {
  isValidEmail,
  cleanPhone,
  isValidIndianPhone,
  isWithinIndiaCoords,
  sanitizeString,
  sanitizeSkills,
  isValidSalary,
  validateJobPayload,
  validateOfferPayload,
  validateProfilePayload,
  INDIA_GEO_BOUNDS,
  VALID_APPLICATION_STATUSES
} from '../server/utils/validator.js';

import {
  calculateDistanceKm,
  estimateCommuteProfile,
  calculateNetInHand
} from '../client/src/utils/commuteService.js';

import {
  calculateAIMatch
} from '../server/utils/aiMatchEngine.js';

import {
  validateEmail as clientValidateEmail,
  validateIndianPhone as clientValidatePhone,
  validatePassword as clientValidatePassword,
  validateJobForm,
  validateOfferForm,
  validateProfileForm
} from '../client/src/utils/validators.js';

const BASE_URL = 'http://127.0.0.1:5000';
let totalPassed = 0;
let totalFailed = 0;
const failures = [];

function assert(condition, message, details = null) {
  if (!condition) {
    totalFailed++;
    const detailMsg = details ? ` (Details: ${JSON.stringify(details)})` : '';
    const fullMsg = `${message}${detailMsg}`;
    failures.push(fullMsg);
    console.error(`  ❌ FAIL: ${fullMsg}`);
    throw new Error(fullMsg);
  } else {
    totalPassed++;
    console.log(`  ✅ PASS: ${message}`);
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
    // raw text or empty
  }
  return { status: res.status, headers: res.headers, data };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 JOBSCOUT DEEP UNIT, VALIDATION & FUNCTIONAL TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // SUITE 1: Server-Side Validation Unit Tests (validator.js)
  // -------------------------------------------------------------
  console.log('--- [Suite 1] Server Validation Engine Unit Tests ---');

  // Email validation
  assert(isValidEmail('developer@google.com'), 'isValidEmail accepts standard corporate email');
  assert(isValidEmail('priya.sharma_99@subdomain.tech.io'), 'isValidEmail accepts email with subdomains and underscores');
  assert(!isValidEmail('plainaddress'), 'isValidEmail rejects address without @');
  assert(!isValidEmail('@missingusername.com'), 'isValidEmail rejects missing username');
  assert(!isValidEmail('user@.com'), 'isValidEmail rejects missing domain name');
  assert(!isValidEmail('user@domain'), 'isValidEmail rejects missing TLD');
  assert(!isValidEmail(''), 'isValidEmail rejects empty string');
  assert(!isValidEmail(null), 'isValidEmail rejects null');
  assert(!isValidEmail(undefined), 'isValidEmail rejects undefined');
  assert(!isValidEmail('a'.repeat(250) + '@example.com'), 'isValidEmail rejects email exceeding 254 characters');

  // Indian Phone validation
  assert(cleanPhone('+91 98765 43210') === '9876543210', 'cleanPhone strips spaces and country code to 10 digits');
  assert(cleanPhone('09876543210') === '9876543210', 'cleanPhone strips leading 0');
  assert(cleanPhone('') === '', 'cleanPhone handles empty input');
  assert(isValidIndianPhone('9876543210'), 'isValidIndianPhone accepts 10 digits starting with 9');
  assert(isValidIndianPhone('8123456789'), 'isValidIndianPhone accepts 10 digits starting with 8');
  assert(isValidIndianPhone('7000000001'), 'isValidIndianPhone accepts 10 digits starting with 7');
  assert(isValidIndianPhone('6398765432'), 'isValidIndianPhone accepts 10 digits starting with 6');
  assert(!isValidIndianPhone('5123456789'), 'isValidIndianPhone rejects phone starting with 5');
  assert(!isValidIndianPhone('1234567890'), 'isValidIndianPhone rejects phone starting with 1');
  assert(!isValidIndianPhone('987654321'), 'isValidIndianPhone rejects phone with 9 digits');
  assert(!isValidIndianPhone('98765432100'), 'isValidIndianPhone cleans and verifies 10-digit boundary');
  assert(!isValidIndianPhone('abcdefghij'), 'isValidIndianPhone rejects non-numeric input');

  // Coordinate Bounding
  assert(isWithinIndiaCoords(19.0760, 72.8777), 'isWithinIndiaCoords accepts Mumbai coordinates');
  assert(isWithinIndiaCoords(28.6139, 77.2090), 'isWithinIndiaCoords accepts Delhi coordinates');
  assert(isWithinIndiaCoords(12.9716, 77.5946), 'isWithinIndiaCoords accepts Bengaluru coordinates');
  assert(isWithinIndiaCoords('19.0760', '72.8777'), 'isWithinIndiaCoords handles string numeric coordinates');
  assert(!isWithinIndiaCoords(37.7749, -122.4194), 'isWithinIndiaCoords rejects San Francisco (US)');
  assert(!isWithinIndiaCoords(51.5074, -0.1278), 'isWithinIndiaCoords rejects London (UK)');
  assert(!isWithinIndiaCoords(0, 0), 'isWithinIndiaCoords rejects Null Island (0,0)');
  assert(!isWithinIndiaCoords(NaN, 72.8777), 'isWithinIndiaCoords rejects NaN latitude');
  assert(!isWithinIndiaCoords(19.0760, Infinity), 'isWithinIndiaCoords rejects Infinite longitude');

  // String Sanitization
  const xssInput = 'Hello <script>alert("hack")</script> World';
  assert(sanitizeString(xssInput) === 'Hello  World', 'sanitizeString strips dangerous script tags');
  const styleInput = 'Text <style>body{display:none;}</style> End';
  assert(sanitizeString(styleInput) === 'Text  End', 'sanitizeString strips dangerous style tags');
  assert(sanitizeString('a'.repeat(50), 20).length === 20, 'sanitizeString respects maxLength truncate limit');
  assert(sanitizeString(null) === '', 'sanitizeString handles null gracefully');
  assert(sanitizeString(undefined) === '', 'sanitizeString handles undefined gracefully');

  // Skills Sanitization
  const rawSkills = [' React.js ', '<script>bad()</script>Node.js', '', 'TypeScript'];
  const cleanedSkills = sanitizeSkills(rawSkills, 10, 20);
  assert(cleanedSkills.length === 3, 'sanitizeSkills filters empty and retains clean skills');
  assert(cleanedSkills[0] === 'React.js', 'sanitizeSkills trims skill strings');
  assert(cleanedSkills[1] === 'Node.js', 'sanitizeSkills strips malicious tags from skills');
  const longSkill = sanitizeSkills(['a'.repeat(100)], 10, 25);
  assert(longSkill[0].length === 25, 'sanitizeSkills truncates long skill item length');
  const csvSkills = sanitizeSkills('Python, Django, Machine Learning');
  assert(csvSkills.length === 3 && csvSkills[1] === 'Django', 'sanitizeSkills supports CSV string inputs');

  // Salary Validation
  assert(isValidSalary('₹12,00,000 / yr'), 'isValidSalary accepts standard Indian LPA string');
  assert(isValidSalary('₹800 - ₹1,200 / day'), 'isValidSalary accepts daily wage format');
  assert(isValidSalary(50000), 'isValidSalary accepts numeric values');
  assert(!isValidSalary(''), 'isValidSalary rejects empty string');
  assert(!isValidSalary(' '), 'isValidSalary rejects whitespace');
  assert(!isValidSalary(null), 'isValidSalary rejects null');

  // Composite Payload Validators
  const validJob = validateJobPayload({
    title: 'Senior Frontend Engineer',
    company: 'TechPulse Solutions',
    salary: '₹18,00,000 / yr',
    lat: 19.0760,
    lng: 72.8777,
    skills: 'React, Node.js, TailwindCSS'
  });
  assert(validJob.valid === true, 'validateJobPayload confirms valid job payload');
  assert(validJob.sanitized.skills.length === 3, 'validateJobPayload populates normalized skills array');

  const invalidJob = validateJobPayload({
    title: 'ab', // too short
    salary: '',
    lat: 45.0, // outside India
    lng: 10.0
  });
  assert(invalidJob.valid === false && invalidJob.errors.length >= 3, 'validateJobPayload identifies all validation errors');

  const validOffer = validateOfferPayload({
    candidateEmail: 'candidate@example.com',
    designation: 'Staff Software Architect',
    salary: '₹28,00,000 / yr',
    joiningDate: 'Within 15 Days'
  });
  assert(validOffer.valid === true, 'validateOfferPayload confirms valid offer payload');

  const invalidOffer = validateOfferPayload({
    candidateEmail: 'invalid-email',
    designation: 'x',
    salary: ''
  });
  assert(invalidOffer.valid === false, 'validateOfferPayload flags invalid email and empty salary');

  // -------------------------------------------------------------
  // SUITE 2: Commute & Net In-Hand Calculator Unit Tests
  // -------------------------------------------------------------
  console.log('\n--- [Suite 2] Commute & Net In-Hand Engine Unit Tests ---');

  // Distance computation
  const distSame = calculateDistanceKm(19.0760, 72.8777, 19.0760, 72.8777);
  assert(distSame === 0, 'calculateDistanceKm returns 0 for identical coordinates');
  const distMumbai = calculateDistanceKm(19.0760, 72.8777, 19.1136, 72.8697);
  assert(distMumbai > 0 && distMumbai < 15, `calculateDistanceKm calculates realistic urban distance (${distMumbai} km)`);
  const distFallback = calculateDistanceKm(null, null, undefined, 72.8);
  assert(distFallback === 5.0, 'calculateDistanceKm gracefully falls back on invalid coordinates');

  // Transit estimation profile
  const profile = estimateCommuteProfile({
    userCoords: { lat: 19.0760, lng: 72.8777 },
    jobCoords: { lat: 19.1136, lng: 72.8697 },
    userAddress: 'Bandra West, Mumbai',
    jobAddress: 'Andheri East, Mumbai'
  });
  assert(profile.modes.length === 4, 'estimateCommuteProfile generates Metro, Bike, Cab, Walk models');
  assert(profile.modes[0].id === 'metro' && profile.modes[0].monthlyCostNum > 0, 'Metro model includes monthly cost calculation');
  assert(profile.modes[1].id === 'bike' && profile.modes[1].timeMins > 0, 'Bike model includes transit duration');
  assert(profile.workLifeScore >= 25 && profile.workLifeScore <= 100, 'Work-life balance score is bounded between 25 and 100');
  assert(profile.co2SavedKg >= 0, 'CO2 footprint savings is non-negative');
  assert(profile.gmapsUrl.includes('google.com/maps/dir'), 'Google Maps transit direction link generated');

  // Net In-Hand Calculator
  const netCalc1 = calculateNetInHand({ grossMonthlySalary: 50000, commuteMonthlyCost: 3500, taxPercent: 10 });
  assert(netCalc1.netInHand === 41500, `Net in-hand accurately calculates 50,000 - 10% tax - 3,500 commute = ${netCalc1.netInHand}`);
  assert(netCalc1.savingsRatePercent === 83, `Net savings rate calculated at ${netCalc1.savingsRatePercent}%`);

  const netCalcEdge = calculateNetInHand({ grossMonthlySalary: 2000, commuteMonthlyCost: 5000 });
  assert(netCalcEdge.netInHand === 0, 'Net in-hand never produces negative values when expenses exceed income');

  const netCalcZero = calculateNetInHand({ grossMonthlySalary: 0 });
  assert(netCalcZero.netInHand === 0 && netCalcZero.savingsRatePercent === 0, 'Net in-hand handles 0 income gracefully without NaN');

  // -------------------------------------------------------------
  // SUITE 3: AI Match Engine Scoring Tests
  // -------------------------------------------------------------
  console.log('\n--- [Suite 3] AI Match Engine Unit Tests ---');

  const candidateA = {
    skills: ['React', 'JavaScript', 'Node.js', 'TailwindCSS'],
    title: 'Senior Frontend Developer',
    role: 'seeker',
    experience: '5 years'
  };

  const jobA = {
    title: 'Senior React Developer',
    skills: ['React', 'Node.js', 'TailwindCSS'],
    category: 'Technology',
    description: 'Looking for a Senior Frontend Developer skilled in React and Node.js'
  };

  const matchHigh = calculateAIMatch(candidateA, jobA);
  assert(matchHigh.score >= 70, `High skill alignment yields high AI score (${matchHigh.score}%)`);
  assert(matchHigh.matchedSkills.some(s => s.toLowerCase() === 'react'), 'Matched skills identifies overlapping technology competencies');

  const candidateB = {
    skills: ['Salesforce', 'CRM', 'Cold Calling'],
    title: 'Sales Representative',
    role: 'seeker'
  };

  const matchLow = calculateAIMatch(candidateB, jobA);
  assert(matchLow.score < 50, `Unrelated skill set yields lower match score (${matchLow.score}%)`);

  // -------------------------------------------------------------
  // SUITE 4: Client-Side Form Validators (validators.js)
  // -------------------------------------------------------------
  console.log('\n--- [Suite 4] Client-Side Form Validators Unit Tests ---');

  assert(clientValidateEmail('user@test.org') === null, 'clientValidateEmail returns null on valid email');
  assert(clientValidateEmail('invalid-email') !== null, 'clientValidateEmail returns error string on invalid email');

  assert(clientValidatePhone('9876543210') === null, 'clientValidatePhone returns null on valid 10-digit Indian phone');
  assert(clientValidatePhone('12345') !== null, 'clientValidatePhone flags insufficient digits');

  assert(clientValidatePassword('Secret123!') === null, 'clientValidatePassword accepts compliant password');
  assert(clientValidatePassword('123') !== null, 'clientValidatePassword rejects short password');

  const clientJobCheck = validateJobForm({
    title: 'UI', // short
    salary: '',
    address: 'M',
    lat: 100, // out of bounds
    lng: 200
  });
  assert(!clientJobCheck.isValid && clientJobCheck.errors.title && clientJobCheck.errors.coords, 'validateJobForm flags all frontend form field errors');

  const clientOfferCheck = validateOfferForm({
    candidateEmail: 'invalid',
    designation: '',
    salary: ''
  });
  assert(!clientOfferCheck.isValid && clientOfferCheck.errors.candidateEmail, 'validateOfferForm flags invalid offer email');

  // -------------------------------------------------------------
  // SUITE 5: Live API Contract & Boundary Validation Tests
  // -------------------------------------------------------------
  console.log('\n--- [Suite 5] Live API Contract & Boundary Tests ---');

  const ts = Date.now().toString().slice(-6);
  const testPhone = `98${ts}11`;
  const testEmployerEmail = `emp_validation_${ts}@jobscout.io`;
  let candidateToken = null;
  let employerToken = null;
  let candidateId = null;
  let employerId = null;

  // 1. Auth Validation: Reject non-Indian or malformed phone
  const badPhoneRes = await api('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone: '1234567890' })
  });
  assert(badPhoneRes.status === 400, 'Live API: send-otp rejects non-Indian phone number (HTTP 400)', badPhoneRes.data);

  // 2. Auth: Register valid Job Seeker
  const otpRes = await api('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone: testPhone })
  });
  const otpCode = otpRes.data?.otp || otpRes.data?.code;
  assert(otpRes.status === 200 && otpCode, 'Live API: send-otp succeeds for valid Indian phone', otpRes.data);

  const registerPhoneRes = await api('/api/auth/register-phone', {
    method: 'POST',
    body: JSON.stringify({
      phone: testPhone,
      otp: otpCode,
      role: 'seeker',
      name: 'Aditi Rao',
      password: 'SecurePassword@2026'
    })
  });
  assert([200, 201].includes(registerPhoneRes.status) && registerPhoneRes.data.token, 'Live API: register-phone creates candidate account', registerPhoneRes.data);
  candidateToken = registerPhoneRes.data.token;
  candidateId = registerPhoneRes.data.user.id;

  // 3. Auth: Register valid Employer
  const empRegRes = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmployerEmail,
      password: 'EmployerSecret#2026',
      name: 'Rohan Talwar',
      role: 'emp',
      companyName: 'FinMatrix Innovations',
      phone: `99${ts}22`
    })
  });
  assert([200, 201].includes(empRegRes.status) && empRegRes.data.token, 'Live API: register creates employer account', empRegRes.data);
  employerToken = empRegRes.data.token;
  employerId = empRegRes.data.user.id;

  // 4. Job Controller Validation: Reject coordinates outside India
  const badJobCoordsRes = await api('/api/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({
      title: 'DevOps Cloud Architect',
      salary: '₹22,00,000 / yr',
      lat: 51.5074, // London
      lng: -0.1278
    })
  });
  assert(badJobCoordsRes.status === 400, 'Live API: createJob rejects coordinates outside India boundary', badJobCoordsRes.data);

  // 5. Job Controller Validation: Reject short title
  const badJobTitleRes = await api('/api/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({
      title: 'Hi',
      salary: '₹10,00,000 / yr',
      lat: 19.0760,
      lng: 72.8777
    })
  });
  assert(badJobTitleRes.status === 400, 'Live API: createJob rejects title shorter than 3 characters', badJobTitleRes.data);

  // 6. Job Controller: Create Valid Job
  const validJobRes = await api('/api/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({
      title: 'Lead Full-Stack Engineer',
      salary: '₹24,00,000 / yr',
      company: 'FinMatrix Innovations',
      lat: 19.0760,
      lng: 72.8777,
      address: 'Bandra Kurla Complex, Mumbai',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      urgent: true
    })
  });
  assert(validJobRes.status === 201 && validJobRes.data.job.id, 'Live API: createJob creates valid job posting', validJobRes.data);
  const createdJobId = validJobRes.data.job.id;

  // 7. Profile Update Validation: Reject invalid email
  const badProfileEmailRes = await api('/api/auth/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({
      email: 'not-a-valid-email'
    })
  });
  assert(badProfileEmailRes.status === 400, 'Live API: profile update rejects invalid email format', badProfileEmailRes.data);

  // 8. Profile Update Validation: Successfully sanitize skills & update
  const goodProfileRes = await api('/api/auth/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({
      name: 'Aditi Rao Tech',
      title: 'Senior Full Stack Specialist',
      skills: ['React', 'Node.js', '<script>xss()</script>TypeScript'],
      bio: 'Passionate about engineering scalable web systems.',
      experience: '5 years'
    })
  });
  assert(goodProfileRes.status === 200, 'Live API: profile update succeeds with sanitized attributes', goodProfileRes.data);
  assert(goodProfileRes.data.user.skills.includes('TypeScript'), 'Live API: profile skills sanitized and saved properly');

  // 9. Messaging Validation: Reject empty message and self-messaging
  const emptyMsgRes = await api('/api/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({
      receiverId: employerId,
      message: '   '
    })
  });
  assert(emptyMsgRes.status === 400, 'Live API: messages rejects empty/whitespace-only messages', emptyMsgRes.data);

  const selfMsgRes = await api('/api/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({
      receiverId: candidateId,
      message: 'Self note'
    })
  });
  assert(selfMsgRes.status === 400, 'Live API: messages disallows self-messaging', selfMsgRes.data);

  const validMsgRes = await api('/api/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({
      receiverId: employerId,
      message: 'Hello, I have applied for the Lead Full-Stack position!'
    })
  });
  assert(validMsgRes.status === 201 && validMsgRes.data.message.id, 'Live API: messages accepts valid chat message', validMsgRes.data);

  // 10. Anon Discussion Validation: Reject short title
  const badAnonRes = await api('/api/anon', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Hi', // too short (< 5 chars)
      content: 'Discussion test body'
    })
  });
  assert(badAnonRes.status === 400, 'Live API: anon discussion rejects titles under 5 chars', badAnonRes.data);

  const validAnonRes = await api('/api/anon', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Is Bengaluru or Mumbai better for Fintech compensation in 2026?',
      content: 'Comparing take-home in-hand after rent and commute deductions between BKC and Whitefield.',
      channel: 'r/SalaryLeaks'
    })
  });
  assert(validAnonRes.status === 201 && validAnonRes.data.post.id, 'Live API: anon discussion creates valid discussion', validAnonRes.data);

  // 11. Application Lifecycle & Offer Letter Validation
  const applyRes = await api('/api/applications/apply', {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({
      jobId: createdJobId,
      coverNote: 'Excited to bring 5+ years of full-stack engineering expertise to FinMatrix!'
    })
  });
  assert(applyRes.status === 201 && applyRes.data.application.id, 'Live API: candidate submits job application', applyRes.data);
  const applicationId = applyRes.data.application.id;

  // Issue Offer Letter with invalid email (should fail)
  const badOfferEmailRes = await api(`/api/applications/${applicationId}/offer`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({
      candidateEmail: 'invalid-email-address',
      salary: '₹24,00,000 / yr'
    })
  });
  assert(badOfferEmailRes.status === 400, 'Live API: issueOffer rejects invalid candidate email', badOfferEmailRes.data);

  // Issue Offer Letter with valid parameters
  const validOfferRes = await api(`/api/applications/${applicationId}/offer`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${employerToken}` },
    body: JSON.stringify({
      candidateEmail: 'aditi.rao@gmail.com',
      designation: 'Lead Full-Stack Engineer',
      salary: '₹24,00,000 / yr',
      joiningDate: 'Within 15 Days',
      location: 'Bandra Kurla Complex (BKC), Mumbai'
    })
  });
  assert(validOfferRes.status === 200 && validOfferRes.data.application.status === 'offered', 'Live API: employer issues valid offer letter', validOfferRes.data);

  // Candidate accepts offer
  const acceptOfferRes = await api(`/api/applications/${applicationId}/accept-offer`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  assert(acceptOfferRes.status === 200 && acceptOfferRes.data.application.status === 'hired', 'Live API: candidate accepts offer and transitions to hired status', acceptOfferRes.data);

  console.log('\n================================================================');
  console.log(`🎉 TEST SUMMARY: ${totalPassed} Passed, ${totalFailed} Failed`);
  console.log('================================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('\n❌ Unhandled Test Suite Exception:', err);
  process.exit(1);
});
