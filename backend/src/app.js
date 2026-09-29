const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const qs = require("qs");
const runtimeConfig = require("./config/env");
const {
  apiLimiter,
  appAuthLimiter,
} = require("./middleware/rateLimit.middleware");

const { cleanValue, dedupeArrays } = require("./utils/sanitize");
const authRoutes = require("./modules/auth/auth.routes");
const projectRoutes = require("./modules/project/project.route");
const googleRoutes = require("./modules/google-auth/google.routes");
const flagRoutes = require("./modules/flags/flag.routes");
const identityRoutes = require("./modules/identities/identity.routes");
const evaluationRoutes = require("./modules/evaluation/evaluation.routes");

const notFound = require("./middleware/notFound.middleware");
const { errorHandler } = require("./middleware/error.middleware");
const environmentRoutes = require("./modules/environments/environment.routes");
const keyRoutes = require("./modules/environment-keys/key.routes");

const app = express();
const isTest = runtimeConfig.nodeEnv === "test";

if (runtimeConfig.nodeEnv === "production") app.set("trust proxy", 1);

// Replaces Express's default query parser with one that sanitizes and
// de-duplicates as it parses. This must be set before any routes are used,
// because Express 5 makes req.query read-only after the fact.
app.set("query parser", (str) => dedupeArrays(cleanValue(qs.parse(str))));

app.use(helmet());
app.use(
  cors({
    origin: runtimeConfig.app.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" }));

// Sanitize the body the same way (body is a normal, reassignable property)
app.use((req, res, next) => {
  if (req.body) req.body = cleanValue(req.body);
  next();
});

app.use("/api", apiLimiter);
app.use("/api/v1/auth", appAuthLimiter);

app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, message: "API is running", data: null });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/google-auth", googleRoutes); // Add this line to include Google routes
// nested under a project
app.use("/api/v1/projects/:projectId/environments", environmentRoutes);

// direct access + keys
app.use("/api/v1/environments", environmentRoutes);
app.use("/api/v1/environments/:id/keys", keyRoutes);
app.use("/api/v1/flags", flagRoutes);
app.use("/api/v1/identities", identityRoutes);
app.use("/api/v1/evaluate", evaluationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
