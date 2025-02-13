const express=require("express");
const {  loginUser, userProfile, updateProfile, signUser,  } = require("../controller/userController");
const { userMiddleware } = require("../middleware/authMiddleware");
const userRouter=express.Router();

 userRouter.post("/signUp", signUser);
 userRouter.post("/loginUser", loginUser);
 userRouter.get("/userProfile/:id",userMiddleware, userProfile);
 userRouter.put("/userUpdateUser/:id",updateProfile);




module.exports=userRouter;