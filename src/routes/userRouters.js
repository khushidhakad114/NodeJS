const express=require("express");
const { postUser, getUser, updateUser, deleteUser, loginUser } = require("../controller/userController");
const userRouter=express.Router();

 userRouter.post("/signUp", postUser);
 userRouter.post("/loginUser", loginUser);

// userRouter.get("/getUserData", getUser);
//  userRouter.put("/updateUserData/:id",updateUser)
//  userRouter.delete("/deleteUserData/:id",deleteUser)


module.exports=userRouter;