const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //yeh cheez populate hoti hai
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "interested", "ignored"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

connectionSchema.set("strict", "throw");
const Connection = mongoose.model("connection", connectionSchema);
module.exports = Connection;
