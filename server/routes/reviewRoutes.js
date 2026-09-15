const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const {
  createReview,
  getWorkerReviews,
} = require("../controllers/reviewController");

router.post("/", auth, createReview);

router.get(
  "/worker/:workerId",
  auth,
  getWorkerReviews
);

module.exports = router;