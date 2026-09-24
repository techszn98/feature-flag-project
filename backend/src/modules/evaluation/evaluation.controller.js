const evaluationService = require('./evaluation.service');
const { validationResult } = require('express-validator');
const FeatureFlag = require('../flags/flag.model'); // Needed for the seed function

// --- MAIN EVALUATION ENDPOINT ---
exports.evaluateFlags = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array() });
    }

    // Get environment ID from middleware OR fallback to header for testing
    const environmentId = req.environment?._id || req.headers['x-test-environment-id'];
    
    if (!environmentId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Valid Environment Key is required.',
      });
    }

    const { identifier, traits } = req.body;

    const flags = await evaluationService.evaluateFlags(environmentId, identifier, traits);

    res.status(200).json({
      success: true,
      flags,
    });
  } catch (error) {
    next(error);
  }
};

