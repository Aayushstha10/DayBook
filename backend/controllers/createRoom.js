const Room = require("../models/Room");

const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    // Check if user already has a room
    const existingRoom = await Room.findOne({
      admin: req.user.id,
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
      admin: req.user.id,
      members: [],
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("admin", "username email role")
      .populate("members", "username email role");

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: populatedRoom,
    });
  } catch (error) {
    console.error("CREATE ROOM ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create room",
      error: error.message,
    });
  }
};

module.exports = createRoom;