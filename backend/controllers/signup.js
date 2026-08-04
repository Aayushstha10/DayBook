const User = require("../models/User");
const bcrypt = require("bcrypt");

const ADMIN_EMAILS = ["aayushshrestha003@gmail.com", "barsha@gmail.com"];

const signup = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const isexist = await User.findOne({ email });

    if (isexist) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role: isAdmin ? "admin" : "user",
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = signup;
