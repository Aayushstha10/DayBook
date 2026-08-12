const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const createExpense = require("../controllers/expenses");
const getExpenses = require("../controllers/getExpenses");
const updateExpense = require("../controllers/updateExpense");
const deleteExpense = require("../controllers/deleteExpense");

// Every route requires a logged-in user.
router.use(auth);

router.post("/expenses", createExpense);
router.get("/expenses", getExpenses);

// Only an admin can edit/delete — each route now appears ONCE.
router.put("/expenses/:id", admin, updateExpense);
router.delete("/expenses/:id", admin, deleteExpense);

module.exports = router;