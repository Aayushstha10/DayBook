const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const createRoom = require("../controllers/createRoom");
const getRoom = require("../controllers/getRoom");
const addMember = require("../controllers/addMember");
const searchUsers = require("../controllers/searchUsers");

router.use(auth);

// Create room
router.post("/", createRoom);

// Search users - admin only
router.get("/users/search", admin, searchUsers);

// Add member - admin only
router.post("/:roomId/members", admin, addMember);

// Get room
router.get("/:roomId", getRoom);

module.exports = router;