const Connection = require("../models/connection");
const mongoose = require("mongoose");

const sendRequest = async (req, res) => {
  try {
    const loggedInId = req.user; //taking the id of the user who is logged in
    const toUserId = req.params.toUserId; //taking the id of the user to whom the connection request is being sent
    console.log(toUserId, "SSSSS");
    const allowedStatus = ["ignored", "interested"]; //dynamic allowing status
    if (!allowedStatus.includes(req.params.status)) {
      return res.status(400).json({ message: "Invalid status" }); //checking if the status is valid
    }
    const isRequestAlreadyExists = await Connection.exists({
      $or: [
        { sender: loggedInId, receiver: toUserId }, //checking whether the user has already sent a request to the other user

        { sender: toUserId, receiver: loggedInId }, // checking whether the other user has already sent a request to the user //FIXme:JHOLLLLL
      ],
    });
    if (isRequestAlreadyExists) {
      //if the request already exists
      return res
        .status(400)
        .json({ message: "Connection request already exists" });
    }

    //if connection is not exist already then creating the new connection
    const createConnection = new Connection({
      sender: loggedInId,
      receiver: toUserId,
      status: req.params.status,
    });

    await createConnection.save();
    res.status(200).json({ message: "Connection request sent successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ err: "Error sending request", details: err.message });
  }
};

const updateRequest = async (req, res) => {
  try {
    const loggedInId = req.user._id; // Logged-in user's ID
    const { id, status } = req.params; // Request ID and new status

    const allowedStatus = ["ignored", "accepted"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the request where the logged-in user is the receiver
    const connectionRequestVariable = await Connection.findOne({
      _id: id, // Find by the request ID
      receiver: new mongoose.Types.ObjectId(loggedInId), // the logged-in user is the receiver
    });

    console.log("Requested ID:", id);
    console.log("Logged-in ID:", loggedInId);
    console.log("Found Connection:", connectionRequestVariable);

    if (!connectionRequestVariable) {
      return res
        .status(400)
        .json({ message: "Invalid request ID or not authorized" });
    }

    // status update
    connectionRequestVariable.status = status;
    const updateRequestVariable = await connectionRequestVariable.save();

    res.status(200).json({
      message: "Request updated successfully",
      updatedRequest: updateRequestVariable,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error updating request", details: err.message });
  }
};

const getAllRequests = async (req, res) => {
  //jo jo request mili
  try {
    const loggedInId = req.user._id; // ID of the logged-in user

    const receiveRequests = await Connection.find({ receiver: loggedInId }); // loggedInd mtlb mei , mei matlb loggedInd

    if (!receiveRequests.length) {
      return res.status(404).json({ message: "No requests received yet" });
    }

    res.status(200).json({ receiveRequests });
  } catch (err) {
    console.error("Error fetching receive requests:", err.message);
    res
      .status(500)
      .json({ error: "Error fetching requests", details: err.message });
  }
};

const getAllSendRequests = async (req, res) => {
  //jo jo request mili
  try {
    const loggedInId = req.user._id; // ID of the logged-in user

    const sendRequests = await Connection.find({ sender: loggedInId }); // loggedInd mtlb mei , mei matlb loggedInd

    if (!sendRequests.length) {
      return res.status(404).json({ message: "No requests received yet" });
    }

    res.status(200).json({ sendRequests });
  } catch (err) {
    console.error("Error fetching receive requests:", err.message);
    res
      .status(500)
      .json({ error: "Error fetching requests", details: err.message });
  }
};

module.exports = {
  sendRequest,
  updateRequest,
  getAllRequests,
  getAllSendRequests,
};
