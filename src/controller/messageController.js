const Chat = require("../model/chatModel");
const Message = require("../model/messageModel");
const User = require("../model/user");

// Get all Messages
// GET /api/Message/:chatId
exports.allMessage=async(req, res) => {
    try{
        const messages = await Message.find({chat: req.params.chatId})
        .populate("sender", "name profileImage email")
        .populate("chat");
        res.status(201).json(messages)
    }catch(error){
        res.status(400);
        throw new Error(error.message);
    }
};

// Create New Message
// POST /api/Message/newChat
exports.sendMessage = async(req, res) => {
    const {content, chatId} = req.body;

    if(!content || !chatId){
        return res.status(400).json("Invalid data passed into request");
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

     try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name profileImage");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name profileImage email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

