const User = require("../models/User");

const myProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.find({ email: req.user.email }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching user", details: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    console.log(req);
    const { firstName, lastName, email, phone, age, gender, password, skills } =
      req.body;
    const option = { new: true };
    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      req.body,
      option
    ).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    user.save();
    res
      .status(200)
      .json({ message: "User profile updated successfully", user });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error updating user", details: err.message });
  }
};

module.exports = { myProfile, updateProfile };
