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
import { setupSocket } from './socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration for REST & WebSockets
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

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
    time: new Date().toISOString(),
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

// Error Handling
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 JobRadar Server listening on port ${PORT}`);
  console.log(`📡 WebSocket & WebRTC Signaling active`);
  console.log(`🌐 Base API: http://localhost:${PORT}/api`);
  console.log(`=============================================`);
});
