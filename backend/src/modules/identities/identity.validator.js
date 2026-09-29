const mongoose = require("mongoose");
const { AppError } = require("../../middleware/error.middleware");

const ALLOWED_CREATE_FIELDS = ["environmentId", "identifier", "traits"];
const ALLOWED_UPDATE_FIELDS = ["identifier", "traits"];
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const FORBIDDEN_TRAIT_KEYS = new Set(["__proto__", "prototype", "constructor"]);

const fail = (message) => new AppError(message, 400);

const validateIdentifierValue = (identifier) => {
  if (
    typeof identifier !== "string" ||
    identifier !== identifier.trim() ||
    !IDENTIFIER_PATTERN.test(identifier)
  ) {
    throw fail(
      "Identifier must be 1-128 characters and contain only letters, numbers, ., _, :, or -",
    );
  }
};

const validateTraitsValue = (traits) => {
  if (traits === null || typeof traits !== "object" || Array.isArray(traits)) {
    throw fail("Traits must be a JSON object");
  }

  const inspect = (value) => {
    if (!value || typeof value !== "object") return;
    for (const [key, nestedValue] of Object.entries(value)) {
      if (FORBIDDEN_TRAIT_KEYS.has(key))
        throw fail(`Trait key '${key}' is not allowed`);
      inspect(nestedValue);
    }
  };

  inspect(traits);
  if (Buffer.byteLength(JSON.stringify(traits), "utf8") > 8000) {
    throw fail("Traits must be at most 8000 bytes");
  }
};

const validateBody = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw fail("Request body must be a JSON object");
  }
};

const rejectUnknownFields = (body, allowedFields) => {
  const unknown = Object.keys(body).filter(
    (field) => !allowedFields.includes(field),
  );
  if (unknown.length) throw fail(`Unknown field(s): ${unknown.join(", ")}`);
};

const validateEnvironmentId = (environmentId) => {
  if (!mongoose.isValidObjectId(environmentId))
    throw fail("A valid environmentId is required");
};

const validateCreateIdentity = (req, res, next) => {
  try {
    const body = req.body || {};
    validateBody(body);
    rejectUnknownFields(body, ALLOWED_CREATE_FIELDS);
    validateEnvironmentId(body.environmentId);
    validateIdentifierValue(body.identifier);
    if (body.traits !== undefined) validateTraitsValue(body.traits);
    next();
  } catch (error) {
    next(error);
  }
};

const validateIdentityScope = (req, res, next) => {
  try {
    validateIdentifierValue(req.params.identifier);
    validateEnvironmentId(req.query.environmentId);
    next();
  } catch (error) {
    next(error);
  }
};

const validateUpdateIdentity = (req, res, next) => {
  try {
    validateBody(req.body);
    rejectUnknownFields(req.body, ALLOWED_UPDATE_FIELDS);
    if (!Object.keys(req.body).length)
      throw fail("Provide an identifier or traits to update");
    if (req.body.identifier !== undefined)
      validateIdentifierValue(req.body.identifier);
    if (req.body.traits !== undefined) validateTraitsValue(req.body.traits);
    next();
  } catch (error) {
    next(error);
  }
};

const validateUpdateTraits = (req, res, next) => {
  try {
    validateBody(req.body);
    rejectUnknownFields(req.body, ["traits"]);
    if (req.body.traits === undefined) throw fail("Traits are required");
    validateTraitsValue(req.body.traits);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCreateIdentity,
  validateIdentityScope,
  validateUpdateIdentity,
  validateUpdateTraits,
};
