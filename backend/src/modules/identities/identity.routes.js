const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const {
  validateCreateIdentity,
  validateIdentityScope,
  validateUpdateIdentity,
  validateUpdateTraits,
} = require("./identity.validator");
const identityController = require("./identity.controller");

const router = express.Router();

router.use(protect);
router.post("/", validateCreateIdentity, identityController.createIdentity);
router.get(
  "/:identifier",
  validateIdentityScope,
  identityController.getIdentity,
);
router.put(
  "/:identifier",
  validateIdentityScope,
  validateUpdateIdentity,
  identityController.updateIdentity,
);
router.delete(
  "/:identifier",
  validateIdentityScope,
  identityController.deleteIdentity,
);
router.put(
  "/:identifier/traits",
  validateIdentityScope,
  validateUpdateTraits,
  identityController.updateIdentityTraits,
);

module.exports = router;
