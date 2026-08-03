const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const createExpense = require("../controllers/expenses");
const getExpenses = require("../controllers/getExpenses");
const updateExpense = require("../controllers/updateExpense");
const deleteExpense = require("../controllers/deleteExpense");

router.post("/expenses", createExpense);
router.get("/expenses", getExpenses);

router.put("/expenses/:id", updateExpense);
router.delete("/expenses/:id", deleteExpense);
router.put("/expenses/:id", auth, admin, updateExpense);
router.delete("/expenses/:id", auth, admin, deleteExpense);

module.exports = router;