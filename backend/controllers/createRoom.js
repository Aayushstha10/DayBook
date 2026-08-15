const Room = require("../models/Room");

const createRoom = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Room name is required",
      });
    }

    const room = await Room.create({
      name: name.trim(),

      // creator becomes admin
      admin: userId,

      // creator is also a member
      members: [userId],
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("admin", "name email")
      .populate("members", "name email");

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: populatedRoom,
    });

  } catch (error) {
    console.error("CREATE ROOM ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create room",
    });
  }
};

module.exports = createRoom;