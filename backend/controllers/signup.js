const User = require("../models/User");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const isexist = await User.findOne({ email });
    if (isexist) {
      return res.status(400).json({ message: "user already exist" });
    }

    const hashpasword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashpasword,
    });

    res.status(201).json({
      message: "user create successfuly",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "server error",
    });
  }
};

module.exports = signup;
