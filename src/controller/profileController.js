const User = require("../model/user");
const bcrypt = require("bcrypt");

// Only these fields can ever be written by a profile update request.
// Anything else in req.body is ignored — this closes the mass-assignment hole.
const UPDATABLE_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "age",
  "gender",
  "skills",
  "about",
  "profileImage",
];

// user-profile read logic
exports.userProfile = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await User.findOne({ _id: id }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Error fetching user", details: err.message });
  }
};

// user profile update logic
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { age, gender, password, email } = req.body;

    // ---- Build a whitelisted update object ----
    const updates = {};

    for (const field of UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // ---- Validate optional fields before touching the DB ----
    if (age !== undefined && (age < 18 || age > 100)) {
      return res.status(400).json({ error: "Age must be between 18 and 100." });
    }

    if (
      gender !== undefined &&
      !["male", "female", "other"].includes(gender)
    ) {
      return res.status(400).json({ error: "Invalid gender value." });
    }

    // ---- Email changes require a uniqueness check ----
    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existing) {
        return res.status(409).json({
          error: "Email is already in use by another account.",
          code: "EMAIL_EXISTS",
        });
      }

      updates.email = normalizedEmail;
    }

    // ---- Password changes must be hashed, never stored raw ----
    if (password !== undefined) {
      if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters.",
        });
      }

      updates.password = await bcrypt.hash(password, 10);
    }

    // ---- Apply the update and never return the password ----
    const user = await User.findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("Update profile error:", err);

    if (err.code === 11000) {
      return res.status(409).json({ error: "Email is already in use." });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};