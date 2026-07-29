const expenses = require("../models/Expenses");

const expen = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    const edetails = await expenses.create({
      title,
      amount,
      category,
      date,
      user: req.user.id,
    });
    res.status(200).json({
      message: "expenses create successfully",
      edetails: {
        title: edetails.title,
        amount: edetails.amount,
        category: edetails.category,
        date: edetails.date,
       
      },
    });
  } catch (err) {
    console.log("error", err.message);
  }
};

module.exports = expen;
