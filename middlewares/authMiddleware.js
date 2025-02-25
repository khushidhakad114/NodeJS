const jwt = require("jsonwebtoken");
const User = require("../src/models/User");
const mongoose = require("mongoose");

const authMiddleware = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    const { token } = cookies;
    if (!token) {
      throw new Error("Unauthorized");
    }
    const decoded = jwt.verify(token, "secret");
    const userId = new mongoose.Types.ObjectId(decoded.id);
    req.user = await User.findOne({ _id: userId }).select("-password");
    console.log(req.user);
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "You are not authorized" });
  }
};
module.exports = authMiddleware;
