const User = require("../models/User");

const admin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can perform this action",
      });
    }

    req.admin = user;

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = admin;