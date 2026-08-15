const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Room controllers
const createRoom = require("../controllers/createRoom");
const getMyRoom = require("../controllers/getMyRoom");
const getRoom = require("../controllers/getRoom");

// Member controllers
const addMember = require("../controllers/addMember");
const searchUsers = require("../controllers/searchUsers");
const removeMember = require("../controllers/removeMember");

// Expense controllers
const createRoomExpense = require("../controllers/createRoomExpense");
const getRoomExpenses = require("../controllers/getRoomExpenses");
const updateRoomExpense = require("../controllers/updateRoomExpense");
const deleteRoomExpense = require("../controllers/deleteRoomExpense");
const deleteRoom = require("../controllers/deleteRoom");

router.use(auth);

// ==========================================
// ADMIN
// ==========================================

// Search users
router.get("/users/search", admin, searchUsers);

// Create room
router.post("/", admin, createRoom);

// Add member
router.post("/:roomId/members", admin, addMember);

// ==========================================
// ROOM
// ==========================================

// Get current user's room
router.get("/my-room", getMyRoom);

// Get room by room ID
router.get("/:roomId", getRoom);

// ==========================================
// ROOM EXPENSE
// ==========================================

// Add expense
router.post("/:roomId/expenses", createRoomExpense);

// Get expenses
router.get("/:roomId/expenses", getRoomExpenses);

router.delete("/:roomId", admin, deleteRoom);

// Update expense
router.put("/:roomId/expenses/:expenseId", updateRoomExpense);

// Delete expense
router.delete("/:roomId/expenses/:expenseId", deleteRoomExpense);

// ==========================================
// MEMBERS
// ==========================================

// Remove member
router.delete("/:roomId/members/:userId", admin, removeMember);

module.exports = router;
