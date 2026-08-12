const Expense = require("../models/Expenses");

const expen = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category || !date) {
      return res.status(400).json({
        message: "title, amount, category, and date are all required.",
      });
    }

    const edetails = await Expense.create({
      title,
      amount,
      category,
      date,
      user: req.user.id,
    });

    return res.status(201).json({
      message: "Expense created successfully",
      expense: edetails,
    });
  } catch (err) {
    console.error("error", err.message);
    return res.status(400).json({ message: err.message || "Failed to create expense." });
  }
};

module.exports = expen;