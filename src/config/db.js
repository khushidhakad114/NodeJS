const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    mongoose.connect(
      "mongodb+srv://22cs10kh128:go7EaDH7ekJnWnZJ@cluster0.7t7tf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
  } catch (error) {
    console.log(error.message);
  }
};
connectDB()
  .then(() => console.log("databse connected"))
  .catch(() => console.log("error connecting to database"));
module.exports = connectDB;
