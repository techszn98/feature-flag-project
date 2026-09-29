const express = require("express");
const {
  authenticateEnvironmentKey,
} = require("../../middleware/environmentKey.middleware");
const { validateEvaluation } = require("./evaluation.validator");
const { evaluate } = require("./evaluation.controller");

const router = express.Router();

router.post("/", authenticateEnvironmentKey, validateEvaluation, evaluate);

module.exports = router;
