const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  login,
  getCurrentUser,
  refreshAccessToken,
} = require("../controllers/authController");

router.post("/login", login);

router.get("/me", auth, getCurrentUser);

router.post("/refresh", refreshAccessToken);

module.exports = router;