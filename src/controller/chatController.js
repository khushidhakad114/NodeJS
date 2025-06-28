const Chat = require("../model/chatModel");
const User = require("../model/user");

// create or fetch one to one chat
// route-->post/api/accessChat
// access-->userMiddleware
exports.accessChat = async (req, res) => {
  const { userId } = req.body; // receiver's ID

  if (!userId) {
    return res.status(400).json({ error: "UserId not provided" });
  }

  try {
    // Check if a chat already exists between the two users
    let existingChat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "firstName email profileImage")
      .populate("latestMessage");

    existingChat = await User.populate(existingChat, {
      path: "latestMessage.sender",
      select: "firstName profileImage email",
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    // No chat exists => Create new chat
    const newChatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(newChatData);

    const fullChat = await Chat.findById(createdChat._id).populate(
      "users",
      "firstName profileImage"
    );

    return res.status(200).json(fullChat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("users", "firstName lastName email profileImage");

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    console.log("chat", chat)
    res.status(200).json(chat);
  } catch (err) {
    console.error("Error fetching chat by ID:", err);
    res.status(500).json({ error: "Failed to fetch chat details" });
  }
};

// fetch all chats for a user
// Get/api/fetchChat
exports.fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "firstName profileImage email")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const fullChats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "firstName profileImage email",
    });

    res.status(200).json(fullChats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


