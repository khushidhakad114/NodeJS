const express=require("express");
const { userMiddleware } = require("../middleware/authMiddleware");
const { connectionRequest, updateRequest, userConnectionRequest } = require("../controller/connectionController");
const connectionRouter=express.Router();

connectionRouter.post("/request/send/:status/:id",userMiddleware,connectionRequest);
connectionRouter.post("/request/update/:status/:id",userMiddleware,updateRequest);
connectionRouter.get("/request/userAllConnectionReq",userMiddleware,userConnectionRequest);
module.exports=connectionRouter;