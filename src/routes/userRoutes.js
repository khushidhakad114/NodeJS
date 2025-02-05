const express = require("express");
const {
  createUser,
  getUser,
  getParticularUser,
} = require("../controllers/userController");
const userRouter = express.Router();

userRouter.post("/add-user", createUser);
userRouter.get("/users", getUser);
userRouter.get("/getParticularUser/:id", getParticularUser);
module.exports = userRouter;
