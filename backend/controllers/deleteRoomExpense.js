const Room = require("../models/Room");
const RoomExpense = require("../models/RoomExpense");

const deleteRoomExpense = async (req, res) => {
  try {
    const { roomId, expenseId } =
      req.params;

    // ==========================================
    // FIND ROOM
    // ==========================================

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const userId = req.user.id;

    // ==========================================
    // CHECK ADMIN
    // ==========================================

    const isAdmin =
      room.admin.toString() ===
      userId.toString();

    // ==========================================
    // CHECK MEMBER
    // ==========================================

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

    // ==========================================
    // FIND EXPENSE
    // ==========================================

    const expense =
      await RoomExpense.findOne({
        _id: expenseId,
        room: roomId,
      });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // ==========================================
    // PERMISSION
    // ==========================================

    const isCreator =
      expense.createdBy.toString() ===
      userId.toString();

    // Admin OR creator
    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own expense",
      });
    }

    // ==========================================
    // DELETE
    // ==========================================

    await RoomExpense.findByIdAndDelete(
      expenseId
    );

    res.json({
      success: true,
      message:
        "Expense deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE ROOM EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = deleteRoomExpense;