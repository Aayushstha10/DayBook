const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const getRoom = require("../controllers/getRoom");
const addMember = require("../controllers/addMember");
const searchUsers = require("../controllers/searchUsers");

router.use(auth);

// Admin only
router.get("/users/search", admin, searchUsers);

// Admin only
router.post("/:roomId/members", admin, addMember);

// Logged-in room member/admin
router.get("/:roomId", getRoom);

module.exports = router;