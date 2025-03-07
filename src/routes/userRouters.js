const express=require("express");
const { userMiddleware } = require("../middleware/authMiddleware");
const { userProfile, updateProfile } = require("../controller/profilecontroller");
const { signUser, loginUser, logoutUser, feed } = require("../controller/authController");
const userRouter=express.Router();

 userRouter.post("/signUp", signUser);
 userRouter.post("/loginUser",loginUser);
 userRouter.get("/userProfile",userMiddleware,userProfile);
 userRouter.put("/updateUserProfile",userMiddleware, updateProfile);
 userRouter.post("/logOut",logoutUser);
 userRouter.get("/feed",userMiddleware,feed)

module.exports=userRouter;