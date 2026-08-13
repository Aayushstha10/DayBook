const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const createRoom = require("../controllers/createRoom");
const getRoom = require("../controllers/getMyRoom");
const addMember = require("../controllers/addMember");
const searchUsers = require("../controllers/searchUsers");

router.use(auth);

// ADMIN ONLY
router.post("/", admin, createRoom);

// ADMIN ONLY
router.get("/users/search", admin, searchUsers);

// ADMIN ONLY
router.post("/:roomId/members", admin, addMember);

// ADMIN + ROOM MEMBER
router.get("/:roomId", getRoom);

module.exports = router;