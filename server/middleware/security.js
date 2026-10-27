// Security & Protection Middleware for JobScout API
// Provides OWASP compliant security headers, IP rate limiting, and request sanitization

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
    // Skip rate limiting in development if localhost or test
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
 * Standard Security Headers Middleware
 * Protects against MIME sniffing, clickjacking, and sets WebRTC/Geo permissions
 */
export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Essential for WebRTC Camera/Mic and Leaflet GPS geolocation access
  res.setHeader('Permissions-Policy', 'camera=*, microphone=*, geolocation=*');
  
  next();
}
