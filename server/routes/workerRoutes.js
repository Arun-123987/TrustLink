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
  updateAvailability,
  testML
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

router.get("/nearby", auth, getNearbyWorkers);
/*
GET /workers/nearby?lat=12.97&lng=77.59&radius=5&skill=Plumber
*/

router.get("/dashboard", auth, getWorkerDashboard);
router.put("/availability", auth, updateAvailability);
router.get("/:id", auth, getWorkerById);
router.get("/test-ml", auth, testML);
module.exports = router;