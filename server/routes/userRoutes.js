const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  selectRole,
} = require("../controllers/userController");

router.put("/role", auth, selectRole);

module.exports = router;