const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "invalid email or password" });
    }
    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res.status(400).json({ message: "invalid email or password" });
    }

    //generate token

    const token = jwt.sign({ id: user._id }, process.env.secret, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      messge: "login successfully",
      token,
      user: {
        id:user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    return res.json({ message: err.message });
  }
};

module.exports=login;
