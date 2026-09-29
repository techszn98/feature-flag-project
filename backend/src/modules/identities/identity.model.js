const mongoose = require("mongoose");

const identitySchema = new mongoose.Schema(
  {
    environmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Environment",
      required: true,
      immutable: true,
      index: true,
    },
    identifier: {
      type: String,
      required: true,
      trim: true,
      maxlength: [128, "Identity identifier must be at most 128 characters"],
    },
    traits: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

identitySchema.index({ environmentId: 1, identifier: 1 }, { unique: true });

module.exports = mongoose.model("Identity", identitySchema);
