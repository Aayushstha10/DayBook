const Room = require("../models/Room");

const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      });
    }

    const room = await Room.findById(roomId)
      .populate("admin", "username name email")
      .populate("members", "username name email");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Make sure the logged-in user belongs to this room
    const userId = String(req.user.id || req.user._id);

    const adminId = room.admin?._id
      ? String(room.admin._id)
      : String(room.admin);

    const isAdmin = adminId === userId;

    const isMember = room.members?.some(
      (member) => String(member._id || member) === userId
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this room",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("GET ROOM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = getRoom;