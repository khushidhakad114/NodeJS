const jwt = require("jsonwebtoken");
const User = require("../models/User");
const userMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, "secret");
    console.log(decoded);
    req.user = await User.findOne({ email: decoded.email });
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }
    next();
  } catch (err) {
    console.log(err);
  }
};

module.exports = { userMiddleware };
