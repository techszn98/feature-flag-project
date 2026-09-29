const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
require('dotenv').config();

const EnvironmentKey = require('../../src/modules/environment-keys/key.model');
const keyService = require('../../src/modules/environment-keys/key.service');

const fakeEnvironmentId = new mongoose.Types.ObjectId();
const fakeUserId = new mongoose.Types.ObjectId();

before(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

after(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await EnvironmentKey.deleteMany({ environmentId: fakeEnvironmentId });
});

test('createKey returns the raw key once, and saves only the hash', async () => {
  const { keyDoc, rawKey } = await keyService.createKey({
    environmentId: fakeEnvironmentId,
    label: 'My Test Key',
    userId: fakeUserId,
  });

  assert.ok(rawKey, 'rawKey should be returned to the caller');
  assert.ok(keyDoc.hashedKey, 'hashedKey should be saved on the document');
  assert.notEqual(rawKey, keyDoc.hashedKey, 'raw and hashed must differ');
  assert.equal(keyDoc.label, 'My Test Key');
  assert.equal(keyDoc.revoked, false);
});

test('listKeys never includes the hashedKey field', async () => {
  await keyService.createKey({
    environmentId: fakeEnvironmentId,
    label: 'Key A',
    userId: fakeUserId,
  });

  const keys = await keyService.listKeys(fakeEnvironmentId);

  assert.equal(keys.length, 1);
  assert.equal(keys[0].hashedKey, undefined, 'hashedKey must never leak in a list response');
  assert.ok(keys[0].keyPreview, 'keyPreview should still be visible');
});

test('revokeKey marks a key as revoked', async () => {
  const { keyDoc } = await keyService.createKey({
    environmentId: fakeEnvironmentId,
    label: 'Key to revoke',
    userId: fakeUserId,
  });

  const revoked = await keyService.revokeKey(fakeEnvironmentId, keyDoc._id);

  assert.equal(revoked.revoked, true);
});

test('revokeKey returns null for a key that does not belong to that environment', async () => {
  const { keyDoc } = await keyService.createKey({
    environmentId: fakeEnvironmentId,
    label: 'Key A',
    userId: fakeUserId,
  });

  const wrongEnvironmentId = new mongoose.Types.ObjectId();
  const result = await keyService.revokeKey(wrongEnvironmentId, keyDoc._id);

  // Proves a key can't be revoked through the wrong environment —
  assert.equal(result, null);
});