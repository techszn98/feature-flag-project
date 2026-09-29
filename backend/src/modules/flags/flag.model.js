const mongoose = require("mongoose");

const targetingRuleSchema = new mongoose.Schema(
  {
    trait: { type: String, required: true },
    operator: {
      type: String,
      enum: [
        "equals",
        "notEquals",
        "in",
        "notIn",
        "greaterThan",
        "greaterThanOrEqual",
        "lessThan",
        "lessThanOrEqual",
        "contains",
        "exists",
      ],
      required: true,
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    enabled: { type: Boolean, required: true },
  },
  { _id: false },
);

const flagSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Flag owner is required"],
      immutable: true,
      index: true,
    },
    environmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Environment",
      required: [true, "Environment is required"],
      immutable: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Flag name is required"],
      trim: true,
      maxlength: [100, "Flag name must be at most 100 characters"],
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    targetingRules: {
      type: [targetingRuleSchema],
      default: [],
    },
  },
  { timestamps: true },
);

flagSchema.index({ environmentId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Flag", flagSchema);
