const Room = require("../models/Room");

const removeMember = async (req, res) => {
  try {
    const { roomId, userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Make sure logged-in admin is the admin of THIS room
    if (room.admin.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only this room's admin can remove members",
      });
    }

    // Admin cannot remove themselves via this route
    if (room.admin.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot be removed from the room",
      });
    }

    const wasMember = room.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (!wasMember) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this room",
      });
    }

    room.members = room.members.filter(
      (member) => member.toString() !== userId.toString()
    );

    await room.save();

    const updatedRoom = await Room.findById(roomId)
      .populate("admin", "username email role")
      .populate("members", "username email role");

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Remove member error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = removeMember;