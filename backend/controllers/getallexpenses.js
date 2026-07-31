const Expense = require("../models/Expenses");

const getallexpenses = async (req, res) => {
  try {
const expenses = await Expense.find().populate("user");

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

module.exports = getallexpenses;
