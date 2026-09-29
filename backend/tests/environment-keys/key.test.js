require("../setup-env");

const { test, before, after, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const EnvironmentKey = require("../../src/modules/environment-keys/key.model");
const Environment = require("../../src/modules/environments/environment.model");
const Project = require("../../src/modules/project/project.model");
const keyService = require("../../src/modules/environment-keys/key.service");

let mongod;
let environment;
let otherEnvironment;
let userId;

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await EnvironmentKey.syncIndexes();
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

beforeEach(async () => {
  userId = new mongoose.Types.ObjectId();
  const project = await Project.create({
    ownerId: userId,
    name: "Key Test Project",
    slug: "key-test-project",
  });
  [environment, otherEnvironment] = await Promise.all([
    Environment.create({
      projectId: project._id,
      name: "Production",
      type: "production",
      createdBy: userId,
    }),
    Environment.create({
      projectId: project._id,
      name: "Staging",
      type: "staging",
      createdBy: userId,
    }),
  ]);
});

test("createKey returns the raw key once, and saves only the hash", async () => {
  const { keyDoc, rawKey } = await keyService.createKey({
    environmentId: environment._id,
    label: "My Test Key",
    userId,
  });

  assert.ok(rawKey, "rawKey should be returned to the caller");
  assert.ok(keyDoc.hashedKey, "hashedKey should be saved on the document");
  assert.notEqual(rawKey, keyDoc.hashedKey, "raw and hashed must differ");
  assert.equal(keyDoc.label, "My Test Key");
  assert.equal(keyDoc.revoked, false);
});

test("listKeys never includes the hashedKey field", async () => {
  await keyService.createKey({
    environmentId: environment._id,
    label: "Key A",
    userId,
  });

  const keys = await keyService.listKeys(environment._id, userId);

  assert.equal(keys.length, 1);
  assert.equal(
    keys[0].hashedKey,
    undefined,
    "hashedKey must never leak in a list response",
  );
  assert.ok(keys[0].keyPreview, "keyPreview should still be visible");
});

test("revokeKey marks a key as revoked", async () => {
  const { keyDoc } = await keyService.createKey({
    environmentId: environment._id,
    label: "Key to revoke",
    userId,
  });

  const revoked = await keyService.revokeKey(
    environment._id,
    keyDoc._id,
    userId,
  );

  assert.equal(revoked.revoked, true);
});

test("revokeKey returns null for a key that does not belong to that environment", async () => {
  const { keyDoc } = await keyService.createKey({
    environmentId: environment._id,
    label: "Key A",
    userId,
  });

  const result = await keyService.revokeKey(
    otherEnvironment._id,
    keyDoc._id,
    userId,
  );

  // Proves a key can't be revoked through the wrong environment —
  assert.equal(result, null);
});
