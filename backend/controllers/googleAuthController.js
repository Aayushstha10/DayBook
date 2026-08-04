const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture, sub: googleId } = payload;

    const ADMIN_EMAILS = ["aayushshrestha003@gmail.com", "barsha@gmail.com"];

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        picture,
        googleId,
        authProvider: "google",
        role:
          email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "admin" : "user",
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }

      user.name = name;
      user.picture = picture;
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        user.role = "admin";
      }

      await user.save();
    }

    const authToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.secret,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({
      message: "Google authentication failed",
    });
  }
};
