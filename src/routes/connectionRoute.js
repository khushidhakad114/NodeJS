const express=require("express");
const { userMiddleware } = require("../middleware/authMiddleware");
const { connectionRequest, updateRequest, userConnectionRequest, getAllReceivingRequest, getAllSenderRequest, getAlluserFriends } = require("../controller/connectionController");
const connectionRouter=express.Router();

connectionRouter.post("/request/send/:status/:toUserId",userMiddleware,connectionRequest);
connectionRouter.post("/request/update/:status/:id",userMiddleware,updateRequest);
connectionRouter.get("/request/receiverAllConnectionReq",userMiddleware,getAllReceivingRequest);
connectionRouter.get("/request/senderAllConnectionReq", userMiddleware, getAllSenderRequest);
connectionRouter.get("/request/userFriends",userMiddleware,getAlluserFriends);
module.exports=connectionRouter;