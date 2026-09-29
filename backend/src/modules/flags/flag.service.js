const Flag = require("./flag.model");
const Environment = require("../environments/environment.model");
const Project = require("../project/project.model");
const mongoose = require("mongoose");
const { AppError } = require("../../middleware/error.middleware");

const notFound = () => new AppError("Flag not found", 404);
const environmentNotFound = () => new AppError("Environment not found", 404);

const assertEnvironmentAccess = async (environmentId, ownerId) => {
  if (!mongoose.isValidObjectId(environmentId)) throw environmentNotFound();
  const environment = await Environment.findById(environmentId)
    .select("projectId")
    .lean();
  if (!environment) throw environmentNotFound();
  const project = await Project.exists({ _id: environment.projectId, ownerId });
  if (!project) throw environmentNotFound();
};

const handleDuplicate = (error) => {
  if (error.code === 11000) {
    throw new AppError(
      "A flag with this name already exists in this environment",
      409,
    );
  }
  throw error;
};

const toPublicFlag = (flag) => ({
  id: flag._id,
  ownerId: flag.ownerId,
  environmentId: flag.environmentId,
  name: flag.name,
  enabled: flag.enabled,
  targetingRules: flag.targetingRules,
  createdAt: flag.createdAt,
  updatedAt: flag.updatedAt,
});

const createFlag = async (
  ownerId,
  { environmentId, name, enabled, targetingRules },
) => {
  await assertEnvironmentAccess(environmentId, ownerId);
  const flag = await Flag.create({
    ownerId,
    environmentId,
    name,
    enabled,
    targetingRules,
  }).catch(handleDuplicate);
  return toPublicFlag(flag);
};

const listFlags = async (ownerId, environmentId) => {
  const filter = { ownerId };
  if (environmentId !== undefined) {
    await assertEnvironmentAccess(environmentId, ownerId);
    filter.environmentId = environmentId;
  }
  const flags = await Flag.find(filter).sort({ environmentId: 1, name: 1 });
  return flags.map(toPublicFlag);
};

const getFlag = async (flagId, ownerId) => {
  const flag = await Flag.findOne({ _id: flagId, ownerId });
  if (!flag) throw notFound();
  return toPublicFlag(flag);
};

const updateFlag = async (flagId, ownerId, updates) => {
  const flag = await Flag.findOneAndUpdate({ _id: flagId, ownerId }, updates, {
    returnDocument: "after",
    runValidators: true,
  }).catch(handleDuplicate);
  if (!flag) throw notFound();
  return toPublicFlag(flag);
};

const deleteFlag = async (flagId, ownerId) => {
  const flag = await Flag.findOneAndDelete({ _id: flagId, ownerId });
  if (!flag) throw notFound();
};

module.exports = { createFlag, listFlags, getFlag, updateFlag, deleteFlag };
