const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, "secret");
    console.log(decoded);
    const userId = new mongoose.Types.ObjectId(decoded.id);
    console.log(userId);
    req.user = await User.findOne({ _id: userId }).select("-password");
    console.log(req.user);

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }
    next();
  } catch (err) {
    console.log(err);
  }
};

module.exports = { authMiddleware };
