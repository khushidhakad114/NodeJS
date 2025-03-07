const express=require("express");
const { userMiddleware } = require("../middleware/authMiddleware");
const { connectionRequest, updateRequest, userConnectionRequest, getAllReceivingRequest, getAllSenderRequest, getAlluserFriends, getFriendProfile, blockUser } = require("../controller/connectionController");
const connectionRouter=express.Router();

connectionRouter.post("/request/send/:status/:toUserId",userMiddleware,connectionRequest); //send request
connectionRouter.post("/request/update/:status/:id",userMiddleware,updateRequest); //update request
connectionRouter.get("/request/receiverAllConnectionReq",userMiddleware,getAllReceivingRequest); //check received request
connectionRouter.get("/request/senderAllConnectionReq", userMiddleware, getAllSenderRequest); //check sent request
connectionRouter.get("/request/getAllUserFriends",userMiddleware,getAlluserFriends); //get all friends
connectionRouter.get("/request/getFriendProfile/:id",userMiddleware,getFriendProfile); //get friend profile
connectionRouter.post("/request/blockUser/:status/:id",userMiddleware,blockUser); //block user

module.exports=connectionRouter;