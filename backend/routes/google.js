const express = require("express");
const router = express.Router();
const { googleLogin } = require("../controllers/googleAuthController");

router.post("/auth/google", googleLogin);

module.exports = router;