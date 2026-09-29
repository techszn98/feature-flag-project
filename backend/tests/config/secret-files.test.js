require("../setup-env");

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { readEnv } = require("../../src/config/env");

test("readEnv prefers a mounted secret file and trims its trailing newline", () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "feature-flag-secret-"),
  );
  const secretPath = path.join(directory, "jwt-secret");
  const previousFile = process.env.JWT_SECRET_FILE;

  try {
    fs.writeFileSync(secretPath, "mounted-secret\n", { mode: 0o600 });
    process.env.JWT_SECRET_FILE = secretPath;
    assert.equal(readEnv("JWT_SECRET"), "mounted-secret");
  } finally {
    if (previousFile === undefined) delete process.env.JWT_SECRET_FILE;
    else process.env.JWT_SECRET_FILE = previousFile;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("readEnv reports a missing secret file without including its path", () => {
  const previousFile = process.env.JWT_SECRET_FILE;
  const missingPath = path.join(os.tmpdir(), "missing-feature-flag-secret");

  try {
    process.env.JWT_SECRET_FILE = missingPath;
    assert.throws(readEnv.bind(null, "JWT_SECRET"), {
      message: "JWT_SECRET_FILE points to an unreadable secret file",
    });
  } finally {
    if (previousFile === undefined) delete process.env.JWT_SECRET_FILE;
    else process.env.JWT_SECRET_FILE = previousFile;
  }
});
