const Room = require("../models/Room");
const RoomExpense = require("../models/RoomExpense");

const getRoomExpenses = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const userId = req.user.id;

    const isAdmin =
      room.admin.toString() ===
      userId.toString();

    const isMember = room.members.some(
      (member) =>
        member.toString() ===
        userId.toString()
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a member of this room",
      });
    }

    const expenses =
      await RoomExpense.find({
        room: roomId,
      })
        .populate(
          "createdBy",
          "username email"
        )
        .populate(
          "splitUsers.user",
          "username email"
        )
        .sort({
          date: -1,
          createdAt: -1,
        });

    res.json({
      success: true,
      expenses,
    });

  } catch (error) {
    console.error(
      "GET ROOM EXPENSES ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = getRoomExpenses;