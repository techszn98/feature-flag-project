const app = require('./app');
const connectDB = require('./config/database');
const { port } = require('./config/env');

const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/api/v1`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();