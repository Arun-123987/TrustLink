const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    role: {
    type: String,
    enum: ["user", "worker", "admin", "pending"],
    default: "pending",
},

    displayName: {
  type: String,
  default: "",
  trim: true,
},

    profileImage: {
      type: String,
      default: "",
    },

    isPhoneVerified: {
      type: Boolean,
      default: true,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    fcmToken: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);