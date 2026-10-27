import { AppError } from '../utils/AppError.js';

/**
 * Global 404 handler for unmapped API routes
 */
export const notFoundHandler = (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(AppError.notFound(`API endpoint not found: [${req.method}] ${req.originalUrl}`));
  }
  next();
};

/**
 * Centralized Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');
  const message = err.message || 'An unexpected server error occurred';

  // Log server errors for observability
  if (statusCode >= 500) {
    console.error(`🚨 [SERVER ERROR ${statusCode}] [${req.method}] ${req.originalUrl}:`, err);
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn(`⚠️ [API WARN ${statusCode}] [${req.method}] ${req.originalUrl}: ${message}`);
  }

  // Consistent Enterprise JSON Envelope
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {}),
      ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {})
    }
  });
};
