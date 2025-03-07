const mongoose=require("mongoose");
const {schema}=require("mongoose");
const { applyTimestamps } = require("./user");

const connectionDb=new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true
    },
    status:{
        type:String,
        enum:["pending","accepted","interested","ignored","block","unblocked"],
        default:"pending"
    }
},
{
    timestamps:true,
})

const connection=mongoose.model("connection",connectionDb);
module.exports=connection;