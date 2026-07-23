const { auth } = require("../config/firebase");
const User = require("../models/User");
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

    // Verify Firebase token
   const decodedToken = await auth.verifyIdToken(idToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number not found",
      });
    }

    // Find existing user
    let user = await User.findOne({ phone });

    let isNewUser = false;

    // Create user if first login
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

    res.status(200).json({
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
  console.error("Message:", error.message);

  if (error.code) {
    console.error("Code:", error.code);
  }

  console.error(error);

  return res.status(401).json({
    success: false,
    message: error.message,
  });
}
};

module.exports = {
  login,
};