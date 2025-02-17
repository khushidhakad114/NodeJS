const express = require("express");
const { userMiddleware } = require("../middleware/authMiddleware");
const {
  createUser,
  loginUser,
  logOut,
} = require("../controllers/authController");
const { myProfile, updateProfile } = require("../controllers/userController");
const userRouter = express.Router();

userRouter.post("/Signup", createUser);
userRouter.post("/Login", loginUser);
userRouter.get("/myProfile", userMiddleware, myProfile);
userRouter.put("/updateProfile", userMiddleware, updateProfile);
userRouter.post("/logout", userMiddleware, logOut);

module.exports = userRouter;
