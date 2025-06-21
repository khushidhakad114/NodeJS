const express = require("express");
const { userMiddleware } = require("../middleware/authMiddleware");
const { accessChat, fetchChat, createGroupChat, renameGroup, removeFromGroup, addToGroup } = require("../controller/chatController");

const chatRouter=express.Router();

chatRouter.post("/accessChat",userMiddleware, accessChat);
chatRouter.get("/fetchChat", userMiddleware, fetchChat);
chatRouter.post("/group", userMiddleware, createGroupChat);
chatRouter.put("/rename", userMiddleware, renameGroup);
chatRouter.put("/groupremove", userMiddleware, removeFromGroup);
chatRouter.put("/groupadd",userMiddleware, addToGroup);



module.exports=chatRouter;