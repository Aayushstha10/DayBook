const User = require("../models/User");

const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.trim() === "") {
      return res.status(200).json({
        success: true,
        users: [],
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
      .select("_id username email role")
      .limit(10);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = searchUsers;