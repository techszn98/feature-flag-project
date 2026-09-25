const mongoose = require('mongoose');

// An Environment "belongs to" a Project (Project → Environments, one-to-many).
// Analogy: this is one room in the house. The projectId is the address of the house it is in.
const environmentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['development', 'staging', 'production'],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true } //createdAt / updatedAt
);

// Stop a project from having two environments of the same type
// (e.g. two "production" rooms in the same house).
environmentSchema.index({ projectId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Environment', environmentSchema);