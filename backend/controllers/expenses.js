const expenses = require("../models/Expenses");


const expen = async (req, res) => {
  try {
    const { title, amount, category, date, split } = req.body;

    if (!room) {
      return res.status(400).json({ message: "Room is required." });
    }
    if (!paidBy) {
      return res.status(400).json({ message: "Please select who paid." });
    }

    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ message: "Room not found." });
    }

    // req.user must belong to the room
    if (!roomDoc.isMember(req.user.id)) {
      return res.status(403).json({ message: "You are not a member of this room." });
    }

    // the person the expense is attributed to as payer must also be a room member
    if (!roomDoc.isMember(paidBy)) {
      return res.status(400).json({ message: "Payer must be a member of this room." });
    }

    const edetails = await expenses.create({
      title,
      amount,
      category,
      date,
      split: split|| null,
      user: req.user.id,
    });

    return res.status(201).json({
      message: "Expense created successfully",
      expense: edetails,
    });
  } catch (err) {
    console.log("error", err.message);
    return res.status(400).json({ message: err.message || "Failed to create expense." });
  }
};

module.exports = expen;