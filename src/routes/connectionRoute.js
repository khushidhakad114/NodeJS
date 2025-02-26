const express=require("express");
const { userMiddleware } = require("../middleware/authMiddleware");
const { connectionRequest, updateRequest, userConnectionRequest, getAllReceivingRequest, getAllSenderRequest } = require("../controller/connectionController");
const connectionRouter=express.Router();

connectionRouter.post("/request/send/:status/:toUserId",userMiddleware,connectionRequest); //send request
connectionRouter.post("/request/update/:status/:id",userMiddleware,updateRequest); //update request
connectionRouter.get("/request/receiverAllConnectionReq",userMiddleware,getAllReceivingRequest); //check received request
connectionRouter.get("/request/senderAllConnectionReq", userMiddleware, getAllSenderRequest); //check sent request
module.exports=connectionRouter;