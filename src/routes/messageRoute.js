const { allMessage, sendMessage } = require("../controller/messageController");
const { userMiddleware } = require("../middleware/authMiddleware");

express=require("express");

const messageRouter=express.Router();

 messageRouter.get("/message/:chatId", userMiddleware, allMessage );
 messageRouter.post("/message/newChat",userMiddleware, sendMessage);


module.exports=messageRouter;