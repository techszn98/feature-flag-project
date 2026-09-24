const mongoose = require('mongoose');
const { AppError } = require('../../middleware/error.middleware');

const ALLOWED_FIELDS = ['name', 'slug', 'description'];
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const checkName = (name, errors) => {
  if (typeof name !== 'string' || !name.trim()) {
    errors.push('Project name is required');
  } else if (name.trim().length > 100) {
    errors.push('Project name must be at most 100 characters');
  }
};

const checkSlug = (slug, errors) => {
  if (slug === undefined) return;
  if (typeof slug !== 'string' || !SLUG_REGEX.test(slug)) {
    errors.push('Slug may only contain lowercase letters, numbers and single hyphens');
  } else if (slug.length > 100) {
    errors.push('Slug must be at most 100 characters');
  }
};

const checkDescription = (description, errors) => {
  if (description === undefined) return;
  if (typeof description !== 'string') {
    errors.push('Description must be a string');
  } else if (description.trim().length > 500) {
    errors.push('Description must be at most 500 characters');
  }
};

// Rejects fields like `ownerId` so a client can't assign or transfer ownership.
const checkUnknownFields = (body, errors) => {
  const unknown = Object.keys(body).filter((key) => !ALLOWED_FIELDS.includes(key));
  if (unknown.length) errors.push(`Unknown field(s): ${unknown.join(', ')}`);
};

const validateCreateProject = (req, res, next) => {
  const body = req.body || {};
  const errors = [];

  checkUnknownFields(body, errors);
  checkName(body.name, errors);
  checkSlug(body.slug, errors);
  checkDescription(body.description, errors);

  if (errors.length) return next(new AppError(errors.join(', '), 400));
  next();
};

const validateUpdateProject = (req, res, next) => {
  const body = req.body || {};
  const errors = [];

  checkUnknownFields(body, errors);
  if (ALLOWED_FIELDS.every((key) => body[key] === undefined)) {
    errors.push('Provide at least one of: name, slug, description');
  }
  if (body.name !== undefined) checkName(body.name, errors);
  checkSlug(body.slug, errors);
  checkDescription(body.description, errors);

  if (errors.length) return next(new AppError(errors.join(', '), 400));
  next();
};

const validateProjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.projectId)) {
    return next(new AppError('Invalid project id', 400));
  }
  next();
};

module.exports = { validateCreateProject, validateUpdateProject, validateProjectId };
