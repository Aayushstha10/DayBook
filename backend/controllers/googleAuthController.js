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

    // Assign role based on email
    const role =
      email === "aayushshrestha003@gmail.com" ? "admin" : "user";

    let user = await User.findOne({ email });

    if (!user) {
      // Create new Google user
      user = await User.create({
        name,
        email,
        picture,
        googleId,
        authProvider: "google",
        role,
      });
    } else {
      // Update existing user
      user.googleId = googleId;
      user.picture = picture;
      user.role = role;

      await user.save();
    }

    // Create JWT
    const authToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.secret,
      {
        expiresIn: "7d",
      }
    );

    // Send response
    res.status(200).json({
      message: "Google login successful",
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