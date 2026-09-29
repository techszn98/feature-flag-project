const Environment = require("./environment.model");
const EnvironmentKey = require("../environment-keys/key.model");
const Flag = require("../flags/flag.model");
const Identity = require("../identities/identity.model");
const Project = require("../project/project.model");
const { AppError } = require("../../middleware/error.middleware");

const projectNotFound = () => new AppError("Project not found", 404);

// Create a new environment (a new "room") inside a project.
async function createEnvironment({ projectId, name, type, userId }) {
  const project = await Project.findOne({ _id: projectId, ownerId: userId });
  if (!project) throw projectNotFound();

  const environment = await Environment.create({
    projectId,
    name,
    type,
    createdBy: userId,
  });
  return environment;
}

// List every environment for one project.
async function listEnvironments(projectId, userId) {
  const project = await Project.findOne({ _id: projectId, ownerId: userId });
  if (!project) return null; // caller treats this as "not found", not "empty list"

  return Environment.find({ projectId });
}

// List every environment for one project.
async function getEnvironmentById(id, userId) {
  const environment = await Environment.findById(id);
  if (!environment || !userId) return environment;

  const project = await Project.exists({
    _id: environment.projectId,
    ownerId: userId,
  });
  return project ? environment : null;
}

async function updateEnvironment(id, updates, userId) {
  const environment = await getEnvironmentById(id, userId);
  if (!environment) return null;

  return Environment.findOneAndUpdate(
    { _id: id },
    { name: updates.name, type: updates.type },
    { returnDocument: "after", runValidators: true },
  );
}

async function deleteEnvironment(id, userId) {
  const environment = await getEnvironmentById(id, userId);
  if (!environment) return null;

  await EnvironmentKey.deleteMany({ environmentId: environment._id });
  await Flag.deleteMany({ environmentId: environment._id });
  await Identity.deleteMany({ environmentId: environment._id });
  return Environment.findOneAndDelete({ _id: id });
}

module.exports = {
  createEnvironment,
  listEnvironments,
  getEnvironmentById,
  updateEnvironment,
  deleteEnvironment,
};
