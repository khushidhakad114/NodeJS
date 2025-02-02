const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://khushidhakad2003:cjbJhez8qC1u9NKc@cluster0.rk8el.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
  } catch (error) {
    console.log(error.message);
  }
};

connectDB()
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err.message));

module.exports = connectDB;
