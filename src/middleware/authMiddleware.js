const jwt = require("jsonwebtoken");
const User = require("../model/user");
const mongoose = require("mongoose");

const userMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, "secret");
    console.log("Decoded Token:", decoded);

    const userId =new mongoose.Types.ObjectId(decoded.id);
    req.user = await User.findOne({ _id: userId }).select("-password");

    // console.log("Fetched User:", req.user);

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    next();
  } catch (err) {
    console.error("Middleware Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

module.exports = { userMiddleware };
