const Room = require("../models/Room");
const RoomExpense = require("../models/RoomExpense");
const User = require("../models/User");

// ======================================================
// CREATE ROOM
// ======================================================

const createRoom = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Room name is required",
      });
    }

    const room = await Room.create({
      name: name.trim(),
      admin: userId,
      members: [userId],
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("admin", "username email")
      .populate("members", "username email");

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: populatedRoom,
    });
  } catch (error) {
    console.error("CREATE ROOM ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create room",
      error: error.message,
    });
  }
};

// ======================================================
// GET MY ROOM
// ======================================================

const getMyRoom = async (req, res) => {
  try {
    const userId = req.user.id;

    const room = await Room.findOne({
      members: userId,
    })
      .populate("admin", "username email")
      .populate("members", "username email");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "You are not a member of any room",
      });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("GET ROOM ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get room",
      error: error.message,
    });
  }
};

// ======================================================
// SEARCH USERS
// ======================================================

const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || !search.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search value is required",
      });
    }

    const users = await User.find({
      $or: [
        {
          username: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    })
      .select("username email")
      .limit(10);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search users",
    });
  }
};

// ======================================================
// ADD MEMBER
// ONLY ADMIN
// ======================================================

const addMember = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const { roomId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // ADMIN CHECK
    if (room.admin.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only room admin can add members",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Already member?
    const alreadyMember = room.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member",
      });
    }

    room.members.push(userId);

    await room.save();

    const updatedRoom = await Room.findById(roomId)
      .populate("admin", "username email")
      .populate("members", "username email");

    res.status(200).json({
      success: true,
      message: `${user.username} added to room`,
      room: updatedRoom,
    });
  } catch (error) {
    console.error("ADD MEMBER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add member",
      error: error.message,
    });
  }
};

// ======================================================
// REMOVE MEMBER
// ONLY ADMIN
// ======================================================

const removeMember = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const { roomId, userId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // ADMIN CHECK
    if (room.admin.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only room admin can remove members",
      });
    }

    // Admin cannot remove themselves
    if (userId.toString() === room.admin.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot remove themselves",
      });
    }

    room.members = room.members.filter(
      (member) => member.toString() !== userId.toString()
    );

    await room.save();

    const updatedRoom = await Room.findById(roomId)
      .populate("admin", "username email")
      .populate("members", "username email");

    res.status(200).json({
      success: true,
      message: "Member removed",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("REMOVE MEMBER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: error.message,
    });
  }
};

// ======================================================
// CREATE ROOM EXPENSE
// ANY ROOM MEMBER
// ======================================================

const createRoomExpense = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      roomId,
      title,
      amount,
      date,
      category,
      paidBy,
      splitUserIds,
    } = req.body;

    // --------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------

    if (
      !roomId ||
      !title ||
      !amount ||
      !date ||
      !category ||
      !paidBy ||
      !splitUserIds
    ) {
      return res.status(400).json({
        success: false,
        message: "All expense fields are required",
      });
    }

    const numericAmount = Number(amount);

    if (numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    if (!Array.isArray(splitUserIds) || splitUserIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one member",
      });
    }

    // --------------------------------------------
    // FIND ROOM
    // --------------------------------------------

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // --------------------------------------------
    // CHECK CURRENT USER IS MEMBER
    // --------------------------------------------

    const isMember = room.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this room",
      });
    }

    // --------------------------------------------
    // CHECK PAID BY IS ROOM MEMBER
    // --------------------------------------------

    const paidByIsMember = room.members.some(
      (member) => member.toString() === paidBy.toString()
    );

    if (!paidByIsMember) {
      return res.status(400).json({
        success: false,
        message: "Paid by user must be a room member",
      });
    }

    // --------------------------------------------
    // CHECK ALL SPLIT USERS ARE MEMBERS
    // --------------------------------------------

    const invalidUser = splitUserIds.some(
      (splitUserId) =>
        !room.members.some(
          (member) => member.toString() === splitUserId.toString()
        )
    );

    if (invalidUser) {
      return res.status(400).json({
        success: false,
        message: "All split users must belong to the room",
      });
    }

    // --------------------------------------------
    // REMOVE DUPLICATES
    // --------------------------------------------

    const uniqueSplitUsers = [
      ...new Set(splitUserIds.map((id) => id.toString())),
    ];

    // --------------------------------------------
    // CALCULATE EQUAL SPLIT
    // --------------------------------------------

    const numberOfPeople = uniqueSplitUsers.length;

    const share = numericAmount / numberOfPeople;

    const roundedShare = Math.floor(share * 100) / 100;

    const remainder =
      Math.round(
        (numericAmount - roundedShare * numberOfPeople) * 100
      ) / 100;

    const splitBetween = uniqueSplitUsers.map((id, index) => {
      let userAmount = roundedShare;

      if (index === uniqueSplitUsers.length - 1) {
        userAmount =
          Math.round((roundedShare + remainder) * 100) / 100;
      }

      return {
        user: id,
        amount: userAmount,
      };
    });

    // --------------------------------------------
    // CREATE EXPENSE
    // --------------------------------------------

    const expense = await RoomExpense.create({
      title: title.trim(),
      amount: numericAmount,
      date,
      category: category.trim(),
      room: roomId,
      createdBy: userId,
      paidBy,
      splitBetween,
    });

    const populatedExpense = await RoomExpense.findById(expense._id)
      .populate("createdBy", "username email")
      .populate("paidBy", "username email")
      .populate("splitBetween.user", "username email");

    res.status(201).json({
      success: true,
      message: "Room expense created successfully",
      expense: populatedExpense,
    });
  } catch (error) {
    console.error("CREATE ROOM EXPENSE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create expense",
      error: error.message,
    });
  }
};

// ======================================================
// GET ROOM EXPENSES
// ======================================================

const getRoomExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const { roomId } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // CHECK MEMBER
    const isMember = room.members.some(
      (member) => member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this room",
      });
    }

    const expenses = await RoomExpense.find({
      room: roomId,
    })
      .populate("createdBy", "username email")
      .populate("paidBy", "username email")
      .populate("splitBetween.user", "username email")
      .sort({
        date: -1,
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      expenses,
    });
  } catch (error) {
    console.error("GET ROOM EXPENSES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get room expenses",
      error: error.message,
    });
  }
};

module.exports = {
  createRoom,
  getMyRoom,
  searchUsers,
  addMember,
  removeMember,
  createRoomExpense,
  getRoomExpenses,
};