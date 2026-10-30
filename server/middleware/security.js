// Security & Protection Middleware for JobScout Platform
// Provides OWASP compliant security headers, Content Security Policy (CSP),
// IP sliding-window rate limiting, and recursive XSS payload sanitization.

const ipRequestMap = new Map();

// Periodic cleanup of stale rate-limit counters every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of ipRequestMap.entries()) {
    if (now > data.resetTime) {
      ipRequestMap.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

/**
 * Lightweight in-memory Sliding Window Rate Limiter
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default 15 mins)
 * @param {number} options.max - Max allowed requests per window (default 300)
 * @param {string} options.message - Error message when limit is exceeded
 */
export function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const max = options.max || 300;
  const message = options.message || 'Too many requests from this IP, please try again later.';

  return (req, res, next) => {
    // Skip rate limiting in test suite if requested
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const routePrefix = options.keyPrefix ? `:${options.keyPrefix}` : '';
    const mapKey = `${ip}${routePrefix}`;
    const now = Date.now();

    let clientRecord = ipRequestMap.get(mapKey);

    if (!clientRecord || now > clientRecord.resetTime) {
      clientRecord = {
        count: 1,
        resetTime: now + windowMs
      };
      ipRequestMap.set(mapKey, clientRecord);
    } else {
      clientRecord.count++;
    }

    const remaining = Math.max(0, max - clientRecord.count);
    const resetSeconds = Math.ceil((clientRecord.resetTime - now) / 1000);

    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (clientRecord.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: message,
        retryAfterSeconds: resetSeconds
      });
    }

    next();
  };
}

/**
 * Advanced OWASP Security Headers Middleware
 * Protects against MIME sniffing, clickjacking, XSS, and unauthorized external framing
 */
export function securityHeaders(req, res, next) {
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Protect against clickjacking (embedding in hidden iframes)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Cross-site scripting legacy filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer header privacy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cross-Origin policies (allows safe external navigation like WhatsApp wa.me links)
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  // Essential for WebRTC Camera/Mic and Leaflet GPS geolocation access
  res.setHeader('Permissions-Policy', 'camera=*, microphone=*, geolocation=*');

  // Strict Transport Security (HSTS) in production or HTTPS environments
  if (process.env.NODE_ENV === 'production' || req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Content Security Policy (CSP): Strict origin isolation while permitting map tiles, fonts & sockets
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://fonts.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.tile.osm.org https://api.dicebear.com https://unpkg.com https://images.unsplash.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' ws: wss: http://localhost:5000 http://127.0.0.1:5000 ws://localhost:5000 ws://127.0.0.1:5000 http://localhost:5173 ws://localhost:5173 https://api.dicebear.com https://unpkg.com",
    "media-src 'self' blob: data:",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; '));

  next();
}

/**
 * Deep Recursive XSS & Injection Sanitizer
 * Strips script tags, javascript: pseudo-protocols, and malicious inline event handlers
 * from req.body, req.query, and req.params before passing to controllers.
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    // Strip <script>...</script>
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Strip javascript: URLs
    .replace(/javascript:[^\s"'>]*/gi, '')
    // Strip inline event attributes like onerror=, onload=, onclick=
    .replace(/\s*on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // Strip dangerous iframe / embed / object tags
    .replace(/<\/?(?:iframe|object|embed|applet)\b[^>]*>/gi, '')
    .trim();
}

function sanitizeRecursive(obj) {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeRecursive(item));
  }
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    // Avoid prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    clean[key] = sanitizeRecursive(val);
  }
  return clean;
}

export function xssSanitizer(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeRecursive(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeRecursive(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeRecursive(req.params);
  }
  next();
}

/**
 * Lightweight cookie parser for HttpOnly session tokens
 */
export function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts.shift().trim();
    const value = decodeURIComponent(parts.join('='));
    if (name) list[name] = value;
  });
  return list;
}
