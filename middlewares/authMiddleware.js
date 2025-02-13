const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const cookies = req.cookies;

    const { token } = cookies;
    if (!token) {
      throw new Error("You are not authorized");
    }
    const decoded = jwt.verify(token, "secret");
    console.log(decoded, "decoded");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "You are not authorized" });
  }
};
module.exports = authMiddleware;
