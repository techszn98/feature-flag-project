const mongoose = require('mongoose');

// An EnvironmentKey "belongs to" an Environment (Environment → Environment Keys, one-to-many).
const environmentKeySchema = new mongoose.Schema(
  {
    environmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Environment',
      required: true,
    },
    // We NEVER store the real key. Only its hash (like a fingerprint,
    // not the actual finger). If someone steals the database, the raw
    // keys still can't be reconstructed from the hash.
    hashedKey: {
      type: String,
      required: true,
    },
    // A short, non-secret preview like "fk_live_ab12..." so users can
    // recognize which key is which in a list, without exposing the full thing.
    keyPreview: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      trim: true,
      default: '',
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

environmentKeySchema.index({ environmentId: 1 });

module.exports = mongoose.model('EnvironmentKey', environmentKeySchema);