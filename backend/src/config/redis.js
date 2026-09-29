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
      tls: process.env.REDIS_TLS === "true",
    },
    password,
  });
  client.on("error", (error) => {
    console.error("[Redis] Rate-limit store error:", error.message);
  });
}

const createRateLimitStore = (prefix) => {
  if (!client) return undefined;
  return new RedisStore({
    prefix: `feature-flag-api:${prefix}:`,
    sendCommand: (...args) => client.sendCommand(args),
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
