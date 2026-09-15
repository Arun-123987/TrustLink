const { auth } = require("../config/firebase");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");

const login = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required",
      });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number not found",
      });
    }

    let user = await User.findOne({ phone });

    let isNewUser = false;

    if (!user) {
      user = await User.create({
        phone,
        role: "pending",
        isPhoneVerified: true,
      });

      isNewUser = true;
    }

    user.lastLogin = new Date();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      isNewUser,
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error("===== AUTH ERROR =====");
    console.error(error);

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        role: user.role,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Session no longer exists",
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token has been revoked",
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to refresh session",
    });
  }
};

module.exports = {
  login,
  getCurrentUser,
  refreshAccessToken,
};