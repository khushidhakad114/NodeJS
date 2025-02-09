const express = require("express");
const connectDB = require("./config/db");
const morgan = require("morgan");
const userRouter = require("./routes/usersRoutes");

const app = express();

//to read objects
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // jaanne k hisaa se
app.use(morgan("dev"));

app.use("/api", userRouter); // User routes

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
