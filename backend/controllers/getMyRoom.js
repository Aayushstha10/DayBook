const Room = require("../models/Room");

const getMyRoom = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);

    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const room = await Room.findOne({
      $or: [{ admin: userId }, { members: userId }],
    })
      .populate("admin", "username email")
      .populate("members", "username email");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "You are not in any room",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("GET MY ROOM ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = getMyRoom;
