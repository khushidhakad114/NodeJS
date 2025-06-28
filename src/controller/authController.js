const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connection = require("../model/connection");
const safeData = ["firstName", "lastName", "email", "age"];

// signUp logic
exports.signUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      throw new Error("All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email is already in use! Please login");
    }

    if(password.length<6){
      return res.status(400).json({message:"password must be at least 6 characters"})
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully", newUser });
  } catch (err) {
    res.status(500).json({ error: "Error creating user", details: err.message });
  }
};

// login logic
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email }).select("-password"); // exclude password from response
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const fullUser = await User.findOne({ email }); // includes password for bcrypt comparison
    const isPasswordValid = await bcrypt.compare(password, fullUser.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Invalid credentials! Please check email and password." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Error in logging in", details: err.message });
  }
};

// feed logic
exports.feed = async (req, res) => {
  try {
    const loggedInId = req.user.id;

    const excludeUsers = new Set([loggedInId]);

    const usersInConnection = await connection
      .find({
        $or: [{ sender: loggedInId }, { receiver: loggedInId }],
      })
      .select("sender receiver")
      .populate("sender", "firstName")
      .populate("receiver", "firstName");

    usersInConnection.forEach((con) => {
      excludeUsers.add(con.sender._id.toString());
      excludeUsers.add(con.receiver._id.toString());
    });

    const feedUsers = await User.find({
      _id: { $nin: [...excludeUsers] },
    }).select(safeData.join(" "));

    res.json({ success: true, feedUsers });
  } catch (err) {
    console.log("Feed error:", err.message);
    res.status(500).json({ error: "Error in fetching feed", details: err.message });
  }
};

// logout logic
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Successfully logged out" });
  } catch (err) {
    console.error("Logout error:", err.message);
  }
};
