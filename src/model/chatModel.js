const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: {
      type: String,
      trim: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate one-to-one chats between the same two users at the DB level.
// Combined with findOneAndUpdate + upsert in the controller, this makes chat
// creation safe even under concurrent/duplicate requests.
chatModel.index(
  { users: 1 },
  { unique: true, partialFilterExpression: { isGroupChat: false } }
);

const Chat = mongoose.model("Chat", chatModel);
module.exports = Chat;