const Project = require('./project.model');
const { AppError } = require('../../middleware/error.middleware');
const { slugify } = require('../../utils/slugify');

// Ownership rule: every query is scoped by ownerId, so a user can never read,
// change or delete another user's project. A project that exists but belongs to
// someone else returns the same 404 as one that doesn't exist, so ids of other
// users' projects are not leaked.
const notFound = () => new AppError('Project not found', 404);

const rethrowDuplicateSlug = (err) => {
  if (err.code === 11000) throw new AppError('You already have a project with this slug', 409);
  throw err;
};

const toPublicProject = (project) => ({
  id: project._id,
  ownerId: project.ownerId,
  name: project.name,
  slug: project.slug,
  description: project.description,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

const resolveSlug = (slug, name) => {
  const resolved = slugify(slug ?? name);
  if (!resolved) throw new AppError('Could not generate a slug from the project name', 400);
  return resolved;
};

const createProject = async (ownerId, { name, slug, description }) => {
  const project = await Project.create({
    ownerId,
    name,
    slug: resolveSlug(slug, name),
    description,
  }).catch(rethrowDuplicateSlug);
  return toPublicProject(project);
};

const listProjects = async (ownerId) => {
  const projects = await Project.find({ ownerId }).sort({ createdAt: -1 });
  return projects.map(toPublicProject);
};

// Reusable by modules nested under a project (e.g. environments) to enforce
// that the current user owns the parent project.
const getOwnedProject = async (projectId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, ownerId });
  if (!project) throw notFound();
  return project;
};

const getProject = async (projectId, ownerId) =>
  toPublicProject(await getOwnedProject(projectId, ownerId));

// The slug is a stable identifier: renaming a project keeps its slug unless a
// new slug is sent explicitly.
const updateProject = async (projectId, ownerId, { name, slug, description }) => {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = resolveSlug(slug);
  if (description !== undefined) updates.description = description;

  const project = await Project.findOneAndUpdate({ _id: projectId, ownerId }, updates, {
    returnDocument: 'after',
    runValidators: true,
  }).catch(rethrowDuplicateSlug);
  if (!project) throw notFound();
  return toPublicProject(project);
};

const deleteProject = async (projectId, ownerId) => {
  const project = await Project.findOneAndDelete({ _id: projectId, ownerId });
  if (!project) throw notFound();
};

module.exports = {
  createProject,
  listProjects,
  getOwnedProject,
  getProject,
  updateProject,
  deleteProject,
  toPublicProject,
};
