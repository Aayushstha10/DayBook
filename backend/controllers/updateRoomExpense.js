const Room = require("../models/Room");
const RoomExpense = require("../models/RoomExpense");

const updateRoomExpense = async (req, res) => {
  try {
    const { roomId, expenseId } =
      req.params;

    const {
      title,
      amount,
      category,
      date,
      splitUsers,
    } = req.body;

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

    // ==========================================
    // CHECK ROOM ACCESS
    // ==========================================

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
    // MEMBER CAN ONLY EDIT OWN EXPENSE
    // ADMIN CAN EDIT ANY EXPENSE
    // ==========================================

    const isCreator =
      expense.createdBy.toString() ===
      userId.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message:
          "You can only edit your own expense",
      });
    }

    // ==========================================
    // UPDATE BASIC DATA
    // ==========================================

    if (title !== undefined) {
      expense.title = title.trim();
    }

    if (amount !== undefined) {
      expense.amount = Number(amount);
    }

    if (category !== undefined) {
      expense.category = category.trim();
    }

    if (date !== undefined) {
      expense.date = date;
    }

    // ==========================================
    // UPDATE SPLIT
    // ==========================================

    if (splitUsers !== undefined) {

      if (
        !Array.isArray(splitUsers) ||
        splitUsers.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Select at least one split user",
        });
      }

      // Check users belong to room

      const allowedUsers = [
        room.admin.toString(),
        ...room.members.map((member) =>
          member.toString()
        ),
      ];

      for (const item of splitUsers) {
        if (
          !allowedUsers.includes(
            item.userId.toString()
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Selected user is not in room",
          });
        }
      }

      // Prevent duplicates

      const uniqueUsers = new Set(
        splitUsers.map((item) =>
          item.userId.toString()
        )
      );

      if (
        uniqueUsers.size !==
        splitUsers.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Duplicate split user",
        });
      }

      const formattedSplitUsers =
        splitUsers.map((item) => ({
          user: item.userId,
          amount: Number(item.amount),
        }));

      // Validate total

      const splitTotal =
        formattedSplitUsers.reduce(
          (total, item) =>
            total + Number(item.amount),
          0
        );

      if (
        Math.abs(
          splitTotal - expense.amount
        ) > 0.01
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Split amounts must equal total amount",
        });
      }

      expense.splitUsers =
        formattedSplitUsers;
    }

    await expense.save();

    const updatedExpense =
      await RoomExpense.findById(
        expense._id
      )
        .populate(
          "createdBy",
          "username email"
        )
        .populate(
          "splitUsers.user",
          "username email"
        );

    res.json({
      success: true,
      message:
        "Expense updated successfully",

      expense: updatedExpense,
    });

  } catch (error) {
    console.error(
      "UPDATE ROOM EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = updateRoomExpense;