const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const userRouter = require("./routes/userRoutes");
const cors = require("cors");

app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    httpOnly: true, // This will prevent JavaScript on web pages from accessing the session cookie
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRouter);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
