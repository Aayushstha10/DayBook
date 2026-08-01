const express = require("express");
const router = express.Router();

const createExpense = require("../controllers/expenses");
const getExpenses = require("../controllers/getExpenses");
const updateExpense = require("../controllers/updateExpense");
const deleteExpense = require("../controllers/deleteExpense");
const getRoomExpenses = require("../controllers/getallexpenses");

router.post("/expenses", createExpense);

router.get("/expenses", getExpenses);
router.get("/allexpenses",getRoomExpenses);

router.put("/expenses/:id", updateExpense);

router.delete("/expenses/:id", deleteExpense);



module.exports = router;
