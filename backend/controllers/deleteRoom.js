const Room = require("../models/Room");

const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Extra protection:
    // Only the room owner/admin can delete it.
    if (room.admin.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the room admin can delete this room",
      });
    }

    await Room.findByIdAndDelete(roomId);

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });

  } catch (error) {
    console.error("DELETE ROOM ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete room",
    });
  }
};

module.exports = deleteRoom;