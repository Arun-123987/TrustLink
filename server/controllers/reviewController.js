const Review = require("../models/Review");
const JobRequest = require("../models/JobRequest");
const Worker = require("../models/Worker");

const createReview = async (req, res) => {
  try {
    const {
      jobId,
      rating,
      comment,
      tags,
    } = req.body;

    if (!jobId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Job and rating are required",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const job = await JobRequest.findOne({
      _id: jobId,
      customer: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (job.status !== "completed") {
      return res.status(400).json({
        success: false,
        message:
          "You can only review completed bookings",
      });
    }

    const existingReview = await Review.findOne({
      job: job._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    const worker = await Worker.findById(job.worker);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    const cleanTags = Array.isArray(tags)
      ? tags
          .filter((tag) => typeof tag === "string")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 5)
      : [];

    const review = await Review.create({
      job: job._id,
      customer: req.user._id,
      worker: worker._id,
      rating: numericRating,
      comment: comment?.trim() || "",
      tags: cleanTags,
    });

    // Recalculate worker average rating
    const reviews = await Review.find({
      worker: worker._id,
    }).select("rating");

    const totalRating = reviews.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    const averageRating =
      reviews.length > 0
        ? totalRating / reviews.length
        : 0;

    worker.reputationScore = Number(
      averageRating.toFixed(2)
    );

    await worker.save();

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
      workerRating: worker.reputationScore,
    });
  } catch (error) {
    console.error("Create Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
};

const getWorkerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      worker: req.params.workerId,
    })
      .populate("customer", "displayName name")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

module.exports = {
  createReview,
  getWorkerReviews,
};