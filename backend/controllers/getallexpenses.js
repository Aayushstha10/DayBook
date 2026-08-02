const Expense = require("../models/Expenses");

const getallexpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate("user", "name email");

    res.status(200).json({
      success: true,
      expenses,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = getallexpenses;