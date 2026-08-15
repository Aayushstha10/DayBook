const Room = require("../models/Room");

// GET /api/rooms/my-rooms
// Returns EVERY room this user is admin of.
// This is separate from the existing /rooms/my-room (singular)
// endpoint, so nothing about the current single-room flow changes —
// this only adds multi-room support for admins.
const getMyRooms = async (req, res) => {
  try {
    const userId = req.user.id;

    const rooms = await Room.find({ admin: userId })
      .populate("admin", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error("GET MY ROOMS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load rooms",
    });
  }
};

module.exports = getMyRooms;

/*
Add this route in your rooms router (e.g. routes/room.routes.js),
ABOVE any "/:roomId" style route so it isn't swallowed by it:

  const getMyRooms = require("../controllers/getMyRooms");
  router.get("/my-rooms", authMiddleware, getMyRooms);

Order matters — keep it above routes like:
  router.get("/:roomId", authMiddleware, getRoomById);
otherwise Express will treat "my-rooms" as a roomId param.
*/