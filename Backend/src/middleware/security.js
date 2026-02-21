const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Limits each IP to 100 requests per 15 minutes
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: "Too many requests, please try again later."
});

// Hardens headers
exports.securityHeaders = helmet();