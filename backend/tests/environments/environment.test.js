const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
require("dotenv").config();

const Environment = require("../../src/modules/environments/environment.model");
const EnvironmentKey = require("../../src/modules/environment-keys/key.model");
const Flag = require("../../src/modules/flags/flag.model");
const Identity = require("../../src/modules/identities/identity.model");
const Project = require("../../src/modules/project/project.model");
const environmentService = require("../../src/modules/environments/environment.service");

// Fake ids standing in for a Project and a User, since this test ends in environment
const fakeProjectId = new mongoose.Types.ObjectId();
const fakeUserId = new mongoose.Types.ObjectId();

before(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Project.create({
    _id: fakeProjectId,
    ownerId: fakeUserId,
    name: "Environment Test Project",
    slug: "environment-test-project",
  });
});

after(async () => {
  await mongoose.connection.close();
});

// Clean the slate before every single test, so tests don't affect each other.
beforeEach(async () => {
  await Environment.deleteMany({ projectId: fakeProjectId });
});

test("createEnvironment saves a new environment", async () => {
  const env = await environmentService.createEnvironment({
    projectId: fakeProjectId,
    name: "Dev Server",
    type: "development",
    userId: fakeUserId,
  });

  assert.equal(env.name, "Dev Server");
  assert.equal(env.type, "development");
  assert.equal(String(env.projectId), String(fakeProjectId));
});

test("listEnvironments returns only environments for that project", async () => {
  await environmentService.createEnvironment({
    projectId: fakeProjectId,
    name: "Staging Server",
    type: "staging",
    userId: fakeUserId,
  });

  const list = await environmentService.listEnvironments(
    fakeProjectId,
    fakeUserId,
  );

  assert.equal(list.length, 1);
  assert.equal(list[0].type, "staging");
});

test("a project cannot have two environments of the same type", async () => {
  await environmentService.createEnvironment({
    projectId: fakeProjectId,
    name: "Prod 1",
    type: "production",
    userId: fakeUserId,
  });

  // Second "production" for the same project should fail —
  // this is the unique index rule from environment.model.js.
  await assert.rejects(
    environmentService.createEnvironment({
      projectId: fakeProjectId,
      name: "Prod 2",
      type: "production",
      userId: fakeUserId,
    }),
  );
});

test("updateEnvironment changes the name", async () => {
  const env = await environmentService.createEnvironment({
    projectId: fakeProjectId,
    name: "Old Name",
    type: "development",
    userId: fakeUserId,
  });

  const updated = await environmentService.updateEnvironment(
    env._id,
    { name: "New Name" },
    fakeUserId,
  );

  assert.equal(updated.name, "New Name");
});

test("deleteEnvironment removes it from the database", async () => {
  const env = await environmentService.createEnvironment({
    projectId: fakeProjectId,
    name: "To Delete",
    type: "staging",
    userId: fakeUserId,
  });

  await environmentService.deleteEnvironment(env._id, fakeUserId);

  const found = await environmentService.getEnvironmentById(
    env._id,
    fakeUserId,
  );
  assert.equal(found, null);
});

test("deleteEnvironment cascades keys, flags, and identities", async () => {
  const env = await environmentService.createEnvironment({
    projectId: fakeProjectId,
    name: "Environment With Resources",
    type: "staging",
    userId: fakeUserId,
  });
  await EnvironmentKey.create({
    environmentId: env._id,
    hashedKey: "key-hash",
    keyPreview: "fk_preview",
    createdBy: fakeUserId,
  });
  await Flag.create({
    ownerId: fakeUserId,
    environmentId: env._id,
    name: "checkout",
    enabled: true,
  });
  await Identity.create({
    environmentId: env._id,
    identifier: "user_1",
    traits: { plan: "premium" },
  });

  await environmentService.deleteEnvironment(env._id, fakeUserId);

  assert.equal(
    await EnvironmentKey.countDocuments({ environmentId: env._id }),
    0,
  );
  assert.equal(await Flag.countDocuments({ environmentId: env._id }), 0);
  assert.equal(await Identity.countDocuments({ environmentId: env._id }), 0);
});
