const express = require("express");
const router = express.Router();
const getallexpenses = require("../controllers/getallexpenses");
router.get("/getallexpenses", getallexpenses );
module.exports = router;
