/**
 * Lightweight HTTP Request Performance & Access Logger Middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Hook into response finish event
  res.on('finish', () => {
    // Only log API routes and ignore static assets
    if (!req.originalUrl.startsWith('/api')) return;

    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 500 ? '🔴' : status >= 400 ? '🟡' : '🟢';

    if (process.env.NODE_ENV !== 'test') {
      console.log(`${statusColor} [${req.method}] ${req.originalUrl} -> ${status} (${duration}ms)`);
    }
  });

  next();
};
