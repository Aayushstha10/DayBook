const Room = require("../models/Room");
async function requireRoomMember(req, res, next) {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const userId = req.user._id.toString();
    const isMember = room.members.some((m) => m.toString() === userId);
    const isAdmin = room.admin.toString() === userId;

    if (!isMember && !isAdmin) {
      return res
        .status(403)
        .json({ message: "You do not have access to this room" });
    }

    req.room = room;
    req.isRoomAdmin = isAdmin;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to verify room access" });
  }
}

// Gate for admin-only actions inside a room (e.g. adding/removing members)
function requireRoomAdmin(req, res, next) {
  if (!req.isRoomAdmin) {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}

module.exports = { requireRoomMember, requireRoomAdmin };