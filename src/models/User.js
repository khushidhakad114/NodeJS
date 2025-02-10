const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  lastName: {
    type: String,
    //required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    //required: true,
  },
  age: {
    type: Number,
    min: 18,
    // required: true
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  password: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
