const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');
const notFound = require('./middleware/notFound.middleware');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'API is running', data: null });
});

app.use('/api/v1/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;