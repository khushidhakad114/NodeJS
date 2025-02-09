const express = require("express");
const {
  postUser,
  getUser,
  getPerticularUserData,
} = require("../controller/userController");

const userRouter = express.Router();

userRouter.post("/createUser", postUser);
userRouter.get("/getUserData", getUser);
userRouter.get("/getPerticularUserData/:id", getPerticularUserData);

module.exports = userRouter;
