const jwt = require("jsonwebtoken");
const userMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, "secret");
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
  }
};

module.exports = { userMiddleware };