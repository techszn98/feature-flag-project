const { body } = require('express-validator');

exports.evaluateValidator = [
  body('identifier')
    .isString()
    .notEmpty()
    .withMessage('Identifier is required and must be a string'),
  body('traits')
    .optional()
    .isObject()
    .withMessage('Traits must be a valid JSON object'),
];