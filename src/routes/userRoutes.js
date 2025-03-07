const express = require("express");

const {
  createUser,
  loginUser,
  logOut,
  feed,
} = require("../controllers/authController");
const { myProfile, updateProfile } = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");
const userRouter = express.Router();

userRouter.post("/Signup", createUser);
userRouter.post("/Login", loginUser);
userRouter.get("/myProfile", authMiddleware, myProfile);
userRouter.put("/updateProfile", authMiddleware, updateProfile);
userRouter.post("/logout", authMiddleware, logOut);
userRouter.get("/feed", authMiddleware, feed);

module.exports = userRouter;
