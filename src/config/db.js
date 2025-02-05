const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://khushidhakad2003:Gi5iUs1p57nzIoe1@cluster0.84vwi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
  } catch (error) {
    console.log(error.message);
  }
};

connectDB()
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err.message));

module.exports = connectDB;
