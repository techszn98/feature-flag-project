const Environment = require('./environment.model');
const Project = require('../project/project.model');

// Create a new environment (a new "room") inside a project.
async function createEnvironment({ projectId, name, type, userId }) {
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
  const project = await Project.findOne({ _id: projectId, createdBy: userId });
  if (!project) return null; // caller treats this as "not found", not "empty list"

  return Environment.find({ projectId });
}

// List every environment for one project.
async function getEnvironmentById(id, userId) {
  return Environment.findOne({ _id: id, createdBy: userId });
}

async function updateEnvironment(id, updates, userId) {
  return Environment.findOneAndUpdate(
    { _id: id, createdBy: userId },
    { name: updates.name, type: updates.type },
    { returnDocument: 'after', runValidators: true }
  );
}

async function deleteEnvironment(id, userId) {
  return Environment.findOneAndDelete({ _id: id, createdBy: userId });
}

module.exports = {
  createEnvironment,
  listEnvironments,
  getEnvironmentById,
  updateEnvironment,
  deleteEnvironment,
};