const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const qs = require('qs');
const rateLimit = require('express-rate-limit');

const { cleanValue, dedupeArrays } = require('./utils/sanitize');
const authRoutes = require('./modules/auth/auth.routes');
const projectRoutes = require('./modules/project/project.route');
const googleRoutes = require('./modules/google-auth/google.routes');

const notFound = require('./middleware/notFound.middleware');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Replaces Express's default query parser with one that sanitizes and
// de-duplicates as it parses. This must be set before any routes are used,
// because Express 5 makes req.query read-only after the fact.
app.set('query parser', (str) => dedupeArrays(cleanValue(qs.parse(str))));

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// Sanitize the body the same way (body is a normal, reassignable property)
app.use((req, res, next) => {
  if (req.body) req.body = cleanValue(req.body);
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts' },
});
app.use('/api/v1/auth', authLimiter);

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'API is running', data: null });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/google-auth', googleRoutes); // Add this line to include Google routes


app.use(notFound);
app.use(errorHandler);

module.exports = app;