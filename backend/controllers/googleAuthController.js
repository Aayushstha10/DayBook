const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        picture,
        googleId,
        authProvider: 'google',
        // no password needed for google users
      });
    } else if (!user.googleId) {
      // existing email/password user logging in with google — link accounts
      user.googleId = googleId;
      await user.save();
    }

    // Issue your existing JWT, same as normal login
    const authToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.secret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token: authToken,
      user: { id: user._id, name: user.name, email: user.email, picture: user.picture },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};