const { AppError } = require("../../middleware/error.middleware");

const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

const validateEvaluation = (req, res, next) => {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return next(new AppError("Request body must be a JSON object", 400));
  }

  const unknown = Object.keys(body).filter((key) => key !== "identifier");
  if (unknown.length) {
    return next(new AppError(`Unknown field(s): ${unknown.join(", ")}`, 400));
  }
  if (
    typeof body.identifier !== "string" ||
    body.identifier !== body.identifier.trim() ||
    !IDENTIFIER_PATTERN.test(body.identifier)
  ) {
    return next(new AppError("A valid identity identifier is required", 400));
  }

  next();
};

module.exports = { validateEvaluation };
