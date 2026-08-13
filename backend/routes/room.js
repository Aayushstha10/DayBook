const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const getRoom = require("../controllers/getMyRoom");
const addMember = require("../controllers/addMember");
const searchUsers = require("../controllers/searchUsers");

const createRoomExpense =
  require("../controllers/createRoomExpense");

const getRoomExpenses =
  require("../controllers/getRoomExpenses");

const updateRoomExpense =
  require("../controllers/updateRoomExpense");

const deleteRoomExpense =
  require("../controllers/deleteRoomExpense");

router.use(auth);

// ==========================================
// ADMIN
// ==========================================

router.get(
  "/users/search",
  admin,
  searchUsers
);

router.post(
  "/:roomId/members",
  admin,
  addMember
);

// ==========================================
// ROOM
// ==========================================

router.get(
  "/:roomId",
  getRoom
);

// ==========================================
// ROOM EXPENSE
// ==========================================

// Admin + members
router.post(
  "/:roomId/expenses",
  createRoomExpense
);

// Admin + members
router.get(
  "/:roomId/expenses",
  getRoomExpenses
);

// Admin + creator
router.put(
  "/:roomId/expenses/:expenseId",
  updateRoomExpense
);

// Admin + creator
router.delete(
  "/:roomId/expenses/:expenseId",
  deleteRoomExpense
);

module.exports = router;