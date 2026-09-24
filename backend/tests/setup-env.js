// Set before src/config/env.js loads so tests never read the real .env values.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGO_URI = 'mongodb://placeholder-overridden-by-memory-server';
