const mongoose = require("mongoose");
const { AppError } = require("../../middleware/error.middleware");

const ALLOWED_FIELDS = ["name", "environmentId", "enabled", "targetingRules"];
const RULE_OPERATORS = [
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
];

const checkText = (value, label, errors) => {
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${label} is required`);
  } else if (value.trim().length > 100) {
    errors.push(`${label} must be at most 100 characters`);
  }
};

const checkEnabled = (enabled, errors) => {
  if (enabled !== undefined && typeof enabled !== "boolean") {
    errors.push("Enabled must be a boolean");
  }
};

const checkEnvironmentId = (environmentId, errors) => {
  if (!mongoose.isValidObjectId(environmentId)) {
    errors.push("A valid environmentId is required");
  }
};

const checkTargetingRules = (rules, errors) => {
  if (rules === undefined) return;
  if (!Array.isArray(rules) || rules.length > 100) {
    errors.push("Targeting rules must be an array with at most 100 rules");
    return;
  }

  rules.forEach((rule, index) => {
    if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
      errors.push(`Targeting rule ${index} must be an object`);
      return;
    }
    const unknown = Object.keys(rule).filter(
      (key) => !["trait", "operator", "value", "enabled"].includes(key),
    );
    if (unknown.length)
      errors.push(`Targeting rule ${index} has unknown fields`);
    if (
      typeof rule.trait !== "string" ||
      !/^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/.test(rule.trait) ||
      rule.trait.length > 128
    ) {
      errors.push(`Targeting rule ${index} has an invalid trait path`);
    }
    if (!RULE_OPERATORS.includes(rule.operator)) {
      errors.push(`Targeting rule ${index} has an invalid operator`);
    }
    if (typeof rule.enabled !== "boolean") {
      errors.push(`Targeting rule ${index} enabled must be a boolean`);
    }
    if (!Object.hasOwn(rule, "value")) {
      errors.push(`Targeting rule ${index} requires a value`);
    } else if (
      ["in", "notIn"].includes(rule.operator) &&
      !Array.isArray(rule.value)
    ) {
      errors.push(
        `Targeting rule ${index} operator ${rule.operator} requires an array value`,
      );
    } else if (
      [
        "greaterThan",
        "greaterThanOrEqual",
        "lessThan",
        "lessThanOrEqual",
      ].includes(rule.operator) &&
      typeof rule.value !== "number"
    ) {
      errors.push(
        `Targeting rule ${index} operator ${rule.operator} requires a number value`,
      );
    } else if (rule.operator === "exists" && typeof rule.value !== "boolean") {
      errors.push(
        `Targeting rule ${index} operator exists requires a boolean value`,
      );
    }
  });
};

const checkUnknownFields = (body, errors) => {
  const unknown = Object.keys(body).filter(
    (key) => !ALLOWED_FIELDS.includes(key),
  );
  if (unknown.length) errors.push(`Unknown field(s): ${unknown.join(", ")}`);
};

const validateCreateFlag = (req, res, next) => {
  const body = req.body || {};
  const errors = [];

  checkUnknownFields(body, errors);
  checkText(body.name, "Flag name", errors);
  checkEnvironmentId(body.environmentId, errors);
  checkEnabled(body.enabled, errors);
  checkTargetingRules(body.targetingRules, errors);

  if (errors.length) return next(new AppError(errors.join(", "), 400));
  next();
};

const validateUpdateFlag = (req, res, next) => {
  const body = req.body || {};
  const errors = [];

  checkUnknownFields(body, errors);
  if (
    ["name", "enabled", "targetingRules"].every(
      (key) => body[key] === undefined,
    )
  ) {
    errors.push("Provide at least one of: name, enabled, targetingRules");
  }
  if (body.name !== undefined) checkText(body.name, "Flag name", errors);
  checkEnabled(body.enabled, errors);
  checkTargetingRules(body.targetingRules, errors);

  if (errors.length) return next(new AppError(errors.join(", "), 400));
  next();
};

const validateFlagId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError("Invalid flag id", 400));
  }
  next();
};

const validateFlagEnvironment = (req, res, next) => {
  if (req.query.environmentId !== undefined) {
    const errors = [];
    checkEnvironmentId(req.query.environmentId, errors);
    if (errors.length) return next(new AppError(errors.join(", "), 400));
  }
  next();
};

module.exports = {
  validateCreateFlag,
  validateUpdateFlag,
  validateFlagId,
  validateFlagEnvironment,
};
