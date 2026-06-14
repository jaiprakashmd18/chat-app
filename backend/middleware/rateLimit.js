const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });

const generalLimiter = createLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  parseInt(process.env.RATE_LIMIT_MAX || 100),
  'Too many requests, please try again later'
);

const authLimiter = createLimiter(15 * 60 * 1000, 10, 'Too many auth attempts, please try again in 15 minutes');

const messageLimiter = createLimiter(60 * 1000, 60, 'Too many messages, please slow down');

const uploadLimiter = createLimiter(60 * 60 * 1000, 50, 'Upload limit reached, please try again later');

module.exports = { generalLimiter, authLimiter, messageLimiter, uploadLimiter };
