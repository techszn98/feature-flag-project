const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const authRoutes = require('./modules/auth/auth.routes');
const notFound = require('./middleware/notFound.middleware');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 3. Body parser with limit
app.use(express.json({ limit: '10kb' }));

// 4. NoSQL injection protection
app.use(mongoSanitize());

// 5. XSS protection
app.use(xss());

// 6. Prevent HTTP param pollution
app.use(hpp());

// 7. Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

// 8. Stricter rate limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts' }
});
app.use('/api/v1/auth', authLimiter);

// Routes
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'API is running', data: null });
});

app.use('/api/v1/auth', authRoutes);

// 9. 404 handler
app.use(notFound);
// 10. Global error handler
app.use(errorHandler);

module.exports = app;