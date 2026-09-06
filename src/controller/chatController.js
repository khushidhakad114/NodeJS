const Chat = require("../model/chatModel");
const User = require("../model/user");

// create or fetch one to one chat
// route-->post/api/accessChat
// access-->userMiddleware
exports.accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "UserId not provided" });

  const filter = {
    isGroupChat: false,
    users: { $all: [req.user._id, userId], $size: 2 },
  };

  try {
    let chat = await Chat.findOne(filter)
      .populate("users", "firstName email profileImage")
      .populate("latestMessage");

    if (!chat) {
      try {
        chat = await Chat.create({
          chatName: "sender",
          isGroupChat: false,
          users: [req.user._id, userId],
        });
      } catch (createErr) {
        // Another concurrent request won the race and inserted first.
        // The unique index rejects our insert with E11000 - just refetch.
        if (createErr.code === 11000) {
          chat = await Chat.findOne(filter)
            .populate("users", "firstName email profileImage")
            .populate("latestMessage");
        } else {
          throw createErr;
        }
      }

      chat = await Chat.findById(chat._id)
        .populate("users", "firstName email profileImage")
        .populate("latestMessage");
    }

    const fullChat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "firstName profileImage email",
    });

    return res.status(200).json(fullChat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate(
      "users",
      "firstName lastName email profileImage"
    );

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
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