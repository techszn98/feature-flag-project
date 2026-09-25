const ALLOWED_TYPES = ['development', 'staging', 'production'];

// Runs before createEnvironment. Stops bad requests early.
function validateCreateEnvironment(req, res, next) {
  const { name, type } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Environment name is required',
      data: null,
    });
  }

  if (!type || !ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      message: `Environment type must be one of: ${ALLOWED_TYPES.join(', ')}`,
      data: null,
    });
  }

  next(); // form is correct, let it through to the controller
}

function validateUpdateEnvironment(req, res, next) {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Environment name is required',
      data: null,
    });
  }

  next();
}

module.exports = { validateCreateEnvironment, validateUpdateEnvironment };