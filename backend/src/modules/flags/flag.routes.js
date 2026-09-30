const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const {
  validateCreateFlag,
  validateUpdateFlag,
  validateFlagId,
  validateFlagEnvironment,
} = require("./flag.validator");
const { create, list, getOne, update, remove } = require("./flag.controller");

const router = express.Router();

router.use(protect);

router.post("/", validateCreateFlag, create);
router.get("/", validateFlagEnvironment, list);
router.get("/:id", validateFlagId, getOne);
router.put("/:id", validateFlagId, validateUpdateFlag, update);
router.delete("/:id", validateFlagId, remove);

module.exports = router;
