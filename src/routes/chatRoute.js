const express = require("express");
const { userMiddleware } = require("../middleware/authMiddleware");
const { accessChat, fetchChats, getChatById } = require("../controller/chatController");

const chatRouter=express.Router();

chatRouter.post("/accessChat",userMiddleware, accessChat);
chatRouter.get("/chat/:id", userMiddleware, getChatById);
chatRouter.get("/fetchChat", userMiddleware, fetchChats);



module.exports=chatRouter;