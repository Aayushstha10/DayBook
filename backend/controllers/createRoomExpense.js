const Room = require("../models/Room");
const RoomExpense = require("../models/RoomExpense");

const createRoomExpense = async (req, res) => {
  try {
    const { roomId } = req.params;

    const {
      title,
      amount,
      category,
      date,
      splitUsers,
    } = req.body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (
      !title ||
      !amount ||
      !category ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!Array.isArray(splitUsers)) {
      return res.status(400).json({
        success: false,
        message: "Invalid split users",
      });
    }

    if (splitUsers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one user",
      });
    }

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
      room.admin.toString() === userId.toString();

    const isMember = room.members.some(
      (member) =>
        member.toString() === userId.toString()
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a member of this room",
      });
    }

    // ==========================================
    // CHECK SPLIT USERS BELONG TO ROOM
    // ==========================================

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
            "A selected user is not a room member",
        });
      }
    }

    // ==========================================
    // PREVENT DUPLICATE USERS
    // ==========================================

    const uniqueUsers = new Set(
      splitUsers.map((item) =>
        item.userId.toString()
      )
    );

    if (
      uniqueUsers.size !== splitUsers.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A user cannot be selected twice",
      });
    }

    // ==========================================
    // FORMAT SPLIT
    // ==========================================

    const formattedSplitUsers =
      splitUsers.map((item) => ({
        user: item.userId,
        amount: Number(item.amount),
      }));

    // ==========================================
    // VALIDATE SPLIT AMOUNT
    // ==========================================

    const splitTotal =
      formattedSplitUsers.reduce(
        (total, item) =>
          total + Number(item.amount),
        0
      );

    const totalAmount = Number(amount);

    if (
      Math.abs(splitTotal - totalAmount) >
      0.01
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Split amounts must equal total amount",
      });
    }

    // ==========================================
    // CREATE EXPENSE
    // ==========================================

    const expense =
      await RoomExpense.create({
        room: roomId,

        title: title.trim(),

        amount: totalAmount,

        category: category.trim(),

        date,

        createdBy: userId,

        splitUsers:
          formattedSplitUsers,
      });

    // ==========================================
    // POPULATE
    // ==========================================

    const populatedExpense =
      await RoomExpense.findById(
        expense._id
      )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "splitUsers.user",
          "name email"
        );

    res.status(201).json({
      success: true,
      message:
        "Room expense created successfully",

      expense: populatedExpense,
    });

  } catch (error) {
    console.error(
      "CREATE ROOM EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = createRoomExpense;