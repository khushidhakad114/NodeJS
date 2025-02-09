const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  age: {
    type: Number,

    default: 0,
  },
});

module.exports = mongoose.model("User", userSchema);

// template ya blue print ki database m data ya user kese save honge / dikhnge
