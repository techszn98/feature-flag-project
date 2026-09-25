const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
require('dotenv').config();

const Environment = require('../../src/modules/environments/environment.model');
const environmentService = require('../../src/modules/environments/environment.service');

// Fake ids standing in for a Project and a User, since this test ends in environment
const fakeProjectId = new mongoose.Types.ObjectId();
const fakeUserId = new mongoose.Types.ObjectId();

before(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

after(async () => {
  await mongoose.connection.close();
});

// Clean the slate before every single test, so tests don't affect each other.
beforeEach(async () => {
  await Environment.deleteMany({ projectId: fakeProjectId });
});

test('createEnvironment saves a new environment', async () => {
  const env = await environmentService.createEnvironment({
    projectId: fakeProjectId,
    name: 'Dev Server',
    type: 'development',
    userId: fakeUserId,
  });

  assert.equal(env.name, 'Dev Server');
  assert.equal(env.type, 'development');
  assert.equal(String(env.projectId), String(fakeProjectId));
});

test('listEnvironments returns only environments for that project', async () => {
  await environmentService.createEnvironment({
    projectId: fakeProjectId,
    name: 'Staging Server',
    type: 'staging',
    userId: fakeUserId,
  });

  const list = await environmentService.listEnvironments(fakeProjectId);

  assert.equal(list.length, 1);
  assert.equal(list[0].type, 'staging');
});

test('a project cannot have two environments of the same type', async () => {
  await environmentService.createEnvironment({
    projectId: fakeProjectId,
    name: 'Prod 1',
    type: 'production',
    userId: fakeUserId,
  });

  // Second "production" for the same project should fail —
  // this is the unique index rule from environment.model.js.
  await assert.rejects(
    environmentService.createEnvironment({
      projectId: fakeProjectId,
      name: 'Prod 2',
      type: 'production',
      userId: fakeUserId,
    })
  );
});

test('updateEnvironment changes the name', async () => {
  const env = await environmentService.createEnvironment({
    projectId: fakeProjectId,
    name: 'Old Name',
    type: 'development',
    userId: fakeUserId,
  });

  const updated = await environmentService.updateEnvironment(env._id, {
    name: 'New Name',
  });

  assert.equal(updated.name, 'New Name');
});

test('deleteEnvironment removes it from the database', async () => {
  const env = await environmentService.createEnvironment({
    projectId: fakeProjectId,
    name: 'To Delete',
    type: 'staging',
    userId: fakeUserId,
  });

  await environmentService.deleteEnvironment(env._id);

  const found = await environmentService.getEnvironmentById(env._id);
  assert.equal(found, null);
});