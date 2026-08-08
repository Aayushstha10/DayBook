
const Room = require("../models/Room");
const Expense = require("../models/Expenses");
const { getAccess } = require("./roomController");

// Check room access
const checkRoomAccess = async (req, res) => {
  const room = await Room.findById(req.params.roomId).populate(
    "admin",
    "name email"
  );

  if (!room) {
    res.status(404).json({
      success: false,
      message: "Room not found",
    });
    return null;
  }

  const { isAdmin, canAccess } = getAccess(
    room,
    req.user.id,
    req.user.email
  );

  if (!canAccess) {
    res.status(403).json({
      success: false,
      message: "You are not a member of this room",
    });
    return null;
  }

  return { room, isAdmin };
};

// GET /api/rooms/:roomId/expenses
const getExpenses = async (req, res) => {
  try {
    const access = await checkRoomAccess(req, res);

    if (!access) return;

    const { room } = access;

    const expenses = await Expense.find({
      room: room._id,
    })
      .populate("user", "name email")
      .sort({
        date: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      expenses,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to load expenses",
    });
  }
};

// POST /api/rooms/:roomId/expenses
const createExpense = async (req, res) => {
  try {
    const access = await checkRoomAccess(req, res);

    if (!access) return;

    const { room } = access;

    const {
      title,
      amount,
      category,
      date,
      splitAmong,
    } = req.body;

    if (
      !title ||
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and amount are required",
      });
    }

    // If splitAmong is not provided,
    // automatically split between admin + joined members.
    let participants = Array.isArray(splitAmong)
      ? splitAmong
      : [];

    if (participants.length === 0) {
      participants = [
        room.admin.email,
        ...room.members
          .filter((member) => member.status === "joined")
          .map((member) => member.email),
      ];
    }

    const expense = await Expense.create({
      room: room._id,
      user: req.user.id,
      title,
      amount,
      category,
      date: date || undefined,
      splitAmong: participants,
    });

    const populatedExpense = await expense.populate(
      "user",
      "name email"
    );

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      expense: populatedExpense,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// PUT /api/rooms/:roomId/expenses/:expenseId
const updateExpense = async (req, res) => {
  try {
    const access = await checkRoomAccess(req, res);

    if (!access) return;

    const { room, isAdmin } = access;

    const expense = await Expense.findOne({
      _id: req.params.expenseId,
      room: room._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Expense creator
    const isOwner =
      expense.user.toString() === req.user.id.toString();

    // Only admin can edit another user's expense
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own expenses",
      });
    }

    const {
      title,
      amount,
      category,
      date,
      splitAmong,
    } = req.body;

    if (title !== undefined) {
      expense.title = title;
    }

    if (amount !== undefined) {
      expense.amount = amount;
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (date !== undefined) {
      expense.date = date || undefined;
    }

    // Only admin can change splitAmong
    if (
      isAdmin &&
      Array.isArray(splitAmong) &&
      splitAmong.length > 0
    ) {
      expense.splitAmong = splitAmong;
    }

    await expense.save();

    const populatedExpense = await expense.populate(
      "user",
      "name email"
    );

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense: populatedExpense,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE /api/rooms/:roomId/expenses/:expenseId
const deleteExpense = async (req, res) => {
  try {
    const access = await checkRoomAccess(req, res);

    if (!access) return;

    const { room, isAdmin } = access;

    const expense = await Expense.findOne({
      _id: req.params.expenseId,
      room: room._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Expense creator
    const isOwner =
      expense.user.toString() === req.user.id.toString();

    // Admin can delete anyone's expense.
    // Normal member can delete only their own expense.
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own expenses",
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};

