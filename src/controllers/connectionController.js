const Connection = require("../models/connection");
const mongoose = require("mongoose");

const sendRequest = async (req, res) => {
  try {
    const loggedInId = req.user; //taking the id of the user who is logged in
    const toUserId = req.params.toUserId; //taking the id of the user to whom the connection request is being sent
    const allowedStatus = ["ignored", "interested"]; //dynamic allowing status
    if (!allowedStatus.includes(req.params.status)) {
      return res.status(400).json({ message: "Invalid status" }); //checking if the status is valid
    }
    const isRequestAlreadyExists = await Connection.exists({
      $or: [
        { sender: loggedInId, receiver: toUserId }, //checking whether the user has already sent a request to the other user

        { sender: toUserId, receiver: loggedInId }, // checking whether the other user has already sent a request to the user
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
    const loggedInId = req.user._id; //taking the id of the user who is logged in
    const { id, status } = req.params;
    const allowedStatus = ["ignored", "accepted"]; //dynamic allowing status
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" }); //checking if the status is valid
    }
    // Ensure id is an ObjectId
    const requestId = loggedInId.toString();
    const connectionRequestVariable = await Connection.findOne({
      _id: requestId,
      receiver: loggedInId,
      status: "interested",
    });
    console.log("Requested ID:", id);
    console.log("Logged-in ID:", loggedInId);
    console.log("Found Connection:", connectionRequestVariable);
    if (connectionRequestVariable.length === 0) {
      return res.status(400).json({ message: "Invalid request id" });
    }
    connectionRequestVariable.status = status;
    const updateRequestVariable = await connectionRequestVariable.save();
    res.status(200).json({ message: "Request updated successfully" });
    console.Console.log(updateRequestVariable);
  } catch (err) {
    res
      .status(500)
      .json({ err: "Error updating request", details: err.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const loggedInId = req.user._id; // ID of the logged-in user

    const sentRequests = await Connection.find({ sender: loggedInId });

    if (!sentRequests.length) {
      return res.status(404).json({ message: "No sent requests found" });
    }

    res.status(200).json({ sentRequests });
  } catch (err) {
    console.error("Error fetching sent requests:", err.message);
    res
      .status(500)
      .json({ error: "Error fetching requests", details: err.message });
  }
};

module.exports = { sendRequest, updateRequest, getAllRequests };
