const EnvironmentKey = require("./key.model");
const Environment = require("../environments/environment.model");
const Project = require("../project/project.model");
const mongoose = require("mongoose");
const { AppError } = require("../../middleware/error.middleware");
const { generateKey } = require("../../utils/generateKey");

const assertEnvironmentAccess = async (environmentId, userId) => {
  if (!mongoose.isValidObjectId(environmentId)) {
    throw new AppError("Environment not found", 404);
  }
  const environment = await Environment.findById(environmentId)
    .select("projectId")
    .lean();
  if (!environment) throw new AppError("Environment not found", 404);
  const project = await Project.exists({
    _id: environment.projectId,
    ownerId: userId,
  });
  if (!project) throw new AppError("Environment not found", 404);
};

// Mint a new key for an environment. Returns the RAW key exactly once —
// the caller (controller) must send it back to the user now, because
// after this, only the hash exists in the database.
async function createKey({ environmentId, label, userId }) {
  await assertEnvironmentAccess(environmentId, userId);
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
async function listKeys(environmentId, userId) {
  await assertEnvironmentAccess(environmentId, userId);
  return EnvironmentKey.find({ environmentId }).select("-hashedKey");
}

// Revoke (soft-delete) a key so it stops working immediately.
async function revokeKey(environmentId, keyId, userId) {
  await assertEnvironmentAccess(environmentId, userId);
  return EnvironmentKey.findOneAndUpdate(
    { _id: keyId, environmentId },
    { revoked: true },
    { returnDocument: "after" },
  );
}

module.exports = { createKey, listKeys, revokeKey };
