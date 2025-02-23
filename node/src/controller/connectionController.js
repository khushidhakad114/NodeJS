const { connection, get } = require("mongoose");
const User = require("../model/user");


exports.connectionRequest=async(req,res)=>{
    try{
        const loggedInId=req.user;//taking the id of the user who is logged in
        const toUserId=req.params.toUserId;//taking the id of the user to whom the connection request is being sent
        const getLoggedUserId=await User.find({id:req.user.id}); //checking if the user exists in the database
        console.log(getLoggedUserId);

        const allowedStatus=["igonered","interested"];//dynamic allowing status 
        if(!allowedStatus.includes(req.params.status)){
            return res.status(400).json({message:"Invalid status"}); //checking if the status is valid
        }

        const isRequestAlreadyExists=await connection.findOne({
            $or:[
                {sender: getLoggedUserId, 
                 receiver: toUserId}, //checking whether the user has already sent a request to the other user

                {sender: toUserId,
                receiver: getLoggedUserId},// checking whether the other user has already sent a request to the user
            ],
        });
        if (isRequestAlreadyExists) { //if the request already exists
            return res.status(400).json({ message: "Connection request already exists" });
        }

        //if connection is not exist already then creating the new connection
        const createConnection=new connection({
            sender:getLoggedUserId,
            receiver:toUserId,
            status:req.params.status
        })
        await createConnection.save();
        res.status(200).json({message:"Connection request sent successfully"});
    }catch(err){
        res.status(500).json({err:"Error sending request",details:err.message});
    }
}