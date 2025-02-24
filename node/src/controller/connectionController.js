const mongoose = require('mongoose');
const User = require("../model/user");
const connection=require("../model/connection")


exports.connectionRequest=async(req,res)=>{
    try{
        const loggedInId=req.user; //taking the id of the user who is logged in which is coming from userMiddleware
        const toUserId=req.params.toUserId; //taking the id of the user to whom the connection request is being sent

       // const getLoggedUserId=await User.find({_id:req.user.id}); //checking if the user exists in the database
       //  console.log("logIn user:", loggedInId);

        const allowedStatus=["igonered","interested"];//dynamic allowing status 
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

exports.updateRequest=async(req,res)=>{
    try{
        const loggedInId=req.user; 
        
        const allowedStatus=["accepted","ignored"];
        if(!allowedStatus.includes(req.params.status)){
            return res.status(400).json({message:"Invalid status"});
        }

        // Validating ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid request ID format" });
        }
        
        const connectionReqestValid=await connection.findOne({
            _id:req.params.id,
            receiver:loggedInId.id,
            status:"interested",
        });
        // console.log("Request ID:", req.params.id);
        // console.log("Logged In User ID:", loggedInId.id);
        // console.log("Connection Request Valid:", connectionReqestValid);

        if(!connectionReqestValid){
            return res.status(400).json({message:"Invalid request"});
        }

        connectionReqestValid.status=req.params.status;
        const updateRequestVariable=await connectionReqestValid.save()
        res.status(200).json({message:"Request status updated successfully"});
    }
    catch(error){
        res.status(500).json({error:"Error in updating the request",details:error.message})

    }
}


exports.userConnectionRequest = async (req, res) => {
    try {
      const { id } = req.user;
      console.log("User ID from Middleware:", id);
  
      const user = await User.findById({ _id: id });  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const userConnection= await connection.find({ receiver:id });

      res.status(200).json({ userConnection });
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ error: "Error fetching user", details: err.message });
    }
  };