function validateCreateKey(req, res, next) {
  const { label } = req.body;

  // label is optional, but if given, it must be a string
  if (label !== undefined && typeof label !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Label must be text',
      data: null,
    });
  }

  next();
}

module.exports = { validateCreateKey };