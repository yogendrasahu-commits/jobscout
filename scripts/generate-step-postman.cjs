const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.resolve(__dirname, '..');
const swaggerPath = path.join(rootDir, 'docs', 'swagger.json');
const outputDir = path.join(rootDir, 'docs', 'postman');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const swagger = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

// Helper to generate UUIDs for Postman collections
const uuid = () => crypto.randomUUID();

// Helper to build a Postman URL object
function buildUrl(urlPath, queryParams = []) {
  const cleanPath = urlPath.replace(/^\//, '');
  const segments = cleanPath.split('/').map(seg => {
    if (seg.startsWith('{') && seg.endsWith('}')) {
      return `:${seg.slice(1, -1)}`;
    }
    return seg;
  });

  const rawUrl = `{{baseUrl}}/${segments.join('/')}`;
  const query = queryParams.map(p => ({
    key: p.name,
    value: p.example !== undefined ? String(p.example) : (p.schema && p.schema.example !== undefined ? String(p.schema.example) : ''),
    description: p.description || ''
  }));

  const variables = [];
  cleanPath.split('/').forEach(seg => {
    if (seg.startsWith('{') && seg.endsWith('}')) {
      const varName = seg.slice(1, -1);
      variables.push({
        key: varName,
        value: `{{${varName}}}`,
        description: `Dynamic parameter for ${varName}`
      });
    }
  });

  const urlObj = {
    raw: query.length > 0 ? `${rawUrl}?${query.map(q => `${q.key}=${q.value}`).join('&')}` : rawUrl,
    host: ['{{baseUrl}}'],
    path: segments
  };

  if (query.length > 0) urlObj.query = query;
  if (variables.length > 0) urlObj.variable = variables;

  return urlObj;
}

// Helper to construct sample body from OpenAPI schema
function constructSampleBody(pathUrl, method, op) {
  if (op.requestBody && op.requestBody.content && op.requestBody.content['application/json']) {
    const jsonSchema = op.requestBody.content['application/json'].schema;
    if (jsonSchema) {
      if (jsonSchema.example) return jsonSchema.example;
      if (jsonSchema.properties) {
        const sample = {};
        for (const [key, prop] of Object.entries(jsonSchema.properties)) {
          if (prop.example !== undefined) sample[key] = prop.example;
          else if (prop.type === 'string') sample[key] = 'sample_value';
          else if (prop.type === 'number' || prop.type === 'integer') sample[key] = 0;
          else if (prop.type === 'boolean') sample[key] = true;
          else if (prop.type === 'array') sample[key] = [];
          else if (prop.type === 'object') sample[key] = {};
        }
        return sample;
      }
    }
  }

  // Fallbacks for well known paths if schema is generic
  if (pathUrl === '/api/auth/send-otp') return { phone: '9876543210' };
  if (pathUrl === '/api/auth/verify-otp') return { phone: '9876543210', otp: '123456' };
  if (pathUrl === '/api/auth/login-phone-otp') return { phone: '9876543210', otp: '123456' };
  if (pathUrl === '/api/auth/login-phone-password') return { phone: '9876543210', password: 'password123' };
  if (pathUrl === '/api/auth/register-phone') {
    return {
      phone: '9876543210',
      otp: '123456',
      name: 'Priya Sharma',
      role: 'seeker',
      password: 'SecurePassword123!',
      address: 'Bandra Kurla Complex, Mumbai'
    };
  }
  if (pathUrl === '/api/auth/location') return { lat: 19.076, lng: 72.8777, address: 'Mumbai, Maharashtra' };
  if (pathUrl === '/api/auth/extract-skills') return { resumeText: 'Senior Fullstack Developer with 5+ years experience in React, Node.js, Express, WebRTC, Leaflet, and Docker.' };
  if (pathUrl === '/api/jobs' && method === 'post') {
    return {
      title: 'Senior Full Stack Engineer',
      company: 'TechCorp India',
      category: 'IT & Software',
      type: 'Full-time',
      experience: '3-5 years',
      location: 'BKC, Mumbai',
      salary: '₹18,00,000 - ₹24,00,000 P.A.',
      description: 'Looking for a skilled engineer to build real-time WebRTC and geospatial map solutions.',
      requirements: ['React', 'Node.js', 'Socket.IO', 'Express'],
      lat: 19.0657,
      lng: 72.8687
    };
  }
  if (pathUrl === '/api/applications' && method === 'post') {
    return {
      jobId: '{{jobId}}',
      coverLetter: 'Excited to apply! I have deep expertise in building high-performance fullstack web and mobile apps.',
      resumeUrl: 'https://jobscout.io/resumes/priya_sharma_cv.pdf',
      experience: '4 years'
    };
  }
  if (pathUrl === '/api/applications/issue-offer') {
    return {
      applicationId: '{{applicationId}}',
      jobTitle: 'Senior Full Stack Engineer',
      salary: '₹22,00,000 P.A.',
      joiningDate: '2026-12-01',
      terms: 'Standard probation 3 months followed by full healthcare benefits and equity pool.'
    };
  }
  if (pathUrl === '/api/applications/accept-offer') return { applicationId: '{{applicationId}}' };
  if (pathUrl === '/api/applications/decline-offer') return { applicationId: '{{applicationId}}', reason: 'Accepted another offer' };
  if (pathUrl === '/api/messages' && method === 'post') {
    return {
      receiverId: '{{employerId}}',
      text: 'Hello! I noticed your job opening for Senior Full Stack Engineer. Is the position still open?'
    };
  }
  if (pathUrl === '/api/posts' && method === 'post') {
    return {
      content: 'Excited to share that JobScout has officially launched realtime 1-tap WebRTC speed calling! 🚀',
      tags: ['JobScout', 'TechHiring', 'WebRTC']
    };
  }
  if (pathUrl === '/api/anon' && method === 'post') {
    return {
      title: 'What tech stack are companies preferring for live maps in 2026?',
      content: 'We are evaluating Leaflet vs Mapbox GL for an upcoming production logistics platform.',
      category: 'Engineering & Architecture'
    };
  }
  if (pathUrl === '/api/alerts/whatsapp') {
    return {
      phone: '9876543210',
      type: 'job_alert',
      jobTitle: 'Senior Full Stack Engineer',
      company: 'TechCorp India'
    };
  }
  if (pathUrl === '/api/alerts/telegram') {
    return {
      chatId: '@jobscout_alerts',
      message: '🚨 New verified job alert: Senior Full Stack Engineer in Mumbai'
    };
  }
  if (pathUrl === '/api/admin/broadcast') {
    return {
      type: 'system_alert',
      title: 'Platform Maintenance Notice',
      message: 'System upgrade completed. All WebRTC voice and video gateways are 100% operational.'
    };
  }

  return null;
}

// Generate smart test script based on path and method
function generateTestScript(pathUrl, method) {
  const lines = [];

  // Check status
  if (method === 'post' && !pathUrl.includes('/like') && !pathUrl.includes('/toggle')) {
    lines.push("pm.test('Status code is 200 or 201', function () {");
    lines.push("    pm.expect(pm.response.code).to.be.oneOf([200, 201]);");
    lines.push("});");
  } else {
    lines.push("pm.test('Status code is successful (< 400)', function () {");
    lines.push("    pm.expect(pm.response.code).to.be.below(400);");
    lines.push("});");
  }

  // Token extraction
  if (pathUrl.includes('/login') || pathUrl.includes('/register')) {
    lines.push("if (pm.response.code === 200 || pm.response.code === 201) {");
    lines.push("    var res = pm.response.json();");
    lines.push("    if (res.token) {");
    lines.push("        pm.environment.set('token', res.token);");
    lines.push("        if (res.user) {");
    lines.push("            if (res.user.role === 'seeker') {");
    lines.push("                pm.environment.set('seekerToken', res.token);");
    lines.push("                pm.environment.set('seekerId', res.user.id || res.user._id);");
    lines.push("            } else if (res.user.role === 'emp') {");
    lines.push("                pm.environment.set('employerToken', res.token);");
    lines.push("                pm.environment.set('employerId', res.user.id || res.user._id);");
    lines.push("            } else if (res.user.role === 'admin') {");
    lines.push("                pm.environment.set('adminToken', res.token);");
    lines.push("                pm.environment.set('adminId', res.user.id || res.user._id);");
    lines.push("            }");
    lines.push("        }");
    lines.push("        console.log('✅ Token saved to environment variable');");
    lines.push("    }");
    lines.push("}");
  }

  // Job ID extraction
  if (pathUrl === '/api/jobs' && method === 'post') {
    lines.push("if (pm.response.code === 201) {");
    lines.push("    var res = pm.response.json();");
    lines.push("    var j = res.job || res;");
    lines.push("    if (j.id || j._id) {");
    lines.push("        pm.environment.set('jobId', j.id || j._id);");
    lines.push("        console.log('✅ jobId saved:', j.id || j._id);");
    lines.push("    }");
    lines.push("}");
  }

  // Application ID extraction
  if (pathUrl === '/api/applications' && method === 'post') {
    lines.push("if (pm.response.code === 201) {");
    lines.push("    var res = pm.response.json();");
    lines.push("    var app = res.application || res;");
    lines.push("    if (app.id || app._id) {");
    lines.push("        pm.environment.set('applicationId', app.id || app._id);");
    lines.push("        console.log('✅ applicationId saved:', app.id || app._id);");
    lines.push("    }");
    lines.push("}");
  }

  // Post ID extraction
  if (pathUrl === '/api/posts' && method === 'post') {
    lines.push("if (pm.response.code === 201) {");
    lines.push("    var res = pm.response.json();");
    lines.push("    var p = res.post || res;");
    lines.push("    if (p.id || p._id) {");
    lines.push("        pm.environment.set('postId', p.id || p._id);");
    lines.push("        console.log('✅ postId saved:', p.id || p._id);");
    lines.push("    }");
    lines.push("}");
  }

  // Anon Discussion ID extraction
  if (pathUrl === '/api/anon' && method === 'post') {
    lines.push("if (pm.response.code === 201) {");
    lines.push("    var res = pm.response.json();");
    lines.push("    var d = res.discussion || res;");
    lines.push("    if (d.id || d._id) {");
    lines.push("        pm.environment.set('anonId', d.id || d._id);");
    lines.push("        console.log('✅ anonId saved:', d.id || d._id);");
    lines.push("    }");
    lines.push("}");
  }

  // Message ID extraction
  if (pathUrl === '/api/messages' && method === 'post') {
    lines.push("if (pm.response.code === 201) {");
    lines.push("    var res = pm.response.json();");
    lines.push("    var m = res.message || res;");
    lines.push("    if (m.id || m._id) {");
    lines.push("        pm.environment.set('messageId', m.id || m._id);");
    lines.push("        console.log('✅ messageId saved:', m.id || m._id);");
    lines.push("    }");
    lines.push("}");
  }

  lines.push("pm.test('Response time < 1500ms', function () {");
  lines.push("    pm.expect(pm.response.responseTime).to.be.below(1500);");
  lines.push("});");

  return [
    {
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: lines
      }
    }
  ];
}

// Create a single Postman Item
function createPostmanItem(pathUrl, method, op, customRole = null) {
  const isAuthRequired = op.security && op.security.some(s => s.BearerAuth !== undefined);
  const sampleBody = constructSampleBody(pathUrl, method, op);

  const tokenVar = customRole === 'seeker' ? '{{seekerToken}}' :
                   customRole === 'emp' ? '{{employerToken}}' :
                   customRole === 'admin' ? '{{adminToken}}' : '{{token}}';

  const item = {
    name: op.summary || `${method.toUpperCase()} ${pathUrl}`,
    event: generateTestScript(pathUrl, method),
    request: {
      method: method.toUpperCase(),
      header: [
        {
          key: 'Content-Type',
          value: 'application/json',
          type: 'text'
        }
      ],
      url: buildUrl(pathUrl, op.parameters ? op.parameters.filter(p => p.in === 'query') : []),
      description: op.description || op.summary || ''
    }
  };

  if (isAuthRequired) {
    item.request.auth = {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: tokenVar,
          type: 'string'
        }
      ]
    };
  }

  if (sampleBody && (method === 'post' || method === 'put' || method === 'patch')) {
    item.request.body = {
      mode: 'raw',
      raw: JSON.stringify(sampleBody, null, 2),
      options: {
        raw: {
          language: 'json'
        }
      }
    };
  }

  return item;
}

// -------------------------------------------------------------
// DEFINE STEP-BY-STEP WORKFLOW COLLECTIONS
// -------------------------------------------------------------
const steps = [
  {
    fileName: 'JobScout-01-Auth-Signup-Login.postman_collection.json',
    name: 'Step 1: Authentication & User Onboarding',
    description: 'System health check, phone OTP verification, Seeker and Employer registration, password login, profile retrieval, and GPS geolocation synchronization.',
    routes: [
      { path: '/api/health', method: 'get' },
      { path: '/api/health/db', method: 'get' },
      { path: '/api/upload/config', method: 'get' },
      { path: '/api/auth/check-phone/{phone}', method: 'get' },
      { path: '/api/auth/send-otp', method: 'post' },
      { path: '/api/auth/verify-otp', method: 'post' },
      { path: '/api/auth/register-phone', method: 'post', customRole: 'seeker', customName: 'Register Job Seeker (via Phone OTP)' },
      { path: '/api/auth/register-phone', method: 'post', customRole: 'emp', customName: 'Register Employer (via Phone OTP)', customBody: { phone: '9876543299', otp: '123456', name: 'TechHire Solutions', role: 'emp', password: 'EmployerPass123!', address: 'Andheri East, Mumbai' } },
      { path: '/api/auth/login-phone-otp', method: 'post' },
      { path: '/api/auth/login-phone-password', method: 'post' },
      { path: '/api/auth/me', method: 'get' },
      { path: '/api/auth/location', method: 'put' },
      { path: '/api/auth/profile', method: 'put' },
      { path: '/api/auth/extract-skills', method: 'post' }
    ]
  },
  {
    fileName: 'JobScout-02-Job-Seeker-Workflow.postman_collection.json',
    name: 'Step 2: Job Seeker Discovery & Application',
    description: 'Job discovery with geospatial radius filtering, AI fit score calculation, AI recommendations, bookmarking saved jobs, submitting job applications, and accepting formal offer letters.',
    routes: [
      { path: '/api/jobs', method: 'get', customRole: 'seeker' },
      { path: '/api/jobs/{id}', method: 'get', customRole: 'seeker' },
      { path: '/api/jobs/{id}/match', method: 'get', customRole: 'seeker' },
      { path: '/api/jobs/recommended', method: 'get', customRole: 'seeker' },
      { path: '/api/auth/saved-jobs/toggle', method: 'post', customRole: 'seeker', customBody: { jobId: '{{jobId}}' } },
      { path: '/api/auth/saved-jobs', method: 'get', customRole: 'seeker' },
      { path: '/api/applications', method: 'post', customRole: 'seeker' },
      { path: '/api/applications/my', method: 'get', customRole: 'seeker' },
      { path: '/api/applications/accept-offer', method: 'post', customRole: 'seeker' },
      { path: '/api/applications/decline-offer', method: 'post', customRole: 'seeker' }
    ]
  },
  {
    fileName: 'JobScout-03-Employer-Workflow.postman_collection.json',
    name: 'Step 3: Employer Hiring & ATS Pipeline',
    description: 'Posting new verified tech jobs, browsing active talent on the interactive radar, reviewing candidate ATS pipelines, advancing candidate interview stages, and issuing stamped digital offer letters.',
    routes: [
      { path: '/api/jobs', method: 'post', customRole: 'emp' },
      { path: '/api/auth/seekers', method: 'get', customRole: 'emp' },
      { path: '/api/applications/employer', method: 'get', customRole: 'emp' },
      { path: '/api/applications/{id}/status', method: 'put', customRole: 'emp', customBody: { status: 'interview' } },
      { path: '/api/applications/issue-offer', method: 'post', customRole: 'emp' },
      { path: '/api/jobs/{id}', method: 'delete', customRole: 'emp' }
    ]
  },
  {
    fileName: 'JobScout-04-Messaging-and-Networking.postman_collection.json',
    name: 'Step 4: Messaging & Professional Network',
    description: 'Real-time in-app direct messaging, conversation history, unread counters, user network profiles, 1-tap connections, and professional skill endorsements.',
    routes: [
      { path: '/api/messages', method: 'post', customRole: 'seeker' },
      { path: '/api/messages/{otherUserId}', method: 'get', customRole: 'seeker' },
      { path: '/api/messages/threads/all', method: 'get', customRole: 'seeker' },
      { path: '/api/messages/{otherUserId}/read', method: 'put', customRole: 'seeker' },
      { path: '/api/network/{userId}', method: 'get', customRole: 'seeker' },
      { path: '/api/network/connect', method: 'post', customRole: 'seeker', customBody: { targetUserId: '{{employerId}}' } },
      { path: '/api/network/endorse', method: 'post', customRole: 'seeker', customBody: { targetUserId: '{{seekerId}}', skill: 'React' } }
    ]
  },
  {
    fileName: 'JobScout-05-Community-and-Anonymous-Salon.postman_collection.json',
    name: 'Step 5: Community Feed & Anonymous Salon',
    description: 'Public community feed posts, likes, comments, verified employer updates, and anonymous workplace discussions with upvoting and downvoting.',
    routes: [
      { path: '/api/posts', method: 'get' },
      { path: '/api/posts', method: 'post', customRole: 'seeker' },
      { path: '/api/posts/{id}/like', method: 'post', customRole: 'seeker' },
      { path: '/api/posts/{id}/comment', method: 'post', customRole: 'seeker', customBody: { text: 'Great milestone! Realtime WebRTC speed calling is a game changer.' } },
      { path: '/api/anon', method: 'get' },
      { path: '/api/anon', method: 'post', customRole: 'seeker' },
      { path: '/api/anon/{id}/vote', method: 'post', customRole: 'seeker', customBody: { direction: 'up' } }
    ]
  },
  {
    fileName: 'JobScout-06-Multi-Channel-Alerts.postman_collection.json',
    name: 'Step 6: Instant Alerts & Notification Engine',
    description: 'Automated multi-channel alert dispatch via direct WhatsApp click-to-chat links, Telegram bot webhooks, notification preference controls, and SMTP email settings.',
    routes: [
      { path: '/api/alerts/whatsapp', method: 'post' },
      { path: '/api/alerts/telegram', method: 'post' },
      { path: '/api/alerts/settings', method: 'get', customRole: 'seeker' },
      { path: '/api/alerts/settings', method: 'put', customRole: 'seeker', customBody: { whatsappPhone: '9876543210', telegramChatId: '@priya_tech', emailAlerts: true } },
      { path: '/api/settings/email', method: 'get' },
      { path: '/api/settings/email', method: 'put', customBody: { host: 'smtp.gmail.com', port: 587, secure: false, user: 'admin@jobscout.io', pass: 'sample_app_password', from: 'JobScout Alerts <alerts@jobscout.io>' } }
    ]
  },
  {
    fileName: 'JobScout-07-Master-Admin-Console.postman_collection.json',
    name: 'Step 7: Master Administration & Operations',
    description: 'Super admin platform governance: system analytics, user management, identity verification badges, account blocking, job moderation, geocoded map pins, dynamic feature flags, and global WebSocket broadcasts.',
    routes: [
      { path: '/api/auth/login-phone-password', method: 'post', customRole: 'admin', customName: 'Admin Master Login', customBody: { phone: '9999999999', password: 'AdminMasterPass123!' } },
      { path: '/api/admin/stats', method: 'get', customRole: 'admin' },
      { path: '/api/admin/users', method: 'get', customRole: 'admin' },
      { path: '/api/admin/users/{id}', method: 'get', customRole: 'admin' },
      { path: '/api/admin/users/{id}/toggle-verify', method: 'put', customRole: 'admin' },
      { path: '/api/admin/users/{id}/toggle-block', method: 'put', customRole: 'admin' },
      { path: '/api/admin/jobs', method: 'get', customRole: 'admin' },
      { path: '/api/admin/jobs', method: 'post', customRole: 'admin' },
      { path: '/api/admin/jobs/{id}', method: 'delete', customRole: 'admin' },
      { path: '/api/admin/locations', method: 'get', customRole: 'admin' },
      { path: '/api/admin/features', method: 'get', customRole: 'admin' },
      { path: '/api/admin/features', method: 'put', customRole: 'admin', customBody: { webrtcCalling: true, instantOtp: true, smartCommute: true, aiMatching: true } },
      { path: '/api/admin/broadcast', method: 'post', customRole: 'admin' }
    ]
  }
];

// Helper to look up an operation in Swagger
function findOperation(pathUrl, method) {
  if (swagger.paths[pathUrl] && swagger.paths[pathUrl][method.toLowerCase()]) {
    return swagger.paths[pathUrl][method.toLowerCase()];
  }
  return null;
}

// Write each step-by-step Postman collection
console.log('📦 Generating Step-by-Step Postman Collections...');

steps.forEach((step, index) => {
  const collection = {
    info: {
      _postman_id: uuid(),
      name: `JobScout - ${step.name}`,
      description: `${step.description}\n\nEnvironment Variables Used:\n- \`{{baseUrl}}\`: Base server URL\n- \`{{token}}\`: Active JWT session token\n- \`{{jobId}}\`: Target Job identifier\n- \`{{applicationId}}\`: Target Job Application identifier`,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: []
  };

  step.routes.forEach(route => {
    let op = findOperation(route.path, route.method);
    if (!op) {
      op = {
        summary: route.customName || `${route.method.toUpperCase()} ${route.path}`,
        description: `Endpoint for ${route.path}`
      };
    }

    const item = createPostmanItem(route.path, route.method, op, route.customRole);

    if (route.customName) {
      item.name = route.customName;
    }
    if (route.customBody) {
      item.request.body = {
        mode: 'raw',
        raw: JSON.stringify(route.customBody, null, 2),
        options: { raw: { language: 'json' } }
      };
    }

    collection.item.push(item);
  });

  const filePath = path.join(outputDir, step.fileName);
  fs.writeFileSync(filePath, JSON.stringify(collection, null, 2), 'utf8');
  console.log(`  ✅ [Step ${index + 1}/7] Created ${step.fileName} (${collection.item.length} requests)`);
});

// -------------------------------------------------------------
// GENERATE POSTMAN ENVIRONMENTS
// -------------------------------------------------------------
const localEnv = {
  id: uuid(),
  name: 'JobScout (Local Environment)',
  values: [
    { key: 'baseUrl', value: 'http://localhost:5000', type: 'default', enabled: true },
    { key: 'token', value: '', type: 'secret', enabled: true },
    { key: 'seekerToken', value: '', type: 'secret', enabled: true },
    { key: 'employerToken', value: '', type: 'secret', enabled: true },
    { key: 'adminToken', value: '', type: 'secret', enabled: true },
    { key: 'seekerId', value: '', type: 'default', enabled: true },
    { key: 'employerId', value: '', type: 'default', enabled: true },
    { key: 'adminId', value: '', type: 'default', enabled: true },
    { key: 'otherUserId', value: '', type: 'default', enabled: true },
    { key: 'userId', value: '', type: 'default', enabled: true },
    { key: 'jobId', value: '', type: 'default', enabled: true },
    { key: 'applicationId', value: '', type: 'default', enabled: true },
    { key: 'postId', value: '', type: 'default', enabled: true },
    { key: 'anonId', value: '', type: 'default', enabled: true },
    { key: 'phone', value: '9876543210', type: 'default', enabled: true },
    { key: 'id', value: '', type: 'default', enabled: true }
  ],
  _postman_variable_scope: 'environment'
};

const prodEnv = {
  id: uuid(),
  name: 'JobScout (Production Cloud)',
  values: [
    { key: 'baseUrl', value: 'https://jobscout.onrender.com', type: 'default', enabled: true },
    { key: 'token', value: '', type: 'secret', enabled: true },
    { key: 'seekerToken', value: '', type: 'secret', enabled: true },
    { key: 'employerToken', value: '', type: 'secret', enabled: true },
    { key: 'adminToken', value: '', type: 'secret', enabled: true },
    { key: 'seekerId', value: '', type: 'default', enabled: true },
    { key: 'employerId', value: '', type: 'default', enabled: true },
    { key: 'adminId', value: '', type: 'default', enabled: true },
    { key: 'otherUserId', value: '', type: 'default', enabled: true },
    { key: 'userId', value: '', type: 'default', enabled: true },
    { key: 'jobId', value: '', type: 'default', enabled: true },
    { key: 'applicationId', value: '', type: 'default', enabled: true },
    { key: 'postId', value: '', type: 'default', enabled: true },
    { key: 'anonId', value: '', type: 'default', enabled: true },
    { key: 'phone', value: '9876543210', type: 'default', enabled: true },
    { key: 'id', value: '', type: 'default', enabled: true }
  ],
  _postman_variable_scope: 'environment'
};

fs.writeFileSync(path.join(outputDir, 'JobScout-Local.postman_environment.json'), JSON.stringify(localEnv, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'JobScout-Production.postman_environment.json'), JSON.stringify(prodEnv, null, 2), 'utf8');
console.log('  ✅ Created JobScout-Local.postman_environment.json');
console.log('  ✅ Created JobScout-Production.postman_environment.json');

// -------------------------------------------------------------
// GENERATE ALL-IN-ONE COMBINED COLLECTION
// -------------------------------------------------------------
const allCollection = {
  info: {
    _postman_id: uuid(),
    name: 'JobScout & JobRadar - Complete Platform API',
    description: 'Complete API reference collection for JobScout covering all 54 endpoints across 11 modules: System, Authentication, Jobs, Applications, Messaging, Social Feed, Professional Network, Anonymous Salon, Alerts, Administration, and Email Settings.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: []
};

steps.forEach(s => {
  const stepFile = JSON.parse(fs.readFileSync(path.join(outputDir, s.fileName), 'utf8'));
  allCollection.item.push({
    name: s.name,
    description: s.description,
    item: stepFile.item
  });
});

fs.writeFileSync(path.join(outputDir, 'JobScout-All-Endpoints.postman_collection.json'), JSON.stringify(allCollection, null, 2), 'utf8');
console.log('  ✅ Created JobScout-All-Endpoints.postman_collection.json');

// -------------------------------------------------------------
// GENERATE DOCUMENTATION README.md
// -------------------------------------------------------------
const readmeContent = `# 🚀 JobScout Step-by-Step Postman Collection Suite

This folder contains a complete, automated, modular Postman collection suite organized in chronological steps for testing every feature of the JobScout Fullstack Platform.

---

## 📂 File Index

| Step | Collection File | Description | Requests |
| :--- | :--- | :--- | :---: |
| **01** | \`JobScout-01-Auth-Signup-Login.postman_collection.json\` | System health check, phone OTP, seeker/employer onboarding, password login, profile, and geolocation. | 12 |
| **02** | \`JobScout-02-Job-Seeker-Workflow.postman_collection.json\` | Geospatial job search, AI match score, recommendations, bookmarks, applications, and offer acceptance. | 10 |
| **03** | \`JobScout-03-Employer-Workflow.postman_collection.json\` | Posting jobs, browsing seekers on radar, reviewing ATS candidates, status updates, and issuing offer letters. | 6 |
| **04** | \`JobScout-04-Messaging-and-Networking.postman_collection.json\` | In-app direct chat, conversation history, unread counts, network profiles, and skill endorsements. | 7 |
| **05** | \`JobScout-05-Community-and-Anonymous-Salon.postman_collection.json\` | Community feed posts, likes, comments, and anonymous workplace discussions with voting. | 7 |
| **06** | \`JobScout-06-Multi-Channel-Alerts.postman_collection.json\` | Instant WhatsApp link generation, Telegram notifications, alert settings, and SMTP configuration. | 6 |
| **07** | \`JobScout-07-Master-Admin-Console.postman_collection.json\` | Master administrator metrics, user moderation, verification badges, job controls, feature flags, and broadcasts. | 13 |
| **ALL** | \`JobScout-All-Endpoints.postman_collection.json\` | Complete all-in-one collection with all 7 modules combined. | 61 |

---

## 🌐 Environments

- **\`JobScout-Local.postman_environment.json\`**: Target \`http://localhost:5000\`
- **\`JobScout-Production.postman_environment.json\`**: Target \`https://jobscout.onrender.com\`

---

## ⚡ How to Import & Use

1. **Open Postman** and click **Import** in the top left.
2. Select all files in this folder (\`docs/postman/\`) and click **Import**.
3. In the top-right environment selector, choose **JobScout (Local Environment)**.
4. Run requests in sequential order (**Step 1 ➔ Step 7**).

### 🔄 Automatic Variable Chaining
- Login/Register requests automatically extract and save the JWT token to \`{{token}}\`, \`{{seekerToken}}\`, \`{{employerToken}}\`, or \`{{adminToken}}\`.
- Job creation automatically captures and saves \`{{jobId}}\`.
- Application submission automatically captures and saves \`{{applicationId}}\`.
- Post creation saves \`{{postId}}\`, and Anon discussions save \`{{anonId}}\`.

No manual copying and pasting of tokens or IDs is required!
`;

fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent, 'utf8');
console.log('  ✅ Created docs/postman/README.md guide');

console.log('🎉 All Step-by-Step Postman collections generated successfully in docs/postman/');
