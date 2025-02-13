const express = require("express");
const {
  createUser,
  loginUser,
  myProfile,
  updateProfile,
  //getUser,
  //getParticularUser,
  //updateUser,
  //deleteUser,
} = require("../controllers/userController");
const { userMiddleware } = require("../middleware/authMiddleware");
const userRouter = express.Router();

userRouter.post("/Signup", createUser);
userRouter.post("/Login", loginUser);
userRouter.get("/myProfile", userMiddleware, myProfile);
userRouter.put("/updateProfile/:id", updateProfile);
// userRouter.get("/users", getUser);
// userRouter.get("/getParticularUser/:id", getParticularUser);
//userRouter.put("/updateUser/:id", updateUser);
//userRouter.delete("/deleteUser/:id", deleteUser);
module.exports = userRouter;
