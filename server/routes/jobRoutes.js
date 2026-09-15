const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createJob,
  getWorkerJobs,
  getCustomerJobs,
  acceptJob,
  rejectJob,
  completeJob,
  cancelJob,
} = require("../controllers/jobController");

router.post("/", auth, createJob);

router.get("/worker", auth, getWorkerJobs);

router.get("/customer", auth, getCustomerJobs);

router.patch("/:id/accept", auth, acceptJob);

router.patch("/:id/reject", auth, rejectJob);

router.patch("/:id/complete", auth, completeJob);

router.patch("/:id/cancel", auth, cancelJob);

module.exports = router;