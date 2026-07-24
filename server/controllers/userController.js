const User = require("../models/User");

const selectRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["customer", "worker"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Customer can be selected directly.
    // Worker role is assigned after successful worker registration.
    if (role === "customer") {
      user.role = "customer";
      await user.save();
    }

    res.json({
      success: true,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  selectRole,
};