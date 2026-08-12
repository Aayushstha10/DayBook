const Room = require("../models/Room");

const isRoomAdmin = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.admin.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only room admin can perform this action",
      });
    }

    // Attach room so controllers don't need to re-fetch it
    req.room = room;

    next();
  } catch (error) {
    console.error("IS ROOM ADMIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to verify admin",
    });
  }
};

module.exports = isRoomAdmin;