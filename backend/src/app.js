const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');
const projectRoutes = require('./modules/project/project.route');
const notFound = require('./middleware/notFound.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const googleRoutes = require('./modules/google-auth/google.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'API is running', data: null });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/google-auth', googleRoutes); // Add this line to include Google routes

app.use(notFound);
app.use(errorHandler);

module.exports = app;