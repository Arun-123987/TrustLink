const User = require("../models/User");

const admin = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.admin = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Admin authorization failed",
    });
  }
};

module.exports = admin;