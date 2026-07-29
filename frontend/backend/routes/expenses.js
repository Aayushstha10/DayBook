const express = require("express");
const router = express.Router();

const createExpense = require("../controllers/expenses");
const getExpenses = require("../controllers/getExpenses");
const updateExpense = require("../controllers/updateExpense");
const deleteExpense = require("../controllers/deleteExpense");

// Create Expense
router.post("/expenses", createExpense);

// Get All Expenses
router.get("/expenses", getExpenses);

// Update Expense
router.put("/expenses/:id", updateExpense);

// Delete Expense
router.delete("/expenses/:id", deleteExpense);

module.exports = router;