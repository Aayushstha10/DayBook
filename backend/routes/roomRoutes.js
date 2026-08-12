const express = require("express");
const {
  createRoom,
  getMyRoom,
  searchUsers,
  addMember,
  removeMember,
  createRoomExpense,
  getRoomExpenses,
} = require("../controllers/roomController");
const auth = require("../middleware/auth");
const isRoomAdmin = require("../middleware/isRoomAdmin");

const router = express.Router();

// ======================================================
// ROOM
// ======================================================

router.post("/rooms", auth, createRoom);
router.get("/rooms/my", auth, getMyRoom);

// ======================================================
// USERS
// ======================================================

router.get("/users/search", auth, searchUsers);

// ======================================================
// MEMBERS (ADMIN ONLY)
// ======================================================

router.post(
  "/rooms/:roomId/members",
  auth,
  isRoomAdmin,
  addMember
);

router.delete(
  "/rooms/:roomId/members/:userId",
  auth,
  isRoomAdmin,
  removeMember
);

// ======================================================
// EXPENSES
// ======================================================

router.post(
  "/rooms/expenses",
  auth,
  createRoomExpense
);

router.get(
  "/rooms/:roomId/expenses",
  auth,
  getRoomExpenses
);

module.exports = router;