const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },

    subcategory: {
      type: String,
      default: "",
    },

    yearsExp: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const workerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    skills: {
      type: [skillSchema],
      default: [],
    },

    experience: {
      type: Number,
      default: 0,
    },

    hourlyRate: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
    },

    serviceRadius: {
      type: Number,
      default: 5,
    },

    languages: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    reputationScore: {
      type: Number,
      default: 0,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    isAvailable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

workerSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Worker", workerSchema);