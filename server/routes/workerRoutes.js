console.log("✅ workerRoutes loaded");
const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const validateWorkerRegistration = require("../validators/workerValidator");

const {
  registerWorker,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/workerController");

// Register Worker
router.post(
  "/register",
  auth,
  validateWorkerRegistration,
  registerWorker
);

// Get Logged-in Worker Profile
router.get("/me", auth, getMyProfile);

// Update Logged-in Worker Profile
router.put("/me", auth, updateMyProfile);

module.exports = router;