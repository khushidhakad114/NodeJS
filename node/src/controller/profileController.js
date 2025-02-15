const User = require("../model/user");

// user-profile read logic
exports.userProfile=async(req,res)=>{
    try{
        const {id}=req.user;
        const user = await User.find({email:req.user.email}).select("-password");
        res.status(200).json({ user });
    }catch(err){
        res
      .status(500)
      .json({ error: "Error fetching user", details: err.message });
    }
  };

  // user profile update logic
  exports.updateProfile=async(req,res)=>{
    try{
        // const {id}=req.params;
        const {eml}=req.user.email;
        const option={new:true};
        
        const {firstName,lastName,email,phone, age,gender,password,skills}=req.body;
        const user=await User.findOneAndUpdate(eml,req.body,{
            returnDocument:"after"
        })
        if(!user){
            throw new Error("User not found");
        }
        user.save()
        res.status(200).json({message:"User profile updated successfully",user})
    }catch(err){
        console.error(err);
        res.status(500).json({error:"internal server error"});
    }
  }