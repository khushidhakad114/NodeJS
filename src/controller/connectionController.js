const mongoose = require("mongoose");
const User = require("../model/user");
const Connection = require("../model/connection");


const getUserId = (req) => {
  return req.user?._id || req.user?.id || req.user;
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

exports.connectionRequest = async (req, res) => {
  try {
    const loggedInId = getUserId(req);
    const { toUserId, status } = req.params;

    if (!loggedInId || !isValidObjectId(loggedInId)) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }
    if (!toUserId || !isValidObjectId(toUserId)) {
      return res.status(400).json({
        message: "Invalid target user ID",
      });
    }
   const allowedStatus = ["ignored", "interested"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid connection status",
      });
    }
    if (loggedInId.toString() === toUserId.toString()) {
      return res.status(400).json({
        message: "You cannot send a connection request to yourself",
      });
    }

    const targetUser = await User.findById(toUserId).select("_id");

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        {
          sender: loggedInId,
          receiver: toUserId,
        },
        {
          sender: toUserId,
          receiver: loggedInId,
        },
      ],
    });

    if (existingConnection) {
      if (existingConnection.status === "block") {
        return res.status(403).json({
          message: "Cannot send request because user is blocked",
        });
      }

      if (existingConnection.status === "accepted") {
        return res.status(400).json({
          message: "You are already connected with this user",
        });
      }

      if (
        existingConnection.status === "interested" ||
        existingConnection.status === "ignored"
      ) {
        return res.status(400).json({
          message: "Connection request already exists",
        });
      }
    }

    const newConnection = await Connection.create({
      sender: loggedInId,
      receiver: toUserId,
      status,
    });

    return res.status(201).json({
      message: "Connection request sent successfully",
      data: newConnection,
    });
  } catch (err) {
    console.error("Connection request error:", err);

    return res.status(500).json({
      message: "Error sending connection request",
      details: err.message,
    });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const loggedInId = getUserId(req);
    const { id, status } = req.params;

    if (!loggedInId || !isValidObjectId(loggedInId)) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid connection request ID",
      });
    }

    const allowedStatus = ["accepted", "ignored"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid request status",
      });
    }
    const connectionRequest = await Connection.findOne({
      _id: id,
      receiver: loggedInId,
      status: "interested",
    });

    if (!connectionRequest) {
      return res.status(404).json({
        message:
          "Connection request not found or you are not authorized to update it",
      });
    }
    connectionRequest.status = status;

    await connectionRequest.save();

    return res.status(200).json({
      message:
        status === "accepted"
          ? "Connection request accepted successfully"
          : "Connection request ignored successfully",

      updatedRequest: connectionRequest,
    });
  } catch (err) {
    console.error("Update connection request error:", err);

    return res.status(500).json({
      message: "Error updating connection request",
      details: err.message,
    });
  }
};


exports.getAllReceivingRequest = async (req, res) => {
  try {
    const loggedInId = getUserId(req);

    if (!loggedInId || !isValidObjectId(loggedInId)) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    const receiveRequest = await Connection.find({
      receiver: loggedInId,
      status: "interested",
    })
      .populate("sender", "firstName lastName about profileImage")
      .select("_id sender status createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      receiveRequest,
    });
  } catch (err) {
    console.error("Error fetching receiving requests:", err);

    return res.status(500).json({
      message: "Error fetching receiving requests",
      details: err.message,
    });
  }
};

exports.getAllSenderRequest = async (req, res) => {
  try {
    const loggedInId = getUserId(req);

    if (!loggedInId || !isValidObjectId(loggedInId)) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    const senderRequest = await Connection.find({
      sender: loggedInId,
      status: "interested",
    })
      .populate("receiver", "firstName lastName about profileImage")
      .select("_id receiver status createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      senderRequest,
    });
  } catch (err) {
    console.error("Error fetching sent requests:", err);

    return res.status(500).json({
      message: "Error fetching sent requests",
      details: err.message,
    });
  }
};


exports.getAllFriends = async (req, res) => {
  try {
    const loggedInId = getUserId(req);

    if (!loggedInId || !isValidObjectId(loggedInId)) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    const friends = await Connection.find({
      status: "accepted",
      $or: [
        {
          sender: loggedInId,
        },
        {
          receiver: loggedInId,
        },
      ],
    })
      .populate(
        "sender",
        "firstName lastName about profileImage"
      )
      .populate(
        "receiver",
        "firstName lastName about profileImage"
      );

    const data = friends
      .map((friend) => {
        if (!friend.sender || !friend.receiver) {
          return null;
        }

        if (
          friend.sender._id.toString() ===
          loggedInId.toString()
        ) {
          return friend.receiver;
        }

        return friend.sender;
      })
      .filter(Boolean);

    return res.status(200).json({
      data,
    });
  } catch (err) {
    console.error("Error getting friends:", err);

    return res.status(500).json({
      message: "Error getting all friends",
      details: err.message,
    });
  }
};

exports.getFriendProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "Friend not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (err) {
    console.error("Error fetching friend profile:", err);

    return res.status(500).json({
      message: "Error fetching friend profile",
      details: err.message,
    });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const loggedInId = getUserId(req);
    const { id: targetUserId, status } = req.params;

    if (!loggedInId || !isValidObjectId(loggedInId)) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }
    if (
      !targetUserId ||
      !isValidObjectId(targetUserId)
    ) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (
      loggedInId.toString() ===
      targetUserId.toString()
    ) {
      return res.status(400).json({
        message: "You cannot block yourself",
      });
    }

    const allowedStatus = ["block", "unblock"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid block status",
      });
    }

    const targetUser = await User.findById(
      targetUserId
    ).select("_id");

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (status === "block") {
      let existingConnection = await Connection.findOne({
        $or: [
          {
            sender: loggedInId,
            receiver: targetUserId,
          },
          {
            sender: targetUserId,
            receiver: loggedInId,
          },
        ],
      });

      if (existingConnection) {
        existingConnection.status = "block";

        await existingConnection.save();

        return res.status(200).json({
          message: "User blocked successfully",
          data: existingConnection,
        });
      }

      const blockConnection = await Connection.create({
        sender: loggedInId,
        receiver: targetUserId,
        status: "block",
      });

      return res.status(201).json({
        message: "User blocked successfully",
        data: blockConnection,
      });
    }

    const blockedConnection = await Connection.findOne({
      sender: loggedInId,
      receiver: targetUserId,
      status: "block",
    });

    if (!blockedConnection) {
      return res.status(404).json({
        message: "No blocked user found",
      });
    }

    // Remove block relationship completely
    await Connection.findByIdAndDelete(
      blockedConnection._id
    );

    return res.status(200).json({
      message: "User unblocked successfully",
    });
  } catch (err) {
    console.error("Error updating block status:", err);

    return res.status(500).json({
      message: "Error updating user status",
      details: err.message,
    });
  }
};