const Chat = require("../model/chatModel");
const Message = require("../model/messageModel");
const User = require("../model/user");

// Get all Messages
// GET /api/message/:chatId
exports.allMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const chatId = req.params.chatId;

    console.log("📨 [allMessage] Fetching messages for chat:", chatId);

    // Mark unseen messages as seen
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: currentUserId },
        seenBy: { $ne: currentUserId },
      },
      { $addToSet: { seenBy: currentUserId } }
    );

    // Fetch full messages
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "firstName profileImage email")
      .populate("receiver", "firstName profileImage email")
      .populate("chat");

    // 🔔 Emit "seen updated" to the other user in chat via socket
    const chat = await Chat.findById(chatId).populate("users", "_id");

    const otherUser = chat.users.find(
      (user) => user._id.toString() !== currentUserId.toString()
    );

    if (otherUser && req.io) {
      req.io.to(otherUser._id.toString()).emit("seen updated");
      console.log(`✅ [Socket] seen updated emitted to user: ${otherUser._id}`);
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ [allMessage] Fetch error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Create New Message
// POST /api/message/newChat
exports.sendMessage = async (req, res) => {
  const { content, chatId, receiverId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ error: "Invalid data passed into request" });
  }

  const newMessage = {
    sender: req.user._id,
    receiver: receiverId,
    content,
    chat: chatId,
    seenBy: [req.user._id], //  sender has seen their own message
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "firstName profileImage");
    message = await message.populate("receiver", "firstName profileImage");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "firstName profileImage email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message", details: error.message });
  }
};

exports.unseenMessageCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      seenBy: { $ne: req.user._id },
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
