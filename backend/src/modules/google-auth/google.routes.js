const express = require("express");
const { googleLogin } = require("./google.controller");
const { validateGoogleLogin } = require("./google.validator");

const router = express.Router();

router.post("/", validateGoogleLogin, googleLogin);

module.exports = router;
