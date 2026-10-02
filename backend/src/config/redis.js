const { createClient } = require("redis");
const { RedisStore } = require("rate-limit-redis");
const { nodeEnv, readEnv } = require("./env");

const isProduction = nodeEnv === "production";
let client = null;

if (isProduction) {
  const password = readEnv("REDIS_PASSWORD");
  if (!process.env.REDIS_HOST || !password) {
    throw new Error(
      "Production rate limiting requires REDIS_HOST and REDIS_PASSWORD",
    );
  }

  client = createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT || 6379),
      // CRITICAL: Upstash requires TLS (SSL) outside its network. 
      // Ensure REDIS_TLS=true is set in Render variables, or default it to true if isProduction.
      tls: process.env.REDIS_TLS === "true" || true, 
    },
    password,
  });

  client.on("error", (error) => {
    console.error("[Redis] Rate-limit store error:", error.message);
  });

  // Connect immediately so the client is ready before middleware uses it
  client.connect().catch((err) => {
    console.error("[Redis] Initial connection failed:", err.message);
  });
}

const createRateLimitStore = (prefix) => {
  if (!client) return undefined;
  return new RedisStore({
    prefix: `feature-flag-api:${prefix}:`,
    // Safely execute commands only if the client is active
    sendCommand: async (...args) => {
      if (!client.isOpen) {
        await client.connect();
      }
      return client.sendCommand(args);
    },
  });
};

const connectRateLimitStore = async () => {
  if (client && !client.isOpen) await client.connect();
};

const closeRateLimitStore = async () => {
  if (client?.isOpen) await client.quit();
};

module.exports = {
  createRateLimitStore,
  connectRateLimitStore,
  closeRateLimitStore,
};
