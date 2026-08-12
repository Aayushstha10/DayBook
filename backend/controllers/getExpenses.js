const Expense = require("../models/Expenses");


const getExpenses = async (req, res) => {
  try {
    const { room } = req.query;

    if (!room) {
      return res.status(400).json({
        success: false,
        message: "A room query param is required, e.g. /expenses?room=<roomId>.",
      });
    }

    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    if (!roomDoc.isMember(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this room.",
      });
    }

    const expenses = await Expense.find({ room })
      .populate("paidBy", "name email")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      expenses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = getExpenses;