const Room = require("../models/Room");

// Helper: is the requester the admin, or a joined member, of this room?
function getAccess(room, userId, userEmail) {
  const isAdmin = room.admin._id
    ? room.admin._id.toString() === userId
    : room.admin.toString() === userId;

  const isJoinedMember = room.members.some(
    (m) => m.email === userEmail && m.status === "joined"
  );

  return { isAdmin, canAccess: isAdmin || isJoinedMember };
}

// GET /api/rooms/:roomId
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId).populate(
      "admin",
      "name email"
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const { isAdmin, canAccess } = getAccess(room, req.user.id, req.user.email);

    if (!canAccess) {
      return res.status(403).json({ message: "You are not a member of this room" });
    }

    // Mark a still-pending member as joined the first time they
    // successfully load the room (optional but keeps `status` accurate).
    const me = room.members.find((m) => m.email === req.user.email);
    if (me && me.status === "pending") {
      me.status = "joined";
      await room.save();
    }

    res.json({ room, isAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load room" });
  }
};

// POST /api/rooms/:roomId/members   { email }
// Admin only.
exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const room = await Room.findById(req.params.roomId).populate(
      "admin",
      "name email"
    );
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const { isAdmin } = getAccess(room, req.user.id, req.user.email);
    if (!isAdmin) {
      return res.status(403).json({ message: "Only the admin can add members" });
    }

    const normalized = email.trim().toLowerCase();
    const alreadyIn =
      room.members.some((m) => m.email === normalized) ||
      room.admin.email === normalized;

    if (alreadyIn) {
      return res.status(400).json({ message: "That person is already in the room" });
    }

    room.members.push({ email: normalized, status: "pending" });
    await room.save();

    res.json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add member" });
  }
};

// DELETE /api/rooms/:roomId/members/:email
// Admin only.
exports.removeMember = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId).populate(
      "admin",
      "name email"
    );
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const { isAdmin } = getAccess(room, req.user.id, req.user.email);
    if (!isAdmin) {
      return res.status(403).json({ message: "Only the admin can remove members" });
    }

    const target = decodeURIComponent(req.params.email).toLowerCase();
    room.members = room.members.filter((m) => m.email !== target);
    await room.save();

    res.json({ room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove member" });
  }
};

exports.getAccess = getAccess;