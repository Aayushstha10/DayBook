const Room = require("../models/Room");

const createRoom = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    // Prevent admin from creating multiple rooms
    const existingRoom = await Room.findOne({
      admin: userId,
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "You already have a room",
        room: existingRoom,
      });
    }

    const room = await Room.create({
      name: name.trim(),
      admin: userId,
      members: [],
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("admin", "username email")
      .populate("members", "username email");

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: populatedRoom,
    });
  } catch (error) {
    console.error("CREATE ROOM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = createRoom;
