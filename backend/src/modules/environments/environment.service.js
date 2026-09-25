const Environment = require('./environment.model');

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
async function listEnvironments(projectId) {
  return Environment.find({ projectId });
}

// Get one environment by its id.
async function getEnvironmentById(id) {
  return Environment.findById(id);
}

// Update an environment's name (type is usually locked once created).
async function updateEnvironment(id, updates) {
  return Environment.findByIdAndUpdate(
    id,
    { name: updates.name },
    { new: true, runValidators: true }
  );
}

// Delete an environment.
async function deleteEnvironment(id) {
  return Environment.findByIdAndDelete(id);
}

module.exports = {
  createEnvironment,
  listEnvironments,
  getEnvironmentById,
  updateEnvironment,
  deleteEnvironment,
};