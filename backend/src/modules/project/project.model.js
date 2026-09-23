const mongoose = require('mongoose');

// A project belongs to one user (ownerId) and can contain many environments.
// Environments will reference the project by projectId, so ownership of an
// environment is always resolved through its project.
const projectSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      immutable: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name must be at most 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      trim: true,
      lowercase: true,
      maxlength: [100, 'Project slug must be at most 100 characters'],
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers and hyphens'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description must be at most 500 characters'],
    },
  },
  { timestamps: true }
);

// Slugs are unique per owner: two users may both have a "checkout" project.
projectSchema.index({ ownerId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);
