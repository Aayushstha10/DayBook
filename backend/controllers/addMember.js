const Room = require("../models/Room");
const User = require("../models/User");

const addMember = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

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
        message: "Only this room's admin can add members",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already member
    const alreadyMember = room.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member",
      });
    }

    // Don't add admin again
    if (room.admin.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin is already part of the room",
      });
    }

    room.members.push(userId);

    await room.save();

    const updatedRoom = await Room.findById(roomId)
      .populate("admin", "username email role")
      .populate("members", "username email role");

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Add member error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = addMember;