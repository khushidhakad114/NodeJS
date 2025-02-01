const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    mongoose.connect(
      "mongodb+srv://khushidhakad2003:cjbJhez8qC1u9NKc@cluster0.rk8el.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
  } catch (error) {
    console.log(error.message);
  }
};
connectDB()
  .then(() => console.log("monogdb connected"))
  .catch(() => console.log("error connecting to database"));
module.exports = connectDB;
