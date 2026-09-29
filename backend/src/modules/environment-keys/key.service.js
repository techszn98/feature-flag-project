const EnvironmentKey = require('./key.model');
const { generateKey } = require('../../utils/generateKey');

// Mint a new key for an environment. Returns the RAW key exactly once —
// the caller (controller) must send it back to the user now, because
// after this, only the hash exists in the database.
async function createKey({ environmentId, label, userId }) {
  const { rawKey, hashedKey, keyPreview } = generateKey();

  const keyDoc = await EnvironmentKey.create({
    environmentId,
    hashedKey,
    keyPreview,
    label,
    createdBy: userId,
  });

  return { keyDoc, rawKey };
}

// List keys for an environment — never returns the raw key, only the preview.
async function listKeys(environmentId) {
  return EnvironmentKey.find({ environmentId }).select('-hashedKey');
}

// Revoke (soft-delete) a key so it stops working immediately.
async function revokeKey(environmentId, keyId) {
  return EnvironmentKey.findOneAndUpdate(
    { _id: keyId, environmentId },
    { revoked: true },
    { new: true }
  );
}

module.exports = { createKey, listKeys, revokeKey };