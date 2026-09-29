const evaluationService = require("./evaluation.service");
const { sendSuccess } = require("../../utils/response");

const evaluate = async (req, res, next) => {
  try {
    const flags = await evaluationService.evaluateEnvironment(
      req.environmentId,
      req.body.identifier,
    );
    sendSuccess(res, 200, "Flags evaluated successfully", {
      environmentId: req.environmentId,
      identifier: req.body.identifier,
      flags,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { evaluate };
