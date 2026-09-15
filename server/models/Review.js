const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRequest",
      required: true,
      unique: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({
  worker: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Review", reviewSchema);