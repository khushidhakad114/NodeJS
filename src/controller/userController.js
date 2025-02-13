const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signUser = async (req, res) => {
  try {
    const { firstName,lastName, email, password } = req.body;
    if (!firstName || !lastName||!email || !password) {
      throw new Error("All fields are require");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email is already in use! Please login" );
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName,lastName, email, password: passwordHash });
    await newUser.save();
    res.status(201).json({ message: "user created successfully", newUser });
  } catch (err) {
    res
      .status(500)
      .json({ error: "error creating user", details: err.message });
  }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
        throw new Error("Email and password both are required.")
    }
    try {
      const user = await User.findOne({ email });
      if (!user) {
       throw new Error("Invalid email or password.");
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid credentials! Please enter correct email and password" );
      }
  
    const token = jwt.sign({ id: user.email }, "secret", { expiresIn: "1h" });
    res.cookie("token", token);

      res.status(200).json({message: "Login successful"});
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error in logging", details: err.message });
    }
  };

  exports.userProfile=async(req,res)=>{
    try{
        const { id } = req.params;
        const user = await User.findById(id).select("-password");
        res.status(200).json({ user });
    }catch(err){
        res
      .status(500)
      .json({ error: "Error fetching user", details: err.message });
    }
  };

  exports.updateProfile=async(req,res)=>{
    try{
        const {id}=req.params;
        const option={new:true};
        
        const {firstName,lastName,email,phone, age,gender,password,skills}=req.body;
        const user=await User.findByIdAndUpdate(id,req.body,{
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
 
