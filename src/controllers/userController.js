const User = require("../models/User");

// user-profile read logic
const myProfile = async (req, res) => {
  try {
    const { id } = req.user; // ye waali
    console.log("User ID from Middleware:", id);

    const user = await User.findOne({ _id: id }).select("-password");
    console.log(user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res
      .status(500)
      .json({ error: "Error fetching user", details: err.message });
  }
};

// user profile update logic
const updateProfile = async (req, res) => {
  try {
    // const {id}=req.params;
    const { id } = req.user;
    const option = { new: true };

    const { firstName, lastName, email, phone, age, gender, password, skills } =
      req.body;
    const user = await User.findOneAndUpdate({ _id: id }, req.body, {
      returnDocument: "after",
    });
    if (!user) {
      throw new Error("User not found");
    }
    user.save();
    res
      .status(200)
      .json({ message: "User profile updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal server error" });
  }
};

module.exports = { myProfile, updateProfile };
