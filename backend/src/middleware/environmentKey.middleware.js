const mongoose = require("mongoose");
const EnvironmentKey = require("../modules/environment-keys/key.model");
const Environment = require("../modules/environments/environment.model");
const Project = require("../modules/project/project.model");
const { hashKey } = require("../utils/generateKey");
const { AppError } = require("./error.middleware");

const authenticateEnvironmentKey = async (req, res, next) => {
  try {
    const rawKey = req.get("x-environment-key");
    if (!rawKey) throw new AppError("Environment key is required", 401);

    const key = await EnvironmentKey.findOne({
      hashedKey: hashKey(rawKey),
      revoked: false,
    }).select("environmentId createdBy");
    if (!key || !mongoose.isValidObjectId(key.environmentId)) {
      throw new AppError("Invalid or revoked environment key", 401);
    }

    const environment = await Environment.findById(key.environmentId).select(
      "projectId",
    );
    if (!environment)
      throw new AppError("Invalid or revoked environment key", 401);
    const project = await Project.exists({
      _id: environment.projectId,
      ownerId: key.createdBy,
    });
    if (!project) throw new AppError("Invalid or revoked environment key", 401);

    req.environmentId = key.environmentId;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authenticateEnvironmentKey };
