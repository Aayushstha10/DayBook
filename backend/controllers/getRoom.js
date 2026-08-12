const Room = require("../models/Room");

const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId)
      .populate("admin", "username email role")
      .populate("members", "username email role");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check whether user belongs to room
    const isAdmin =
      room.admin._id.toString() === req.user.id.toString();

    const isMember = room.members.some(
      (member) => member._id.toString() === req.user.id.toString()
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this room",
      });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Get room error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = getRoom;