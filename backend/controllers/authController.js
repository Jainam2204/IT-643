const authService = require("../services/authService");
const { logoutUserService } = require("../services/authService");

exports.register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(200).json({ message: "Verification email sent.", userId: user._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { token, user } = await authService.loginUser(req.body);

    // Set cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true on prod (HTTPS)
      sameSite: "lax", // or "none" if using cross-site + HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // No need to send token in body now
    res.status(200).json({ message: "Login Success", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.me = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const id = req.body.userId;
    const verificationCode = req.body.verificationCode;
    const message = await authService.verifyUserEmail(id, verificationCode);
    res.status(200).json({ message });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.logoutUser = (req, res) => {
  try {
    logoutUserService(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
