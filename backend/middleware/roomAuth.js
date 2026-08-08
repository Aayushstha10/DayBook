const Room = require("../models/Room");

async function requireRoomMember(req, res, next) {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const userId = req.user._id.toString();
    const userEmail = req.user.email.toLowerCase();

    const isAdmin = room.admin.toString() === userId;
    const isMember = room.members.some(
      (m) =>
        (m.user && m.user.toString() === userId) || m.email === userEmail
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({ message: "Not authorized for this room" });
    }

    req.room = room;
    req.isRoomAdmin = isAdmin;
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Stricter: admin only
async function requireRoomAdmin(req, res, next) {
  try {
    const room = req.room || (await Room.findById(req.params.roomId));
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Admin only" });
    }

    req.room = room;
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { requireRoomMember, requireRoomAdmin };