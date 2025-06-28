const jwt = require("jsonwebtoken");
const User = require("../model/user");

const userMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, "secret"); // ⛔ Hardcoded secret is fine for dev, but use env vars in prod
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // make user available to downstream routes
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { userMiddleware };