console.log("✅ workerRoutes loaded");
const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const validateWorkerRegistration = require("../validators/workerValidator");

const {
  registerWorker,
  getMyProfile,
  updateMyProfile,
  getNearbyWorkers,
  getWorkerById,
  getWorkerDashboard,
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

router.get(
  "/nearby",
  auth,
  getNearbyWorkers
);

router.get("/dashboard", auth, getWorkerDashboard);
router.get("/:id", auth, getWorkerById);

module.exports = router;