const Expense = require("../models/Expenses");

exports.getallexpenses = async (req, res) => {

    try {

        const expenses = await Expense.find()
            .populate("user", "username email");

        res.json(expenses);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};