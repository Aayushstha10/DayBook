const jwt = require("jsonwebtoken");
function auth(req, res, next) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.json({
        msg: "not match try again",
      });
    }
    const decode = jwt.verify(token, process.env.secret);
    req.user = decode;
    next();
  } catch {
    return res.json({
      msg: "server error",
    });
  }
}

module.exports = auth;
