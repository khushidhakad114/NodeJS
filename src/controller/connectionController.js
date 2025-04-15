const mongoose = require('mongoose');
const User = require("../model/user");
const connection=require("../model/connection")
const name=["firstName","lastName","-_id"];


exports.connectionRequest=async(req,res)=>{
    try{
        const loggedInId=req.user; //taking the id of the user who is logged in which is coming from userMiddleware
        const toUserId=req.params.toUserId; //taking the id of the user to whom the connection request is being sent
        console.log(toUserId)
       // const getLoggedUserId=await User.find({_id:req.user.id}); //checking if the user exists in the database
       //  console.log("logIn user:", loggedInId);

        const allowedStatus=["ignored","interested"];//dynamic allowing status 
        if(!allowedStatus.includes(req.params.status)){
            return res.status(400).json({message:"Invalid status"}); //checking if the status is valid
        }

        const isValidUser=await User.find({_id:toUserId}); //checking if the user to whom the connection request is being
        if(!isValidUser){
            return res.status(400).json({message:"Invalid user"}); //checking if the user is valid
        }

        const isRequestAlreadyExists=await connection.exists({
            $or:[
                {sender: loggedInId, 
                 receiver: toUserId}, //checking whether the user has already sent a request to the other user

                {sender: toUserId,
                receiver: loggedInId},// checking whether the other user has already sent a request to the user
            ],
        });
        if (isRequestAlreadyExists) { //if the request already exists
            return res.status(400).json({ message: "Connection request already exists" });
        }

        //if connection is not exist already then creating the new connection
        const createConnection=new connection({
            sender:loggedInId,
            receiver:toUserId,
            status:req.params.status
        })
        await createConnection.save();
        res.status(200).json({message:"Connection request sent successfully"});
    }catch(err){
        res.status(500).json({err:"Error sending request",details:err.message});
    }
}
exports.updateRequest = async (req, res) => {
    try {
        const loggedInId = req.user._id;
        const { id, status } = req.params;

        console.log("Requested Update for ID:", id);
        console.log("Logged-in User ID:", loggedInId);

        const allowedStatus = ["ignored", "accepted"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Ensure the request ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log("Invalid request ID format:", id);
            return res.status(400).json({ message: "Invalid request ID format" });
        }

        // Find the request by ID and ensure the user is either sender or receiver
        const connectionRequestVariable = await connection.findOne({
            _id: id,
            $or: [
                { receiver: new mongoose.Types.ObjectId(loggedInId) },
                { sender: new mongoose.Types.ObjectId(loggedInId) }
            ]
        });

        console.log("Found Connection:", connectionRequestVariable);

        if (!connectionRequestVariable) {
            return res.status(404).json({ message: "Request not found or not authorized" });
        }

        // Update the status
        connectionRequestVariable.status = status;
        await connectionRequestVariable.save();

        res.status(200).json({
            message: "Request updated successfully",
            updatedRequest: connectionRequestVariable,
        });
    } catch (err) {
        console.error("Error updating request:", err);
        res.status(500).json({ error: "Error updating request", details: err.message });
    }
};

exports.getAllReceivingRequest = async (req, res) => {
  try {
    const { id } = req.user;

    console.log("User ID from Middleware:", id);

    const receiveRequest = await connection.find({
      receiver: id,
      status: "interested"
    })
      .populate("sender", "firstName lastName")
      .select("_id sender"); // ✅ Fixed here

    res.status(200).json({ receiveRequest });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Error fetching user", details: err.message });
  }
};


  exports.getAllSenderRequest = async (req, res) => {
    try {
      const { id } = req.user;
      console.log("User ID from Middleware:", id);
  
      const senderRequest= await connection.find({ sender:id, status:"interested" });

      res.status(200).json({ senderRequest });
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ error: "Error fetching user", details: err.message });
    }
  };


  exports.getAllFriends = async (req, res) => {
    try {
      const loggedInId = req.user._id;
  
      const friends = await connection.find({
        $or: [
          {
            sender: loggedInId,
          },
          {
            receiver: loggedInId,
          },
        ],
        status: "accepted",
      })
        .populate("sender", "firstName lastName about")
        .populate("receiver", "firstName lastName about");
  
      const data = friends.map((friend) => {
        if (friend.sender._id.toString() === loggedInId.toString()) {
          return friend.receiver;
        } else {
          return friend.sender;
        }
      });
      res.status(201).json({ data });
    } catch (err) {
      res
        .status(500)
        .json({ err: "Error getting all friends", details: err.message });
    }
  };


  exports.getFriendProfile= async (req, res) => {
    try {
     
      const { id } = req.params;
    //   console.log("ID",id);
      const user = await User.findById(id).select("-password");
  
      if (!user) {
        return res.status(404).json({ error: "NO such friend found" });
      }
  
      res.status(200).json({ user });
    } catch (err) {
      res.status(500).json({ error: "Error fetching in friend", details: err.message });
    }
  };

  
exports.blockUser = async (req, res) => {
  try {
      const loggedInId = req.user._id;
      const blockUserId = req.params.id;
      const status = req.params.status; // Extract status from params

      const allowedStatus = ["block", "unblock"];
      if (!allowedStatus.includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
      }

      // Check if a connection exists between the users
      let blockUser = await connection.findOne({
          $or: [
              { sender: loggedInId, receiver: blockUserId },
              { sender: blockUserId, receiver: loggedInId },
          ],
      });

      if (blockUser) {
          // If connection exists, update its status
          blockUser.status = status;
          await blockUser.save();
      } else {
          // If no connection exists, create a new entry for blocking
          blockUser = await connection.create({
              sender: loggedInId,
              receiver: blockUserId,
              status: "block",
          });
      }

      console.log("User blocked successfully:", blockUser);
      res.status(200).json({ message: "User blocked successfully", data: blockUser });


  } catch (err) {
      res.status(500).json({ error: "Error updating user status", details: err.message });
  }
};

