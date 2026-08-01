const router = require("express").Router();

const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const {getallexpenses } = require("../controllers/getallexpenses");
const {makeAdmin} =require("../controllers/makeAdmin");
const deleteExpense = require("../controllers/deleteExpense")

router.get(
    "/room-expenses",
    auth,
    isAdmin,
    getallexpenses
);

router.put(
    "/make-admin",
    auth,
    isAdmin,
    makeAdmin
);

router.delete(
"/admin/expense/:id",
auth,
isAdmin,
deleteExpense
)

module.exports = router;