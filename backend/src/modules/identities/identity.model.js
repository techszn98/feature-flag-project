const mongoose = require('mongoose');

const identitySchema = new mongoose.Schema(
  {
    environmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Environment',
      required: true,
      index: true,
    },
    identifier: { type: String, required: true, trim: true },
    traits: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Ensure one identifier per environment
identitySchema.index({ environmentId: 1, identifier: 1 }, { unique: true });

// Safety check: Prevents "Cannot overwrite model" error if Member 6 already created it
module.exports = mongoose.models.Identity || mongoose.model('Identity', identitySchema);