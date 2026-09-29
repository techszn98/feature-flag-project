const { port } = require("./config/env");
const { connectRateLimitStore } = require("./config/redis");
const connectDB = require("./config/database");
const app = require("./app");

const start = async () => {
  try {
    await connectDB();
    await connectRateLimitStore();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/api/v1`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();
