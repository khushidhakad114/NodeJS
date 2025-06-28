const mongoose=require("mongoose");

const messageModel=mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, 
     },
    content:{
        type:String,
        trim:true
    },
    chat:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    seenBy:[{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" }],

},
{
    timestamps: true,
}
);

const Message=mongoose.model("Message", messageModel);
module.exports=Message;