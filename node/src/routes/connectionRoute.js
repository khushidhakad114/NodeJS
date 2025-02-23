const express=require("express");
const { userMiddleware } = require("../middleware/authMiddleware");
const { connectionRequest } = require("../controller/connectionController");
const connectionRouter=express.Router();

connectionRouter.post("/request/send/:status/:id",userMiddleware,connectionRequest)
module.exports=connectionRouter;