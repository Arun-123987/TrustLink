const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const {
  getDashboard,
  getPendingWorkers,
  verifyWorker,
  rejectWorker,
} = require("../controllers/adminController");

router.get("/dashboard", auth, admin, getDashboard);

router.get(
  "/workers/pending",
  auth,
  admin,
  getPendingWorkers
);

router.patch(
  "/workers/:id/verify",
  auth,
  admin,
  verifyWorker
);

router.patch(
  "/workers/:id/reject",
  auth,
  admin,
  rejectWorker
);

module.exports = router;