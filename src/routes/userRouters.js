const express=require("express");
const { postUser, getUser, updateUser, deleteUser, loginUser, userProfile, updateProfile } = require("../controller/userController");
const userRouter=express.Router();

 userRouter.post("/signUp", postUser);
 userRouter.post("/loginUser", loginUser);
 userRouter.get("/userProfile/:id", userProfile);
 userRouter.put("/userUpdateUser/:id",updateProfile);

// userRouter.get("/getUserData", getUser);
//  userRouter.put("/updateUserData/:id",updateUser)
//  userRouter.delete("/deleteUserData/:id",deleteUser)


module.exports=userRouter;