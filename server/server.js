import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import jobsRoutes from './routes/jobs.js';
import applicationsRoutes from './routes/applications.js';
import messagesRoutes from './routes/messages.js';
import postsRoutes from './routes/posts.js';
import networkRoutes from './routes/network.js';
import anonRoutes from './routes/anon.js';
import alertsRoutes from './routes/alerts.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import aiRoutes from './routes/ai.js';
import { setupSocket } from './socket.js';
import { db } from './db.js';
import { verifyEmailConfig } from './email.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { securityHeaders, rateLimiter, xssSanitizer } from './middleware/security.js';
import { authenticateToken } from './routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Dynamic CORS configuration for REST & WebSockets
const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  ...(clientUrl ? clientUrl.split(',').map(s => s.trim()) : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || !clientUrl || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Secure body parser with strict size limits to prevent payload flooding / DoS attacks
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Deep recursive XSS & script injection sanitizer across all incoming payloads
app.use(xssSanitizer);

// Security headers (OWASP protection against clickjacking, sniffing, XSS, and CSP)
app.use(securityHeaders);

// Performance & Request observability logger
app.use(requestLogger);

// Global API rate limiter (600 requests per 15 minutes per IP)
app.use('/api', rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: 'Too many requests to JobScout API. Please wait a moment before trying again.'
}));

// Socket.IO Setup with Multi-Node Clustering support
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Configure Multi-Node Redis Adapter if REDIS_URL or REDIS_HOST is provided
if (process.env.REDIS_URL || process.env.REDIS_HOST) {
  try {
    const { createAdapter } = await import('@socket.io/redis-adapter');
    const { createClient } = await import('redis');
    const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`;
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    pubClient.on('error', (err) => console.warn('⚠️ Redis Pub Client Error:', err.message));
    subClient.on('error', (err) => console.warn('⚠️ Redis Sub Client Error:', err.message));

    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log('🚀 Redis Multi-Node WebSocket Clustering Adapter Connected!');
  } catch (err) {
    console.warn('⚠️ Redis Adapter setup failed, defaulting to in-memory adapter:', err.message);
  }
}

// Connect to MongoDB Atlas if MONGODB_URI is provided
if (process.env.MONGODB_URI) {
  db.connectMongo().catch(err => {
    console.warn('⚠️ MongoDB Atlas initialization warning:', err.message);
  });
}

setupSocket(io);

// Attach Socket.IO to req for real-time broadcasts in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Swagger UI Interactive API Documentation
const swaggerDocPath = path.join(__dirname, 'docs/swagger.json');
if (fs.existsSync(swaggerDocPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerDocPath, 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'JobScout & JobRadar API Explorer',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true
    }
  }));
  app.get('/api/swagger.json', (req, res) => res.json(swaggerDocument));
}

// API Root overview
app.get('/api', (req, res) => {
  res.json({
    name: 'JobScout Platform API',
    status: 'online',
    version: '1.0.0',
    service: 'JobRadar Backend API',
    documentation: '/api-docs',
    swaggerSpec: '/api/swagger.json',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      messages: '/api/messages',
      posts: '/api/posts',
      network: '/api/network',
      anon: '/api/anon',
      alerts: '/api/alerts',
      admin: '/api/admin'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'JobRadar Backend API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/anon', anonRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

// Static uploads directory (supports local disk media storage)
const uploadsDirPath = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDirPath)) {
  fs.mkdirSync(uploadsDirPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsDirPath));

// Database Engine Health & Topology
app.get('/api/health/db', (req, res) => {
  res.json({
    success: true,
    ...db.getHealth(),
    timestamp: new Date().toISOString()
  });
});

// Mobile App Download Endpoints (APK Package & Info)
const serverApkPath = path.resolve(__dirname, 'public/downloads/jobscout-mobile.apk');
const clientApkPath = path.resolve(__dirname, '../client/public/downloads/jobscout-mobile.apk');

const handleApkDownload = (req, res) => {
  const filePath = fs.existsSync(serverApkPath) ? serverApkPath : clientApkPath;
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'JobScout Mobile APK build not found. Please build or generate the APK package.' });
  }

  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': 'application/vnd.android.package-archive',
    'Content-Disposition': 'attachment; filename="jobscout-mobile.apk"',
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache'
  });
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
};

app.get('/download/jobscout-mobile.apk', handleApkDownload);
app.get('/downloads/jobscout-mobile.apk', handleApkDownload);
app.get('/download/app', handleApkDownload);
app.get('/api/download/jobscout-mobile.apk', handleApkDownload);

// Android Studio Project ZIP Download Endpoints
const serverZipPath = path.resolve(__dirname, 'public/downloads/jobscout-android-project.zip');
const clientZipPath = path.resolve(__dirname, '../client/public/downloads/jobscout-android-project.zip');

const handleProjectZipDownload = (req, res) => {
  const filePath = fs.existsSync(serverZipPath) ? serverZipPath : clientZipPath;
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'JobScout Android Studio project ZIP not found.' });
  }

  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-Disposition': 'attachment; filename="jobscout-android-project.zip"',
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache'
  });
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
};

app.get('/download/jobscout-android-project.zip', handleProjectZipDownload);
app.get('/downloads/jobscout-android-project.zip', handleProjectZipDownload);
app.get('/api/download/jobscout-android-project.zip', handleProjectZipDownload);

app.get('/api/app-info', (req, res) => {
  const filePath = fs.existsSync(serverApkPath) ? serverApkPath : clientApkPath;
  const sizeMb = fs.existsSync(filePath) ? (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2) : '5.07';
  res.json({
    appName: 'JobScout',
    version: '1.0.0',
    platform: 'Android APK & Progressive Web App',
    apkUrl: '/download/jobscout-mobile.apk',
    packageSize: `${sizeMb} MB`,
    minAndroidVersion: 'Android 7.0 or higher',
    features: [
      'Live Geospatial Job Radar & GPS Tracking',
      '1-Tap WebRTC Speed Connect Video & Voice Calling',
      'Real-Time In-App Messaging & WhatsApp Alerts',
      'ATS Harvard Digital Resume & Appointment Letters',
      '100% Real-Time Cloud Sync with Web Platform'
    ]
  });
});

// Email Sender Settings Endpoints
app.get('/api/settings/email', (req, res) => {
  const cfg = db.getEmailConfig();
  const isConfigured = Boolean(
    (cfg.gmailUser && cfg.gmailPass) ||
    (cfg.smtpHost && cfg.smtpUser && cfg.smtpPass)
  );
  res.json({
    configured: isConfigured,
    senderEmail: cfg.gmailUser || cfg.smtpUser || cfg.emailFrom || '',
    serviceType: cfg.gmailUser ? 'Gmail' : cfg.smtpHost ? 'Custom SMTP' : 'Not Configured (Simulation Mode)'
  });
});

app.post('/api/settings/email', authenticateToken, async (req, res, next) => {
  const { gmailUser, gmailPass, smtpHost, smtpPort, smtpUser, smtpPass, emailFrom } = req.body;

  try {
    if ((gmailUser && gmailPass) || (smtpHost && smtpUser && smtpPass)) {
      await verifyEmailConfig({
        gmailUser,
        gmailPass,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass
      });
    }

    const saved = db.saveEmailConfig({
      gmailUser: (gmailUser || '').trim(),
      gmailPass: (gmailPass || '').trim(),
      smtpHost: (smtpHost || '').trim(),
      smtpPort: smtpPort || '',
      smtpUser: (smtpUser || '').trim(),
      smtpPass: (smtpPass || '').trim(),
      emailFrom: (emailFrom || '').trim()
    });

    res.json({
      success: true,
      message: 'Email sender successfully connected and verified! Real emails will now be delivered directly to inboxes.',
      configured: Boolean((saved.gmailUser && saved.gmailPass) || (saved.smtpHost && saved.smtpUser && saved.smtpPass))
    });
  } catch (err) {
    next(err);
  }
});

// Serve built React client in production if client/dist exists (Fullstack single-service deployment)
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving static client from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 handler for API routes
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 JobRadar Server listening on port ${PORT}`);
  console.log(`📡 WebSocket & WebRTC Signaling active`);
  console.log(`🌐 Base API: http://localhost:${PORT}/api`);
  console.log(`📑 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`=============================================`);
});

// Graceful Process Lifecycle & Shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  io.close(() => {
    console.log('📡 WebRTC & Socket.IO connections closed.');
  });
  server.close(() => {
    console.log('🌐 HTTP Server closed cleanly.');
    process.exit(0);
  });

  // Force shutdown after 10s timeout if hung
  setTimeout(() => {
    console.error('⚠️ Forcing process exit after shutdown timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
