const mongoose = require("mongoose");
const Identity = require("./identity.model");
const Environment = require("../environments/environment.model");
const Project = require("../project/project.model");
const { AppError } = require("../../middleware/error.middleware");

const notFound = () => new AppError("Identity not found", 404);

const handleDuplicate = (error) => {
  if (error.code === 11000) {
    throw new AppError(
      "An identity with this identifier already exists in this environment",
      409,
    );
  }
  throw error;
};

const toPublicIdentity = (identity) => ({
  id: identity._id,
  environmentId: identity.environmentId,
  identifier: identity.identifier,
  traits: identity.traits || {},
  createdAt: identity.createdAt,
  updatedAt: identity.updatedAt,
});

const assertEnvironmentAccess = async (environmentId, userId) => {
  if (!mongoose.isValidObjectId(environmentId)) throw notFound();

  const environment = await Environment.findById(environmentId)
    .select("projectId")
    .lean();
  if (!environment) throw notFound();

  const project = await Project.exists({
    _id: environment.projectId,
    ownerId: userId,
  });
  if (!project) throw notFound();
};

const createIdentity = async (
  userId,
  { environmentId, identifier, traits = {} },
) => {
  await assertEnvironmentAccess(environmentId, userId);
  const identity = await Identity.create({
    environmentId,
    identifier,
    traits,
  }).catch(handleDuplicate);
  return toPublicIdentity(identity);
};

const getIdentity = async (userId, environmentId, identifier) => {
  await assertEnvironmentAccess(environmentId, userId);
  const identity = await Identity.findOne({ environmentId, identifier });
  if (!identity) throw notFound();
  return toPublicIdentity(identity);
};

const updateIdentity = async (userId, environmentId, identifier, updates) => {
  await assertEnvironmentAccess(environmentId, userId);
  const identity = await Identity.findOneAndUpdate(
    { environmentId, identifier },
    updates,
    { returnDocument: "after", runValidators: true },
  ).catch(handleDuplicate);
  if (!identity) throw notFound();
  return toPublicIdentity(identity);
};

const updateIdentityTraits = async (
  userId,
  environmentId,
  identifier,
  traits,
) => {
  await assertEnvironmentAccess(environmentId, userId);
  const identity = await Identity.findOne({ environmentId, identifier });
  if (!identity) throw notFound();

  identity.traits = { ...(identity.traits || {}), ...traits };
  await identity.save();
  return toPublicIdentity(identity);
};

const deleteIdentity = async (userId, environmentId, identifier) => {
  await assertEnvironmentAccess(environmentId, userId);
  const identity = await Identity.findOneAndDelete({
    environmentId,
    identifier,
  });
  if (!identity) throw notFound();
};

const getTraitsForEvaluation = async (environmentId, identifier) => {
  const identity = await Identity.findOne({ environmentId, identifier })
    .select("traits")
    .lean();
  return identity?.traits || {};
};

module.exports = {
  createIdentity,
  getIdentity,
  updateIdentity,
  updateIdentityTraits,
  deleteIdentity,
  getTraitsForEvaluation,
};
