
const Expense = require("../models/Expenses");

async function requireExpenseOwner(req, res, next) {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: "Expense not found" });

  const isOwner = expense.paidBy.toString() === req.user._id.toString();
  const isRoomAdmin = req.room.admin.toString() === req.user._id.toString();

  if (!isOwner && !isRoomAdmin) {
    return res.status(403).json({ message: "You can only edit your own expenses" });
  }

  req.expense = expense;
  next();
}

module.exports = { requireExpenseOwner };