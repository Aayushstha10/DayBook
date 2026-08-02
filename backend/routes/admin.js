const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const updateExpense = require("../controllers/updateExpense");
const deleteExpense = require("../controllers/deleteExpense");

router.put("/expenses/:id", auth, admin, updateExpense);

router.delete("/expenses/:id", auth, admin, deleteExpense);

module.exports = router;
