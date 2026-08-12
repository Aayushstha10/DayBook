const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const createExpense = require("../controllers/expenses");
const getExpenses = require("../controllers/getExpenses");
const getAllExpenses = require("../controllers/getAllExpenses");
const updateExpense = require("../controllers/updateExpense");
const deleteExpense = require("../controllers/deleteExpense");

// Every route requires a logged-in user.
router.use(auth);

router.post("/expenses", createExpense);
router.get("/expenses", getExpenses);

// Admin-only routes
router.get("/allexpenses", admin, getAllExpenses);
router.put("/expenses/:id", admin, updateExpense);
router.delete("/expenses/:id", admin, deleteExpense);

module.exports = router;