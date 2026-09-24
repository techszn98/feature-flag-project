const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema(
  {
    environmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Environment',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    enabled: { type: Boolean, default: false },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
    targetingRules: { 
      type: mongoose.Schema.Types.Mixed, 
      default: {} 
    },
  },
  { timestamps: true }
);

flagSchema.index({ environmentId: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.FeatureFlag || mongoose.model('FeatureFlag', flagSchema);