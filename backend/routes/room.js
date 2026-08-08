
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

// Get all room expenses
router.get(
  "/rooms/:roomId/expenses",
  auth,
  getExpenses
);

// Create expense
router.post(
  "/rooms/:roomId/expenses",
  auth,
  createExpense
);

// Update expense
router.put(
  "/rooms/:roomId/expenses/:expenseId",
  auth,
  updateExpense
);

// Delete expense
router.delete(
  "/rooms/:roomId/expenses/:expenseId",
  auth,
  deleteExpense
);

module.exports = router;

