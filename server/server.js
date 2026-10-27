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
import { setupSocket } from './socket.js';
import { db } from './db.js';
import { verifyEmailConfig } from './email.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { securityHeaders, rateLimiter } from './middleware/security.js';

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

app.use(express.json());

// Security headers (OWASP protection against clickjacking, sniffing, XSS)
app.use(securityHeaders);

// Performance & Request observability logger
app.use(requestLogger);

// Global API rate limiter (600 requests per 15 minutes per IP)
app.use('/api', rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: 'Too many requests to JobScout API. Please wait a moment before trying again.'
}));

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocket(io);

// Attach Socket.IO to req for real-time broadcasts in routes
app.use((req, res, next) => {
  req.io = io;
  next();
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

app.post('/api/settings/email', async (req, res, next) => {
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
