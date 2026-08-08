const express = require("express");
const router = express.Router();
const getAllExpenses = require("../controllers/getallexpenses");

router.get("/allexpenses", getAllExpenses);
module.exports = router;