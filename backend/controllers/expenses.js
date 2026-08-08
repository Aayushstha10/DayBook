const Expense = require("../models/Expenses");

const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    const expense = await Expense.create({
      title,
      amount,
      category,
      date,
      user: req.user.id,
      room: req.params.roomId || null,
    });

    const populatedExpense = await expense.populate("user", "name email");

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

module.exports = createExpense;