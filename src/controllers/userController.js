const User = require("../models/User");

const createUser = async (req, res) => {
  try {
    const { name, email, age } = req.body;
    console.log(name, email, age);

    const newUser = new User({ name, email, age });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating user" });
  }
};

const getUser = async (req, res) => {
  try {
    const users = await User.find({ name: "kh" });
    if (users.length == 0) {
      throw new Error("User not found");
    }
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getParticularUser = async (req, res) => {
  try {
    const { id } = req.params;
    // const options = { new: true };
    // const user = await User.findByIdAndUpdate(
    //   id,
    //   { name: "jason bourne" },
    //   options
    // );
    const userDelete = await User.findByIdAndDelete(id);
    res.status(200).json({ userDelete });
  } catch (err) {
    res.status(500).json({ error: "Error" });
  }
};

module.exports = { createUser, getUser, getParticularUser };
