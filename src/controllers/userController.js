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
    const { id } = req.user;
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "age",
      "gender",
      "skills",
    ];

    const updateData = Object.keys(req.body)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    console.log("Updating user with:", updateData);

    const user = await User.findOneAndUpdate({ _id: id }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User profile updated successfully", user });
  } catch (err) {
    console.error("Error updating profile:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

module.exports = { myProfile, updateProfile };
