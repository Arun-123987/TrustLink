const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createJob,
  getWorkerJobs,
  acceptJob,
  rejectJob,
} = require("../controllers/jobController");

router.post("/", auth, createJob);

router.get("/worker", auth, getWorkerJobs);

router.patch("/:id/accept", auth, acceptJob);

router.patch("/:id/reject", auth, rejectJob);

module.exports = router;