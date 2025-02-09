const userSchema = require("../models/User");
exports.postUser = async (req, res) => {
  try {
    const user = await userSchema.create(req.body);

    res.status(201).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "internal server error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await userSchema.find({ age: { $gt: 18 } });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
    console.log(error.message);
  }
};

exports.getPerticularUserData = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("id not found in params");
    }

    const user = await userSchema.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
};
