const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connection = require("../model/connection");
const safeData = ["firstName", "lastName", "age", "about", "skills", "profileImage"];
// signUp logic
exports.signUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email is already in use. Please login.",
        code: "EMAIL_EXISTS",
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters.",
        code: "INVALID_PASSWORD",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: passwordHash,
    });

    await newUser.save();

    // Don't send password back
    const userResponse = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
    };

    return res.status(201).json({
      message: "Account created successfully!",
      user: userResponse,
    });
  } catch (err) {
    console.error("Signup error:", err);

    return res.status(500).json({
      error: "Something went wrong while creating your account.",
    });
  }
};

// Login logic
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required.",
    });
  }

  try {
    // 2. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Find user including password
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    // 4. User does not exist
    if (!user) {
      return res.status(404).json({
        error: "Account not found. Please sign up first.",
        code: "USER_NOT_FOUND",
      });
    }

    // 5. Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Incorrect password. Please try again.",
        code: "INVALID_PASSWORD",
      });
    }

    // 6. Check JWT secret
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    // 7. Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 8. Store token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // 9. Remove password before sending user
    user.password = undefined;

    // 10. Success response
    return res.status(200).json({
      message: "Login successful",
      user,
    });

  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      error: "Something went wrong while logging in. Please try again.",
    });
  }
};

// Get currently logged-in user
exports.getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    console.error("Get current user error:", err);

    return res.status(500).json({
      error: "Failed to fetch current user",
    });
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
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
    });

    return res.status(200).json({
      message: "Successfully logged out",
    });
  } catch (err) {
    console.error("Logout error:", err);

    return res.status(500).json({
      error: "Logout failed",
    });
  }
};
