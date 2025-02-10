const User = require("../models/User");
const bcrypt = require("bcrypt");
const safeData = "firstName lastName email";
const createUser = async (req, res) => {
  try {
    const { firstName, email, password } = req.body;
    if (!firstName || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email is already in use. Please Login" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, email, password: passwordHash });
    await newUser.save();
    res.status(201).json({ message: "user created successfully", newUser });
  } catch (err) {
    res
      .status(500)
      .json({ error: "error creating user", details: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: " Please SignUp" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    res.status(200).json({
      message: "Login successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error logging in", details: err.message });
  }
};

const myProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    res.status(200).json({ user });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching user", details: err.message });
  }
};

module.exports = { createUser, loginUser, myProfile };
